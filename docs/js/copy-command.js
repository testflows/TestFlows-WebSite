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
 * Copy buttons for command boxes:
 *
 *   <div class="install-cmd">
 *     <code>the command</code>
 *     <button type="button" class="install-copy" data-copy>Copy</button>
 *   </div>
 *
 * A click copies the text of the <code> beside the button, or every <code> in the
 * box, one per line, for a few commands (never the prompt, which is drawn by CSS) and the button says "Copied" for a moment. Works on touch
 * screens, where there is no hover. Falls back to a hidden textarea where the
 * async clipboard API is not available (plain http, old browsers).
 */
(function () {
  "use strict";

  var RESET_MS = 1800;

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);
      if (ok) {
        resolve();
      } else {
        reject(new Error("copy failed"));
      }
    });
  }

  function flash(button, label) {
    var original = button.getAttribute("data-label") || button.textContent;
    button.setAttribute("data-label", original);
    button.textContent = label;
    button.classList.toggle("is-copied", label === "Copied");
    window.clearTimeout(button._copyTimer);
    button._copyTimer = window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove("is-copied");
    }, RESET_MS);
  }

  /* Say "Copied" to screen readers too: the label changes, so the button is a polite live region. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (button) {
    button.setAttribute("aria-live", "polite");
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-copy]");
    if (!button) {
      return;
    }
    var box = button.closest(".install-cmd");
    var lines = box ? box.querySelectorAll("code") : [];
    if (!lines.length) {
      return;
    }
    /* One <code> is one command; several are several lines of one script. */
    var text = Array.prototype.map.call(lines, function (line) {
      return line.textContent.trim();
    }).join("\n");
    copyText(text).then(
      function () {
        flash(button, "Copied");
      },
      function () {
        /* Select it instead, so a manual Ctrl-C still works. */
        var range = document.createRange();
        range.selectNodeContents(box);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        flash(button, "Press Ctrl-C");
      }
    );
  });
})();
