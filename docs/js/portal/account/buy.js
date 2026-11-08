import {
  ApiError,
  billingCheckout,
  billingPortal,
  billingSubscribe,
  getAccount,
  getBillingOrder,
  getBillingProducts,
  newRequestId,
} from "../api.js?v=dc37029f3963";
import { setStatus, showSpinner } from "../ui.js?v=dc37029f3963";
import { credits, eur, titleCase } from "./format.js?v=dc37029f3963";
import { RECOMMENDED_TIER, tierRank } from "./plans.js?v=dc37029f3963";

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
  p.textContent = "Subscribe to a plan or buy usage credits.";
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
   * What a plan allows, in the words of the pricing page's plan cards.
   * @param {Record<string, unknown>} sub
   * @returns {HTMLUListElement}
   */
  const planLimits = (sub) => {
    const n = (key) => Number(sub[key]) || 0;
    const gib = (mb) => `${Math.round(mb / 1024)}G`;
    const lines = [
      `Sessions of up to ${n("max_vcpus")} vCPUs, ${gib(n("max_mem_mb"))} memory and ${gib(n("max_storage_mb"))} disk`,
      `${n("max_sessions")} sessions at once, ${n("max_running_vcpus")} vCPUs between them`,
      `${Math.round(n("storage_bytes") / 1e9)}GB of storage for runs and disk images`,
      `Idle sessions run ${n("idle_stop_minutes")} minutes before they stop`,
    ];
    const ul = document.createElement("ul");
    ul.className = "portal-product-limits";
    for (const line of lines) {
      const li = document.createElement("li");
      li.textContent = line;
      ul.append(li);
    }
    return ul;
  };

  /**
   * @param {Record<string, unknown>} catalog
   */
  const paint = (catalog) => {
    packsEl.replaceChildren();
    plansEl.replaceChildren();
    const packs = Array.isArray(catalog.packs) ? catalog.packs : [];
    // Cheapest first, as a price list reads, whatever order the catalog sends.
    const subs = (
      Array.isArray(catalog.subscriptions) ? catalog.subscriptions : []
    )
      // A plan this page does not know is one added after it was built.
      .filter((sub) => tierRank(String(sub.tier)) >= 0)
      .sort((a, b) => tierRank(String(a.tier)) - tierRank(String(b.tier)));
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
        // Recommended guides a first choice. An account on a paid plan has made
        // it: its own plan is the one marked, and nothing points it elsewhere.
        const recommended =
          tierRank(currentTier) < 0 && tier.toLowerCase() === RECOMMENDED_TIER;
        const card = document.createElement("article");
        card.className = [
          "portal-product",
          "portal-plan",
          subscribed ? "portal-plan--current" : "",
          recommended ? "portal-plan--recommended" : "",
        ]
          .filter(Boolean)
          .join(" ");
        if (subscribed || recommended) {
          const pill = document.createElement("span");
          pill.className = "portal-plan-pill";
          pill.textContent = subscribed ? "Your plan" : "Recommended";
          card.append(pill);
        }
        const titleRow = document.createElement("div");
        titleRow.className = "portal-product-title";
        const title = document.createElement("h4");
        title.textContent = titleCase(tier) || "Plan";
        titleRow.append(title);
        const amountMicros = Number(sub.amount_micros) || 0;
        const interval = String(sub.interval || "");
        const price = document.createElement("p");
        price.className = "portal-product-price";
        const amount = document.createElement("span");
        amount.className = "portal-plan-amount";
        amount.textContent = amountMicros > 0 ? eur(amountMicros, 2) : "";
        price.append(amount, interval ? ` a ${interval}` : "");
        const meta = document.createElement("p");
        meta.className = "portal-product-credits";
        meta.textContent = `${credits(micros, 3)} credits included each ${interval || "period"}`;
        const parts = amountMicros > 0 ? [titleRow, price, meta] : [titleRow, meta];
        if (unitHour > 0) {
          const hours = document.createElement("p");
          hours.className = "portal-muted";
          hours.textContent = `About ${Math.floor(micros / unitHour).toLocaleString("en-US")} vCPU-hours`;
          parts.push(hours);
        }
        parts.push(planLimits(sub));
        card.append(...parts);
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
          btn.className = recommended ? "btn btn-primary" : "btn btn-ghost";
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
    // Dedicated machines are sold by contract, not checkout.
    const dedicated = document.createElement("p");
    dedicated.className = "portal-muted portal-plan-dedicated";
    const sales = document.createElement("a");
    sales.href = "mailto:sales@testflows.com";
    sales.textContent = "sales@testflows.com";
    dedicated.append("Dedicated machines for a team: contact ", sales, ".");
    plansEl.append(dedicated);

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
        // The plan card's shape: the amount large, what it costs, what it runs,
        // and the button at the foot.
        const card = document.createElement("article");
        card.className = "portal-product portal-plan portal-pack";
        const amount = document.createElement("p");
        amount.className = "portal-plan-amount";
        amount.textContent = credits(micros, 0);
        const price = document.createElement("p");
        price.className = "portal-product-price";
        // A credit is bought at one euro: the pack's credits are its price.
        price.textContent = `for ${eur(micros, 0)}`;
        const lines = [];
        const hours = unitHour > 0 ? Math.floor(micros / unitHour) : 0;
        if (hours > 0) lines.push(`About ${hours.toLocaleString("en-US")} vCPU-hours`);
        lines.push("Never expire");
        const list = document.createElement("ul");
        list.className = "portal-product-limits";
        for (const text of lines) {
          const li = document.createElement("li");
          li.textContent = text;
          list.append(li);
        }
        const parts = [amount, price, list];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.textContent = "Buy";
        btn.addEventListener("click", () => void startCheckout(priceId, "pack"));
        card.append(...parts, btn);
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
