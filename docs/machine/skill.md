---
name: testflows-machine
description: Use TestFlows Machine, a deterministic simulation testing environment, to run, replay, fault-inject and debug programs. Use when the person mentions TestFlows Machine, deterministic simulation testing, replaying a flaky failure exactly, injecting faults, forcing data races, or fuzzing with seeds. Covers installing the machine client, signing it in with the person's help, and where the docs are.
---

# TestFlows Machine

TestFlows Machine runs software built for Linux x86_64 in a deterministic
machine. Every run can be replayed exactly and branched from any point, with
faults injected, threads held to force a race, and time skipped. You work
with it through the `machine` client or the Python SDK.

## Rules

- You sign the client in with your person's help: they read a code from an
  email or a page and tell it to you. They accept the Terms of Service
  themselves, on the page the sign-up email opens. Never accept them for
  your person.
- Ask before you use credits or pay: creating a session uses credits. The
  API key the steps below save is part of signing in; ask before creating
  or deleting any other key.
- Never print an API key or commit one. The client saves its key and never
  shows it.
- Delete the runs and the session you created when you are done.

## Set up

No command waits for your person: each one that sends an email returns at
once, and the next one takes the code. A code works once, for 10 minutes,
from this computer's network. When one is refused, send a new one.

1. **The client.** Run `machine --version`. If it prints a version, go to
   step 2. If `machine` is missing, ask your person: "Do you have a TestFlows
   Machine account? What is your email address?" Then install:

   ```bash
   # Has an account: emails a sign-in code
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address>
   # Needs one: emails a sign-up link; its page shows the Terms to accept, then a code
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --signup
   # With the code: installs the client and saves an API key for it
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --code <code>
   ```

   If it says `~/.local/bin` is not on `PATH`, run
   `export PATH="$HOME/.local/bin:$PATH"`. Then go to step 2.

2. **The key.** Run `machine -o json account whoami`. If it answers, run
   `machine upgrade` and start working. If it fails with exit code `2`, go to
   step 3.

3. **Sign in.** Ask your person whether they have an account and its email
   address.

   ```bash
   # Has an account: emails a sign-in code
   machine login --email <address>
   # Needs one: emails a sign-up link; its page shows the Terms to accept, then a code
   machine account signup --email <address>
   # With the code from the email or the page
   machine login --email <address> --code <code>
   # Save an API key, so the client stays signed in after the login ends
   machine account api-keys create <name> --save
   ```

   Name the key for this computer, such as its hostname. If the key command
   says it emailed a confirmation code, ask for it and run it again with
   `--code <code>`.

If a refusal says the Agreement changed, your person accepts it at
https://testflows.com/machine/portal/account/.

## Work

- **The client.** Put `-o json` before the command and read the one JSON
  document it prints: `{"result": ...}`, or `{"error": ..., "code": ...,
  "hints": [...]}` on standard error with exit code `2`. Run
  `machine <command> --help` instead of guessing options.
- **The Python SDK.** For a test or a fuzzer that repeats, write a program:
  `pip3 install testflows.machine`, then
  `import testflows.machine.v1 as machine`.

A session costs from its creation until its deletion.

## Docs

Every page has a Markdown version for agents. Read the one you need:

- The Machine page and its rules for agents: https://testflows.com/machine.md
- A first run, step by step: https://testflows.com/docs/machine/getting-started.md
- The docs, by part: https://testflows.com/docs/machine.md
- Commands: https://testflows.com/docs/machine/commands.md
- Python SDK: https://testflows.com/docs/machine/python-sdk.md
