<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

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
| `--no-daemon` | boot and run to the end by itself, instead of waiting for your commands |
| `--pin-cpu n` | run on host CPU `n`, for this start only (the default picks the least-loaded) |
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

A run executes only while you drive it. `machine run` is the way, and `--until`
says when to stop. (A run created with `--no-daemon` answers
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
under [Steering programs](steering-programs.md).

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
[SDK](python-sdk.md) does exactly that.

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

A run remembers the options you created it with: `--no-daemon`,
`--single-step`, `--limit` and `--backstop-limit`. Every `start` and `fork`
repeats them, so you type them once. `start` takes the same flags to change
them for that start only, so `machine start app --daemon` gives you a machine
to drive on a run created with `--no-daemon`. `fork` and `detach` take them
too, and the new run keeps what you gave. `--pin-cpu` is the exception: no run
remembers a CPU, so each `start` and `fork` picks the least-loaded one unless
you name it.

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
