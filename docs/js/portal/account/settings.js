/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import {
  ApiError,
  closeCancel,
  closeChallenge,
  closeConfirm,
  closeStart,
  closeStatus,
  emailChallenge,
  emailStart,
  getAccount,
} from "../api.js?v=18b54629821c";
import { clearSession } from "../session.js?v=18b54629821c";
import { setStatus, showSpinner } from "../ui.js?v=18b54629821c";
import { runConfirm } from "./modal.js?v=18b54629821c";
import { runStepUp } from "./stepup.js?v=18b54629821c";

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 * @param {{ statusEl: HTMLElement|null, onAccount?: (a: Record<string, unknown>) => void }} ctx
 */
export function renderSettings(panel, account, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Settings";
  const p = document.createElement("p");
  p.textContent = "Change email or close this account.";
  head.append(h2, p);
  panel.append(head);

  // —— Email ——
  const emailBlock = document.createElement("section");
  emailBlock.className = "portal-block";
  const h3e = document.createElement("h3");
  h3e.textContent = "Email";
  const cur = document.createElement("p");
  cur.className = "portal-muted";
  cur.textContent = `Current: ${String(account.email || "")}`;
  const form = document.createElement("form");
  form.className = "portal-inline-form";
  form.innerHTML = `
    <label class="portal-field portal-field--grow">
      <span>New email</span>
      <input name="email" class="form-control" type="email" required
        autocomplete="email" placeholder="you@example.com" />
    </label>
    <button type="submit" class="btn btn-primary">Change email</button>
  `;
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get("email") || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      setStatus(ctx.statusEl, "Enter a valid email address.", "err");
      return;
    }
    const ok = await runStepUp({
      title: "Change email",
      hint: "We'll email a code to your current address, then send a link to the new one.",
      sendCode: (onPow) => emailChallenge(email, { onPow }),
      confirm: async (code, onPow) => {
        await emailStart(email, code, { onPow });
      },
    });
    if (ok) {
      setStatus(
        ctx.statusEl,
        "Check the new inbox for an activation link to finish the change.",
        "ok"
      );
      form.reset();
    }
  });
  emailBlock.append(h3e, cur, form);
  panel.append(emailBlock);

  // —— Close ——
  const closeBlock = document.createElement("section");
  closeBlock.className = "portal-block";
  const h3c = document.createElement("h3");
  h3c.textContent = "Close account";
  const note = document.createElement("p");
  note.className = "portal-muted";
  note.textContent =
    "Closing stops billing and eventually deletes data. You can cancel while still closing.";
  const closeActions = document.createElement("div");
  closeActions.className = "portal-actions";
  closeBlock.append(h3c, note, closeActions);
  panel.append(closeBlock);

  const refreshClose = async () => {
    closeActions.replaceChildren();
    let status = String(account.status || "");
    try {
      if (status === "closing") {
        const st = await closeStatus();
        status = String(st.status || status);
        const detail = document.createElement("p");
        detail.textContent = "This account is closing.";
        closeActions.append(detail);
      }
    } catch {
      /* ignore status fetch errors here */
    }

    if (status === "closing") {
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn btn-ghost portal-btn-danger";
      confirmBtn.textContent = "Confirm close";
      confirmBtn.addEventListener("click", () => void onConfirmClose());
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-primary";
      cancelBtn.textContent = "Cancel closing";
      cancelBtn.addEventListener("click", () => void onCancelClose());
      closeActions.append(confirmBtn, cancelBtn);
      return;
    }

    if (status === "closed") {
      const done = document.createElement("p");
      done.textContent = "This account is closed.";
      closeActions.append(done);
      return;
    }

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn btn-ghost portal-btn-danger";
    startBtn.textContent = "Start closing";
    startBtn.addEventListener("click", () => void onStartClose());
    closeActions.append(startBtn);
  };

  const onStartClose = async () => {
    const proceed = await runConfirm({
      title: "Start closing",
      body: "Start closing this account? You'll need a second confirmation to finish.",
      confirmLabel: "Start closing",
      danger: true,
    });
    if (!proceed) return;
    const ok = await runStepUp({
      title: "Start closing account",
      hint: "We'll email a code to begin closing.",
      sendCode: (onPow) => closeChallenge("start", { onPow }),
      confirm: async (code, onPow) => {
        await closeStart(code, { onPow });
      },
    });
    if (ok) {
      setStatus(ctx.statusEl, "Closing started.", "ok");
      const acct = await getAccount();
      if (ctx.onAccount) ctx.onAccount(acct);
      account = acct;
      await refreshClose();
    }
  };

  const onConfirmClose = async () => {
    const proceed = await runConfirm({
      title: "Close account",
      body: "Permanently close this account? This can't be undone after it finishes.",
      confirmLabel: "Close account",
      danger: true,
    });
    if (!proceed) return;
    const ok = await runStepUp({
      title: "Confirm account close",
      hint: "We'll email a final confirmation code.",
      sendCode: (onPow) => closeChallenge("confirm", { onPow }),
      confirm: async (code, onPow) => {
        await closeConfirm(code, { onPow });
      },
    });
    if (ok) {
      setStatus(ctx.statusEl, "Account closed.", "ok");
      clearSession();
      window.setTimeout(() => {
        window.location.href = "/machine/portal/login/";
      }, 1200);
    }
  };

  const onCancelClose = async () => {
    showSpinner(ctx.statusEl, "Canceling close");
    try {
      await closeCancel();
      const acct = await getAccount();
      if (ctx.onAccount) ctx.onAccount(acct);
      account = acct;
      setStatus(ctx.statusEl, "Closing canceled. Account is active again.", "ok");
      await refreshClose();
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not cancel closing. Try again shortly.",
        "err"
      );
    }
  };

  void refreshClose();
}
