<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Steering programs

By default the machine schedules itself. Sometimes that isn't what
you want. A bug that needs one thread to run past another will not show up
if the scheduler never picks that order. Machine lets you pick it.

Everything here is recorded, so a replay repeats it exactly.

## Looking at tasks

```bash
machine tasks app
```

That lists the tasks in the machine, one row per thread, with the process each one
belongs to. You will want a thread's id, or a program's path, in the commands
below. [`machine syscalls app`](commands.md#machine-syscalls) and [`machine ints app`](commands.md#machine-ints) list the kernel's
system calls and interrupt vectors.

## Focus

Machine matches a program by its absolute path in the machine. Tell it which
programs to watch and steer.

```bash
machine focus app add /app
machine run app --until /app:exit
```

Focus also takes a cgroup (`cgroup=/path`), a single process (`tgid=12`), or
the processes with a task of a given name (`comm=cat`). A name picks out one
tool of a multi-call binary such as busybox, or a script, which a path cannot.
[`machine tasks app exist comm=cat`](fault-injection.md#which-calls-fail) lists the tasks with
that name; focus takes every thread of their processes.

A program that renames itself after it starts, with `prctl(PR_SET_NAME)` or
`/proc/self/comm`, is focused by its new name at its next fork, exec or exit,
not at the rename. Until then `--until comm=worker:on` waits. Focus the program
by its path to steer it from the start. `focus remove` and `focus clear` take them off again.

```bash
machine focus app add comm=cat
machine run app --until comm=cat:exit
```

Whatever you focus by, the conditions below and a plan's `when` name it the
same way: `/app:exit`, `cgroup=/path:on`, `comm=cat:kernel`.

Once a program is focused you can wait for things that happen to it. The task
conditions take the form `program:what`, where `what` is one of:

| What | Means |
|---|---|
| `exec` | the program started |
| `exit` | the program exited |
| `sched` | one of its threads was given a CPU |
| `desched` | one of its threads gave its CPU up |
| `on` | a thread is running its own code |
| `kernel` | a thread is running in the kernel |
| `off` | the thread is not on a CPU at all |

A run can also stop where a thread reaches a location, or after it writes or
touches bytes. These need no focus. They name a thread or a process by its id:

```bash
machine run app --until 'tid=56:at=parse'          # until thread 56 reaches parse
machine run app --until 'tid=56:write=counter'     # until thread 56 writes counter
machine run app --until 'tgid=12:access=buf[0]'    # until any thread of process 12 reads or writes buf[0]
```

Each takes one of the run's 3 hardware breakpoints and watchpoints, for that
run alone. [Debugging](debugging.md#running-to-a-place) says what they take and
what the run says when it stops.

## Holding threads

```bash
machine tasks app hold 56         # take thread 56 off the run queue
machine tasks app release 56      # put it back
machine tasks app yield 56        # let its peers go first
machine tasks app slice 56 10us   # how long it runs between decisions
```

Each of these takes effect at the next scheduling decision. If you hold the
last thread that could run, there is no next decision coming, so force one
with [`machine irq app preempt --vcpu all`](commands.md#machine-irq).

There is also `pin`, which places a thread on the vCPUs you choose the next
time it wakes:

```bash
machine tasks app pin 56 2      # on vCPU 2
machine tasks app pin 56 0-1    # on vCPU 0 or 1
machine tasks app pin 56 none   # on no vCPU, so it does not run
machine tasks app pin 56 free   # on any vCPU again
```

A set is one vCPU or a range, both ends included. A pin decides where the
thread goes when it wakes, so a thread already queued on another vCPU stays
there until then. `none` keeps a thread from running at all, until you pin it
somewhere again.

Two more things you can ask of `tasks`. [`machine tasks app exits`](commands.md#machine-tasks-exits) lists the
tasks that have left and how each one ended, and [`machine tasks app cgroups`](commands.md#machine-tasks-cgroups)
groups them by cgroup. `--focused` shows only the tasks you are steering.

From Python, the same verbs are `run.tasks.hold(56)`, `run.tasks.release(56)`,
`run.tasks.yield_(56)`, `run.tasks.slice(56, "10us")` and
`run.tasks.pin(56, "2")`. `run.tasks.exits()` and `run.tasks.cgroups()` read
the other two lists.

## Plans

When one rule isn't enough, write a plan file. A plan is a list of clauses,
and each one says when it applies and what to do.

```
when /test:on       mode step,fast   fast=1:100k step=1:200
when /test:kernel   task-sched hold
else                mode fast
```

Machine tries the clauses in order and the last match wins, so a later
clause overrides an earlier one. `else` covers whatever nothing matched.

Each `when` names a state of a program (`/test:on` is the program running its
own code, and `/test:kernel` is the program running in the kernel). After that come the
things to choose for each stretch of execution it covers, such as the mode, how
many instructions to run, or what to do with the scheduler. [`machine plan`](commands.md#machine-plan)
`--help` lists all of them.

```bash
machine plan app plan.txt
machine run app
```

A clause draws any of these, once per dispatch:

| Axis | Draws |
|---|---|
| `mode` | how the machine runs: `fast`, `step`, `step-into`, `free`, `fence` or `keep`, with the length of a stretch as `fast=1:100k` |
| `task-sched` | what the task on the vCPU does: `keep`, `hold`, `yield`, `drain`, `drain-all` |
| `task-int` | whether to preempt that task: `none` or `preempt` |
| `task-slice` | how long that task runs between decisions: `keep:default:10us:600us` |
| `task-pin` | where a task goes when it next wakes: a vCPU set, `free` or `none` |
| `vtime-rate` | how fast the machine's clock passes, as in [Clock rate](#clock-rate) |
| `vtime-add` | time added to the clock before the dispatch, such as `10us:2ms` |
| `timer-slack` | how late a timer may be, such as `0:20ms` |
| `irq-delay` | how long each interrupt is held, as in [Holding interrupts](#holding-interrupts) |

Every axis but `task-slice` is a comma list of choices, and `[N]` makes a
choice N times as likely: `mode step[3],fast[1]` draws step three times as
often as fast. `keep` draws nothing and leaves the axis as it was, so a clause
can leave an axis alone part of the time. A range such as `1:200` draws one
value from it, and the plan's `--seed` makes every draw repeatable.

A `when` names what a task is doing: `/path:on` for a program running its own
code, `/path:kernel` in the kernel, `/path:syscall=openat` in one system call. The
subject can also be `tid=N`, `tgid=N`, `comm=NAME` or `cgroup=PATH`, and
`vcpu=1` narrows it to one vCPU. Braces may group a clause, `#` starts a
comment, and a file named `-` is read from standard input.

```
# Find the race: interrupt the writer, and move it between vCPUs.
when /usr/bin/app:on            mode step[3],fast[1] step=1:200 fast=1:50k
when tid=56:on                  task-int none[4],preempt[1]
else                            mode fast  task-pin 56=golden:2[3],3[1]
```

The plan applies only to that `machine plan`. A later `machine run` does not
use it.

From Python, `run.plan("plan.txt", seed=3)` runs a plan from a file, and the
`RunResult` it returns lists each clause with the iterations it applied to. The
`plan_file.py` example shows one.

## Interrupts

Inject an interrupt by name or number.

```bash
machine irq app preempt --vcpu 1
```

The interrupt is queued, then delivered at the next boundary and recorded
there, so a replay delivers it at the same place.

`--nmi` delivers a non-maskable interrupt instead, which reaches a vCPU even
while the guest has interrupts turned off, so you can test how a program or
the kernel handles one:

```bash
machine irq app --nmi --vcpu 0
```

### Holding interrupts

[`machine run`](commands.md#machine-run) can hold each interrupt a drawn time
before it is delivered, at most one second:

```bash
machine run app --irq-delay 0:2ms
machine run app --irq-delay timer=0:2ms,blk=1ms
```

A bare span holds every interrupt. Name a target to hold one kind: `timer`,
`ipi`, `init`, `blk`, `rng`, `console`, `serial`, `keyboard`, `device` or
`all`. The most specific target wins. An interrupt is never delivered before
one held earlier on its line, its MSI vector, or its vCPU's timer, IPI
vector, or INIT and SIPI.

[`machine irqs`](commands.md#machine-irqs) lists every interrupt the machine
owes or holds, then the vectors [`machine irq`](commands.md#machine-irq)
injects. An owed interrupt was raised by a device or a timer and is injected
at the next dispatch. A held one waits for the time the draw gave it. The
state hash `irq_pending` is of the held ones, and
[`machine state`](commands.md#machine-state) shows how many are held.

```bash
machine irqs app
```

The run log keeps each hold, and a checkpoint keeps what is held. At the
[control prompt](running-a-machine.md#interactive-mode) the same option is
`irq-delay` on `/run`. From Python it is `run.run(irq_delay="0:2ms")`, and
`run.irq.pending()` lists them.

## Machine time

Machine time is not the host's. [`machine vtime app rate`](commands.md#machine-vtime-rate)
changes how fast it passes, and [`machine vtime app add`](commands.md#machine-vtime-add) pushes it forward
without running anything.

```bash
machine vtime app add 5s
```

There is no way back. The machine's clock only goes forward, so to return to an
earlier time, branch there with [`machine go app 1.5s`](commands.md#machine-go).

### Starting date

Every machine's clock starts at 2026-03-01 00:00 UTC, whatever the date is on
your computer, so a program that reads the date reads the same one in every
run. To test code that depends on the date, such as a certificate that
expires or a job that runs at the end of a month, give the start as a Unix
timestamp when you create the run:

```bash
machine create app --disk app --vtime-base 1893456000   # 2030-01-01 00:00 UTC
machine create app --disk app --vtime-base "$(date -d 2030-01-01T00:00:00Z +%s)"
```

The run keeps its starting date, and every branch of it has the same one.

### Clock rate

The machine's clock moves with the work the guest does: 10 nanoseconds for
each conditional branch a vCPU retires, unless the run was created with
`--vtime-rate`. A higher rate makes the same work take longer in the guest's
eyes, which brings timeouts closer, and a lower one makes it faster. The rate
is a number or a fraction:

```bash
machine vtime app rate 20      # the same work takes twice as long
machine vtime app rate 1/2     # 0.5 ns a branch
```

The change is recorded, so a replay changes the rate at the same point. Idle
time is a separate matter: [Time compression](running-a-machine.md#time-compression)
skips it whatever the rate.

From Python, `client.create("app", disk="app", vtime_base=1893456000)` sets
the starting date, `run.vtime.rate("20")` the rate, and `run.vtime.add("5s")`
pushes the clock forward.

[Fault injection](fault-injection.md) makes things fail: system calls, the
kernel and the disk, a service's container, and the date the guest and its
containers read.
