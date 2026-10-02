/**
 * List each page's Markdown version in the sitemap beside the page, so crawlers find the
 * Markdown as well as llms.txt and the pages' rel="alternate" links do.
 *
 * Only versions the build actually produced are listed: the Markdown path follows from the
 * page's path, as in markdown-twins.js, and is listed only if that route exists. A page kept
 * out of the sitemap, by `sitemap: false`, keeps its Markdown version out too.
 *
 * Markdown with no page of its own is listed too: install.md, agents.md and the docs' parts,
 * such as docs/framework/writing-tests.md.
 */

"use strict";

const SITEMAP_XML = "sitemap.xml";
const SITEMAP_TXT = "sitemap.txt";

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

/** The site-relative Markdown path of a page URL, or null: / -> index.md,
 * /framework/ -> framework.md, /contact.html -> contact.md. */
function twinRoute(url, root) {
  if (!url.startsWith(root)) return null;
  const rel = decodeURI(url.slice(root.length)).replace(/^\//, "");
  if (rel === "" || rel === "index.html") return "index.md";
  if (rel.endsWith("/index.html")) return rel.slice(0, -"/index.html".length) + ".md";
  if (rel.endsWith("/")) return rel.slice(0, -1) + ".md";
  if (rel.endsWith(".html")) return rel.slice(0, -".html".length) + ".md";
  return null;
}

/** The Markdown version's URL for a page URL, if the build produced one; else null. */
function twinUrl(url, root, routes) {
  const route = twinRoute(url, root);
  return route && routes.has(route) ? root.replace(/\/$/, "") + "/" + encodeURI(route) : null;
}

/** Add a <url> block for each listed page's Markdown version. Returns [xml, added]. */
function addTwinsXml(xml, root, routes) {
  const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  let added = 0;
  const out = xml.replace(/([ \t]*)<url>([\s\S]*?)<\/url>\n?/g, (block, indent, body) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(body);
    const twin = loc && twinUrl(loc[1], root, routes);
    if (!twin || listed.has(twin)) return block;
    listed.add(twin);
    added++;
    return block + block.replace(loc[0], `<loc>${twin}</loc>`);
  });
  return [out, added];
}

/** The Markdown routes of pages kept out of the sitemap by `sitemap: false`. */
function hiddenTwins(hexo, root) {
  const hidden = new Set();
  for (const kind of ["pages", "posts"]) {
    hexo.locals.get(kind).forEach((page) => {
      const route = page.sitemap === false && twinRoute(page.permalink, root);
      if (route) hidden.add(route);
    });
  }
  return hidden;
}

/** The public Markdown routes the sitemap does not list yet, as URLs. */
function unlistedMarkdown(root, routes, listed, hidden) {
  return [...routes]
    .filter((r) => r.endsWith(".md") && !hidden.has(r))
    .map((r) => root + encodeURI(r))
    .filter((url) => !listed.has(url))
    .sort();
}

/** Add a <url> block for each Markdown file that has no page of its own. */
function addUnlistedXml(xml, root, routes, hidden, now) {
  const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const urls = unlistedMarkdown(root, routes, listed, hidden);
  const blocks = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`)
    .join("");
  return [xml.replace("</urlset>", blocks + "</urlset>"), urls.length];
}

/** Add a line for each Markdown file that has no page of its own. */
function addUnlistedTxt(txt, root, routes, hidden) {
  const listed = new Set(txt.split("\n"));
  const urls = unlistedMarkdown(root, routes, listed, hidden);
  return [txt.replace(/\n*$/, "\n") + urls.map((u) => u + "\n").join(""), urls.length];
}

/** Add a line for each listed page's Markdown version. Returns [txt, added]. */
function addTwinsTxt(txt, root, routes) {
  const lines = txt.split("\n");
  const listed = new Set(lines);
  const out = [];
  let added = 0;
  for (const line of lines) {
    out.push(line);
    const twin = line && twinUrl(line.trim(), root, routes);
    if (twin && !listed.has(twin)) {
      listed.add(twin);
      out.push(twin);
      added++;
    }
  }
  return [out.join("\n"), added];
}

hexo.extend.filter.register(
  "after_generate",
  async function () {
    const root = this.config.url.replace(/\/$/, "") + "/";
    const routes = new Set(this.route.list());
    const now = new Date().toISOString();
    const hidden = hiddenTwins(this, root);
    let twins = 0;
    let unlisted = 0;
    for (const routePath of [SITEMAP_XML, SITEMAP_TXT]) {
      const content = await readRoute(this, routePath);
      if (content == null) continue;
      const xml = routePath === SITEMAP_XML;
      const [withTwins, twinCount] = xml
        ? addTwinsXml(content, root, routes)
        : addTwinsTxt(content, root, routes);
      const [complete, unlistedCount] = xml
        ? addUnlistedXml(withTwins, root, routes, hidden, now)
        : addUnlistedTxt(withTwins, root, routes, hidden);
      this.route.set(routePath, complete);
      if (xml) {
        twins = twinCount;
        unlisted = unlistedCount;
      }
    }
    this.log.info(`sitemap: listed ${twins} Markdown versions beside their pages and ${unlisted} Markdown-only files`);
  }
);
