/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared portal status UI — text messages + CLI-style braille spinner. */

/**
 * @param {HTMLElement|null} el
 * @param {string} message
 * @param {"ok"|"err"|"info"|""} [kind]
 */
export function setStatus(el, message, kind) {
  if (!el) return;
  el.classList.remove(
    "portal-status--ok",
    "portal-status--err",
    "portal-status--info",
    "portal-status--busy"
  );
  if (!message) {
    el.textContent = "";
    el.hidden = true;
    return;
  }
  el.textContent = message;
  el.hidden = false;
  if (kind) {
    el.classList.add(`portal-status--${kind}`);
  }
}

/**
 * Show a braille spinner (CLI frames) with an optional short label.
 * @param {HTMLElement|null} el
 * @param {string} [label] e.g. "Sending a code"
 */
export function showSpinner(el, label) {
  if (!el) return;
  el.classList.remove("portal-status--ok", "portal-status--err");
  el.classList.add("portal-status--info", "portal-status--busy");
  el.hidden = false;
  el.replaceChildren();
  const spin = document.createElement("span");
  spin.className = "portal-spinner";
  spin.setAttribute("aria-hidden", "true");
  el.appendChild(spin);
  if (label) {
    const text = document.createElement("span");
    text.className = "portal-spinner-label";
    text.textContent = label;
    el.appendChild(text);
  }
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-label", label || "Working");
}
