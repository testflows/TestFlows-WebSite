<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Getting started

## The client

You work with Machine through a client called `machine`. Install it with one
command:

```bash
curl https://testflows.com/machine/install -fsS | bash
```

That downloads a single binary named `machine` over HTTPS, checks it against the
SHA-256 checksum published next to it, and puts it in `~/.local/bin`. If the
checksum doesn't match, nothing is installed. If that folder isn't on your `PATH`
yet, the installer says so and shows the line to add for your shell. Run the same
command again whenever you want to update.

**Supported systems.** The client runs on Linux, x86_64 and arm64, and on Macs
with Apple Silicon. It needs nothing else installed, and the installer never
asks for root. It doesn't run on Intel Macs or natively on Windows; on Windows
you can use it inside WSL. On an ARM machine, a Mac with Apple Silicon
or arm64 Linux, the disks you build must still hold x86_64 programs; see
[building disks on an ARM machine](disks.md#building-disks-on-an-arm-machine). If you
need another platform,
[contact us](/contact.html?topic=machine) and tell us which one. The
[download page](/machine/download/) has the full list, and a way to check the
download yourself.

To read the installer first, install a specific version or into another folder,
check the download by hand, or uninstall, see the [download page](/machine/download/).

Run `machine` with no arguments, or with `--help`, to see every command. Each
command has its own `--help` too, and that is the place to look when a flag here
is not enough.

```bash
machine --help
machine fork --help
```

[`machine --version`](commands.md#options) prints the client's version and its license. Include the
version when you report a problem.

```bash
machine --version
```
```bash
  ---- o o o ----
 |   o       o   |
 | 1 o 10010 o 0 |
 |   o       o   |  TestFlows Machine Client YYYYMMDD-HHMM
  ---  o o oxx --
 /           xx   \
/  ^^^        xx   \
 ------------------

Copyright (C) 2026 Katteli Inc. All rights reserved.
TestFlows.com Open-Source Software Testing Framework (https://testflows.com)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, ...
```

If something does not work, [`machine ping`](commands.md#machine-ping) checks that you can reach the
service and your sessions, and how long the round trip takes.

## Signing up

Create your account on the [sign-up page](/machine/portal/signup/), or from
the terminal with [`machine account signup`](commands.md#machine-account-signup). Then sign in from the terminal.

```bash
machine login
```

Machine emails you a one-time code and asks for it. You stay signed in until
you sign out with [`machine logout`](commands.md#machine-logout). [`machine account show`](commands.md#machine-account-show) tells you who you
are signed in as.

Then set up account storage with [`machine account provision`](commands.md#machine-account-provision). The first session cannot be created until this is done.

```bash
machine account provision
```

For scripts and CI there is no need to sign in at all. Create an API key and
put it in the `TESTFLOWS_MACHINE_API_KEY` environment variable.

```bash
machine account api-keys create ci --expiry 90
```

## Your first run

Here is a whole trip, from nothing to a branch. The disk can come from the
`hello-world` example if you have [Docker](disks.md#docker-and-compose), or from a small program you compile
if you do not.

First, create a session and make it the one your commands use.

```bash
machine sessions create first --cpus 2
```
```bash
✔ Session first is running.
  Use machine sessions use first
```

```bash
machine sessions use first
```
```bash
✔ Now using session first in this terminal.
```

Next, build a disk named `hello`. Take one of the two paths.

If you have Docker, pull the hello-world example and build the disk from
that image. The `--platform` flag asks Docker for the x86_64 image a machine
runs.

```bash
docker pull --platform linux/amd64 testflows/machine-examples:latest
machine disks build --image testflows/machine-examples:latest hello
```

If you do not, compile `hello_world.c` as a static executable. [`machine disks build`](commands.md#machine-disks-build) `--binary` wraps that one file, so Docker is not needed. For a program that is not static, such as Python or Node.js, see [When the program is not static](disks.md#when-the-program-is-not-static).

```c
#include <stdio.h>

int main(void) {
    printf("hello, world\n");
    return 0;
}
```

```bash
gcc -static -o hello hello_world.c
machine disks build --binary ./hello hello
```

On an ARM machine that binary still has to be x86_64 Linux. See
[building disks on an ARM machine](disks.md#building-disks-on-an-arm-machine).

Either way, create a run from the disk. The machine waits for your commands. With
`--no-daemon` it would boot and run to the end by itself.

```bash
machine create hello-run --disk hello
```
```bash
✔ Started hello-run (whUxdR33Zad9Qxc0ASfig)
```

Now the run is waiting. It only moves when you drive it, and [`machine run`](commands.md#machine-run) is how
you drive it. The `--until tasks` part means "keep going until Linux is up."

```bash
machine run hello-run --until tasks
```
```bash
iterations: 16093  run ic: 271990491  checkpoints: 1

VCPU  EXIT       ID     RUN IC     RCB     TOTAL IC   REGS HASH          RIP                 RCX       ITER
0     HYPERCALL  16238  271990491  190026  271990491  0x785930775efa707  0xffffffff81f9eeda  43778048  16092
```

Read the last five lines the machine printed.

```bash
machine console hello-run -n 5
```
```bash
futex hash table entries: 256 (order: 2, 16384 bytes, linear)
NET: Registered PF_NETLINK/PF_ROUTE protocol family
thermal_sys: Registered thermal governor 'step_wise'
thermal_sys: Registered thermal governor 'user_space'
cpuidle: using governor ladder
```

To see the full console log, use `-n :`. Ranges use the same colon as a Python slice. Lines are numbered from 1 and both ends count, so `-n 1:` is the first line through the last.

Save the machine's state so you can come back to it, and start a branch from
that point.

```bash
machine checkpoint hello-run booted
```
```bash
  Checkpointing: writing state 100%, 1s
✔ Created checkpoint booted at entry 16239
```

```bash
machine fork hello-run --at ^booted --name try-1
```
```bash
✔ Forked hello-run/try-1 (whUxfLYSFJMDHzKaiBOvH)
```

The branch starts exactly where `booted` was taken. Notice its full name,
`hello-run/try-1`. A branch is named after its parent, a slash, and the name you
gave it. Look at the tree.

```bash
machine branches hello-run
```
```bash
● hello-run (whUxdR33Zad9Qxc0ASfig) [0, ∞)  ← current
╰─ @16239 0.693926690s+1 → ● hello-run/try-1 (whUxfLYSFJMDHzKaiBOvH) [16240, ∞)
```

When you are done, delete the runs and then the session. A run keeps its log
and checkpoints until you delete it, and a session costs money until you do.

```bash
machine delete hello-run --recursive --stop --yes
machine sessions delete first --yes
```

That's the whole loop. You ran a program, saved a point in it and branched from
there. Everything else in this page is a variation on it.
