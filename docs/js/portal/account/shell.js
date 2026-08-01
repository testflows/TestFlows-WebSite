/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Account dashboard shell — sidebar, hash routing, sign out, section loaders. */

import { ApiError, getAccount, logout, refreshSession } from "../api.js?v=086fa99a4287";
import { clearSession, getEmail, isSignedIn, refreshDue } from "../session.js?v=086fa99a4287";
import { setStatus, showSpinner } from "../ui.js?v=086fa99a4287";
import { renderOverview } from "./overview.js?v=086fa99a4287";
import { renderCredits } from "./credits.js?v=086fa99a4287";
import { renderActivity } from "./activity.js?v=086fa99a4287";
import { renderBuy } from "./buy.js?v=086fa99a4287";
import { renderBilling } from "./billing.js?v=086fa99a4287";
import { renderInvoices } from "./invoices.js?v=086fa99a4287";
import { renderOrders } from "./orders.js?v=086fa99a4287";
import { renderKeys } from "./keys.js?v=086fa99a4287";
import { renderDevices } from "./devices.js?v=086fa99a4287";
import { renderStorage } from "./storage.js?v=086fa99a4287";
import { renderSettings } from "./settings.js?v=086fa99a4287";
import { enhanceSelects } from "./select.js?v=086fa99a4287";
import { todayDate } from "./format.js?v=086fa99a4287";

const LOGIN_HREF = "/machine/portal/login/";

const SECTIONS = [
  "overview",
  "credits",
  "activity",
  "buy",
  "billing",
  "invoices",
  "orders",
  "keys",
  "devices",
  "storage",
  "settings",
];

/** @type {Record<string, unknown>|null} */
let accountCache = null;

function $(id) {
  return document.getElementById(id);
}

function statusEl() {
  return $("portal-account-status");
}

function currentSection() {
  const hash = (window.location.hash || "#overview").replace(/^#/, "");
  return SECTIONS.includes(hash) ? hash : "overview";
}

function setActiveNav(section) {
  document.querySelectorAll("[data-portal-nav]").forEach((el) => {
    const id = el.getAttribute("data-portal-nav");
    el.classList.toggle("is-active", id === section);
    if (el instanceof HTMLOptionElement) {
      el.selected = id === section;
    }
  });
  document.querySelectorAll("[data-portal-panel]").forEach((el) => {
    const id = el.getAttribute("data-portal-panel");
    const show = id === section;
    el.hidden = !show;
    el.classList.toggle("is-active", show);
  });
  const select = /** @type {HTMLSelectElement|null} */ ($("portal-dash-select"));
  if (select && select.value !== section) {
    select.value = section;
  }
}

/**
 * @param {string} section
 * @param {boolean} [force]
 */
async function showSection(section, force = false) {
  const id = SECTIONS.includes(section) ? section : "overview";
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", `#${id}`);
  }
  setActiveNav(id);
  const panel = document.querySelector(`[data-portal-panel="${id}"]`);
  if (!(panel instanceof HTMLElement)) {
    return;
  }
  const accountSections = new Set([
    "overview",
    "credits",
    "storage",
    "billing",
    "settings",
  ]);

  const ctx = {
    statusEl: statusEl(),
    onAccount: (acct) => {
      accountCache = acct;
      updateNavEmail(acct);
    },
  };

  try {
    if (!accountCache || accountSections.has(id)) {
      showSpinner(statusEl(), "Loading account");
      accountCache = await getAccount();
      setStatus(statusEl(), "", "");
      updateNavEmail(accountCache);
    } else if (!force && panel.dataset.loaded === "1") {
      return;
    }

    const acct = /** @type {Record<string, unknown>} */ (accountCache);

    switch (id) {
      case "overview":
        renderOverview(panel, acct);
        break;
      case "credits":
        renderCredits(panel, acct);
        break;
      case "activity":
        renderActivity(panel, ctx);
        break;
      case "buy":
        renderBuy(panel, ctx);
        break;
      case "billing":
        renderBilling(panel, acct, ctx);
        break;
      case "invoices":
        renderInvoices(panel, ctx);
        break;
      case "orders":
        renderOrders(panel, ctx);
        break;
      case "keys":
        renderKeys(panel, ctx);
        break;
      case "devices":
        renderDevices(panel, ctx);
        break;
      case "storage":
        renderStorage(panel, acct, ctx);
        break;
      case "settings":
        renderSettings(panel, acct, ctx);
        break;
      default:
        break;
    }
    panel.dataset.loaded = "1";
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      window.location.replace(LOGIN_HREF);
      return;
    }
    setStatus(
      statusEl(),
      err instanceof ApiError
        ? err.message
        : "Could not load account. Try again shortly.",
      "err"
    );
  }
}

/**
 * @param {Record<string, unknown>|null} acct
 */
function updateNavEmail(acct) {
  const el = $("portal-nav-email");
  if (!el) return;
  const email =
    (acct && acct.email && String(acct.email)) || getEmail() || "Signed in";
  el.textContent = email;
  el.setAttribute("title", email);
}

async function onLogout(event) {
  event.preventDefault();
  const button = /** @type {HTMLButtonElement|null} */ (
    $("portal-account-logout")
  );
  if (button) button.disabled = true;
  showSpinner(statusEl(), "Signing out");
  try {
    await logout();
  } catch (err) {
    if (!(err instanceof ApiError && err.status === 401)) {
      setStatus(
        statusEl(),
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

async function refreshCurrentView() {
  const btn = /** @type {HTMLButtonElement|null} */ (
    $("portal-account-refresh")
  );
  if (btn) {
    btn.disabled = true;
    btn.classList.add("is-busy");
  }
  accountCache = null;
  document.querySelectorAll("[data-portal-panel]").forEach((el) => {
    el.dataset.loaded = "0";
  });
  try {
    await showSection(currentSection(), true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("is-busy");
    }
  }
}

function bindNav() {
  document.querySelectorAll("a[data-portal-nav]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      const id = el.getAttribute("data-portal-nav") || "overview";
      window.location.hash = id;
    });
  });
  const select = /** @type {HTMLSelectElement|null} */ ($("portal-dash-select"));
  if (select) {
    select.addEventListener("change", () => {
      window.location.hash = select.value;
    });
  }
  window.addEventListener("hashchange", () => {
    void showSection(currentSection(), true);
  });
  const refreshBtn = $("portal-account-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      void refreshCurrentView();
    });
  }
  const logoutBtn = $("portal-account-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", onLogout);
  }
}

function fillDashMarkDate() {
  const el = /** @type {HTMLTimeElement|null} */ ($("portal-dash-mark-date"));
  if (!el) return;
  const now = new Date();
  el.dateTime = now.toISOString().slice(0, 10);
  el.textContent = todayDate();
}

export async function bootAccountDashboard() {
  if (!isSignedIn()) {
    window.location.replace(LOGIN_HREF);
    return;
  }
  updateNavEmail(null);
  fillDashMarkDate();
  bindNav();
  enhanceSelects(document);
  if (refreshDue()) {
    // Best-effort proactive rotation on an actively-used session; a dead session
    // just surfaces as a 401 on the first data load below, which redirects to
    // sign-in (refreshSession already cleared the hint).
    try {
      await refreshSession();
    } catch {
      /* ignore — showSection's getAccount handles a gone session */
    }
  }
  await showSection(currentSection(), true);
}
