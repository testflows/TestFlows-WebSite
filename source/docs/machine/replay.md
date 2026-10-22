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
parent took after the fork is a valid one.

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
