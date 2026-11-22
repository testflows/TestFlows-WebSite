# TestFlows website: guide for AI agents

> testflows.com is the home of two products. TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage. TestFlows Machine is a deterministic simulation testing environment for developers and AI coding agents, provided as a self-serve cloud service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Every page has a Markdown version at the same address with `.md` in place of the trailing slash or `.html`: `/framework/` is `/framework.md`, and `/contact.html` is `/contact.md`. The home page is `/index.md`. Read the Markdown versions.

## Start here

- To install the Machine client, Framework or both, follow this guide: https://testflows.com/install.md
- Machine, deterministic simulation testing: how to install the client, sign in, run a machine, and control cost: https://testflows.com/machine.md. You drive the `machine` client with `-o json`, or write Python programs with the SDK, `testflows.machine`.
- Framework, how to install it, write and run tests, and avoid the common mistakes: https://testflows.com/framework.md
- The Machine skill for coding agents, the set-up steps and the rules in one file: https://testflows.com/machine/skill.md. How to install it is below, under "The Machine skill".
- All the pages, listed: https://testflows.com/llms.txt

## Other pages

- Home: https://testflows.com/index.md
- Download the Machine client: https://testflows.com/machine/download.md
- Documentation: https://testflows.com/docs.md
- Machine docs, by part: https://testflows.com/docs/machine.md
- Framework docs, by part: https://testflows.com/docs/framework.md
- Blog: https://testflows.com/blog.md
- Contact: https://testflows.com/contact.md
- Legal: https://testflows.com/legal.md

## The Machine skill

Ask your person before you install it: it adds instructions to their coding agent, which it reads in every session that mentions TestFlows Machine. Then save it where their agent reads skills:

```bash
# Claude Code and Cursor
mkdir -p ~/.claude/skills/testflows-machine
curl -fsS https://testflows.com/machine/skill.md -o ~/.claude/skills/testflows-machine/SKILL.md
# Codex
mkdir -p ~/.agents/skills/testflows-machine
curl -fsS https://testflows.com/machine/skill.md -o ~/.agents/skills/testflows-machine/SKILL.md
```

For one project only, use `.claude/skills/` or `.agents/skills/` in the project instead. The agent loads the skill in its next session. An installed copy does not update itself: run the same `curl` again for the latest.

## For people only

The sign-up, sign-in and account pages, under `/machine/portal/`, are for people and have no Markdown version. Give your person the link instead of filling them in. To sign the Machine client in, ask your person for their email address and run `machine login --email <address>`, or `machine account signup --email <address>` for a new account; they tell you the code that is emailed or shown, and you run `machine login --email <address> --code <code>`. The steps are at https://testflows.com/machine.md. Your person accepts the Terms of Service themselves; never accept them for your person.
