import { ApiError, getTransactions } from "../api.js";
import { setStatus, showSpinner } from "../ui.js";
import {
  compactDatetime,
  duration,
  credits,
  creditsSigned,
  secondsBetween,
  titleCase,
} from "./format.js";
import { enhanceSelects } from "./select.js";
import { makePager } from "./pager.js";
import { paintEmpty } from "./table.js";

/** CLI-facing activity filter → API wire value (client/core/transactions.py). */
const ACTIVITY_FILTER = {
  included: "grant",
  charged: "purchase",
  settled: "refund",
  expired: "expired",
  "expired-removed": "forfeited",
  "credit-purchase": "credits-added",
};

const ACTIVITY_LABEL = {
  grant: "Added",
  coverage_purchase: "Charged",
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
  return `${credits(Number(units) * Number(unitHourMicros), 3)}/h`;
}

/**
 * TIME — what a row's change pays for, signed as Change is: the hour a charge
 * bought, and less the unused part a settle gives back. Mirrors
 * client/core/transactions.py `time_seconds`.
 * @param {Record<string, unknown>} row
 * @returns {string}
 */
function rowTime(row) {
  const type = String(row.type || "");
  if (!row.paid_from || !row.paid_until) return "—";
  const paid = secondsBetween(String(row.paid_from), String(row.paid_until));
  if (paid == null) return "—";
  if (type === "coverage_purchase") return duration(paid);
  if (type === "coverage_refund" && row.billed_seconds != null && row.billed_seconds !== "") {
    // Signed as Change is: a session's Time cells add up to the time it ran.
    // Nothing given back is 0s, as the CLI prints it, not -0s.
    const back = Math.max(0, paid - (Number(row.billed_seconds) || 0));
    return back > 0 ? `-${duration(back)}` : duration(back);
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
        <option value="charged">Charged</option>
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
  panel.append(pager);

  /** @type {number} */
  let offset = 0;

  const pageSize = () => {
    const fd = new FormData(filters);
    return Math.max(1, Number(fd.get("limit") || 50));
  };

  const pg = makePager(pager, {
    onPrev: () => {
      offset = Math.max(0, offset - pageSize());
      return load();
    },
    onNext: () => {
      offset = offset + pageSize();
      return load();
    },
    emptyLabel: "No transactions",
  });

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
      pg.update({
        hasPrev: offset > 0,
        hasNext,
        from: page.length ? offset + 1 : 0,
        to: offset + page.length,
      });
    } catch (err) {
      tableWrap.replaceChildren();
      pg.hide();
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
    if (!rows.length) {
      paintEmpty(
        tableWrap,
        offset > 0 ? "No more transactions" : "No transactions"
      );
      return;
    }
    tableWrap.replaceChildren();
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
        <th>Time</th>
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
        creditsSigned(Number(row.amount_micros) || 0, 3),
        credits(Number(row.balance_after_micros) || 0, 3),
        rate(row.units, row.unit_hour_micros),
        rowTime(row),
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
