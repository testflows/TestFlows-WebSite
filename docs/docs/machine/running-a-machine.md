<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Running a machine

## Creating a run

[`machine create`](commands.md#machine-create) makes a run from a disk and boots it. The run's name goes
first and is optional. Without one, Machine makes up a name.

```bash
machine create app --disk app --cpus 2 --mem 512
```

The defaults are 1 CPU and 256 MB of memory. A few other options are worth
knowing about:

| Option | What it does |
|---|---|
| `--no-daemon` | boot and run to the end by itself, instead of waiting for your commands |
| `--pin-cpu n` | run on host CPU `n`, for this start only (the default picks the least-loaded) |
| `--like run` | start from another run's options, then apply the ones you give |
| `--label name=value` | attach a label to the run, as many times as you like |
| `--rng`, `--rng-seed n` | give the machine random numbers, seeded with `n` (the default is 0) |
| `--fs-sync` | write to the disk as the program writes, instead of later |
| `--no-wait` | return as soon as the request is accepted |

Change the seed and the program sees different random numbers. Keep it and it
sees the same ones every time. This one is only about the random numbers the
machine asks for. For exploring thread schedules there is another seed, on
[`machine run`](commands.md#machine-run), covered next.

## Driving it

A run executes only while you drive it. [`machine run`](commands.md#machine-run) is the way, and `--until`
says when to stop. (A run created with `--no-daemon` answers
`✗ Machine not in control mode`, because the machine isn't waiting for you.)

```bash
machine run app --until tasks
```

A plain [`machine run`](commands.md#machine-run) can stop before the point you are waiting
for. With `--until`, Machine keeps going until what you asked for is true. If it never gets
there, the command exits with status 3.

These are the conditions you can wait for. [`machine run`](commands.md#machine-run) `--until` and
[`machine wait`](commands.md#machine-wait) `--for` take the same ones.

| Condition | True when |
|---|---|
| `running`, `paused`, `stopped`, `halted` | the machine is in that state |
| `ready` | the machine accepts commands |
| `tasks` | Linux is up and its task table can be read, which is before it starts anything in userland |
| `console~REGEX` | the console output matches the pattern |
| `entry>=N` | the log has reached entry N |
| `entry=+N` | N more entries have been recorded |
| `vtime>=T` | the machine's clock has reached T, a duration such as `500ms` |
| `vtime=+T` | the machine's clock has moved T from where it was |
| `/app:exit` | the program at `/app` has exited |

The last row is one example of a task condition. There are more of them
under [Steering programs](steering-programs.md).

`--iters` limits how many iterations a drive may spend, and the global
`--timeout` limits how long you are willing to wait. Whichever hits first wins.

An iteration has no fixed length. It is one dispatch of a vCPU, and it ends
where the guest next exits to the machine: after five instructions or after a
million. So no count is right in advance, and nobody can know how long a
program will run. Stop on a condition, and use `--iters` or a `vtime`
condition as a limit. Every run ends by saying how far it went:

```
iterations: 2000  run ic: 238893097  vtime: +0.383620410s
```

`vtime` is how far the machine's clock moved. A `vtime` condition is checked
between iterations, so the run stops at the end of the iteration that reaches
the time, a little late. A run that went too far is not lost:
[`machine rewind`](commands.md#machine-rewind) and [`machine go`](commands.md#machine-go) take it back to an earlier
point.

Now and then the host interrupts an entry while it is being recorded. Machine
records that entry again, and you see nothing except a short pause. `--retry`
sets how many more times one entry is tried, 2 by default. If they are all
interrupted the run stops with `Host interrupted the run at entry N. It is not
recorded.` and the [`machine rewind`](commands.md#machine-rewind) command that puts the run back at the
entry before.

## Trying different schedules

A program that uses threads can behave differently depending on how they
interleave. Machine can draw how long each stretch of execution lasts, so every
run explores a different interleaving, and `--seed` makes those draws
repeatable.

```bash
machine run app --until /usr/bin/app:exit --mode step,fast --step 1:200 --seed 1
```

`--mode` is how the machine runs: `fast`, `step`, `step-into` or `free`, or a
comma list to draw from. `--step` and `--fast` give the length of a stretch in
each mode, as a number or a range like `1:200`. `--strategy` sets how the
draws are made, `random` (the default), `golden` or `sweep`, and `--seed` is the
seed for the random and golden ones.

Combine that with branches. Fork several from one checkpoint, give each its
own seed, and keep the ones that crash. The `explore_seeds.py` example in the
[SDK](python-sdk.md) does exactly that.

A run takes checkpoints for you too. `--auto-checkpoints N` takes one every N
entries, and 0 turns them off.

If a drive or a checkpoint is taking too long, [`machine cancel app`](commands.md#machine-cancel) cancels
whichever one is in progress.

## Waiting

[`machine wait`](commands.md#machine-wait) doesn't drive anything. It watches a run, or several, and
returns when a condition holds.

```bash
machine wait --for stopped app
machine wait --for 'console~ready' app
```
```bash
✔ Reached stopped: app (whUxfLYSFJMDHzKaiBOvH) 2.1s
```

It exits with 0 when the condition is true, 2 on an error and 3 on a timeout,
so scripts can tell them apart. Remember that it only watches. Waiting for a
condition on a run nobody is driving never finishes unless you set `--timeout`.
With `--timeout 0` it checks once, and the message tells you why it failed: `The
machine was waiting for commands.`

## Looking at it

| Command | Shows |
|---|---|
| [`machine runs`](commands.md#machine-runs) | your runs, newest first (`-w` keeps the list live) |
| [`machine describe app`](commands.md#machine-describe) | the full configuration of a run |
| [`machine state app`](commands.md#machine-state) | its state and where it stands; a run with no machine reads `stopped` |
| [`machine now app`](commands.md#machine-now) | the last entry it recorded, and the time on the machine's clock |
| [`machine console app`](commands.md#machine-console) | what the machine printed (`-f` follows, `-n -20` shows the last 20 lines) |
| [`machine entries app`](commands.md#machine-entries) | the entries in its log |
| [`machine ops`](commands.md#machine-ops) | operations on runs (checkpoints, branches, switches, deletes) and how each ended, newest first; one you interrupted with Ctrl-C is still listed |
| [`machine debug log app`](commands.md#machine-debug-log) | the debug output of a run ([`machine debug err`](commands.md#machine-debug-err) shows its error and crash log) |
| [`machine dump app`](commands.md#machine-dump) | the machine's registers, code and other state (`--show` picks the sections, `--entry` reads an earlier one) |

[`machine console`](commands.md#machine-console) also takes `--entries`, if you only want what a few
entries printed.

## Interactive mode

When you are working on one run for a while, you can open a prompt for it.

```bash
machine control app
```

You issue commands to the run as slash commands, like `/checkpoint`,
`/branches` or `/rewind`. Most of the commands on this page have one. Type
`/help` to see them all. `-c` runs a single slash command and exits, as in
[`machine control app -c '/state'`](commands.md#machine-control), and [`machine control log app`](commands.md#machine-control) prints the
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

A run remembers the options you created it with: `--no-daemon`,
`--single-step`, `--limit` and `--backstop-limit`. Every `start` and `fork`
repeats them, so you type them once. `start` takes the same flags to change
them for that start only, so [`machine start app --daemon`](commands.md#machine-start) gives you a machine
to drive on a run created with `--no-daemon`. `fork` and `detach` take them
too, and the new run keeps what you gave. `--pin-cpu` is the exception: no run
remembers a CPU, so each `start` and `fork` picks the least-loaded one unless
you name it.

`delete` only removes stopped runs, unless you add `--stop`. It also refuses to
remove a run that has branches, unless you add `--recursive`. And since
[`machine delete --all`](commands.md#machine-delete) removes every run, it asks you first.

`delete` waits until the run is gone, which takes a while for a run with many
checkpoints. Add `--no-wait` and it returns as soon as the delete is accepted,
after stopping the machine if you asked it to. The delete carries on either
way, and [`machine ops`](commands.md#machine-ops) shows how it went.

To continue a run in a different session, publish it first from the session that has it.

```bash
machine sync app
```

To have a run or a disk waiting in a session before you need it, preload it.
Going the other way, [`machine offload`](commands.md#machine-offload) lists the copies in this session that
can be dropped to free space, and `-a` drops every one that isn't in use. The
durable copy stays, and starting the run brings it back.

```bash
machine preload run app
machine preload disk app
machine offload
```

[`machine cleanup`](commands.md#machine-cleanup) removes stale runs and other leftovers, and `--force` also
kills machines that have been orphaned.
