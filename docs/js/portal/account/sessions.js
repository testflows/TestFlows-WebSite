/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getSessions } from "../api.js?v=08f0a1b4e18a";
import { setStatus, showSpinner } from "../ui.js?v=08f0a1b4e18a";
import { elapsed, eur, secondsBetween, titleCase } from "./format.js?v=08f0a1b4e18a";
import { paintEmpty } from "./table.js?v=08f0a1b4e18a";

/** @type {Record<string, string>} */
const STATE_TONE = {
  running: "portal-tone--ok",
  provisioning: "portal-tone--warn",
  stopping: "portal-tone--warn",
  failed: "portal-tone--error",
};

/**
 * Accrued spend estimate — mirrors client/core/sessions.py `cost_so_far`.
 * @param {Record<string, unknown>} info
 * @returns {{ label: string, micros: number|null }}
 */
function costSoFar(info) {
  const micros = info.price_hour_micros;
  const started = info.started_at ? String(info.started_at) : "";
  if (micros == null || micros === "" || !started) {
    return { label: "—", micros: null };
  }
  const secs = secondsBetween(started, info.stopped_at ? String(info.stopped_at) : "");
  if (secs == null) return { label: "—", micros: null };
  const accrued = Math.round(Number(micros) * secs / 3600);
  return { label: eur(accrued, 3), micros: accrued };
}

/**
 * @param {string} state
 * @returns {HTMLElement}
 */
function stateCell(state) {
  const span = document.createElement("span");
  const key = String(state || "").toLowerCase();
  const tone = STATE_TONE[key];
  if (tone) span.className = tone;
  span.textContent = key ? titleCase(key) : "—";
  return span;
}

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderSessions(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Sessions";
  const lead = document.createElement("p");
  lead.textContent = "Active sessions and estimated cost.";
  head.append(h2, lead);
  panel.append(head);

  const block = document.createElement("section");
  block.className = "portal-block";
  const listHost = document.createElement("div");
  const summary = document.createElement("p");
  summary.className = "portal-pager-label";
  summary.hidden = true;
  block.append(listHost, summary);
  panel.append(block);

  /** @param {Record<string, unknown>[]} rows */
  const paint = (rows) => {
    listHost.replaceChildren();
    summary.hidden = true;
    if (!rows.length) {
      paintEmpty(listHost, "No sessions");
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "portal-table-wrap";
    const table = document.createElement("table");
    table.className = "portal-table portal-table--sessions";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>State</th>
          <th class="portal-num">CPUs</th>
          <th>Class</th>
          <th class="portal-num">€/hour</th>
          <th>Duration</th>
          <th class="portal-num">Cost</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    let totalMicros = 0;
    let hasCost = false;

    for (const row of rows) {
      const tr = document.createElement("tr");
      const name = String(row.name || row.session_id || "—");
      const sid = row.session_id ? String(row.session_id) : "";
      const nameTd = document.createElement("td");
      nameTd.textContent = name;
      if (sid && sid !== name) nameTd.title = sid;
      tr.append(nameTd);

      const stateTd = document.createElement("td");
      stateTd.append(stateCell(String(row.state || "")));
      tr.append(stateTd);

      const cpusTd = document.createElement("td");
      cpusTd.className = "portal-num";
      cpusTd.textContent =
        row.cpus != null && row.cpus !== "" ? String(row.cpus) : "—";
      tr.append(cpusTd);

      const classTd = document.createElement("td");
      const klass = String(row.instance_type || "").trim();
      classTd.textContent = klass ? titleCase(klass) : "—";
      tr.append(classTd);

      const priceTd = document.createElement("td");
      priceTd.className = "portal-num";
      priceTd.textContent =
        row.price_hour_micros != null && row.price_hour_micros !== ""
          ? eur(Number(row.price_hour_micros), 3)
          : "—";
      tr.append(priceTd);

      const durTd = document.createElement("td");
      const started = row.started_at ? String(row.started_at) : "";
      if (started) {
        durTd.textContent =
          elapsed(started, row.stopped_at ? String(row.stopped_at) : "") || "—";
      } else {
        durTd.textContent = "—";
      }
      tr.append(durTd);

      const cost = costSoFar(row);
      const costTd = document.createElement("td");
      costTd.className = "portal-num";
      costTd.textContent = cost.label;
      tr.append(costTd);

      if (cost.micros != null) {
        totalMicros += cost.micros;
        hasCost = true;
      }
      tbody.append(tr);
    }

    const foot = document.createElement("tfoot");
    const footTr = document.createElement("tr");
    footTr.className = "portal-table-total";
    const labelTd = document.createElement("td");
    labelTd.colSpan = 6;
    labelTd.textContent = "Total";
    const totalTd = document.createElement("td");
    totalTd.className = "portal-num";
    totalTd.textContent = hasCost ? eur(totalMicros, 3) : "—";
    footTr.append(labelTd, totalTd);
    foot.append(footTr);

    table.append(tbody, foot);
    wrap.append(table);
    listHost.append(wrap);
    const n = rows.length;
    summary.textContent = `Showing 1–${n} of ${n}`;
    summary.hidden = false;
  };

  const load = async () => {
    listHost.replaceChildren();
    summary.hidden = true;
    showSpinner(ctx.statusEl, "Loading sessions");
    try {
      const rows = await getSessions();
      setStatus(ctx.statusEl, "", "");
      paint(rows);
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError ? err.message : "Could not load sessions.",
        "err"
      );
    }
  };

  void load();
}
