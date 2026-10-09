<!-- agents: TestFlows™ Machine page. Index: https://testflows.com/docs/machine.md -->

# Machine

> Run your programs deterministically. Record, replay and branch your runs.

TestFlows™ Machine is a deterministic execution machine in the cloud, provided as a self-serve service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Make every run repeatable for testing and more.

## Record. Replay. Branch.

- **Record.** Capture a full run with every non-deterministic input pinned down.
- **Replay.** Run it again instruction by instruction, with identical state and an identical outcome.
- **Branch.** Fork from any point and try alternatives without losing the original timeline.

## Rules for agents

- A person needs a Machine account, and you cannot sign up for them. They create one themselves at https://testflows.com/machine/portal/signup/, and signing up is free.
- Ask before you spend money or change the account: creating sessions, buying credits, creating or deleting API keys.
- Never print an API key or commit one.

## Install and sign in

```bash
curl https://testflows.com/machine/install -fsS | bash
machine account show
```

It runs on Linux (x86_64 and arm64) and on Macs with Apple Silicon. A person signs in once: `machine login` on the same computer, which they must run themselves, locally, or an API key in `TESTFLOWS_MACHINE_API_KEY` for a sandbox or CI, made with `machine account api-keys create <name> --expiry 30`. If you get `Not signed in`, ask the person. After they are signed in, run `machine account provision` once to set up account storage. The first session cannot be created until that is done.

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
