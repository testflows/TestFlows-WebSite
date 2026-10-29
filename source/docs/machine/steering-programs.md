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
[`machine tasks app exist comm=cat`](#which-calls-fail) lists the tasks with
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

`machine inject` makes things fail inside the machine. A fault goes into a
subsystem: a program's system calls, or one of the kernel's own places where
things can fail, such as the disk or memory allocation. You find out what your
program does when `openat` says `EACCES`, `write` says `ENOSPC`, the disk
returns an I/O error or the kernel runs out of memory, at the call you choose or
by chance.

| Subsystem | What fails |
|---|---|
| `syscall` | a system call returns an error you choose, or waits first |
| `disk` | a disk read or write returns an I/O error |
| `disk-timeout` | a disk request never completes, and its task waits forever |
| `slab`, `pages` | a kernel memory allocation fails, usually as `ENOMEM` |
| `usercopy` | the kernel fails to copy to or from the program's memory: `EFAULT` |
| `futex-access` | a futex call fails to reach the program's memory: `EFAULT` |

Every subsystem takes the same options: `--in` for whose calls, `--prob` for the
chance, `--after` to let calls through first, `--times` to stop after a number,
and `--seed`. The guest kernel decides each call itself, without stopping the
machine, and a replay fails exactly the same calls.

### System calls

A syscall fault names a system call and the errors it may return, and the
program's calls of it return one of them without running.

```bash
machine inject app add syscall connect ECONNREFUSED --in /usr/bin/app
machine exec app run -- /usr/bin/app
machine inject app
```

The last command lists the faults, with how many calls each one matched and
fired on. For a program that connects once, it shows that one call failed. The
seed is drawn, so yours differs:

```
#   INJECT                 ERRORS                   DELAY        IN               FIRES                 PROB       SEED  MATCHED   FIRED
1   syscall connect        ECONNREFUSED             -            /usr/bin/app     every call               1 1820473361        1       1
```

The guest kernel decides at each call, and the run records every fault you
add, so a replay fails the same calls with the same errors. A checkpoint keeps
the faults and their counts, and a branch has its parent's.

### Which calls fail

`--in` says whose calls fail, and you always give it:

* **A program, by its absolute path:** `--in /usr/bin/app`. The fault applies to
  every task running that program, and to the processes it forks without
  starting another program, such as a server's workers. It starts with the
  program, so you can add it before the program runs. Use the path
  [`machine tasks app`](commands.md#machine-tasks) shows as EXE: a symlink
  counts as the file it points to, so busybox's `/bin/cat` is `/bin/busybox`.
  A program that loads shared libraries opens and reads them after it starts,
  so add a fault on `openat`, `read` or `stat` once it is up, or it fails the
  loading instead.
* **A task's name:** `--in comm=cat`. The kernel names a task after the file
  the command named, up to 15 bytes. That picks out one tool of a
  multi-call binary such as busybox, and a script, whose program is its
  interpreter but whose name is its own. The interpreter's first open is of
  the script itself, so `--after 1` lets it read the script and fails what
  the script opens:

  ```bash
  machine inject app add syscall open EACCES --in comm=s.sh --after 1
  machine exec app run -- /tmp/s.sh
  ```

  That is busybox's shell, which calls `open`. A glibc shell calls `openat`
  and opens its shared libraries first: count them in `--after`, or add the
  fault once the script runs.
* **One process:** `--in tgid=412`, its pid. Add it once the program is running.
  Before then, that process is still being set up to run it.
* **One thread:** `--in tid=41`.
* **Every task in the machine,** the system's own included: `--in all`.

To make sure something runs before you act on it, ask first. `machine tasks app
exist` takes the same words, lists the tasks that match, and fails when none
does. It only reads, so it changes nothing:

```bash
machine tasks app exist /usr/bin/app && machine inject app add syscall openat ENOENT --in /usr/bin/app
```

A rule's `--after` and `--times` count calls across every task it matches: for
a program, the 100th write is the 100th of all its processes together.

```bash
machine inject app add syscall write ENOSPC --in /usr/bin/app --after 99 --times 1   # the 100th write
machine inject app add syscall read EINTR --in /usr/bin/app --prob 0.1               # a read in ten
machine inject app add syscall read EIO --in /usr/bin/app --prob 0.5 --times 2       # by chance, twice at most
machine inject app add syscall read EIO --in /usr/bin/app --prob 0                   # count the calls, fail none
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
machine inject app add syscall read EIO --in /usr/bin/app --prob 0.1
machine run app --within 10s
machine inject app delete 1
```

To fail one particular call, run until the program makes it, then add the fault
for one call. The stop is at the start of the call, so that same call fails:

```bash
machine run app --until tgid=412:syscall=write
machine inject app add syscall write EIO --in tgid=412 --times 1
machine run app
```

Name several system calls at once and each gets a fault of its own:

```bash
machine inject app add syscall open,openat,creat EACCES --in /usr/bin/app
```

### Which errors

Any Linux error goes, by name or by number, whether or not the system call's
manual lists it. Give a set and each failing call returns one of them. The
examples here fail `openat` of `/usr/bin/app`, so add them once it runs, after
`machine tasks app exist /usr/bin/app`:

```bash
machine inject app add syscall openat ENOENT,EACCES,EMFILE --in /usr/bin/app   # one of three, each call
machine inject app add syscall openat valid --in /usr/bin/app                  # one the manual documents
machine inject app add syscall openat valid,-EINTR --in /usr/bin/app           # those, but not EINTR
```

`valid` is the errors the system call's manual page lists. `all` is every error
Linux names, which is more than a fault holds, so pick some of it.

### Picking errors at random

`--pick` takes a number of errors from the set when you add the fault, and the
fault keeps those. This is swarm testing: each run fails with its own few errors.

```bash
machine inject app add syscall openat,read,write valid --pick 1 --in /usr/bin/app   # one error each
machine inject app add syscall openat all --pick 3 --in /usr/bin/app                # three of any
```

Every fault has a seed, and the list shows it. The seed decides the picks,
which calls fail by chance and which error each one returns. Give `--seed` to
draw as another run did:

```bash
machine inject app add syscall openat valid --pick 2 --seed 7 --in /usr/bin/app
```

### Slow calls

A fault can hold a call instead of failing it. `--delay` takes a time, or a
span to draw one from for each call, up to a second:

```bash
machine inject app add syscall read --delay 0:20ms --in /usr/bin/app            # each read waits 0 to 20ms, then runs
machine inject app add syscall connect ECONNREFUSED --delay 500ms --in /usr/bin/app   # waits, then fails
machine inject app add syscall write --delay 5ms --prob 0.1 --in /usr/bin/app   # one write in ten waits 5ms
```

The wait is on the machine's own clock, and each call draws its time from the
fault's seed, so a replay holds the same calls for the same time. `--prob`,
`--after`, `--times` and `--in` work as they do for errors.

### The disk and the kernel's memory

The other subsystems fail work inside the kernel, after a system call has
started, where a syscall fault never reaches. They take no errors: each fails
the way the kernel would.

```bash
machine inject app add disk --times 1 --in /usr/bin/app        # one disk request fails with EIO
machine inject app add disk --prob 0.01 --in all               # a disk request in a hundred
machine inject app add slab --after 50 --times 1 --in /usr/bin/app   # its 51st allocation fails
machine inject app add usercopy --after 100 --times 1 --in /usr/bin/app
machine inject app add disk-timeout --times 1 --in /usr/bin/app # its next disk request never completes
```

A few things decide whether you see the failure:

- **Who sends a disk request.** Your program sends its reads, its `O_DIRECT`
  writes and the writes `fsync` forces, so `--in /usr/bin/app` fails those.
  Ordinary writes wait in memory and the kernel's flusher writes them later, so
  only `--in all` reaches them.
- **A program's first moments.** When a program starts, the kernel copies its
  arguments in and allocates for it. A `usercopy` or allocation fault that fires
  then kills the program before your code runs. Use `--after`, or add the fault
  once the program is up.
- **The kernel copes with some failures.** A failed page allocation is often
  retried, and the program never sees it. `MATCHED` and `FIRED` in the list
  still show that the fault fired.
- **`disk-timeout` hangs.** The request is lost, and the task waiting for it
  stays stuck until the machine stops. That is the point: you find out what
  else in the program notices. Name your program in `--in`: with `--in all`
  the lost request may be the kernel's own, and whatever waits on that disk
  hangs with it.

### Stopping at a fault

To look at the program at the moment a fault fires, add a catchpoint for it:

```bash
machine catch app add fault openat
machine catch app add fault disk
machine run app
```

The run stops where the fault fires, before a system call's wait and error, and
says which: `Stopped at catchpoint 1: fault openat EACCES, in tid 229`, or
`fault disk, in tid 77`. See [Debugging](debugging.md) for catchpoints.

### Changing faults

```bash
machine inject app delete 2       # by its number in the list
machine inject app clear
```

At the [control prompt](running-a-machine.md#interactive-mode) it is `/inject`,
with the same words, and `/tasks exist` checks first:

```
/tasks exist /usr/bin/app
/inject add syscall openat ENOENT --in /usr/bin/app
```

Faults and [plans](#plans) work together. Add the faults, then run the plan:
the faults apply to every stretch of execution, whatever the plan chooses. To
change them partway, stop, change them, and run on.

### Good to know

- **A C function is not always the system call of its name, and C libraries
  differ.** glibc's `open()` calls `openat`, musl's calls `open`, and glibc's
  `stat()` calls `newfstatat`. Name both, `open,openat`, to cover either.
  [`machine syscalls app`](commands.md#machine-syscalls) lists the names the
  kernel uses.
- **Give `--seed` in a script that records again.** Without it each run draws
  its own seed. A replay needs none: the run keeps the fault as it was added.
- **64-bit system calls only.** A 32-bit call, made with `int 0x80`, never fails.
- **Calls the vDSO answers never reach the kernel.** `clock_gettime`,
  `gettimeofday`, `time` and `getcpu` usually return without a system call, so
  a fault on them matches nothing and MATCHED stays 0.
- **16 faults, and 34 errors in one.** Delete one to add another; pick some of
  `all`.
- **A fault matches the system call, whose call it is and the count of calls.**
  It does not look at the arguments, so "openat of /etc/passwd" is not a fault.
  Stop at the call and fail that one instead.
