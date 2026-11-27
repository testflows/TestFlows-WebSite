/*
 * Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * The site's terminal player. Each block with data-term-frames plays the
 * frames tools/cast_to_frames.py writes: a <pre> of the screen, play and
 * pause, a scrubber, and a button for each marker that shows its screen.
 * The clock shows the recording's time plus data-term-offset, in seconds,
 * so it can read the program's own times. data-term-poster is the time, on
 * that clock, of the screen shown first.
 */
(function () {
  "use strict";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function fmt(t) {
    return t.toFixed(1) + "s";
  }

  /* Frame times are in milliseconds; a time computed from them, such as a
     poster less the offset, can land a hair off in floating point. */
  var TIME_EPSILON = 0.0005;
  /* The most a played frame advances the clock: a hidden tab gets no
     animation frames, and its whole gap would arrive as one step. */
  var STEP_MAX = 0.1;

  /* The longest row of any frame, in characters: the screen's width. */
  function widestRow(frames) {
    var widest = 0;
    frames.forEach(function (f) {
      f[2].forEach(function (change) {
        widest = Math.max(widest, Array.from(change[1]).length);
      });
    });
    return widest;
  }

  function Player(box, data, offset) {
    this.data = data;
    this.offset = offset;
    this.rows = [];
    this.index = -1;
    this.time = 0;
    this.playing = false;
    this.build(box);
  }

  Player.prototype.build = function (box) {
    var self = this;
    var win = el("div", "term-player-window");
    win.appendChild(el("div", "term-player-title", box.getAttribute("data-term-title") || "terminal"));
    var screen = el("div", "term-player-screen");
    this.pre = el("pre", "term-player-rows");
    // misc.css sizes the font so the widest row fits the window.
    this.pre.style.setProperty("--term-cols", Math.max(1, widestRow(this.data.frames)));
    screen.appendChild(this.pre);
    win.appendChild(screen);

    var bar = el("div", "term-player-bar");
    this.button = el("button", "term-player-play", "Play");
    this.button.type = "button";
    this.button.addEventListener("click", function () {
      self.playing ? self.pause() : self.play();
    });
    this.scrub = el("input", "term-player-scrub");
    this.scrub.type = "range";
    this.scrub.min = 0;
    this.scrub.max = this.data.duration;
    this.scrub.step = 0.001;
    this.scrub.setAttribute("aria-label", "Time in the recording");
    this.scrub.addEventListener("input", function () {
      self.pause();
      self.seek(parseFloat(self.scrub.value));
    });
    var track = el("div", "term-player-track");
    track.appendChild(this.scrub);
    this.data.marks.forEach(function (mark) {
      var tick = el("span", "term-player-tick");
      // misc.css insets the position by the thumb's half-width.
      tick.style.setProperty("--at", mark[0] / self.data.duration);
      track.appendChild(tick);
    });
    this.clock = el("span", "term-player-clock");
    bar.appendChild(this.button);
    bar.appendChild(track);
    bar.appendChild(this.clock);

    var marks = el("div", "term-player-marks");
    this.markButtons = [];
    this.data.marks.forEach(function (mark, i) {
      var b = el("button", "term-player-mark", "Violation " + (i + 1));
      b.type = "button";
      b.title = mark[1] + ", at " + (mark[0] + self.offset).toFixed(3) + " s";
      b.addEventListener("click", function () {
        self.pause();
        self.seek(mark[0]);
      });
      marks.appendChild(b);
      self.markButtons.push(b);
    });

    box.textContent = "";
    box.appendChild(win);
    box.appendChild(bar);
    if (this.data.marks.length) box.appendChild(marks);
  };

  /* The screen at frame i: replay the changed rows of each frame up to it,
     from the start when going back. */
  Player.prototype.render = function (i) {
    var frames = this.data.frames;
    if (i < this.index) {
      this.rows = [];
      this.index = -1;
    }
    for (var k = this.index + 1; k <= i; k++) {
      var f = frames[k];
      this.rows.length = f[1];
      for (var r = 0; r < f[1]; r++) {
        if (this.rows[r] === undefined) this.rows[r] = "";
      }
      f[2].forEach(function (change) {
        this.rows[change[0]] = change[1];
      }, this);
    }
    if (i !== this.index) {
      this.index = i;
      this.pre.textContent = this.rows.join("\n");
      this.showCurrentMark(i);
    }
  };

  /* The violation whose screen is shown, if any, marked on its button. */
  Player.prototype.showCurrentMark = function (i) {
    var self = this;
    this.markButtons.forEach(function (b, n) {
      var on = self.frameAt(self.data.marks[n][0]) === i;
      b.classList.toggle("is-current", on);
      if (on) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  };

  Player.prototype.frameAt = function (t) {
    var frames = this.data.frames, lo = 0, hi = frames.length - 1;
    while (lo < hi) {
      var mid = (lo + hi + 1) >> 1;
      if (frames[mid][0] <= t + TIME_EPSILON) lo = mid; else hi = mid - 1;
    }
    return lo;
  };

  Player.prototype.seek = function (t) {
    this.time = Math.max(0, Math.min(t, this.data.duration));
    this.render(this.frameAt(this.time));
    this.scrub.value = this.time;
    this.clock.textContent =
      fmt(this.time + this.offset) + " / " + fmt(this.data.duration + this.offset);
  };

  Player.prototype.play = function () {
    var self = this;
    if (this.time >= this.data.duration) this.seek(0);
    this.playing = true;
    this.button.textContent = "Pause";
    var last = performance.now();
    function tick(now) {
      if (!self.playing) return;
      self.seek(self.time + Math.min((now - last) / 1000, STEP_MAX));
      last = now;
      if (self.time >= self.data.duration) self.pause();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  Player.prototype.pause = function () {
    this.playing = false;
    this.button.textContent = "Play";
  };

  document.querySelectorAll("[data-term-frames]").forEach(function (box) {
    fetch(box.getAttribute("data-term-frames"))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        var offset = parseFloat(box.getAttribute("data-term-offset") || "0");
        var player = new Player(box, data, offset);
        player.seek(parseFloat(box.getAttribute("data-term-poster") || "0") - offset);
      })
      .catch(function () {
        box.textContent = "The recording could not be loaded.";
      });
  });
})();
