<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# What is it?

**Machine** is a deterministic execution environment where you run, explore,
debug and test your software. It is built on our deterministic hypervisor,
which boots a full Linux x86_64 virtual machine and runs your programs, Docker
images and Docker Compose environments in it unchanged. You turn any of them
into a disk with [`machine disks build`](disks.md). Machine is a service: it
runs in the cloud, and you can sign up for free.

Nothing inside that virtual machine is left to chance. The hypervisor controls
time, interrupts, random numbers and input from devices, and it records all of
them while your software runs. Replay the recording and every program in the
machine does exactly what it did the first time, instruction for instruction.

That gives you three things to work with:

* **Record.** Every run keeps a log of everything that could have turned out differently.
* **Replay.** Play the log back and the run repeats itself. If it failed once, it fails every time.
* **Branch.** Stop at any point, branch from it, and try something else. The original run stays as it was.

Two more things make it practical for real software. A machine can have
several vCPUs, and every one of them is recorded and replayed, so threads that
race on different vCPUs race the same way on every replay. And idle time takes
almost no time: when the guest waits for a timer, the hypervisor moves its
clock straight there, so a test that sleeps for ten minutes finishes in
seconds. See [Multiple vCPUs](running-a-machine.md#multiple-vcpus) and
[Time compression](running-a-machine.md#time-compression).

If you have ever chased a test that fails one run in fifty, you know why this
is handy. Record the failing run once, then replay it as often as you need.

You work with Machine through a client called `machine`, or from Python with
the [SDK](python-sdk.md). To begin, [install the client](getting-started.md#the-client),
which takes one command.

## Concepts

There are only a few of them, and everything else builds on them.

**Disk.** What a machine boots: your program, or a whole application, packaged
with a small Linux system. You build one with
[`machine disks build`](commands.md#machine-disks-build).

**Session.** The vCPUs and RAM you allocate for one or more runs to execute in.
A session is what you are billed for, from the moment you create it until you
delete it, so delete it when you are done.

**Run.** A deterministic machine booting a disk inside a session. Every run has
a name, and nearly every action is something you do to a run.

**Entry.** A run writes its history as a log, and each item in that log is an
entry. Entry #42, for example, is always the same point in that run.

**Checkpoint.** A saved copy of the whole machine at one point in the log.
Every run has checkpoint 1, taken at its first entry, and you can add your own
and give them names.

**Branch.** A run that starts from another run at some point. It shares its
parent's history up to that point and has its own from then on. You create one
with [`machine fork`](commands.md#machine-fork) or
[`machine go`](commands.md#machine-go), and runs that grow out of one another
form a tree.

**Mark.** A second name for a branch, given after the fact. The generated name
says where a branch started, while a mark says what it turned out to be, like
`crashed`.

### Points

Many commands take a point, which is a place in a run's history, and you can
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
| `console~login` | where the console first printed a match of `login` |

The same points work everywhere a point is taken: `--at` and `--from` on
`fork`, `detach` and `go`, `rewind ... to`, and `replay --to`. A bare word is
read as a checkpoint's name first, then as a time, then as an entry, so write
`^name` or `#42` when you want to be sure which one you get.

A branch can only start from a checkpoint, but
[`machine go`](commands.md#machine-go) takes any of these points. If the point
you name isn't a checkpoint, `machine go` starts the branch at the nearest
checkpoint before it and replays the rest of the way for you. A machine
time such as `1.5s` or `-10ms` names the first entry at the last machine time
at or before the one you asked for.
