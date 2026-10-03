---
name: docs-markdown
description: Use whenever a page of the site changes that agents can read as Markdown, that is anything in source/docs/machine/ or source/docs/framework/, source/_md/, a blog post, a legal page, or source/llms.txt and source/agents.md. Every content page has a Markdown version at its own path with the trailing slash dropped and .md added (the home page is /index.md); the docs are one Markdown file per part that the page includes in order.
---

# Markdown for agents

## The convention

Four files at the top of the site are special, and **everything else is an ordinary Markdown page**:

| File | What it is |
|---|---|
| `/llms.txt` | The index. It guides an agent to the Markdown pages. |
| `/agents.md` | A short overview of the site and instructions for agents. |
| `/index.md` | The Markdown version of the home page. |
| `/install.md` | A guide an agent follows to install Framework and the Machine client, with the steps only a person can do. |

`llms.txt` and `agents.md` exist **only at the top**. A folder never gets its own: the list of a folder's parts is
an ordinary page, such as `/docs/machine.md`, and the instructions for working with a product are on the product's
own page, `/framework.md` or `/machine.md`. The checker fails if either special name appears anywhere else under
`source/`. One place is easy for an agent to find and easy to move if a standard changes.

## `/install.md`: the install guide

`source/install.md` is served as it is (`skip_render` in `_config.yml`) and has no HTML page. It follows the
structure of Mintlify's install.md standard so any agent can run it: `# TestFlows`, a summary with the standard
descriptions, `## OBJECTIVE`, `## DONE WHEN`, `## TODO` (a checklist), `## Step N: ...` sections, and
`## EXECUTE NOW`. It covers the Framework (`pip3 install testflows`, a first test), the Machine client (the
installer and `machine --version`) and what only the person can do: sign up, then `machine login` or an API key.

- **To add a step**, such as installing our skills later, add a `## Step N: ...` section, a matching
  `- [ ] Step N: ...` line in the TODO list and, if it has a result to check, a line in DONE WHEN. Run every command
  in it first, in a clean environment, and write down what it prints. The checker fails if the TODO list and the
  steps differ.
- **Update it** when the install command, the supported systems, the sign-in or API key steps, or the first test
  change. Every command and environment variable in it is checked against the docs.
- It is linked from `source/llms.txt` and `source/agents.md`; the checker requires both links.
- To use it, give an agent its address, `https://testflows.com/install.md`, for example `curl -fsSL
  https://testflows.com/install.md | claude`. I did not run that exact pipe against the Claude CLI.

## Every content page has a Markdown version, at a fixed path

The path is the page's own with the trailing slash dropped and `.md` added, so anyone can guess it
and check it. The home page, `/index.md`, is the only exception.

| Page | Markdown version |
|---|---|
| `https://testflows.com/` | `https://testflows.com/index.md` |
| `https://testflows.com/framework/` | `https://testflows.com/framework.md` |
| `https://testflows.com/machine/download/` | `https://testflows.com/machine/download.md` |
| `https://testflows.com/docs/machine/` | `https://testflows.com/docs/machine.md` (the page that lists the Machine docs' parts) |
| `https://testflows.com/contact.html` | `https://testflows.com/contact.md` (`.md` in place of `.html`) |

There is one path per page: no `/folder/index.md` aliases. **Every link to a page of the site in a file agents read
(`agents.md`, `llms.txt` and the `source/_md/` pages) is a link to its `.md` version, never to the HTML
page.** The only exceptions are the pages for people to act on: the sign-up and the contact form. The checker
enforces this.

`scripts/markdown-twins.js` decides where each one comes from and publishes it. Every HTML page
points at its own with `<link rel="alternate" type="text/markdown">` and at `/llms.txt` with
`<link rel="describedby">`, and carries a hidden line for agents (`_partial/ai_markdown.ejs`). The footer
has an "AI Agents" column at the far right (`footer.ejs`): "Markdown" (this page's), "Index" (`/llms.txt`) and "Guide" (`/agents.md`).

- **Written by hand, in `source/_md/<that path>`**, for pages that are mostly HTML (`index.md`,
  `framework.md`, `machine.md`, `machine/download.md`, `docs.md`, `contact.md`) and for the pages that list
  a folder of parts: `docs/machine.md`, `docs/framework.md` and `blog.md`. Plain Markdown, with the standard
  product descriptions where it describes a product. **When one of these pages changes, update its twin in
  the same commit.** The checker compares the Download twin's code blocks with the page's; for the others,
  read the page and the twin side by side.
- **The page's own source**, for blog posts and the legal pages, which are Markdown already. Nothing to write.
  For a **new blog post, add its line to `source/_md/blog.md`**: title, one-line description and date, newest
  first, linking `https://testflows.com/blog/<file name>.md`.
- **No Markdown version:** listings (archives, tags), redirects (`handbook`, `machine/contact`,
  `machine/legal`), 404 and the portal's app pages. `NO_TWIN` in `tools/check_docs_md.py` lists them. A new page
  of that kind goes there; any other new content page needs a twin.
- A new page in `source/_md/` must be at the Markdown path of a real page, or Hexo warns that it is not published.
- **`source/llms.txt` lists the pages** (its "Pages" section) and the parts pages. Add a new twin there.
- **`source/agents.md`** says how the site is laid out and where to look. Update it when a page or an area of the
  site is added or removed.
- The Markdown files keep their Hexo tags, so each parts page says what they mean: `{% testflows %}` is
  TestFlows, `{% attention %}` starts a note, `{% katex %}` wraps math. If a new kind of tag shows up in files
  agents read, add it to that legend.

## The docs: one Markdown file per part

There is one copy of the docs text. People read it as a single page, agents read it one part at a time, and
both come from the same files, so there is nothing to keep in step.

| | Machine | Framework (the handbook) |
|---|---|---|
| Folder | `source/docs/machine/` | `source/docs/framework/` |
| Page | `/docs/machine/` | `/docs/framework/` (`/handbook/` redirects to it) |
| Parts | `overview`, `getting-started`, `disks`, `sessions`, `running-a-machine`, `checkpoints-and-branches`, `replay`, `steering-programs`, `reading-the-disk`, `account-and-billing`, `scripting`, `python-sdk` | 28 topic files such as `introduction`, `writing-tests`, `combinatorial-tests`, `controlling-output`, plus `references` |
| Page that lists the parts | `source/_md/docs/machine.md` | `source/_md/docs/framework.md` |
| Instructions for agents | on the product page: `source/_md/machine.md` | on the product page: `source/_md/framework.md` |

- **Each `<part>.md` is the text. Edit the docs there.** It starts with a note for agents,
  `<!-- agents: ... <parts page URL> -->`, then its `# Heading`. A file may hold several top-level headings,
  because the page shows each as its own entry in the Contents: `overview.md` holds "What is it?" and
  "Concepts", `introduction.md` holds six.
- **`index.md`** is the page for people: the front matter and one line per part, in page order,
  `<!-- include: overview.md -->`. Touch it only to add, remove or reorder parts.
- **`scripts/include-markdown.js`** puts the page together before Hexo renders it. It replaces each include
  line with the file's text, drops the agent note, and turns links to sibling files into links to the heading on
  the page (not inside fenced code). Hexo tags in the files work as usual. It also makes the page rebuild when an
  included file changes, which Hexo would not do alone, including while `hexo server` runs. Included files must be
  in the page's own folder.
- **`_config.yml`** has `skip_render` patterns, so the part files are served as they are, at
  `https://testflows.com/docs/<product>/<part>.md`.

### Writing a part file

- Plain Markdown. Hexo tags such as `{% attention %}` and `{% testflows %}` are fine.
- **Link to a heading in another part with the file name and the heading's id**, as in
  `[the client](getting-started.md#The-client)` or `[SDK](python-sdk.md)`. On the page that becomes `#The-client`;
  in the raw file it is a link that works. The id is what Hexo gives the heading: the text with punctuation and
  spaces turned into single hyphens, case kept (`hexo-util` `slugize`). A lower-case GitHub anchor also works. A
  link to a heading in the same file can be `#Id`.
- **Reference-style links** (`[Tree]` with `[Tree]: concepts-and-types.md#Tree-is` defined in `references.md`) are
  how the Framework docs link. The definitions live in `references.md`, which the page includes last. Add a new
  one there, as `[Name]: file.md#Id` or an external URL.
- Some ids cannot be reproduced from a heading (an explicit anchor, a heading with `--` that Hexo's smart quotes
  turn into an en dash). Those stay `#Id` page anchors: they work on the page and not in the raw file. The checker
  counts them in a note and does not fail on them in the Framework docs. In the Machine docs it does fail.
- Link to other pages of the site with site paths, such as `/machine/download/`.
- A line starting with `# ` inside example code must be inside a fenced block, even one in a blockquote, or it
  counts as a heading.

### Adding, removing, renaming or splitting a part

1. Create, delete or rename the file. Its name is its topic, lower-case with hyphens. It starts with the agent
   note, then a `# ` heading (`references.md` has none).
2. Add, remove or move its include line in `index.md`. Parts must follow page order.
3. Add, remove or rename its entry on the page that lists the parts (`source/_md/docs/<product>.md`): title, a
   one-line description, in the same order as the includes.
4. If a heading changed, find links to it: `grep -rn "<file>.md#" source/docs` and
   `grep -n "#<Id>" source/docs/<product>/*.md`.

## Keeping the files around the docs true

- If a part's scope changes so that its description on the parts page is no longer true, rewrite it.
- If the Machine docs change how to install, sign in or use API keys, the supported systems, the exit codes, or
  anything under "Mistakes to avoid" or "Cost", update the Machine page, `source/_md/machine.md`, which holds the
  instructions for agents. For the Framework, the same for install, the first test, the options and the pitfalls in
  `source/_md/framework.md`.
- Machine is in private beta, and only the sign-up page says so. Do not mention it in the docs, the twins,
  `llms.txt`, `agents.md` or the layouts; the checker fails if it appears anywhere else.
- The summary of each product is the same standard description everywhere an agent starts from: the parts page and
  the page of the product (`framework.md`, `machine.md`), the root `llms.txt` and `agents.md`, and the home and
  download twins.
  They are defined once, as `MACHINE` and `FRAMEWORK` in `tools/check_docs_md.py`. To reword one, change it there
  and then in each of those files.

## Check before you finish

You do the writing; `tools/check_docs_md.py` only checks it.

```bash
python3 tools/check_docs_md.py           # the sources
npx hexo generate
python3 tools/check_docs_md.py --built   # also the generated docs/ copy
```

It checks that:

- `llms.txt` and `agents.md` exist only at the top of `source/`;
- for each product, every `.md` file in the folder is included by `index.md`, every include exists, each part
  starts with the agent note and a heading, and its links to other parts point at files and headings that exist;
- the page that lists a product's parts lists every part once, in include order, with a description;
- the summaries use the standard descriptions, and the hand-written twins do where they describe a product;
- the Download twin's code blocks are all on the Download page, and `blog.md` lists every post;
- the Machine and Framework pages (`machine.md`, `framework.md`), which hold the instructions for agents, use only
  commands, options, variables and install lines that the docs use, and their links resolve; the Machine page is
  checked for `machine` commands and `TESTFLOWS_MACHINE_*` variables, the Framework page for options, `tfs` commands
  and the install line;
- the root files link everything they should, including `install.md`;
- `install.md` has its required sections, its TODO list matches its steps, its summary uses the standard
  descriptions, and every `machine` command, `pip3 install` line, installer command and `TESTFLOWS_MACHINE_*`
  variable in it appears in the docs;
- with `--built`, the served files equal the sources and each page has a heading for every part, so it is not
  stale; every content page has a Markdown version it points at, with no `index.md` next to it; and every
  Markdown file named in `llms.txt` or a parts page exists.

It does not check facts such as an exit code, a Python version or a supported system on those pages; read
those against the docs when either changes.

Commit the part files, `index.md`, the `source/_md/` pages, `source/llms.txt`, `source/agents.md` and
`source/install.md` you changed, and the rebuilt `docs/` together.

## If you change how the page is assembled

If you change `scripts/include-markdown.js`, or split or regroup a product, prove the page did not change. Keep
the page built before your change, rebuild with `npx hexo clean && npx hexo generate`, and compare
`docs/docs/<product>/index.html` with it. Apart from the `?v=` cache stamps, blank lines and the discovery link and
hidden line for agents, the two must be identical. The Machine and Framework pages were split this way and matched
line for line.
