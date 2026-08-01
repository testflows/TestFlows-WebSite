/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import { compactDatetime, eur } from "./format.js?v=2a7b6d21d767";

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 */
export function renderCredits(panel, account) {
  const resetsAt = account.credit_resets_at
    ? String(account.credit_resets_at)
    : "";
  const included = eur(Number(account.plan_balance_micros) || 0, 3);
  const usage = eur(Number(account.usage_credit_balance_micros) || 0, 3);
  const maxUsage = eur(Number(account.max_usage_credit_micros) || 0, 3);

  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Credits";
  const p = document.createElement("p");
  p.textContent = "Included plan balance and purchased usage credits.";
  head.append(h2, p);
  panel.append(head);

  const grid = document.createElement("div");
  grid.className = "portal-credit-cards";

  const cardIncluded = document.createElement("article");
  cardIncluded.className = "portal-credit-card";
  const h3a = document.createElement("h3");
  h3a.textContent = "Included";
  const va = document.createElement("p");
  va.className = "portal-credit-balance";
  va.textContent = included;
  const na = document.createElement("p");
  na.className = "portal-muted";
  na.textContent = resetsAt
    ? `Expires ${compactDatetime(resetsAt)}`
    : "Period end unavailable";
  cardIncluded.append(h3a, va, na);

  const cardUsage = document.createElement("article");
  cardUsage.className = "portal-credit-card";
  const h3b = document.createElement("h3");
  h3b.textContent = "Usage";
  const vb = document.createElement("p");
  vb.className = "portal-credit-balance";
  vb.textContent = usage;
  const nb = document.createElement("p");
  nb.className = "portal-muted";
  nb.textContent = `${maxUsage} max · Does not expire`;
  cardUsage.append(h3b, vb, nb);

  grid.append(cardIncluded, cardUsage);
  panel.append(grid);
}
