<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Sessions

Runs live in a session, and you create one with [`machine sessions create`](commands.md#machine-sessions-create).
Set up account storage first with [`machine account provision`](commands.md#machine-account-provision). The first session cannot be created until that is done.
Pick its size when you create it.

```bash
machine sessions create ci-1 --cpus 4 --mem 8G
```

`--cpus` sets the number of vCPUs, `--mem` the memory and `--storage` the
disk space. `--class` picks the hardware class, and the default comes from your
plan. The name is optional, so leave it off and Machine makes one up. Machine waits until the session is running and tells you when it
is. Add `--no-wait` if you would rather it didn't.

A machine takes twice its memory from the session, plus 128MB. The second
half is what its checkpoints are held in while they are written. A machine
with the default 256MB takes 640MB, and one created with `--mem 2048` takes
4224MB, so it needs a session of at least that. [`machine runs --size`](commands.md#machine-runs)
shows what each machine in a session holds, and a machine holds its memory
until you stop it, whether or not its program has finished.

Creating a session doesn't switch you to it. Tell Machine which one to use.

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

> **{% attention %}** Delete sessions you are not using. A session costs from
> the moment you create it, whether or not anything is running in it.
