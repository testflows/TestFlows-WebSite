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
  billingCheckout,
  billingPortal,
  billingSubscribe,
  getAccount,
  getBillingOrder,
  getBillingProducts,
  newRequestId,
} from "../api.js?v=18b54629821c";
import { setStatus, showSpinner } from "../ui.js?v=18b54629821c";
import { eur, titleCase } from "./format.js?v=18b54629821c";
import { tierRank } from "./plans.js?v=18b54629821c";

/**
 * @param {string|undefined} url
 */
function openStripe(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 * @param {{ statusEl: HTMLElement|null, onAccount?: (acct: Record<string, unknown>) => void }} ctx
 */
export function renderBuy(panel, account, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Buy";
  const p = document.createElement("p");
  p.textContent = "Subscribe to a plan or purchase usage credits.";
  head.append(h2, p);
  panel.append(head);

  const plansEl = document.createElement("section");
  plansEl.className = "portal-block portal-block--borderless";
  const packsEl = document.createElement("section");
  packsEl.className = "portal-block portal-block--borderless";
  panel.append(plansEl, packsEl);

  /** @type {string} */
  let currentTier = String(account.tier || "").toLowerCase();
  /** @type {Record<string, unknown>|null} */
  let lastCatalog = null;
  let busy = false;

  /** @param {boolean} on */
  const setBusy = (on) => {
    busy = on;
    panel.querySelectorAll(".portal-product .btn").forEach((el) => {
      if (el instanceof HTMLButtonElement) el.disabled = on;
    });
  };

  const load = async () => {
    showSpinner(ctx.statusEl, "Loading products");
    try {
      const [catalog, acct] = await Promise.all([
        getBillingProducts(),
        getAccount(),
      ]);
      currentTier = String(acct.tier || "").toLowerCase();
      lastCatalog = catalog;
      if (ctx.onAccount) ctx.onAccount(acct);
      setStatus(ctx.statusEl, "", "");
      paint(catalog);
    } catch (err) {
      packsEl.replaceChildren();
      plansEl.replaceChildren();
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load products. Try again shortly.",
        "err"
      );
    }
  };

  /** Re-fetch account (and catalog) so Subscribed / Upgrade labels stay current. */
  const refreshAfterPurchase = async () => {
    try {
      const [catalog, acct] = await Promise.all([
        getBillingProducts(),
        getAccount(),
      ]);
      currentTier = String(acct.tier || "").toLowerCase();
      lastCatalog = catalog;
      if (ctx.onAccount) ctx.onAccount(acct);
      paint(catalog);
    } catch {
      if (lastCatalog) paint(lastCatalog);
    }
  };

  /**
   * @param {Record<string, unknown>} catalog
   */
  const paint = (catalog) => {
    packsEl.replaceChildren();
    plansEl.replaceChildren();
    const packs = Array.isArray(catalog.packs) ? catalog.packs : [];
    const subs = Array.isArray(catalog.subscriptions)
      ? catalog.subscriptions
      : [];
    const unitHour = Number(catalog.standard_unit_hour_micros) || 0;
    const terms = String(catalog.usage_credit_terms || "");

    const h3s = document.createElement("h3");
    h3s.textContent = "Plans";
    plansEl.append(h3s);
    if (!subs.length) {
      const empty = document.createElement("p");
      empty.className = "portal-muted";
      empty.textContent = "No plans available right now.";
      plansEl.append(empty);
    } else {
      const list = document.createElement("div");
      list.className = "portal-product-list";
      for (const sub of subs) {
        const priceId = String(sub.price_id || "");
        const tier = String(sub.tier || "plan");
        const micros = Number(sub.credit_micros) || 0;
        const subscribed = tier.toLowerCase() === currentTier;
        const card = document.createElement("article");
        card.className = subscribed
          ? "portal-product portal-product--subscribed"
          : "portal-product";
        const titleRow = document.createElement("div");
        titleRow.className = "portal-product-title";
        const title = document.createElement("h4");
        title.textContent = titleCase(tier) || "Plan";
        titleRow.append(title);
        if (subscribed) {
          const badge = document.createElement("span");
          badge.className = "portal-product-badge";
          badge.textContent = "Subscribed";
          titleRow.append(badge);
        }
        const amountMicros = Number(sub.amount_micros) || 0;
        const interval = String(sub.interval || "");
        const price = document.createElement("p");
        price.className = "portal-product-price";
        price.textContent =
          amountMicros > 0
            ? interval
              ? `${eur(amountMicros, 2)} / ${interval}`
              : eur(amountMicros, 2)
            : "";
        const meta = document.createElement("p");
        meta.className = "portal-muted";
        meta.textContent = `${eur(micros, 3)} included credits / period`;
        if (amountMicros > 0) {
          card.append(titleRow, price, meta);
        } else {
          card.append(titleRow, meta);
        }
        if (!subscribed) {
          // Already on a paid plan → this is an upgrade/downgrade by rank, which
          // goes through the Stripe portal (a fresh Subscribe would 409). No paid
          // plan yet → a plain new subscription.
          const currentRank = tierRank(currentTier);
          const targetRank = tierRank(tier);
          const flow =
            currentRank >= 0 && targetRank >= 0
              ? targetRank > currentRank
                ? "upgrade"
                : "downgrade"
              : "";
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn btn-ghost";
          btn.textContent =
            flow === "upgrade"
              ? "Upgrade"
              : flow === "downgrade"
                ? "Downgrade"
                : "Subscribe";
          btn.addEventListener("click", () =>
            flow
              ? void startSwitch(flow, tier)
              : void startCheckout(priceId, "plan")
          );
          card.append(btn);
        }
        list.append(card);
      }
      plansEl.append(list);
    }

    const h3p = document.createElement("h3");
    h3p.textContent = "Usage credits";
    packsEl.append(h3p);
    if (!packs.length) {
      const empty = document.createElement("p");
      empty.className = "portal-muted";
      empty.textContent = "No credit packs available right now.";
      packsEl.append(empty);
    } else {
      const packsList = document.createElement("div");
      packsList.className = "portal-product-list portal-product-list--packs";
      for (const pack of packs) {
        const priceId = String(pack.price_id || "");
        const micros = Number(pack.credit_micros) || 0;
        const card = document.createElement("article");
        card.className = "portal-product";
        const title = document.createElement("h4");
        title.textContent = eur(micros, 3);
        const meta = document.createElement("p");
        meta.className = "portal-muted";
        if (unitHour > 0) {
          const hours = Math.floor(micros / unitHour);
          meta.textContent = hours > 0 ? `≈ ${hours} standard unit-hours` : "";
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.textContent = "Buy";
        btn.addEventListener("click", () => void startCheckout(priceId, "pack"));
        card.append(title, meta, btn);
        packsList.append(card);
      }
      packsEl.append(packsList);
    }
    if (terms) {
      const t = document.createElement("p");
      t.className = "portal-muted portal-product-disclaimer";
      t.textContent = terms;
      packsEl.append(t);
    }
  };

  /**
   * Upgrade/downgrade an existing subscription via the Stripe portal.
   * @param {"upgrade"|"downgrade"} flow
   * @param {string} tier
   */
  const startSwitch = async (flow, tier) => {
    if (busy) return;
    setBusy(true);
    showSpinner(ctx.statusEl, "Opening Stripe");
    try {
      const data = await billingPortal(flow, { plan: tier });
      const url = String(data.url || "");
      if (url) {
        openStripe(url);
        setStatus(ctx.statusEl, "Continue in Stripe.", "ok");
      }
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : `Could not ${flow}. Try again shortly.`,
        "err"
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * @param {string} priceId
   * @param {"pack"|"plan"} kind
   */
  const startCheckout = async (priceId, kind) => {
    if (!priceId || busy) return;
    setBusy(true);
    showSpinner(ctx.statusEl, "Opening Stripe");
    try {
      const requestId = newRequestId();
      const result =
        kind === "plan"
          ? await billingSubscribe(priceId, requestId)
          : await billingCheckout(priceId, requestId);
      const url = result.url ? String(result.url) : "";
      if (url) {
        openStripe(url);
        setStatus(
          ctx.statusEl,
          "Continue in Stripe. This page will refresh the order status.",
          "ok"
        );
      } else {
        setStatus(ctx.statusEl, "Checkout started.", "ok");
      }
      const orderId = result.order_id ? String(result.order_id) : "";
      if (orderId) {
        void pollOrder(orderId);
      }
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not start checkout. Try again shortly.",
        "err"
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * @param {string} orderId
   */
  const pollOrder = async (orderId) => {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const order = await getBillingOrder(orderId);
        const st = String(order.status || "");
        if (st === "paid" || st === "fulfilled" || st === "credited") {
          setStatus(ctx.statusEl, "Purchase completed.", "ok");
          await refreshAfterPurchase();
          return;
        }
        if (st === "canceled" || st === "cancelled" || st === "failed") {
          setStatus(ctx.statusEl, `Order ${st}.`, "info");
          return;
        }
      } catch {
        /* keep polling briefly */
      }
    }
  };

  void load();
}
