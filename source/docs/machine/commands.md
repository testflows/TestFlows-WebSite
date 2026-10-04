<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Commands

`machine --help` lists these commands, in this order. The options apply to every
command. Add `--help` after a command to list its own options. Where a command
takes further commands, those follow it, so each one has a heading.

## Options

| Option | Does |
|---|---|
| `-o`, `--output` | Output format: text, wide, raw, or json. The default is text. Wide adds columns to list output. |
| `--version` | Show version and license. |
| `--no-colors` | Disable terminal color highlighting. |
| `--debug` | Show the messages exchanged with the service. |
| `--api-url` | Cloud API base URL. Overrides `TESTFLOWS_MACHINE_API_URL` and the default. |
| `-s`, `--session` | Target session, by name, id, or unique prefix. |
| `--timeout` | Give up after S seconds, for commands that wait. The default is no limit. 0 means check once. |
| `-q`, `--quiet` | No progress or spinners. |

## machine runs

List runs. See [Looking at it](running-a-machine.md#looking-at-it).

Lists runs from the durable catalog, newest first.

The listing shows the newest 25. Use `--limit` for a different page size. Naming
a run limits the listing to its tree. Use `--roots` for one row per tree, and
`-o` wide or `--no-trunc` for full run ids.

```
usage: machine runs [-h] [-s [^]state] [--running] [--roots] [--label name=value] [--flag name[=value]] [--disk name|id] [--parents mode] [--synced | --not-synced] [--since date|age] [--until date|age] [--sort field] [--reverse] [--limit n]
                    [--offset n] [--no-trunc] [--size] [-w]
                    [root]
```

| Argument | Does |
|---|---|
| `root` | Show one tree, by its root |

| Option | Does |
|---|---|
| `-s, --state [^]state` | Filter by state: running, paused, recovering, read-only, stopped, killed, terminated, died, failed (repeat = OR; ^ excludes) |
| `--running` | Show only running runs, the same as `-s` running |
| `--roots` | One row per tree instead of every run, with its running N/M |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--flag name[=value]` | Filter by a run flag (repeatable; matches all) |
| `--disk name\|id` | Filter by the disk a run boots |
| `--parents mode` | Filter by where a run reads data parents: local, remote |
| `--synced` | Show only runs published to shared storage |
| `--not-synced` | Show only runs with nothing published |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: created) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n runs (default: 25) |
| `--offset n` | Skip the first n runs |
| `--no-trunc` | Show full run ids |
| `--size` | Measure and show size |
| `-w, --watch` | Watch for changes |

## machine ops

List operations. See [Looking at it](running-a-machine.md#looking-at-it).

Lists operations on runs and how they finished.

The listing shows the newest 25. Use `--limit` for a different page size. Shows
pending, unfinished and failed by default; use `-s` done for the rest. A rewind
left unfinished is owed by its run, and the run's next start finishes it. An
operation outlives the command that started it, so one interrupted with Ctrl-C
is still found here by its id. For work on the account's repository, see machine
storage ops.

```
usage: machine ops [-h] [--op-id id] [-s [^]state] [--type type] [--since date|age] [--until date|age] [--limit n] [--offset n] [--no-trunc] [-w] [run]
```

| Argument | Does |
|---|---|
| `run` | Show operations on one run |

| Option | Does |
|---|---|
| `--op-id id` | Show one operation, by its id (ignores `-s` and `--type`) |
| `-s, --state [^]state` | Filter by state: pending, unfinished, done, failed (default: pending, unfinished, failed; repeat = OR; ^ excludes) |
| `--type type` | Filter by kind: checkpoint, branch, switch (repeat = OR) |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--limit n` | Show at most n operations (default: 25) |
| `--offset n` | Skip the first n operations |
| `--no-trunc` | Show full run ids |
| `-w, --watch` | Watch for changes |

## machine describe

Describe a run. See [Looking at it](running-a-machine.md#looking-at-it).

Show full configuration and details of a run.

```
usage: machine describe [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine state

Get run state. See [Looking at it](running-a-machine.md#looking-at-it).

Show the current state of a run.

```
usage: machine state [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine now

Show where a run is. See [Looking at it](running-a-machine.md#looking-at-it).

Shows where a run is.

Prints the entry the run last recorded, the vtime it carries and the position
within that vtime, then the vCPU that ran and its RIP. The vtime and entry
VALUES are what `--at` accepts; the line around them is not an entry. Nothing
moves.

```
usage: machine now [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine create

Create a new run. See [Creating a run](running-a-machine.md#creating-a-run).

Creates a new run and brings it up.

The machine waits for commands; `--no-daemon` runs it to completion instead. The
run keeps its run options, `--daemon`, `--single-step`, `--limit` and
`--backstop-limit`, and every later start and fork repeats them unless one names
others. Waits until the machine accepts commands. Use `--timeout` to bound the
wait, or `--no-wait` to return once the request is accepted.

```
usage: machine create [-h] [--like run] [--label name=value] [--no-wait] [--disk disk] [--mem size] [--cpus n] [--mem-type {auto,hugepages}] [--mem-mode {auto,map,lazy}] [--fs-sync | --no-fs-sync] [--fs-dirsync | --no-fs-dirsync]
                      [--fb type] [--rng | --no-rng] [--rng-seed n] [--daemon | --no-daemon] [--single-step | --no-single-step] [--rdtsc-exit | --no-rdtsc-exit] [--limit n] [--backstop-limit n] [--pin-cpu n] [--vtime-base n]
                      [--vtime-rate rate] [--vtime-io-cost ns] [--vtime-rdtsc-cost ns] [--vtime-pause-cost ns] [--auto-checkpoints n] [--side-dump | --no-side-dump] [--side-trace | --no-side-trace]
                      [name]
```

| Argument | Does |
|---|---|
| `name` | Name for the new run, defaulting to a generated one |

| Option | Does |
|---|---|
| `--like run` | Inherit options from another run, overridden by explicit ones |
| `--label name=value` | Attach a label, repeatable; an empty value removes an inherited one |
| `--no-wait` | Return without waiting |

**Machine options**

| Option | Does |
|---|---|
| `--disk disk` | Disk to boot |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: 256) |
| `--cpus n` | Number of CPUs (default: 1) |
| `--mem-type {auto,hugepages}` | Machine RAM backing: auto (default) or hugepages (local only) |
| `--mem-mode {auto,map,lazy}` | Cold RAM restore: auto (default), map (4K pages only), or lazy (any backing) |
| `--fs-sync, --no-fs-sync` | Mount filesystem with sync (default: off) |
| `--fs-dirsync, --no-fs-dirsync` | Mount filesystem with dirsync (default: off) |

**Device options**

| Option | Does |
|---|---|
| `--fb type` | Framebuffer type: vnc, gtk, sdl, or none |
| `--rng, --no-rng` | Enable virtio RNG |
| `--rng-seed n` | RNG seed (default: 0) |

**Execution options**

| Option | Does |
|---|---|
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: on) |
| `--single-step, --no-single-step` | Run in step mode (applies only for non-daemon runs) |
| `--rdtsc-exit, --no-rdtsc-exit` | Record an entry for every RDTSC exit (applies only for non-daemon runs) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: 0) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--vtime-base n` | The vtime base (Unix timestamp, default: 2026-03-01) |
| `--vtime-rate rate` | The vtime rate (float or num/den, default: 10) |
| `--vtime-io-cost ns` | IO exit vtime cost in ns (default: 2000) |
| `--vtime-rdtsc-cost ns` | RDTSC exit vtime cost in ns (default: the IO cost) |
| `--vtime-pause-cost ns` | Vtime cost of each PAUSE in ns (default: 2000) |
| `--auto-checkpoints n` | Checkpoint every n entries, 0 for never (default: scaled by memory, 10000 per 512MB) |

**Run log options**

| Option | Does |
|---|---|
| `--side-dump, --no-side-dump` | Record a per-entry debug dump in the run log (default: off) |
| `--side-trace, --no-side-trace` | Record a per-entry execution trace in the run log (default: off) |

## machine fork

Run a new branch concurrently. See [Starting a branch](checkpoints-and-branches.md#starting-a-branch).

Forks a new branch from a run and starts it alongside the parent.

The parent keeps running and the terminal stays attached to it. Without `--at`,
the branch is forked at the current point, reusing a checkpoint there if one
exists.

The branch keeps the parent's run options; `--daemon`, `--single-step`,
`--limit` and `--backstop-limit` replace them, and the branch keeps those
instead. Its machine runs on the least-loaded host CPU unless `--pin-cpu` names
one.

Waits until the branch accepts commands. Use `--timeout` to bound the wait, or
`--no-wait` to return once the request is accepted.

```
usage: machine fork [-h] [--at point [point ...]] [--name name] [--rebase] [--depth n] [--lean] [--no-start] [--side-dump | --no-side-dump] [--side-trace | --no-side-trace] [--no-wait] [--daemon | --no-daemon]
                    [--single-step | --no-single-step] [--limit n] [--backstop-limit n] [--pin-cpu n]
                    run
```

| Argument | Does |
|---|---|
| `run` | Run to fork from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new branch starts at: ^checkpoint, #entry, a time, -10ms back, now, parent [n], root, or %mark |
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, drop the absorbed history so those runs become deletable |
| `--no-start` | Create the branch without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, for non-daemon runs (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

## machine stop

Stop a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Stops a running machine gracefully.

Waits until the machine is gone, as with wait `--for` stopped. A machine that
has already exited is a success. Use `--timeout` to bound the wait, or
`--no-wait` to return once the request is accepted.

```
usage: machine stop [-h] [-a] [--dry-run] [--no-wait] [run]
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Stop all running machines |
| `--dry-run` | List what would be stopped without stopping it |
| `--no-wait` | Return without waiting |

## machine pause

Pause a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Pauses a running machine.

Waits until it is paused. Use `--timeout` to bound the wait, or `--no-wait` to
return as soon as the request is accepted.

```
usage: machine pause [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

## machine resume

Resume a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Resumes a paused machine.

Waits until it can accept commands. Use `--timeout` to bound the wait, or
`--no-wait` to return as soon as the request is accepted.

```
usage: machine resume [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

## machine kill

Kill a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Kills a machine, saving its state first when it still can.

The machine is asked to stop and save, as stop does, and is signalled if it does
not go within a few seconds; a machine that did not save has its tip replayed by
the next start, and kill says so. Waits until it is gone, the same as wait
`--for` stopped. Already gone is success. Use `--timeout` to bound the wait, or
`--no-wait` to return as soon as the request is accepted.

```
usage: machine kill [-h] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

## machine start

Start a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Starts an existing run.

A stopped run resumes at its tip. A run that stopped past its last checkpoint
replays its recorded tail from that checkpoint to reach the tip, and says how
many entries it replayed; `--no-recover` refuses instead. A branch that was
created but never ran starts in a new process, and its parent keeps running.

The machine runs with the run's own run options; `--daemon`, `--single-step`,
`--limit` and `--backstop-limit` replace them for this start only, and
`--pin-cpu` names the host CPU, the least-loaded by default.

Waits until the machine accepts commands. Use `--at` to replay from an earlier
checkpoint, `--read-only` to open a checkpoint without replaying, `--force` to
stop a running instance first, `--timeout` to bound the wait, or `--no-wait` to
return once the request is accepted.

```
usage: machine start [-h] [-f] [--read-only] [--recover | --no-recover] [--at checkpoint] [--parents mode] [--daemon | --no-daemon] [--single-step | --no-single-step] [--limit n] [--backstop-limit n] [--pin-cpu n] [--no-wait] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-f, --force` | Stop a running instance first, then start |
| `--read-only` | Start read-only at a checkpoint, unable to run or record |
| `--recover, --no-recover` | Replay a tip that was never checkpointed from the last checkpoint (default: on) |
| `--at checkpoint` | Checkpoint to replay to the tip from, or to open with `--read-only` |
| `--parents mode` | Read data parents from the session (local) or the published tree (remote) |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, for non-daemon runs (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |
| `--no-wait` | Return without waiting |

## machine delete

Delete a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Remove a stopped run and its artifacts.

The first operand names the run to remove; `-a` removes every run, and `--disk`
removes every run that boots one disk, naming it or its id. Use `-c` `-a` to
resume interrupted delete operations.

```
usage: machine delete [-h] [-a] [--disk name|id] [-r] [-y] [--stop] [-f] [-c] [--full-scan] [--dry-run] [run]
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Delete all runs, or cleanup all interrupted deletes (with `-c`) |
| `--disk name\|id` | Delete every run that boots this disk |
| `-r, --recursive` | Delete branch and all descendants |
| `-y, --yes` | Skip the confirmation prompt |
| `--stop` | Stop running machines before deleting |
| `-f, --force` | Implies `--stop`, and deletes a run whose machine is already gone or whose process was replaced |
| `-c, --cleanup` | Resume interrupted delete operations |
| `--full-scan` | Scan all branches instead of using index (with `-c`) |
| `--dry-run` | List what would be deleted/recovered without acting |

## machine preload

Preload into a session. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Fetches a run or a disk onto this session.

Takes any run or disk in the catalog, so a run can be brought here to start
later, or a disk put in place before a run is created against it. `-a` fetches
the data parents and boot disks this session's runs need. Already there is fine.
Needs a session; the local service has no durable copy to fetch from.

```
usage: machine preload [-h] [-a] {run,disk} ...
```

| Option | Does |
|---|---|
| `-a, --all` | Everything this session's runs need |

### machine preload run

Preload a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Preloads a run into a session.

Fetches the run from durable storage onto the session so it is there before it
is needed. Already there is fine. The disk the run boots is rematerialized with
it.

```
usage: machine preload run [-h] [-a] [run]
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Every data parent this session needs |

### machine preload disk

Preload a disk. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Preloads a disk into a session.

Fetches the account disk onto the session so it is there before a start. Already
there is fine.

```
usage: machine preload disk [-h] [-a] [disk]
```

| Argument | Does |
|---|---|
| `disk` | Disk name or id |

| Option | Does |
|---|---|
| `-a, --all` | Every boot disk this session's runs need |

## machine offload

Offload session copies. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Lists or drops this session's local copies.

Bare offload lists this session's own run folders and disk files that can be
dropped to free its storage, and counts the ones in use. The run and disk
subcommands drop one kind. `-a` drops every run and disk not in use. The durable
copy stays. Start or preload brings a run folder back; the next start
rematerializes a disk. Needs a session; the local service has nowhere to offload
to.

```
usage: machine offload [-h] [--runs] [--disks] [-a] {list,run,disk} ...
```

| Option | Does |
|---|---|
| `--runs` | Only session run folders |
| `--disks` | Only session disk files |
| `-a, --all` | Every run and disk not in use |

### machine offload list

List what can be offloaded. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Lists this session's copies that can be dropped to free its storage.

Only copies on this session, and only the ones not in use; the rest are counted
below the table. Use `--runs` or `--disks` to show one kind. Omit both, or pass
both, to show both.

```
usage: machine offload list [-h] [--runs] [--disks]
```

| Option | Does |
|---|---|
| `--runs` | Only session run folders |
| `--disks` | Only session disk files |

### machine offload run

Offload a run. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Offloads a run from a session.

Drops the session's local folder and frees its storage; the run itself stays on
durable storage. Stop does not do this. Start or preload brings the folder back.
Does not drop the disk the run boots.

```
usage: machine offload run [-h] [-a] [run]
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-a, --all` | Every run not in use |

### machine offload disk

Offload a disk. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Offloads a disk from a session.

Drops the session file; the account disk stays. A live machine that boots it
refuses. The next start rematerializes it.

```
usage: machine offload disk [-h] [-a] [disk]
```

| Argument | Does |
|---|---|
| `disk` | Disk name or id |

| Option | Does |
|---|---|
| `-a, --all` | Every disk not in use |

## machine branches

Show branch tree. See [Seeing the tree](checkpoints-and-branches.md#seeing-the-tree).

Shows the branch tree.

The listing shows the newest 25 branches. Use `--limit` for a different page
size. Use `--depth` to keep one level of the tree, 0 for the roots. Naming any
run in a tree, root or branch, limits the listing to that tree.

```
usage: machine branches [-h] [--running] [--depth n] [--since date|age] [--until date|age] [--sort field] [--reverse] [--limit n] [--offset n] [-w] [run]
```

| Argument | Does |
|---|---|
| `run` | Show only this run's tree |

| Option | Does |
|---|---|
| `--running` | Show only running branches |
| `--depth n` | Show only branches at this depth from the root, 0 is the root |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: created) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n branches (default: 25) |
| `--offset n` | Skip the first n branches |
| `-w, --watch` | Watch for changes |

## machine lineage

Show branch lineage. See [Seeing the tree](checkpoints-and-branches.md#seeing-the-tree).

Show the lineage chain for a branch.

```
usage: machine lineage [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine marks

List marks. See [Marks](checkpoints-and-branches.md#marks).

Lists marks.

A mark is a second name for a branch, unique within its tree. Written %mark, it
names the branch anywhere a run is named. Without a run, every tree's marks are
listed; with one, the marks of that run's tree. No running machine is needed.

```
usage: machine marks [-h] {list,add,remove} ...
```

### machine marks list

List marks. See [Marks](checkpoints-and-branches.md#marks).

Lists marks.

Every tree's, or one run's tree when a run is named.

```
usage: machine marks list [-h] [run]
```

| Argument | Does |
|---|---|
| `run` | Run name |

### machine marks add

Add a mark. See [Marks](checkpoints-and-branches.md#marks).

Puts a mark on a branch.

Marking a branch again with the same word succeeds. A word another branch in the
tree already holds is refused and stays with that branch.

```
usage: machine marks add [-h] run mark
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `mark` | The mark to add |

### machine marks remove

Remove a mark. See [Marks](checkpoints-and-branches.md#marks).

Takes a mark off a branch.

Refused when the branch does not carry it.

```
usage: machine marks remove [-h] run mark
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `mark` | The mark to remove |

## machine tasks

List tasks in a machine. See [Looking at tasks](steering-programs.md#looking-at-tasks).

Lists the tasks running inside a machine.

One row per task, keyed by tid; tgid is the process. The table is rebuilt
whenever the machine forks, execs or exits a task. Use `--vcpu` to list only one
vCPU's, `--focused` for only the tasks focus is steering, and cgroups to list
the same tasks grouped by cgroup.

hold takes a thread off the runqueue, so the scheduler cannot pick it. yield
leaves it runnable but behind its peers, and does nothing when no peer is
runnable. release is the inverse of both. All three name a tid.

slice sets how long a thread runs between scheduling decisions, as a duration
with a unit: 10us, 0.6ms, 750000ns. Use default for the kernel's own. It
survives release.

Each mark acts at the vCPU's next scheduling decision. Holding the last runnable
thread leaves nothing to run and no decision coming, so a release then needs one
forced with irq preempt `--vcpu` all.

exits lists the tasks that have left the table and how each one ended, newest
last. The machine records them as it reaps, so the list survives a checkpoint and
a replay; it keeps a bounded number and says how many it dropped.

```
usage: machine tasks [-h] [--vcpu n] [--focused] run {cgroups,exits,hold,yield,release,slice,pin} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--vcpu n` | Only tasks on this vCPU |
| `--focused` | Only the tasks focus is steering |

### machine tasks cgroups

List the tasks grouped by cgroup. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run cgroups [-h] [--vcpu n]
```

| Option | Does |
|---|---|
| `--vcpu n` | Only tasks on this vCPU |

### machine tasks exits

List the tasks that have exited, and how. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run exits [-h]
```

### machine tasks hold

Take a thread off the runqueue. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run hold [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

### machine tasks yield

Put a thread behind its peers. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run yield [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

### machine tasks release

Undo a hold or a yield. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run release [-h] tid
```

| Argument | Does |
|---|---|
| `tid` | Thread id |

### machine tasks slice

Set how long a thread runs between decisions. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run slice [-h] tid duration|default
```

| Argument | Does |
|---|---|
| `tid` | Thread id |
| `duration\|default` | Duration with a unit, or default |

### machine tasks pin

Place a thread on one or more vCPUs when it next wakes. See [Holding threads](steering-programs.md#holding-threads).

```
usage: machine tasks run pin [-h] tid set|free|none
```

| Argument | Does |
|---|---|
| `tid` | Thread id |
| `set\|free\|none` | vCPUs to place the thread on, such as 1 or 0-2; free for any, none for no vCPU |

## machine syscalls

List the machine's system calls. See [Looking at tasks](steering-programs.md#looking-at-tasks).

Lists the machine's system calls, by number.

A name filters the list to calls whose name contains that text. A task instead
`--` a tid, tgid, absolute path or cgroup=path `--` shows that task's syscall
histogram, counted while its focus entry was armed with focus add <path>
+syscalls.

```
usage: machine syscalls [-h] run [name|tid|tgid|path]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `name\|tid\|tgid\|path` | Filter the list, or a task to show its histogram |

## machine ints

List the machine's interrupt vectors. See [Looking at tasks](steering-programs.md#looking-at-tasks).

Lists the machine's interrupt vectors and their handlers.

One row per IDT vector the machine has a handler for, the vector in hex as the
table is indexed. A name filters to handlers whose name contains that text. A
task instead `--` a tid, tgid, absolute path or cgroup=path `--` shows that
task's interrupt histogram, counted while its focus entry was armed with focus
add <path> +ints.

```
usage: machine ints [-h] run [name|tid|tgid|path]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `name\|tid\|tgid\|path` | Filter the list, or a task to show its histogram |

## machine focus

Show or change which tasks are steered. See [Focus](steering-programs.md#focus).

Shows which tasks a machine steers.

An entry is the program's absolute path, matched exactly, or cgroup=<path> to
match the task's cgroup, or tgid=<n> to name a process by id (a task's tgid is
shown in tasks). Use add and remove to change the list and clear to empty it.

```
usage: machine focus [-h] run {add,remove,clear} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

### machine focus add

Steer another program. See [Focus](steering-programs.md#focus).

```
usage: machine focus run add [-h] path|cgroup=path|tgid=n [+syscalls|+ints ...]
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|tgid=n` | Program path, cgroup, or process id to match |
| `+syscalls\|+ints` | Count this program's syscalls or interrupts |

### machine focus remove

Stop steering a program. See [Focus](steering-programs.md#focus).

```
usage: machine focus run remove [-h] path|cgroup=path|tgid=n
```

| Argument | Does |
|---|---|
| `path\|cgroup=path\|tgid=n` | Program path, cgroup, or process id to match |

### machine focus clear

Steer nothing. See [Focus](steering-programs.md#focus).

```
usage: machine focus run clear [-h]
```

## machine irq

Inject an interrupt into a machine. See [Interrupts and time](steering-programs.md#interrupts-and-time).

Injects an interrupt into a machine's vCPUs.

The vector is a name from the kernel's irq_vectors.h or a number. preempt is
0xf5, the machine's reschedule; reschedule is 0xfd, the kernel's own.

The vector is delivered as given. It reaches the handler the machine's kernel
has installed for it, and a vector with no handler is a spurious interrupt.
Vectors below 32 are CPU exceptions and are refused.

The interrupt is queued when the command returns. It is delivered and recorded
at the next dispatch boundary, and a replay repeats it there. Step first to
choose that boundary.

```
usage: machine irq [-h] [--vcpu n] [--nmi] run [vector]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `vector` | Vector: a name such as preempt, or a number 32-255 |

| Option | Does |
|---|---|
| `--vcpu n` | Which vCPU takes it, or all (default: the last entry's) |
| `--nmi` | Deliver as an NMI rather than a fixed interrupt |

## machine vtime

Show or change the machine's clock. See [Interrupts and time](steering-programs.md#interrupts-and-time).

Shows a machine's clock.

The rate is nanoseconds of machine time per unit of machine work, and it decides
whether a timer is due when a dispatch ends; the instruction limit decides where
that is. Both are needed to place a tick. Use rate to change it and add to push
the clock forward without running the machine. There is no way back: the clock
drives the machine's TSC, which never goes backwards, so use fork `--at` to return
to an earlier point.

```
usage: machine vtime [-h] run {rate,add} ...
```

| Argument | Does |
|---|---|
| `run` | Run name |

### machine vtime rate

Set the rate. See [Interrupts and time](steering-programs.md#interrupts-and-time).

```
usage: machine vtime run rate [-h] rate
```

| Argument | Does |
|---|---|
| `rate` | Rate, or num/den |

### machine vtime add

Push the clock forward. See [Interrupts and time](steering-programs.md#interrupts-and-time).

```
usage: machine vtime run add [-h] time
```

| Argument | Does |
|---|---|
| `time` | Time to add, such as 1s or 250ms; a bare number is nanoseconds |

## machine checkpoints

List checkpoints. See [Checkpoints](checkpoints-and-branches.md#checkpoints).

Lists the checkpoints of a branch.

The listing shows the first 25 checkpoints. Use `--limit` for a different page
size. Read from the database, so no active run is required. The durable column
reports whether a checkpoint has been synced to durable storage. Use `-o` json
for an object of run_id, hosted and checkpoints rather than a bare list.

```
usage: machine checkpoints [-h] [--durable] [--since date|age] [--until date|age] [--sort field] [--reverse] [--limit n] [--offset n] [-w] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--durable` | Show only durable checkpoints |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--sort field` | Sort field (default: entry) |
| `--reverse` | Reverse sort order |
| `--limit n` | Show at most n checkpoints (default: 25) |
| `--offset n` | Skip the first n checkpoints |
| `-w, --watch` | Watch for changes |

## machine cleanup

Remove stale runs. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Remove stale runs and clean up leftovers.

```
usage: machine cleanup [-h] [-f]
```

| Option | Does |
|---|---|
| `-f, --force` | Also hard-kill orphaned machines and remove entries whose machine is already gone |

## machine debug

View run debug output. See [Looking at it](running-a-machine.md#looking-at-it).

Shows debug or error output from a run.

```
usage: machine debug [-h] {log,err} ...
```

### machine debug log

Show debug output. See [Looking at it](running-a-machine.md#looking-at-it).

Shows the debug log of a run.

Use `-n` to select lines, and `-f` to follow new output.

```
usage: machine debug log [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `-f, --follow` | Follow new output (like tail `-f`) |

```
line selection (-n):
  -n -20         Last 20 lines
  -n 20          Line 20
  -n 100:200     Lines 100 through 200
  -n 50:         From line 50 to the end
  -n :50         Lines 1 through 50
  -n :           Every line
```

### machine debug err

Show the error and crash log. See [Looking at it](running-a-machine.md#looking-at-it).

Shows the error and crash log of a run.

Use `-n` to select lines, and `-f` to follow new output.

```
usage: machine debug err [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `-f, --follow` | Follow new output (like tail `-f`) |

```
line selection (-n):
  -n -20         Last 20 lines
  -n 20          Line 20
  -n 100:200     Lines 100 through 200
  -n 50:         From line 50 to the end
  -n :50         Lines 1 through 50
  -n :           Every line
```

## machine run

Run vCPU(s). See [Driving it](running-a-machine.md#driving-it).

Runs one or more vCPU iterations.

Use `--until` to drive batches until a wait predicate holds. console~ means
boot-done; halted and activity=idle do not. Use `--timeout` before the command
to cancel the in-flight run. The default is no limit; 0 checks once without
batching.

`--iters` is an upper bound, not a count. A batch also ends at every context
switch of a focused task and where a task reaches its own code. Without
`--until` that ends the run; with it the drive continues from the next batch.
The response reports how many iterations ran.

An iteration is ONE vCPU dispatch, and every parameter is drawn for it: the
mode, the limit, the task marks and the interrupt all apply to the task on that
one vCPU. Without `--vcpu` a scheduling cycle dispatches every vCPU, so it
spends up to that many iterations; `--iters` 100 on four vCPUs buys 100
dispatches, not 400.

With `--until`, the two are bounds and the first to fire wins: `--iters` 500
`--until` on stops at 500 iterations or when a focused task takes a vCPU.
Without `--iters` nothing bounds the drive but `--timeout`, so `--until` tasks
runs a whole boot. A SPAN bounds nothing either: it draws a batch size per
dispatch, so `--iters` 100:500 `--until` on keeps going. Exit 3 whenever the
predicate is not reached.

`--when` bounds nothing. It names what must be true for the clause to apply to a
dispatch; a dispatch it excludes runs free, up to the crossing into the subject.
So `--when` /test:on `--until` /test:exit perturbs that program while its own
code runs, free runs while it is in the kernel or off the CPU, and stops when it
is gone. `--iters` then counts dispatches the clause applied to. `--when` takes
on, kernel and off: a state, not an edge.

This one clause is the CLI. More than one is a plan file: machine plan <run>
<file>, then drive with plain run.

```
usage: machine run [-h] [--limit span] [--backstop-limit n] [--retry n] [--strategy name] [--seed n] [--vcpu span] [--iters span] [--until predicate] [--rip addr] [--rcx addr] [--target-ic n] [--irqblk] [--rdtsc-exit] [--no-idle-skip]
                   [--auto-checkpoints n] [--mode list] [--fast span] [--step span] [--step-into span] [--vtime-rate span] [--vtime-add span] [--task-sched choices] [--task-slice choices] [--task-int choices] [--when predicate]
                   run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--limit span` | Default instructions per dispatch under fast, steps under step; fast takes 1000 or more and stops at or after it, late by an amount that depends on what the machine runs; step stops exactly; 0 means no limit under fast and one step under step; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true (same predicates as wait `--for`) |
| `--rip addr` | Target RIP address |
| `--rcx addr` | Target RCX value |
| `--target-ic n` | Target instruction count |
| `--irqblk` | Block IRQs during run |
| `--rdtsc-exit` | Record an entry for every RDTSC exit |
| `--no-idle-skip` | Keep machine time crawling while every vCPU is idle |
| `--auto-checkpoints n` | Auto-checkpoint every N entries; 0 turns it off, default the machine's |
| `--mode list` | Execution mode: fast, step, step-into, free, or a comma list to draw among (default: fast) |
| `--fast span` | Limit fast draws when it wins (its member), overriding `--limit` |
| `--step span` | Limit step draws when it wins (its member), overriding `--limit` |
| `--step-into span` | Limit step-into draws when it wins (its member) |
| `--vtime-rate span` | Vtime rate for this run: n, n/d, or a span of either |
| `--vtime-add span` | Nanoseconds to push the clock forward before each dispatch |
| `--task-sched choices` | Draw a scheduler mark per dispatch for the task on that vCPU: keep, hold, yield, drain, drain-all |
| `--task-slice choices` | Draw that task's slice per dispatch: keep, default, or a duration range such as 10us:600us |
| `--task-int choices` | Draw an interrupt for that task per dispatch: none, preempt |
| `--when predicate` | Apply the clause only while this holds |

## machine plan

Run a multi-clause plan from a file. See [Plans](steering-programs.md#plans).

Runs a multi-clause plan from a file.

A plan file is a list of clauses. A clause is an optional when predicate and the
per-dispatch axes it draws for a dispatch it matches. Clauses are tried in order
and the LAST to match supplies each axis, so a later clause overrides an earlier
one; else is the clause for a dispatch no when matched. Braces may group a
clause, # begins a comment, and blank lines are ignored. A file of - reads the
plan from standard input.

Example:     when /test:on       mode step,fast   fast=1:100k step=1:200
when /test:kernel   task-sched hold     else                mode fast

Example, placing thread 56 on vCPU 2 or 3 whenever it wakes, 2 three times as
often as 3:     else  task-pin 56=golden:2[3],3[1]

A clause names one when predicate, then any of these axes. An axis is a comma
list of choices, one drawn per dispatch, and [N] is an optional weight on a
choice; task-slice is the exception, a colon set that takes no weights:

when <predicate>         apply the clause only while the predicate holds. A
predicate         is [subject:]state: state on, kernel, off, syscall[=name],
int[=vec]; subject /path, tid=N, tgid=N, cgroup=P, or none         for any
focused task. vcpu=N[,N] ANDs a vCPU set onto it.     mode <mode>[N],...
the modes to draw among: fast, step, step-into, free, or         keep. A mode
may carry the limit it draws when it wins,         <mode>=<span>, as in mode
step[3],fast[1] step=1:200. free         takes no limit.     vtime-rate
<rate>[N],...         the machine-time rate: a number N, a fraction N/D, a span
of numerators such as 1:10, or keep.     vtime-add <duration>[N],...
time added to the clock before each dispatch: a duration         (500, 10us), a
span of durations (10us:2ms), or keep.     task-sched <mark>[N],...         a
mark for the task on the drawn vCPU: keep, hold, yield,         drain,
drain-all.     task-int <int>[N],...         an interrupt for that task: none or
preempt. This axis has         no keep: none is its do-nothing choice.
task-slice <choice>:<choice>:...         that task's time slice, drawn from a
colon set of keep,         default and a duration span, in any combination, as
in         keep:default:10us:600us.     task-pin [<tid>=]<set>[N],...
where a thread is placed when it next wakes, each choice a         set of vCPUs:
1-3 is all three, 1,2,3 is three choices of         one, free is any vCPU and
none is no vCPU, which stops it         running. A placement policy, not
confinement: a thread         already queued elsewhere keeps that vCPU until it
wakes.         <tid>= names the thread; without it, the task on the drawn
vCPU. none requires <tid>=.

A weight makes a choice win more often: mode step[3],fast[1] draws step three
times as often as fast. keep is the choice that draws nothing: it holds that
axis's last value, so a clause can leave an axis alone part of the time. A span
is a range written lo:hi[:strategy[:step]], strategy one of random, golden or
sweep, and one value is drawn from it per dispatch; the mode member limit,
vtime-rate, vtime-add, task-slice and the run-level `--limit` each accept one.
limit itself is not a clause axis; it is the default a mode with no member of
its own falls back to.

The options on this command are plan-level. `--limit` and `--strategy` are the
defaults a clause draws with when it names no span of its own, and a clause axis
overrides them for the dispatches it matches; a dispatch no clause matches runs
free. `--seed` seeds the draw strategies, and `--until`, `--iters` and `--vcpu`
bound and steer the run as on run. The clause axes and when belong in the file,
not here. The plan applies to this command's run only; a later run without it
runs without the plan.

```
usage: machine plan [-h] [--limit span] [--backstop-limit n] [--retry n] [--strategy name] [--seed n] [--vcpu span] [--iters span] [--until predicate] [--rip addr] [--rcx addr] [--target-ic n] [--irqblk] [--rdtsc-exit] [--no-idle-skip]
                    [--auto-checkpoints n]
                    run file
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `file` | Plan file of when and else clauses, and their axes, or - to read standard input |

| Option | Does |
|---|---|
| `--limit span` | Default instructions per dispatch under fast, steps under step; fast takes 1000 or more and stops at or after it, late by an amount that depends on what the machine runs; step stops exactly; 0 means no limit under fast and one step under step; default 0 |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: 0) |
| `--retry n` | Retries for an entry the host interrupted, default 2; 0 does not retry |
| `--strategy name` | How spans resolve when they name none: random, golden, sweep (default: random) |
| `--seed n` | Seed for the random and golden draw strategies (default: 0) |
| `--vcpu span` | The vCPU, or a span to draw one per dispatch (default: all) |
| `--iters span` | Iterations, an upper bound; 0 is unlimited (default: 1; with `--until`, unbounded) |
| `--until predicate` | Drive until this is true (same predicates as wait `--for`) |
| `--rip addr` | Target RIP address |
| `--rcx addr` | Target RCX value |
| `--target-ic n` | Target instruction count |
| `--irqblk` | Block IRQs during run |
| `--rdtsc-exit` | Record an entry for every RDTSC exit |
| `--no-idle-skip` | Keep machine time crawling while every vCPU is idle |
| `--auto-checkpoints n` | Auto-checkpoint every N entries; 0 turns it off, default the machine's |

## machine vcpu

Get vCPU run state.

Shows the current vCPU run state.

```
usage: machine vcpu [-h] [--vcpu n] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--vcpu n` | The vCPU (default: 0) |

## machine dump

Dump code, registers, page tables. See [Looking at it](running-a-machine.md#looking-at-it).

Dump vCPU code, registers, or page tables.

Use `-o` json to emit one object per `--show` section, and omit `--show` for
every live section. Use `--mem` for the mem object, alone unless `--show` is
also set.

```
usage: machine dump [-h] [--entry n] [--show sections] [--mem addr] [--vcpu n] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `--entry n` | Entry from run log |
| `--show sections` | One or more, comma-separated: code, regs, stack, pt, instr, trace, events, timers, debug, xsave, irq, pic, ioapic, devs, mem, disk, hash, entry, io, msrs, fullhash, all |
| `--mem addr` | Dump raw memory cluster: N (index), pADDR (physical), vADDR (machine address) |
| `--vcpu n` | The vCPU whose state and page tables are read (default: 0) |

## machine checkpoint

Create a checkpoint. See [Checkpoints](checkpoints-and-branches.md#checkpoints).

Create a checkpoint of the current machine state.

```
usage: machine checkpoint [-h] run [name]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `name` | Checkpoint name (auto-generated if omitted) |

## machine sync

Publish a run to shared storage. See [Stopping and starting](running-a-machine.md#stopping-and-starting).

Publishes a run to shared storage.

Pushes the run's folder so any session can start it. Runs in the session that
holds the folder.

```
usage: machine sync [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine cancel

Cancel the active run or checkpoint. See [Trying different schedules](running-a-machine.md#trying-different-schedules).

Cancel the currently active run or checkpoint operation.

```
usage: machine cancel [-h] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

## machine detach

Detach into a new root. See [Moving around](checkpoints-and-branches.md#moving-around).

Detaches a new self-contained root from a run and starts it.

Without `--at`, the root is detached at the current point. The copy includes
everything the root still owns and shares nothing with the origin tree. It is
slower than fork `--rebase`.

The new root is named for the run it copied and the point. A second copy of the
same point gets a suffix.

The new root keeps the run options of the run it copied; `--daemon`,
`--single-step`, `--limit` and `--backstop-limit` replace them, and the root
keeps those instead. Its machine runs on the least-loaded host CPU unless
`--pin-cpu` names one.

```
usage: machine detach [-h] [--at point [point ...]] [--name name] [--no-start] [--side-dump | --no-side-dump] [--side-trace | --no-side-trace] [--no-wait] [--daemon | --no-daemon] [--single-step | --no-single-step] [--limit n]
                      [--backstop-limit n] [--pin-cpu n]
                      run
```

| Argument | Does |
|---|---|
| `run` | Run to detach from |

| Option | Does |
|---|---|
| `--at point [point ...]` | Point the new branch starts at: ^checkpoint, #entry, a time, -10ms back, now, parent [n], root, or %mark |
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--no-start` | Create the branch without starting it |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |
| `--daemon, --no-daemon` | Wait for commands instead of running to completion (default: the run's) |
| `--single-step, --no-single-step` | Run in step mode, for non-daemon runs (default: the run's) |
| `--limit n` | Instructions per dispatch, 0 to leave it to the machine (default: the run's) |
| `--backstop-limit n` | Step modes only: machine instructions a dispatch may run without stepping before it ends, 0 for the machine default (default: the run's) |
| `--pin-cpu n` | Pin to this host CPU (default: the least-loaded) |

## machine switch

Switch to a branch. See [Moving around](checkpoints-and-branches.md#moving-around).

Switches a running machine onto a branch that exists.

The first operand names the run that switches, as with fork and detach. The
second names where it goes: a branch, a mark written %mark, or parent and root.
It never creates; forking a branch and switching onto it is go, and forking one
without switching is fork.

```
usage: machine switch [-h] [--no-wait] run [branch ...]
```

| Argument | Does |
|---|---|
| `run` | The running machine that switches |
| `branch` | Branch to switch onto: a name, a mark written %mark, parent [n], or root |

| Option | Does |
|---|---|
| `--no-wait` | Return without waiting |

## machine rewind

Put a run back at a point, discarding the tail. See [Moving around](checkpoints-and-branches.md#moving-around).

Puts a run back at a point and discards what came after it.

The run keeps its id and its name. The entries, checkpoints and console output
after the point are discarded.

The point is required and is any entry from `#0` to the tip: an entry id after
`#`, a checkpoint name after ^, or a machine time. The run lands on it exactly,
and the point becomes a checkpoint. Rewinding to the tip changes nothing unless
a replay diverged there.

A point before the run was forked moves the run back along the line it was
forked from. A run with a branch forked after the point is refused.

```
usage: machine rewind <run> to <point>
```

| Argument | Does |
|---|---|
| `run` | The machine that rewinds |
| `point` | Point to go back to, from #0 to the tip: ^checkpoint, #entry or a time |

## machine go

Branch at a point and switch onto it. See [Moving around](checkpoints-and-branches.md#moving-around).

Forks a branch at a point and switches onto it.

The move a walk makes most, and the only one that forks and switches in a single
step. The point may be a time, -10ms back, #entry, ^checkpoint, now, parent [n],
root, or a mark written %mark; each of them names a point on this run's own
line. A point that is not a checkpoint is reached by forking at the nearest one
at or before it and replaying the difference.

```
usage: machine go [options] <run> <point>
```

| Argument | Does |
|---|---|
| `run` | The running machine that moves |
| `point` | Where to fork: a time, -10ms back, #entry, ^checkpoint, now, parent [n], root, or %mark |

| Option | Does |
|---|---|
| `--name name` | Name for the new branch, defaulting to an address: the entry it lands on, and for detach the run it copied as well |
| `--rebase` | Copy the ancestors' data into the new branch instead of sharing it |
| `--depth n` | With `--rebase`, how many root-side ancestors to keep (default 1: the root) |
| `--lean` | With `--rebase`, drop the absorbed history so those runs become deletable |
| `--side-dump, --no-side-dump` | Record a per-entry debug dump, whatever the run it comes from records |
| `--side-trace, --no-side-trace` | Record a per-entry kernel trace, whatever the run it comes from records |
| `--no-wait` | Return without waiting |

## machine replay

Replay parent entries. See [Replay](replay.md).

Replays recorded entries from the parent lineage.

Without a line, the parent's entries are replayed. A fork at an entry leaves
that entry with the parent and starts the branch at the next one, so the
parent's entries end at the fork. Replaying past them reports no forward
entries.

Naming a line replays the entries that lead to that run, across every fork on
the way. The run must be in the same tree. A line that is not this run's own is
not refused; the replay diverges at the first entry that does not reproduce.

An entry that diverges is replayed again from the newest checkpoint before it,
twice at most, and not again once it diverges the same way twice. An entry the
host interrupted is replayed again the same way and is not a divergence. Use
`--retry` to set how many retries; `--retry` 0 replays each entry once.

The replay aims its interrupt short of each recorded stop by the machine's
default skid, so an interrupt that skids less still lands in time. Use `--skid`
to aim closer. A smaller skid makes a miss more likely.

```
usage: machine replay [-h] [--to n] [--trace] [--retry n] [--skid n] run [line]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `line` | Run whose line to replay, defaulting to the parent's |

| Option | Does |
|---|---|
| `--to n` | Replay to entry n, defaulting to the end of the line |
| `--trace` | Trace each iteration one by one |
| `--retry n` | Retries for an entry that diverges or the host interrupted, default 2; 0 does not retry |
| `--skid n` | Aim the interrupt n instructions short of each recorded stop |

## machine play

Play entries from a run log. See [Replay](replay.md).

Scripted playback from a run's log. No divergence checking.

The source must be in this run's tree. Divergence is not checked, so a source
that is not this run's own line is played and not refused.

```
usage: machine play [-h] [-n range] [--include type [type ...]] [--exclude type [type ...]] run [source]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `source` | Source run (default: parent) |

| Option | Does |
|---|---|
| `-n, --entries range` | Entry N, A:B, A:, :B or :, or -N for the last N entries |
| `--include type [type ...]` | Include only these event types: run, irq, exception, random, device_in, block_done, input, exit_shutdown, system_shutdown, system_reset, checkpoint, cpuid |
| `--exclude type [type ...]` | Exclude these event types |

## machine diff

Show replay divergence details. See [Replay](replay.md).

Compares a run log entry against another.

With no second operand the entry is compared against the run it was replayed
from, and the answer says whether the replay converged. Naming a run compares
against that run, at its own entry when one is given as other:m. A difference
between two recordings says that they differ, not that a replay diverged.

```
usage: machine diff [-h] [--show sections] [--entry n] [--context n] run [other[:m]]
```

| Argument | Does |
|---|---|
| `run` | Run name |
| `other[:m]` | Run to compare against, at its entry m; m defaults to `--entry` |

| Option | Does |
|---|---|
| `--show sections` | One or more, comma-separated: code, regs, stack, pt, instr, trace, events, timers, debug, xsave, irq, pic, ioapic, devs, mem, disk, hash, counts, entry, io, msrs, fullhash, all; default hash |
| `--entry n` | Compare specific entry N (0 = last entry) |
| `--context n` | Also show the N entries leading up to it, on both sides |

## machine control

Interactive control mode. See [Interactive mode](running-a-machine.md#interactive-mode).

Enter interactive command mode for rapid vCPU control.

Use `control log` with a run to read the command history instead of driving
the machine, `--entries` to select the commands issued at given run entries,
and `-n` to select commands by number.

```
usage: machine control [-h] [--entries range] [-n range] [-c cmd] run|log [run]
```

| Argument | Does |
|---|---|
| `run\|log` | Run name, or `log` to read history |
| `run` | With log: the run whose history to read |

| Option | Does |
|---|---|
| `--entries range` | With log: commands at one entry, or an inclusive range |
| `-n, --lines range` | With log: command N, A:B, A:, :B or :, or -N for the last N commands |
| `-c, --command cmd` | Slash command (e.g. "/s=0@10") |

```
command selection (-n):
  -n -20         Last 20 commands
  -n 20          Command 20
  -n 100:200     Commands 100 through 200
  -n 50:         From command 50 to the end
  -n :50         Commands 1 through 50
  -n :           Every command
```

## machine wait

Wait until a run satisfies a predicate. See [Waiting](running-a-machine.md#waiting).

Block until a run satisfies a `--for` predicate.

Predicates: running, ready, tasks, stopped, paused, halted, activity=<name>,
entry>=N, entry=+N, console~REGEX, or a task predicate. tasks holds once the
operating system is up and its task table is readable, which is before it execs anything
in userland.

A task predicate is [who:]what. what is exec, exit, sched, desched, on, kernel
or off. who is /path, cgroup=path, tgid=N or tid=N, and omitting it means any
focused task; a path or a cgroup must already be focused. Four of the seven are
EDGES: exec where a task matching who entered the task table, exit where one
left it, sched where a thread is given the CPU, desched where one gives it up.
Three are STATES, a partition: on while the thread is on cpu in its own code, at
CPL 3, which is where a forced decision can land between two of its own
instructions; kernel while that thread is on cpu in the kernel; off while it is
not the task on cpu at all.

A path or cgroup subject means the process. tgid=N means the process for exit
and any of its threads for exec. machine focus names the task that stopped the
wait.

Named runs must be in the current session. Use `--all` to wait for every run in
it.

Use `--timeout` before the command. The default is no limit; 0 checks once.

Exit codes: 0 success, 2 error, 3 timeout.

```
usage: machine wait [-h] [--all] --for predicate [--interval s] [run ...]
```

| Argument | Does |
|---|---|
| `run` | One or more runs (omit with `--all`) |

| Option | Does |
|---|---|
| `--all` | Wait for every run in the session |
| `--for predicate` | running, ready, stopped, entry=+N, console~REGEX, /path:exec, … |
| `--interval s` | Poll every S seconds (default: 1) |

## machine console

View run console output. See [Looking at it](running-a-machine.md#looking-at-it).

Shows the console of a run.

Use `--entries` to select the output of given entries, `-n` to select lines, and
`-f` to follow new output. An entry that printed nothing contributes nothing.

```
usage: machine console [-h] [-n range] [--entries range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --lines range` | Line N, A:B, A:, :B or :, or -N for the last N lines |
| `--entries range` | Output of one entry, or of an inclusive range |
| `-f, --follow` | Follow new output (like tail `-f`) |

```
line selection (-n):
  -n -20         Last 20 lines
  -n 20          Line 20
  -n 100:200     Lines 100 through 200
  -n 50:         From line 50 to the end
  -n :50         Lines 1 through 50
  -n :           Every line
```

## machine entries

View run log entries. See [Looking at it](running-a-machine.md#looking-at-it).

Shows run log entries.

Use `-n` to select entries, and `-f` to follow new output.

```
usage: machine entries [-h] [-n range] [-f] run
```

| Argument | Does |
|---|---|
| `run` | Run name |

| Option | Does |
|---|---|
| `-n, --entries range` | Entry N, A:B, A:, :B or :, or -N for the last N entries |
| `-f, --follow` | Follow new output (like tail `-f`) |

```
entry selection (-n):
  -n -20           Last 20 entries
  -n 181743        Entry 181743
  -n 181740:181745 Entries 181740 through 181745
  -n 181743:       From entry 181743 to the end
  -n :200          Entries 0 through 200
  -n :             Every entry
```

## machine sessions

List and manage sessions. See [Sessions](sessions.md).

Lists and manages sessions.

Create a session, then use it so later commands target it by default.

```
usage: machine sessions [-h] [-w] {list,create,use,show,delete,rename,connect,disconnect} ...
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |

### machine sessions list

List sessions. See [Sessions](sessions.md).

Lists sessions.

The current session is tagged.

```
usage: machine sessions list [-h] [-w]
```

| Option | Does |
|---|---|
| `-w, --watch` | Watch for changes |

### machine sessions create

Create a session. See [Sessions](sessions.md).

Creates a session.

Waits until it is running. Use `--timeout` to bound the wait, or `--no-wait` to
return once the request is accepted.

```
usage: machine sessions create [-h] [--cpus n] [--mem size] [--storage size] [--class type] [--no-wait] [name]
```

| Argument | Does |
|---|---|
| `name` | Session name (default: auto-generated) |

| Option | Does |
|---|---|
| `--cpus n` | Number of vCPUs (default: 1) |
| `--mem size` | Memory, MB or with a K/M/G/T suffix (default: class baseline) |
| `--storage size` | The session's storage, GB or with a K/M/G/T suffix (default: class baseline) |
| `--class type` | Hardware class (default: plan default) |
| `--no-wait` | Return without waiting |

### machine sessions use

Use a session. See [Sessions](sessions.md).

Makes a session current so later commands target it by default.

Connects first if needed, then checks it responds before switching. Use
`--timeout` to bound the wait, or `--no-wait` to fail if a connect is needed and
the session is not running yet.

```
usage: machine sessions use [-h] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `--no-wait` | Fail if a connect is needed and the session is not running yet |

### machine sessions show

Show a session. See [Sessions](sessions.md).

Shows session details.

```
usage: machine sessions show [-h] [session]
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix (default: the only one) |

### machine sessions delete

Delete a session. See [Sessions](sessions.md).

Deletes a session.

The first operand names the session; `-a` deletes every session. Stops the
machine and discards its state. Already gone is success. Waits until a named
session is gone. Use `--timeout` to bound the wait, or `--no-wait` to return
once the request is accepted. A prune is refused while any session is live, so
`-a` is what storage prune needs.

```
usage: machine sessions delete [-h] [-a] [-y] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `-a, --all` | Delete every session |
| `-y, --yes` | Skip the confirmation prompt |
| `--no-wait` | Return without waiting |

### machine sessions rename

Rename a session. See [Sessions](sessions.md).

Renames a session.

The machine and tunnel are unchanged.

```
usage: machine sessions rename [-h] session new-name
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix |
| `new-name` | New session name |

### machine sessions connect

Connect to a session. See [Sessions](sessions.md).

Connects to a session.

The everyday verb is sessions use. Waits until it is running if it is still
provisioning. Use `--timeout` to bound the wait, or `--no-wait` to fail if it is
not running yet.

```
usage: machine sessions connect [-h] [--no-wait] [session]
```

| Argument | Does |
|---|---|
| `session` | Session name, id, or prefix (default: the only one) |

| Option | Does |
|---|---|
| `--no-wait` | Fail if the session is not running yet |

### machine sessions disconnect

Disconnect from a session. See [Sessions](sessions.md).

Disconnects from a session.

The session keeps running. The tunnel is shared on this machine, so every
terminal loses it.

```
usage: machine sessions disconnect [-h] [session]
```

| Argument | Does |
|---|---|
| `session` | Session (default: the current one) |

## machine disks

Manage disks. See [Disks](disks.md).

Lists and manages disks.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine disks [-h] [-q] [--no-trunc] [--deleted] [--label name=value] [--since date|age] [--limit n] [--offset n] [-w] {list,build,show,transfers,delete,rename,cancel} ...
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show removed disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date or age |
| `--limit n` | Show at most n disks (default: 25) |
| `--offset n` | Skip the first n disks |
| `-w, --watch` | Watch for changes |

### machine disks list

List disks. See [Disks](disks.md).

Lists disks.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine disks list [-h] [-q] [--no-trunc] [--deleted] [--label name=value] [--since date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `-q, --quiet` | Only show ids |
| `--no-trunc` | Full disk id |
| `--deleted` | Show removed disks |
| `--label name=value` | Filter by a label (repeatable; matches all) |
| `--since date\|age` | Since a date or age |
| `--limit n` | Show at most n disks (default: 25) |
| `--offset n` | Skip the first n disks |
| `-w, --watch` | Watch for changes |

### machine disks build

Build a disk. See [Disks](disks.md).

Builds a disk from a binary, an image, or a Compose project.

Exactly one source: `--binary` wraps a static executable in an image built
around it, `--image` takes a Docker image as a save tar or a name in the local
Docker, and `--compose` takes a project directory and the images its services
name. A binary or an image runs as one container; a project runs every service
in it. Use `--entrypoint` to set the executable, and pass arguments after `--`.

The name defaults to what the source is called, and the size to what the pack
holds loaded plus a gigabyte, rounded up to a whole GB. Use `--dry-run` to see
those numbers without building anything.

```
usage: machine disks build [-h] (--binary path | --image ref | --compose dir) [--size size] [--dry-run] [--entrypoint path] [--label name=value] [name] [-- args ...]
```

| Argument | Does |
|---|---|
| `name` | Disk name |
| `-- args` | Arguments after `--` become the service's command |

| Option | Does |
|---|---|
| `--binary path` | Static x86_64 executable to wrap |
| `--image ref` | Docker image, a save tar or a name |
| `--compose dir` | Compose project directory |
| `--size size` | Disk size, MB or with a K/M/G/T suffix (default: from the pack, rounded up to a GB) |
| `--dry-run` | Report what the disk would hold and build nothing |
| `--entrypoint path` | Executable the service runs |
| `--label name=value` | Attach a label, repeatable; an empty value removes one the name carried |

### machine disks show

Show a disk. See [Disks](disks.md).

Shows disk details.

```
usage: machine disks show [-h] name
```

| Argument | Does |
|---|---|
| `name` | Disk name |

### machine disks transfers

Show transfers. See [Disks](disks.md).

Shows disk transfers.

Active transfers by default. Use `--since` to include history, or `--since` with
`--active` for in-flight transfers started in that window.

```
usage: machine disks transfers [-h] [--active] [--since date|age] [-w]
```

| Option | Does |
|---|---|
| `--active` | Only in-flight transfers |
| `--since date\|age` | Since a date or age |
| `-w, --watch` | Watch for changes |

### machine disks delete

Delete disks. See [Disks](disks.md).

Deletes disks.

Deletion is permanent. The name is free at once, and the bytes count against the
storage quota until the reclaim removes them. A disk a run still boots is
refused; use `--force` to delete it anyway and lose those runs.

```
usage: machine disks delete [-h] [-y] [-f] name [name ...]
```

| Argument | Does |
|---|---|
| `name` | Disk names |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |
| `-f, --force` | Delete even while runs still boot it |

### machine disks rename

Rename a disk. See [Disks](disks.md).

Renames a disk.

```
usage: machine disks rename [-h] name new-name
```

| Argument | Does |
|---|---|
| `name` | Current disk name |
| `new-name` | New disk name |

### machine disks cancel

Cancel a transfer. See [Disks](disks.md).

Cancels an in-flight transfer.

```
usage: machine disks cancel [-h] name
```

| Argument | Does |
|---|---|
| `name` | Disk name |

## machine storage

Manage storage. See [Account and billing](account-and-billing.md).

Shows and manages storage.

```
usage: machine storage [-h] [--refresh] {show,ops,prune} ...
```

| Option | Does |
|---|---|
| `--refresh` | Measure again instead of using the last measurement |

### machine storage show

Show storage the account uses. See [Account and billing](account-and-billing.md).

Shows the storage the account uses.

```
usage: machine storage show [-h] [--refresh]
```

| Option | Does |
|---|---|
| `--refresh` | Measure again instead of using the last measurement |

### machine storage ops

List storage operations.

Lists operations on the account's storage and how they finished.

The listing shows the newest 25. Use `--limit` for a different page size. Shows
pending and failed by default; use `-s` done for the rest. These act on the
account's repository rather than on a run, so they are listed here rather than
by machine ops, and they answer with no session.

```
usage: machine storage ops [-h] [--op-id id] [-s [^]state] [--type type] [--since date|age] [--until date|age] [--limit n] [--offset n] [-w]
```

| Option | Does |
|---|---|
| `--op-id id` | Show one operation, by its id (ignores `-s` and `--type`) |
| `-s, --state [^]state` | Filter by state: pending, done, failed (default: pending, failed; repeat = OR; ^ excludes) |
| `--type type` | Filter by kind: measure, prune (repeat = OR) |
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--limit n` | Show at most n operations (default: 25) |
| `--offset n` | Skip the first n operations |
| `-w, --watch` | Watch for changes |

### machine storage prune

Reclaim space held by deleted runs and disks. See [Account and billing](account-and-billing.md).

Reclaims space held by deleted runs and disks above 5%.

```
usage: machine storage prune [-h] [-y] [--status]
```

| Option | Does |
|---|---|
| `-y, --yes` | Do not ask for confirmation |
| `--status` | Show the current or last prune and exit |

## machine artifacts

Browse and copy files from a run's disk. See [Reading the disk](reading-the-disk.md).

Lists, copies, or prints files from a run's disk.

Reads are snapshot-pinned. They never perturb execution.

```
usage: machine artifacts [-h] {ls,cp,cat} ...
```

### machine artifacts ls

List files in a run's disk. See [Reading the disk](reading-the-disk.md).

Lists files in a run's disk.

Pin the listing to a checkpoint or entry with run@ref.

```
usage: machine artifacts ls [-h] [-l] [-a] run[@ref] [path]
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `path` | Path (default: /) |

| Option | Does |
|---|---|
| `-l` | Long format (mode, size, mtime, name) |
| `-a, --all` | Include . and .. |

### machine artifacts cp

Copy a file or directory. See [Reading the disk](reading-the-disk.md).

Copies a file or directory from a run's disk.

Pin the copy to a checkpoint or entry with run@ref. Use `-r` for directories.

```
usage: machine artifacts cp [-h] [-r] run[@ref] path [dest]
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `path` | Path to copy |
| `dest` | Local destination file or directory (default: .) |

| Option | Does |
|---|---|
| `-r, -R, --recursive` | Copy directories recursively |

### machine artifacts cat

Print a file to stdout. See [Reading the disk](reading-the-disk.md).

Prints a file from a run's disk.

Pin the read to a checkpoint or entry with run@ref.

```
usage: machine artifacts cat [-h] run[@ref] path
```

| Argument | Does |
|---|---|
| `run[@ref]` | Run name/id, optionally @entry_id or @checkpoint |
| `path` | File path |

## machine ping

Check reachability and latency. See [The client](getting-started.md#the-client).

Checks reachability and latency.

Pings the API and connected sessions.

```
usage: machine ping [-h] [-c n]
```

| Option | Does |
|---|---|
| `-c, --count n` | Round-trips per target (default: 3) |

## machine account

Manage account. See [Account and billing](account-and-billing.md).

Shows and manages the account.

```
usage: machine account [-h] {devices,buy,upgrade,downgrade,payment,portal,invoices,cancel,email,products,show,credits,activity,orders,api-keys,provision,signup,close} ...
```

### machine account devices

List the devices signed in to the account. See [Account and billing](account-and-billing.md).

Lists signed-in devices.

Use `--revoke` to sign out one device by id.

```
usage: machine account devices [-h] [--revoke id]
```

| Option | Does |
|---|---|
| `--revoke id` | Sign out one device by its id (or a unique id prefix) |

### machine account buy

Buy usage credits or a plan. See [Account and billing](account-and-billing.md).

Buys usage credits or a plan.

```
usage: machine account buy [-h] {usage,plan} ...
```

#### machine account buy usage

Buy usage credits. See [Account and billing](account-and-billing.md).

Buys usage credits.

Opens checkout for the named pack size.

```
usage: machine account buy usage [-h] [-y] eur
```

| Argument | Does |
|---|---|
| `eur` | Pack size in euros, as account products lists it |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |

#### machine account buy plan

Subscribe to a plan. See [Account and billing](account-and-billing.md).

Subscribes to a plan.

Already on a paid plan upgrades or downgrades to the named tier instead.

```
usage: machine account buy plan [-h] [-y] tier
```

| Argument | Does |
|---|---|
| `tier` | Plan tier (e.g. starter, pro) |

| Option | Does |
|---|---|
| `-y, --yes` | Skip the confirmation prompt |

### machine account upgrade

Upgrade to a higher plan. See [Account and billing](account-and-billing.md).

Upgrades to a higher plan.

An omitted tier is the next one up. Use `--link` to print the URL without
opening a browser.

```
usage: machine account upgrade [-h] [--link] [-y] [tier]
```

| Argument | Does |
|---|---|
| `tier` | Target tier (default: next up) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |
| `-y, --yes` | Skip the confirmation prompt |

### machine account downgrade

Downgrade to a lower plan. See [Account and billing](account-and-billing.md).

Downgrades to a lower plan.

An omitted tier is the next one down. Use `--link` to print the URL without
opening a browser.

```
usage: machine account downgrade [-h] [--link] [-y] [tier]
```

| Argument | Does |
|---|---|
| `tier` | Target tier (default: next down) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |
| `-y, --yes` | Skip the confirmation prompt |

### machine account payment

Update your payment method. See [Account and billing](account-and-billing.md).

Updates the payment method.

Use `--link` to print the URL without opening a browser.

```
usage: machine account payment [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

### machine account portal

Open billing settings. See [Account and billing](account-and-billing.md).

Opens billing settings.

Use `--link` to print the URL without opening a browser.

```
usage: machine account portal [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

### machine account invoices

List and manage invoices. See [Account and billing](account-and-billing.md).

Lists invoices.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account invoices [-h] [--since date|age] [--until date|age] [--status {draft,open,paid,uncollectible,void}] [--limit n] [--sort field] [--reverse] {list,download} ...
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--status {draft,open,paid,uncollectible,void}` | Filter by invoice status |
| `--limit n` | Cap to most recent n (default: 25, max 100) |
| `--sort field` | Sort by created or amount |
| `--reverse` | Reverse sort order |

#### machine account invoices list

List invoices. See [Account and billing](account-and-billing.md).

Lists invoices.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account invoices list [-h] [--since date|age] [--until date|age] [--status {draft,open,paid,uncollectible,void}] [--limit n] [--sort field] [--reverse]
```

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--status {draft,open,paid,uncollectible,void}` | Filter by invoice status |
| `--limit n` | Cap to most recent n (default: 25, max 100) |
| `--sort field` | Sort by created or amount |
| `--reverse` | Reverse sort order |

#### machine account invoices download

Open an invoice, the PDF and the receipt. See [Account and billing](account-and-billing.md).

Opens an invoice.

The hosted page has the PDF and receipt. Use `--link` to print the URL without
opening a browser.

```
usage: machine account invoices download [-h] [--link] invoice-id
```

| Argument | Does |
|---|---|
| `invoice-id` | Invoice id (in_…) |

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

### machine account cancel

Cancel your subscription. See [Account and billing](account-and-billing.md).

Cancels the subscription.

The plan stays until renewal, then drops to Free. Usage credits stay. Use
`--link` to print the URL without opening a browser.

```
usage: machine account cancel [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

### machine account email

Change your account email. See [Account and billing](account-and-billing.md).

Changes the account email.

A code goes to the current inbox. A link goes to the new one.

```
usage: machine account email [-h] [-y] email
```

| Argument | Does |
|---|---|
| `email` | New email address |

| Option | Does |
|---|---|
| `-y, --yes` | Skip confirmation prompts |

### machine account products

List products for sale. See [Account and billing](account-and-billing.md).

Lists products for sale.

```
usage: machine account products [-h] {list} ...
```

#### machine account products list

List products. See [Account and billing](account-and-billing.md).

Lists products for sale.

```
usage: machine account products list [-h]
```

### machine account show

Show your account. See [Account and billing](account-and-billing.md).

Shows the account.

```
usage: machine account show [-h]
```

### machine account credits

Show your usage credits. See [Account and billing](account-and-billing.md).

Shows usage credits.

```
usage: machine account credits [-h]
```

### machine account activity

Show usage credit activity. See [Account and billing](account-and-billing.md).

Shows usage credit activity.

The listing shows the newest 25. Use `--limit` for a different page size. Naming
a session focuses the listing on that session.

```
usage: machine account activity [-h] [--since date|age] [--until date|age] [--period date] [--type {included,reserved,settled,expired,expired-removed,credit-purchase}] [--credit-type {included,usage}] [--limit n] [--sort field] [--reverse]
                                [session]
```

| Argument | Does |
|---|---|
| `session` | Show one session's transactions, by name, id or id prefix |

| Option | Does |
|---|---|
| `--since date\|age` | Since a date or age |
| `--until date\|age` | Until a date or age |
| `--period date` | Show credit activity in the period containing DATE |
| `--type {included,reserved,settled,expired,expired-removed,credit-purchase}` | Filter by activity type |
| `--credit-type {included,usage}` | Filter by credit type (included or usage) |
| `--limit n` | Cap to most recent n (default: 25, max 500) |
| `--sort field` | Sort by sequence or amount |
| `--reverse` | Reverse sort order |

### machine account orders

List and manage purchases. See [Account and billing](account-and-billing.md).

Lists purchases.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account orders [-h] [--status {pending,processing,completed,cancelled,expired,failed}] [--limit n] {list,resume,cancel} ...
```

| Option | Does |
|---|---|
| `--status {pending,processing,completed,cancelled,expired,failed}` | Filter by status |
| `--limit n` | Cap to most recent n (default: 25, max 200) |

#### machine account orders list

List orders. See [Account and billing](account-and-billing.md).

Lists purchases.

The listing shows the newest 25. Use `--limit` for a different page size.

```
usage: machine account orders list [-h] [--status {pending,processing,completed,cancelled,expired,failed}] [--limit n]
```

| Option | Does |
|---|---|
| `--status {pending,processing,completed,cancelled,expired,failed}` | Filter by status |
| `--limit n` | Cap to most recent n (default: 25, max 200) |

#### machine account orders resume

Resume a pending checkout. See [Account and billing](account-and-billing.md).

Resumes a pending checkout.

Defaults to the single pending order. Use `--link` to print the URL without
opening a browser.

```
usage: machine account orders resume [-h] [--link]
```

| Option | Does |
|---|---|
| `--link` | Print the link only (don't open a browser) |

#### machine account orders cancel

Cancel a pending order so you can buy again. See [Account and billing](account-and-billing.md).

Cancels a pending order so another buy can start.

Defaults to the single pending order.

```
usage: machine account orders cancel [-h]
```

### machine account api-keys

List and manage API keys. See [Account and billing](account-and-billing.md).

Lists and manages API keys.

Keys can run machines, disks, and sessions, not billing or account changes.

```
usage: machine account api-keys [-h] {list,create,delete,update} ...
```

#### machine account api-keys list

List API keys. See [Account and billing](account-and-billing.md).

Lists API keys.

```
usage: machine account api-keys list [-h]
```

#### machine account api-keys create

Create an API key. See [Account and billing](account-and-billing.md).

Creates an API key.

The secret is shown once. A sign-in code is required.

```
usage: machine account api-keys create [-h] [--expiry days|never] name
```

| Argument | Does |
|---|---|
| `name` | Label to recognize this key later |

| Option | Does |
|---|---|
| `--expiry days\|never` | Expire after N days (e.g. 30), or "never" (default: never) |

#### machine account api-keys delete

Delete an API key. See [Account and billing](account-and-billing.md).

Deletes an API key.

A sign-in code is required.

```
usage: machine account api-keys delete [-h] id
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys lists it |

#### machine account api-keys update

Set an API key's expiry. See [Account and billing](account-and-billing.md).

Sets an API key's expiry.

A sign-in code is required.

```
usage: machine account api-keys update [-h] id days|never
```

| Argument | Does |
|---|---|
| `id` | Key id, as account api-keys lists it |
| `days\|never` | Number of days from now (e.g. 30) or "never" |

### machine account provision

Set up account storage. See [Signing up](getting-started.md#signing-up).

Sets up cloud storage.

Safe to repeat while it is still working.

```
usage: machine account provision [-h]
```

### machine account signup

Create an account. See [Signing up](getting-started.md#signing-up).

Creates an account.

A link is emailed to finish signing up.

```
usage: machine account signup [-h]
```

### machine account close

Close your account. See [Account and billing](account-and-billing.md).

Closes the account.

Two steps: start, then confirm after machines stop. Use `--cancel` to abort a
close already in progress.

```
usage: machine account close [-h] [-y] [--cancel]
```

| Option | Does |
|---|---|
| `-y, --yes` | Skip confirmation prompts |
| `--cancel` | Abort closing and return the account to active |

## machine login

Sign in. See [Signing up](getting-started.md#signing-up).

Signs in.

A sign-in code is emailed. Use account signup if there is no account yet.

```
usage: machine login [-h]
```

## machine logout

Sign out. See [Signing up](getting-started.md#signing-up).

Signs out.

Revokes the access token on the server. Use `--everywhere` to sign out of every
device and browser.

```
usage: machine logout [-h] [--everywhere]
```

| Option | Does |
|---|---|
| `--everywhere` | Sign out of every device and browser, not just this one. |
