<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

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
