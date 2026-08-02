/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared portal status UI — text messages; account Refresh button is the busy indicator. */

/**
 * @returns {HTMLButtonElement|null}
 */
function refreshButton() {
  const el = document.getElementById("portal-account-refresh");
  return el instanceof HTMLButtonElement ? el : null;
}

/**
 * Drive the account Refresh control as the busy indicator (spin / green).
 * @param {boolean} busy
 */
export function setRefreshBusy(busy) {
  const btn = refreshButton();
  if (!btn) return;
  btn.classList.toggle("is-busy", busy);
  btn.disabled = busy;
  btn.setAttribute("aria-busy", busy ? "true" : "false");
}

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
  setRefreshBusy(false);
  if (!message) {
    el.replaceChildren();
    el.textContent = "";
    el.hidden = true;
    return;
  }
  el.replaceChildren();
  el.textContent = message;
  el.hidden = false;
  if (kind) {
    el.classList.add(`portal-status--${kind}`);
  }
}

/**
 * Busy status label + Refresh indicator (no status icon).
 * @param {HTMLElement|null} el
 * @param {string} [label] e.g. "Sending a code"
 */
export function showSpinner(el, label) {
  const text = label || "Working";
  if (el) {
    el.classList.remove("portal-status--ok", "portal-status--err");
    el.replaceChildren();
    // Pages without the account Refresh indicator (login / signup) get an inline
    // spinner so busy still animates; the account dashboard uses the Refresh icon.
    if (!refreshButton()) {
      const spin = document.createElement("span");
      spin.className = "portal-status-spinner";
      spin.setAttribute("aria-hidden", "true");
      el.append(spin);
    }
    const labelEl = document.createElement("span");
    labelEl.textContent = text;
    el.append(labelEl);
    el.hidden = false;
    el.classList.add("portal-status--info", "portal-status--busy");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", text);
  }
  setRefreshBusy(true);
}
