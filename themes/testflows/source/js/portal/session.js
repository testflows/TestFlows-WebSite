/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Portal session cookies — same access_token as CLI login/verify. */

const TOKEN_COOKIE = "tf_machine_token";
const EMAIL_COOKIE = "tf_machine_email";
const COOKIE_PATH = "/machine/portal";

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

export function getToken() {
  return readCookie(TOKEN_COOKIE);
}

export function getEmail() {
  return readCookie(EMAIL_COOKIE);
}

/**
 * @param {string} token
 * @param {string} email
 * @param {string} [expiresAt] ISO timestamp from /login/verify
 */
export function setSession(token, email, expiresAt) {
  let maxAge;
  if (expiresAt) {
    const ms = Date.parse(expiresAt) - Date.now();
    if (Number.isFinite(ms) && ms > 0) {
      maxAge = Math.floor(ms / 1000);
    }
  }
  writeCookie(TOKEN_COOKIE, token, maxAge);
  writeCookie(EMAIL_COOKIE, email, maxAge);
}

export function clearSession() {
  clearCookie(TOKEN_COOKIE);
  clearCookie(EMAIL_COOKIE);
}

export function isSignedIn() {
  return Boolean(getToken());
}
