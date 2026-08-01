/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/**
 * Map Machine API error bodies to short developer-facing copy.
 * Used by every portal API call (see api.js fail()). Never show raw codes
 * like `invalid_request` — mirrors client/api/client.py + cli/auth.py.
 */

/** Loose check — enough to avoid a pointless API round-trip. */
export function looksLikeEmail(value) {
  const s = String(value || "").trim();
  if (!s || s.length > 254) return false;
  const at = s.indexOf("@");
  if (at < 1 || at !== s.lastIndexOf("@")) return false;
  const domain = s.slice(at + 1);
  return domain.includes(".") && !s.includes(" ");
}

/**
 * Stable API `error` strings (and a few status-only cases) → UX copy.
 * Human sentences from the API pass through unchanged (see below).
 */
const ERROR_COPY = {
  invalid_request: "Check what you entered and try again.",
  internal_error: "Something went wrong. Try again shortly.",
  proof_of_work_required: "Still working… try again in a moment.",
  "invalid or expired code": "Wrong or expired code.",
  "invalid or expired token": "Not signed in (token invalid or expired).",
  "account not active": "This account isn't active.",
  "account_closing": "Account is closing. Finish or cancel closing first.",
  "missing bearer token": "Not signed in.",
  "invalid email": "Enter a valid email address.",
  "email not allowed": "That email isn't allowed.",
  "that's already your email": "That's already your email.",
  "email already in use": "That email is already in use.",
  "account cannot change email": "Can't change email for this account.",
  "email service busy — try again shortly":
    "Email service busy. Try again shortly.",
  "too many attempts — try again later":
    "Too many attempts. Wait a bit and try again.",
  "not found": "Not found.",
  "account not found": "Account not found.",
  "account cannot start closing": "Can't start closing this account.",
  "account is not closing": "Account is not closing.",
  "account close is not ready": "Account close isn't ready yet.",
  "code required": "Enter the code from your email.",
  "invalid close phase": "Invalid close step.",
  "phase must be 'start' or 'confirm'": "Invalid close step.",
  "only login tokens can be refreshed": "Sign in again.",
  "storage not provisioned — run `machine account provision` first":
    "Storage isn't set up yet. Provision it first.",
  "storage quota exceeded — delete an image to free space":
    "Storage full. Delete an image to free space.",
};

/**
 * @param {unknown} data JSON body (`{ error: string }` or PoW challenge)
 * @param {number} [status] HTTP status
 * @param {string} [fallback]
 */
export function friendlyApiError(data, status, fallback) {
  const code =
    data && typeof data === "object" && typeof data.error === "string"
      ? data.error
      : "";

  if (code && Object.prototype.hasOwnProperty.call(ERROR_COPY, code)) {
    return ERROR_COPY[code];
  }

  // Status fallbacks when the body has no usable error string.
  if (status === 401) {
    return "Not signed in (token invalid or expired).";
  }
  if (status === 402) {
    return "Billing required for this action.";
  }
  if (status === 403) {
    // A 403 detail is authored for the token holder (e.g. the sign-up
    // allowlist, "account not active") — show a human server message verbatim,
    // fall back to generic only for a bare code / no message.
    if (code && !/^[a-z][a-z0-9_]*$/.test(code)) {
      return code;
    }
    return "Not allowed right now.";
  }
  if (status === 404) {
    return "Not found.";
  }
  if (status === 409) {
    return "That conflicts with the current state. Try again.";
  }
  if (status === 429) {
    return "Too many requests. Try again shortly.";
  }
  if (status === 502 || status === 503) {
    return "Service unavailable. Try again shortly.";
  }

  // Prefer a human-looking server string; never emit snake_case / code_ids.
  if (code && !/^[a-z][a-z0-9_]*$/.test(code)) {
    return code;
  }
  return fallback || "Something went wrong. Try again shortly.";
}

/** Network / abort / proxy failures (no HTTP response). */
export function friendlyNetworkError() {
  return "Could not reach the service. Try again shortly.";
}
