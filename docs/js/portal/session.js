/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Portal session HINT — NOT the credential.
 *
 * The access token lives in the HttpOnly `tf_session` cookie the API sets; JS can
 * never read it (so XSS can't steal it). These JS-readable cookies hold only
 * non-sensitive UI hints: which email is signed in, when the session token expires,
 * and when it was last refreshed — used to render "signed in as …", decide when to
 * proactively refresh, and optimistically gate the signed-in redirect. The real
 * check is always a call to the API: a 401 means signed out, whatever the hint says.
 */

const EMAIL_COOKIE = "tf_machine_email";
const EXPIRES_COOKIE = "tf_machine_expires";
const REFRESHED_COOKIE = "tf_machine_refreshed";
const COOKIE_PATH = "/machine/portal";

/** Bearer-era token cookie (pre cookie-native auth). No longer read anywhere; only
 * cleared on sign-out so a stale one doesn't linger after the migration. */
const LEGACY_TOKEN_COOKIE = "tf_machine_token";

/** Rotate an actively-used session about once a day (mirrors the CLI cadence), so a
 * long-lived browser session keeps a fresh token and a short leaked-value window. */
const REFRESH_AFTER_SECONDS = 24 * 60 * 60;

function cookieFlags(maxAgeSeconds) {
  const parts = [`Path=${COOKIE_PATH}`, "SameSite=Lax"];
  if (location.protocol === "https:") {
    parts.push("Secure");
  }
  if (typeof maxAgeSeconds === "number" && maxAgeSeconds > 0) {
    parts.push(`Max-Age=${Math.floor(maxAgeSeconds)}`);
  }
  return parts.join("; ");
}

function readCookie(name) {
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieFlags(maxAgeSeconds)}`;
}

function clearCookie(name) {
  document.cookie = `${name}=; Path=${COOKIE_PATH}; Max-Age=0; SameSite=Lax`;
}

/** Seconds until `expiresAt` (ISO), or undefined if absent/unparseable/past. */
function secondsUntil(expiresAt) {
  if (!expiresAt) {
    return undefined;
  }
  const ms = Date.parse(expiresAt) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) {
    return undefined;
  }
  return Math.floor(ms / 1000);
}

export function getEmail() {
  return readCookie(EMAIL_COOKIE);
}

/** True if a session hint is present (optimistic — the API is the source of truth). */
export function isSignedIn() {
  return Boolean(readCookie(EMAIL_COOKIE));
}

/** Record a fresh session hint after login (email known) or refresh (email kept).
 * @param {string|null} email  the signed-in email, or null to keep the existing one
 * @param {string} [expiresAt] ISO token expiry from /login/verify or /login/refresh
 */
export function setSession(email, expiresAt) {
  const maxAge = secondsUntil(expiresAt);
  if (email) {
    writeCookie(EMAIL_COOKIE, email, maxAge);
  }
  if (expiresAt) {
    writeCookie(EXPIRES_COOKIE, expiresAt, maxAge);
  }
  writeCookie(REFRESHED_COOKIE, new Date().toISOString(), maxAge);
}

/** True when the session should be proactively refreshed: older than the refresh
 * cadence, or a missing/unparseable stamp (refresh to re-establish it). */
export function refreshDue() {
  const stamp = readCookie(REFRESHED_COOKIE);
  if (!stamp) {
    return true;
  }
  const ms = Date.parse(stamp);
  if (!Number.isFinite(ms)) {
    return true;
  }
  return (Date.now() - ms) / 1000 >= REFRESH_AFTER_SECONDS;
}

export function clearSession() {
  clearCookie(EMAIL_COOKIE);
  clearCookie(EXPIRES_COOKIE);
  clearCookie(REFRESHED_COOKIE);
  clearCookie(LEGACY_TOKEN_COOKIE);
}
