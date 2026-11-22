<!-- agents: TestFlows Machine page. Index: https://testflows.com/docs/machine.md -->

# Machine

> Deterministic simulation testing for developers and AI coding agents. Test and explore your programs in a deterministic machine for free. Get started in 5 minutes.

TestFlows Machine is a deterministic simulation testing environment for developers and AI coding agents, provided as a self-serve cloud service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Simulate, fuzz and explore your software yourself or with AI coding agents.

## Fine-grained control over execution

Let your AI coding agent test your code and its bug fixes, or do it yourself. Every run is deterministic, so every failure you find replays exactly.

- **AI agents test your fixes.** Your AI coding agent runs your code and its fixes in the machine. Every failure it finds replays exactly, for it and for you. https://testflows.com/docs/machine/python-sdk.md
- **Precise fault injection.** Fail a system call, a disk request, a packet or a container at the exact call you choose, or at random from a seed. https://testflows.com/docs/machine/fault-injection.md
- **Forced data races.** Hold, yield and pin threads to force the interleaving that triggers a race. Then watch the same race on every replay. https://testflows.com/docs/machine/steering-programs.md
- **Custom fuzzers.** Draw schedules, faults and timing from a seed in Python, or schedules from a plan file with no code, and stress the code paths you choose. https://testflows.com/docs/machine/steering-programs.md
- **Retroactive logging.** Log everything, store nothing. Replay the stretch you care about and get its logs after the fact. https://testflows.com/docs/machine/running-a-machine.md
- **Time travel.** Rewind to any checkpoint, step back to the instruction before a bug, or branch from any point. The original run stays as it was. https://testflows.com/docs/machine/checkpoints-and-branches.md
- **Time compression.** Idle time is skipped. Ten minutes of sleep in the machine pass in about three seconds, so timeouts and retries cost seconds. https://testflows.com/docs/machine/running-a-machine.md
- **Debugging at any point.** Inspect registers, memory and the stack, set breakpoints and watchpoints, or run GDB inside the machine, at any point of any run. https://testflows.com/docs/machine/debugging.md

## Rules for agents

- You sign the client in with your person's help: they read a code from an email or a page and tell it to you. They accept the Terms of Service themselves, on the page the sign-up email opens. Never accept them for your person.
- Ask before you use credits, pay, or change the account: creating sessions uses credits, and buying credits is a payment. The API key the steps below save is part of signing in; ask before creating or deleting any other key.
- Never print an API key or commit one. The client saves its key and never shows it.

## Set up

No command waits for your person: each one that sends an email returns at once, and the next one takes the code. A code works once, for 10 minutes, from this computer's network. When one is refused, send a new one.

1. **The client.** Run `machine --version`. If it prints a version, go to step 2. If `machine` is missing, ask your person: "Do you have a TestFlows Machine account? What is your email address?" Then install with the installer, which takes the same steps as `machine login`:

   ```bash
   # Has an account: emails a sign-in code
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address>
   # Needs one: emails a sign-up link; its page shows the Terms to accept, then a code
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --signup
   # With the code: installs the client and saves an API key for it
   curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --code <code>
   ```

   The client runs on Linux (x86_64 and arm64) and on Macs with Apple Silicon. Then go to step 2.

2. **The key.** Run `machine -o json account whoami`. If it answers, run `machine upgrade` to install a newer client when there is one, and start working. If it fails with exit code `2`, go to step 3.

3. **Sign in.** Ask your person whether they have an account and its email address.

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

   Name the key for this computer, such as its hostname. If the key command says it emailed a confirmation code, ask for it and run `machine account api-keys create <name> --save --code <code>`.

The client signs in with `TESTFLOWS_MACHINE_API_KEY` when it is set, then the login, then the saved key. If a refusal says the Agreement changed, your person accepts it at https://testflows.com/machine/portal/account/.

## The skill

The Machine skill teaches your agent to reproduce rare bugs on purpose and prove fixes, with the set-up steps and the rules above, so it has them in every session. It is a folder, https://github.com/testflows/Machine/tree/main/skills/testflows-machine: `SKILL.md` and the references it reads when a case comes up. Ask your person before you install it: it adds instructions to their coding agent, which it reads in every session that mentions TestFlows Machine. Then save it where their agent reads skills:

```bash
# Claude Code and Cursor: ~/.claude/skills; Codex and Cursor: ~/.agents/skills
mkdir -p ~/.claude/skills
curl -fsSL https://codeload.github.com/testflows/Machine/tar.gz/main | tar -xz -C ~/.claude/skills --strip-components=2 Machine-main/skills/testflows-machine
```

It writes the folder `testflows-machine/`: `SKILL.md` and its `references/`. For Codex, put `~/.agents/skills` in both places of the command. For one project only, use `.claude/skills/` or `.agents/skills/` in the project instead. The agent loads the skill in its next session. An installed copy does not update itself: run the command again for the latest. The skill's source is https://github.com/testflows/Machine/tree/main/skills/testflows-machine.

## How agents use Machine

An agent works with Machine in one of two ways:

- **Drive the `machine` client.** Run its commands and read their answers with `-o json`. Each answer is one JSON document: `{"result": ..., "elapsed_ms": ...}` on success, and `{"error": ..., "code": ..., "hints": [...]}` on standard error on failure. This suits exploring a bug step by step: run, fork, inject a fault, read the output, go back.
- **Write a Python program with the SDK.** Install it with `pip3 install testflows.machine` after the client, then `import testflows.machine.v1 as machine`. This suits a test or a fuzzer that repeats: a loop over seeds, schedules or faults, with its own checks. https://testflows.com/docs/machine/python-sdk.md

Both use the same account, sessions and runs. A run that a program keeps, outside a `with` block, can be examined with the client afterwards.

## In scripts

Put `-o json` (parseable output), `-q` and `--timeout 300` before the command. A waiting command exits `3` on a timeout, any error exits `2`. Deleting asks for confirmation; pass `--yes` only when you mean it. Run `machine <command> --help` instead of guessing flags.

## Mistakes to avoid

- A branch's full name is `parent/name`. `machine fork app --name try-1` makes `app/try-1`, and that is the name every other command takes.
- `fork` makes a branch in its own machine. `go` makes one and moves the machine you are on onto it.
- Disks hold x86_64 programs, even on an ARM computer.
- `machine wait` only watches. Without `--timeout` it never finishes on a run nobody is driving.

## Cost

A session costs from the moment it is created until it is deleted. When you are done, delete your runs and then the session, and check `machine sessions list`.

## Learn more

- Download the client: https://testflows.com/machine/download.md
- A first run, step by step: https://testflows.com/docs/machine/getting-started.md
- Concepts and how to name a point in a run: https://testflows.com/docs/machine/overview.md
- Python SDK: https://testflows.com/docs/machine/python-sdk.md
- The docs, by part: https://testflows.com/docs/machine.md
