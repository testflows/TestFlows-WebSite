<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Fault injection

Machine makes things fail inside the machine, at the point you choose or by
chance, and records each fault with the run, so a replay fails exactly the same
way. There are four kinds of fault, each with its own command:

| Command | What it makes fail | Section |
|---|---|---|
| `machine inject` | a program's system calls and its functions, the kernel's disk requests and memory allocations, and the disk's data | [System call faults](#system-call-faults), [Function faults](#function-faults), [Kernel faults](#kernel-faults), [Disk faults](#disk-faults) |
| `machine containers` | one service's container: stopped, killed, crashed, paused, throttled, or limited in memory, processes, open files or local ports | [Container faults](container-faults.md), [Resource exhaustion](#resource-exhaustion) |
| `machine clock` | the date the guest or one container reads: stepped, drifting, jittering, or a leap second | [Clock faults](clock-faults.md) |
| `machine net` | the links between containers: slow, lossy, out of order, rate limited, or cut | [Network faults](network-faults.md) |


`machine inject` makes things fail inside the machine. A fault goes into a
subsystem: a program's system calls, or one of the kernel's own places where
things can fail, such as the disk or memory allocation, or the disk itself. You
find out what your program does when `openat` says `EACCES`, `write` says
`ENOSPC`, the disk returns an I/O error, the kernel runs out of memory, or the
disk quietly returns the wrong bytes, at the call you choose or by chance.

| Subsystem | What fails |
|---|---|
| `syscall` | a system call returns an error you choose, or waits first |
| `function` | a function of a program, such as `malloc`, returns a value you choose without running |
| `disk` | a disk read or write returns an I/O error |
| `disk-timeout` | a disk request never completes, and its task waits forever |
| `slab`, `pages` | a kernel memory allocation fails, as `ENOMEM` in most calls |
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
Linux names, which is more than the 30 a fault holds, so use `--pick` with it.

An error the manual does not list is one Linux would not return from that
call. `getpid` failing with `ENOSPC` never happens on a real system. Machine
allows it on purpose: it tests whether the program handles an error it did not
expect. Use `valid` for failures a real system produces, and an error by name
or `all` to test the program's handling of any error.

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

## Function faults

`function` makes a function of a program return a value without running. A
`malloc` that returns 0 is an allocation that failed, which no system call
fault reaches: the C library serves most allocations from memory it already
has, without asking the kernel.

```bash
machine inject app add function malloc --return 0 --prob 0.01 --in /usr/bin/app
machine inject app add function malloc --in comm=sort --at 628   # found in task 628's files
machine inject app add function fopen --after 3 --times 1 --in /usr/bin/app
```

The function is found by its name in the files a running task maps, its C
library or the program itself, and the fault acts on every task that maps
the same file and that `--in` names. With `--in` naming a program that runs
now, the function is found in that program. With one that does not run yet,
name with `--at` a task that maps the same library, such as a shell of the
same container.

In one test, `--in comm=sort` with `--return 0` made busybox's `sort` exit 2 on
its first allocation, while `seq` and `tail` in the same container ran as
before. With `--prob 0.05`, four runs of `sort` matched 60 calls and failed 4,
and a branch replayed from a checkpoint before them failed the same calls.

- **errno is not set.** The C library keeps errno in each thread's own memory,
  so a caller that checks the return sees the failure, and one that reads
  errno reads what was there before.
- **The function's first instruction.** The kernel puts a breakpoint there, in
  the tasks `--in` names alone, and a fire returns to the caller before the
  function sets up its frame. Each call traps into the kernel, which costs
  time in a function called often.
- **The task `--at` names.** It must be a task inside the container, not
  the `docker exec` that started it: `machine tasks app` shows each task's
  program as the container sees it, such as `/bin/sh`.

## Memory faults

Memory goes wrong in four places: a program's allocator returns nothing, the
kernel refuses memory, a service runs out of it, or the data in it is wrong.
Each has its own fault:

| You want to know | Fault |
|---|---|
| Does the program handle `malloc` returning NULL? (errno is not set) | `inject add function malloc --return 0 --after 5 --times 1 --in /usr/bin/app` |
| Does it survive one allocation in a hundred failing? | `inject add function malloc --return 0 --prob 0.01 --in /usr/bin/app` |
| Does it handle the kernel refusing to grow its heap? | `inject add syscall brk ENOMEM --in /usr/bin/app` |
| Does a system call fail cleanly when the kernel cannot allocate? | `inject add slab --after 50 --times 1 --in /usr/bin/app` |
| What happens when a service runs out of memory? | `containers memory db 64m` |
| How does a service behave under memory pressure, short of a kill? | `containers memory db 48m --soft` |
| Does the program notice a flipped bit in its data? | `mem 412 'checksum^=0x1'` |
| What does a pointer set to 0 do? | `mem 412 'head=0'` |
| What does a buffer of garbage do? | `mem 412 buf --fill 0xde --length 4096` |

### A program's allocations

A program asks its C library for memory, and the library serves most
requests from memory it already has, without a system call. A
[function fault](#function-faults) on `malloc` reaches every allocation:

```bash
machine inject app add function malloc --return 0 --after 5 --times 1 --in comm=sort --at 628
machine exec app run --container api -- sort -n /tmp/numbers
```

```text
sort: out of memory
```

`sort` failed on its sixth allocation, and the next run, with the fault used
up, sorted as before. `calloc`, `realloc` and `strdup` are functions of their
own: name each that the program calls.

### The kernel's answer

`brk` grows the heap and `mmap` maps new memory. A fault on them is the
kernel refusing, which the C library sees first: it turns a refused `brk`
into an `mmap`, and a refused `mmap` into `malloc` returning NULL.

```bash
machine inject app add syscall brk ENOMEM --in /usr/bin/app
```

A refused `brk` returns the break unchanged, as the kernel's own refusal does,
and the C library moves to `mmap`: with every `brk` of `sort` failing, all 12,
it sorted 100,000 lines and exited 0. That is the test of a program that
assumes its heap is contiguous.

A program's first `mmap` calls are its dynamic loader's, mapping its
libraries, and a fault on those stops the program before it runs: `sort`
failed with `error while loading shared libraries: libc.so.6: failed to map
segment from shared object` with `mmap` failing after its 13th call. A program
with a small heap makes no `mmap` of its own, so `function malloc` is the
fault that reaches its allocations.

### The kernel's own allocations

`slab` and `pages` fail allocations inside the kernel, for work a system call
or a page fault does for the program, as [Kernel faults](#kernel-faults)
describes. The program sees what the kernel does with the failure: a system
call that returns `ENOMEM`, or a page fault that cannot be served. In one
test, failing the 51st slab allocation of `sort` killed it with `SIGSEGV`.

### A service out of memory

[`machine containers memory`](container-faults.md) limits a container's
memory. Past the limit the guest kernel reclaims memory, and its
out-of-memory killer kills a process of the container when it cannot:

```bash
machine containers app memory db 32m
machine exec app run --container db -- sh -c 'x=$(head -c 64000000 /dev/zero | tr "\0" a)'
```

```text
⚠ Exit status 137: killed by SIGKILL, as Docker reports a signal
```

`--soft` sets the limit past which the kernel reclaims and slows the
container's processes, and kills none of them, as memory pressure does. What
the kernel can reclaim decides what the program sees, and the machine has no
swap:

- **Files the program reads** are cached in memory the kernel can drop and
  read again. Past a soft limit the program keeps running, slower: reading a
  100MB file took 0.20 seconds of machine time against a soft limit of 16MB,
  0.02 seconds without, its cache fell from 103MB to 8MB, the cgroup counted
  202 times over the limit and killed nothing.
- **Memory the program allocates** has nowhere to go without swap, so past a
  soft limit its processes slow to a crawl. A shell holding 40MB against a
  soft limit of 16MB made no progress in 2 seconds of machine time, the cgroup
  counted 27,935 times over the limit and killed nothing, and the shell went
  on once the limit was lifted:

```bash
machine containers app memory db 16m --soft
machine containers app memory db 0 --soft       # the soft limit lifted
```

`machine containers app` shows each container's limits in its LIMITS column,
such as `memory 64MB soft 48MB`.

### Wrong data

[`machine mem`](debugging.md) writes a program's memory with the machine
stopped, `^=` flips bits of a value, as C's `^=` does, and `--fill` writes a
pattern over a span. Stop the program where the data is live first, at a
breakpoint or a `run --until`. The names below stand for the program's own
variables and function:

```bash
machine break app add 412 process_record
machine run app
machine mem app 412 'checksum^=0x1'                    # one bit of checksum flipped
machine mem app 412 'head=0'                           # a pointer set to NULL
machine mem app 412 '$sp+8=-1' g                       # a word of the stack overwritten
machine mem app 412 buf --fill 0xde --length 4096      # a buffer of garbage
```

The answer names the bits, the address and the value before and after. Here
`optind`, a variable of the C library a shell of a container maps, is named
by its file, as `machine symbols` lists it, since the shell has one too:

```bash
machine mem app 628 '/lib/libc.so.6:optind^=0x1'
machine mem app 628 '$sp-64' --fill AB --length 5
```

```text
✔ Flipped 0x1 at 0x7fe1a2385248 <optind> of tid 628: 0x00000001 became 0x00000000
✔ Filled 5 bytes at 0x7ffe41563260 of tid 628 with AB
```

Each write is recorded with the run, so a replay corrupts the same value at
the same point, and a fork from before it runs the program unharmed.

## Resource exhaustion

A program runs out of a resource in two ways, and Machine tests both:

- **The resource runs out.** A Linux limit on one container makes its
  processes meet the limit, as they would on a full production host. Use it
  to see how a service behaves as a whole when it hits the limit. Memory,
  processes and CPU are shared by the container's processes. The open-file
  limit is each process's own count.
- **One call fails.** A system call fault makes one program get the error
  the resource gives, at the call chosen, while everything else runs on.
  Use it to test one error path, exactly and repeatably.

| Resource | Run it out | Fail one call | The error |
|---|---|---|---|
| CPU | `containers throttle db --cpus 0.1` | | none: everything slows |
| Memory | `containers memory db 64m` | `inject add function malloc --return 0` | SIGKILL, or `malloc` returns NULL |
| Processes | `containers pids db 50` | `inject add syscall clone EAGAIN` | EAGAIN |
| Open files | `containers files api 64` | `inject add syscall openat EMFILE` | EMFILE |
| Ephemeral ports | `containers ports api 40000-40009` | `inject add syscall connect EADDRNOTAVAIL` | EADDRNOTAVAIL |
| Disk space, inodes | fill a volume of its own | `inject add syscall write ENOSPC` | ENOSPC |

A fault that fails one call also takes `--in`, the program it fails, as
[One failed call](#one-failed-call) shows. [Memory faults](#memory-faults)
covers memory. The rest of this section
covers the other resources.

| You want to know | Command | Example |
|---|---|---|
| Does a service survive when it cannot start a process? | `containers pids db 10` | [Processes](#processes) |
| Does a program cope when it runs out of file descriptors? | `containers files api 32` | [Open files](#open-files) |
| Does a client cope when it runs out of local ports, or churns through them? | `containers ports api 40000-40001` | [Ephemeral ports](#ephemeral-ports) |
| Does the system cope with one slow service? | `containers throttle db --cpus 0.1` | [CPU](#cpu) |
| Does a service that crashes on a limit recover once the limit is lifted? | `containers memory hog 64m`, then `memory hog 0` | [A service that crashes on its limit](#a-service-that-crashes-on-its-limit) |
| Does a service survive its disk filling up? | a volume of 64MB, filled with `dd` | [A full disk](#a-full-disk) |
| Does a program report a failed fork, a full disk or no inodes? | `inject add syscall clone EAGAIN`, `write ENOSPC`, `mkdir ENOSPC` | [One failed call](#one-failed-call) |

### Limits on a container

`machine containers` sets each limit on one container. The limit holds when
the container starts again, until it is lifted, so a service that crashes on
the limit and restarts meets it again. Every start has the limit before the
container's program runs its first instruction. A limit set on a stopped
container applies when it starts. A container that Compose recreates starts
without it. Use `--for 30s` to set the previous limit back after 30 seconds
of machine time, on whichever start of the container runs then. A disk built
before the guest kept container limits is refused, with a hint to build the
disk again.

A limit of 0 sets back the container's own: what its Compose file gives it,
such as `mem_limit` or `pids_limit`, or no limit. A container with
`mem_limit: 512m` and `memory api 128m` goes back to 512MB on `memory api 0`,
running or stopped.

After `pids db 10`, `machine containers app` shows the limit in the LIMITS
column:

```bash
machine containers app pids db 10
machine containers app
```

```text
SERVICE  CONTAINER       ID            STATE    IMAGE            ADDRESS     LINK         LIMITS
api      compose-api-1   0474e6006f79  running  clockprobe:test  172.18.0.3  veth3ede11a  -
db       compose-db-1    8ef3a4936249  running  clockprobe:test  172.18.0.4  veth31535d2  pids 10
nest     compose-nest-1  6830a8b2a2fc  running  clockprobe:test  172.18.0.2  vetha032499  -
```

The other limits, and lifting one:

```bash
machine containers app pids db 20                # 20 processes and threads
machine containers app files api 64              # 64 open files a process
machine containers app ports api 40000-40009     # 10 local ports for each destination
machine containers app pids db 20 --for 30s      # set back after 30 seconds of machine time
machine containers app pids db 0                 # the container's own limit
machine containers app files api 0               # the container's own limit
machine containers app ports api 0               # the container's own range
```

Each limit is set by a command the run records, so a replay sets it at the
same point. A branch replayed from boot through every example in this
section, the restarts included, showed no differences.

### A service that crashes on its limit

A service that dies of a limit and restarts by its Compose file's
`restart:` policy meets the limit again, and the run goes on. Here `hog`
grows to 100MB five seconds after it starts, under `restart: always`:

```yaml
services:
  hog:
    image: clockprobe:test
    restart: always
    command: ["sh", "-c", "sleep 5; x=$$(head -c 100000000 /dev/zero | tr '\\0' a); echo grew; sleep 100000"]
```

```bash
machine containers app memory hog 64m
machine containers app stop hog
machine containers app start hog
machine run app --within 40s
```

The out-of-memory killer took it 3 times in 40 seconds of machine time, and
the console said each time:

```text
=== hog exited by itself: code 137. Its restart policy starts it again ===
```

`memory hog 0` while it restarted let it grow, and it printed `grew`. A
service with no `restart:` policy that exits by itself ends the run, with
its code.

### Processes

`pids` limits the processes and threads of a container. Past the limit, a
`fork` or a new thread fails with EAGAIN, and the processes already running
go on. Here a shell in `db` starts background jobs under a limit of 10:

```bash
machine containers app pids db 10
machine exec app run --container db -- sh -c 'for i in $(seq 20); do sleep 30 & done'
```

```text
sh: can't fork: Resource temporarily unavailable
```

After `pids db 0`, running that command again starts all 20.

### Open files

`files` limits the files each process of a container may hold open.
Sockets and pipes count as files. Past the limit, an `open`, a `socket` or
an `accept` fails with EMFILE, and files already open stay open.

The limit is set on the processes running now, and the processes they start
take it. A process that `docker exec` starts, `machine exec --container`
included, takes the container's own limit. So set the limit while the
program runs. Here a shell in `api` was already running when the limit was
set:

```bash
machine exec app start --container api -- sh -c \
  'cd /tmp; for i in $(seq 100); do : > f$i; done; sleep 10; ulimit -n; timeout 2 tail -f f*'
machine containers app files api 32
machine run app --within 15s
```

The shell printed `32`. Then `tail` opened the files `f1` to `f100`, in
the order `f1`, `f10` to `f19`, `f100`, `f2`. It held 29 of them and its
standard input, output and error, 32 files, and every file after that failed:

```text
tail: can't open 'f35': Too many open files
```

A later `machine exec --container api -- sh -c 'ulimit -n'` printed 1024.
A process `docker exec` starts does not take the limit set on the processes
already running. It takes the container's own limit. `files api 0` sets
that own limit back, both its soft and its hard number.

### Ephemeral ports

`ports` narrows the range of local ports a container's connections take
from. A connection is told apart by its local and remote address and port,
so connections to different servers can share a local port. The range is
not a count of connections: it runs out for one destination at a time. Here
`db` runs a server on port 9000, and `api` connects to
db's address from the listing above, `172.18.0.4`, with 2 ports:

```bash
machine exec app start --container db -- tcpsvd 0 9000 cat
machine containers app ports api 40000-40001
machine exec app run --container api -- sh -c \
  'for i in 1 2 3; do (sleep 5 | telnet 172.18.0.4 9000 >/dev/null) & done; wait'
```

```text
telnet: can't connect to remote host (172.18.0.4): Cannot assign requested address
```

Two connections took both ports, and the third failed with EADDRNOTAVAIL.
Four things follow from how the kernel gives out ports:

- **A closed connection keeps its port for 60 seconds.** Its side stays in
  TIME_WAIT. Short connections in a loop therefore run out of a small range
  even though no more than one is open at a time. Right after the two
  connections closed, `netstat -tan` showed both ports in TIME_WAIT, and 65
  seconds later neither.
- **Name lookups need a port too.** A DNS query takes a UDP port from the
  same range. With both ports held, a client connecting to `db` by name
  failed with `telnet: bad address 'db'`, before it tried to connect.
- **A program that binds port 0 before it connects gets EADDRINUSE.**
  BusyBox `nc` does this: `nc: bind: Address already in use`.
- **A program that binds port 0 uses an even count of the range.** Of a
  range of 3 ports, `nc` used 2.

The range belongs to the container's network. The command refuses a
container on the machine's network, whose range is every process's. It also
refuses a container on another container's network, with a hint to set the
range on the container whose network it is:

```text
✗ Not set: sidecar is on the network of compose-db-1.
  Narrow the ports of compose-db-1 machine containers app ports compose-db-1 40000-40009
```

### A full disk

A container's own files are on the machine's disk, shared by every
container, so filling them fills the machine. A volume that is a filesystem
of its own fills alone: only the services that mount it meet the full disk.
A Compose file makes one in two ways:

| Volume | Full as a disk is | After a restart | Costs |
|---|---|---|---|
| A volume named in `x-machine`, with its size | yes: an ext4 filesystem on a block device, with a journal, metadata and `fsync` | its files are kept | room on the disk, up to its size |
| A tmpfs volume, `driver_opts` with `size=` | no: in memory, where `fsync` does nothing and no write is delayed | its files are gone | the machine's memory, up to its size |

Use the `x-machine` volume to see what a service does on a full disk. A
tmpfs volume answers whether it handles ENOSPC on a write, with no change to
how the disk is built. Here `db` has a volume of 64MB at `/data`:

```yaml
services:
  db:
    image: clockprobe:test
    volumes: [db-data:/data]
volumes:
  db-data: {}
x-machine:
  volumes:
    db-data: 64M
```

Filling it with one file runs it out of space, and many empty files run it
out of inodes:

```bash
machine exec app run --container db -- dd if=/dev/zero of=/data/fill bs=1M
machine exec app run --container db -- dd if=/dev/zero of=/data/more bs=4k count=10 conv=fsync
machine exec app run --container db -- rm /data/fill /data/more
machine exec app run --container db -- sh -c \
  'mkdir /data/many; cd /data/many; i=0; while : > f$i; do i=$((i+1)); done'
machine exec app run --container db -- rm -r /data/many
```

The fill stopped at 54.7MB of the filesystem's 57MB, and the write after it
stored one block of 10 and failed. The files stopped at the 16,373rd, with
blocks still free:

```text
sh: can't create f16372: No space left on device
```

Meanwhile `db` wrote its own files outside `/data`, `api` wrote its files,
and the machine's disk stayed 17% full. Deleting the files ends the full
disk. A tmpfs volume of 40MB, in the same test, stopped a `dd` at 40MB with
`No space left on device`, and was empty after `api` restarted.

Filling the machine's own disk instead makes every container meet it, and
the container runtime with them: `machine exec --container` then fails with
`OCI runtime exec failed`. `machine exec` without `--container` still runs.

### CPU

`throttle` gives a container a share of a CPU. Nothing fails: every process
of the container runs slower. A loop in `db` that counts to 200,000 took
4.58 seconds of machine time, and 46.80 seconds with `--cpus 0.1`:

```bash
machine containers app throttle db --cpus 0.1
machine exec app run --container db -- sh -c 'i=0; while [ $i -lt 200000 ]; do i=$((i+1)); done'
```

### One failed call

A [system call fault](#system-call-faults) gives one program the error a
resource gives, at the call chosen. Nothing runs out, and every other
program runs on. Each fault below was added, then the program after it was
run, then the fault was deleted with `machine inject app clear`. The
programs are BusyBox's, in the containers of the
[ports example](#ephemeral-ports), and `tail` reads the files of the
[open-files example](#open-files). `worker.sh` starts 3 background jobs and
waits for them, and `machine put` copies it into `db`:

```sh
#!/bin/sh
for i in 1 2 3; do sleep 1 & done
wait
echo all started
```

```bash
machine put app ./worker.sh /tmp/worker.sh --container db --mode 755

# A failed fork: the script's second
machine inject app add syscall clone EAGAIN --after 1 --times 1 --in comm=worker.sh
machine exec app run --container db -- /tmp/worker.sh
machine inject app clear

# Out of descriptors: the third file of 8
machine inject app add syscall openat EMFILE --after 14 --times 1 --in comm=tail
machine exec app run --container api -- sh -c 'cd /tmp; timeout 1 tail -f f1 f2 f3 f4 f5 f6 f7 f8'
machine inject app clear

# Out of local ports
machine inject app add syscall connect EADDRNOTAVAIL --times 1 --in comm=telnet
machine exec app run --container api -- sh -c 'sleep 2 | telnet 172.18.0.4 9000'
machine inject app clear

# A full disk: the 11th write
machine inject app add syscall write ENOSPC --after 10 --times 1 --in comm=dd
machine exec app run --container db -- dd if=/dev/zero of=/tmp/out bs=4k count=100
machine inject app clear

# Out of inodes
machine inject app add syscall mkdir ENOSPC --in comm=mkdir
machine exec app run --container db -- mkdir /tmp/new
machine inject app clear
```

Each program reported its error:

```text
/tmp/worker.sh: line 0: can't fork: Resource temporarily unavailable
tail: can't open 'f3': Too many open files
telnet: can't connect to remote host (172.18.0.4): Cannot assign requested address
dd: error writing '/tmp/out': No space left on device
mkdir: can't create directory '/tmp/new': No space left on device
```

`fork` in the C library is the `clone` system call. A script run by its own
path, `/tmp/worker.sh`, has its file name as its comm, so the fault takes
that script and no other shell. Running out of inodes gives ENOSPC from the
call that creates a file or a directory, as running out of space does.

A count of calls includes the program's start. The dynamic loader opens the
program's libraries with `openat` before `main` runs: 12 calls for `tail`
here, of 20 in all for 8 files. `--after 9` made the loader fail with
`error while loading shared libraries: libm.so.6`, and `--after 14` failed
the third file. Read MATCHED in `machine inject app` to
count a program's calls, or use `--prob 0.01` to fail calls at random.

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

Five things decide whether you see the failure:

- **Who sends a disk request.** `--in` names the task that sends the request,
  not the program the data belongs to. Your program sends its reads, its
  `O_DIRECT` writes and the writes `fsync` forces, so `--in /usr/bin/app` fails
  those. Ordinary writes wait in memory and the kernel's flusher writes them
  later, so only `--in all` reaches them. To fail a program's writes, name its
  files with `--file` and use `--in all`, as [Disk faults](#disk-faults) does.
- **A program's first moments.** When a program starts, the kernel copies its
  arguments in and allocates for it. A `usercopy` or allocation fault that fires
  then kills the program before your code runs. Use `--after`, or add the fault
  once the program is up.
- **The kernel copes with some failures.** A failed page allocation is often
  retried, and the program never sees it. `MATCHED` and `FIRED` in the list
  still show that the fault fired.
- **The kernel reads a page more than once.** A buffered read goes out as
  readahead, and when that fails the kernel reads the pages again before it
  gives up. How many requests it makes depends on how it splits the read: for
  a file of 8KB, `cat` read the file fine with `--times 1` and `--times 2`,
  and got `I/O error` with `--times 3`, all 3 of its requests failed. Leave
  out `--times` for the program to get `EIO`. An `O_DIRECT` read fails on its
  first request.
- **`disk-timeout` hangs.** The request is lost, and the task waiting for it
  stays stuck until the machine stops. This is a hung device: no timeout fires
  and no reset follows. That is the point: you find out what
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
| Does the database notice a bad block when it reads its data files? | `disk-corrupt --file '/var/lib/db/*/data.bin' --in all` |
| Does the program trust bytes it read without a checksum? | `disk-corrupt --op read --file /srv/app/state.json --in all` |
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
  read from the disk again: with `O_DIRECT`, after
  `echo 3 > /proc/sys/vm/drop_caches`, or in a branch forked later. A damaged
  read is the other way round: the bad bytes go into the page cache, and every
  reader sees them until the kernel drops the page.
- **A tear is whole sectors.** Machine tears a write at sector granularity:
  each 512-byte sector is written whole or not at all, so a write of one sector
  does not tear. A torn write keeps at least one sector of the new data and
  loses at least one. Real disks differ in what they write atomically; this is
  the model Machine applies.
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
  last flush, and the disk faults do not model one. For that, use
  [`machine containers crash`](container-faults.md#a-crash): it loses the
  writes a service's volumes had not synced.

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
same instruction. The machine's clock is not the date the guest reads, so a
`machine clock` change does not move a window. While a fault rests it matches
no call and counts none, so
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
  `gettimeofday`, `time` and `getcpu` return from the vDSO without a system call, so
  a fault on them matches nothing and MATCHED stays 0.
- **16 faults, and 30 errors in one.** Delete a fault to add another, and use
  `--pick` to take 30 or fewer of `all`.
- **A fault that fired is not a failure the program saw.** The kernel retries
  an allocation, rereads a page and recovers a filesystem, and a program
  retries a call. `FIRED` says the fault fired, and `MATCHED` 0 says it never
  met a call, so nothing was tested. Whether the program failed is a question
  for the program: check its output, its exit status or its data after the
  fault, as well as the counts.
- **A fault matches the system call, whose call it is and the count of calls.**
  It does not look at the arguments, so "openat of /etc/passwd" is not a fault.
  Stop at the call and fail that one instead.
