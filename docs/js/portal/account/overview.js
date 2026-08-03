/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
import {
  eur,
  fillPct,
  humanSize,
  renderFillBar,
  since,
  titleCase,
  until,
} from "./format.js?v=0b7804b627a3";

/**
 * @param {HTMLElement} panel
 * @param {Record<string, unknown>} account
 */
export function renderOverview(panel, account) {
  const status = String(account.status || "");
  const active = status === "active";
  const creditTotal = Number(account.credit_micros) || 0;
  const creditUsed = Number(account.used_credit_micros) || 0;
  const resetsAt = account.credit_resets_at
    ? String(account.credit_resets_at)
    : "";
  const sessionsTotal = Number(account.max_sessions) || 0;
  const sessionsUsed = Number(account.sessions_used) || 0;
  const imagesTotal = Number(account.max_images) || 0;
  const imagesUsed = Number(account.images_used) || 0;
  const apiKeysTotal = Number(account.max_api_keys) || 0;
  const apiKeysUsed = Number(account.api_keys_used) || 0;
  const provisioned = Boolean(account.provisioned);

  /** @type {{ title: string, rows: { label: string, value: string, tone?: string, fill?: number|null }[] }[]} */
  const sections = [
    {
      title: "Account",
      rows: [
        { label: "Email", value: String(account.email || ""), tone: "name" },
        {
          label: "Status",
          value: titleCase(status),
          tone: active ? "ok" : "error",
        },
        { label: "Plan", value: titleCase(String(account.tier || "")) },
        {
          label: "Created",
          value: account.created_at ? since(String(account.created_at)) : "—",
        },
      ],
    },
    {
      title: "Credits",
      rows: [
        {
          label: "Plan",
          value: eur(Number(account.plan_balance_micros) || 0, 3),
          fill: fillPct(creditUsed, creditTotal),
        },
        {
          label: "Renewal",
          value: resetsAt ? until(resetsAt) : "—",
        },
        {
          label: "Usage",
          value: eur(Number(account.usage_credit_balance_micros) || 0, 3),
        },
      ],
    },
    {
      title: "Quotas",
      rows: [
        {
          label: "Usage",
          value: eur(Number(account.max_usage_credit_micros) || 0, 3),
        },
        {
          label: "Sessions",
          value:
            sessionsTotal > 0 ? String(sessionsTotal) : String(sessionsUsed),
          fill: sessionsTotal > 0 ? fillPct(sessionsUsed, sessionsTotal) : null,
        },
        provisioned
          ? {
              label: "Storage",
              value: humanSize(Number(account.storage_bytes) || 0),
              fill:
                Number(account.storage_bytes) > 0
                  ? fillPct(
                      Number(account.storage_used_bytes) || 0,
                      Number(account.storage_bytes) || 0
                    )
                  : null,
            }
          : {
              label: "Storage",
              value: "not provisioned",
              tone: "warn",
            },
        {
          label: "Images",
          value: imagesTotal > 0 ? String(imagesTotal) : String(imagesUsed),
          fill: imagesTotal > 0 ? fillPct(imagesUsed, imagesTotal) : null,
        },
        {
          label: "Image",
          value: humanSize(Number(account.max_image_bytes) || 0),
        },
        {
          label: "API keys",
          value: apiKeysTotal > 0 ? String(apiKeysTotal) : String(apiKeysUsed),
          fill: apiKeysTotal > 0 ? fillPct(apiKeysUsed, apiKeysTotal) : null,
        },
      ],
    },
  ];

  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "Overview";
  const p = document.createElement("p");
  p.textContent = "Identity, plan, credits, and quotas.";
  head.append(h2, p);
  panel.append(head);

  if (!provisioned) {
    const warn = document.createElement("div");
    warn.className = "portal-banner portal-banner--warn";
    warn.textContent =
      "Storage isn’t provisioned yet. Open Storage to set it up.";
    panel.append(warn);
  }

  for (const sec of sections) {
    const block = document.createElement("section");
    block.className = "portal-block";
    const h3 = document.createElement("h3");
    h3.textContent = sec.title;
    block.append(h3);
    const dl = document.createElement("dl");
    dl.className = "portal-dl";
    for (const row of sec.rows) {
      const dt = document.createElement("dt");
      dt.textContent = row.label;
      const dd = document.createElement("dd");
      const val = document.createElement("span");
      val.className = "portal-dl-value";
      if (row.tone) {
        val.classList.add(`portal-tone--${row.tone}`);
      }
      val.textContent = row.value;
      dd.append(val);
      if (row.fill != null) {
        const fillEl = document.createElement("div");
        fillEl.className = "portal-dl-fill";
        renderFillBar(fillEl, row.fill);
        dd.append(fillEl);
      }
      dl.append(dt, dd);
    }
    block.append(dl);
    panel.append(block);
  }
}
