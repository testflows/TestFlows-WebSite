/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL. This file contains trade secrets and
 * confidential information of Katteli Inc. Unauthorized copying, disclosure,
 * distribution, or use of this file, via any medium, is strictly prohibited
 * without express written authorization from Katteli Inc.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/**
 * Build-time cache-busting for the portal ES-module graph.
 *
 * A `?v=` pin on an entry <script> does NOT propagate into the modules it imports
 * (those are fetched by bare URL), so bumping one page can ship a half-updated mix
 * — new entry + cached old `api.js` — which breaks auth. This stamps a SINGLE
 * content-hash token onto every portal `import` specifier AND every portal
 * `<script src>`, so any change to any module rewrites every portal URL together:
 * the whole graph re-fetches atomically, deterministically, with no manual pins.
 * The token hashes the portal JS content only, so it changes exactly when the code
 * changes and is identical on any build machine.
 *
 * Both HTML and JS are written to disk AFTER `after_generate`, so on-disk edits get
 * clobbered — instead we rewrite the in-memory route/content before Hexo flushes:
 *   - `after_render:html` stamps `<script src>` in page content (pre-write);
 *   - `after_generate` re-sets each portal JS route to its stamped source content.
 * Both use one token hashed from the theme's portal JS source. portal-dev / GitHub
 * Pages serve the files ignoring the query, so `?v=<hash>` is purely a cache key.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORTAL_JS_SUBDIR = path.join("js", "portal");

/** Every `.js` file under `dir`, recursively (sorted by the caller for determinism). */
function listJs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listJs(p));
    } else if (entry.name.endsWith(".js")) {
      out.push(p);
    }
  }
  return out;
}

/** Drop any existing `?v=<hex>` so hashing and stamping stay idempotent across
 * rebuilds — the token depends only on real module content. */
function stripStamp(text) {
  return text.replace(/(\.js)\?v=[0-9a-f]+/g, "$1");
}

/** One 12-hex token over ALL portal JS SOURCE (sorted, content only): any change to
 * any module changes it, so the whole graph busts together and identically per
 * machine. Computed once. Null if the source tree isn't found. */
let cachedToken;
function portalToken() {
  if (cachedToken !== undefined) {
    return cachedToken;
  }
  const srcDir = path.join(hexo.theme_dir, "source", PORTAL_JS_SUBDIR);
  const files = listJs(srcDir).sort();
  if (files.length === 0) {
    cachedToken = null;
    return cachedToken;
  }
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    hash.update(stripStamp(fs.readFileSync(file, "utf8")));
  }
  cachedToken = hash.digest("hex").slice(0, 12);
  return cachedToken;
}

/** Stamp relative `.js` import specifiers in JS source text (replacing any prior stamp). */
function stampImports(text, token) {
  return text.replace(
    /(\bfrom\s*|\bimport\s*)(["'])(\.[^"'?]*?\.js)(?:\?v=[0-9a-f]+)?\2/g,
    (_m, keyword, quote, spec) => `${keyword}${quote}${spec}?v=${token}${quote}`
  );
}

/** Stamp `<script src="/js/portal/*.js">` in HTML text (replacing any prior stamp). */
function stampScriptSrcs(text, token) {
  return text.replace(
    /(<script\b[^>]*\bsrc=")(\/js\/portal\/[^"?]*?\.js)(?:\?v=[0-9a-f]+)?(")/g,
    (_m, pre, url, post) => `${pre}${url}?v=${token}${post}`
  );
}

// Portal page <script src> — content filter, so the stamp is in the written file.
hexo.extend.filter.register("after_render:html", function (str) {
  if (!str.includes("/js/portal/")) {
    return str;
  }
  const token = portalToken();
  return token ? stampScriptSrcs(str, token) : str;
});

// Portal JS import specifiers — re-set each route to its stamped source content
// before Hexo writes routes to disk (a post-write on-disk edit would be clobbered).
hexo.extend.filter.register("after_generate", function () {
  const token = portalToken();
  if (!token) {
    return;
  }
  const srcDir = path.join(this.theme_dir, "source", PORTAL_JS_SUBDIR);
  const srcFiles = listJs(srcDir);
  for (const file of srcFiles) {
    const routePath = path.posix.join(
      "js",
      "portal",
      path.relative(srcDir, file).split(path.sep).join("/")
    );
    this.route.set(routePath, stampImports(fs.readFileSync(file, "utf8"), token));
  }
  this.log.info(`portal modules stamped ?v=${token} (${srcFiles.length} files)`);
});
