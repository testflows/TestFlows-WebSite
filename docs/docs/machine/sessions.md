<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Sessions

Runs live in a session, and you create one with
[`machine sessions create`](commands.md#machine-sessions-create). Set up
account storage first with
[`machine account provision`](commands.md#machine-account-provision): the
first session cannot be created until that is done. You pick a session's size
when you create it.

```bash
machine sessions create ci-1 --cpus 4 --mem 8G
```

`--cpus` sets the number of vCPUs, `--mem` the memory and `--storage` the
disk space. `--class` picks the hardware class, and its default comes from your
plan. The name is optional: leave it off and Machine makes one up.
`machine sessions create` waits until the session is running and tells you
when it is. Add `--no-wait` if you would rather it didn't wait.

A machine takes its own memory plus 128MB of the session's memory, and 256MB
of every session is not available to machines. A machine with the default
256MB needs 384MB, and one created with `--mem 2048` needs 2176MB, so a 4G
session holds one machine of 2048MB and an 8G session holds three. A machine
holds its memory until you stop it, whether or not its program has finished.

A branch you move onto with [`machine go`](commands.md#machine-go) uses the
machine that is already running, so it needs no more memory. A branch you
start with [`machine fork`](commands.md#machine-fork) is another machine and
needs memory of its own.

[`machine runs --size`](commands.md#machine-runs) adds two columns that show
what a run takes of the session's resources. RAM is the session memory the
run's machine holds right now, which can be above the machine's own MEMORY.
DATA is what the run holds on the session's disk. A run with no machine shows
`—` for RAM.

The MEM column of
[`machine sessions list`](commands.md#machine-sessions-list) shows the memory
taken over the session's memory, for example `4.5G/8G` with two machines of
2048MB. A new machine starts when what it needs fits in the rest of the
session's memory, and is refused when it does not.

Creating a session doesn't switch you to it, so tell Machine which session to
use.

```bash
machine sessions use ci-1
```

[`machine sessions use`](commands.md#machine-sessions-use) applies to the
terminal you ran it in. If you only have one session, it needs no name at all.
After `machine sessions use ci-1`, every command that needs a machine goes to
`ci-1`. To send a single command somewhere else, put `-s` before the command,
for example `machine -s ci-2 runs`.

In a script, name the session once with `TESTFLOWS_MACHINE_SESSION`, and
every command after it goes to that session.

```bash
export TESTFLOWS_MACHINE_SESSION=ci-1
machine sessions use ci-1
machine create --disk hello
```

`TESTFLOWS_MACHINE_SESSION` names the session, and
[`machine sessions use`](commands.md#machine-sessions-use) connects this
computer to it. `machine sessions use` is needed once. A tool that starts a new
shell for each command, as an AI agent does, loses the `export` between
commands, so in that case put `-s ci-1` on each command instead. Commands that
need no session, such as `machine disks list`, ignore it.

The rest of session management looks like this:

```bash
machine sessions list
machine sessions show ci-1
machine sessions rename ci-1 ci-2
machine sessions delete ci-2
```

> **{% attention %}** Delete sessions you are not using. A session costs from
> the moment you create it, whether or not anything is running in it.
