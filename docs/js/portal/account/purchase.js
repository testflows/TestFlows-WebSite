/** The return from Stripe Checkout: wait for the order the developer just paid,
 * then say what it bought. */

import { getBillingOrders, getBillingProducts } from "../api.js?v=dc37029f3963";
import { credits, titleCase } from "./format.js?v=dc37029f3963";

/** How often, and for how long, to read the order while its webhook lands. */
const POLL_MS = 1500;
const POLL_LIMIT_MS = 30000;

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The newest order: the one Checkout just returned from. It is completed once
 * Stripe's webhook has added its credits.
 * @returns {Promise<Record<string, unknown>|null>}
 */
async function settledOrder() {
  const deadline = Date.now() + POLL_LIMIT_MS;
  for (;;) {
    const [order] = await getBillingOrders({ limit: 1 });
    const status = order ? String(order.status) : "";
    if (order && status !== "pending" && status !== "processing") return order;
    if (Date.now() >= deadline) return null;
    await sleep(POLL_MS);
  }
}

/**
 * The plan a subscription order bought, by its plan credits in the catalog.
 * @param {number} creditMicros
 * @returns {Promise<string>}
 */
async function planName(creditMicros) {
  const catalog = await getBillingProducts();
  const subs = Array.isArray(catalog.subscriptions) ? catalog.subscriptions : [];
  const sub = subs.find((s) => Number(s.credit_micros) === creditMicros);
  return sub ? titleCase(String(sub.tier)) : "";
}

/**
 * Wait for the order, then describe it for the purchase modal.
 * @returns {Promise<import("./modal.js").PurchaseResult>}
 */
export async function confirmPurchase() {
  const order = await settledOrder();
  if (!order) {
    return {
      ok: false,
      title: "Thank you for your payment",
      detail: "Stripe is still confirming it. Your account updates in a few minutes.",
    };
  }
  if (String(order.status) !== "completed") {
    return {
      ok: false,
      title: "Payment not completed",
      detail: "No charge was made. Start the purchase again from Buy.",
    };
  }
  const micros = Number(order.credit_micros) || 0;
  if (String(order.kind) === "subscription") {
    const plan = await planName(micros);
    return {
      ok: true,
      title: plan ? `Welcome to ${plan}` : "Plan started",
      amount: credits(micros, 0),
      detail: "Plan credits are in your account now, and again each month.",
    };
  }
  return {
    ok: true,
    title: "Credits added",
    amount: credits(micros, 0),
    detail: "Usage credits are in your account. They never expire.",
  };
}
