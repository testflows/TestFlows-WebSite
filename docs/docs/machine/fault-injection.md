<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Fault injection

Machine makes things fail inside the machine, at the point you choose or by
chance, and records each fault with the run, so a replay fails exactly the same
way. There are three kinds of fault, each with its own command:

| Command | What it makes fail | Section |
|---|---|---|
| `machine inject` | a program's system calls, the kernel's disk requests and memory allocations, and the disk's data | [System call faults](#system-call-faults), [Kernel faults](#kernel-faults), [Disk faults](#disk-faults) |
| `machine containers` | one service's container: stopped, killed, crashed, paused or throttled | [Container faults](container-faults.md) |
| `machine clock` | the date the guest or one container reads: stepped, drifting, jittering, or a leap second | [Clock faults](clock-faults.md) |


`machine inject` makes things fail inside the machine. A fault goes into a
subsystem: a program's system calls, or one of the kernel's own places where
things can fail, such as the disk or memory allocation, or the disk itself. You
find out what your program does when `openat` says `EACCES`, `write` says
`ENOSPC`, the disk returns an I/O error, the kernel runs out of memory, or the
disk quietly returns the wrong bytes, at the call you choose or by chance.

| Subsystem | What fails |
|---|---|
| `syscall` | a system call returns an error you choose, or waits first |
| `disk` | a disk read or write returns an I/O error |
| `disk-timeout` | a disk request never completes, and its task waits forever |
| `slab`, `pages` | a kernel memory allocation fails, usually as `ENOMEM` |
| `usercopy` | the kernel fails to copy to or from the program's memory: `EFAULT` |
| `futex-access` | a futex call fails to reach the program's memory: `EFAULT` |
| `disk-corrupt` | a disk read or write succeeds with bytes changed |
| `disk-torn` | a write succeeds, but only its first sectors reach the disk |
| `disk-lost` | a write succeeds, and none of it reaches the disk |

Every subsystem takes the same options: `--in` for whose calls, `--prob` for the
chance, `--after` to let calls through first, `--times` to stop after a number,
`--seed`, and `--on` and `--off` to make the fault [cycle](#faults-that-cycle).
The disk subsystems also take `--file`, `--op` and `--sectors` to say which
requests. The guest kernel decides each call itself, without stopping
the machine, and a replay fails exactly the same calls.

## System call faults

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

## Kernel faults

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
- **The kernel reads a page twice.** A buffered read goes out as readahead,
  and when that fails the kernel reads the page once more before it gives up.
  `disk --times 1` fails only the first try, so your program reads the file
  fine; that is the kernel recovering. Use `--times 2`, or no limit, for the
  program to get `EIO`. An `O_DIRECT` read fails on its first request.
- **`disk-timeout` hangs.** The request is lost, and the task waiting for it
  stays stuck until the machine stops. That is the point: you find out what
  else in the program notices. Name your program in `--in`: with `--in all`
  the lost request may be the kernel's own, and whatever waits on that disk
  hangs with it.

## Disk faults

The faults above are errors: your program is told something failed. Real disks
also fail silently. A write reports success and the data is wrong, half there,
or not there at all. `disk-corrupt`, `disk-torn` and `disk-lost` are those
failures. The request succeeds, and the damage is found later, or never.

| You want to know | Fault |
|---|---|
| Does the database notice a bad block when it reads its data files? | `disk-corrupt --file '/var/lib/db/*/data.bin'` |
| Does the program trust bytes it read without a checksum? | `disk-corrupt --op read --file /srv/app/state.json` |
| Does recovery handle a log record only half written? | `disk-torn --file /var/lib/db/wal --times 1` |
| Does it notice a committed write that never arrived? | `disk-lost --file /var/lib/db/wal --after 10 --times 1` |
| Does the filesystem survive damage to its own metadata? | `disk-corrupt --sectors LO:HI`, the sectors of its inode table or journal |

```bash
machine inject app add disk-corrupt --file '/var/lib/db/*/data.bin' --op write --bytes 8 --times 1 --in all
machine inject app add disk-torn --file /var/lib/db/wal --times 1 --in all
machine inject app add disk-lost --file /var/lib/db/wal --after 10 --times 1 --in all
machine inject app add disk-corrupt --op read --prob 0.01 --in /usr/bin/app
```

- **`--file` is a pattern.** `*` matches within a directory and `**` across
  directories. Programs often name their files as they run, and a pattern names
  them before they exist. A file the program already holds open or maps, such
  as a running database's WAL, matches too. A file inside a container is named
  by its path in the container.
- **`--in all` with `--file`.** Ordinary writes reach the disk from the kernel's
  flusher, not from your program, so `--in all` is what reaches them. `--file`
  keeps the fault on your file.
- **The page cache hides a damaged write.** The kernel keeps the bytes your
  program wrote in memory, so the program reads them back clean until they are
  read from the disk again: after a restart, after
  `echo 3 > /proc/sys/vm/drop_caches`, or in a branch forked later. A damaged
  read is the other way round: the bad bytes go into the page cache, and every
  reader sees them until the kernel drops the page.
- **A tear is whole sectors.** A sector is written whole or not at all, so a
  write of one sector does not tear. A torn write keeps at least one sector of
  the new data and loses at least one.
- **`--sectors` aims below the files.** It names 512-byte sectors of the whole
  disk, so it reaches what `--file` cannot: the filesystem's inodes, bitmaps
  and journal. The filesystem's own tools say where those are, such as
  `dumpe2fs` and `debugfs` for ext4, in blocks of its partition. With 4 KiB
  blocks, block N starts at sector 8 × N plus the partition's first sector,
  which `/sys/class/block/vda1/start` holds, or 0 for a filesystem on the
  whole disk. Or stop at a write with
  `catch add io`, below, and read its sectors off the stop.
- **`disk-lost` is one write, not a crash.** The lost write reports success,
  and the writes after it still land. A power cut loses every write since the
  last flush. Machine does not offer that.

A replay damages the same bytes, so a bug you find this way is found again on
every replay of the run.

**A worked example: ClickHouse.** ClickHouse writes each part of a table into a
directory it names as it goes, such as `all_12_12_0`, and checks the part's
checksums when it reads it back. To damage one column file of the next part
written and see what ClickHouse does:

```bash
machine inject app add disk-corrupt --file '/var/lib/clickhouse/data/db/t/*/data.bin' \
    --op write --bytes 8 --times 1 --in all
machine exec app run -- clickhouse-client -q "INSERT INTO db.t SELECT number FROM numbers(1000000)"
machine exec app run -- sync
machine exec app run -- sh -c 'echo 3 > /proc/sys/vm/drop_caches'
machine exec app run -- clickhouse-client -q "CHECK TABLE db.t"
```

To damage one part you have already seen, find its name first on a branch, and
keep your run where it is:

```bash
machine fork app --name peek
machine exec app/peek run -- clickhouse-client -q "INSERT INTO db.t SELECT number FROM numbers(1000000)"
machine exec app/peek run -- sync
machine checkpoint app/peek
machine fs ls app/peek /var/lib/clickhouse/data/db/t --at now
```

Then add the fault on `app` with the exact path. The run is deterministic, so it
writes the same part. An insert's part name holds; a merge's can change, because
any fault changes how the machine runs a little. A pattern covers both.

## Faults that cycle

Real outages come in bursts: a disk that is flaky for two seconds, a network
that drops for five. `--prob` fails calls one at a time and independently,
which rarely exercises retries, backoff or a circuit breaker. `--on` and
`--off` make a fault active for a stretch of machine time, rest for another,
and repeat:

```bash
machine inject app add disk --file /var/lib/db/data --on 2s --off 5s --in all
machine inject app add syscall open,openat ENOENT --in tgid=63 --on 2s --off 3s --seed 5
```

The first fails the data file's disk requests for 2 seconds in every 7. The
cycle starts when the fault is added, active first, on the machine's own
clock, so a slow host changes nothing and a replay crosses every edge at the
same instruction. While a fault rests it matches no call and counts none, so
`--after` and `--times` count only the calls in its active windows. Both
options are needed, each a whole number of milliseconds from 1ms to a day.

The listing says which window each fault is in and how long it has left. The
second command printed:

```
#   INJECT                 ERRORS                   DELAY        IN               FIRES                 PROB       SEED  MATCHED   FIRED
1   syscall open           ENOENT                   -            tgid=63          every call               1          5        0       0
    on 2s  off 3s  now on, 2s left
2   syscall openat         ENOENT                   -            tgid=63          every call               1          5        0       0
    on 2s  off 3s  now on, 2s left
```

[`machine inject app`](commands.md#machine-inject) later shows the window
moving: `now on, 996ms left` one second in, and `now off, 2496ms left` at two
and a half seconds.

A shell loop that opened a file twice a second under the second command
printed 4 failures, then 6 successes, over and over: 2 seconds failing, 3
seconds working. Each window has a fixed length. To try outages of other
lengths, fork branches from one checkpoint and give each its own `--on` and
`--off`.

## Stopping at a fault

To look at the program at the moment a fault fires, add a catchpoint for it:

```bash
machine catch app add fault openat
machine catch app add fault disk
machine catch app add fault disk-corrupt
machine run app
```

The run stops where the fault fires, before a system call's wait and error, and
says which: `Stopped at catchpoint 1: fault openat EACCES, in tid 229`, or
`fault disk, in tid 77`. See [Debugging](debugging.md) for catchpoints.

### Stopping at a file's I/O

An `io` catchpoint stops the run at a disk request, with no fault. `--file`
takes the same patterns as a disk fault, and `--op` takes `read` or `write`:

```bash
machine catch app add io --file '/var/lib/clickhouse/data/db/t/*/data.bin' --op write
machine run app
```

The run stops as the request is sent, before any disk fault decides on it, and
names the request: `Stopped at catchpoint 1: io write 1058144:1058151, in tid
266`. A fault added there decides on that same request. Name it by its file:

```bash
machine inject app add disk-lost --file '/var/lib/clickhouse/data/db/t/*/data.bin' --times 1 --in all
machine catch app delete 1
machine run app
```

Or by its sectors and its task, which name this request and no other:

```bash
machine inject app add disk-corrupt --sectors 1058144:1058151 --times 1 --in tid=266
```

An ordinary write is sent by the kernel's flusher, so the stop names a kernel
task such as `kworker/u4:1`. `--in tid=N` names that task as well as any
other.

## Changing faults

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

Faults and [plans](steering-programs.md#plans) work together. Add the faults, then run the plan:
the faults apply to every stretch of execution, whatever the plan chooses. To
change them partway, stop, change them, and run on.

From Python, `run.inject.add(...)` takes the same subsystem, errors and
options, with `in_=` for `--in`, and `run.inject()` lists the faults with
their counts. [The SDK's Faults](python-sdk.md#faults) has an example.

## What a fault misses

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
