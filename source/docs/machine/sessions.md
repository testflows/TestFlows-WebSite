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

Creating a session doesn't switch you to it. Tell Machine which one to use.

```bash
machine sessions use ci-1
```

[`machine sessions use`](commands.md#machine-sessions-use) applies to the terminal you ran it in. For scripts, set
`TESTFLOWS_MACHINE_SESSION=ci-1` instead, and every command goes to that session.
If you only have one session, [`machine sessions use`](commands.md#machine-sessions-use) needs no name at all.
After that, every command that needs a machine goes to `ci-1`. You can
send one command somewhere else with `-s`, for example
`machine -s ci-2 runs`.

You manage the rest of your sessions like this:

```bash
machine sessions list
machine sessions show ci-1
machine sessions rename ci-1 ci-2
machine sessions delete ci-2
```

> **{% attention %}** Delete sessions you are not using. A session costs from
> the moment you create it, whether or not anything is running in it.
