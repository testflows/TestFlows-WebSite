/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Shared empty-state row for account list panels (table body only — no header). */

/**
 * Show one muted table row (no column headers).
 * @param {HTMLElement} host
 * @param {string} message
 * @param {string} [tableClass]
 */
export function paintEmpty(host, message, tableClass = "portal-table") {
  host.replaceChildren();
  const table = document.createElement("table");
  table.className = tableClass;
  const tbody = document.createElement("tbody");
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.className = "portal-table-empty";
  td.textContent = message;
  tr.append(td);
  tbody.append(tr);
  table.append(tbody);
  host.append(table);
}
