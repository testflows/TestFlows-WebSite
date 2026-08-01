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
  billingSubscribe,
  getBillingOrder,
  getBillingProducts,
  newRequestId,
} from "../api.js?v=086fa99a4287";
import { setStatus, showSpinner } from "../ui.js?v=086fa99a4287";
import { eur, titleCase } from "./format.js?v=086fa99a4287";

/**
 * @param {string|undefined} url
 */
function openStripe(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderBuy(panel, ctx) {
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
  plansEl.className = "portal-block";
  const packsEl = document.createElement("section");
  packsEl.className = "portal-block";
  panel.append(plansEl, packsEl);

  const load = async () => {
    showSpinner(ctx.statusEl, "Loading products");
    try {
      const catalog = await getBillingProducts();
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
        const card = document.createElement("article");
        card.className = "portal-product";
        const title = document.createElement("h4");
        title.textContent = titleCase(tier) || "Plan";
        const meta = document.createElement("p");
        meta.className = "portal-muted";
        meta.textContent = `${eur(micros, 3)} included credits / period`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.textContent = "Subscribe";
        btn.addEventListener("click", () =>
          void startCheckout(priceId, "plan", btn)
        );
        card.append(title, meta, btn);
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
        btn.addEventListener("click", () =>
          void startCheckout(priceId, "pack", btn)
        );
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
   * @param {string} priceId
   * @param {"pack"|"plan"} kind
   * @param {HTMLButtonElement} btn
   */
  const startCheckout = async (priceId, kind, btn) => {
    if (!priceId) return;
    btn.disabled = true;
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
      btn.disabled = false;
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
