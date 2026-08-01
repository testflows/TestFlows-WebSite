/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, downloadBillingInvoice, getBillingInvoices } from "../api.js?v=5225a1fabb42";
import { setStatus, showSpinner } from "../ui.js?v=5225a1fabb42";
import { compactDatetime, eur, titleCase } from "./format.js?v=5225a1fabb42";

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderInvoices(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Invoices";
  const p = document.createElement("p");
  p.textContent = "Stripe invoices for this account.";
  head.append(h2, p);
  panel.append(head);

  const tableWrap = document.createElement("div");
  tableWrap.className = "portal-table-wrap";
  panel.append(tableWrap);

  const load = async () => {
    showSpinner(ctx.statusEl, "Loading invoices");
    try {
      const rows = await getBillingInvoices({ limit: 50 });
      setStatus(ctx.statusEl, "", "");
      paint(rows);
    } catch (err) {
      tableWrap.replaceChildren();
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load invoices. Try again shortly.",
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
      empty.textContent = "No invoices yet.";
      tableWrap.append(empty);
      return;
    }
    const table = document.createElement("table");
    table.className = "portal-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Status</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      const id = String(row.invoice_id || row.id || "");
      const created = row.created_at || row.created;
      const amount = Number(row.total_micros ?? row.amount_due_micros ?? 0);
      const status = String(row.status || "");
      const cells = [
        created ? compactDatetime(String(created)) : "—",
        status ? titleCase(status) : "—",
        eur(amount, 2),
      ];
      for (const text of cells) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      const act = document.createElement("td");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-sm";
      btn.textContent = "Open";
      btn.disabled = !id;
      btn.addEventListener("click", () => void openInvoice(id, btn));
      act.append(btn);
      tr.append(act);
      tbody.append(tr);
    }
    table.append(tbody);
    tableWrap.append(table);
  };

  /**
   * @param {string} invoiceId
   * @param {HTMLButtonElement} btn
   */
  const openInvoice = async (invoiceId, btn) => {
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Opening invoice");
    try {
      const data = await downloadBillingInvoice(invoiceId);
      const url = String(data.url || "");
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(ctx.statusEl, "Continue in Stripe.", "ok");
      } else {
        setStatus(ctx.statusEl, "Invoice link unavailable.", "err");
      }
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not open invoice. Try again shortly.",
        "err"
      );
    } finally {
      btn.disabled = false;
    }
  };

  void load();
}
