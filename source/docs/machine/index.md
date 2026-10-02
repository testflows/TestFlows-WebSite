---
layout: handbook
p: /docs/machine
title: Machine
description: Documentation for Machine.
permalink: docs/machine/index.html
---

# What is it?

**Machine** is a place to run your programs where nothing is left to chance.
It controls time, interrupts, random numbers and input from devices, and it
records all of them while your program runs. Replay the recording and the
program does exactly what it did the first time, instruction for instruction.

That gives you three things to work with:

* **Record.** Every run keeps a log of everything that could have turned out differently.
* **Replay.** Play the log back and the run repeats itself. If it failed once, it fails every time.
* **Branch.** Stop at any point, branch from it, and try something else. The original run stays as it was.

If you have ever chased a test that fails one run in fifty, you know why this
is handy. Record the failing run once, then replay it as often as you need.

You work with Machine through a client called `machine`, or from Python using
the [SDK](#Python-SDK). Both do the same things. This page starts with the
client and ends with the SDK.

> **{% attention %}** Machine is in private beta. If you don't have access yet,
> [contact us](/contact.html?topic=machine).

# Concepts

There are only a few of them, and the rest of this page builds on them.

**Disk.** What a machine boots. It is your program (or a whole application)
packaged with a small Linux system. You build one with `machine disks build`.

**Session.** A machine in the cloud that you create. It has its own CPUs, memory
and storage, and your runs live inside it. A session costs from the moment you
create it until you delete it, so delete it when you are done.

**Run.** A virtual machine booting a disk inside a session. Every run has a
name. Nearly everything in this page is something you do to a run.

**Entry.** A run writes its history as a numbered log. Each item in the log is
an entry, so entry 42 is always the same point in that run.

**Checkpoint.** A saved copy of the whole machine at one point in the log. Every
run has checkpoint 0, taken at boot, and you can add your own and name them.

**Branch.** A run that starts from another run at some point. It shares history
with its parent up to that point and has its own after that. You create one
with `machine fork` or `machine go`. Runs that grow out of one another form a
tree.

**Mark.** A second name for a branch, given after the fact. The generated name
says where a branch started. A mark says what it turned out to be,
like `crashed`.

## Points

A lot of commands take a point, which is a place in a run's history. You can
name one in several ways.

| Point | Means |
|---|---|
| `^booted` | the checkpoint named `booted` |
| `#42` | entry 42 |
| `1.5s` | a time on the guest's clock |
| `-10ms` | ten milliseconds of guest time back from where the run is now |
| `now` | where the run is now |
| `parent` | the point this run branched from |
| `root` | the start of the tree |
| `%crashed` | the branch marked `crashed` |

A branch can only start from a checkpoint. `machine go` takes any of these
points, and if the one you name isn't a checkpoint, it starts the branch at the
nearest checkpoint before it and replays the rest of the way for you.

# Getting started

## Signing up

Create your account on the [sign-up page](/machine/portal/signup/), or from
the terminal with `machine account signup`. Then sign in.

```bash
machine login
```

Machine emails you a one-time code and asks for it. You stay signed in until
you sign out with `machine logout`. `machine account show` tells you who you
are signed in as.

For scripts and CI there is no need to sign in at all. Create an API key and
put it in the `TESTFLOWS_MACHINE_API_KEY` environment variable.

```bash
machine account api-keys create ci --expiry 90
```

## The client

You get Machine as a single binary named `machine`. Put it somewhere on your
`PATH`.

Run it with no arguments, or with `--help`, to see every command. Each command
has its own `--help` too, and that is the place to look when a flag here is
not enough.

```bash
machine --help
machine fork --help
```

`machine --version` prints the client's version and its license. Include the
version when you report a problem.

```bash
machine --version
```
```bash
  ---- o o o ----
 |   o       o   |
 | 1 o 10010 o 0 |
 |   o       o   |  🛸 TestFlows Machine Client v0.1.0
  ---  o o oxx --
 /           xx   \
/  ^^^        xx   \
 ------------------

Copyright (C) 2026 Katteli Inc. All rights reserved.
TestFlows.com Open-Source Software Testing Framework (https://testflows.com)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, ...
```

If something does not work, `machine ping` checks that you can reach the
service and your sessions, and how long the round trip takes.

## Your first run

Here is a whole trip, from nothing to a branch. You will need a program
built as a static x86_64 Linux executable. We'll call it `hello`.

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

Next, build a disk around your program.

```bash
machine disks build --binary ./hello hello
```

Create a run from the disk. The `--daemon` flag tells the machine to wait for
your commands. Without it, the machine would boot and run to the end by itself.

```bash
machine create hello-run --daemon --disk hello
```
```bash
✔ Started hello-run (whUxdR33Zad9Qxc0ASfig)
```

Now the run is waiting. It only moves when you drive it, and `machine run` is how
you drive it. The `--until tasks` part means "keep going until Linux is up."

```bash
machine run hello-run --until tasks
```
```bash
iterations: 16093  run ic: 271990491  checkpoints: 1

VCPU  EXIT       ID     RUN IC     RCB     TOTAL IC   REGS HASH          RIP                 RCX       ITER
0     HYPERCALL  16238  271990491  190026  271990491  0x785930775efa707  0xffffffff81f9eeda  43778048  16092
```

Read what the machine printed.

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

# Disks

A disk is what a machine boots, and `machine disks build` makes one. You give
it exactly one source.

| Source | What it takes |
|---|---|
| `--binary path` | a static x86_64 executable, wrapped in a small image |
| `--image ref` | a Docker image, as a save tar or a name in your local Docker |
| `--compose dir` | a Compose project directory and the images its services name |

A binary or an image runs as one container. A Compose project runs every
service in it.

```bash
machine disks build --image myapp:latest app
machine disks build --compose ./deploy stack
```

The name defaults to whatever the source is called. Use `--entrypoint` to
choose the executable the service runs. Flags go before the name, and the
service's own arguments go after a `--`. This one runs `data-race` with the
argument `3`:

```bash
machine disks build --binary ./data-race race -- 3
```

By default Machine measures what the disk holds and adds a gigabyte. Use
`--size` to set the size you want. Not sure how big it will be? `--dry-run`
reports what the disk would hold without building it.

To manage your disks:

```bash
machine disks list
machine disks show app
machine disks rename app app-v2
machine disks delete app-v2
```

Deleting a disk is permanent. Machine refuses to delete one that a run still
boots, and `--force` deletes it anyway and takes those runs with it.
`machine disks transfers` shows the transfers in progress, and
`machine disks cancel` stops one.

# Sessions

Runs live in a session, and you create one with `machine sessions create`.
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

`machine sessions use` applies to the terminal you ran it in. For scripts, set
`TESTFLOWS_MACHINE_SESSION=ci-1` instead, and every command goes to that session.
If you only have one session, `machine sessions use` needs no name at all.
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

# Running a machine

## Creating a run

`machine create` makes a run from a disk and boots it. The run's name goes
first and is optional. Without one, Machine makes up a name.

```bash
machine create app --disk app --cpus 2 --mem 512
```

The defaults are 1 CPU and 256 MB of memory. A few other options are worth
knowing about:

| Option | What it does |
|---|---|
| `--daemon` | wait for your commands, so you can drive the run (without it the machine boots and runs to the end by itself) |
| `--like run` | start from another run's options, then apply the ones you give |
| `--label name=value` | attach a label to the run, as many times as you like |
| `--rng`, `--rng-seed n` | give the guest random numbers, seeded with `n` (the default is 0) |
| `--fs-sync` | write to the disk as the program writes, instead of later |
| `--no-wait` | return as soon as the request is accepted |

Change the seed and the program sees different random numbers. Keep it and it
sees the same ones every time. This one is only about the random numbers the
guest asks for. For exploring thread schedules there is another seed, on
`machine run`, covered next.

## Driving it

A run created with `--daemon` executes only while you drive it. `machine run` is
the way, and `--until` says when to stop. (Without `--daemon` you get
`✗ Machine not in control mode`, because the machine isn't waiting for you.)

```bash
machine run app --until tasks
```

Each batch of work ends when the guest talks to Machine, so a plain
`machine run` can stop sooner than you expect. With `--until`, Machine keeps
going, batch after batch, until what you asked for is true. If it never gets
there, the command exits with status 3.

These are the conditions you can wait for. `machine run --until` and
`machine wait --for` take the same ones.

| Condition | True when |
|---|---|
| `running`, `paused`, `stopped`, `halted` | the machine is in that state |
| `ready` | the machine accepts commands |
| `tasks` | Linux is up and its task table can be read, which is before it starts anything in userland |
| `console~REGEX` | the console output matches the pattern |
| `entry>=N` | the log has reached entry N |
| `entry=+N` | N more entries have been recorded |
| `/app:exit` | the program at `/app` has exited |

The last row is one example of a task condition. There are more of them
under [Steering programs](#Steering-programs).

`--iters` limits how many iterations a drive may spend, and the global
`--timeout` limits how long you are willing to wait. Whichever hits first wins.

## Trying different schedules

A program that uses threads can behave differently depending on how they
interleave. Machine can draw how long each stretch of execution lasts, so every
run explores a different interleaving, and `--seed` makes those draws
repeatable.

```bash
machine run app --until /usr/bin/app:exit --mode step,fast --step 1:200 --seed 1
```

`--mode` is how the guest runs: `fast`, `step`, `step-into` or `free`, or a
comma list to draw from. `--step` and `--fast` give the length of a stretch in
each mode, as a number or a range like `1:200`. `--strategy` sets how the
draws are made, `random` (the default), `golden` or `sweep`, and `--seed` is the
seed for the random and golden ones.

Combine that with branches. Fork several from one checkpoint, give each its
own seed, and keep the ones that crash. The `explore_seeds.py` example in the
[SDK](#Python-SDK) does exactly that.

A run takes checkpoints for you too. `--auto-checkpoints N` takes one every N
entries, and 0 turns them off.

If a drive or a checkpoint is taking too long, `machine cancel app` cancels
whichever one is in progress.

## Waiting

`machine wait` doesn't drive anything. It watches a run, or several, and
returns when a condition holds.

```bash
machine wait --for stopped app
machine wait --for 'console~ready' app
```

It exits with 0 when the condition is true, 2 on an error and 3 on a timeout,
so scripts can tell them apart. Remember that it only watches. Waiting for a
condition on a run nobody is driving never finishes unless you set `--timeout`.
With `--timeout 0` it checks once, and the message tells you why it failed: `The
machine was waiting for commands.`

## Looking at it

| Command | Shows |
|---|---|
| `machine runs` | your runs, newest first (`-w` keeps the list live) |
| `machine describe app` | the full configuration of a run |
| `machine state app` | its state |
| `machine now app` | the last entry it recorded, and the time on the guest's clock |
| `machine console app` | what the guest printed (`-f` follows, `-n 20` shows the last 20 lines) |
| `machine entries app` | the entries in its log |
| `machine ops` | operations on runs (checkpoints, branches, switches) that are pending, unfinished or failed; one you interrupted with Ctrl-C is still listed |
| `machine debug log app` | the debug output of a run (`debug err` shows its error and crash log) |
| `machine dump app` | the guest's registers, code and other state (`--show` picks the sections, `--entry` reads an earlier one) |

`machine console` also takes `--entries`, if you only want what a few
entries printed.

## Interactive mode

When you are working on one run for a while, you can open a prompt for it.

```bash
machine control app
```

You issue commands to the run as slash commands, like `/checkpoint`,
`/branches` or `/rewind`. Most of the commands on this page have one. Type
`/help` to see them all. `-c` runs a single slash command and exits, as in
`machine control app -c '/state'`, and `machine control log app` prints the
history of the commands you have issued.

## Stopping and starting

```bash
machine pause app
machine resume app
machine stop app
machine start app
machine kill app
machine delete app
```

`pause` freezes a running machine and `resume` lets it carry on. `kill` ends it
abruptly, where `stop` shuts a run down and keeps everything it recorded. `start` brings it
back at the end of its log. If the run had gone past its last checkpoint
when it stopped, Machine replays the recorded tail from that checkpoint and
tells you how many entries it replayed. Add `--no-recover` to make it
refuse instead.

`start` can also take a run back to an earlier point. `--at` replays from an
earlier checkpoint, and `--read-only` opens a checkpoint without running it
at all.

`delete` only removes stopped runs, unless you add `--stop`. It also refuses to
remove a run that has branches, unless you add `--recursive`. And since
`machine delete --all` removes every run, it asks you first.

To continue a run in a different session, publish it first from the session that has it.

```bash
machine sync app
```

To have a run or a disk waiting in a session before you need it, preload it.
Going the other way, `machine offload` lists the copies in this session that
can be dropped to free space, and `-a` drops every one that isn't in use. The
durable copy stays, and starting the run brings it back.

```bash
machine preload run app
machine preload disk app
machine offload
```

`machine cleanup` removes stale runs and other leftovers, and `--force` also
kills machines that have been orphaned.

# Checkpoints and branches

Branching is cheap, because a branch shares its parent's history instead of
copying it. That is what makes it practical to try many things from one point.

## Checkpoints

```bash
machine checkpoint app booted
machine checkpoints app
```

The name is optional. Leave it off and Machine makes one up. Checkpoints
are how you mark points you plan to come back to, like "just after boot" or
"right before the request".

Machine takes some of its own as well, named after the entry they were taken at
(like `10000`), so `machine checkpoints app` lists yours next to those.

## Starting a branch

`machine fork` creates a new branch at a point. The branch runs in its own
machine, alongside its parent, and the parent keeps running.

```bash
machine fork app                            # at the current point
machine fork app --at ^booted               # at a checkpoint
machine fork app --at ^booted --name try-1  # and give it a name
```

Give a branch a name with `--name`. If you don't, it is named after the
entry it landed on. Add `--no-start` to create the branch without starting it.

A branch's full name is its parent's name, a slash, and the name you gave it. So
`machine fork app --name try-1` makes `app/try-1`, and that full name is what
you use in every other command. `machine lineage try-1` says
`Run not found`, and `machine lineage app/try-1` works.

## Moving around

`machine fork` gives the new branch a machine of its own and leaves you where
you were. `go`, `switch` and `rewind` work in place instead: they change the
machine you are on. `detach` is the odd one out, and is explained below.

| Command | Does |
|---|---|
| `machine go app ^booted` | creates a branch at a point and switches this machine onto it, in place |
| `machine switch app app/try-1` | moves the machine onto a branch that already exists, and never creates one |
| `machine detach app --at ^booted` | copies a point into a new root, a self-contained run in a tree of its own |
| `machine rewind app to ^booted` | puts the run back at a point and throws away what came after |

`go` is the one you will use most. It creates a branch the way `fork` does, but
it doesn't start another machine. It moves the one you are on, in place.

```bash
machine go app ^booted --name g1
```
```bash
✔ Forked app/g1 (whUxiqseEZ7Si8R4osT8K) at entry 16239 and switched onto it.
```

After a `go` or a `switch`, the run you moved away from is listed as `switched`
and no longer running. `machine start app` brings it back at its tip, and tells
you how many entries it had to replay to get there. The machine you moved is now
the new branch, so talk to it by that name: `app/g1`.

A `switch` needs a branch that isn't running somewhere else. Pointing it at a
branch that is gives `✗ Already running`, so stop that one first or create it
with `--no-start`.

`rewind` changes the run itself, not a copy of it. Use it when you want to
replay from an earlier point. The run keeps its name. Machine refuses to rewind
past a branch that starts after that point, since that branch depends on entries
that would no longer exist.

`switch` takes a branch name, a mark (`%crashed`), `parent` or `root`.

`detach` is for leaving a tree behind. A branch normally shares its ancestors'
data, which is what keeps it cheap. `detach` copies everything into a new root
that owns all of its data and belongs to no tree but its own. That is much
slower than a fork, so only reach for it when you want to get rid of the
original.

If you only want a branch to have its own copy of the data, run
`machine fork --rebase`, which is quicker. Add `--lean` and Machine drops the
history it copied, so the runs it came from can be deleted.

## Seeing the tree

```bash
machine branches app          # the whole tree this run belongs to
machine lineage app/try-1     # the chain of ancestors back to the root
```

`branches` lists the newest 25 by default. `--running` shows only the ones
still running, and `--depth` keeps one level of the tree.

## Marks

When a branch turns out to be interesting, mark it.

```bash
machine marks add app/try-1 crashed
machine marks list app
```

A mark is unique within its tree, so you can use it anywhere a run is named,
written with a percent sign.

```bash
machine console %crashed
```

# Replay

Replay is what makes a recording useful. A branch can play back what its
parent recorded and Machine checks, step by step, that it gets the same result.

```bash
machine replay app/try-1
```

Replay is strict. An entry that does not reproduce what was recorded means
the run has **diverged**. Before giving up on it, Machine replays that entry
again from the nearest checkpoint before it, twice by default. Use `--retry`
to change that, or `--retry 0` to try each entry once. `--to` stops at a given
entry instead of the end.

If a run does diverge, `machine diff` shows how.

```bash
machine diff app/try-1
machine diff app/try-1 --entry 5000 --show regs,stack
```

With no second argument, `diff` compares the entry against the run it was
replayed from, and says `✔ No differences` when they match. Otherwise it prints
a hash by default, and `--show` takes any of the
sections in its help: registers, stack, page tables, timers, devices,
memory and more. Name another run to compare two recordings. A difference
there only means the recordings differ. It says nothing about determinism.

There is also `machine play`, which plays a log back without checking for
divergence. It is for when you want to see what happened, not whether it
repeated. By default it plays the parent's log, so it needs a branch. To play
another run's log, name it: `machine play app/try-1 app`.

```bash
machine play app/try-1 -n 16240:16243
machine play app/try-1 --include irq random
```

# Steering programs

By default Machine lets the guest schedule itself. Sometimes that isn't what
you want. A bug that needs one thread to run past another will not show up
if the scheduler never picks that order. Machine lets you pick it.

Everything here is recorded, so a replay repeats it exactly.

## Looking at tasks

```bash
machine tasks app
```

That lists the tasks in the guest, one row per thread, with the process each one
belongs to. You will want a thread's id, or a program's path, in the commands
below. `machine syscalls app` and `machine ints app` list the guest kernel's
system calls and interrupt vectors.

## Focus

Machine matches a program by its absolute path in the guest. Tell it which
programs to watch and steer.

```bash
machine focus app add /app
machine run app --until /app:exit
```

You can also focus on a cgroup (`cgroup=/path`) or a single process
(`tgid=12`). `focus remove` and `focus clear` take them off again.

Once a program is focused you can wait for things that happen to it. The task
conditions take the form `program:what`, where `what` is one of:

| What | Means |
|---|---|
| `exec` | the program started |
| `exit` | the program exited |
| `sched` | one of its threads was given a CPU |
| `desched` | one of its threads gave its CPU up |
| `on` | a thread is running its own code |
| `kernel` | a thread is running in the kernel |
| `off` | the thread is not on a CPU at all |

## Holding threads

```bash
machine tasks app hold 56         # take thread 56 off the run queue
machine tasks app release 56      # put it back
machine tasks app yield 56        # let its peers go first
machine tasks app slice 56 10us   # how long it runs between decisions
```

Each of these takes effect at the next scheduling decision. If you hold the
last thread that could run, there is no next decision coming, so force one
with `machine irq app preempt --vcpu all`.

There is also `pin`, which places a thread on the vCPUs you choose the next
time it wakes. Run `machine tasks pin --help` to see how to name them.

Two more things you can ask of `tasks`. `machine tasks app exits` lists the
tasks that have left and how each one ended, and `machine tasks app cgroups`
groups them by cgroup. `--focused` shows only the tasks you are steering.

## Plans

When one rule isn't enough, write a plan file. A plan is a list of clauses,
and each one says when it applies and what to do.

```
when /test:on       mode step,fast   fast=1:100k step=1:200
when /test:kernel   task-sched hold
else                mode fast
```

Machine tries the clauses in order and the last match wins, so a later
clause overrides an earlier one. `else` covers whatever nothing matched.

Each `when` names a state of a program (`/test:on` is the program running its
own code, and `/test:kernel` is the program running in the kernel). After that come the
things to choose for each stretch of execution it covers, such as the mode, how
many instructions to run, or what to do with the scheduler. `machine plan
--help` lists all of them.

```bash
machine plan app plan.txt
machine run app
```

## Interrupts and time

Inject an interrupt by name or number.

```bash
machine irq app preempt --vcpu 1
```

The interrupt is queued, then delivered at the next boundary and recorded
there, so a replay delivers it at the same place.

Time inside the guest is Machine's, not the host's. `machine vtime app rate`
changes how fast it passes, and `machine vtime app add` pushes it forward
without running anything.

```bash
machine vtime app add 5000000000    # five seconds, in nanoseconds
```

There is no way back. The guest's clock only goes forward, so to return to an
earlier time, branch there with `machine go app 1.5s`.

# Reading the disk

You can read files from a run's disk without touching the run. Reads are
pinned to a snapshot, so they never change how the machine executes.

```bash
machine artifacts ls app /var/log
machine artifacts cat app /var/log/app.log
machine artifacts cp -r app /results ./results
```

Add `@ref` to the run to read the disk as it was at a checkpoint or an entry.

```bash
machine artifacts cat app@booted /etc/hostname
machine artifacts ls app@4200 /tmp
```

# Account and billing

Most of what the account page on the website does, the client does too.

| Command | Does |
|---|---|
| `machine account show` | shows your account |
| `machine account credits` | shows your usage credits |
| `machine account activity` | lists what they were spent on |
| `machine account products list` | lists what is for sale |
| `machine account buy usage` | opens checkout for a pack of usage credits, sized in euros as listed by `products` |
| `machine account buy plan` | subscribes to a plan, or switches tier if you already have a paid one |
| `machine account upgrade`, `downgrade` | moves you to a higher or lower plan |
| `machine account cancel` | cancels the subscription: the plan stays until it renews, then drops to Free, and your usage credits stay |
| `machine account invoices` | lists your invoices |
| `machine account orders` | lists your purchases, and resumes or cancels a pending checkout |
| `machine account payment` | updates your payment method |
| `machine account portal` | opens your billing settings |
| `machine account api-keys` | creates, lists, deletes and sets the expiry of API keys |
| `machine account devices` | lists where you are signed in (`--revoke` signs one out) |
| `machine account email` | changes your email address |
| `machine account close` | closes the account, in two steps (`--cancel` stops it) |

`payment`, `portal` and `cancel` open a browser. Add `--link` to print the
address instead.

How credits are granted and used is in the
[usage credit terms](/machine/legal/usage-credit/).

Runs, logs and disks take up space in your account. `machine storage show` says
how much, and `machine storage prune` frees the space that deleted runs and
disks left behind. `machine storage prune --status` shows the current or last
prune.

# Scripting

Everything the client does can be done from a script.

* `-o json` prints machine-readable output. `-o raw` prints text without formatting values. Put the flag before the command, like `machine -o json runs`.
* `-q` turns off progress output and spinners.
* `--timeout s` gives up after that many seconds. It goes before the command too. The default is no limit, and `0` means check once.
* `--no-colors` turns off colors.
* Waiting commands exit with 3 on a timeout and 2 on an error.

```bash
machine -q --timeout 300 run app --until tasks || echo "boot did not finish"
```

# Python SDK

The SDK does what the client does, from Python. If you can type it in a
terminal, you can call it from a program.

## Installing

```bash
pip3 install testflows.machine
```

It needs Python 3.11 or later on Linux x86_64. pip installs the Machine core
that the SDK runs on, `testflows.machine.core`, along with it.

## Hello Machine

```python
import testflows.machine.v1 as machine

client = machine.Client()

with client.sessions.create(cpus=1) as session:
    client.sessions.use(session)
    with client.create(disk="hello") as run:
        run.run(until="tasks", timeout=300)
        for line in run.console(lines=20):
            print(line)
```

This creates a session, boots a run from the disk `hello` and prints the last
twenty lines of its console. Runs the SDK creates always wait for commands, as
if you had passed `--daemon`, so they move only when you call `run.run(...)`.
Leaving a `with` block deletes what it created, whether the block ends normally
or with an error. That is how you make sure a session never outlives your
program.

## It looks like the client

Every client command has a matching SDK call, and the names follow a simple
rule.

| In the client | In the SDK |
|---|---|
| a top-level command, `machine create --disk app` | a method on the client, `client.create(disk="app")` |
| a group, `machine sessions use ci-1` | an attribute of the client, `client.sessions.use("ci-1")` |
| a command that takes a run, `machine fork app --at ^boot` | a method on the run, `run.fork(at="^boot")` |
| a group that takes a run, `machine tasks app hold 56` | an attribute of the run, `run.tasks.hold(56)` |
| a positional argument | a positional argument |
| a flag like `--no-wait`, `-w` or `-f` | a keyword argument like `wait=False`, `watch=True` or `follow=True` |

So once you know the client, you know most of the SDK. The client's `--help`
is the reference for what each call takes.

## Signing in

The SDK signs in with an API key from `TESTFLOWS_MACHINE_API_KEY` if it is set.
If it isn't, it uses the login that `machine login` stored, which it shares
with the client.

A program can sign in on its own too. The one-time code arrives by email.

```python
machine.login.start("me@example.com")
client = machine.login.verify("me@example.com", code="123456")
```

`machine.login.logout()` signs out.

## Sessions

A client has a current session, like the CLI does. You can set it when you
create the client, or later.

```python
client = machine.Client(session="ci-1")      # like -s ci-1
client.sessions.use("ci-2")                  # for this client only
```

`sessions.use` only changes the session for this client. It never changes it for
the `machine` command. Without a session you can still read your account's runs:
`client.runs()`, `client.branches()` and a run's `describe()`, `lineage()`
and `checkpoints()` all work.

## Runs

Here is a typical run, from creating it to branching and replaying.

```python
run = client.create("app", disk="app", rng=True)
run.run(until="tasks")
run.focus.add("/app")
run.run(until="/app:exit")

booted = run.checkpoint("booted")
branch = run.fork(at="^booted", name="retry")
branch.replay()
```

And the calls you will reach for most often:

| Call | Does |
|---|---|
| `client.create(name, disk=..., cpus=..., ...)` | creates a run and boots it; takes every option `machine create` does |
| `client.runs()`, `client.runs["app"]` | lists runs, or finds one by name |
| `run.run(until=..., iters=...)`, `run.plan(file)` | drives it |
| `run.checkpoint(name)`, `run.checkpoints()` | saves a checkpoint, lists them |
| `run.fork(...)`, `run.go(point)`, `run.switch(branch)`, `run.detach(...)` | branches |
| `run.replay()`, `run.play(...)`, `run.diff(...)` | replays and compares |
| `run.describe()`, `run.state()`, `run.now()`, `run.entries(...)` | reads it |
| `run.console(...)` | reads what it printed |
| `run.artifacts.ls(path, at=...)`, `.cat(...)`, `.cp(...)` | reads its disk |
| `run.tasks()`, `run.focus.add(...)`, `run.irq(...)`, `run.vtime.rate(...)` | steers the guest |
| `run.start()`, `run.stop()`, `run.pause()`, `run.kill()`, `run.delete()` | lifecycle |

Every call returns a record with named fields, such as a `RunInfo` from
`describe()` or a list of `Task` from `tasks()`. Call `as_json()` on one to get
a plain dict.

## Watching and following

A listing takes `watch=True` and then gives you a new list every time
something changes. A log takes `follow=True` and gives you new lines as they
come, like `tail -f`.

```python
for runs in client.runs(states=["running"], watch=True, timeout=60):
    print([r.name for r in runs])

for line in run.console(follow=True, timeout=60):
    print(line)
```

## Choosing entries

Anything that reads entries takes the same few spellings.

| You write | Means |
|---|---|
| `200` or `(100, 200)` | that entry, or that range, both ends included |
| `"100:200"`, `"100:"`, `":200"` | a range, from 100 on, or up to 200 |
| `"-20"` | the last 20 entries |
| `slice(100, 200)` | a Python slice, so 100 through 199 |

Be careful with the last row. A pair and a string include both ends, the way
Machine's own messages do. A slice is Python's, so it stops before the end.
That makes `(100, 200)` one entry longer than `slice(100, 200)`.

`lines=` works the same way for lines of output.

## Cleaning up

A session costs from the moment you create it, and a run keeps its log and
checkpoints until you delete it. Both can be used as context managers, as
in the first example, and deleting a run takes its branches with it.

If you want to keep a run that found something, don't wrap it in a `with`
block. Nothing is deleted until you call `delete()`.

## Errors

Every exception the SDK raises is a `machine.Error`, and each one says what
went wrong.

| Exception | Raised when |
|---|---|
| `NotSignedIn` | there are no credentials |
| `Unauthorized` | a key or a sign-in code was rejected |
| `Forbidden` | your account is not allowed to do that |
| `NotFound` | nothing matches the name or id |
| `AlreadyExists` | something with that name exists |
| `InvalidArgument` | an argument is wrong, or a name matches more than one thing |
| `NotRunning` | it exists, but it is not running |
| `Conflict` | the request does not fit the thing's current state |
| `Diverged` | a replay did not reproduce what was recorded |
| `Timeout` | a wait ran out of time |
| `ServiceUnavailable` | the service could not be reached |
| `ApiError` | the service refused the request |

```python
try:
    branch.replay()
except machine.Diverged:
    print(branch.diff())
```

## Examples

The SDK comes with small scripts. Each one runs as
`python <script> --disk <name>`, creates its own session, and deletes it at the end.

| Script | Shows |
|---|---|
| `hello.py` | creates a run, boots it, reads its console |
| `checkpoint_and_fork.py` | a checkpoint after boot, and branches from it |
| `replay_verify.py` | replays a recording and names what diverged |
| `explore_seeds.py` | one branch per seed, with the failing ones marked and kept |
| `force_interleaving.py` | holds one thread while another runs past it |
| `plan_file.py` | drives a run with `when` and `else` clauses |
| `watch_and_follow.py` | watches a listing and follows a console |
| `syscall_profile.py` | counts a program's system calls and interrupts |
| `read_artifacts.py` | reads and copies files from a checkpoint's disk |
| `virtual_time.py` | changes the guest's clock rate and pushes it forward |
| `inject_interrupt.py` | injects an interrupt and replays it |
| `stop_and_resume.py` | what `stop`, `kill`, `start` and `sync` keep |
| `resume_elsewhere.py` | stops a run in one session and starts it in another |
| `ci_job.py` | a CI job with an API key, a session per job and an exit code |
| `error_handling.py` | every error and how to recover from it |

## License

The SDK is licensed under Apache 2.0. The Machine core it runs on,
`testflows.machine.core`, is not part of it and has its own license.
