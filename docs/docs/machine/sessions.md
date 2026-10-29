<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Sessions

Runs live in a session, and you create one with [`machine sessions create`](commands.md#machine-sessions-create).
Pick its size when you create it.

```bash
machine sessions create ci-1 --cpus 4 --mem 8G
```

`--cpus` sets the number of vCPUs, `--mem` the memory and `--storage` the
disk space. `--class` picks the hardware class, and the default comes from your
plan. [`machine sessions classes`](commands.md#machine-sessions-classes) lists
the classes, with the CPU architecture of each. A run starts only in a session
of the architecture it was recorded on.

```bash
machine sessions classes
machine sessions create arm-1 --class <name>
```

The name is optional. Leave it off and Machine makes one up. Machine waits
until the session is running and tells you when it is. Add `--no-wait` to
return once the request is accepted.

Then Machine uses the new session in this terminal, so your next command goes
to it. Add `--no-use` to keep using the session you are on. A session created
with `--no-wait` is not running yet, so it is not used.

Your first session also sets up your account's storage, so it takes longer to
create, and Machine shows this as a step of its own. To set the storage up
before that, run [`machine account provision`](commands.md#machine-account-provision).

A machine takes its memory plus 128MB of the session's memory, and 256MB of a
session is not available to machines. A machine with the default 256MB needs
384MB, and one created
with `--mem 2048` needs 2176MB, so a 4G session holds one and an 8G session
holds three. A machine holds its memory until you stop it, whether or not its
program has finished.

A branch you move onto with [`machine go`](commands.md#machine-go) uses the machine that is
already running, so it needs no more memory. A branch you start with
[`machine fork`](commands.md#machine-fork) is another machine and needs its own.

[`machine runs --size`](commands.md#machine-runs) adds two columns for what a run takes of the
session's resources. RAM is the session memory its machine holds right now. It
can be above the machine's own MEMORY. DATA is what the run holds on the
session's disk. A run
with no machine shows `—` for RAM.

The MEM column of [`machine sessions list`](commands.md#machine-sessions-list) shows the memory taken over the
session's memory, for example `4.5G/8G` with two machines of 2048MB. A new
machine starts when what it needs fits in the rest, and is refused when it
does not.

To switch to another session, tell Machine which one to use.

```bash
machine sessions use ci-1
```

[`machine sessions use`](commands.md#machine-sessions-use) applies to the terminal you ran it in.
If you only have one session, it needs no name at all.
After that, every command that needs a machine goes to `ci-1`. You can
send one command somewhere else with `-s`, for example
`machine -s ci-2 runs`. `-s` goes before the command.

In a script, name the session once with `TESTFLOWS_MACHINE_SESSION`, and
every command after it goes to that session.

```bash
export TESTFLOWS_MACHINE_SESSION=ci-1
machine sessions use ci-1
machine create --disk hello
```

The variable names the session. [`machine sessions use`](commands.md#machine-sessions-use) connects this
computer to it, and is needed once. A tool that starts a new shell for each
command, as an AI agent does, loses the `export` between commands. There, put
`-s ci-1` on each command. Commands that need no session, such as
`machine disks list`, ignore it.

You manage the rest of your sessions like this:

```bash
machine sessions list
machine sessions show ci-1
machine sessions rename ci-1 ci-2
machine sessions delete ci-2
```

> **{% attention %}** A session costs from the moment you create it, whether
> or not anything is running in it. Delete sessions you are not using.

## Idle sessions stop

A session is idle while it serves no command. Your plan sets its idle time:
10 minutes on Free, 30 on Starter and on Free with usage credits, and 60 on
Pro.
`machine account show` shows yours. When a session reaches its idle time, it
stops, and so do its runs. The runs are kept. Start one again in any session
with `machine start <run>`.

Every command sent to the session resets the idle time, from any terminal, the
SDK or the control prompt. To step away and keep the session, keep it:

```bash
machine sessions keep ci-1 30m
```

A keep holds the session idle for up to 30 minutes on Free, and an hour on
Starter, Free with usage credits and Pro. `machine sessions list` shows under
IDLE how long each session has gone without a command, and
`machine sessions show` when it stops. A session that stopped idle is listed
as `stopped idle`, with the idle time it reached under IDLE.
In the control prompt, `/keep 30m` keeps the session you are driving, and the
line under the clock shows the time left.

From Python, `client.sessions` does the same: `create`, `use`, `show`, `keep`
and `delete`. A session is a context manager, so a `with` block deletes it at
the end. [The SDK's Sessions](python-sdk.md#sessions) has the calls.
