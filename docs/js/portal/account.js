/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { getAccount, logout, ApiError } from "./api.js";
import { clearSession, getEmail, getToken, isSignedIn } from "./session.js";
import { setStatus, showSpinner } from "./ui.js";

const LOGIN_HREF = "/machine/portal/login/";

function $(id) {
  return document.getElementById(id);
}

async function onLogout(event) {
  event.preventDefault();
  const status = $("portal-account-status");
  const button = $("portal-account-logout");
  if (button) button.disabled = true;
  showSpinner(status, "Signing out");
  const token = getToken();
  try {
    await logout(token);
  } catch (err) {
    // Local clear always — same as CLI offline logout.
    if (!(err instanceof ApiError && err.status === 401)) {
      setStatus(
        status,
        "Couldn't reach the server. Local sign-out done. Server session may linger.",
        "err"
      );
      clearSession();
      window.setTimeout(() => {
        window.location.href = LOGIN_HREF;
      }, 1200);
      return;
    }
  }
  clearSession();
  window.location.href = LOGIN_HREF;
}

async function load() {
  if (!isSignedIn()) {
    window.location.replace(LOGIN_HREF);
    return;
  }
  const emailEl = $("portal-account-email");
  const status = $("portal-account-status");
  const cached = getEmail();
  if (emailEl && cached) {
    emailEl.textContent = cached;
  }
  showSpinner(status, "Loading account");
  try {
    const acct = await getAccount();
    setStatus(status, "", "");
    if (emailEl && acct.email) {
      emailEl.textContent = String(acct.email);
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      window.location.replace(LOGIN_HREF);
      return;
    }
    setStatus(
      status,
      err instanceof ApiError
        ? err.message
        : "Could not load account. Try again shortly.",
      "err"
    );
  }
  const logoutBtn = $("portal-account-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", onLogout);
}

load();
