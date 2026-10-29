<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Replay

Replay is what makes a recording useful. A branch can play back what its
parent recorded and Machine checks, step by step, that it gets the same result.

```bash
machine replay app/try-1
```

Replay is strict. An entry that does not reproduce what was recorded means
the run has **diverged**. Before giving up on it, Machine replays that entry
again from the nearest checkpoint before it, twice by default. Use `--retry`
to change that, or `--retry 0` to try each entry once.

`--to` stops at a point instead of the end. It takes a point as every command
does: `--to ^booted` for a checkpoint, `--to '#300'` for an entry, `--to 10ms`
for a time. The point is one of the line being replayed, so a checkpoint the
parent took after the fork is a valid one. `--trace` replays one iteration at
a time and prints each entry as it goes, which is slower.

Each entry holds hashes of the machine's state: its registers, its devices
and its timers. A replay compares them all. A run created with `--mem-hash`
also hashes the guest's memory at every entry, and one created with
`--disk-hash` its disk, and a replay of it compares those as well. Hashing
costs time at every entry, so both are off by default. A divergence of memory
or the disk alone then shows up later, once it reaches a register or a
device. A branch can turn either on or off:

```bash
machine create --disk app.img --mem-hash --disk-hash   # hash both from the start
machine fork app --at ^booted --mem-hash               # a branch that hashes memory
machine fork app --at ^booted --no-disk-hash           # a branch that does not hash the disk
```

A replay hashes memory and the disk exactly where the recording did, whatever
the replaying branch records, so a replay compares either kind of recording.
`diff` of an entry that hashed one against an entry that did not leaves it
out, and says `Memory not compared` or `Disk not compared`.

The host can interrupt an entry too. That is not a divergence. Replay prints
`Interrupted: entry N, crossing 1: host SMI` and replays the entry again,
counted against the same `--retry`. A recording does the same on its own, see
[Driving it](running-a-machine.md#driving-it).

If a run does diverge, [`machine diff`](commands.md#machine-diff) shows how.

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

There is also [`machine play`](commands.md#machine-play), which plays a log back without checking for
divergence. It is for when you want to see what happened, not whether it
repeated. By default it plays the parent's log, so it needs a branch. To play
another run's log, name it: [`machine play app/try-1 app`](commands.md#machine-play).

```bash
machine play app/try-1 -n 16240:16243
machine play app/try-1 --include irq random
```

`--include` plays only the kinds of entry you name, and `--exclude` plays every
kind but those.

### Comparing entries

`machine diff` compares one entry. A difference often starts a few entries
before the one that shows it, so `--context` also prints the entries leading
up to it, on both sides:

```bash
machine diff app/try-1 --entry 5000 --context 5      # a branch against the run it replayed
machine diff app/try-1 app/try-2:4980 --entry 5000   # entry 5000 of try-1 against entry 4980 of try-2
```

Between two recordings, such as two branches with different seeds, a
difference is expected: it shows where their paths parted.

A replay that diverges is different. Every recording must replay, so a
divergence is a bug in Machine, not in your program. Keep the run and the
branch that diverged: the recording is what reproduces it.

### At the control prompt

Replay and diff are one loop at the [control prompt](running-a-machine.md#interactive-mode).
Open it on the branch, and chain the two with `;+`, so `/diff` runs whether
the replay converged or not:

```bash
machine control app/try-1
```

```text
/replay to ^booted;+/diff
/diff 120 regs
/diff 120 context 5
/play 295:300 +irq
```

`/replay` takes `to`, `retry` and `trace` as words. `/diff 120 regs` compares
entry 120 with its recording and shows only the registers, and `context 5`
adds the five entries before it. `/play` feeds the parent's entries 295 to 300
without checking them, here only the interrupts.

### From Python

`run.replay()` returns the result instead of raising. Check `converged`, and
`diverged` holds what differed:

```python
kid = run.fork(at="^booted", name="check", start=False)
run.run(iters=200)
kid.start()
result = kid.replay()
if not result.converged:
    print(result.entry_id, result.diverged)
    print(kid.diff(entry=result.entry_id).diverged)
```

`run.replay(to="^booted", retry=5, trace=True)` takes the options of the
command. [The SDK](python-sdk.md) has the rest.

## Comparing two machines

[`machine diff`](commands.md#machine-diff) compares an entry with the one it
was replayed from. [`machine hash`](commands.md#machine-hash) compares two
machines stopped at the same point: a recording, and a branch you drove
there yourself.

```bash
machine hash app
machine hash app mem,disk
machine hash app/try-1 vcpu --vcpu 1
```

The command computes the hashes of the machine as it stands: memory, the
disk, each device, each part of each vCPU, and `irq_pending`, the hash of
the interrupts [`--irq-delay`](steering-programs.md#holding-interrupts) is
holding. It changes nothing, and the run records nothing. Memory is read
from all of RAM, so it takes as long as that reading takes. The machine
refuses commands that would change it until the command returns.
[`machine cancel`](commands.md#machine-cancel) stops it.

[`machine dump --show hash`](commands.md#machine-dump) prints what the newest
entry recorded, before its exit was handled. Memory and the disk are 0 there
unless the run hashes them at each entry. `machine hash` is after that entry,
with the exit handled, and it hashes memory and the disk whether or not the
run does at each entry.

A replay compares the hashes the recording stored at each entry. `hash` is
for two machines you have in front of you.
