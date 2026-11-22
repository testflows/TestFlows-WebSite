<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Replay

Replay is what makes a recording useful. A branch can play back what its
parent recorded, and Machine checks at each entry that it gets the same result.

```bash
machine replay app/try-1
```

Replay is strict. An entry that does not reproduce what was recorded means
the run has **diverged**. Before it reports a divergence, Machine replays that entry
again from the nearest checkpoint before it, twice by default. Use `--retry`
to change that, or `--retry 0` to try each entry once.

`--to` stops at a point instead of the end. It takes a point as every command
does: `--to ^booted` for a checkpoint, `--to '#300'` for an entry, `--to 10ms`
for a time. The point can be any point in the history of the run being
replayed, so a checkpoint the parent took after the fork point is a valid one.

`--trace` replays one iteration at a time and prints each entry as it goes,
which is slower.

Each entry holds hashes of the machine's state: its registers, its devices
and its timers. A replay compares them all. A run created with `--mem-hash`
also hashes the guest's memory at every entry, and one created with
`--disk-hash` its disk, and a replay of it compares those as well. Hashing
costs time at every entry, so both are off by default. Without them, a
divergence in memory or on the disk alone shows up later, once it reaches a
register or a device. A branch can turn either on or off:

```bash
machine create app --disk app --mem-hash --disk-hash   # hash both from the start
machine fork app --at ^booted --mem-hash               # a branch that hashes memory
machine fork app --at ^booted --no-disk-hash           # a branch that does not hash the disk
```

A replay hashes memory and the disk exactly where the recording did, whatever
the replaying branch records, so a replay compares either kind of recording.
When `diff` compares an entry that hashed memory or the disk with an entry
that did not, it leaves that hash out and says `Memory not compared` or
`Disk not compared`.

The host can also interrupt the replay of an entry, and that is not a
divergence. Replay prints `Interrupted: entry N, crossing 1: host SMI` and
replays the entry again, counted against the same `--retry`. A recording
handles host interrupts the same way, as
[Driving it](running-a-machine.md#driving-it) describes.

## Replay margins

A replay reaches each recorded stop by letting the CPU's counter interrupt a
margin short of it, then stepping to the stop. `--limit-margin` is that margin
in conditional branches, and `--instr-margin` in instructions, for a stop
placed by an instruction count. A replay that names either uses the values it
names. Without them, it uses the larger of the run's margin and the host CPU's.
A `start`, a `start --at`, a rewind and a `fork --from` name none, so they use
the larger of the two as well.

```bash
machine replay app/try-1 --limit-margin 20000
machine replay app/try-1 --instr-margin 100000
```

A replay that passes a recorded stop diverges and says by how much. On `intel-1`,
the architecture of the `standard-ip` class, a replay given `--instr-margin 5`, far below the CPU's skid, answers:

```
divergence at entry 30274 vcpu=0
  expected: exit=INSTR_LIMIT rip=0x401800 rcx=0x419564 rcb=3001 ic=10000000 hash=0xd239c0c13ad9ba61
  actual:   exit=INSTR_LIMIT rip=0x401807 rcx=0x419564 rcb=3001 ic=10000013 hash=0xd50455744cd692e8
  diverged: rip, hash
✗ Divergence at entry 30274. The replay passed the recorded stop by 13 instructions, with its margin 5.
  Rewind to the entry before it machine rewind app/try-1 to '#30273'
  Then replay with a margin past the skid machine replay app/try-1 --instr-margin 3630
```

The suggested margin is twice the overshoot and the margin together, and
never less than the host CPU's margin. Here twice the overshoot and the
margin is 36, so the hint is the Intel CPU's margin, 3,630. For a stop
counted in branches, the hint names `--limit-margin` instead. At the
[control prompt](#at-the-control-prompt) the hints are
`/rewind to #30273` and `/replay instr-margin 3630`. A replay that reaches the stop's
address on a later pass, with other registers, gets no margin hint, because
no margin explains it.

If a run does diverge, [`machine diff`](commands.md#machine-diff) shows how.

```bash
machine diff app/try-1
machine diff app/try-1 --entry 5000 --show regs,stack
```

With no second argument, `diff` compares the entry against the run it was
replayed from, and says `✔ No differences` when they match. When they differ,
it prints the hash by default, and `--show` takes any of the
sections in its help: registers, stack, page tables, timers, devices,
memory and more. Every section except the hash needs a dump of each entry,
and a recording keeps those only when it was created or forked with
`--side-dump`. Without them, `diff` answers `Run records no side data`. Name
another run to compare two recordings. A difference
between two recordings only means they differ; it says nothing about
determinism.

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

## Comparing entries

`machine diff` compares one entry. A difference often starts a few entries
before the one that shows it, so `--context` also prints the entries leading
up to it, on both sides:

```bash
machine diff app/try-1 --entry 5000 --context 5      # a branch against the run it replayed
machine diff app/try-1 app/try-2:4980 --entry 5000   # entry 5000 of try-1 against entry 4980 of try-2
```

Between two recordings, such as two branches with different seeds, a
difference is expected: it shows where their executions start to differ.

A replay that diverges is different. Every recording must replay, so a
divergence is a bug in Machine, not in your program. Keep the run and the
branch that diverged: the recording is what reproduces it.
[Open an issue](https://github.com/testflows/Machine/issues/new/choose) with the session, the run, the branch,
the entry where it diverged and the commands you ran.

## At the control prompt

At the [control prompt](running-a-machine.md#interactive-mode), `/replay` and
`/diff` run one after the other on the same branch. Open the prompt on the
branch, and chain the two with `;+`, so `/diff` runs whether the replay
converged or not:

```bash
machine control app/try-1
```

```text
/replay to ^booted;+/diff
/diff 120 regs
/diff 120 context 5
/play 295:300 +irq
```

`/replay` takes `to`, `retry`, `trace`, `limit-margin` and `instr-margin` as
words. `/diff 120 regs` compares
entry 120 with its recording and shows only the registers, and `context 5`
shows the five entries up to and including entry 120. `/play` plays the parent's entries 295 to 300
without checking them, here only the interrupts.

## From Python

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
machine hash app/try-1 vcpu --vcpu 0
```

The command computes the hashes of the machine as it stands: memory, the
disk, each device, each part of each vCPU, and `irq_pending`, the hash of
the interrupts [`--irq-delay`](steering-programs.md#holding-interrupts) is
holding. It changes nothing, and the run records nothing. Memory is read
from all of RAM, so it takes as long as that reading takes. Until `hash`
returns, the machine refuses commands that would change it.
[`machine cancel`](commands.md#machine-cancel) stops the `hash`.

[`machine dump --show hash`](commands.md#machine-dump) prints what the newest
entry recorded, before its exit was handled. Memory and the disk are 0 there
unless the run hashes them at each entry. `machine hash` reads the state after
that entry, with the exit handled, and it hashes memory and the disk whether or not the
run does at each entry.

A replay compares the hashes the recording stored at each entry. `hash` is
for two machines you have in front of you.
