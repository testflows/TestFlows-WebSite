/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Value formatters — port of client/core/format.py + account fill helpers. */

/**
 * @param {number} nbytes
 * @returns {string}
 */
export function humanSize(nbytes) {
  let size = Number(nbytes) || 0;
  for (const unit of ["B", "kB", "MB", "GB", "TB"]) {
    if (size < 1000 || unit === "TB") {
      if (unit === "B") {
        return `${Math.trunc(size)}B`;
      }
      return `${String(size.toFixed(1)).replace(/\.0$/, "")}${unit}`;
    }
    size /= 1000;
  }
  return `${String(size.toFixed(1)).replace(/\.0$/, "")}TB`;
}

/**
 * @param {number} micros
 * @param {number} [dp]
 * @returns {string}
 */
export function eur(micros, dp = 2) {
  const n = Number(micros) || 0;
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v % 1_000_000 === 0) {
    return `${sign}€${v / 1_000_000}`;
  }
  let s = (v / 1_000_000).toFixed(dp).replace(/0+$/, "");
  const [intpart, frac = ""] = s.split(".");
  const f = frac.length < 2 ? frac.padEnd(2, "0") : frac;
  return `${sign}€${intpart}.${f}`;
}

/**
 * @param {number} micros
 * @param {number} [dp]
 * @returns {string}
 */
export function eurSigned(micros, dp = 2) {
  const n = Number(micros) || 0;
  if (n < 0) return `-${eur(-n, dp)}`;
  if (n > 0) return `+${eur(n, dp)}`;
  return eur(0, dp);
}

/**
 * @param {string} ts
 * @returns {Date|null}
 */
function parseDt(ts) {
  if (!ts) return null;
  // The API sends NAIVE UTC datetimes (no offset), matching the DB. JS parses a bare
  // "YYYY-MM-DDTHH:MM:SS" as LOCAL time, which skews every relative age by the viewer's
  // UTC offset (e.g. all "just now" on a machine behind UTC). Treat a naive value as
  // UTC — the same convention the CLI/TUI _parse_dt uses.
  let value = String(ts).replace(" ", "T");
  if (!/(?:Z|[+-]\d\d:?\d\d)$/i.test(value)) {
    value += "Z";
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {string} ts
 * @returns {string}
 */
export function ago(ts) {
  const dt = parseDt(ts);
  if (!dt) return String(ts || "");
  const secs = (Date.now() - dt.getTime()) / 1000;
  for (const [unit, size] of [
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ]) {
    if (secs >= size) {
      return `${Math.trunc(secs / size)}${unit} ago`;
    }
  }
  return "just now";
}

/**
 * @param {Date} d
 * @returns {string}
 */
function dateOnly(d) {
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Today's date for the sidebar mark (locale long form). */
export function todayDate() {
  return dateOnly(new Date());
}

/**
 * Title-case words (e.g. starter → Starter, active → Active).
 * @param {string} value
 * @returns {string}
 */
export function titleCase(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * @param {string} ts
 * @returns {string}
 */
export function since(ts) {
  const dt = parseDt(ts);
  if (!dt) return String(ts || "");
  return `${dateOnly(dt)} (${ago(ts)})`;
}

/**
 * Compact duration up to two units — mirrors client/core/format.py `duration`.
 * @param {number} secs
 * @returns {string}
 */
export function duration(secs) {
  let s = Math.max(0, Math.trunc(secs));
  const d = Math.trunc(s / 86400);
  s %= 86400;
  const h = Math.trunc(s / 3600);
  s %= 3600;
  const m = Math.trunc(s / 60);
  const sec = s % 60;
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

/**
 * Compact span between two ISO instants — mirrors client/core/format.py `elapsed`.
 * @param {string} startTs
 * @param {string} [endTs]
 * @returns {string}
 */
export function elapsed(startTs, endTs) {
  const start = parseDt(startTs);
  if (!start) return "";
  const end = endTs ? parseDt(endTs) : new Date();
  if (!end) return "";
  return duration((end.getTime() - start.getTime()) / 1000);
}

/**
 * @param {string} ts
 * @returns {string}
 */
export function until(ts) {
  const dt = parseDt(ts);
  if (!dt) return String(ts || "—");
  const secs = (dt.getTime() - Date.now()) / 1000;
  const remaining = secs <= 0 ? "now" : duration(secs);
  return `${dateOnly(dt)} (${remaining})`;
}

/**
 * @param {string} ts
 * @returns {string}
 */
export function compactDatetime(ts) {
  const dt = parseDt(ts);
  if (!dt) return String(ts || "");
  const now = new Date();
  const opts = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  if (dt.getFullYear() !== now.getFullYear()) {
    opts.year = "numeric";
  }
  return dt.toLocaleString(undefined, opts);
}

/**
 * @param {number} used
 * @param {number} total
 * @returns {number}
 */
export function fillPct(used, total) {
  if (!(total > 0)) return 0;
  return Math.round(Math.min(Math.max(used / total, 0), 1) * 100);
}

/**
 * @param {HTMLElement} el
 * @param {number|null|undefined} pct
 */
export function renderFillBar(el, pct) {
  if (pct == null) {
    el.replaceChildren();
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "portal-fill";
  wrap.setAttribute("role", "progressbar");
  wrap.setAttribute("aria-valuenow", String(pct));
  wrap.setAttribute("aria-valuemin", "0");
  wrap.setAttribute("aria-valuemax", "100");
  const bar = document.createElement("div");
  bar.className = "portal-fill-bar";
  bar.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
  const label = document.createElement("span");
  label.className = "portal-fill-label";
  label.textContent = `${pct}% used`;
  wrap.append(bar);
  el.replaceChildren(wrap, label);
}
