/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Machine API client — cookie-native browser session.
 *
 * The access token lives in the HttpOnly `tf_session` cookie the API sets; JS never
 * sees it. Every request rides `credentials: "include"` + `X-Tf-Client: browser` —
 * the header both selects the cookie credential server-side and is the CSRF guard
 * (a cross-site page can't set it without a preflight the origin allowlist rejects).
 *
 * Sessions are kept fresh PROACTIVELY: the shell rotates the cookie on boot when
 * `refreshDue()` (while it's still valid). The 401->refresh->retry below is only a
 * best-effort fallback — it can recover a still-valid cookie that raced a revoke,
 * but an already-expired cookie can't refresh itself, so that path ends in re-login.
 * The PoW handshake mirrors client/api/client.py. Every failure path goes through
 * fail() → friendlyApiError so the portal never shows raw API codes.
 */

import { solve, currentBucket } from "./hashcash.js?v=ffb8907cf590";
import { friendlyApiError, friendlyNetworkError } from "./errors.js?v=ffb8907cf590";
import { setSession, clearSession } from "./session.js?v=ffb8907cf590";

const MAX_POW_ROUNDS = 5;

/** Identifies the browser portal: selects the HttpOnly-cookie credential path and
 * carries the CSRF defense (sent on every request). */
const CLIENT = "browser";

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
 * One fetch, no auto-refresh. Always sends the session cookie (`credentials`) and
 * the `X-Tf-Client` header. Undefined/null header values are dropped.
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @param {Record<string, string|undefined|null>} [headers]
 */
async function rawRequest(method, path, body, headers = {}) {
  const opts = {
    method,
    credentials: "include",
    headers: { "X-Tf-Client": CLIENT },
  };
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null) {
      opts.headers[key] = value;
    }
  }
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

/** The auth flow itself — never triggers a refresh (avoids recursion / needless
 * rotation on the login/logout/refresh path). */
function isAuthFlowPath(path) {
  return (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/logout")
  );
}

/** Coalesce concurrent 401-driven refreshes into a single in-flight rotation. */
let refreshInFlight = null;
function refreshOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession()
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * One request with transparent one-shot refresh: on a 401 from an authed endpoint,
 * rotate the cookie once and retry. Login/logout/refresh bypass the retry.
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @param {Record<string, string|undefined|null>} [headers]
 */
async function request(method, path, body, headers = {}) {
  let resp = await rawRequest(method, path, body, headers);
  if (resp.status === 401 && !isAuthFlowPath(path)) {
    if (await refreshOnce()) {
      resp = await rawRequest(method, path, body, headers);
    }
  }
  return resp;
}

/**
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @param {{ onPow?: () => void, headers?: Record<string, string|undefined|null> }} [opts]
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
 * Verify the emailed code. On success the API sets the HttpOnly session cookie and
 * returns only the expiry (the token never touches JS).
 * @param {string} email
 * @param {string} code
 * @param {() => void} [onPow]
 * @returns {Promise<{ expires_at: string }>}
 */
export async function loginVerify(email, code, onPow) {
  const resp = await requestPow(
    "POST",
    "/login/verify",
    { email, code },
    { onPow }
  );
  if (resp.status === 200 && resp.data && resp.data.expires_at) {
    return { expires_at: String(resp.data.expires_at) };
  }
  if (resp.status === 403) {
    fail(resp, "This account isn't active.");
  }
  throw new InvalidLoginCode();
}

/**
 * Rotate the HttpOnly session cookie (browser refresh). The API mints a fresh token,
 * keeps the old one valid for a short grace window, and sets the new cookie. Updates
 * the local session hint on success; a 401 means the session is gone (→ sign in).
 * @returns {Promise<{ expires_at: string }>}
 */
export async function refreshSession() {
  const resp = await rawRequest("POST", "/login/refresh", null);
  if (resp.status === 200 && resp.data && resp.data.expires_at) {
    const expiresAt = String(resp.data.expires_at);
    setSession(null, expiresAt); // keep email; bump expiry + refreshed stamp
    return { expires_at: expiresAt };
  }
  if (resp.status === 401) {
    clearSession();
  }
  fail(resp, "Your session has expired. Please sign in again.");
}

/** End this session (or every session with `everywhere`). The API clears the
 * HttpOnly cookie; the caller clears the local hint regardless.
 * @param {boolean} [everywhere] revoke all of the user's sessions
 */
export async function logout(everywhere = false) {
  const path = everywhere ? "/logout?everywhere=true" : "/logout";
  const resp = await rawRequest("POST", path, null);
  if (resp.status === 204 || resp.status === 401) {
    return;
  }
  fail(resp, "Sign-out failed.");
}

export async function getAccount() {
  const resp = await request("GET", "/account", null);
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load account.");
}

/** Signed-in devices (active login sessions), newest-active first. */
export async function getDevices() {
  const resp = await request("GET", "/account/devices", null);
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load devices.");
}

/** Live cloud sessions (ephemeral VMs), newest first. */
export async function getSessions() {
  const resp = await request("GET", "/sessions", null);
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load sessions.");
}

/** Sign out one device by its session id. @param {string} sessionId */
export async function revokeDevice(sessionId) {
  const resp = await request(
    "DELETE",
    `/account/devices/${encodeURIComponent(sessionId)}`,
    null
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not sign out device.");
}

/**
 * @param {Record<string, string|number|boolean|undefined|null>} [params]
 */
export async function getTransactions(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const path = `/account/transactions${qs ? `?${qs}` : ""}`;
  const resp = await request("GET", path, null);
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load activity.");
}

export async function provisionStorage() {
  const resp = await request("POST", "/account/provision", null);
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not provision storage.");
}

export async function getBillingProducts() {
  const resp = await request("GET", "/billing/products", null);
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load products.");
}

/**
 * @param {string} priceId
 * @param {string} requestId
 */
export async function billingCheckout(priceId, requestId) {
  const resp = await request(
    "POST",
    "/billing/checkout",
    { price_id: priceId },
    { "Idempotency-Key": requestId }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start checkout.");
}

/**
 * @param {string} priceId
 * @param {string} requestId
 */
export async function billingSubscribe(priceId, requestId) {
  const resp = await request(
    "POST",
    "/billing/subscribe",
    { price_id: priceId },
    { "Idempotency-Key": requestId }
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start subscription checkout.");
}

/**
 * @param {string} flow
 * @param {{ plan?: string }} [opts]
 */
export async function billingPortal(flow, opts = {}) {
  const body = { flow };
  if (opts.plan) {
    body.plan = opts.plan;
  }
  const resp = await request("POST", "/billing/portal", body);
  if (resp.status === 200 && resp.data && resp.data.url) {
    return resp.data;
  }
  fail(resp, "Could not open billing.");
}

/**
 * @param {Record<string, string|number|undefined|null>} [params]
 */
export async function getBillingOrders(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const resp = await request("GET", `/billing/orders${qs ? `?${qs}` : ""}`, null);
  if (resp.status === 200 && resp.data && Array.isArray(resp.data.orders)) {
    return resp.data.orders;
  }
  fail(resp, "Could not load orders.");
}

/** @param {string} orderId */
export async function getBillingOrder(orderId) {
  const resp = await request(
    "GET",
    `/billing/orders/${encodeURIComponent(orderId)}`,
    null
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load order.");
}

/** @param {string} orderId */
export async function resumeBillingOrder(orderId) {
  const resp = await request(
    "POST",
    `/billing/orders/${encodeURIComponent(orderId)}/resume`,
    null
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not resume order.");
}

/** @param {string} orderId */
export async function cancelBillingOrder(orderId) {
  const resp = await request(
    "POST",
    `/billing/orders/${encodeURIComponent(orderId)}/cancel`,
    null
  );
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not cancel order.");
}

/**
 * @param {Record<string, string|number|boolean|undefined|null>} [params]
 */
export async function getBillingInvoices(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      q.set(k, String(v));
    }
  }
  const qs = q.toString();
  const resp = await request("GET", `/billing/invoices${qs ? `?${qs}` : ""}`, null);
  if (resp.status === 200 && resp.data && Array.isArray(resp.data.invoices)) {
    // Whole envelope { invoices, capped } — the panel reads `capped` to show the
    // "older invoices live in Stripe" note when Stripe's scan cap is hit.
    return resp.data;
  }
  fail(resp, "Could not load invoices.");
}

/** @param {string} invoiceId */
export async function downloadBillingInvoice(invoiceId) {
  const resp = await request(
    "GET",
    `/billing/invoices/${encodeURIComponent(invoiceId)}/download`,
    null
  );
  if (resp.status === 200 && resp.data && resp.data.url) {
    return resp.data;
  }
  fail(resp, "Could not open invoice.");
}

export async function listTokens() {
  const resp = await request("GET", "/tokens", null);
  if (resp.status === 200 && Array.isArray(resp.data)) {
    return resp.data;
  }
  fail(resp, "Could not load API keys.");
}

/**
 * @param {string} operation create|update|delete
 * @param {{ tokenId?: number, onPow?: () => void }} [opts]
 */
export async function tokenChallenge(operation, opts = {}) {
  const body = { operation };
  if (opts.tokenId != null) {
    body.token_id = opts.tokenId;
  }
  const resp = await requestPow("POST", "/tokens/challenge", body, {
    onPow: opts.onPow,
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
 */
export async function tokenCreate(name, code, opts = {}) {
  const body = { name, code };
  if (opts.expiresAt) {
    body.expires_at = opts.expiresAt;
  }
  const resp = await requestPow("POST", "/tokens", body, { onPow: opts.onPow });
  if (resp.status === 201 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not create API key.");
}

/**
 * @param {number} tokenId
 * @param {string} code
 * @param {{ onPow?: () => void }} [opts]
 */
export async function tokenRevoke(tokenId, code, opts = {}) {
  const resp = await requestPow("DELETE", `/tokens/${tokenId}`, null, {
    onPow: opts.onPow,
    headers: { "X-Tf-Code": code },
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
 */
export async function tokenUpdate(tokenId, code, opts = {}) {
  const body = {
    code,
    expires_at: opts.clearExpiry ? null : opts.expiresAt ?? null,
  };
  const resp = await requestPow("PATCH", `/tokens/${tokenId}`, body, {
    onPow: opts.onPow,
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not update API key.");
}

/**
 * @param {string} email
 * @param {{ onPow?: () => void }} [opts]
 */
export async function emailChallenge(email, opts = {}) {
  const resp = await requestPow(
    "POST",
    "/account/email/challenge",
    { email },
    { onPow: opts.onPow }
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
 */
export async function emailStart(email, code, opts = {}) {
  const resp = await requestPow(
    "POST",
    "/account/email/start",
    { email },
    { onPow: opts.onPow, headers: { "X-Tf-Code": code } }
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not start email change.");
}

/**
 * @param {string} phase start|confirm
 * @param {{ onPow?: () => void }} [opts]
 */
export async function closeChallenge(phase, opts = {}) {
  const resp = await requestPow(
    "POST",
    "/account/close/challenge",
    { phase },
    { onPow: opts.onPow }
  );
  if (resp.status === 204) {
    return;
  }
  fail(resp, "Could not send a confirmation code.");
}

/**
 * @param {string|null} code
 * @param {{ onPow?: () => void }} [opts]
 */
export async function closeStart(code, opts = {}) {
  const resp = await requestPow("POST", "/account/close/start", null, {
    onPow: opts.onPow,
    headers: { "X-Tf-Code": code || undefined },
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not start closing account.");
}

export async function closeStatus() {
  const resp = await request("GET", "/account/close", null);
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not load close status.");
}

/**
 * @param {string} code
 * @param {{ onPow?: () => void }} [opts]
 */
export async function closeConfirm(code, opts = {}) {
  const resp = await requestPow("POST", "/account/close/confirm", null, {
    onPow: opts.onPow,
    headers: { "X-Tf-Code": code },
  });
  if (resp.status === 200 && resp.data) {
    return resp.data;
  }
  fail(resp, "Could not close account.");
}

export async function closeCancel() {
  const resp = await request("POST", "/account/close/cancel", null);
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
