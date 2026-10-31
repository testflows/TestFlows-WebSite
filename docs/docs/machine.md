<!-- agents: TestFlows™ Machine docs index. Index: https://testflows.com/llms.txt -->

# TestFlows™ Machine

> TestFlows™ Machine is a deterministic execution machine in the cloud, provided as a self-serve service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes. You use it from the `machine` command-line client or from the Python SDK.

Install the client with `curl https://testflows.com/machine/install -fsS | bash`. It runs on Linux (x86_64 and arm64) and on Macs with Apple Silicon. Sign in with `machine login`, or set `TESTFLOWS_MACHINE_API_KEY` for scripts and agents. `machine --help` lists every command, and so does `--help` on each one. Each page below is one section of the Machine docs, in plain Markdown.

In the Markdown files, `{% attention %}` starts a note.

## Start here

- [Overview](https://testflows.com/docs/machine/overview.md): What Machine is, its concepts (disk, session, run, entry, checkpoint, branch, mark), and how to name a point in a run's history.
- [Getting started](https://testflows.com/docs/machine/getting-started.md): Install the client, sign up and sign in, set up account storage, then go from a program to a branch in one first run.

## Guides

- [Disks](https://testflows.com/docs/machine/disks.md): Build a disk from a binary, a Docker image or a Compose project, including on ARM machines, and manage disks.
- [Sessions](https://testflows.com/docs/machine/sessions.md): Create, size, select and delete the cloud sessions your runs live in.
- [Running a machine](https://testflows.com/docs/machine/running-a-machine.md): Create a run, seed its random numbers, drive it with `machine run`, wait for conditions, try different schedules, record runs that repeat, inspect it, and stop and start it.
- [Checkpoints and branches](https://testflows.com/docs/machine/checkpoints-and-branches.md): Save checkpoints, branch with `fork`, `go`, `switch`, `rewind` and `detach`, see the tree, and mark branches.
- [Replay](https://testflows.com/docs/machine/replay.md): Replay a recording, detect divergence, compare two stopped machines, and play a log back.
- [Steering programs](https://testflows.com/docs/machine/steering-programs.md): Hold and release threads, focus on programs, write plan files, inject and hold interrupts, and change machine time.
- [Fault injection](https://testflows.com/docs/machine/fault-injection.md): Make system calls fail or wait, fail the kernel's disk requests and memory allocations, and damage the disk's data, by chance or at the call you choose, in cycles of machine time.
- [Container faults](https://testflows.com/docs/machine/container-faults.md): Stop, kill, crash, pause or throttle one service's container while the others run, and start it again after a time or from its image.
- [Clock faults](https://testflows.com/docs/machine/clock-faults.md): Step or set the guest's date or one container's, make a container's clock drift or slew, jitter a date as NTP steps it, and insert or delete a leap second.
- [Network faults](https://testflows.com/docs/machine/network-faults.md): Delay, lose, duplicate, corrupt or reorder what a container sends, limit its rate, or cut two containers apart, on its whole link or toward one peer.
- [Debugging](https://testflows.com/docs/machine/debugging.md): The machine's debugger: registers, memory, the stack, symbols and variables, stepping, breakpoints, watchpoints and catchpoints, running to a location, going back, calls and signals, the location syntax, and the 3 hardware registers. Then GDB inside the machine, and a GDB session run again from a checkpoint.
- [Reading the disk](https://testflows.com/docs/machine/reading-the-disk.md): Read files from a run's disk, at a checkpoint or an entry, without touching the run.
- [Account and billing](https://testflows.com/docs/machine/account-and-billing.md): Manage the account, credits, plans, API keys and storage from the client.
- [Scripting](https://testflows.com/docs/machine/scripting.md): JSON output, quiet mode, timeouts and exit codes for scripts and CI.

## Reference

- [Commands](https://testflows.com/docs/machine/commands.md): Every command `machine --help` lists, and the further commands each one takes, one heading each.

## Python SDK

- [Python SDK](https://testflows.com/docs/machine/python-sdk.md): Install the SDK, sign in, and do from Python what the client does: sessions, runs, branches, replay, errors and example scripts.

## Optional

- [Download the client](https://testflows.com/machine/download.md): Install the client, supported systems and how to check the download.
