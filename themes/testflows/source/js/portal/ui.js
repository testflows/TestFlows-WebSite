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
 * Busy status label. Docked account toolbar uses the Refresh icon; everything
 * else (login/signup/modals) gets an inline spinner in the status field.
 * @param {HTMLElement|null} el
 * @param {string} [label] e.g. "Sending a code"
 */
export function showSpinner(el, label) {
  const text = label || "Working";
  const docked = Boolean(el?.classList.contains("portal-status--dock"));
  if (el) {
    el.classList.remove("portal-status--ok", "portal-status--err");
    el.replaceChildren();
    if (!docked) {
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
  // Don't spin the page Refresh control for modal-local busy states.
  setRefreshBusy(docked);
}
