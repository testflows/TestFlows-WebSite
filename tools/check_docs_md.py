#!/usr/bin/env python3
"""Check the structure of the docs and the files agents start from.

The Machine docs (source/docs/machine/) and the Framework docs (source/docs/framework/)
are Markdown files, one per part. The page for people, index.md in each folder, includes
them in order with lines like

    <!-- include: overview.md -->

and the same files are served as they are to agents. There is one copy of the text, so
there is nothing to keep in step. This script checks what can still go wrong:

  - every file in a folder is included, and every include exists;
  - each file has the agent note and a heading, and its links to other files work;
  - each docs page that lists the parts (docs/machine.md and docs/framework.md) lists every
    file, in the same order, with a description;
  - the Framework and Machine pages (framework.md, machine.md), which hold the instructions for
    agents, use only commands, options and variables that the docs use;
  - the summaries agents read say the same thing about each product everywhere;
  - llms.txt and agents.md exist only at the top of the site, and the Markdown versions of
    the other pages are at their fixed paths.

    python3 tools/check_docs_md.py            # the sources
    python3 tools/check_docs_md.py --built    # also the generated docs/ copy
    python3 tools/check_docs_md.py --only machine

Exit status 0 means all is well, 1 means problems were printed.
See .claude/skills/docs-markdown/SKILL.md.
"""
import argparse
import os
import re
import sys
import unicodedata
from pathlib import Path

SITE = "https://testflows.com"

# The standard descriptions. Every file agents start from says them in these words, so an
# agent reads the same thing wherever it starts. Change one here and in each file.
MACHINE = (
    "TestFlows Machine is a deterministic execution machine in the cloud, provided as a "
    "self-serve service: you can sign up for free, and paid plans are available. "
    "It runs software built "
    "for Linux x86_64 and controls time, interrupts, random numbers and device input, so every "
    "run can be recorded, replayed exactly, and branched from any point to explore other outcomes."
)
FRAMEWORK = (
    "TestFlows Framework is an open-source Python library for writing test programs. You write "
    "tests and define the test flow explicitly as Python code, with everything treated as a test, "
    "for functional, integration, acceptance and unit testing. It produces test reports and ties "
    "tests to requirements for coverage."
)
HINT = "must use the standard description (see MACHINE and FRAMEWORK in tools/check_docs_md.py)"

PRODUCTS = {
    "machine": dict(
        name="Machine", dir="source/docs/machine", url=SITE + "/docs/machine/", standard=MACHINE,
        built="docs/docs/machine", agents="source/_md/machine.md", page_url=SITE + "/machine.md",
        hub="source/_md/docs/machine.md", hub_twin="docs/machine.md", hub_url=SITE + "/docs/machine.md",
        title_for={"overview": "Overview"},      # an llms.txt title that is not the first heading
        strict_titles=True,                       # llms.txt titles must be the first heading
        no_heading=set(),                         # files that start without a heading
        page_anchors_ok=False,                    # links to a heading in another file must name the file
    ),
    "framework": dict(
        name="Framework", dir="source/docs/framework", url=SITE + "/docs/framework/", standard=FRAMEWORK,
        built="docs/docs/framework", agents="source/_md/framework.md", page_url=SITE + "/framework.md",
        hub="source/_md/docs/framework.md", hub_twin="docs/framework.md", hub_url=SITE + "/docs/framework.md",
        title_for={}, strict_titles=False,
        no_heading={"references"},                # only link definitions
        page_anchors_ok=True,                     # some anchors can only work on the page
    ),
}
# Commands that take a subcommand: `machine sessions list`, not `machine sessions <run>`.
GROUPS = {"sessions", "disks", "account", "marks", "storage", "debug"}
VALUE_FLAGS = {"-o", "--output", "-s", "--session", "--timeout", "--api-url"}

INCLUDE = re.compile(r"^<!--\s*include:\s*([\w./-]+\.md)\s*-->[ \t]*$", re.M)
AGENT_NOTE = re.compile(r"^<!--\s*agents:.*?-->[ \t]*\n", re.S)
FENCE = re.compile(r"^[ \t>]*(```|~~~)")


def slugize(text):
    """The id Hexo gives a heading on the page (hexo-util slugize)."""
    text = "".join(c for c in unicodedata.normalize("NFD", text) if not unicodedata.combining(c))
    text = re.sub(r"[\x00-\x1f]", "", text)
    text = re.sub(r"[\s~`!@#$%^&*()\-_+=\[\]{}|\\;:\"'<>,.?/]+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-")


def slug(text):
    """The anchor GitHub gives a heading."""
    return re.sub(r"[^\w\s-]", "", text.lower()).strip().replace(" ", "-")


def split_fences(text):
    """(is_code, chunk) pieces, so prose checks can skip fenced code."""
    out, chunk, fence = [], [], False
    for line in text.split("\n"):
        if FENCE.match(line):
            out.append((fence, "\n".join(chunk)))
            chunk, fence = [], not fence
        chunk.append(line)
    out.append((fence, "\n".join(chunk)))
    return out


def prose(text):
    return "\n".join(c for code, c in split_fences(text) if not code)


def headings(text):
    return [m.strip() for m in re.findall(r"^#{1,6} (.+?)\s*$", prose(text), re.M)]


def resolves(fragment, text):
    """Whether a heading in text has this id, or this lower-case GitHub anchor."""
    found = headings(text)
    return fragment in {slugize(h) for h in found} or fragment.lower() in {slug(h) for h in found}


def check_sections(p):
    """The includes and the files. Returns (problems, notes, order, texts, titles)."""
    problems, notes, order, texts, titles = [], [], [], {}, {}
    d = Path(p["dir"])
    index = d / "index.md"
    llms_url = p["hub_url"]
    if not index.exists():
        return [f"{index} is missing"], notes, order, texts, titles
    order = [Path(m).stem for m in INCLUDE.findall(index.read_text())]
    for key in sorted(k for k in set(order) if order.count(k) > 1):
        problems.append(f"{d.name}: index.md includes {key}.md more than once")
    for key in order:
        path = d / f"{key}.md"
        if not path.exists():
            problems.append(f"{d.name}: index.md includes {key}.md, which does not exist")
        else:
            texts[key] = path.read_text()
    for path in sorted(d.glob("*.md")):
        if path.name != "index.md" and path.stem not in order:
            problems.append(f"{d.name}/{path.name} is not included by index.md, so people never see it")
    for key, text in texts.items():
        where = f"{d.name}/{key}.md"
        if not AGENT_NOTE.match(text) or llms_url not in text.split("\n", 1)[0]:
            problems.append(f"{where}: it must start with the note for agents: <!-- agents: ... {llms_url} -->")
        body = AGENT_NOTE.sub("", text, count=1)
        if key in p["no_heading"]:
            titles[key] = key
        else:
            first = headings(body)
            if not body.lstrip().startswith("# ") or not first:
                problems.append(f"{where}: after the note, the first line must be a '# ' heading")
                continue
            titles[key] = p["title_for"].get(key, first[0])
    page_only = 0
    for key, text in texts.items():
        where = f"{d.name}/{key}.md"
        pr = prose(text)
        for name, frag in re.findall(r"\]\(([\w-]+)\.md(#[^)\s]*)?\)", pr) + re.findall(r"^\[[^\]\n]+\]:[ \t]+([\w-]+)\.md(#\S*)?", pr, re.M):
            if name not in texts:
                problems.append(f"{where}: link to {name}.md, which is not in these docs")
            elif frag and not resolves(frag[1:], texts[name]):
                problems.append(f"{where}: link {name}.md{frag} points at a heading that is not there")
        anchors = re.findall(r"\]\(#([^)\s]+)\)", pr) + re.findall(r"^\[[^\]\n]+\]:[ \t]+#(\S+)", pr, re.M)
        for frag in anchors:
            if resolves(frag, text):
                continue
            if p["page_anchors_ok"]:
                page_only += 1
            else:
                problems.append(f"{where}: link #{frag} points at a heading that is not in this file; link to the file that has it")
    if page_only:
        notes.append(f"{d.name}: {page_only} links point at a heading outside their file by page anchor. "
                     "They work on the page, not in the raw files.")
    return problems, notes, order, texts, titles


def check_hub(p, order, titles):
    """The page that lists a product's parts lists every file once, in order, with a description."""
    path = Path(p["hub"])
    lab = path.as_posix().replace("source/_md/", "")
    if not path.exists():
        return [f"{path} is missing"]
    problems, text = [], AGENT_NOTE.sub("", path.read_text(), count=1).lstrip("\n")   # the note for agents may come first
    lines = text.split("\n")
    if not lines[0].startswith("# "):
        problems.append(f"{lab}: the first line must be the '# ' title")
    quotes = "\n".join(l for l in lines[:6] if l.startswith("> "))
    if not quotes:
        problems.append(f"{lab}: a '> ' summary must follow the title")
    elif p["standard"] not in quotes:
        problems.append(f"{lab}: the summary {HINT}")
    listed = []
    for title, url, desc in re.findall(r"^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$", text, re.M):
        m = re.fullmatch(re.escape(p["url"]) + r"([a-z0-9-]+)\.md", url)
        if not m:
            continue
        key = m.group(1)
        listed.append(key)
        if key not in order:
            problems.append(f"{lab}: lists {key}.md, which is not in these docs")
        elif p["strict_titles"] and title != titles.get(key, title):
            problems.append(f"{lab}: {key}.md is titled '{title}', the section is '{titles[key]}'")
        if not desc.strip():
            problems.append(f"{lab}: {key}.md has no description")
    for key in order:
        if key not in listed:
            problems.append(f"{lab} does not list {key}.md")
    if len(listed) != len(set(listed)):
        problems.append(f"{lab}: a file is listed twice")
    elif [k for k in listed if k in order] != [k for k in order if k in listed]:
        problems.append(f"{lab}: the files are not in the order index.md includes them")
    return problems


def check_agents(p, docs_text, order):
    """A product's page, which has the instructions for agents, is still true to the docs: what it names exists, its links resolve."""
    agents_path, name = Path(p["agents"]), p["name"]
    if not agents_path.exists():
        return [f"{agents_path} is missing"]
    problems, text = [], AGENT_NOTE.sub("", agents_path.read_text(), count=1).lstrip("\n")   # the note for agents comes first
    if not text.startswith("# ") or not re.search(r"^> ", text, re.M):
        problems.append(f"{name} page: it needs a '# ' title and a '> ' summary")
    elif p["standard"] not in text.split("\n## ")[0]:
        problems.append(f"{name} page: the summary {HINT}")
    lines = [ln for code, c in split_fences(text) if code for ln in c.split("\n")]
    lines += re.findall(r"`([^`\n]+)`", prose(text))
    if p["name"] == "Machine":
        for ln in lines:
            m = re.search(r"(?:^|[\s$])machine((?:\s+\S+)+)", ln.strip())
            if not m or not ln.strip().startswith(("machine", "$ machine", "curl")):
                continue
            toks, i, cmd = m.group(1).split(), 0, None
            while i < len(toks):
                if toks[i] in VALUE_FLAGS:
                    i += 2
                elif toks[i].startswith("-"):
                    i += 1
                else:
                    cmd = toks[i]
                    break
            if cmd in GROUPS and i + 1 < len(toks) and re.fullmatch(r"[a-z][a-z-]*", toks[i + 1]):
                if f"machine {cmd} {toks[i + 1]}" not in docs_text:
                    problems.append(f"Machine page: 'machine {cmd} {toks[i + 1]}' is not a command the docs use")
            if cmd and re.fullmatch(r"[a-z][a-z-]*", cmd) and f"machine {cmd}" not in docs_text \
                    and cmd not in ("is", "in", "a", "and", "or"):
                problems.append(f"Machine page: 'machine {cmd}' is not a command the docs use")
        for var in sorted(set(re.findall(r"\bTESTFLOWS_MACHINE_[A-Z_]+\b", text))):
            if var not in docs_text:
                problems.append(f"Machine page: {var} does not appear in the docs")
    else:
        # Framework: the options, tfs commands, install line and call forms it names are in the docs.
        for opt in sorted(set(re.findall(r"(?<![\w-])--[a-z][a-z-]+", " ".join(lines)))):
            if opt not in docs_text:
                problems.append(f"{name} page: option {opt} does not appear in the docs")
        for cmd in sorted(set(re.findall(r"\btfs [a-z]+", " ".join(lines)))):
            if cmd not in docs_text:
                problems.append(f"{name} page: '{cmd}' does not appear in the docs")
        for pkg in sorted(set(re.findall(r"pip3 install (\S+)", text))):
            if f"pip3 install {pkg}" not in docs_text:
                problems.append(f"{name} page: 'pip3 install {pkg}' does not appear in the docs")
        for snippet in ("pip3 install testflows", "Scenario(run=", "@TestScenario"):
            if snippet in text and snippet not in docs_text:
                problems.append(f"{name} page: '{snippet}' does not appear in the docs")
    for u in re.findall(re.escape(p["url"]) + r"([a-z0-9-]+)\.md", text):
        if u not in order:
            problems.append(f"{name} page: link to {u}.md does not match a file")
    return problems


def check_roots(root_llms, root_agents):
    """The site's llms.txt and page: standard descriptions, and links to what they point at."""
    problems = []
    for path, label in ((root_llms, "source/llms.txt"), (root_agents, "source/agents.md")):
        if not path.exists():
            problems.append(f"{path} is missing")
            continue
        text = path.read_text()
        intro = re.split(r"\n## ", text)[0]
        if not text.startswith("# ") or not re.search(r"^> ", text, re.M):
            problems.append(f"{label}: it needs a '# ' title and a '> ' summary")
        for std in (MACHINE, FRAMEWORK):
            if std not in intro:
                problems.append(f"{label}: the summary {HINT}")
                break
        wanted = [u for p in PRODUCTS.values() for u in (p["page_url"], p["hub_url"])]
        wanted += [SITE + "/install.md"]
        wanted += [SITE + "/llms.txt"] if label == "source/agents.md" else [SITE + "/agents.md"]
        for url in wanted:
            if url not in text:
                problems.append(f"{label}: it must link {url}")
    return problems


def check_built(p, order, extra_pairs):
    """The generated docs/ copy: raw files as written, and the page assembled from the files."""
    problems, d, out = [], Path(p["dir"]), Path(p["built"])
    pairs = [(d / f"{k}.md", out / f"{k}.md") for k in order] + [(Path(p["hub"]), Path("docs") / p["hub_twin"])] + extra_pairs
    for src, dst in pairs:
        if not dst.exists():
            problems.append(f"{dst} is not built; run npx hexo generate")
        elif src.exists() and src.read_text() != dst.read_text():
            problems.append(f"{dst} differs from {src}; run npx hexo generate")
    page = out / "index.html"
    if not page.exists():
        return problems + [f"{page} is missing: the page did not render"]
    html = page.read_text()
    if "<!-- include:" in html or "<!-- agents:" in html:
        problems.append(f"{page} still has an include or agent note in it")
    ids = set(re.findall(r'<h1 id="([^"]+)"', html))
    for key in order:
        src = d / f"{key}.md"
        if not src.exists() or key in p["no_heading"]:
            continue
        for h in re.findall(r"^# (.+?)\s*$", prose(AGENT_NOTE.sub("", src.read_text(), count=1)), re.M):
            if slugize(h) not in ids:
                problems.append(f"the page has no heading '{h}' from {key}.md; it is stale, run npx hexo generate")
    return problems


# Pages that have no Markdown version: listings, redirects and the portal's app pages.
NO_TWIN = ("404.html", "archives/", "tags/", "categories/", "handbook/", "machine/contact/", "machine/legal/index.html",
           "machine/portal/", "blog/page/", "page/")


def check_private_beta():
    """Machine is in private beta, and only the sign-up page says so."""
    found = []
    for pattern in ("*.md", "*.txt", "*.ejs", "*.html"):
        for root in ("source", "themes/testflows/layout"):
            for f in Path(root).rglob(pattern):
                if "_posts" in f.parts or f.as_posix() == "source/machine/portal/signup.md":
                    continue
                if re.search(r"private beta", f.read_text(errors="ignore"), re.I):
                    found.append(f.as_posix())
    return [f"{f} says 'private beta'; only source/machine/portal/signup.md should" for f in sorted(set(found))]


# Pages for people, to act on: the sign-up and account pages and the contact form. They have no Markdown version.
PEOPLE_ONLY = ("/machine/portal/", "/contact.html")


def check_markdown_links():
    """Every link to a page of this site, in the files agents read, is a link to its Markdown version."""
    files = ["source/agents.md", "source/llms.txt", "source/install.md"] + sorted(str(f) for f in Path("source/_md").rglob("*.md"))
    problems = []
    for f in files:
        for n, line in enumerate(Path(f).read_text().split("\n"), 1):
            for m in re.finditer(r"https://testflows\.com(/[^\s)>\]\"'`,]*)", line):
                path = m.group(1).rstrip(".,;").split("#")[0].split("?")[0]
                if (path.endswith("/") or path.endswith(".html")) and not path.startswith(PEOPLE_ONLY):
                    problems.append(f"{f}:{n}: links the page {m.group(1).rstrip('.,;')}; link its Markdown version instead")
    return problems


def check_install(doc_texts):
    """install.md is a guide an agent can follow: its parts are there, and what it runs exists in the docs."""
    path = Path("source/install.md")
    if not path.exists():
        return ["source/install.md is missing"]
    text = path.read_text()
    problems = []
    if not text.startswith("# testflows\n"):
        problems.append("source/install.md: the first line must be '# testflows'")
    intro = text.split("\n## ")[0]
    if not re.search(r"^> ", intro, re.M) or MACHINE not in intro or FRAMEWORK not in intro:
        problems.append(f"source/install.md: the summary {HINT}")
    for heading in ("OBJECTIVE", "DONE WHEN", "TODO", "EXECUTE NOW"):
        if f"\n## {heading}\n" not in text:
            problems.append(f"source/install.md: it needs a '## {heading}' section")
    steps = re.findall(r"^## Step (\d+)", text, re.M)
    todo = re.findall(r"^- \[ \] Step (\d+)", text, re.M)
    if steps != todo:
        problems.append(f"source/install.md: the TODO list has steps {todo}, the sections are {steps}")
    framework, machine = doc_texts.get("framework", ""), doc_texts.get("machine", "")
    lines = [ln for code, c in split_fences(text) if code for ln in c.split("\n")]
    for ln in lines:
        ln = ln.strip()
        m = re.match(r"machine((?:\s+\S+)+)", ln)
        if m:
            toks, i, cmd = m.group(1).split(), 0, None
            while i < len(toks):
                if toks[i] in VALUE_FLAGS:
                    i += 2
                elif toks[i].startswith("-"):
                    i += 1
                else:
                    cmd = toks[i]
                    break
            if cmd and re.fullmatch(r"[a-z][a-z-]*", cmd) and f"machine {cmd}" not in machine:
                problems.append(f"source/install.md: 'machine {cmd}' is not a command the docs use")
            if cmd in GROUPS and i + 1 < len(toks) and re.fullmatch(r"[a-z][a-z-]*", toks[i + 1]) \
                    and f"machine {cmd} {toks[i + 1]}" not in machine:
                problems.append(f"source/install.md: 'machine {cmd} {toks[i + 1]}' is not a command the docs use")
        for pkg in re.findall(r"pip3 install (\S+)", ln):
            if f"pip3 install {pkg}" not in framework:
                problems.append(f"source/install.md: 'pip3 install {pkg}' does not appear in the Framework docs")
        if "testflows.com/machine/install" in ln and "testflows.com/machine/install" not in machine:
            problems.append("source/install.md: the Machine installer command does not appear in the Machine docs")
    for var in sorted(set(re.findall(r"\bTESTFLOWS_MACHINE_[A-Z_]+\b", text))):
        if var not in machine:
            problems.append(f"source/install.md: {var} does not appear in the Machine docs")
    return problems


def check_top_level_only():
    """llms.txt and agents.md exist only at the top of the site; everything else is an ordinary page."""
    found = sorted(p.as_posix() for name in ("llms.txt", "agents.md") for p in Path("source").rglob(name)
                   if "_posts" not in p.parts)
    return [f"{f} is not at the top of the site; only source/llms.txt and source/agents.md are special, "
            "so make it an ordinary page (for example a parts list in source/_md/)"
            for f in found if f not in ("source/llms.txt", "source/agents.md")]


def check_twins(root_llms, blog_dir):
    """The Markdown versions of the other pages, at each page's own path with the slash dropped and .md added."""
    problems, built = [], Path("docs")
    md = Path("source/_md")
    # The hand-written ones say the standard descriptions where they describe a product.
    needs = {"index.md": (MACHINE, FRAMEWORK), "framework.md": (FRAMEWORK,), "machine.md": (MACHINE,),
             "machine/download.md": (MACHINE,)}
    for rel, stds in needs.items():
        f = md / rel
        if not f.exists():
            problems.append(f"source/_md/{rel} is missing")
        elif any(std not in f.read_text() for std in stds):
            problems.append(f"source/_md/{rel}: it {HINT}")
    # The download twin keeps to the page: every code block in it is on the page.
    page, twin = Path("source/machine/download.md"), md / "machine/download.md"
    if page.exists() and twin.exists():
        on_page = set(re.findall(r"```[^\n]*\n(.*?)```", page.read_text(), re.S))
        for block in re.findall(r"```[^\n]*\n(.*?)```", twin.read_text(), re.S):
            if block not in on_page:
                problems.append(f"source/_md/machine/download.md: the code block starting '{block.strip().splitlines()[0][:50]}' is not on the download page")
    # Every blog post is listed on the blog page, blog.md.
    llms = md / "blog.md"
    if llms.exists():
        listed = set(re.findall(r"https://testflows\.com/blog/([a-z0-9-]+)\.md", llms.read_text()))
        posts = {p.stem for p in Path("source/_posts/blog").glob("*.md")}
        for slug_ in sorted(posts - listed):
            problems.append(f"blog.md does not list the post {slug_}")
        for slug_ in sorted(listed - posts):
            problems.append(f"blog.md lists {slug_}, which is not a post")
    else:
        problems.append(f"{llms} is missing")
    return problems


def check_twins_built(hubs):
    """The built site: every content page has a Markdown version, and every Markdown file an llms.txt names exists."""
    problems, built = [], Path("docs")
    for page in sorted(built.glob("**/*.html")):
        rel = page.relative_to(built).as_posix()
        if rel.startswith(("assets/", "css/", "js/", "fonts/", "img/", "images/")) or rel.startswith(NO_TWIN):
            continue
        if rel == "index.html":
            twin = "index.md"
        elif rel.endswith("/index.html"):
            twin = rel[: -len("/index.html")] + ".md"
        else:
            twin = rel[: -len(".html")] + ".md"
        if not (built / twin).exists():
            problems.append(f"docs/{rel} has no Markdown version at /{twin}")
            continue
        if f'href="https://testflows.com/{twin}"' not in page.read_text(errors="ignore"):
            problems.append(f"docs/{rel} does not point at its Markdown version /{twin}")
        if rel.endswith("/index.html") and (built / (rel[: -len("index.html")] + "index.md")).exists():
            problems.append(f"docs/{rel[: -len('index.html')]}index.md should not exist: the Markdown version of /{rel[: -len('index.html')]} is /{twin} only")
    # In every Markdown file agents read, a link to a page of the site is a link to its Markdown version. The docs
    # parts are not scanned: their text is shared with the human page, which needs its HTML links.
    for md_file in sorted(built.glob("**/*.md")) + [built / "llms.txt"]:
        rel = md_file.relative_to(built).as_posix()
        if rel.startswith(("docs/machine/", "docs/framework/")):
            continue
        for n, line in enumerate(md_file.read_text(errors="ignore").split("\n"), 1):
            for m in re.finditer(r"(?:https://testflows\.com)?(/[A-Za-z0-9_./-]*(?:\.html|/))(?=[)\s#?>\]\"'`,]|$)", line):
                path = m.group(1)
                if "](" + path in line or "https://testflows.com" + path in line or re.search(r"\]:[ \t]+" + re.escape(path), line):
                    if not path.startswith(PEOPLE_ONLY) and not path.startswith("//"):
                        problems.append(f"docs/{rel}:{n}: links the page {path}; link its Markdown version instead")
    for llms in [Path("docs/llms.txt")] + [Path(p) for p in hubs]:
        if not llms.exists():
            continue
        for url in sorted(set(re.findall(r"\]\(https://testflows\.com/([^)\s]+\.(?:md|txt))\)", llms.read_text()))):
            if not (built / url).exists():
                problems.append(f"{llms} links /{url}, which is not built")
    return problems


def main():
    os.chdir(Path(__file__).resolve().parent.parent)   # the paths here are relative to the repository root
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--built", action="store_true", help="also check the generated docs/ copy")
    parser.add_argument("--only", choices=sorted(PRODUCTS), help="check one product's docs only")
    parser.add_argument("--machine-dir", default=PRODUCTS["machine"]["dir"])
    parser.add_argument("--framework-dir", default=PRODUCTS["framework"]["dir"])
    parser.add_argument("--root-agents", default="source/agents.md", help="the site's overview")
    parser.add_argument("--root-llms", default="source/llms.txt")
    args = parser.parse_args()
    PRODUCTS["machine"]["dir"], PRODUCTS["framework"]["dir"] = args.machine_dir, args.framework_dir

    problems, notes, summary, doc_texts = [], [], [], {}
    for key, p in PRODUCTS.items():
        if args.only and args.only != key:
            continue
        pr, nt, order, texts, titles = check_sections(p)
        doc_texts[key] = "\n".join(texts.values())
        problems += pr + check_hub(p, order, titles)
        notes += nt
        summary.append(f"{len(order)} {p['name']} files")
        problems += check_agents(p, "\n".join(texts.values()), order)
        extra = []
        if args.built:
            problems += check_built(p, order, extra)
    problems += check_roots(Path(args.root_llms), Path(args.root_agents))
    if not args.only:
        problems += check_install(doc_texts)
    if not args.only:
        problems += check_twins(Path(args.root_llms), "source/blog") + check_top_level_only() + check_private_beta() + check_markdown_links()
    if args.built:
        for src, dst in ((Path(args.root_llms), Path("docs/llms.txt")), (Path(args.root_agents), Path("docs/agents.md")),
                         (Path("source/install.md"), Path("docs/install.md"))):
            if not dst.exists() or src.read_text() != dst.read_text():
                problems.append(f"{dst} is missing or differs from {src}; run npx hexo generate")

    if args.built and not args.only:
        problems += check_twins_built([Path("docs") / p["hub_twin"] for p in PRODUCTS.values()] + ["docs/blog.md"])

    for n in notes:
        print("note:", n)
    if problems:
        print(f"{len(problems)} problem(s):")
        for pr in problems:
            print("  -", pr)
        return 1
    print("All well: " + ", ".join(summary) + ", each included by its index.md and listed on its parts page" + (", and the other pages have their Markdown versions." if not args.only else "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
