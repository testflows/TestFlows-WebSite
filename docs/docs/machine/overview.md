<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# What is it?

**Machine** is a deterministic execution environment, a place to run your programs where nothing is left to chance. It controls time, interrupts, random numbers and input from devices, and it
records all of them while your program runs. Replay the recording and the
program does exactly what it did the first time, instruction for instruction.

That gives you three things to work with:

* **Record.** Every run keeps a log of everything that could have turned out differently.
* **Replay.** Play the log back and the run repeats itself. If it failed once, it fails every time.
* **Branch.** Stop at any point, branch from it, and try something else. The original run stays as it was.

If you have ever chased a test that fails one run in fifty, you know why this
is handy. Record the failing run once, then replay it as often as you need.

You work with Machine through a client called `machine`, or from Python using
the [SDK](python-sdk.md). To begin, [install the client](getting-started.md#the-client). It is
one command.

## Concepts

There are only a few of them, and the rest builds on them.

**Disk.** What a machine boots. It is your program (or a whole application)
packaged with a small Linux system. You build one with [`machine disks build`](commands.md#machine-disks-build).

**Session.** The vCPUs and RAM you allocate, which one or more runs execute in.
It is the billable unit and consumes plan and usage credits.

**Run.** A deterministic machine booting a disk inside a session. Every run has a
name. Nearly every action is something you do to a run.

**Entry.** A run writes its history as a log. Each item in the log is
an entry, so for example, entry #42 is always the same point in that run.

**Checkpoint.** A saved copy of the whole machine at one point in the log. Every
run has checkpoint 0, taken at boot, and you can add your own and name them.

**Branch.** A run that starts from another run at some point. It shares history
with its parent up to that point and has its own after that. You create one
with [`machine fork`](commands.md#machine-fork) or [`machine go`](commands.md#machine-go). Runs that grow out of one another form a
tree.

**Mark.** A second name for a branch, given after the fact. The generated name
says where a branch started. A mark says what it turned out to be,
like `crashed`.

### Points

A lot of commands take a point, which is a place in a run's history. You can
name one in several ways.

| Point | Means |
|---|---|
| `^booted` | the checkpoint named `booted` |
| `#42` | entry 42 |
| `1.5s` | a time on the machine's clock |
| `-10ms` | ten milliseconds of machine time back from where the run is now |
| `now` | where the run is now |
| `parent` | the point this run branched from |
| `root` | the start of the tree |
| `%crashed` | the branch with the `crashed` mark |

A branch can only start from a checkpoint. [`machine go`](commands.md#machine-go) takes any of these
points, and if the one you name isn't a checkpoint, it starts the branch at the
nearest checkpoint before it and replays the rest of the way for you. A machine
time such as `1.5s` or `-10ms` names the first entry at the last machine time
at or before the one you asked for.
