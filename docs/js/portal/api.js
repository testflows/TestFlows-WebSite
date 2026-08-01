/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Machine API client — PoW handshake mirrors client/api/client.py.
 *
 * Every failure path goes through fail() → friendlyApiError so portal UI never
 * shows raw API codes. New endpoints should throw via fail(resp, fallback) only.
 */

import { solve, currentBucket } from "./hashcash.js";
import { friendlyApiError, friendlyNetworkError } from "./errors.js";
import { getToken } from "./session.js";

const MAX_POW_ROUNDS = 5;

/**
 * API base URL.
 * - `window.TF_MACHINE_API_URL` override wins
 * - on localhost / 127.0.0.1 → same-origin `/machine-api` (use ./portal-dev proxy)
 * - otherwise production machine-api
 */
function resolveApiBase() {
  if (typeof window !== "undefined" && window.TF_MACHINE_API_URL) {
    return String(window.TF_MACHINE_API_URL).replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "/machine-api";
    }
  }
  return "https://machine-api.testflows.com";
}

/** @type {string} */
export const API_BASE = resolveApiBase();

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} [status]
   * @param {unknown} [data]
   */
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class InvalidLoginCode extends ApiError {
  constructor() {
    super(friendlyApiError({ error: "invalid or expired code" }, 400), 400);
    this.name = "InvalidLoginCode";
  }
}

/**
 * Throw a UX-safe ApiError for any failed response. Use this for every
 * non-success path in this module (and any future portal API helpers).
 * @param {{ status: number, data: unknown }} resp
 * @param {string} fallback
 * @returns {never}
 */
export function fail(resp, fallback) {
  throw new ApiError(
    friendlyApiError(resp.data, resp.status, fallback),
    resp.status,
    resp.data
  );
}

function isPowChallenge(status, data) {
  return (
    status === 400 &&
    data &&
    typeof data === "object" &&
    data.error === "proof_of_work_required"
  );
}

/**
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @param {Record<string, string>} [headers]
 */
async function request(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { ...headers },
  };
  if (body !== null && body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  let resp;
  try {
    resp = await fetch(`${API_BASE}${path}`, opts);
  } catch {
    throw new ApiError(friendlyNetworkError());
  }
  let data = null;
  const text = await resp.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  return { status: resp.status, data };
}

/**
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @param {{ onPow?: () => void, headers?: Record<string, string> }} [opts]
 */
async function requestPow(method, path, body, opts = {}) {
  const base = { ...(opts.headers || {}) };
  let resp = await request(method, path, body, base);
  for (let i = 0; i < MAX_POW_ROUNDS; i++) {
    if (!isPowChallenge(resp.status, resp.data)) {
      return resp;
    }
    const subject = String(resp.data.subject);
    const difficulty = Number(resp.data.required_difficulty);
    const bucketSeconds = Number(resp.data.bucket_seconds);
    if (!subject || !Number.isFinite(difficulty) || !Number.isFinite(bucketSeconds)) {
      throw new ApiError("Something went wrong. Try again shortly.");
    }
    if (opts.onPow) {
      opts.onPow();
    }
    const stamp = await solve(subject, difficulty, currentBucket(bucketSeconds));
    resp = await request(method, path, body, { ...base, "X-Tf-Pow": stamp });
  }
  return resp;
}

/** Bearer header from the session cookie (throws if signed out). */
function authHeaders(token) {
  const t = token || getToken();
  if (!t) {
    throw new ApiError("Not signed in.", 401);
  }
  return { Authorization: `Bearer ${t}` };
}

/** @param {string} email @param {() => void} [onPow] */
export async function signupStart(email, onPow) {
  const resp = await requestPow("POST", "/signup/start", { email }, { onPow });
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not start sign-up.");
}

/** @param {string} email @param {() => void} [onPow] */
export async function loginStart(email, onPow) {
  const resp = await requestPow("POST", "/login/start", { email }, { onPow });
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not start sign-in.");
}

/**
 * @param {string} email
 * @param {string} code
 * @param {() => void} [onPow]
 * @returns {Promise<{ access_token: string, expires_at: string }>}
 */
export async function loginVerify(email, code, onPow) {
  const resp = await requestPow(
    "POST",
    "/login/verify",
    { email, code },
    { onPow }
  );
  if (resp.status === 200 && resp.data && resp.data.access_token) {
    return {
      access_token: String(resp.data.access_token),
      expires_at: String(resp.data.expires_at),
    };
  }
  if (resp.status === 403) {
    fail(resp, "This account isn't active.");
  }
  throw new InvalidLoginCode();
}

/** @param {string} [token] */
export async function logout(token) {
  let t = token;
  if (!t) {
    t = getToken();
  }
  if (!t) {
    return;
  }
  const resp = await request("POST", "/logout", null, {
    Authorization: `Bearer ${t}`,
  });
  if (resp.status === 204 || resp.status === 401) {
    return;
  }
  fail(resp, "Sign-out failed.");
}

/** @param {string} [token] */
export async function getAccount(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("GET", "/account", null, { Authorization });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load account.");
}

/**
 * @param {Record<string, string|number|boolean|undefined|null>} [params]
 * @param {string} [token]
 */
export async function getTransactions(params = {}, token) {
  const { Authorization } = authHeaders(token);
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const path = `/account/transactions${qs ? `?${qs}` : ""}`;
  const resp = await request("GET", path, null, { Authorization });
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load activity.");
}

/** @param {string} [token] */
export async function provisionStorage(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("POST", "/account/provision", null, { Authorization });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not provision storage.");
}

/** @param {string} [token] */
export async function getBillingProducts(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("GET", "/billing/products", null, { Authorization });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load products.");
}

/**
 * @param {string} priceId
 * @param {string} requestId
 * @param {string} [token]
 */
export async function billingCheckout(priceId, requestId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "POST",
    "/billing/checkout",
    { price_id: priceId },
    { Authorization, "Idempotency-Key": requestId }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start checkout.");
}

/**
 * @param {string} priceId
 * @param {string} requestId
 * @param {string} [token]
 */
export async function billingSubscribe(priceId, requestId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "POST",
    "/billing/subscribe",
    { price_id: priceId },
    { Authorization, "Idempotency-Key": requestId }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start subscription checkout.");
}

/**
 * @param {string} flow
 * @param {{ plan?: string }} [opts]
 * @param {string} [token]
 */
export async function billingPortal(flow, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const body = { flow };
  if (opts.plan) {
    body.plan = opts.plan;
  }
  const resp = await request("POST", "/billing/portal", body, { Authorization });
  if (resp.status === 200 && resp.data && resp.data.url) {
    return resp.data;
  }
  fail(resp, "Could not open billing.");
}

/**
 * @param {Record<string, string|number|undefined|null>} [params]
 * @param {string} [token]
 */
export async function getBillingOrders(params = {}, token) {
  const { Authorization } = authHeaders(token);
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const resp = await request(
    "GET",
    `/billing/orders${qs ? `?${qs}` : ""}`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data && Array.isArray(resp.data.orders)) {
    return resp.data.orders;
  }
  fail(resp, "Could not load orders.");
}

/** @param {string} orderId @param {string} [token] */
export async function getBillingOrder(orderId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "GET",
    `/billing/orders/${encodeURIComponent(orderId)}`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load order.");
}

/** @param {string} orderId @param {string} [token] */
export async function resumeBillingOrder(orderId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "POST",
    `/billing/orders/${encodeURIComponent(orderId)}/resume`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not resume order.");
}

/** @param {string} orderId @param {string} [token] */
export async function cancelBillingOrder(orderId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "POST",
    `/billing/orders/${encodeURIComponent(orderId)}/cancel`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not cancel order.");
}

/**
 * @param {Record<string, string|number|boolean|undefined|null>} [params]
 * @param {string} [token]
 */
export async function getBillingInvoices(params = {}, token) {
  const { Authorization } = authHeaders(token);
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const resp = await request(
    "GET",
    `/billing/invoices${qs ? `?${qs}` : ""}`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data && Array.isArray(resp.data.invoices)) {
    return resp.data.invoices;
  }
  fail(resp, "Could not load invoices.");
}

/** @param {string} invoiceId @param {string} [token] */
export async function downloadBillingInvoice(invoiceId, token) {
  const { Authorization } = authHeaders(token);
  const resp = await request(
    "GET",
    `/billing/invoices/${encodeURIComponent(invoiceId)}/download`,
    null,
    { Authorization }
  );
  if (resp.status === 200 && resp.data && resp.data.url) {
    return resp.data;
  }
  fail(resp, "Could not open invoice.");
}

/** @param {string} [token] */
export async function listTokens(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("GET", "/tokens", null, { Authorization });
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load API keys.");
}

/**
 * @param {string} operation create|update|delete
 * @param {{ tokenId?: number, onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function tokenChallenge(operation, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const body = { operation };
  if (opts.tokenId != null) {
    body.token_id = opts.tokenId;
  }
  const resp = await requestPow("POST", "/tokens/challenge", body, {
    onPow: opts.onPow,
    headers: { Authorization },
  });
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not send a confirmation code.");
}

/**
 * @param {string} name
 * @param {string} code
 * @param {{ expiresAt?: string, onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function tokenCreate(name, code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const body = { name, code };
  if (opts.expiresAt) {
    body.expires_at = opts.expiresAt;
  }
  const resp = await requestPow("POST", "/tokens", body, {
    onPow: opts.onPow,
    headers: { Authorization },
  });
  if (resp.status === 201 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not create API key.");
}

/**
 * @param {number} tokenId
 * @param {string} code
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function tokenRevoke(tokenId, code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const resp = await requestPow("DELETE", `/tokens/${tokenId}`, null, {
    onPow: opts.onPow,
    headers: { Authorization, "X-Tf-Code": code },
  });
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not delete API key.");
}

/**
 * @param {number} tokenId
 * @param {string} code
 * @param {{ expiresAt?: string|null, clearExpiry?: boolean, onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function tokenUpdate(tokenId, code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const body = {
    code,
    expires_at: opts.clearExpiry ? null : opts.expiresAt ?? null,
  };
  const resp = await requestPow("PATCH", `/tokens/${tokenId}`, body, {
    onPow: opts.onPow,
    headers: { Authorization },
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not update API key.");
}

/**
 * @param {string} email
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function emailChallenge(email, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const resp = await requestPow(
    "POST",
    "/account/email/challenge",
    { email },
    { onPow: opts.onPow, headers: { Authorization } }
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not send a confirmation code.");
}

/**
 * @param {string} email
 * @param {string} code
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function emailStart(email, code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const resp = await requestPow(
    "POST",
    "/account/email/start",
    { email },
    {
      onPow: opts.onPow,
      headers: { Authorization, "X-Tf-Code": code },
    }
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not start email change.");
}

/**
 * @param {string} phase start|confirm
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function closeChallenge(phase, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const resp = await requestPow(
    "POST",
    "/account/close/challenge",
    { phase },
    { onPow: opts.onPow, headers: { Authorization } }
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not send a confirmation code.");
}

/**
 * @param {string|null} code
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function closeStart(code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  /** @type {Record<string, string>} */
  const headers = { Authorization };
  if (code) {
    headers["X-Tf-Code"] = code;
  }
  const resp = await requestPow("POST", "/account/close/start", null, {
    onPow: opts.onPow,
    headers,
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start closing account.");
}

/** @param {string} [token] */
export async function closeStatus(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("GET", "/account/close", null, { Authorization });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load close status.");
}

/**
 * @param {string} code
 * @param {{ onPow?: () => void }} [opts]
 * @param {string} [token]
 */
export async function closeConfirm(code, opts = {}, token) {
  const { Authorization } = authHeaders(token);
  const resp = await requestPow("POST", "/account/close/confirm", null, {
    onPow: opts.onPow,
    headers: { Authorization, "X-Tf-Code": code },
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not close account.");
}

/** @param {string} [token] */
export async function closeCancel(token) {
  const { Authorization } = authHeaders(token);
  const resp = await request("POST", "/account/close/cancel", null, {
    Authorization,
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not cancel closing.");
}

/** Fresh idempotency key for checkout / subscribe. */
export function newRequestId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
