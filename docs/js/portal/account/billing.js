/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, billingPortal, getBillingProducts } from "../api.js?v=9943371cc422";
import { setStatus, showSpinner } from "../ui.js?v=9943371cc422";
import { titleCase, until } from "./format.js?v=9943371cc422";
import { runConfirm, runPlanPick } from "./modal.js?v=9943371cc422";
import { TIER_RANK, tierRank } from "./plans.js?v=9943371cc422";

/**
 * @param {HTMLElement} host
 * @param {{ label: string, button: string, danger?: boolean, disabled?: boolean, onClick: (btn: HTMLButtonElement) => void }} row
 * @returns {HTMLButtonElement}
 */
function appendActionRow(host, row) {
  const el = document.createElement("div");
  el.className = "portal-action-row";
  const label = document.createElement("span");
  label.textContent = row.label;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = row.danger
    ? "btn btn-ghost btn-sm portal-btn-danger"
    : "btn btn-ghost btn-sm";
  btn.textContent = row.button;
  btn.disabled = Boolean(row.disabled);
  if (row.disabled) {
    btn.dataset.baseDisabled = "1";
  }
  btn.addEventListener("click", () => row.onClick(btn));
  el.append(label, btn);
  host.append(el);
  return btn;
}

/**
 * @param {HTMLElement} panel
 * @param {string} title
 * @returns {HTMLElement} rows host
 */
function appendSection(panel, title) {
  const section = document.createElement("section");
  section.className = "portal-block portal-block--borderless";
  const h3 = document.createElement("h3");
  h3.textContent = title;
  const rows = document.createElement("div");
  rows.className = "portal-action-rows";
  section.append(h3, rows);
  panel.append(section);
  return rows;
}

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

  const tier = String(account.tier || "").toLowerCase();
  const paid = tierRank(tier) >= 0;

  /** @type {HTMLButtonElement[]} */
  const actionButtons = [];
  let busy = false;

  /** @param {boolean} on */
  const setBusy = (on) => {
    busy = on;
    for (const b of actionButtons) {
      b.disabled = on || b.dataset.baseDisabled === "1";
    }
  };

  /** @type {Record<string, unknown>[]|null} */
  let catalogSubs = null;

  const loadCatalog = async () => {
    if (catalogSubs) return catalogSubs;
    const catalog = await getBillingProducts();
    catalogSubs = Array.isArray(catalog.subscriptions)
      ? catalog.subscriptions
      : [];
    return catalogSubs;
  };

  /**
   * @param {"upgrade"|"downgrade"} flow
   * @returns {Promise<{ value: string, label: string }[]>}
   */
  const planOptions = async (flow) => {
    const subs = await loadCatalog();
    const offered = new Set(
      subs.map((s) => String(s.tier || "").toLowerCase()).filter(Boolean)
    );
    const current = tierRank(tier);
    /** @type {{ value: string, label: string }[]} */
    const options = [];
    for (const t of TIER_RANK) {
      if (!offered.has(t)) continue;
      const r = tierRank(t);
      if (flow === "upgrade" && r > current) {
        options.push({ value: t, label: titleCase(t) });
      }
      if (flow === "downgrade" && r < current && r >= 0) {
        options.push({ value: t, label: titleCase(t) });
      }
    }
    // Ascending; upgrade preselects first (nearest up), downgrade last (nearest down).
    return options;
  };

  /**
   * @param {string} flow
   * @param {{ plan?: string }} [opts]
   */
  const openPortal = async (flow, opts = {}) => {
    showSpinner(ctx.statusEl, "Opening Stripe");
    try {
      const data = await billingPortal(flow, opts);
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
    }
  };

  const planRows = appendSection(panel, "Plan");
  const currentRow = document.createElement("div");
  currentRow.className = "portal-action-row";
  const currentLabel = document.createElement("span");
  currentLabel.className = "portal-action-row-label";
  const currentTitle = document.createElement("span");
  currentTitle.textContent = "Current plan";
  currentLabel.append(currentTitle);
  const resetsAt = account.credit_resets_at
    ? String(account.credit_resets_at)
    : "";
  if (resetsAt) {
    const ends = document.createElement("span");
    ends.className = "portal-muted portal-action-row-meta";
    // credit_resets_at is the credit-block renewal, same as Overview "Renewal".
    ends.textContent = `Credits renew ${until(resetsAt)}`;
    currentLabel.append(ends);
  }
  const currentValue = document.createElement("span");
  currentValue.className = "portal-action-row-value";
  currentValue.textContent = tier ? titleCase(tier) : "None";
  currentRow.append(currentLabel, currentValue);
  planRows.append(currentRow);

  if (!paid) {
    const note = document.createElement("p");
    note.className = "portal-muted";
    note.textContent = "Subscribe on Buy before you can change or cancel a plan.";
    planRows.append(note);
  }

  actionButtons.push(
    appendActionRow(planRows, {
      label: "Upgrade plan",
      button: "Upgrade",
      disabled: !paid,
      onClick: () => void onUpgrade(),
    }),
    appendActionRow(planRows, {
      label: "Downgrade plan",
      button: "Downgrade",
      disabled: !paid,
      onClick: () => void onDowngrade(),
    }),
    appendActionRow(planRows, {
      label: "Cancel subscription",
      button: "Cancel",
      danger: true,
      disabled: !paid,
      onClick: () => void onCancel(),
    })
  );

  const portalRows = appendSection(panel, "Billing portal");
  actionButtons.push(
    appendActionRow(portalRows, {
      label: "Open billing portal",
      button: "Open",
      onClick: () => void onPortal("manage"),
    }),
    appendActionRow(portalRows, {
      label: "Update payment method",
      button: "Update",
      onClick: () => void onPortal("payment"),
    })
  );

  /** @param {string} flow @param {{ plan?: string }} [opts] */
  const onPortal = async (flow, opts = {}) => {
    if (busy) return;
    setBusy(true);
    try {
      await openPortal(flow, opts);
    } finally {
      setBusy(false);
    }
  };

  const onUpgrade = async () => {
    if (busy) return;
    setBusy(true);
    showSpinner(ctx.statusEl, "Loading plans");
    try {
      const options = await planOptions("upgrade");
      setStatus(ctx.statusEl, "", "");
      if (!options.length) {
        await runConfirm({
          title: "Upgrade plan",
          body: "You're already on the highest plan.",
          confirmLabel: "OK",
          dismissOnly: true,
        });
        return;
      }
      const plan = await runPlanPick({
        title: "Upgrade plan",
        options,
        selected: options[0].value,
      });
      if (!plan) return;
      await openPortal("upgrade", { plan });
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load plans. Try again shortly.",
        "err"
      );
    } finally {
      setBusy(false);
    }
  };

  const onDowngrade = async () => {
    if (busy) return;
    setBusy(true);
    showSpinner(ctx.statusEl, "Loading plans");
    try {
      const options = await planOptions("downgrade");
      setStatus(ctx.statusEl, "", "");
      if (!options.length) {
        // No paid tier below — Free is cancel, not a plan switch.
        const ok = await runConfirm({
          title: "Downgrade plan",
          body: "There's no lower paid plan. Cancel your subscription at period end to return to Free. You can keep using the plan until then.",
          confirmLabel: "Cancel subscription",
          danger: true,
        });
        if (ok) await openPortal("cancel");
        return;
      }
      // Nearest downgrade = highest tier still below current (last in ascending list).
      const nearest = options[options.length - 1].value;
      const plan = await runPlanPick({
        title: "Downgrade plan",
        note: "To return to Free, cancel your subscription.",
        options,
        selected: nearest,
      });
      if (!plan) return;
      await openPortal("downgrade", { plan });
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load plans. Try again shortly.",
        "err"
      );
    } finally {
      setBusy(false);
    }
  };

  const onCancel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await runConfirm({
        title: "Cancel subscription",
        body: "Cancel at period end? You can keep using the plan until then, then you move to Free.",
        confirmLabel: "Cancel subscription",
        danger: true,
      });
      if (!ok) return;
      await openPortal("cancel");
    } finally {
      setBusy(false);
    }
  };
}
