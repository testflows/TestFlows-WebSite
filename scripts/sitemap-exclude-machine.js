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
 * Keep the whole /machine/* surface out of the sitemap while it is pre-release.
 *
 * The Machine product (portal, purchase, legal) has not launched. Its pages must
 * still resolve by direct URL — checkout and CLI links point at them — but must not
 * be advertised to search engines. hexo-generator-sitemap has no path-glob exclude
 * (its `skip_render` list would stop the pages rendering at all), and mutating
 * `page.sitemap` in `before_generate` is lost because Warehouse hands the generator
 * fresh Page instances. So we post-process the generated sitemap routes instead:
 * routes flush to disk AFTER `after_generate`, so re-setting them here is the final
 * word. Delete this script when Machine launches to let /machine/* into the sitemap.
 */

"use strict";

const MACHINE_PATH = "/machine/";
const SITEMAP_ROUTES = ["sitemap.xml", "sitemap.txt"];

/** Read a Hexo route's full content to a string (null if the route is absent). */
function readRoute(hexo, routePath) {
  return new Promise((resolve, reject) => {
    const stream = hexo.route.get(routePath);
    if (!stream) {
      resolve(null);
      return;
    }
    let data = "";
    stream.on("data", (chunk) => (data += chunk));
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}

/** Drop `<url>…</url>` blocks whose <loc> is under /machine/. Returns [xml, removed]. */
function stripMachineXml(xml) {
  let removed = 0;
  const out = xml.replace(/[ \t]*<url>[\s\S]*?<\/url>\n?/g, (block) => {
    if (block.includes(MACHINE_PATH)) {
      removed++;
      return "";
    }
    return block;
  });
  return [out, removed];
}

/** Drop plain-text sitemap lines under /machine/. Returns [txt, removed]. */
function stripMachineTxt(txt) {
  const kept = txt.split("\n").filter((line) => !line.includes(MACHINE_PATH));
  return [kept.join("\n"), txt.split("\n").length - kept.length];
}

hexo.extend.filter.register("after_generate", async function () {
  let removed = 0;
  for (const routePath of SITEMAP_ROUTES) {
    const content = await readRoute(this, routePath);
    if (content == null) {
      continue;
    }
    const [filtered, dropped] = routePath.endsWith(".xml")
      ? stripMachineXml(content)
      : stripMachineTxt(content);
    this.route.set(routePath, filtered);
    removed += dropped;
  }
  this.log.info(`sitemap: excluded ${removed} pre-release /machine/* entries`);
});
