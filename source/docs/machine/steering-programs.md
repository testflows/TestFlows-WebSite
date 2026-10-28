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

You can also focus on a cgroup (`cgroup=/path`) or a single process
(`tgid=12`). `focus remove` and `focus clear` take them off again.

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
time it wakes. Run [`machine tasks pin`](commands.md#machine-tasks-pin) `--help` to see how to name them.

Two more things you can ask of `tasks`. [`machine tasks app exits`](commands.md#machine-tasks-exits) lists the
tasks that have left and how each one ended, and [`machine tasks app cgroups`](commands.md#machine-tasks-cgroups)
groups them by cgroup. `--focused` shows only the tasks you are steering.

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

## Interrupts and time

Inject an interrupt by name or number.

```bash
machine irq app preempt --vcpu 1
```

The interrupt is queued, then delivered at the next boundary and recorded
there, so a replay delivers it at the same place.

Machine time is not the host's. [`machine vtime app rate`](commands.md#machine-vtime-rate)
changes how fast it passes, and [`machine vtime app add`](commands.md#machine-vtime-add) pushes it forward
without running anything.

```bash
machine vtime app add 5s
```

There is no way back. The machine's clock only goes forward, so to return to an
earlier time, branch there with [`machine go app 1.5s`](commands.md#machine-go).

## Fault injection

Make a program's system calls fail. A fault names a system call and the errors
it may return, and the program's calls of it return one of them without running.
You find out what your program does when `openat` says `EACCES`, `write` says
`ENOSPC` or `connect` says `ECONNREFUSED`, at the call you choose or by chance.

```bash
machine focus app add /usr/bin/app
machine exec app start -- /usr/bin/app
machine run app --until /usr/bin/app:exec        # task: exec 412 (tgid 412)
machine fault app add openat ENOENT --tgid 412
machine run app --until tgid=412:exit
machine fault app
```

Add the fault once the program has started, by its tgid, which is its pid.
Before then, that process is still being set up to run it, and the fault
would fail those calls instead.

The last command lists the faults, with how many calls each one matched and failed:

```
#   SYSCALL        ERRORS                   TASK       FAILS                 PROB       SEED  MATCHED  FAILED
1   write          EIO,ENOSPC               tgid=69    every call after 2     0.3          5      101      35
```

The guest kernel decides at each call, and the run records every fault you
add, so a replay fails the same calls with the same errors. A checkpoint keeps
the faults and their counts, and a branch has its parent's.

### Which calls fail

Name the program with `--tgid` or one thread with `--tid`. To fail the calls of
every task in the machine, the system's own included, say `--all-tasks`. One
of the three is required.

```bash
machine fault app add write ENOSPC --tgid 412 --after 99 --times 1   # the 100th write
machine fault app add read EINTR --tgid 412 --prob 0.1               # a read in ten
machine fault app add read EIO --tgid 412 --prob 0.5 --times 2       # by chance, twice at most
machine fault app add read EIO --tgid 412 --prob 0                   # count the calls, fail none
```

`--after` lets that many matching calls through first. `--prob` is the chance a
call fails, from 0 to 1. `--times` is the most calls that fail; without it there
is no end.

The chance belongs to each call, not to a stretch of time. A fault stands from
when you add it until you delete it, and every matching call draws on its own:
1,000 calls at `--prob 0.1` fail about 100 of them, however long they take. To
fault a stretch, such as the next 10 seconds of machine time, add the fault, run
for that long, and delete it:

```bash
machine fault app add read EIO --tgid 412 --prob 0.1
machine run app --within 10s
machine fault app delete 1
```

To fail one particular call, run until the program makes it, then add the fault
for one call. The stop is at the start of the call, so that same call fails:

```bash
machine run app --until tgid=412:syscall=write
machine fault app add write EIO --tgid 412 --times 1
machine run app
```

Name several system calls at once and each gets a fault of its own:

```bash
machine fault app add openat,openat2,creat EACCES --tgid 412
```

### Which errors

Any Linux error goes, by name or by number, whether or not the system call's
manual lists it. Give a set and each failing call returns one of them:

```bash
machine fault app add openat ENOENT,EACCES,EMFILE --tgid 412   # one of three, each call
machine fault app add openat valid --tgid 412                  # one the manual documents
machine fault app add openat valid,-EINTR --tgid 412           # those, but not EINTR
```

`valid` is the errors the system call's manual page lists. `all` is every error
Linux names, which is more than a fault holds, so pick some of it.

### Picking errors at random

`--pick` takes a number of errors from the set when you add the fault, and the
fault keeps those. This is swarm testing: each run fails with its own few errors.

```bash
machine fault app add openat,read,write valid --pick 1 --tgid 412   # one error each
machine fault app add openat all --pick 3 --tgid 412                # three of any
```

Every fault has a seed, and the list shows it. The seed decides the picks,
which calls fail by chance and which error each one returns. Give `--seed` to
draw as another run did:

```bash
machine fault app add openat valid --pick 2 --seed 7 --tgid 412
```

### Changing faults

```bash
machine fault app delete 2       # by its number in the list
machine fault app clear
```

At the [control prompt](running-a-machine.md#interactive-mode) it is `/fault`,
with the same words: `/fault add openat ENOENT --tgid 412`.

Faults and [plans](#plans) work together. Add the faults, then run the plan:
the faults apply to every stretch of execution, whatever the plan chooses. To
change them partway, stop, change them, and run on.

### Good to know

- **A C function is not always the system call of its name.** glibc's `open()`
  calls `openat`, and its `stat()` calls `newfstatat`. Adding a fault on `open`
  says so. [`machine syscalls app`](commands.md#machine-syscalls) lists the
  names the kernel uses.
- **Give `--seed` in a script that records again.** Without it each run draws
  its own seed. A replay needs none: the run keeps the fault as it was added.
- **64-bit system calls only.** A 32-bit call, made with `int 0x80`, never fails.
- **16 faults, and 40 errors in one.** Delete one to add another; pick some of
  `all`.
- **A fault matches the system call, the task and the count of calls.** It does
  not look at the arguments, so "openat of /etc/passwd" is not a fault.
