/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, billingPortal } from "../api.js?v=84c7f636a38d";
import { setStatus, showSpinner } from "../ui.js?v=84c7f636a38d";
import { titleCase } from "./format.js?v=84c7f636a38d";

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderBilling(panel, account, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Billing";
  const p = document.createElement("p");
  p.textContent = "Manage plan, payment method, and cancellation in Stripe.";
  head.append(h2, p);
  panel.append(head);

  const tier = String(account.tier || "");
  const info = document.createElement("p");
  info.className = "portal-muted";
  info.textContent = tier
    ? `Current plan: ${titleCase(tier)}`
    : "No plan on file.";
  panel.append(info);

  const actions = document.createElement("div");
  actions.className = "portal-action-grid";

  /** @type {{ flow: string, label: string, confirm?: string, plan?: boolean }[]} */
  const items = [
    { flow: "manage", label: "Open billing portal" },
    { flow: "payment", label: "Update payment method" },
    { flow: "upgrade", label: "Upgrade plan", plan: true },
    { flow: "downgrade", label: "Downgrade plan", plan: true },
    {
      flow: "cancel",
      label: "Cancel subscription",
      confirm:
        "Cancel your subscription at period end? You can keep using it until then.",
    },
  ];

  for (const item of items) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      item.flow === "cancel" ? "btn btn-ghost portal-btn-danger" : "btn btn-ghost";
    btn.textContent = item.label;
    btn.addEventListener("click", () => void runFlow(item, btn));
    actions.append(btn);
  }
  panel.append(actions);

  const planField = document.createElement("div");
  planField.className = "portal-field";
  planField.innerHTML = `
    <label for="portal-billing-plan">Target plan (optional)</label>
    <input id="portal-billing-plan" class="form-control" type="text"
      placeholder="Leave blank for nearest plan" autocomplete="off" />
    <p class="portal-hint">Used for upgrade / downgrade when you want a specific tier.</p>
  `;
  panel.append(planField);

  /**
   * @param {{ flow: string, label: string, confirm?: string, plan?: boolean }} item
   * @param {HTMLButtonElement} btn
   */
  const runFlow = async (item, btn) => {
    if (item.confirm && !window.confirm(item.confirm)) {
      return;
    }
    const planInput = /** @type {HTMLInputElement|null} */ (
      document.getElementById("portal-billing-plan")
    );
    const plan = planInput?.value.trim() || "";
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Opening Stripe");
    try {
      /** @type {{ plan?: string }} */
      const opts = {};
      if (item.plan && plan) {
        opts.plan = plan;
      }
      const data = await billingPortal(item.flow, opts);
      const url = String(data.url || "");
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(ctx.statusEl, "Continue in Stripe.", "ok");
      } else {
        setStatus(ctx.statusEl, "Billing link unavailable.", "err");
      }
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not open billing. Try again shortly.",
        "err"
      );
    } finally {
      btn.disabled = false;
    }
  };
}
