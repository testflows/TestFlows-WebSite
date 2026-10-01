/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL. This file contains trade secrets and
 * confidential information of Katteli Inc. Unauthorized copying, disclosure,
 * distribution, or use of this file, via any medium, is strictly prohibited
 * without express written authorization from Katteli Inc.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/**
 * 404 page ostrich, drawn as 1-bit pixel art (think Chrome's offline dino). It runs
 * in from the left, stops in the middle and buries its head. Left/Right (or A/D)
 * move it; whenever it stops it buries its head again after a short pause.
 *
 * Everything is drawn on a small canvas in whole "cells" that CSS scales up with
 * `image-rendering: pixelated`, so the sprite is crisp at any size. The sand hides
 * the buried head: below the ground line the canvas is simply cleared.
 *
 * prefers-reduced-motion: no entrance run — the ostrich starts in the middle with
 * its head already buried, and the neck snaps instead of stepping.
 */
(function () {
  "use strict";

  var scene = document.getElementById("ostrich-scene");
  var canvas = document.getElementById("ostrich-canvas");
  if (!scene || !canvas || !canvas.getContext) {
    return;
  }
  var ctx = canvas.getContext("2d");

  var SPR_W = 34; /* sprite width in cells */
  var SPR_H = 40; /* sprite height: feet end on the row above the ground line */
  var SAND_ROWS = 7; /* rows of sand under the ground line */
  var SPEED = 80; /* cells per second */
  var ENTRY_SPEED = 70;
  var HIDE_DELAY_MS = 450; /* pause after stopping, before the head goes down */
  var BURY_STEP_MS = 120; /* time per neck step going down */
  var LIFT_STEP_MS = 55; /* ...and coming back up */
  var LEG_FRAME_MS = 90;
  var NECK_UP = 0;
  var NECK_BURIED = 3;

  /* Body outline, rows top to bottom: [y, xFrom, xTo inclusive] */
  var BODY = [
    [18, 8, 18], [19, 5, 21], [20, 4, 23], [21, 3, 24], [22, 3, 24], [23, 3, 24],
    [24, 3, 24], [25, 3, 24], [26, 3, 24], [27, 4, 23], [28, 5, 22], [29, 7, 20],
    [30, 9, 17]
  ];
  var TAIL = [
    [16, 1, 2], [17, 0, 4], [18, 0, 6], [19, 0, 7], [20, 1, 5], [22, 0, 3], [23, 1, 4]
  ];
  /* Head per neck step: [x, y, pointsDown]. Step 3 is under the sand. */
  var HEADS = [
    [25, 5, false],
    [29, 13, false],
    [30, 27, true],
    [31, 45, true]
  ];
  var NECK_BASE = [22, 21];

  var reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cell = 4; /* CSS pixels per cell */
  var cols = 0;
  var rows = 0;
  var ground = 0; /* row of the ground line */
  var top = 0; /* canvas row of the sprite's first row */
  var pebbles = [];

  var keys = { left: false, right: false };
  var x = 0; /* sprite left edge, in cells */
  var dir = 1;
  var entering = !reduce;
  var idleMs = 0;
  var neckStep = reduce ? NECK_BURIED : NECK_UP;
  var neckTarget = neckStep;
  var neckAcc = 0;
  var legFrame = 0;
  var legAcc = 0;
  var last = 0;
  var rafId = 0;

  function layout() {
    var width = scene.clientWidth;
    /* 50 rows tall on desktop and tablet (cell size follows the scene height), 3px cells on phones. */
    cell = width < 520 ? 3 : Math.max(3, Math.floor(scene.clientHeight / 50));
    cols = Math.floor(width / cell);
    rows = Math.floor(scene.clientHeight / cell);
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = cols * cell + "px";
    canvas.style.height = rows * cell + "px";
    ground = rows - SAND_ROWS;
    top = ground - SPR_H;

    /* Fixed pebbles under the ground line (deterministic, so no flicker on resize). */
    pebbles = [];
    var seed = 7;
    function rnd() {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    }
    for (var row = 2; row < SAND_ROWS; row += 2) {
      var px = Math.floor(rnd() * 10);
      while (px < cols) {
        pebbles.push([px, ground + row, 1 + Math.floor(rnd() * 3)]);
        px += 6 + Math.floor(rnd() * 16);
      }
    }
  }

  function centerX() {
    return Math.max(0, Math.floor((cols - SPR_W) / 2));
  }

  function draw() {
    var ink = window.getComputedStyle(canvas).color;
    var ox = Math.round(x);
    ctx.clearRect(0, 0, cols, rows);
    ctx.fillStyle = ink;

    /* Rectangle in sprite space; mirrored when facing left. */
    function rect(sx, sy, w, h) {
      var px = dir > 0 ? ox + sx : ox + SPR_W - (sx + w);
      ctx.fillRect(px, top + sy, w, h);
    }
    function hole(sx, sy) {
      var px = dir > 0 ? ox + sx : ox + SPR_W - (sx + 1);
      ctx.clearRect(px, top + sy, 1, 1);
    }
    function span(list) {
      list.forEach(function (r) {
        rect(r[1], r[0], r[2] - r[1] + 1, 1);
      });
    }

    span(TAIL);
    span(BODY);

    /* Legs: standing, or alternating while running (the lifted leg bends forward). */
    function leg(lx, lifted) {
      if (!lifted) {
        rect(lx, 31, 2, 9);
        rect(lx, 39, 4, 1);
      } else {
        rect(lx, 31, 2, 3);
        rect(lx + 1, 33, 2, 3);
        rect(lx + 1, 35, 4, 1);
      }
    }
    leg(10, legFrame === 1);
    leg(16, legFrame === 0 && (keys.left || keys.right || entering));

    /* Neck: a 3x3 brush stepped along a line from the body to the head. */
    var head = HEADS[neckStep];
    var x0 = NECK_BASE[0];
    var y0 = NECK_BASE[1];
    var x1 = head[0];
    var y1 = head[1] + 1;
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (var i = 0; i <= n; i++) {
      var nx = Math.round(x0 + ((x1 - x0) * i) / n);
      var ny = Math.round(y0 + ((y1 - y0) * i) / n);
      rect(nx - 1, ny - 1, 3, 3);
    }

    /* Head and beak. */
    if (head[2]) {
      rect(head[0] - 2, head[1] - 3, 5, 5);
      rect(head[0] - 1, head[1] + 2, 3, 4);
      hole(head[0] + 1, head[1] - 1);
    } else {
      rect(head[0] - 3, head[1] - 1, 6, 4);
      rect(head[0] + 3, head[1], 4, 2);
      hole(head[0], head[1]);
    }

    /* Dirt mound over the buried head. */
    if (neckStep === NECK_BURIED) {
      rect(28, SPR_H - 1, 7, 1);
      rect(29, SPR_H - 2, 5, 1);
      rect(30, SPR_H - 3, 3, 1);
    }

    /* The sand: clear everything below the ground line (hides the buried head),
       then draw the ground and its pebbles. */
    ctx.clearRect(0, ground, cols, rows - ground);
    ctx.fillStyle = ink;
    ctx.fillRect(0, ground, cols, 1);
    ctx.globalAlpha = 0.5;
    pebbles.forEach(function (p) {
      ctx.fillRect(p[0], p[1], p[2], 1);
    });
    ctx.globalAlpha = 1;
  }

  function direction() {
    return (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  }

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    var d = direction();
    if (d !== 0) {
      entering = false;
    }

    var moving = false;
    if (entering) {
      dir = 1;
      x += ENTRY_SPEED * dt;
      moving = true;
      if (x >= centerX()) {
        x = centerX();
        entering = false;
        moving = false;
      }
    } else if (d !== 0) {
      dir = d;
      x = Math.min(cols - SPR_W, Math.max(0, x + d * SPEED * dt));
      moving = true;
    }

    if (moving) {
      idleMs = 0;
      neckTarget = NECK_UP;
    } else {
      idleMs += dt * 1000;
      if (idleMs >= HIDE_DELAY_MS) {
        neckTarget = NECK_BURIED;
      }
    }

    if (moving) {
      legAcc += dt * 1000;
      if (legAcc >= LEG_FRAME_MS) {
        legAcc -= LEG_FRAME_MS;
        legFrame = 1 - legFrame;
      }
    } else {
      legAcc = 0;
      legFrame = 0;
    }

    if (reduce) {
      neckStep = neckTarget;
    } else if (neckStep !== neckTarget) {
      neckAcc += dt * 1000;
      var interval = neckTarget < neckStep ? LIFT_STEP_MS : BURY_STEP_MS;
      while (neckAcc >= interval && neckStep !== neckTarget) {
        neckStep += neckTarget > neckStep ? 1 : -1;
        neckAcc -= interval;
      }
    } else {
      neckAcc = 0;
    }

    draw();

    if (!moving && !entering && neckStep === NECK_BURIED) {
      rafId = 0;
      last = 0;
      return;
    }
    rafId = window.requestAnimationFrame(frame);
  }

  function kick() {
    if (!rafId) {
      last = 0;
      rafId = window.requestAnimationFrame(frame);
    }
  }

  function setKey(name, value) {
    if (keys[name] !== value) {
      keys[name] = value;
      if (value) {
        idleMs = 0;
      }
      kick();
    }
  }

  var KEY_MAP = {
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right"
  };

  document.addEventListener("keydown", function (event) {
    var name = KEY_MAP[event.key];
    if (!name || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setKey(name, true);
  });

  document.addEventListener("keyup", function (event) {
    var name = KEY_MAP[event.key];
    if (name) {
      setKey(name, false);
    }
  });

  window.addEventListener("blur", function () {
    setKey("left", false);
    setKey("right", false);
  });

  window.addEventListener("resize", function () {
    var oldCols = cols;
    layout();
    if (oldCols) {
      x = Math.min(x, Math.max(0, cols - SPR_W));
    }
    draw();
    kick();
  });

  layout();
  x = reduce ? centerX() : -SPR_W;
  draw();
  kick();
})();
