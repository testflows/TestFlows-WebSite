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
  listTokens,
  tokenChallenge,
  tokenCreate,
  tokenRevoke,
  tokenUpdate,
} from "../api.js?v=ad83371e5d67";
import { setStatus, showSpinner } from "../ui.js?v=ad83371e5d67";
import { compactDatetime } from "./format.js?v=ad83371e5d67";
import { runStepUp } from "./stepup.js?v=ad83371e5d67";

/**
 * @param {HTMLElement} panel
 * @param {{ statusEl: HTMLElement|null }} ctx
 */
export function renderKeys(panel, ctx) {
  panel.replaceChildren();
  const head = document.createElement("header");
  head.className = "portal-panel-header";
  const h2 = document.createElement("h2");
  h2.textContent = "API keys";
  const p = document.createElement("p");
  p.textContent = "Keys for CLI and automation. Plaintext is shown once on create.";
  head.append(h2, p);
  panel.append(head);

  const createBox = document.createElement("form");
  createBox.className = "portal-inline-form";
  createBox.innerHTML = `
    <label class="portal-field portal-field--grow">
      <span>Name</span>
      <input name="name" class="form-control" type="text" required maxlength="64"
        placeholder="ci-bot" autocomplete="off" />
    </label>
    <label class="portal-field">
      <span>Expires (optional ISO)</span>
      <input name="expires" class="form-control" type="text"
        placeholder="2027-01-01T00:00:00Z" autocomplete="off" />
    </label>
    <button type="submit" class="btn btn-primary">Create key</button>
  `;
  panel.append(createBox);

  const secretBox = document.createElement("div");
  secretBox.className = "portal-secret";
  secretBox.hidden = true;
  panel.append(secretBox);

  const listHost = document.createElement("div");
  listHost.className = "portal-list-host";
  panel.append(listHost);

  const load = async () => {
    listHost.replaceChildren();
    showSpinner(ctx.statusEl, "Loading API keys");
    try {
      const rows = await listTokens();
      setStatus(ctx.statusEl, "", "");
      paint(rows);
    } catch (err) {
      listHost.replaceChildren();
      setStatus(
        ctx.statusEl,
        err instanceof ApiError
          ? err.message
          : "Could not load API keys. Try again shortly.",
        "err"
      );
    }
  };

  /**
   * @param {Record<string, unknown>[]} rows
   */
  const paint = (rows) => {
    listHost.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "portal-muted";
      empty.textContent = "No API keys yet.";
      listHost.append(empty);
      return;
    }
    const tableWrap = document.createElement("div");
    tableWrap.className = "portal-table-wrap";
    const table = document.createElement("table");
    table.className = "portal-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Created</th>
          <th>Expires</th>
          <th></th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      const id = Number(row.id);
      const name = String(row.name || "—");
      const created = row.created_at
        ? compactDatetime(String(row.created_at))
        : "—";
      const expires = row.expires_at
        ? compactDatetime(String(row.expires_at))
        : "never";
      for (const text of [name, created, expires]) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      const act = document.createElement("td");
      act.className = "portal-table-actions";
      const clearExp = document.createElement("button");
      clearExp.type = "button";
      clearExp.className = "btn btn-ghost btn-sm";
      clearExp.textContent = "Clear expiry";
      clearExp.addEventListener("click", () => void onClearExpiry(id));
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-ghost btn-sm portal-btn-danger";
      del.textContent = "Delete";
      del.addEventListener("click", () => void onDelete(id, name));
      act.append(clearExp, del);
      tr.append(act);
      tbody.append(tr);
    }
    table.append(tbody);
    tableWrap.append(table);
    listHost.append(tableWrap);
  };

  createBox.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(createBox);
    const name = String(fd.get("name") || "").trim();
    const expires = String(fd.get("expires") || "").trim();
    if (!name) return;
    secretBox.hidden = true;
    const ok = await runStepUp({
      title: "Create API key",
      hint: "We'll email a code to confirm creating this key.",
      sendCode: (onPow) => tokenChallenge("create", { onPow }),
      confirm: async (code, onPow) => {
        const created = await tokenCreate(name, code, {
          expiresAt: expires || undefined,
          onPow,
        });
        const token = String(created.token || created.access_token || "");
        if (token) {
          showSecret(token);
        }
      },
    });
    if (ok) {
      setStatus(ctx.statusEl, "API key created. Copy it now — it won't be shown again.", "ok");
      /** @type {HTMLFormElement} */ (createBox).reset();
      await load();
    }
  });

  /**
   * @param {string} token
   */
  const showSecret = (token) => {
    secretBox.hidden = false;
    secretBox.replaceChildren();
    const title = document.createElement("p");
    title.className = "portal-secret-title";
    title.textContent = "Copy this key now — it won’t be shown again.";
    const pre = document.createElement("pre");
    pre.className = "portal-secret-value";
    pre.textContent = token;
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "btn btn-ghost btn-sm";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(token);
        setStatus(ctx.statusEl, "Copied to clipboard.", "ok");
      } catch {
        setStatus(ctx.statusEl, "Select and copy the key manually.", "info");
      }
    });
    secretBox.append(title, pre, copy);
  };

  /**
   * @param {number} tokenId
   */
  const onClearExpiry = async (tokenId) => {
    const ok = await runStepUp({
      title: "Clear key expiry",
      hint: "We'll email a code to confirm this change.",
      sendCode: (onPow) =>
        tokenChallenge("update", { tokenId, onPow }),
      confirm: (code, onPow) =>
        tokenUpdate(tokenId, code, { clearExpiry: true, onPow }),
    });
    if (ok) {
      setStatus(ctx.statusEl, "Expiry cleared.", "ok");
      await load();
    }
  };

  /**
   * @param {number} tokenId
   * @param {string} name
   */
  const onDelete = async (tokenId, name) => {
    if (!window.confirm(`Delete API key “${name}”? This can’t be undone.`)) {
      return;
    }
    const ok = await runStepUp({
      title: "Delete API key",
      hint: "We'll email a code to confirm deletion.",
      sendCode: (onPow) =>
        tokenChallenge("delete", { tokenId, onPow }),
      confirm: (code, onPow) => tokenRevoke(tokenId, code, { onPow }),
    });
    if (ok) {
      setStatus(ctx.statusEl, "API key deleted.", "ok");
      await load();
    }
  };

  void load();
}
