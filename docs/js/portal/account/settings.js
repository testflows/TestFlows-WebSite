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
} from "../api.js?v=6e72d7cd2916";
import { clearSession } from "../session.js?v=6e72d7cd2916";
import { setStatus, showSpinner } from "../ui.js?v=6e72d7cd2916";
import { runConfirm } from "./modal.js?v=6e72d7cd2916";
import { runStepUp } from "./stepup.js?v=6e72d7cd2916";

/** How often the closing panel resumes teardown while waiting for `ready`. */
const CLOSE_POLL_MS = 5000;

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
    "Closing stops billing and closes your account. You can cancel while still closing.";
  const closeInfo = document.createElement("div");
  closeInfo.className = "portal-close-info";
  const closeActions = document.createElement("div");
  closeActions.className = "portal-actions";
  closeBlock.append(h3c, note, closeInfo, closeActions);
  panel.append(closeBlock);

  /**
   * Populate the closing-state detail and gate Confirm on `ready`. `progress` is
   * the AccountCloseProgress, or null when the status fetch failed — in which case
   * Confirm stays enabled and the server still enforces readiness.
   * @param {Record<string, unknown>|null} progress
   */
  const renderClosing = (progress) => {
    const detail = document.createElement("p");
    detail.textContent = "This account is closing.";
    closeInfo.append(detail);

    const ready = progress ? Boolean(progress.ready) : true;
    const remaining = Number(progress?.sessions_remaining ?? 0);
    // The platform tears sessions down for you (reaper), then cancels the plan;
    // `ready` gates on both. Surface whichever step is still pending as a wait —
    // never "stop them yourself". We don't split out sessions_stopping.
    if (remaining > 0) {
      const line = document.createElement("p");
      line.className = "portal-muted";
      line.textContent = `Waiting for ${remaining} session${
        remaining === 1 ? "" : "s"
      } to stop.`;
      closeInfo.append(line);
    } else if (progress && !ready) {
      const line = document.createElement("p");
      line.className = "portal-muted";
      line.textContent = "Waiting for plan cancel to finish.";
      closeInfo.append(line);
    }

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "btn btn-ghost portal-btn-danger";
    confirmBtn.textContent = "Confirm close";
    confirmBtn.disabled = !ready;
    if (!ready) confirmBtn.title = "Sessions or plan cancel aren't done yet.";
    confirmBtn.addEventListener("click", () => void onConfirmClose());

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-primary";
    cancelBtn.textContent = "Cancel closing";
    cancelBtn.addEventListener("click", () => void onCancelClose());
    closeActions.append(confirmBtn, cancelBtn);

    if (progress?.portal_url) {
      const manage = document.createElement("a");
      manage.className = "btn btn-ghost";
      manage.href = String(progress.portal_url);
      manage.target = "_blank";
      manage.rel = "noopener noreferrer";
      manage.textContent = "Manage billing";
      closeActions.append(manage);
    }
  };

  // Teardown poll handle (0 = idle) + a generation token: every refresh (and a
  // Cancel) bumps it, so an in-flight poll that resolves late bails instead of
  // repainting stale "closing" over a newer state.
  let pollTimer = 0;
  let closeGen = 0;

  const refreshClose = async () => {
    if (pollTimer) {
      window.clearTimeout(pollTimer);
      pollTimer = 0;
    }
    const gen = ++closeGen;
    let status = String(account.status || "");
    /** @type {Record<string, unknown>|null} */
    let progress = null;
    if (status === "closing") {
      // Teardown (stop sessions → revoke keys → cancel plan) only advances on
      // POST /start; GET status just reads. So resume teardown here — no code is
      // needed while already closing — then render the fresh progress. Mirrors
      // the CLI wait loop. Fall back to a plain read if the resume call fails.
      try {
        progress = await closeStart(null);
      } catch {
        try {
          progress = await closeStatus();
        } catch {
          progress = null;
        }
      }
      // A newer refresh or a Cancel superseded us mid-await — don't paint stale
      // "closing" over it, and don't re-arm the poll.
      if (gen !== closeGen) return;
      if (progress) status = String(progress.status || status);
    }

    closeInfo.replaceChildren();
    closeActions.replaceChildren();

    if (status === "closing") {
      renderClosing(progress);
      // Keep advancing teardown until ready; stop once the panel is gone.
      if (progress && !progress.ready) {
        pollTimer = window.setTimeout(() => {
          if (document.contains(closeBlock)) void refreshClose();
        }, CLOSE_POLL_MS);
      }
      return;
    }

    if (status === "closed") {
      const done = document.createElement("p");
      done.textContent = "This account is closed.";
      closeInfo.append(done);
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
      title: "Start closing account",
      body:
        "Closing your account stops any running machines without saving your " +
        "work, revokes your API keys, and cancels a paid plan (which stays valid " +
        "until the period ends). Images, invoices, and unused credits are kept " +
        "for 90 days and may be deleted after that. You'll confirm once more to " +
        "finish, and can cancel any time before that.",
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
      body:
        "This permanently closes your account. You'll be signed out and sign-in " +
        "will be disabled. This can't be undone after it finishes.",
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
    // Supersede any in-flight teardown poll so it can't repaint "closing" once
    // we're active again.
    closeGen++;
    if (pollTimer) {
      window.clearTimeout(pollTimer);
      pollTimer = 0;
    }
    showSpinner(ctx.statusEl, "Canceling close");
    try {
      const result = await closeCancel();
      const acct = await getAccount();
      if (ctx.onAccount) ctx.onAccount(acct);
      account = acct;
      // Cancel restores the account but does NOT restore API keys already revoked
      // during teardown, so say so (conservatively, always).
      const parts = ["Closing canceled."];
      parts.push(
        result?.subscription_cancel_scheduled
          ? "Your plan is still set to cancel at period end (open Billing to keep it)."
          : "Account is active again."
      );
      parts.push("Any API keys revoked while closing stay revoked.");
      setStatus(ctx.statusEl, parts.join(" "), "ok");
      await refreshClose();
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not cancel closing. Try again shortly.",
        "err"
      );
      // Cancel failed — we're still closing. Re-enter the gen/poll loop so
      // teardown keeps advancing (the up-front bump/clear left it disarmed).
      await refreshClose();
    }
  };

  void refreshClose();
}
