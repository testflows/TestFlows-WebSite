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
} from "../api.js?v=0b7804b627a3";
import { clearSession } from "../session.js?v=0b7804b627a3";
import { setStatus, showSpinner } from "../ui.js?v=0b7804b627a3";
import { runConfirm } from "./modal.js?v=0b7804b627a3";
import { runStepUp } from "./stepup.js?v=0b7804b627a3";

/** How often the closing panel resumes teardown while waiting for `ready`. */
const CLOSE_POLL_MS = 5000;

/** Teardown steps in API order (start_closing). Keys aren't separately reported;
 * once sessions are gone the next resume has revoked them. */
const CLOSE_STEPS = [
  { id: "sessions", label: "Stop machines" },
  { id: "keys", label: "Revoke API keys" },
  { id: "plan", label: "Cancel plan" },
  { id: "confirm", label: "Confirm close" },
];

/**
 * @param {Record<string, unknown>|null} progress
 * @returns {{ current: string, ready: boolean, remaining: number }}
 */
function closePhase(progress) {
  if (!progress) {
    // Status fetch failed — fail open on Confirm (server still enforces ready).
    return { current: "confirm", ready: true, remaining: 0 };
  }
  const remaining = Number(progress.sessions_remaining ?? 0);
  const ready = Boolean(progress.ready);
  if (remaining > 0) return { current: "sessions", ready, remaining };
  if (!ready) return { current: "plan", ready, remaining: 0 };
  return { current: "confirm", ready, remaining: 0 };
}

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

  // Stable closing chrome — built once, updated in place on each poll so the
  // action row (and focus) aren't torn down every 5s.
  /** @type {{
   *   steps: HTMLElement,
   *   stepEls: Map<string, HTMLElement>,
   *   detailEls: Map<string, HTMLElement>,
   *   confirmBtn: HTMLButtonElement,
   *   cancelBtn: HTMLButtonElement,
   *   manage: HTMLAnchorElement,
   * }|null} */
  let closingUi = null;

  const clearCloseChrome = () => {
    closingUi = null;
    closeInfo.replaceChildren();
    closeActions.replaceChildren();
  };

  /** Build the stepper + action buttons once for the closing state. */
  const ensureClosingUi = () => {
    if (closingUi) return closingUi;

    clearCloseChrome();

    const lead = document.createElement("p");
    lead.textContent = "This account is closing.";
    closeInfo.append(lead);

    const steps = document.createElement("ol");
    steps.className = "portal-close-steps";
    steps.setAttribute("aria-label", "Closing progress");
    /** @type {Map<string, HTMLElement>} */
    const stepEls = new Map();
    /** @type {Map<string, HTMLElement>} */
    const detailEls = new Map();
    for (const step of CLOSE_STEPS) {
      const li = document.createElement("li");
      li.className = "portal-close-step";
      li.dataset.step = step.id;

      const rail = document.createElement("span");
      rail.className = "portal-close-step-rail";
      rail.setAttribute("aria-hidden", "true");
      const dot = document.createElement("span");
      dot.className = "portal-close-step-dot";
      rail.append(dot);

      const body = document.createElement("div");
      body.className = "portal-close-step-body";
      const label = document.createElement("span");
      label.className = "portal-close-step-label";
      label.textContent = step.label;
      const detail = document.createElement("span");
      detail.className = "portal-close-step-detail";
      detail.setAttribute("aria-live", "polite");
      detail.hidden = true;
      body.append(label, detail);

      li.append(rail, body);
      steps.append(li);
      stepEls.set(step.id, li);
      detailEls.set(step.id, detail);
    }
    closeInfo.append(steps);

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

    const manage = document.createElement("a");
    manage.className = "btn btn-ghost";
    manage.target = "_blank";
    manage.rel = "noopener noreferrer";
    manage.textContent = "Manage billing";
    manage.hidden = true;

    closeActions.append(confirmBtn, cancelBtn, manage);
    closingUi = { steps, stepEls, detailEls, confirmBtn, cancelBtn, manage };
    return closingUi;
  };

  /**
   * In-place update of stepper highlight + Confirm gate. `progress` is the
   * AccountCloseProgress, or null when the status fetch failed.
   * @param {Record<string, unknown>|null} progress
   */
  const updateClosing = (progress) => {
    const ui = ensureClosingUi();
    const { current, ready, remaining } = closePhase(progress);
    const order = CLOSE_STEPS.map((s) => s.id);
    const currentIdx = order.indexOf(current);

    for (let i = 0; i < CLOSE_STEPS.length; i++) {
      const step = CLOSE_STEPS[i];
      const el = ui.stepEls.get(step.id);
      const detail = ui.detailEls.get(step.id);
      if (!el || !detail) continue;

      /** @type {"pending"|"current"|"done"|"ready"} */
      let state = "pending";
      if (ready) {
        // Teardown finished — prior steps done, Confirm is the ready action.
        state = step.id === "confirm" ? "ready" : "done";
      } else if (i < currentIdx) {
        state = "done";
      } else if (i === currentIdx) {
        state = "current";
      }

      el.dataset.state = state;
      el.classList.toggle("is-done", state === "done");
      el.classList.toggle("is-current", state === "current" || state === "ready");
      el.classList.toggle("is-pending", state === "pending");
      el.classList.toggle("is-ready", state === "ready");
      if (state === "current" || state === "ready") {
        el.setAttribute("aria-current", "step");
      } else {
        el.removeAttribute("aria-current");
      }

      // keys is never "current" (no distinct API phase) — only pending→done.
      let detailText = "";
      if (state === "current" && step.id === "sessions") {
        detailText = `Waiting for ${remaining} session${
          remaining === 1 ? "" : "s"
        } to stop.`;
      } else if (state === "current" && step.id === "plan") {
        detailText = "Waiting for plan cancel to finish.";
      } else if (state === "ready" && step.id === "confirm") {
        detailText = "Ready when you are.";
      }
      detail.textContent = detailText;
      detail.hidden = !detailText;
    }

    ui.confirmBtn.disabled = !ready;
    ui.confirmBtn.title = ready
      ? ""
      : "Sessions or plan cancel aren't done yet.";

    if (progress?.portal_url) {
      ui.manage.hidden = false;
      ui.manage.href = String(progress.portal_url);
    } else {
      ui.manage.hidden = true;
      ui.manage.removeAttribute("href");
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

    if (status === "closing") {
      updateClosing(progress);
      // Keep advancing teardown until ready; stop once the panel is gone.
      if (progress && !progress.ready) {
        pollTimer = window.setTimeout(() => {
          if (document.contains(closeBlock)) void refreshClose();
        }, CLOSE_POLL_MS);
      }
      return;
    }

    clearCloseChrome();

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
