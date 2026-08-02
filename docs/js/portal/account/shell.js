/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Account dashboard shell — sidebar, hash routing, sign out, section loaders. */

import { ApiError, getAccount, logout, refreshSession } from "../api.js?v=0f5c00e0c3af";
import { clearSession, getEmail, isSignedIn, refreshDue } from "../session.js?v=0f5c00e0c3af";
import { setRefreshBusy, setStatus, showSpinner } from "../ui.js?v=0f5c00e0c3af";
import { renderOverview } from "./overview.js?v=0f5c00e0c3af";
import { renderCredits } from "./credits.js?v=0f5c00e0c3af";
import { renderActivity } from "./activity.js?v=0f5c00e0c3af";
import { renderBuy } from "./buy.js?v=0f5c00e0c3af";
import { renderBilling } from "./billing.js?v=0f5c00e0c3af";
import { renderInvoices } from "./invoices.js?v=0f5c00e0c3af";
import { renderOrders } from "./orders.js?v=0f5c00e0c3af";
import { renderKeys } from "./keys.js?v=0f5c00e0c3af";
import { renderDevices } from "./devices.js?v=0f5c00e0c3af";
import { renderStorage } from "./storage.js?v=0f5c00e0c3af";
import { renderSettings } from "./settings.js?v=0f5c00e0c3af";
import { enhanceSelects } from "./select.js?v=0f5c00e0c3af";
import { todayDate } from "./format.js?v=0f5c00e0c3af";

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

/** Title + lead painted synchronously when a section opens (before any fetch). */
const SECTION_CHROME = {
  overview: {
    title: "Overview",
    lead: "Identity, plan, credits, and quotas.",
  },
  credits: {
    title: "Credits",
    lead: "Included plan balance and purchased usage credits.",
  },
  activity: {
    title: "Activity",
    lead: "Credit transactions on this account.",
  },
  buy: {
    title: "Buy",
    lead: "Subscribe to a plan or purchase usage credits.",
  },
  billing: {
    title: "Billing",
    lead: "Manage plan, payment method, and cancellation in Stripe.",
  },
  invoices: {
    title: "Invoices",
    lead: "Stripe invoices for this account.",
  },
  orders: {
    title: "Orders",
    lead: "Checkout orders — resume or cancel pending ones.",
  },
  keys: {
    title: "API keys",
    lead: "Keys for CLI and automation. Plaintext is shown once on create.",
  },
  devices: {
    title: "Devices",
    lead: "Where you're signed in. Sign out any device you don't recognize.",
  },
  storage: {
    title: "Storage",
    lead: "Provision cloud storage for images and sessions.",
  },
  settings: {
    title: "Settings",
    lead: "Change email or close this account.",
  },
};

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
 * Paint title + description immediately (panels start empty in the HTML).
 * Full render*() later replaces this with the complete section body.
 * @param {HTMLElement} panel
 * @param {string} id
 */
function paintSectionChrome(panel, id) {
  const meta = SECTION_CHROME[id];
  if (!meta) return;
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = meta.title;
  const p = document.createElement("p");
  p.textContent = meta.lead;
  head.append(h2, p);
  panel.append(head);
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
    if (!accountSections.has(id) && !force && panel.dataset.loaded === "1") {
      return;
    }

    // Title/description first — Refresh is already in static HTML; panels are not.
    paintSectionChrome(panel, id);

    // Don't block list/table views on getAccount.
    // Account-backed sections still wait; others refresh email in the background.
    if (accountSections.has(id)) {
      showSpinner(statusEl(), "Loading account");
      accountCache = await getAccount();
      setStatus(statusEl(), "", "");
      updateNavEmail(accountCache);
    } else if (!accountCache) {
      void getAccount()
        .then((acct) => {
          accountCache = acct;
          updateNavEmail(acct);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 401) {
            clearSession();
            window.location.replace(LOGIN_HREF);
          }
        });
    }

    const acct = /** @type {Record<string, unknown>} */ (accountCache || {});

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
        renderBuy(panel, acct, ctx);
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
  setRefreshBusy(true);
  accountCache = null;
  document.querySelectorAll("[data-portal-panel]").forEach((el) => {
    el.dataset.loaded = "0";
  });
  try {
    await showSection(currentSection(), true);
  } finally {
    setRefreshBusy(false);
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
