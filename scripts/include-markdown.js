/*
 * Use
 *   <!-- include: overview.md -->
 *
 * on a line of its own in a page. The line is replaced by the text of that file, which
 * is looked up in the page's folder. The docs pages are written this way: each section
 * is a Markdown file of its own, so agents can fetch one section, and the page for
 * people is those files put together in the order of the includes.
 *
 * Two small changes are made to an included file so that it works in both places:
 *   - A first line like  <!-- agents: ... -->  is dropped. It is a note for an agent
 *     reading the file by itself.
 *   - A link to a sibling file, such as  [SDK](python-sdk.md)  or
 *     [the client](getting-started.md#the-client), becomes a link to the heading in the
 *     page, so the same text links correctly in the page and in the file. The same goes for a
 *     reference definition, such as  [Tree]: concepts.md#tree.
 *
 * The files are looked up in the page's own folder only: no sub-folders and no ../. The includes
 * are put together before Hexo renders the page, so Hexo tags inside the files work as they do
 * anywhere else. Links are rewritten outside fenced code only, so examples are left alone.
 *
 * Hexo only rebuilds a page when the page's own file changes, so a page that includes
 * files must count as changed when one of them does. For the page, Hexo is shown the
 * newest modification time and a combined hash of the page and its included files.
 * While `hexo server` runs, saving an included file also touches the pages that include it.
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const INCLUDE = /^<!--\s*include:\s*([\w./-]+\.md)\s*-->[ \t]*$/gm;

// The id Hexo gives a heading on the page, and the anchor GitHub gives it in a Markdown file.
const { slugize } = require('hexo-util');
const hexoId = (text) => slugize(text.trim());
const slug = (text) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

function headings(text) {
  const found = [];
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^[ \t>]*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) found.push({ level: m[1].length, text: m[2] });
  }
  return found;
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.source || !data.content || !new RegExp(INCLUDE.source, 'm').test(data.content)) {
    return data;
  }
  const dir = path.dirname(path.join(hexo.source_dir, data.source));
  const files = new Map();
  for (const m of data.content.matchAll(INCLUDE)) {
    if (m[1].includes('..') || m[1].startsWith('/') || m[1].includes('/')) {
      throw new Error(`${data.source}: an included file must be in the page's own folder: ${m[1]}`);
    }
    const file = path.join(dir, m[1]);
    if (!fs.existsSync(file)) {
      throw new Error(`${data.source}: included file not found: ${m[1]}`);
    }
    const text = fs.readFileSync(file, 'utf8').replace(/^<!--\s*agents:.*?-->[ \t]*\n+/, '');
    files.set(m[1], text.replace(/\n+$/, '\n'));
  }

  const toAnchor = (match, name, fragment) => {
    const target = files.get(name);
    if (target === undefined) return match;
    const found = headings(target);
    // A fragment is a heading's id on the page, or its lower-case GitHub anchor.
    const want = fragment ? fragment.slice(1) : '';
    const heading = fragment
      ? found.find((h) => hexoId(h.text) === want) || found.find((h) => slug(h.text) === want.toLowerCase())
      : found[0];
    if (!heading) {
      hexo.log.warn(`${data.source}: link to ${name}${fragment || ''} matches no heading`);
      return match;
    }
    return `](#${hexoId(heading.text)})`;
  };

  const toDefinition = (match, start, name, fragment) => {
    const link = toAnchor(`](${name}${fragment || ''})`, name, fragment);
    return link.startsWith('](') ? `${start}${link.slice(2, -1)}` : match;
  };
  // Rewrite links to sibling files in the prose only, not in fenced code.
  const rewrite = (text) => {
    let fence = false;
    return text.split('\n').map((line) => {
      if (/^[ \t>]*(```|~~~)/.test(line)) { fence = !fence; return line; }
      if (fence) return line;
      return line
        .replace(/\]\(([\w-]+\.md)(#[^)\s]*)?\)/g, toAnchor)
        .replace(/^(\[[^\]\n]+\]:[ \t]+)([\w-]+\.md)(#\S*)?[ \t]*$/, toDefinition);
    }).join('\n');
  };
  data.content = data.content.replace(INCLUDE, (match, name) => rewrite(files.get(name)));
  return data;
}, 1);  // priority 1: before Hexo's own filters, which turn fenced code into highlighted blocks

// --- Rebuild a page when a file it includes changes -----------------------------------

// Every Markdown page in source/ that has includes, and the files it includes.
function includers() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '_posts' || entry.name === '_drafts') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(full, 'utf8');
        const names = [...text.matchAll(INCLUDE)].map((m) => path.join(path.dirname(full), m[1]));
        if (names.length) found.push({ file: full, includes: names });
      }
    }
  };
  walk(hexo.source_dir);
  return found;
}

function touch(file) {
  const now = new Date();
  fs.utimesSync(file, now, now);
}

// For a build: show Hexo a page and its included files as one, so that changing any of
// them rebuilds the page. Hexo asks for a file's modification time and, if that changed,
// its hash, and rebuilds only if the hash changed too.
const Cache = hexo.model('Cache');
const compareFile = Cache.compareFile;
if (typeof compareFile !== 'function') {
  hexo.log.warn('include-markdown: Hexo no longer has Cache.compareFile, so a page will not rebuild when only an included file changes. Run `hexo clean` after editing parts.');
}
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');
Cache.compareFile = function (id, hashFn, statFn) {
  let files = [];
  try {
    const file = path.join(hexo.base_dir, id);
    if (id.endsWith('.md') && !id.includes('/_posts/') && !id.includes('/_drafts/')) {
      const text = fs.readFileSync(file, 'utf8');
      files = [...text.matchAll(INCLUDE)]
        .map((m) => path.join(path.dirname(file), m[1]))
        .filter((f) => fs.existsSync(f));
    }
  } catch (err) {
    hexo.log.warn(`include-markdown: could not read ${id} to look for includes: ${err.message}`);
    files = [];
  }
  if (!files.length) return compareFile.call(this, id, hashFn, statFn);
  const stat = (i) => Promise.resolve(statFn(i)).then((s) => ({
    mtime: new Date(Math.max(s.mtime.getTime(), ...files.map((f) => fs.statSync(f).mtimeMs))),
  }));
  const hash = (i) => Promise.resolve(hashFn(i)).then((h) =>
    md5(h + files.map((f) => md5(fs.readFileSync(f))).join(''))
  );
  return compareFile.call(this, id, hash, stat);
};

// While `hexo server` runs: when an included file is saved, touch the pages that include it.
hexo.source.on('processAfter', function (change) {
  if (!hexo.source.isWatching() || change.type === 'skip') return;
  const changed = path.join(hexo.source_dir, change.path);
  for (const { file, includes } of includers()) {
    if (includes.includes(changed)) touch(file);
  }
});
