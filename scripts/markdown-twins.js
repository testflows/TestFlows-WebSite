/*
 * Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL. This file contains trade secrets and
 * confidential information of Katteli Inc. Unauthorized copying, disclosure,
 * distribution, or use of this file, via any medium, is strictly prohibited
 * without express written authorization from Katteli Inc.
 *
 * Authors:
 * Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 *
 * Every content page has a Markdown version at a path that follows from the page's own, with the
 * trailing slash dropped and .md added:
 *
 *   https://testflows.com/machine/download/   ->  https://testflows.com/machine/download.md
 *   https://testflows.com/framework/          ->  https://testflows.com/framework.md
 *   https://testflows.com/contact.html        ->  https://testflows.com/contact.md
 *   https://testflows.com/                    ->  https://testflows.com/index.md
 *
 * Where the text comes from:
 *   - source/_md/<that path>   written by hand, for pages that are mostly HTML, and for the pages
 *                              that list a folder of Markdown parts: docs/machine.md, docs/framework.md,
 *                              blog.md
 *   - the page's own source    for blog posts and legal pages, which are Markdown already
 * The only special files are at the top: /index.md, /llms.txt and /agents.md. Everything else is a
 * page like any other.
 * Pages with no Markdown version are the portal's app pages, redirects, and listings.
 *
 * markdown_twin() is used by _partial/ai_markdown.ejs, which points each page at its Markdown version.
 */
const fs = require('fs');
const path = require('path');
const { slugize } = require('hexo-util');

// The Markdown path of a page path, and the folder if the page is the front of one: {tp, folder}, or null.
//   index.html -> index.md   machine/download/index.html -> machine/download.md   contact.html -> contact.md
function twinPath(pagePath) {
  if (!pagePath) return null;
  if (pagePath === 'index.html') return { tp: 'index.md', folder: null };
  if (pagePath.endsWith('/index.html')) {
    const folder = pagePath.slice(0, -'/index.html'.length);
    return { tp: folder + '.md', folder };
  }
  if (pagePath.endsWith('/')) {
    const folder = pagePath.slice(0, -1);
    return { tp: folder + '.md', folder };
  }
  if (pagePath.endsWith('.html')) return { tp: pagePath.slice(0, -'.html'.length) + '.md', folder: null };
  return null;
}

// How a page gets its Markdown version: {tp, kind, folder}, or null if it has none.
function twinKind(page) {
  const p = page.path;
  if (!p || p.startsWith('assets') || p.startsWith('machine/portal/') || page.portal_nav) return null;
  const at = twinPath(p);
  if (!at) return null;
  const { tp, folder } = at;
  if (fs.existsSync(path.join(hexo.source_dir, '_md', tp))) return { tp, folder, kind: 'written' };
  if (page.post) return { tp, folder, kind: 'post' };
  if (page.layout === 'legal') return { tp, folder, kind: 'legal' };
  return null;
}

// The part of docs/<product>/ that holds each heading, by the id Hexo gives the heading on the page.
function partsByHeading(product) {
  const dir = path.join(hexo.source_dir, 'docs', product);
  const found = {};
  if (!fs.existsSync(dir)) return found;
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name === 'index.md') continue;
    let fence = false;
    for (const line of fs.readFileSync(path.join(dir, name), 'utf8').split('\n')) {
      if (/^[ \t>]*(```|~~~)/.test(line)) fence = !fence;
      const m = !fence && line.match(/^#{1,6}\s+(.+?)\s*$/);
      if (m) {
        const id = slugize(m[1].trim());
        if (id && !found[id]) found[id] = name.slice(0, -'.md'.length);
      }
    }
  }
  return found;
}

// In the Markdown version of a post or a legal page, a link to a page of the site is a link to that page's
// Markdown version, and a link to a heading in the docs is a link to the part that has it.
function markdownLinks(text, twins) {
  const parts = { framework: partsByHeading('framework'), machine: partsByHeading('machine') };
  // Inline links, [text](/blog/post/), and reference definitions, [text]: https://testflows.com/blog/post/
  const links = /(\]\(|^\[[^\]\n]+\]:[ \t]+)(?:https:\/\/testflows\.com)?(\/[^)\s#?]*)(#[^)\s]*)?(\)?)/gm;
  return text.replace(links, (match, open, target, fragment, close) => {
    const link = (to) => `${open}${to}${close}`;
    const at = twinPath(target.replace(/^\//, ''));
    const docs = target.match(/^\/docs\/(framework|machine)\/$/);
    if (docs && fragment) {
      const part = parts[docs[1]][fragment.slice(1)];
      if (part) return link(`/docs/${docs[1]}/${part}.md${fragment}`);
    }
    if (target === '/') return link('/index.md');
    if (at && twins.has(at.tp)) return link(`/${at.tp}`);
    return match;
  });
}

function twinText(page, { tp, kind, folder }, twins) {
  if (kind === 'written') return fs.readFileSync(path.join(hexo.source_dir, '_md', tp), 'utf8');
  const llms = hexo.config.url + '/llms.txt';
  const what = kind === 'post' ? 'a blog post' : 'a legal page';
  const note = `<!-- agents: TestFlows, ${what}. Index: ${llms} -->\n\n`;
  const body = markdownLinks((page._content || '').replace(/^\n+/, '').replace(/\n+$/, '') + '\n', twins);
  if (kind === 'post') {
    const date = page.date && page.date.format ? page.date.format('YYYY-MM-DD') : '';
    const by = page.author ? ` by ${page.author}` : '';
    return `${note}# ${page.title}\n\nPublished ${date}${by}.\n\n${body}`;
  }
  return note + body;
}

// Every file under source/_md/, as paths relative to it.
function writtenTwins() {
  const root = path.join(hexo.source_dir, '_md');
  const found = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) found.push(path.relative(root, full).split(path.sep).join('/'));
    }
  };
  walk(root);
  return found;
}

hexo.extend.generator.register('markdown_twins', function (locals) {
  const files = [];
  const seen = new Set();
  const found = [];
  for (const page of locals.pages.toArray().concat(locals.posts.toArray())) {
    const twin = twinKind(page);
    if (!twin || seen.has(twin.tp)) continue;
    seen.add(twin.tp);
    found.push({ page, twin });
  }
  for (const { page, twin } of found) files.push({ path: twin.tp, data: twinText(page, twin, seen) });
  for (const rel of writtenTwins()) {
    if (!seen.has(rel)) hexo.log.warn(`source/_md/${rel} has no page at that path, so it is not published`);
  }
  return files;
});

hexo.extend.helper.register('markdown_twin', function (page) {
  const twin = twinKind(page);
  return twin ? '/' + twin.tp : '';
});
