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
 * Homepage demos: type test.py on scroll, then reveal the paired terminal
 * line-by-line (idle state is a green $).
 *
 * Per-panel opt-in: add class `index-code-animate` on the `.index-start-step`
 * (or panel) that wraps the test.py figure. Without it, the block stays static.
 *
 * Global opt-out (wins over per-panel): ?animate=0 or localStorage tf-animate=0
 * (GNOME “reduce animation” maps to prefers-reduced-motion in Chromium, so we
 * do not honor that media query here — demos would never play.)
 */
(function () {
  "use strict";

  var LINE_REVEAL_MS = 85;
  var AFTER_CODE_PAUSE_MS = 220;
  var CMD_HOLD_MS = 160;

  var skipAnimate =
    /(?:\?|&)animate=0(?:&|$)/.test(window.location.search) ||
    (function () {
      try {
        return window.localStorage.getItem("tf-animate") === "0";
      } catch (e) {
        return false;
      }
    })();

  /**
   * Panels marked with `.index-code-animate` that contain a test.py figure.
   * @returns {HTMLElement[]}
   */
  function findTestPyFigures() {
    return Array.prototype.slice
      .call(document.querySelectorAll(".index-code-animate"))
      .map(function (step) {
        return step.querySelector("figure.highlight");
      })
      .filter(Boolean);
  }

  /**
   * Paired terminal for a test.py figure: steps result box, or Run shell figure.
   * @param {HTMLElement} fig
   * @returns {HTMLElement|null}
   */
  function terminalForFigure(fig) {
    var cascade = fig.closest(".index-steps-cascade");
    if (cascade) {
      return /** @type {HTMLElement|null} */ (
        cascade.querySelector(".index-steps-result")
      );
    }

    var step = fig.closest(".index-start-step");
    var row = step && step.closest(".index-start-steps");
    if (!row) {
      return null;
    }

    var terminals = Array.prototype.slice
      .call(row.querySelectorAll(".index-start-step"))
      .filter(function (s) {
        var file = s.querySelector(".index-start-step-file");
        return file && /terminal/i.test(file.textContent || "");
      })
      .map(function (s) {
        return s.querySelector("figure.highlight");
      })
      .filter(Boolean);

    return terminals[0] || null;
  }

  /**
   * @param {HTMLElement} terminal
   * @returns {HTMLElement[]}
   */
  function terminalLines(terminal) {
    if (terminal.classList.contains("index-steps-result")) {
      return Array.prototype.slice.call(
        terminal.querySelectorAll(".index-steps-line")
      );
    }
    return Array.prototype.slice.call(
      terminal.querySelectorAll(".code .line")
    );
  }

  /**
   * @param {HTMLElement} terminal
   */
  function ensurePrompt(terminal) {
    var existing = null;
    var child = terminal.firstChild;
    while (child) {
      if (
        child.nodeType === 1 &&
        /** @type {HTMLElement} */ (child).classList &&
        /** @type {HTMLElement} */ (child).classList.contains("index-term-prompt")
      ) {
        existing = /** @type {HTMLElement} */ (child);
        break;
      }
      child = child.nextSibling;
    }
    if (existing) {
      return;
    }
    var nested = terminal.querySelector(".index-term-prompt");
    if (nested) {
      nested.parentNode.removeChild(nested);
    }
    var prompt = document.createElement("div");
    prompt.className = "index-term-prompt";
    prompt.setAttribute("aria-hidden", "true");
    prompt.textContent = "$";
    /* Top of the terminal chrome — above highlight table / result pre */
    terminal.insertBefore(prompt, terminal.firstChild);
  }

  /**
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  function isRoughlyInView(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
  }

  /**
   * Idle: green $ only. Output lines out of layout (no scrollbar).
   * @param {HTMLElement|null} terminal
   */
  function armTerminal(terminal) {
    if (!terminal) {
      return;
    }
    terminal.dataset.scripted = "1";
    terminal.classList.remove("is-term-revealing");
    delete terminal.dataset.termRevealed;
    ensurePrompt(terminal);
    terminalLines(terminal).forEach(function (line) {
      line.classList.remove("is-visible");
    });
  }

  /**
   * @param {HTMLElement|null} terminal
   */
  function showTerminalInstant(terminal) {
    if (!terminal) {
      return;
    }
    terminal.dataset.scripted = "1";
    terminal.dataset.termRevealed = "1";
    terminal.classList.add("is-term-revealing");
    ensurePrompt(terminal);
    terminalLines(terminal).forEach(function (line) {
      line.classList.add("is-visible");
    });
  }

  /**
   * @param {HTMLElement|null} terminal
   */
  function revealTerminalLines(terminal) {
    if (!terminal || terminal.dataset.termRevealed === "1") {
      return;
    }
    terminal.dataset.termRevealed = "1";
    terminal.dataset.scripted = "1";
    terminal.classList.add("is-term-revealing");

    var lines = terminalLines(terminal);
    if (!lines.length) {
      return;
    }

    var i = 0;

    function showNext() {
      if (i >= lines.length) {
        terminal.classList.add("is-term-revealed");
        return;
      }
      lines[i].classList.add("is-visible");
      var delay = LINE_REVEAL_MS;
      var text = lines[i].textContent || "";
      if (i === 0 && (lines[i].classList.contains("index-steps-line--cmd") ||
        text.charAt(0) === "$")) {
        delay = CMD_HOLD_MS;
      }
      i += 1;
      window.setTimeout(showNext, delay);
    }

    window.setTimeout(showNext, AFTER_CODE_PAUSE_MS);
  }

  /**
   * @param {HTMLElement} fig
   * @returns {boolean}
   */
  function captureFigure(fig) {
    if (fig._codeType) {
      return true;
    }
    var codeLines = Array.prototype.slice.call(
      fig.querySelectorAll(".code .line")
    );
    var gutterLines = Array.prototype.slice.call(
      fig.querySelectorAll(".gutter .line")
    );
    if (!codeLines.length) {
      return false;
    }
    fig._codeType = {
      codeLines: codeLines,
      gutterLines: gutterLines,
      originals: codeLines.map(function (el) {
        return el.innerHTML;
      }),
      texts: codeLines.map(function (el) {
        return el.textContent || "";
      }),
    };
    return true;
  }

  /**
   * @param {HTMLElement} fig
   */
  function blankFigure(fig) {
    var state = fig._codeType;
    if (!state || fig.dataset.codeTypePrepared === "1") {
      return;
    }
    state.codeLines.forEach(function (el) {
      el.textContent = "";
    });
    state.gutterLines.forEach(function (g) {
      g.style.visibility = "hidden";
    });
    fig.dataset.codeTypePrepared = "1";
    fig.classList.add("index-code-type-ready");
  }

  /**
   * @param {HTMLElement} fig
   */
  function typeFigure(fig) {
    if (fig.dataset.codeTyped === "1") {
      return;
    }
    fig.dataset.codeTyped = "1";

    if (!captureFigure(fig)) {
      return;
    }

    var terminal = terminalForFigure(fig);

    if (skipAnimate) {
      showTerminalInstant(terminal);
      fig.classList.add("is-code-typed");
      return;
    }

    armTerminal(terminal);
    blankFigure(fig);

    var state = fig._codeType;
    var codeLines = state.codeLines;
    var gutterLines = state.gutterLines;
    var originals = state.originals;
    var texts = state.texts;

    fig.classList.add("is-code-typing");

    var caret = document.createElement("span");
    caret.className = "index-code-caret";
    caret.setAttribute("aria-hidden", "true");

    /**
     * @param {HTMLElement} lineEl
     */
    function placeCaret(lineEl) {
      if (caret.parentNode) {
        caret.parentNode.removeChild(caret);
      }
      lineEl.appendChild(caret);
    }

    var lineIdx = 0;
    var charIdx = 0;

    function finish() {
      if (caret.parentNode) {
        caret.parentNode.removeChild(caret);
      }
      fig.classList.remove("is-code-typing");
      fig.classList.add("is-code-typed");
      revealTerminalLines(terminal);
    }

    function tick() {
      if (lineIdx >= codeLines.length) {
        finish();
        return;
      }

      var lineEl = codeLines[lineIdx];
      var text = texts[lineIdx];

      if (gutterLines[lineIdx]) {
        gutterLines[lineIdx].style.visibility = "";
      }

      if (!text.length) {
        lineEl.innerHTML = originals[lineIdx];
        lineIdx += 1;
        charIdx = 0;
        window.setTimeout(tick, 70);
        return;
      }

      if (charIdx < text.length) {
        charIdx += 1;
        lineEl.textContent = text.slice(0, charIdx);
        placeCaret(lineEl);
        var ch = text.charAt(charIdx - 1);
        var delay = 14 + Math.random() * 16;
        if (/[(){}\[\]:,.]/.test(ch)) {
          delay += 28;
        }
        if (ch === " ") {
          delay += 8;
        }
        window.setTimeout(tick, delay);
        return;
      }

      lineEl.innerHTML = originals[lineIdx];
      lineIdx += 1;
      charIdx = 0;
      if (lineIdx < codeLines.length) {
        placeCaret(codeLines[lineIdx]);
      }
      window.setTimeout(tick, 100);
    }

    placeCaret(codeLines[0]);
    window.setTimeout(tick, 180);
  }

  function boot() {
    var figures = findTestPyFigures();
    if (!figures.length) {
      return;
    }

    figures.forEach(captureFigure);

    var terminals = figures
      .map(terminalForFigure)
      .filter(Boolean);

    if (skipAnimate) {
      figures.forEach(function (fig) {
        showTerminalInstant(terminalForFigure(fig));
        fig.classList.add("is-code-typed");
      });
      return;
    }

    terminals.forEach(armTerminal);

    function start(fig) {
      typeFigure(fig);
    }

    if (!("IntersectionObserver" in window)) {
      figures.forEach(start);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start(/** @type {HTMLElement} */ (entry.target));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    figures.forEach(function (fig) {
      /* Start immediately if already on screen — IO can miss the first paint in some browsers. */
      if (isRoughlyInView(fig)) {
        start(fig);
      } else {
        io.observe(fig);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
