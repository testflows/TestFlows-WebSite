<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Reading the disk

You can read files from a run's disk without touching the run.
[`machine fs`](commands.md#machine-fs) reads the filesystem on the disk as a
checkpoint saved it, so it never changes how the machine executes.

```bash
machine fs ls app /var/log --at ^done
machine fs cat app /var/log/app.log --at ^done
machine fs cp -r app /results ./results --at ^done
```

Every read names its checkpoint with `--at`, as a point: `^booted` for a
checkpoint by name, or `'#4200'` for the checkpoint at an entry. There is no
default. This is not a view of the running machine, and a listing that did not
say how old it is would read as one.

```bash
machine fs ls app /tmp
✗ Checkpoint required: the disk is read where a checkpoint saved it.
  List the checkpoints machine checkpoints app
  Or take one machine checkpoint app
  Then name it --at ^<name>
```

A point with no checkpoint at it is refused, and the refusal names the
checkpoint before it.

## Unsynced writes

Data the machine has not synced to its disk is not visible. A file a program
wrote a moment before the checkpoint can be missing, short or empty, because
the machine still holds it in memory.

To read the files as they are, sync in the machine, take a checkpoint, and read
at `now`:

```bash
machine exec app run -- sync
machine checkpoint app
machine fs cat app /var/log/app.log --at now
```

`now` is the checkpoint the run stands at. It names one until the machine runs
again; after that, name the checkpoint itself.

A run created with `--fs-sync` writes every change of a file to the disk as it
is made, and one created with `--fs-dirsync` does so for every change of a
directory. Both are options of [`machine create`](commands.md#machine-create)
and are off by default.

To read the files of the machine as it runs, execute a command in it:
[`machine exec app run -- ls /tmp`](commands.md#machine-exec). That reads now,
synced or not, and is recorded in the run.

At the [control prompt](running-a-machine.md#interactive-mode) the command is
`/fs`, and the point follows the word `at`:

```
/fs ls /var/log at ^done
/exec run sync;/checkpoint;/fs cat /var/log/app.log at now
```

From Python, `run.fs.ls("/var/log", at="^done")` lists a directory,
`run.fs.cat("/var/log/app.log", at="^done")` returns a file's bytes, and
`run.fs.cp("/var/log", "./logs", at="^done", recursive=True)` copies it out.
