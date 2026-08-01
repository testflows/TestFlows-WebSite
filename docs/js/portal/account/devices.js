/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getDevices, revokeDevice } from "../api.js?v=3fc36f052053";
import { clearSession } from "../session.js?v=3fc36f052053";
import { setStatus, showSpinner } from "../ui.js?v=3fc36f052053";
import { ago } from "./format.js?v=3fc36f052053";

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

/** Coarse human label from a User-Agent. */
function formatDevice(ua) {
  if (!ua) return "Unknown device";
  const low = ua.toLowerCase();
  if (low.startsWith("machine-cli") || low.startsWith("python-")) {
    return "machine CLI";
  }
  const browser = UA_BROWSERS.find(([t]) => ua.includes(t));
  const os = UA_OSES.find(([t]) => ua.includes(t));
  if (browser && os) return `${browser[1]} on ${os[1]}`;
  if (browser) return browser[1];
  return ua.length > 48 ? `${ua.slice(0, 48)}…` : ua;
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
  head.append(h2);
  panel.append(head);
  const lead = document.createElement("p");
  lead.className = "portal-muted";
  lead.textContent =
    "Where you're signed in. Sign out any device you don't recognize.";
  panel.append(lead);

  const listHost = document.createElement("div");
  panel.append(listHost);

  /** @param {Record<string, unknown>[]} rows */
  const paint = (rows) => {
    listHost.replaceChildren();
    if (!rows.length) {
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
      let label = formatDevice(row.device ? String(row.device) : "");
      if (current) label += " · this device";
      const cells = [
        label,
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
      btn.textContent = "Sign out";
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
  };

  const load = async () => {
    listHost.replaceChildren();
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
        ? "Sign out this device? You'll be signed out here."
        : "Sign out this device?"
    );
    if (!ok) return;
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Signing out device");
    try {
      await revokeDevice(sessionId);
      if (current) {
        // Revoked our own session — the cookie is dead; clear the hint and re-login.
        clearSession();
        window.location.href = "/machine/portal/login/";
        return;
      }
      setStatus(ctx.statusEl, "Device signed out.", "ok");
      await load();
    } catch (err) {
      btn.disabled = false;
      setStatus(
        ctx.statusEl,
        err instanceof ApiError ? err.message : "Could not sign out device.",
        "err"
      );
    }
  };

  void load();
}
