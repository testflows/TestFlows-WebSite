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
