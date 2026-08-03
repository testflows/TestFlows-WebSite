/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared emailed-code step-up modal (PoW + code) for keys / email / close. */

import { ApiError } from "../api.js?v=c180d996aa4b";
import { setStatus, showSpinner } from "../ui.js?v=c180d996aa4b";

/**
 * @typedef {{
 *   title: string,
 *   hint?: string,
 *   sendCode: (onPow: () => void) => Promise<void>,
 *   confirm: (code: string, onPow: () => void) => Promise<void>,
 * }} StepUpOptions
 */

/**
 * @param {StepUpOptions} opts
 * @returns {Promise<boolean>} true if confirmed
 */
export function runStepUp(opts) {
  return new Promise((resolve) => {
    const root = document.getElementById("portal-stepup");
    const title = document.getElementById("portal-stepup-title");
    const hint = document.getElementById("portal-stepup-hint");
    const status = document.getElementById("portal-stepup-status");
    const codeInput = /** @type {HTMLInputElement|null} */ (
      document.getElementById("portal-stepup-code")
    );
    const sendBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("portal-stepup-send")
    );
    const confirmBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("portal-stepup-confirm")
    );
    const cancelBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("portal-stepup-cancel")
    );
    if (
      !root ||
      !title ||
      !hint ||
      !status ||
      !codeInput ||
      !sendBtn ||
      !confirmBtn ||
      !cancelBtn
    ) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      codeInput.value = "";
      setStatus(status, "", "");
      sendBtn.disabled = false;
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
      sendBtn.removeEventListener("click", onSend);
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      root.removeEventListener("keydown", onKey);
      resolve(ok);
    };

    const onPow = () => showSpinner(status, "Working");

    const onSend = async () => {
      sendBtn.disabled = true;
      confirmBtn.disabled = true;
      showSpinner(status, "Sending a code");
      try {
        await opts.sendCode(onPow);
        setStatus(status, "Check your email for a code.", "ok");
        codeInput.focus();
      } catch (err) {
        setStatus(
          status,
          err instanceof ApiError
            ? err.message
            : "Could not send a code. Try again shortly.",
          "err"
        );
      } finally {
        sendBtn.disabled = false;
        confirmBtn.disabled = false;
      }
    };

    const onConfirm = async () => {
      const code = codeInput.value.trim();
      if (!code) {
        setStatus(status, "Enter the code from your email.", "err");
        return;
      }
      sendBtn.disabled = true;
      confirmBtn.disabled = true;
      showSpinner(status, "Confirming");
      try {
        await opts.confirm(code, onPow);
        finish(true);
      } catch (err) {
        setStatus(
          status,
          err instanceof ApiError
            ? err.message
            : "Could not confirm. Try again shortly.",
          "err"
        );
        sendBtn.disabled = false;
        confirmBtn.disabled = false;
      }
    };

    const onCancel = () => finish(false);

    const onKey = (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        finish(false);
      }
    };

    title.textContent = opts.title;
    hint.textContent = opts.hint || "We'll email a one-time code to confirm.";
    codeInput.value = "";
    setStatus(status, "", "");
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    sendBtn.addEventListener("click", onSend);
    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    root.addEventListener("keydown", onKey);
    void onSend();
  });
}
