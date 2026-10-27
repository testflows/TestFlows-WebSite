import { signupStart, termsCurrent, ApiError } from "./api.js?v=8383360e0c4a";
import { looksLikeEmail } from "./errors.js?v=8383360e0c4a";
import { isSignedIn } from "./session.js?v=8383360e0c4a";
import { setStatus, showSpinner } from "./ui.js?v=8383360e0c4a";

const ACCOUNT_HREF = "/machine/portal/account/";
const LOGIN_HREF = "/machine/portal/login/";

function $(id) {
  return document.getElementById(id);
}

async function onSubmit(event) {
  event.preventDefault();
  const emailInput = $("portal-signup-email");
  const status = $("portal-signup-status");
  const button = $("portal-signup-submit");
  const email = (emailInput && emailInput.value.trim()) || "";
  const terms = $("portal-signup-terms");
  if (!terms || !terms.checked) {
    setStatus(status, "Accept the Terms of Service to create an account.", "err");
    return;
  }
  if (!email) {
    setStatus(status, "Enter your email.", "err");
    return;
  }
  if (!looksLikeEmail(email)) {
    setStatus(status, "Enter a valid email address.", "err");
    return;
  }
  if (button) button.disabled = true;
  if (emailInput) emailInput.disabled = true;
  showSpinner(status, "Sending signup link");
  try {
    // The version the page was read under is the one accepted: a newer one is
    // refused by the service, and the page says so.
    const version = await termsCurrent();
    await signupStart(email, version, () => showSpinner(status, "Working"));
    setStatus(status, `Check ${email} for a link.`, "ok");
    const done = $("portal-signup-done");
    if (done) done.hidden = false;
    const form = $("portal-signup-form");
    if (form) form.hidden = true;
    const foot = $("portal-signup-foot");
    if (foot) foot.hidden = true;
  } catch (err) {
    const msg =
      err instanceof ApiError
        ? err.message
        : "Could not reach the service. Try again shortly.";
    setStatus(status, msg, "err");
    if (button) button.disabled = false;
    if (emailInput) emailInput.disabled = false;
  }
}

function init() {
  if (isSignedIn()) {
    window.location.replace(ACCOUNT_HREF);
    return;
  }
  const form = $("portal-signup-form");
  if (form) form.addEventListener("submit", onSubmit);
  const loginLink = $("portal-signup-login-link");
  if (loginLink) loginLink.href = LOGIN_HREF;
}

init();
