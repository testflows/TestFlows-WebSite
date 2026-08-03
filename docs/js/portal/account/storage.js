/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { ApiError, getAccount, provisionStorage } from "../api.js?v=9943371cc422";
import { setStatus, showSpinner } from "../ui.js?v=9943371cc422";
import { fillPct, humanSize, renderFillBar } from "./format.js?v=9943371cc422";

const POLL_MS = 2500;
const MAX_POLLS = 40;

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 * @param {{ statusEl: HTMLElement|null, onAccount?: (a: Record<string, unknown>) => void }} ctx
 */
export function renderStorage(panel, account, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Storage";
  const p = document.createElement("p");
  p.textContent = "Provision cloud storage for images and sessions.";
  head.append(h2, p);
  panel.append(head);

  const body = document.createElement("div");
  body.className = "portal-block";
  panel.append(body);

  const paint = (acct) => {
    body.replaceChildren();
    const provisioned = Boolean(acct.provisioned);
    if (provisioned) {
      const used = Number(acct.storage_used_bytes) || 0;
      const total = Number(acct.storage_bytes) || 0;
      const dl = document.createElement("dl");
      dl.className = "portal-dl";

      const statusDt = document.createElement("dt");
      statusDt.textContent = "Status";
      const statusDd = document.createElement("dd");
      const pill = document.createElement("span");
      pill.className = "portal-pill portal-pill--ok";
      pill.textContent = "Ready";
      statusDd.append(pill);

      const dt = document.createElement("dt");
      dt.textContent = "Storage";
      const dd = document.createElement("dd");
      const val = document.createElement("span");
      val.className = "portal-dl-value";
      val.textContent = total > 0 ? humanSize(total) : humanSize(0);
      dd.append(val);
      if (total > 0) {
        const fillEl = document.createElement("div");
        fillEl.className = "portal-dl-fill";
        renderFillBar(fillEl, fillPct(used, total));
        dd.append(fillEl);
      }
      const usedDt = document.createElement("dt");
      usedDt.textContent = "Used";
      const usedDd = document.createElement("dd");
      usedDd.textContent = humanSize(used);
      dl.append(statusDt, statusDd, dt, dd, usedDt, usedDd);
      body.append(dl);
      return;
    }

    const note = document.createElement("p");
    note.textContent =
      "Storage isn’t set up on this account yet. Provisioning usually takes a minute.";
    body.append(note);
    const actions = document.createElement("div");
    actions.className = "portal-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary";
    btn.textContent = "Provision storage";
    btn.addEventListener("click", () => void provision(btn));
    actions.append(btn);
    body.append(actions);
  };

  const provision = async (btn) => {
    btn.disabled = true;
    showSpinner(ctx.statusEl, "Provisioning storage");
    try {
      let result = await provisionStorage();
      let polls = 0;
      while (
        result &&
        (result.status === "in_progress" || !result.provisioned) &&
        polls < MAX_POLLS
      ) {
        showSpinner(ctx.statusEl, "Provisioning storage");
        await new Promise((r) => setTimeout(r, POLL_MS));
        result = await provisionStorage();
        polls += 1;
        if (result.provisioned || result.status === "provisioned") {
          break;
        }
      }
      const acct = await getAccount();
      if (ctx.onAccount) {
        ctx.onAccount(acct);
      }
      paint(acct);
      if (acct.provisioned) {
        setStatus(ctx.statusEl, "Storage is ready.", "ok");
      } else {
        setStatus(
          ctx.statusEl,
          "Still provisioning. Try again in a moment.",
          "info"
        );
      }
    } catch (err) {
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not provision storage. Try again shortly.",
        "err"
      );
    } finally {
      btn.disabled = false;
    }
  };

  paint(account);
}
