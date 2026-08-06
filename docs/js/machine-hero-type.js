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
 * Machine landing hero: typewrite console log over the hero image when it
 * scrolls into view (same IntersectionObserver pattern as index demos).
 * Boot log ships in the terminal element's `data-boot-log` (base64 UTF-8)
 * so it stays in the HTML without a fetch, and Markdown cannot mangle it.
 */
(function () {
  "use strict";

  var START_DELAY_MS = 480;
  var CHAR_MS_MIN = 3;
  var CHAR_MS_MAX = 10;
  var NEWLINE_MS = 36;

  var skipAnimate =
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    /(?:\?|&)animate=0(?:&|$)/.test(window.location.search) ||
    (function () {
      try {
        return window.localStorage.getItem("tf-animate") === "0";
      } catch (e) {
        return false;
      }
    })();

  /**
   * @param {HTMLElement} body
   */
  function scrollTerm(body) {
    body.scrollTop = body.scrollHeight;
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
   * @param {string} b64
   * @returns {string}
   */
  function decodeBootLog(b64) {
    var bin = window.atob(b64);
    if (typeof TextDecoder === "function") {
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new TextDecoder("utf-8").decode(bytes);
    }
    /* Fallback for very old browsers */
    try {
      return decodeURIComponent(escape(bin));
    } catch (e) {
      return bin;
    }
  }

  /**
   * @param {HTMLElement} root
   * @returns {string}
   */
  function loadLog(root) {
    var b64 = root.getAttribute("data-boot-log");
    if (!b64) {
      return "";
    }
    try {
      return decodeBootLog(b64).replace(/\r\n/g, "\n").replace(/\s+$/, "") + "\n";
    } catch (e) {
      return "";
    }
  }

  /**
   * @param {HTMLElement} pre
   * @param {HTMLElement} body
   * @param {string} text
   */
  function showInstant(pre, body, text) {
    pre.textContent = text;
    scrollTerm(body);
  }

  /**
   * @param {HTMLElement} pre
   * @param {HTMLElement} body
   * @param {HTMLElement} caret
   * @param {string} text
   */
  function typewrite(pre, body, caret, text) {
    var i = 0;
    var textNode = document.createTextNode("");
    pre.textContent = "";
    pre.appendChild(textNode);
    pre.appendChild(caret);

    function tick() {
      if (i >= text.length) {
        return;
      }
      i += 1;
      textNode.nodeValue = text.slice(0, i);
      scrollTerm(body);

      var ch = text.charAt(i - 1);
      var delay =
        ch === "\n"
          ? NEWLINE_MS
          : CHAR_MS_MIN + Math.random() * (CHAR_MS_MAX - CHAR_MS_MIN);
      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, START_DELAY_MS);
  }

  /**
   * @param {HTMLElement} root
   * @param {string} text
   */
  function run(root, text) {
    if (root.dataset.codeTyped === "1") {
      return;
    }
    root.dataset.codeTyped = "1";

    var body = root.querySelector(".machine-hero-term-body");
    var pre = root.querySelector(".machine-hero-term-pre");
    if (!body || !pre || !text) {
      return;
    }

    if (skipAnimate) {
      showInstant(pre, body, text);
      return;
    }

    var caret = document.createElement("span");
    caret.className = "index-code-caret";
    caret.setAttribute("aria-hidden", "true");
    typewrite(pre, body, caret, text);
  }

  /**
   * @param {HTMLElement} root
   * @param {string} text
   */
  function watch(root, text) {
    function start() {
      run(root, text);
    }

    if (skipAnimate) {
      start();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            start();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    /* Start immediately if already on screen — IO can miss the first paint. */
    if (isRoughlyInView(root)) {
      start();
    } else {
      io.observe(root);
    }
  }

  function boot() {
    var root = document.getElementById("machine-hero-term");
    if (!root) {
      return;
    }

    var text = loadLog(root);
    if (!text) {
      return;
    }
    watch(root, text);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
