/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getTransactions } from "../api.js?v=0995e3ec0e4e";
import { setStatus, showSpinner } from "../ui.js?v=0995e3ec0e4e";
import { compactDatetime, eur, eurSigned, titleCase } from "./format.js?v=0995e3ec0e4e";
import { enhanceSelects } from "./select.js?v=0995e3ec0e4e";

/** CLI-facing activity filter → API wire value (client/core/transactions.py). */
const ACTIVITY_FILTER = {
  included: "grant",
  reserved: "purchase",
  settled: "refund",
  expired: "expired",
  "expired-removed": "forfeited",
  "credit-purchase": "credits-added",
};

const ACTIVITY_LABEL = {
  grant: "Added",
  coverage_purchase: "Reserved",
  coverage_refund: "Settled",
  expiration: "Expired",
  expiration_clawback: "Removed",
  usage_credits_added: "Added",
  operator_usage_adjustment: "Adjusted",
  operator_included_adjustment: "Adjusted",
};

const ACCOUNT_LABEL = {
  plan_credit: "Included",
  usage_credit: "Usage",
};

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderActivity(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Activity";
  const p = document.createElement("p");
  p.textContent = "Credit transactions on this account.";
  head.append(h2, p);
  panel.append(head);

  const filters = document.createElement("form");
  filters.className = "portal-filters";
  filters.innerHTML = `
    <label class="portal-field portal-field--inline">
      <span>Limit</span>
      <select name="limit" class="form-control portal-select">
        <option value="25">25</option>
        <option value="50" selected>50</option>
        <option value="100">100</option>
      </select>
    </label>
    <label class="portal-field portal-field--inline">
      <span>Activity</span>
      <select name="activity" class="form-control portal-select">
        <option value="">All</option>
        <option value="included">Included</option>
        <option value="reserved">Reserved</option>
        <option value="settled">Settled</option>
        <option value="expired">Expired</option>
        <option value="expired-removed">Expired removed</option>
        <option value="credit-purchase">Credit purchase</option>
      </select>
    </label>
  `;
  panel.append(filters);
  enhanceSelects(filters);

  const tableWrap = document.createElement("div");
  tableWrap.className = "portal-table-wrap";
  panel.append(tableWrap);

  const load = async () => {
    const fd = new FormData(filters);
    const limit = String(fd.get("limit") || "50");
    const activityKey = String(fd.get("activity") || "");
    showSpinner(ctx.statusEl, "Loading activity");
    try {
      /** @type {Record<string, string|number>} */
      const params = { limit: Number(limit) };
      if (activityKey && ACTIVITY_FILTER[activityKey]) {
        params.activity = ACTIVITY_FILTER[activityKey];
      }
      const rows = await getTransactions(params);
      setStatus(ctx.statusEl, "", "");
      paint(rows);
    } catch (err) {
      tableWrap.replaceChildren();
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load activity. Try again shortly.",
        "err"
      );
    }
  };

  /**
   * @param {Record<string, unknown>[]} rows
   */
  const paint = (rows) => {
    tableWrap.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "portal-muted";
      empty.textContent = "No transactions yet.";
      tableWrap.append(empty);
      return;
    }
    const table = document.createElement("table");
    table.className = "portal-table";
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Posted</th>
        <th>Activity</th>
        <th>Credit</th>
        <th>Change</th>
        <th>Remaining</th>
        <th>Session</th>
      </tr>
    `;
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      const type = String(row.type || "");
      const cells = [
        row.created_at ? compactDatetime(String(row.created_at)) : "—",
        ACTIVITY_LABEL[type] ||
          (type ? titleCase(type.replace(/_/g, " ")) : "—"),
        ACCOUNT_LABEL[String(row.account)] ||
          (row.account ? titleCase(String(row.account).replace(/_/g, " ")) : "—"),
        eurSigned(Number(row.amount_micros) || 0, 3),
        eur(Number(row.balance_after_micros) || 0, 3),
        String(row.session_name || row.session_id || "—"),
      ];
      for (const text of cells) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(thead, tbody);
    tableWrap.append(table);
  };

  filters.addEventListener("change", () => {
    void load();
  });
  void load();
}
