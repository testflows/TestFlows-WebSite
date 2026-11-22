/**
 * The page a sign-up link opens when a client without a terminal, such as a
 * coding agent, asked for it: the person accepts the Agreement here, the
 * account is created, and the page shows the sign-in code the person gives
 * that client.
 *
 * The link's magic rides the URL fragment, `#m=...`, which no server is sent.
 */

import { signupAccept, termsCurrent, ApiError } from "./api.js?v=3ad7ff56b862";
import { setStatus, showSpinner } from "./ui.js?v=3ad7ff56b862";

const LINK_INVALID = "signup_link_invalid";
const ACCOUNT_EXISTS = "account_exists";
/** What an account that exists already is told: the agent signs in with it. */
const SIGN_IN_INSTEAD =
  "An account already has this address. Ask the agent to sign in with" +
  " machine login --email and your address.";

function $(id) {
  return document.getElementById(id);
}

/** The link's magic, from the fragment. */
function magicOf() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("m") || "";
}

function showCode(email, code) {
  const form = $("portal-accept-form");
  if (form) form.hidden = true;
  if (code) {
    $("portal-accept-code-value").textContent = code;
    $("portal-accept-code").hidden = false;
    setStatus($("portal-accept-status"), `Account created for ${email}.`, "ok");
  } else {
    $("portal-accept-no-code").hidden = false;
    setStatus($("portal-accept-status"), `Account created for ${email}.`, "ok");
  }
  // The code is on the page now: a reload or a back must not ask the
  // service again with a link it has spent.
  history.replaceState(null, "", window.location.pathname);
}

async function onSubmit(event, magic) {
  event.preventDefault();
  const status = $("portal-accept-status");
  const button = $("portal-accept-submit");
  const terms = $("portal-accept-terms");
  if (!terms || !terms.checked) {
    setStatus(status, "Accept the Terms of Service to create an account.", "err");
    return;
  }
  if (button) button.disabled = true;
  showSpinner(status, "Creating your account");
  try {
    // The version the page was read under is the one accepted: a newer one is
    // refused by the service, and the page says so.
    const version = await termsCurrent();
    const accepted = await signupAccept(magic, version);
    showCode(accepted.email, accepted.code);
  } catch (err) {
    let msg = "Could not reach the service. Try again shortly.";
    if (err instanceof ApiError) {
      const code = err.data && err.data.code;
      msg = code === ACCOUNT_EXISTS ? SIGN_IN_INSTEAD : err.message;
      if (code === LINK_INVALID || code === ACCOUNT_EXISTS) {
        $("portal-accept-form").hidden = true;
      }
    }
    setStatus(status, msg, "err");
    if (button) button.disabled = false;
  }
}

function init() {
  const magic = magicOf();
  const form = $("portal-accept-form");
  if (!magic) {
    if (form) form.hidden = true;
    setStatus(
      $("portal-accept-status"),
      "This page needs the link from your sign-up email. Open the link again.",
      "err",
    );
    return;
  }
  if (form) form.addEventListener("submit", (event) => onSubmit(event, magic));
}

init();
