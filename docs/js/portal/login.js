/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { loginStart, loginVerify, ApiError } from "./api.js?v=9fb52a8a7f0b";
import { looksLikeEmail } from "./errors.js?v=9fb52a8a7f0b";
import { getEmail, isSignedIn, setSession } from "./session.js?v=9fb52a8a7f0b";
import { setStatus, showSpinner } from "./ui.js?v=9fb52a8a7f0b";

const ACCOUNT_HREF = "/machine/portal/account/";
const SIGNUP_HREF = "/machine/portal/signup/";

function $(id) {
  return document.getElementById(id);
}

function setBusy(busy) {
  const buttons = document.querySelectorAll(".portal-form button[type='submit']");
  buttons.forEach((b) => {
    b.disabled = busy;
  });
  const inputs = document.querySelectorAll(".portal-form input");
  inputs.forEach((i) => {
    i.disabled = busy;
  });
}

function showCodeStep() {
  const emailStep = $("portal-login-email-step");
  const codeStep = $("portal-login-code-step");
  const foot = $("portal-login-foot");
  if (emailStep) emailStep.hidden = true;
  if (codeStep) codeStep.hidden = false;
  if (foot) foot.hidden = true;
  const code = $("portal-login-code");
  if (code) {
    code.value = "";
    code.focus();
  }
}

function makePow(status, label) {
  return () => showSpinner(status, label);
}

async function onEmailSubmit(event) {
  event.preventDefault();
  const emailInput = $("portal-login-email");
  const status = $("portal-login-status");
  const email = (emailInput && emailInput.value.trim()) || "";
  if (!email) {
    setStatus(status, "Enter your email.", "err");
    return;
  }
  if (!looksLikeEmail(email)) {
    setStatus(status, "Enter a valid email address.", "err");
    return;
  }
  setBusy(true);
  showSpinner(status, "Sending a code");
  try {
    await loginStart(email, makePow(status, "Working"));
    setStatus(status, `Check ${email} for a sign-in code.`, "ok");
    showCodeStep();
  } catch (err) {
    const msg =
      err instanceof ApiError
        ? err.message
        : "Could not reach the service. Try again shortly.";
    setStatus(status, msg, "err");
  } finally {
    setBusy(false);
  }
}

async function onCodeSubmit(event) {
  event.preventDefault();
  const emailInput = $("portal-login-email");
  const codeInput = $("portal-login-code");
  const status = $("portal-login-status");
  const email = (emailInput && emailInput.value.trim()) || "";
  const code = (codeInput && codeInput.value.trim()) || "";
  if (!code) {
    setStatus(status, "Enter the code from your email.", "err");
    return;
  }
  setBusy(true);
  showSpinner(status, "Verifying code");
  try {
    const auth = await loginVerify(email, code, makePow(status, "Working"));
    // The API set the HttpOnly session cookie; store only the local UI hint.
    setSession(email, auth.expires_at);
    window.location.href = ACCOUNT_HREF;
  } catch (err) {
    const msg =
      err instanceof ApiError
        ? err.message
        : "Could not reach the service. Try again shortly.";
    setStatus(status, msg, "err");
  } finally {
    setBusy(false);
  }
}

function init() {
  if (isSignedIn()) {
    window.location.replace(ACCOUNT_HREF);
    return;
  }
  const emailInput = $("portal-login-email");
  const saved = getEmail();
  if (emailInput && saved) {
    emailInput.value = saved;
  }
  const emailForm = $("portal-login-email-form");
  const codeForm = $("portal-login-code-form");
  if (emailForm) emailForm.addEventListener("submit", onEmailSubmit);
  if (codeForm) codeForm.addEventListener("submit", onCodeSubmit);
  const signupLink = $("portal-login-signup-link");
  if (signupLink) signupLink.href = SIGNUP_HREF;
}

init();
