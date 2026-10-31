<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Checkpoints and branches

Branching is cheap, because a branch shares its parent's history instead of
copying it. That is what makes it practical to try many things from one point.

## Checkpoints

```bash
machine checkpoint app booted
machine checkpoints app
```

The name is optional. Leave it off and the checkpoint is named after the entry
it was taken at. Checkpoints are how you mark points you plan to come back to,
like "just after boot" or "right before the request".

A name uses letters, digits, `.`, `-` and `_`, and starts with a letter or
digit. It can't be a number, because numbers name the checkpoints taken without
one, and it can't read as a time, like `10ms`, because a time names a point too.

Machine also takes its own, at the interval `create` sets, named after the entry they were taken at
(like `10000`), so [`machine checkpoints app`](commands.md#machine-checkpoints) lists yours next to those.

The DURABLE column says whether a checkpoint is in your account's storage or
only in the session. A new checkpoint shows `no` until the run is published,
with [`machine sync app`](commands.md#machine-sync) or by stopping the machine. On a branch, the listing
includes its ancestors' checkpoints, named in the ANCESTOR column. The point a
branch was forked at is listed once, as its ancestor's checkpoint, because
that is the one a fork there starts from.

`--durable` lists only the checkpoints in your account's storage, the ones
another session can start the run from:

```bash
machine checkpoints app --durable
```

From Python, `run.checkpoint("booted")` saves one and returns it, and
`run.checkpoints()` lists them.

## Starting a branch

[`machine fork`](commands.md#machine-fork) creates a new branch at a point. The branch runs in its own
machine, alongside its parent, and the parent keeps running.

```bash
machine fork app                            # at the current point
machine fork app --at ^booted               # at a checkpoint
machine fork app --at console:120           # where line 120 was printed
machine fork app --at ^booted --name try-1  # and give it a name
```

Give a branch a name with `--name`. If you don't, it is named after the
entry it landed on. Add `--no-start` to create the branch without starting it.

A branch's full name is the name of the run its tree starts from, a slash, and
the name you gave it. So [`machine fork app --name try-1`](commands.md#machine-fork) makes `app/try-1`,
and a branch of `app/try-1` named `try-2` is `app/try-2`. Every other command
takes the name you gave it, [`machine lineage try-1`](commands.md#machine-lineage),
as long as no other run has a branch of that name. When two trees both have a
`try-1`, Machine refuses the short name and lists both, so use the full name:
[`machine lineage app/try-1`](commands.md#machine-lineage).

From Python, `run.fork(at="^booted", name="try-1")` returns the branch as a
`Run`, so you drive it like any other: `branch.run(...)`, `branch.replay()`.

## Switching the machine

[`machine fork`](commands.md#machine-fork) gives the new branch a machine of its own and leaves you where
you were. `go`, `switch` and `rewind` work in place instead: they change the
machine you are on. `detach` is the odd one out, and is explained below.

| Command | Does |
|---|---|
| [`machine go app ^booted`](commands.md#machine-go) | creates a branch at a point and switches this machine onto it, in place |
| [`machine switch app app/try-1`](commands.md#machine-switch) | switches the machine onto a branch that already exists, and never creates one |
| [`machine detach app --at ^booted`](commands.md#machine-detach) | copies a point into a new root, a self-contained run in a tree of its own |
| [`machine rewind app to ^booted`](commands.md#machine-rewind) | puts the run back at a point and throws away what came after |

`go` is the one you will use most. It creates a branch the way `fork` does, but
it doesn't start another machine. It switches the one you are on, in place.

```bash
machine go app ^booted --name g1
```
```bash
✔ Branched app/g1 (whUxiqseEZ7Si8R4osT8K) at entry 16239 and switched onto it.
```

After a `go` or a `switch`, the run the machine left is listed as `switched`
and no longer running. [`machine start app`](commands.md#machine-start) brings it back at its tip, and tells
you how many entries it had to replay to get there. The machine you switched is
now the new branch, so talk to it by that name: `app/g1`.

A `switch` needs a branch that isn't running somewhere else. Pointing it at a
branch that is gets refused:

```text
✗ Already running: app/try-1.
  Stop it first machine stop app/try-1
  Then switch machine switch app app/try-1
  Or drive it where it is machine control app/try-1
```

Creating the branch with `--no-start` avoids this.

`rewind` changes the run itself, not a copy of it. Use it when you want to
record again from an earlier point. The run keeps its name. Machine refuses to rewind
past a branch that starts after that point, since that branch depends on entries
that would no longer exist.

`switch` takes a branch name, a mark (`%crashed`), `parent` or `root`.

`detach` is for leaving a tree behind. A branch normally shares its ancestors'
data, which is what keeps it cheap. `detach` copies everything into a new root
that owns all of its data and belongs to no tree but its own. That is much
slower than a fork, so only reach for it when you want to get rid of the
original.

If you only want a branch to have its own copy of the data, run
[`machine fork --rebase`](commands.md#machine-fork), which is quicker. Add `--lean` and the branch keeps no
history shared with its ancestors, so they can be deleted.

## The tree

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
machine output %crashed
```

From Python, `run.marks.add("crashed")` marks the branch, `run.marks.remove("crashed")`
takes the mark off, and `client.marks.list()` lists every mark.
