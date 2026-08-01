/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getTransactions } from "../api.js?v=9ffe6eac4b30";
import { setStatus, showSpinner } from "../ui.js?v=9ffe6eac4b30";
import {
  compactDatetime,
  duration,
  elapsed,
  eur,
  eurSigned,
  titleCase,
} from "./format.js?v=9ffe6eac4b30";
import { enhanceSelects } from "./select.js?v=9ffe6eac4b30";

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
 * RATE — frozen hourly rate `units × unit_hour_micros`. Mirrors
 * client/core/transactions.py `_rate`.
 * @param {unknown} units
 * @param {unknown} unitHourMicros
 * @returns {string}
 */
function rate(units, unitHourMicros) {
  if (units == null || unitHourMicros == null) return "—";
  return `${eur(Number(units) * Number(unitHourMicros), 3)}/h`;
}

/**
 * DURATION — billed runtime for Settled; held interval for Reserved.
 * Mirrors client/core/transactions.py `_duration`.
 * @param {string} type
 * @param {unknown} billedSeconds
 * @param {unknown} paidFrom
 * @param {unknown} paidUntil
 * @returns {string}
 */
function rowDuration(type, billedSeconds, paidFrom, paidUntil) {
  if (type === "coverage_refund" && billedSeconds != null && billedSeconds !== "") {
    return duration(Number(billedSeconds) || 0);
  }
  if (type === "coverage_purchase" && paidFrom && paidUntil) {
    const span = elapsed(String(paidFrom), String(paidUntil));
    return span || "—";
  }
  return "—";
}

/**
 * COST — settled session charge (`billed_micros` = reserved − returned).
 * Settlement rows only. Mirrors client/core/transactions.py `_cost`.
 * @param {string} type
 * @param {unknown} billedMicros
 * @returns {string}
 */
function cost(type, billedMicros) {
  if (type === "coverage_refund" && billedMicros != null && billedMicros !== "") {
    return eur(Number(billedMicros) || 0, 3);
  }
  return "—";
}

/**
 * PERIOD — service interval or plan movement window.
 * Mirrors client/core/transactions.py `_period`.
 * @param {unknown} paidFrom
 * @param {unknown} paidUntil
 * @returns {string}
 */
function period(paidFrom, paidUntil) {
  if (!paidFrom || !paidUntil) return "—";
  return `${compactDatetime(String(paidFrom))} → ${compactDatetime(String(paidUntil))}`;
}

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
      <span>Page size</span>
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

  const pager = document.createElement("nav");
  pager.className = "portal-pager";
  pager.setAttribute("aria-label", "Activity pages");
  pager.hidden = true;
  panel.append(pager);

  /** @type {number} */
  let offset = 0;

  const pageSize = () => {
    const fd = new FormData(filters);
    return Math.max(1, Number(fd.get("limit") || 50));
  };

  /**
   * @param {{ hasPrev: boolean, hasNext: boolean, from: number, to: number }} state
   */
  const paintPager = (state) => {
    pager.replaceChildren();
    if (!state.to && !state.hasPrev) {
      pager.hidden = true;
      return;
    }
    pager.hidden = false;

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "btn btn-default btn-sm";
    prev.textContent = "Previous";
    prev.disabled = !state.hasPrev;
    prev.addEventListener("click", () => {
      offset = Math.max(0, offset - pageSize());
      void load();
    });

    const label = document.createElement("span");
    label.className = "portal-pager-label";
    label.textContent =
      state.to > 0 ? `Showing ${state.from}–${state.to}` : "No transactions";

    const next = document.createElement("button");
    next.type = "button";
    next.className = "btn btn-default btn-sm";
    next.textContent = "Next";
    next.disabled = !state.hasNext;
    next.addEventListener("click", () => {
      offset = offset + pageSize();
      void load();
    });

    pager.append(prev, label, next);
  };

  const load = async () => {
    const fd = new FormData(filters);
    const limit = pageSize();
    const activityKey = String(fd.get("activity") || "");
    showSpinner(ctx.statusEl, "Loading activity");
    try {
      /** @type {Record<string, string|number>} */
      const params = {
        // Ask for one extra row so we know whether a next page exists.
        limit: limit + 1,
        offset,
      };
      if (activityKey && ACTIVITY_FILTER[activityKey]) {
        params.activity = ACTIVITY_FILTER[activityKey];
      }
      const rows = await getTransactions(params);
      setStatus(ctx.statusEl, "", "");
      const hasNext = rows.length > limit;
      const page = hasNext ? rows.slice(0, limit) : rows;
      paint(page);
      paintPager({
        hasPrev: offset > 0,
        hasNext,
        from: page.length ? offset + 1 : 0,
        to: offset + page.length,
      });
    } catch (err) {
      tableWrap.replaceChildren();
      pager.hidden = true;
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
      empty.textContent = offset > 0 ? "No more transactions." : "No transactions yet.";
      tableWrap.append(empty);
      return;
    }
    const table = document.createElement("table");
    table.className = "portal-table portal-table--activity";
    const thead = document.createElement("thead");
    // Column order matches client/core/transactions.py `headers()`.
    thead.innerHTML = `
      <tr>
        <th>Posted</th>
        <th>Activity</th>
        <th>Credit</th>
        <th>Change</th>
        <th>Remaining</th>
        <th>Rate</th>
        <th>Duration</th>
        <th>Cost</th>
        <th>Session</th>
        <th>Period</th>
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
        rate(row.units, row.unit_hour_micros),
        rowDuration(type, row.billed_seconds, row.paid_from, row.paid_until),
        cost(type, row.billed_micros),
        String(row.session_name || row.session_id || "—"),
        period(row.paid_from, row.paid_until),
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
    offset = 0;
    void load();
  });
  void load();
}
