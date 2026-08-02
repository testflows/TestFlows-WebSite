/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Previous/Next pager shared by the paginated account panels (activity, orders,
 * invoices). UI only: the panel owns paging state and data loading and passes the
 * click intents; this renders the control, disables it while a page is loading (so
 * a double-click can't skip a page), and shows a "Showing N–M" label. Offset panels
 * and the Stripe-cursor invoices panel share it — only their intent handlers differ. */

/**
 * @typedef {{ hasPrev: boolean, hasNext: boolean, from: number, to: number }} PagerState
 */

/**
 * @param {HTMLElement} host  element the pager renders into (hidden until it has rows)
 * @param {{ onPrev: () => void | Promise<void>, onNext: () => void | Promise<void>, emptyLabel?: string }} opts
 * @returns {{ update: (s: PagerState) => void, hide: () => void }}
 */
export function makePager(host, { onPrev, onNext, emptyLabel = "Nothing to show" }) {
  host.className = "portal-pager";
  host.setAttribute("aria-label", "Pages");
  host.hidden = true;

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "btn btn-default btn-sm";
  prev.textContent = "Previous";

  const label = document.createElement("span");
  label.className = "portal-pager-label";

  const next = document.createElement("button");
  next.type = "button";
  next.className = "btn btn-default btn-sm";
  next.textContent = "Next";

  host.append(prev, label, next);

  // While a page load is in flight both buttons stay disabled, so a rapid second
  // click can't fire a second fetch and skip a page. update() re-enables per state.
  let busy = false;
  /** @param {() => void | Promise<void>} fn */
  const guard = (fn) => async () => {
    if (busy) return;
    busy = true;
    prev.disabled = true;
    next.disabled = true;
    try {
      await fn();
    } finally {
      busy = false;
    }
  };
  prev.addEventListener("click", guard(onPrev));
  next.addEventListener("click", guard(onNext));

  /** @param {PagerState} s */
  const update = (s) => {
    if (!s.to && !s.hasPrev) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    prev.disabled = !s.hasPrev;
    next.disabled = !s.hasNext;
    label.textContent = s.to > 0 ? `Showing ${s.from}–${s.to}` : emptyLabel;
  };

  const hide = () => {
    host.hidden = true;
  };

  return { update, hide };
}
