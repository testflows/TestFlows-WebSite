/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getDevices, logout, revokeDevice } from "../api.js?v=9fb52a8a7f0b";
import { clearSession } from "../session.js?v=9fb52a8a7f0b";
import { setStatus, showSpinner } from "../ui.js?v=9fb52a8a7f0b";
import { ago } from "./format.js?v=9fb52a8a7f0b";

const LOGIN_HREF = "/machine/portal/login/";

const UA_BROWSERS = [
  ["Edg", "Edge"],
  ["OPR", "Opera"],
  ["Chrome", "Chrome"],
  ["Firefox", "Firefox"],
  ["Safari", "Safari"],
];
// Mobile first: iOS UAs contain "like Mac OS X" and Android contains "Linux".
const UA_OSES = [
  ["iPhone", "iOS"],
  ["iPad", "iPadOS"],
  ["Android", "Android"],
  ["Windows NT", "Windows"],
  ["Mac OS X", "macOS"],
  ["Macintosh", "macOS"],
  ["Linux", "Linux"],
];
// The CLI sends `machine-cli/<platform.system()>`, e.g. `machine-cli/Linux`. Map the
// raw OS token onto the same display names the browser rows use (Darwin → macOS).
const CLI_OS_NAMES = { Darwin: "macOS" };

/** `machine-cli/Linux` → 'Client on Linux'; no OS token → 'Client'. 'Client' is
 * reserved for our own `machine` client (UA `machine-cli/<os>`) — never a browser. */
function cliClientLabel(ua) {
  const osToken = (ua.split("/")[1] || "").trim();
  if (!osToken) return "Client";
  return `Client on ${CLI_OS_NAMES[osToken] || osToken}`;
}

/** Coarse human label from a User-Agent. */
function formatDevice(ua) {
  if (!ua) return "Unknown device";
  const low = ua.toLowerCase();
  if (low.startsWith("machine-cli")) return cliClientLabel(ua);
  const browser = UA_BROWSERS.find(([t]) => ua.includes(t));
  const os = UA_OSES.find(([t]) => ua.includes(t));
  if (browser && os) return `${browser[1]} on ${os[1]}`;
  if (browser) return browser[1];
  return ua.length > 48 ? `${ua.slice(0, 48)}…` : ua;
}

/** @returns {"desktop"|"web"|"unknown"} */
function deviceKind(ua) {
  if (!ua) return "unknown";
  const low = ua.toLowerCase();
  if (low.startsWith("machine-cli")) return "desktop";
  if (UA_BROWSERS.some(([t]) => ua.includes(t))) return "web";
  return "unknown";
}

const DEVICE_KIND_ICON = {
  desktop: "fa-desktop",
  web: "fa-globe",
  unknown: "fa-circle-question",
};

/** Icon + label for the Device column. @param {string} ua @param {string} label */
function deviceLabelCell(ua, label) {
  const wrap = document.createElement("span");
  wrap.className = "portal-device-label";
  const icon = document.createElement("span");
  icon.className = `fas fa-fw ${DEVICE_KIND_ICON[deviceKind(ua)]}`;
  icon.setAttribute("aria-hidden", "true");
  const text = document.createElement("span");
  text.textContent = label;
  wrap.append(icon, text);
  return wrap;
}

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderDevices(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Devices";
  const lead = document.createElement("p");
  lead.textContent =
    "Where you're signed in. Sign out any device you don't recognize.";
  head.append(h2, lead);
  panel.append(head);

  const everywhereBlock = document.createElement("section");
  everywhereBlock.className = "portal-block portal-block--fit";
  const h3Everywhere = document.createElement("h3");
  h3Everywhere.textContent = "Sign out everywhere";
  const everywhereRow = document.createElement("div");
  everywhereRow.className = "portal-devices-everywhere";
  const everywhereNote = document.createElement("span");
  everywhereNote.textContent = "Revoke all sign-in tokens, including current";
  const everywhereBtn = document.createElement("button");
  everywhereBtn.type = "button";
  everywhereBtn.className = "btn btn-ghost btn-sm portal-btn-danger";
  everywhereBtn.textContent = "Revoke";
  everywhereBtn.addEventListener("click", () => void onRevokeAll(everywhereBtn));
  everywhereRow.append(everywhereNote, everywhereBtn);
  everywhereBlock.append(h3Everywhere, everywhereRow);
  panel.append(everywhereBlock);

  const sessionsBlock = document.createElement("section");
  sessionsBlock.className = "portal-block";
  const h3Sessions = document.createElement("h3");
  h3Sessions.textContent = "Signed-in devices";
  const listHost = document.createElement("div");
  const summary = document.createElement("p");
  summary.className = "portal-pager-label";
  summary.hidden = true;
  sessionsBlock.append(h3Sessions, listHost, summary);
  panel.append(sessionsBlock);

  /** @param {Record<string, unknown>[]} rows */
  const paint = (rows) => {
    listHost.replaceChildren();
    if (!rows.length) {
      summary.hidden = true;
      const empty = document.createElement("p");
      empty.className = "portal-muted";
      empty.textContent = "No signed-in devices.";
      listHost.append(empty);
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "portal-table-wrap";
    const table = document.createElement("table");
    table.className = "portal-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Device</th>
          <th>Host</th>
          <th>IP</th>
          <th>Last active</th>
          <th>Signed in</th>
          <th></th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      const current = Boolean(row.current);
      const ua = row.device ? String(row.device) : "";
      let label = formatDevice(ua);
      if (current) label += " · current";
      const deviceTd = document.createElement("td");
      deviceTd.append(deviceLabelCell(ua, label));
      tr.append(deviceTd);
      const cells = [
        String(row.hostname || "—"),
        String(row.ip || "—"),
        row.last_used ? ago(String(row.last_used)) : "—",
        row.started ? ago(String(row.started)) : "—",
      ];
      for (const text of cells) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      const act = document.createElement("td");
      act.className = "portal-table-actions";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-sm portal-btn-danger";
      btn.textContent = "Revoke";
      btn.addEventListener(
        "click",
        () => void onRevoke(String(row.session_id), current, btn)
      );
      act.append(btn);
      tr.append(act);
      tbody.append(tr);
    }
    table.append(tbody);
    wrap.append(table);
    listHost.append(wrap);
    const n = rows.length;
    summary.textContent = `Showing 1–${n} of ${n}`;
    summary.hidden = false;
  };

  const load = async () => {
    listHost.replaceChildren();
    summary.hidden = true;
    showSpinner(ctx.statusEl, "Loading devices");
    try {
      const rows = await getDevices();
      setStatus(ctx.statusEl, "", "");
      paint(rows);
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError ? err.message : "Could not load devices.",
        "err"
      );
    }
  };

  /** @param {string} sessionId @param {boolean} current @param {HTMLButtonElement} btn */
  const onRevoke = async (sessionId, current, btn) => {
    const ok = window.confirm(
      current
        ? "Revoke this sign-in token? You'll be signed out here."
        : "Revoke this sign-in token?"
    );
    if (!ok) return;
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Revoking token");
    try {
      await revokeDevice(sessionId);
      if (current) {
        // Revoked our own session — the cookie is dead; clear the hint and re-login.
        clearSession();
        window.location.href = LOGIN_HREF;
        return;
      }
      setStatus(ctx.statusEl, "Token revoked.", "ok");
      await load();
    } catch (err) {
      btn.disabled = false;
      setStatus(
        ctx.statusEl,
        err instanceof ApiError ? err.message : "Could not revoke token.",
        "err"
      );
    }
  };

  /** @param {HTMLButtonElement} btn */
  const onRevokeAll = async (btn) => {
    const ok = window.confirm(
      "Revoke all sign-in tokens, including this one? You'll be signed out here."
    );
    if (!ok) return;
    btn.disabled = true;
    everywhereBtn.disabled = true;
    showSpinner(ctx.statusEl, "Revoking all tokens");
    try {
      await logout(true);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) {
        setStatus(
          ctx.statusEl,
          "Couldn't reach the server. Local sign-out done. Other sessions may stay valid until they expire.",
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
  };

  void load();
}
