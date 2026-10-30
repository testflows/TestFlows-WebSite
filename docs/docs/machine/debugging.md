<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Debugging

There are two ways to debug a program in a machine. The machine's own
debugger works from outside the guest: `machine regs`, `mem`, `step`, `break`
and the rest read and change a task while the machine is stopped, and they
work on any program, including one with no debugger on its disk. GDB works
from inside: install it on the disk, attach it with `gdb -p`, and use it as on
any Linux host.

Both are recorded. A replay repeats every step, every write and every stop,
and a checkpoint taken before a session lets you run it again from the same
state.

## The machine's debugger

Each command takes the run and a task by its tid, which
[`machine tasks`](commands.md#machine-tasks) lists. A task's tgid is its
process. The commands work while the machine is stopped, between runs, on a
task that is on a vCPU or off one.

Symbols, types and source lines come from the program files on the machine's
disk: the program's symbol table, and its debug information when it has some.

### Debug information

What the debugger shows depends on what the program's files on the disk hold:

| On the disk | What you get |
|---|---|
| The symbol table alone | Function names in a backtrace, a stop at a function by its name, registers, memory, and a global at its symbol's address |
| Debug information too | Source lines, a stop at `FILE:LINE`, line steps, arguments in a backtrace, `print` and `locals` by name, and a watch of a variable by its name |

Frame 1 of the same stop, in `pg_parse_query`, of PostgreSQL as it ships and
with its debug package:

```text
1  0x56365898a1af  ??
1  0x556ccfc7d1af  exec_simple_query+159 (query_string=0x556cd01e6838 "SELECT count(*) FROM generate_series(1, 100000);")  postgres.c:1071
```

A program built with `-g` has its debug information in itself. A
distribution ships it apart, in a package such as `-dbg`, `-dbgsym` or
`debuginfo`, which puts a debug file under `/usr/lib/debug`. Install the
package of the program's exact build in the image the disk is built from:
the debugger takes a debug file only when its build id is the program's, and
finds it in any layer of a container's image.

A server is built optimized, as it ships. Its arguments and locals are where
the compiler kept them at each instruction: on the stack, in registers, or in
pieces of both, as clang keeps a C++ `std::string_view` in two registers. One
kept nowhere is `optimized out`, as GDB says it. A C++ function is named short,
as GDB names it, `DB::executeQuery`; `machine --signatures` names it by its
whole signature.

Without debug information, read the arguments from the registers the ABI
passes them in, and give a global a type with a cast:

```bash
machine mem app 412 '$rsi' s                                  # the second argument, a string
machine run app --until 'tgid=7:write=*(long *)&queries'      # a global of no type, as a long
```

The [debug examples](https://github.com/testflows/Machine-Examples/tree/main/debug)
build ClickHouse and PostgreSQL both ways, and show a session of each.

### Locations

Every command that takes a location takes one of these. A location names an
address in the task's process:

| Location | What it names |
|---|---|
| `0x401136` | an address |
| `*0x401136` | an address, as GDB writes it |
| `main` | a function or a variable, by its name |
| `libc.so.6:malloc` | a name in one file of the process, by its path or its file name |
| `init.c:106` | a source line, at its first code |
| `$rsp` | a register of the task, as it is now |
| `main+4`, `$rsp-8` | any of these, moved by `+N` or `-N` |

A breakpoint at a function by its name is placed past its prologue, as GDB's
`break FUNCTION` is.

### Registers and memory

```bash
machine regs app 412                   # the general registers of tid 412
machine regs app 412 rip rsp           # two of them
machine regs app 412 --all             # with x87, SSE and AVX
machine regs app 412 rax=0 rip=main+4  # write two of them
```

[`machine mem`](commands.md#machine-mem) shows memory as GDB's `x` does, with
a count, a letter and a unit after the location, such as `8xg`, `4i` or `s`:

```bash
machine mem app 412 '$sp'                   # eight giant words at the stack
machine mem app 412 '$pc' 4i                # the next four instructions
machine mem app 412 main 16xb               # sixteen bytes of main
machine mem app 412 counter=42              # write counter, at its size
machine mem app 412 --mapped                # the pages the tgid maps, as info proc mappings
machine mem app 412 buf --find GET --length 4096
machine mem app 412 buf --dump buf.bin --length 4096
machine mem app 412 buf --restore buf.bin
```

A write is part of the run, and a replay makes it again. A page the tgid has
not written yet is shared, and is refused for a write.

### The stack, symbols and variables

```bash
machine backtrace app 412              # the stack, the innermost frame first
machine backtrace app 412 --frame 1    # one frame, as info frame
machine symbols app 412 main           # where main is
machine symbols app 412 0x401ac6       # what is at an address
machine symbols app 412 --regex ^wait  # the functions that match
machine libs app 412                   # the program and the libraries its tgid maps
machine print app 412 'shape->at.x'    # a member through a pointer
machine print app 412 index --frame 1  # in the caller's frame
machine print app 412 counter x        # in hexadecimal, as print/x
machine print app 412 'counter = 3'    # write it
machine locals app 412 --args          # the arguments of the innermost frame
```

`print` takes a variable of the frame, a global or a `$register`, with `.m`,
`->m`, `[i]`, `*`, `&` and casts, and prints it by its type. `print` and
`locals` need the program's debug information.

### Stepping

[`machine step`](commands.md#machine-step) steps one task. The machine runs
whichever task the guest schedules, so other tasks run meanwhile:

```bash
machine step app 412                   # one instruction, as stepi
machine step app 412 5 --over          # five, a call being one, as nexti
machine step app 412 --line            # a source line, as step
machine step app 412 --line --over     # a line over calls, as next
machine step app 412 --out             # until the function returns, as finish
machine step app 412 --line --skip memcpy   # step out of memcpy, as GDB's skip
```

### Breakpoints, watchpoints and catchpoints

A breakpoint stops the run when a task of its tgid reaches its location. A
watchpoint stops it after an instruction writes the bytes it watches. A
catchpoint stops it at an event of a task: an exec, an exit, a fork, a system
call, a signal, a file mapped or a C++ exception.

```bash
machine break app add 412 main                    # stop tgid of 412 at main
machine break app add 412 init.c:104 --temporary  # deleted at its first hit, as tbreak
machine break app add 412 main --condition '$rdi != 0'
machine break app add 412 --regex '^parse_'       # at each function that matches, as rbreak
machine break app add 412 puts --print 'puts {$rdi:s}'   # print and go on, as dprintf
machine watch app add 412 counter                 # after a write of counter
machine watch app add 412 counter --on access     # after a read or a write
machine catch app add fork --in tgid=1            # where tgid 1 forks
machine catch app add syscall openat write        # either system call, by any task
machine catch app add signal SIGSEGV --in tid=57  # a signal of tid 57
machine catch app add throw --in tgid=57          # a C++ throw
machine catch app add exit --in comm=cat          # a cat ends
machine catch app add fault openat disk           # an injected fault fires
machine catch app add io --file /var/lib/db/wal --op write   # a disk request of a file
```

`watch add` takes `--on write`, `change`, `read` or `access`, and `--size` for
a location that is not a variable. An `exit` catchpoint takes `--in tgid=N`,
since an exit is the end of a process. A `throw`, `catch` or `rethrow`
catchpoint needs `--in tgid=N`.

`--in comm=NAME` stops at the events of the tasks with that name, the same
tasks [`machine tasks app exist comm=NAME`](fault-injection.md#which-calls-fail)
lists. That catches one tool of a busybox, or a script, before you know its
ids. An `exec` catchpoint sees the new program's name. An `exit` catchpoint
sees the name of the process's main thread, which ends last, so a worker
thread named `cat` inside a differently named process does not stop it. A
`syscall` catchpoint with a name makes the machine report every task's calls
while it is set, which costs time on a busy machine.

Each stop has a number, and the same verbs change any kind:

```bash
machine points app                   # every breakpoint, watchpoint and catchpoint
machine break app condition 2 'n > 3'  # a hit where it does not hold goes on
machine break app ignore 2 5         # pass the next 5 hits
machine break app disable 2          # kept, not armed
machine break app enable 2 --once    # armed for one hit
machine break app delete 2
machine break app clear 412 main     # every breakpoint at main, as GDB's clear
machine break app hits               # the hits the run log keeps
machine break app save stops.sh      # the commands that add each again
```

`machine break`, `watch` and `catch` each list their own kind.

A run that reaches a stop ends there and says which. The run log keeps the
stops: a branch has the ones its parent had where it was forked, and a replay
applies the adds and deletes. The stops are armed while the run records, and
not while it replays.

### Running to a place

```bash
machine run app --iters 0                      # until the next hit, as continue
machine run app --until 'tid=412:at=init.c:106'   # until tid 412 reaches a line, as until and advance
machine run app --until 'tgid=7:at=0x401136'   # until any thread of tgid 7 reaches an address
machine run app --until 'tid=412:write=counter'   # until tid 412 writes counter, as watch
machine run app --until 'tgid=7:access=buf[0]'    # until any thread of tgid 7 reads or writes buf[0], as awatch
```

`tid=N:at=LOC` and `tgid=N:at=LOC` take any location. `write=LOC` and
`access=LOC` take a variable or an expression, watched at its size of 1, 2, 4
or 8 bytes. A write the kernel makes into the program counts, as `read` makes
into its buffer. The address is resolved when the run starts, and the stop
lasts for that run alone.

The run says the tid it stopped in and where that task stands. A watch also
says the value the access left in the bytes:

```
✔ Written counter at main+116, watched.c:63, in tid 191
Value = 4
```

### Going back

Going back puts you on a new branch, at an earlier point of the run, and
leaves the run as it was:

```bash
machine run app --back                 # onto a branch at the newest hit, as reverse-continue
machine step app 412 --back 3          # three executions back, as reverse-stepi
machine step app 412 --back --line     # back a line, as reverse-step
machine step app 412 --back --out      # back to the call, as reverse-finish
```

The branch keeps the run's stops as they are now.

### Calling, returning and signals

```bash
machine call app 412 square 3          # call a function in the task, as call
machine return app 412 0               # leave the innermost function, returning 0
machine tasks app signal 412 SIGTERM   # the guest sends it, the run log keeps it
```

`call` puts the task's registers back after the call. Each of these is part of
the run, and a replay makes it again.

### At the control prompt

Every command here has a slash command at the
[control prompt](running-a-machine.md#interactive-mode), with the run left
out: `/regs 412`, `/mem 412 '$pc' 4i`, `/step 412 --line`, `/break add 412
main`, `/run until 'tid=412:at=main'`. The prompt also has `/display`, an
expression printed after each run and step, and `/skip`, what a line step of
the session steps out of:

```
/display 412 counter          # printed after every /step and /run
/skip function memcpy         # /step --line steps out of memcpy
/step 412 --line
/undisplay 1
```

`/help` lists them all.

### From Python

The [Python SDK](python-sdk.md) has the same debugger: `run.task(tid)` gives a
task with `registers()`, `read()`, `backtrace()`, `print()`, `step()`,
`breakpoint()` and `watch()`, and `run.breakpoints` lists and changes the
stops.

## Hardware breakpoints

A run has 3 debug registers for its stops. These take one each:

- a breakpoint or a watchpoint of `machine break add` or `machine watch add`
- the stop of `run --until tid=N:at=LOC`, `write=LOC` or `access=LOC`, for that run
- a `throw`, `catch` or `rethrow` catchpoint
- a hardware breakpoint or watchpoint of GDB inside the machine, `hbreak` or
  `watch`

Other catchpoints take none, and a run holds 8 of them. GDB's `break` writes an
`int3` into the program, as on any host, and takes none.

When the 3 are taken, the next is refused. A `machine break add` refused while
GDB holds some says how many:

```text
No room: a run holds 3 breakpoints and watchpoints. The debugger in the guest holds 1.
```

A GDB `hbreak` or `watch` refused for the same reason makes GDB say
`Couldn't write debug register: No space left on device` at the `continue`
that inserts it. An x86 computer has 4, so a GDB session that uses all 4 there
gets 3 in the machine.

## GDB inside the machine

GDB runs in the machine as it does on any Linux host: breakpoints, `stepi`,
`next`, `finish`, `hbreak`, `watch` and `detach`.

### Getting GDB onto the disk

Put GDB in the image the disk is built from. For a server in a container, put
it in the server's image, so GDB sees the server's files:

```dockerfile
FROM clickhouse/clickhouse-server:26.8.31.2
RUN apt-get update && apt-get install -y --no-install-recommends gdb procps
```

GDB reads the program's symbol table for function names. For arguments,
locals and source lines it needs the program's debug information too, in a
format it reads. ClickHouse's debug information is DWARF 5, which GDB 12 and
later read. An older image's GDB may not: GDB 9.2, Ubuntu 20.04's, does not.

GDB holds what it reads in memory, and the machine needs room for it beside the
program. ClickHouse's 1.7GB of debug information grows to about 3.8GB in GDB,
so that machine needs `--mem 12288`; with 4GB the guest's out-of-memory killer
ends GDB.

The [ClickHouse example](https://github.com/testflows/Machine-Examples/tree/main/debug/clickhouse)
builds both kinds of image for ClickHouse 26.8: one with the symbol table
alone, and one with the debug information. Its server prints the commit it was
built from as it comes up, with a link to that source on GitHub, and the
example shows how to put a source file where GDB finds it.

### A batch of commands

Build the example's disk from its `server` image, and create a run on it.
The [example's README](https://github.com/testflows/Machine-Examples/tree/main/debug/clickhouse)
builds the image:

```bash
machine disks build --image clickhouse-server:26.8.31.2 clickhouse-server
machine create ch --disk clickhouse-server --mem 4096 --cpus 2
```

Run the machine to the point you want to debug, and keep a checkpoint there.
Then run GDB with [`machine exec`](commands.md#machine-exec). Here the
example's server prints `clickhouse: ready` once it answers queries:

```bash
machine run ch --until 'console~clickhouse: ready'
machine checkpoint ch ready
machine exec ch run --container app --user clickhouse \
    -c 'gdb -batch -ex "handle SIGUSR1 SIGUSR2 nostop noprint" -ex "break DB::executeQuery" -ex continue -ex "bt 3" -p $(pidof clickhouse-server)'
```

```text
[New LWP 78]
...
Breakpoint 1 at 0x1d386340 (3 locations)
[Switching to Thread 0x7f844cbde640 (LWP 89)]

Thread 9 "TCPHandler" hit Breakpoint 1, 0x000000001d386340 in DB::executeQuery(std::__1::basic_string_view<char, std::__1::char_traits<char> >, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum) ()
#0  0x000000001d386340 in DB::executeQuery(std::__1::basic_string_view<char, std::__1::char_traits<char> >, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum) ()
#1  0x000000001ed12ec3 in DB::TCPHandler::runImpl() ()
#2  0x000000001ed37d64 in DB::TCPHandler::run() ()
[Inferior 1 (process 7) detached]
```

`exec run` runs the machine until GDB exits, and prints what GDB printed.
`-batch` makes GDB exit after its commands, and an attached process is
detached as GDB exits. A file of commands works the same way, with `-x FILE`.
`-c` gives the line to the container's shell, which finds the process id.

ClickHouse signals its own threads with `SIGUSR1` and `SIGUSR2`. Without the
`handle` line, `continue` stops at the first of those signals instead of at
the breakpoint, and `bt` shows whichever thread got it.

At the control prompt the line after `-c` needs no outer quotes:

```
/run until 'console~clickhouse: ready'
/checkpoint ready
/exec run --container app --user clickhouse -c gdb -batch -ex "handle SIGUSR1 SIGUSR2 nostop noprint" -ex "break DB::executeQuery" -ex continue -ex "bt 3" -p $(pidof clickhouse-server)
```

Use `--user` to run GDB as the user of the process it attaches to. A
container has no `CAP_SYS_PTRACE` by default, so root in it cannot attach to
another user's process.

### Keeping GDB attached

`-batch` runs a list of commands chosen in advance. To decide the next
command from what GDB just printed, keep GDB attached and give it its
commands through a named pipe in the container.

This works on the server's own image with GDB added, the example's `gdb`
image: ClickHouse 26.8 with no debug information. GDB finds functions by
name in the program's symbol table, and attaches in about 16 seconds. With
the debug information of the `debug` image it takes minutes instead.

Make the pipe, keep it open, and start GDB with its input on it.
`exec start` returns at once and prints the id of the process it started:

```bash
machine exec ch run   --container app --user clickhouse -- mkfifo /tmp/gdb.in
machine exec ch start --container app --user clickhouse -c 'sleep infinity > /tmp/gdb.in'
machine exec ch start --container app --user clickhouse -c 'gdb -q -p $(pidof clickhouse-server) < /tmp/gdb.in'
```

```text
✔ Sent 3615877d to ch (whvR8O5Y1otCgBTbNi3rc)
  Read the process machine exec ch proc 3615877d
```

The `sleep` holds the pipe open. Without it, GDB reads the end of its input
after the first command and exits.

Every step below is the same three commands. `exec start` queues a `printf`
that writes the step's GDB commands to the pipe, the last of them an `echo`
of a marker. `run --until` runs the machine until GDB prints that marker,
which is when GDB has done every command before it. `proc` reads what GDB
printed, by the id `exec start` gave:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "handle SIGUSR1 SIGUSR2 nostop noprint" "echo step-1\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-1' --within 60s
machine exec ch proc 3615877d stdout
```

```text
Attaching to process 7
[New LWP 78]
...
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
0x00007f84884760d7 in ?? () from /lib/x86_64-linux-gnu/libc.so.6
(gdb) Signal        Stop	Print	Pass to program	Description
SIGUSR1       No	No	Yes		User defined signal 1
SIGUSR2       No	No	Yes		User defined signal 2
(gdb) step-1
(gdb)
```

The `handle` line keeps `continue` from stopping at ClickHouse's own signals,
as in the batch session. This first step waits for GDB to read the program's
symbols, 10 seconds here. The others take a second or two.

A few things keep the steps right:

- Each step has a marker of its own. `run --until` ends on text the run
  prints from its start, so `step-1` printed before never ends a later run.
- Use `exec start`, not `exec run`, to write to the pipe. `exec run` runs the
  machine until the `printf` exits, and GDB may print the marker during it.
  The `run --until` after it then waits for a marker that is already there.
- `printf "%s\n"` writes each argument as a line and leaves `\n` in it as it
  is, so GDB's `echo` ends the marker's line. A `$` in a GDB command is
  written `\$` inside the double quotes, as `"x/s \$rsi"` below.
- `--within 60s` bounds a step whose marker never comes. Without it a
  mistyped marker runs the machine until it is cancelled.

Each read shows the whole session so far. The output below is what each step
added.

**A breakpoint.** GDB writes an `int3` into the program, as on any host, and
uses no debug register:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "break DB::executeQuery" "info breakpoints" "echo step-2\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-2' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) Breakpoint 1 at 0x1d386340 (3 locations)
(gdb) Num     Type           Disp Enb Address            What
1       breakpoint     keep y   <MULTIPLE>
1.1                         y   0x000000001d386340 <DB::executeQuery(std::__1::basic_string_view<char, ...>, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum)>
1.2                         y   0x000000001d394300 <DB::executeQuery(DB::ReadBuffer&, DB::WriteBuffer&, ...)>
1.3                         y   0x000000001d394640 <DB::executeQuery(std::__1::unique_ptr<DB::ReadBuffer, ...>, DB::WriteBuffer&, ...)>
(gdb) step-2
```

**Continue to it.** The example's server sends itself a query every second,
and a thread that handles it stops. GDB reads the marker after `c` stops, so
the marker follows the hit:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" c "echo step-3\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-3' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) Continuing.
[Switching to Thread 0x7f844cbde640 (LWP 89)]

Thread 9 "TCPHandler" hit Breakpoint 1, 0x000000001d386340 in DB::executeQuery(std::__1::basic_string_view<char, std::__1::char_traits<char> >, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum) ()
(gdb) step-3
```

Every later `continue` works the same way. Each hit prints a new
`hit Breakpoint` line, so `--until '/output/exec/3615877d/stdout~hit Breakpoint'`
stops at the next hit too.

**Read the query.** `executeQuery` returns its result by value, so `rdi`
holds where to put it, and the query follows in `rsi` and `rdx`, a pointer
and a length:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "info registers rsi rdx" "x/s \$rsi" "echo step-4\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-4' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) rsi            0x7f8482a32cc0      140207104142528
rdx            0x28                40
(gdb) 0x7f8482a32cc0:	"SELECT sum(number) FROM numbers(1000000)"
(gdb) step-4
```

**Instructions and single steps:**

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "x/4i \$pc" stepi "nexti 3" "echo step-5\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-5' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) => 0x1d386340 <_ZN2DB12executeQuery...>:	jmp    0x1d38634b <_ZN2DB12executeQuery...+11>
   0x1d386342 <_ZN2DB12executeQuery...+2>:	nopw   0x200(%rax,%rax,1)
   0x1d38634b <_ZN2DB12executeQuery...+11>:	push   %rbp
   0x1d38634c <_ZN2DB12executeQuery...+12>:	push   %r15
(gdb) 0x000000001d38634b in DB::executeQuery(...) ()
(gdb) 0x000000001d386350 in DB::executeQuery(...) ()
(gdb) step-5
```

**The stack, and running to the return:**

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "bt 3" finish "echo step-6\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-6' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) #0  0x000000001d386350 in DB::executeQuery(...) ()
#1  0x000000001ed12ec3 in DB::TCPHandler::runImpl() ()
#2  0x000000001ed37d64 in DB::TCPHandler::run() ()
(More stack frames follow...)
(gdb) Run till exit from #0  0x000000001d386350 in DB::executeQuery(...) ()
0x000000001ed12ec3 in DB::TCPHandler::runImpl() ()
(gdb) step-6
```

**A hardware breakpoint.** Delete the first breakpoint, and put one at the
address `finish` returned to. It takes one of the run's 3 debug registers,
and stops where the next query returns:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "delete 1" "hbreak *0x1ed12ec3" c "echo step-7\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-7' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) (gdb) Hardware assisted breakpoint 2 at 0x1ed12ec3
(gdb) Continuing.

Thread 9 "TCPHandler" hit Breakpoint 2, 0x000000001ed12ec3 in DB::TCPHandler::runImpl() ()
(gdb) step-7
```

`delete` prints nothing, so its prompt stands alone at the start.

**A hardware watchpoint.** It takes another debug register, and stops after
the next call writes its return address below the stack pointer:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" "watch -l *(long *)(\$rsp - 8)" c "echo step-8\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-8' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) Hardware watchpoint 3: -location *(long *)($rsp - 8)
(gdb) Continuing.

Thread 9 "TCPHandler" hit Hardware watchpoint 3: -location *(long *)($rsp - 8)

Old value = 517025475
New value = 517025550
0x000000001b389000 in DB::BlockIO::operator=(DB::BlockIO&&) ()
(gdb) step-8
```

**A system call.** Delete every breakpoint and watchpoint, stop at the next
`sendto`, and read its socket, its length and the first bytes it sends.
GDB asks before it deletes them all, and answers itself, since its input is
not a terminal:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" delete "catch syscall sendto" c "info registers rdi rdx" "x/16xb \$rsi" "echo step-9\n" > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/stdout~step-9' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) Delete all breakpoints? (y or n) [answered Y; input not from terminal]
(gdb) Catchpoint 4 (syscall 'sendto' [44])
(gdb) Continuing.

Thread 9 "TCPHandler" hit Catchpoint 4 (call to syscall sendto), 0x00007f848850c98e in send () from /lib/x86_64-linux-gnu/libc.so.6
(gdb) rdi            0x3a                58
rdx            0x22                34
(gdb) 0x7f8400e3c280:	0x01	0x00	0x01	0x00	0x02	0xff	0xff	0xff
0x7f8400e3c288:	0xff	0x03	0x00	0x00	0x01	0x00	0x0b	0x73
(gdb) step-9
```

That is the query's result going back to the client, 34 bytes on socket 58.

**Leave.** Delete the catchpoint, detach and quit. GDB prints no marker after
`quit`, so the run waits for the process's status file to say it exited:

```bash
machine exec ch start --container app --user clickhouse -c 'printf "%s\n" delete detach quit > /tmp/gdb.in'
machine run ch --until '/output/exec/3615877d/status~^exited' --within 60s
machine exec ch proc 3615877d stdout
```

```text
(gdb) Delete all breakpoints? (y or n) [answered Y; input not from terminal]
(gdb) Detaching from program: /usr/bin/clickhouse, process 7
[Inferior 1 (process 7) detached]
(gdb)
```

GDB has exited, and the server carries on.

The session is recorded with the run. Rewind to the checkpoint taken before
it, and the same commands give the same answers.

### From the checkpoint

The checkpoint holds the machine as it was before GDB attached. Rewind to it,
and the next session starts from the same instruction:

```bash
machine rewind ch to ^ready
```

Or fork a branch at it and keep both:

```bash
machine fork ch --at ^ready --name again
```
