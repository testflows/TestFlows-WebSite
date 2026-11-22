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

- A person needs a Machine account, and you cannot sign up for them. They create one themselves at https://testflows.com/machine/portal/signup/, and signing up is free.
- Ask before you use credits, pay, or change the account: creating sessions uses credits, buying credits is a payment, and creating or deleting API keys changes the account.
- Never print an API key or commit one.

## Install and sign in

```bash
curl https://testflows.com/machine/install -fsS | bash
machine account show
```

It runs on Linux (x86_64 and arm64) and on Macs with Apple Silicon. A person signs in once: `machine login` on the same computer, which they must run themselves, locally, or an API key in `TESTFLOWS_MACHINE_API_KEY` for a sandbox or CI, made with `machine account api-keys create <name> --expiry 30`. If you get `Not signed in`, ask the person.

## How agents use Machine

An agent works with Machine in one of two ways:

- **Drive the `machine` client.** Run its commands and read their answers with `-o json`. Each answer is one JSON document: `{"result": ..., "elapsed_ms": ...}` on success, and `{"error": ..., "code": ..., "hints": [...]}` on standard error on failure. This suits exploring a bug step by step: run, fork, inject a fault, read the output, go back.
- **Write a Python program with the SDK.** Install it with `pip3 install testflows.machine` after the client, then `import testflows.machine.v1 as machine`. This suits a test or a fuzzer that repeats: a loop over seeds, schedules or faults, with its own checks. https://testflows.com/docs/machine/python-sdk.md

Both use the same account, sessions and runs. A run that a program keeps, outside a `with` block, can be examined with the client afterwards.

## In scripts

Put `-o json` (parseable output), `-q` and `--timeout 300` before the command. A waiting command exits `3` on a timeout, any error exits `2`. Deleting asks for confirmation; pass `--yes` only when you mean it. Run `machine <command> --help` instead of guessing flags.

## Mistakes to avoid

- Create runs with `--daemon`, or they run to the end by themselves and your commands fail with `Machine not in control mode`.
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
