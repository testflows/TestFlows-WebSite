/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import {
  ApiError,
  cancelBillingOrder,
  getBillingOrders,
  resumeBillingOrder,
} from "../api.js?v=0f5c00e0c3af";
import { setStatus, showSpinner } from "../ui.js?v=0f5c00e0c3af";
import { compactDatetime, eur, titleCase } from "./format.js?v=0f5c00e0c3af";
import { makePager } from "./pager.js?v=0f5c00e0c3af";
import { paintEmpty } from "./table.js?v=0f5c00e0c3af";

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderOrders(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Orders";
  const p = document.createElement("p");
  p.textContent = "Checkout orders — resume or cancel pending ones.";
  head.append(h2, p);
  panel.append(head);

  const tableWrap = document.createElement("div");
  tableWrap.className = "portal-table-wrap";
  panel.append(tableWrap);

  const pager = document.createElement("nav");
  panel.append(pager);

  const PAGE_SIZE = 25;
  /** @type {number} */
  let offset = 0;

  const pg = makePager(pager, {
    onPrev: () => {
      offset = Math.max(0, offset - PAGE_SIZE);
      return load();
    },
    onNext: () => {
      offset = offset + PAGE_SIZE;
      return load();
    },
    emptyLabel: "No orders",
  });

  const load = async () => {
    showSpinner(ctx.statusEl, "Loading orders");
    try {
      // Ask for one extra row so we know whether a next page exists.
      const rows = await getBillingOrders({ limit: PAGE_SIZE + 1, offset });
      setStatus(ctx.statusEl, "", "");
      const hasNext = rows.length > PAGE_SIZE;
      const page = hasNext ? rows.slice(0, PAGE_SIZE) : rows;
      paint(page);
      pg.update({
        hasPrev: offset > 0,
        hasNext,
        from: page.length ? offset + 1 : 0,
        to: offset + page.length,
      });
    } catch (err) {
      paintEmpty(tableWrap, "No orders");
      pg.hide();
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load orders. Try again shortly.",
        "err"
      );
    }
  };

  /**
   * @param {Record<string, unknown>[]} rows
   */
  const paint = (rows) => {
    if (!rows.length) {
      paintEmpty(tableWrap, offset > 0 ? "No more orders" : "No orders");
      return;
    }
    tableWrap.replaceChildren();
    const table = document.createElement("table");
    table.className = "portal-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>When</th>
          <th>Kind</th>
          <th>Status</th>
          <th>Credits</th>
          <th></th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      const orderId = String(row.order_id || row.id || "");
      const status = String(row.status || "");
      const pending = status === "pending";
      const created = row.created_at || row.created;
      const cells = [
        created ? compactDatetime(String(created)) : "—",
        row.kind ? titleCase(String(row.kind)) : "—",
        status ? titleCase(status) : "—",
        eur(Number(row.credit_micros) || 0, 3),
      ];
      for (const text of cells) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      const act = document.createElement("td");
      act.className = "portal-table-actions";
      if (pending && orderId) {
        const resume = document.createElement("button");
        resume.type = "button";
        resume.className = "btn btn-primary btn-sm";
        resume.textContent = "Resume";
        resume.addEventListener("click", () =>
          void onResume(orderId, resume)
        );
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "btn btn-ghost btn-sm";
        cancel.textContent = "Cancel";
        cancel.addEventListener("click", () =>
          void onCancel(orderId, cancel)
        );
        act.append(resume, cancel);
      }
      tr.append(act);
      tbody.append(tr);
    }
    table.append(tbody);
    tableWrap.append(table);
  };

  /**
   * @param {string} orderId
   * @param {HTMLButtonElement} btn
   */
  const onResume = async (orderId, btn) => {
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Resuming checkout");
    try {
      const data = await resumeBillingOrder(orderId);
      const url = data.url ? String(data.url) : "";
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(ctx.statusEl, "Continue in Stripe.", "ok");
      } else {
        setStatus(ctx.statusEl, "Order resumed.", "ok");
      }
      await load();
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not resume order. Try again shortly.",
        "err"
      );
      btn.disabled = false;
    }
  };

  /**
   * @param {string} orderId
   * @param {HTMLButtonElement} btn
   */
  const onCancel = async (orderId, btn) => {
    if (!window.confirm("Cancel this pending checkout?")) {
      return;
    }
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Canceling order");
    try {
      await cancelBillingOrder(orderId);
      setStatus(ctx.statusEl, "Order canceled.", "ok");
      await load();
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not cancel order. Try again shortly.",
        "err"
      );
      btn.disabled = false;
    }
  };

  void load();
}
