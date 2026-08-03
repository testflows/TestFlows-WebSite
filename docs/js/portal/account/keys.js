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
} from "../api.js?v=08f0a1b4e18a";
import { setStatus, showSpinner } from "../ui.js?v=08f0a1b4e18a";
import { compactDatetime, expiresWithDays } from "./format.js?v=08f0a1b4e18a";
import { runConfirm, runPrompt } from "./modal.js?v=08f0a1b4e18a";
import { runStepUp } from "./stepup.js?v=08f0a1b4e18a";

/**
 * CLI-parity expiry: positive day count → ISO UTC, or null if invalid.
 * @param {string} value
 * @returns {string|null}
 */
function expiryDaysToIso(value) {
  const raw = value.trim().toLowerCase();
  const daysToken = raw
    .replace(/ days?$/, "")
    .replace(/d$/, "");
  if (!/^\d+$/.test(daysToken)) return null;
  const days = Number(daysToken);
  if (!Number.isFinite(days) || days < 1) return null;
  const when = new Date(Date.now() + days * 86400000);
  return when.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * @param {string} value
 * @returns {string|null} error message, or null if ok
 */
function validateExpiryDays(value) {
  if (!expiryDaysToIso(value)) {
    return "Enter a number of days (e.g. 30).";
  }
  return null;
}

/**
 * Create-form expiry: blank/`never` → no expiry; else days → ISO.
 * @param {string} value
 * @returns {{ expiresAt?: string, error?: string }}
 */
function parseCreateExpiry(value) {
  const raw = value.trim().toLowerCase();
  if (!raw || raw === "never") {
    return {};
  }
  const err = validateExpiryDays(value);
  if (err) return { error: err };
  return { expiresAt: expiryDaysToIso(value) || undefined };
}

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
      <span>Expires (days)</span>
      <input name="expiry" class="form-control" type="text"
        value="never" placeholder="30" autocomplete="off" />
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
      const hasExpiry = Boolean(row.expires_at);
      const expires = hasExpiry
        ? expiresWithDays(String(row.expires_at))
        : "Never";
      for (const text of [name, created, expires]) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.append(td);
      }
      const act = document.createElement("td");
      act.className = "portal-table-actions";
      const setExp = document.createElement("button");
      setExp.type = "button";
      setExp.className = "btn btn-ghost btn-sm";
      setExp.textContent = "Set expiry";
      setExp.addEventListener("click", () => void onSetExpiry(id, name));
      act.append(setExp);
      if (hasExpiry) {
        const clearExp = document.createElement("button");
        clearExp.type = "button";
        clearExp.className = "btn btn-ghost btn-sm";
        clearExp.textContent = "Clear expiry";
        clearExp.addEventListener("click", () => void onClearExpiry(id));
        act.append(clearExp);
      }
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-ghost btn-sm portal-btn-danger";
      del.textContent = "Delete";
      del.addEventListener("click", () => void onDelete(id, name));
      act.append(del);
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
    if (!name) return;
    const parsed = parseCreateExpiry(String(fd.get("expiry") || ""));
    if (parsed.error) {
      setStatus(ctx.statusEl, parsed.error, "err");
      return;
    }
    secretBox.hidden = true;
    const ok = await runStepUp({
      title: "Create API key",
      hint: "We'll email a code to confirm creating this key.",
      sendCode: (onPow) => tokenChallenge("create", { onPow }),
      confirm: async (code, onPow) => {
        const created = await tokenCreate(name, code, {
          expiresAt: parsed.expiresAt,
          onPow,
        });
        const token = String(created.token || created.access_token || "");
        if (token) {
          showSecret(token);
        }
      },
    });
    if (ok) {
      setStatus(
        ctx.statusEl,
        "API key created. Copy it now - it won't be shown again.",
        "ok"
      );
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
    title.textContent = "Copy this key now - it won't be shown again.";
    const pre = document.createElement("pre");
    pre.className = "portal-secret-value";
    pre.textContent = token;
    const actions = document.createElement("div");
    actions.className = "portal-secret-actions";
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
    const hide = document.createElement("button");
    hide.type = "button";
    hide.className = "btn btn-ghost btn-sm";
    hide.textContent = "Hide";
    hide.addEventListener("click", () => {
      secretBox.hidden = true;
      secretBox.replaceChildren();
    });
    actions.append(copy, hide);
    secretBox.append(title, pre, actions);
  };

  /**
   * @param {number} tokenId
   * @param {string} name
   */
  const onSetExpiry = async (tokenId, name) => {
    const days = await runPrompt({
      title: "Set expiry",
      body: `How many days should “${name}” remain valid?`,
      label: "Days",
      placeholder: "30",
      confirmLabel: "Continue",
      validate: validateExpiryDays,
    });
    if (days == null) return;
    const expiresAt = expiryDaysToIso(days);
    if (!expiresAt) return;
    const ok = await runStepUp({
      title: "Set key expiry",
      hint: "We'll email a code to confirm this change.",
      sendCode: (onPow) =>
        tokenChallenge("update", { tokenId, onPow }),
      confirm: (code, onPow) =>
        tokenUpdate(tokenId, code, { expiresAt, onPow }),
    });
    if (ok) {
      setStatus(ctx.statusEl, "Expiry updated.", "ok");
      await load();
    }
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
    const proceed = await runConfirm({
      title: "Delete API key",
      body: `Delete API key “${name}”? This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!proceed) return;
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
