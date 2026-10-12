<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Running a machine

## Creating a run

[`machine create`](commands.md#machine-create) makes a run from a disk and boots it. The run's name goes
first and is optional. Without one, Machine makes up a name.

```bash
machine create app --disk app --cpus 2 --mem 512
```

The defaults are 1 CPU and 256 MB of memory. A few other options are worth
knowing about:

| Option | What it does |
|---|---|
| `--no-daemon` | boot and run to the end by itself, instead of waiting for your commands |
| `--pin-cpu n` | run on host CPU `n`, for this start only (the default picks the least-loaded) |
| `--like run` | start from another run's options, then apply the ones you give |
| `--label name=value` | attach a label to the run, as many times as you like |
| `--rng`, `--rng-seed n` | give the machine random numbers, seeded with `n` (the default is 0) |
| `--fs-sync` | write to the disk as the program writes, instead of later |
| `--no-wait` | return as soon as the request is accepted |

Change the seed and the program sees different random numbers. Keep it and it
sees the same ones every time. This one is only about the random numbers the
machine asks for. For exploring thread schedules there is another seed, on
[`machine run`](commands.md#machine-run), covered next.

## Driving it

A run executes only while you drive it. [`machine run`](commands.md#machine-run) is the way, and `--until`
says when to stop. (A run created with `--no-daemon` answers
`✗ Machine not in control mode`, because the machine isn't waiting for you.)

```bash
machine run app --until tasks
```

A plain [`machine run`](commands.md#machine-run) can stop before the point you are waiting
for. With `--until`, Machine keeps going until what you asked for is true. If it never gets
there, the command exits with status 3.

These are the conditions you can wait for. [`machine run`](commands.md#machine-run) `--until` and
[`machine wait`](commands.md#machine-wait) `--for` take the same ones.

| Condition | True when |
|---|---|
| `running`, `paused`, `stopped`, `halted` | the machine is in that state |
| `ready` | the machine accepts commands |
| `tasks` | Linux is up and its task table can be read, which is before it starts anything in userland |
| `console~REGEX` | the console output matches the pattern |
| `ttyS1~REGEX` | the output of another source matches it, here the serial port `ttyS1` |
| `entry>=N` | the log has reached entry N |
| `entry=+N` | N more entries have been recorded |
| `vtime>=T` | the machine's clock has reached T, a duration such as `500ms` |
| `vtime=+T` | the machine's clock has moved T from where it was |
| `/app:exit` | the program at `/app` has exited |

The last row is one example of a task condition. There are more of them
under [Steering programs](steering-programs.md).

`--iters` limits how many iterations a drive may spend, and the global
`--timeout` limits how long you are willing to wait. Whichever hits first wins.

An iteration has no fixed length. It is one dispatch of a vCPU, and it ends
where the guest next exits to the machine: after five instructions or after a
million. So no count is right in advance, and nobody can know how long a
program will run. Stop on a condition, and use `--iters` or a `vtime`
condition as a limit. Every run ends by saying how far it went:

```
iterations: 2000  run ic: 238893097  vtime: +0.383620410s
```

`vtime` is how far the machine's clock moved. A `vtime` condition is checked
between iterations, so the run stops at the end of the iteration that reaches
the time, a little late. A run that went too far is not lost:
[`machine rewind`](commands.md#machine-rewind) and [`machine go`](commands.md#machine-go) take it back to an earlier
point.

Now and then the host interrupts an entry while it is being recorded. Machine
records that entry again, and you see nothing except a short pause. `--retry`
sets how many more times one entry is tried, 2 by default. If they are all
interrupted the run stops with `Host interrupted the run at entry N. It is not
recorded.` and the [`machine rewind`](commands.md#machine-rewind) command that puts the run back at the
entry before.

## Trying different schedules

A program that uses threads can behave differently depending on how they
interleave. Machine can draw how long each stretch of execution lasts, so every
run explores a different interleaving, and `--seed` makes those draws
repeatable.

```bash
machine run app --until /usr/bin/app:exit --mode step,fast --step 1:200 --seed 1
```

`--mode` is how the machine runs: `fast`, `step`, `step-into` or `free`, or a
comma list to draw from. `--step` and `--fast` give the length of a stretch in
each mode, as a number or a range like `1:200`. `--strategy` sets how the
draws are made, `random` (the default), `golden` or `sweep`, and `--seed` is the
seed for the random and golden ones.

Combine that with branches. Fork several from one checkpoint, give each its
own seed, and keep the ones that crash. The `explore_seeds.py` example in the
[SDK](python-sdk.md) does exactly that.

A run takes checkpoints for you too. `--auto-checkpoints N` takes one every N
entries, and 0 turns them off.

If a drive or a checkpoint is taking too long, [`machine cancel app`](commands.md#machine-cancel) cancels
whichever one is in progress.

### Bounding a run by the machine's clock

`--within` ends a run when the machine's clock has moved that far:

```bash
machine run app --within 10s                           # run for 10 s of machine time
machine run app --until 'console~done' --within 30s    # the first of the two
```

Alone, it is the same run as `--until vtime=+10s`. With another `--until` it is
a bound on it: if the clock gets there first, the run ends with exit status 3
and says `Machine time ran out`. The machine checks the bound itself, so a slow
host does not end the run sooner, which the global `--timeout` in seconds would.

The clock moves as the programs in the machine work and while the machine is
idle. A loop that does nothing but spin does not move it.

## Waiting

[`machine wait`](commands.md#machine-wait) doesn't drive anything. It watches a run, or several, and
returns when a condition holds.

```bash
machine wait --for stopped app
machine wait --for 'console~ready' app
```
```bash
✔ Reached stopped: app (whUxfLYSFJMDHzKaiBOvH) 2.1s
```

It exits with 0 when the condition is true, 2 on an error and 3 on a timeout,
so scripts can tell them apart. Remember that it only watches. Waiting for a
condition on a run nobody is driving never finishes unless you set `--timeout`.
With `--timeout 0` it checks once, and the message tells you why it failed: `The
machine was waiting for commands.`

## Looking at it

| Command | Shows |
|---|---|
| [`machine runs`](commands.md#machine-runs) | your runs, newest first (`-w` keeps the list live) |
| [`machine describe app`](commands.md#machine-describe) | the full configuration of a run |
| [`machine state app`](commands.md#machine-state) | its state and where it stands; a run with no machine reads `stopped` |
| [`machine now app`](commands.md#machine-now) | the last entry it recorded, and the time on the machine's clock |
| [`machine output app`](commands.md#machine-output) | what the machine printed (`-f` follows, `-n -20` shows the last 20 lines, `--source` reads another source than the console) |
| [`machine entries app`](commands.md#machine-entries) | the entries in its log |
| [`machine ops`](commands.md#machine-ops) | operations on runs (checkpoints, branches, switches, deletes) and how each ended, newest first; one you interrupted with Ctrl-C is still listed |
| [`machine debug log app`](commands.md#machine-debug-log) | the debug output of a run ([`machine debug err`](commands.md#machine-debug-err) shows its error and crash log) |
| [`machine dump app`](commands.md#machine-dump) | the machine's registers, code and other state (`--show` picks the sections, `--entry` reads an earlier one) |

[`machine output`](commands.md#machine-output) also takes `--entries`, if you only want what a few
entries printed.

### Finding where something was printed

Often you want the opposite: you know what the machine printed, and you want the
entry that printed it, so you can go there. A line is printed over a range of
entries, but a byte is printed by exactly one, and Machine can tell you which.

[`machine output app search`](commands.md#machine-output-search) finds a pattern and gives the entry of
each match:

```bash
machine output app search 'Linux version'
```
```
    ENTRY  SOURCE       LINE  TEXT
     1276  ttyS0          16  Linux version 6.11.11-testflows-os-v1.0 (user@host) (gcc ...
```

A match has to cover at least one character, because it is the entry that
printed it that you get back. A pattern that can match nothing at all, such as
`6*`, is refused, in a search and in a `console~REGEX` condition or point alike;
`6+` is the one to write.

The search runs where the console is kept, so a large console is not downloaded.
`-f` keeps going with what the machine prints next, and `--max 1` stops at the
first match. The entry is a point, so you can go straight to it:

```bash
machine go app '#1276'
```

`console~REGEX` is the same thing written as a point, where the console first
printed a match. [`machine go`](commands.md#machine-go), [`machine fork`](commands.md#machine-fork) `--at` and
[`machine rewind`](commands.md#machine-rewind) all take it:

```bash
machine go app 'console~Linux version'
```

If you would rather search with your own tools, pipe the console to them.
`grep -b` prints the byte offset of a match, and
[`machine output app entry`](commands.md#machine-output-entry) turns an offset into its entry:

```bash
machine output app -n : | grep -bo 'Linux version'    # 438:Linux version
machine output app entry 438                          # 1276
```

`--wide` shows, beside every line, the range of entries that printed it and the
source it came from:

```bash
machine output app -n -5 --wide
```

### Reading the output of one source

The console is not the only place a machine prints. It has four serial ports,
`ttyS0` to `ttyS3`, and the console is the first. A program in the guest that
writes to `/dev/ttyS1` prints on `ttyS1`, apart from the boot log and from
everything else on the console:

```bash
# inside the guest
my-app > /dev/ttyS1 2> /dev/ttyS2
```

Everything a run prints is kept in one log, in the order it was printed, and
each part of it has a source. [`machine output app sources`](commands.md#machine-output-sources)
lists the sources that printed:

```bash
machine output app sources
```
```
SOURCE      BYTES      LINES  ENTRIES
ttyS0       10767        198  29:21127
ttyS1         116         10  16916:16949
ttyS2          99         10  16917:16948
```

`--source` reads one of them. Without it you get the console, as before:

```bash
machine output app --source ttyS1
machine output app search ready --source ttyS1
machine output app entry 0 --source ttyS1
```

`--source all` reads every source together, in the order printed, with the
source in front of each line:

```bash
machine output app --source all -n -4
```
```
ttyS0     starting the app
ttyS1     listening on 8080
ttyS2     warning: no config file
ttyS1     ready
```

A line belongs to one source. If one source prints while another has a line
unfinished, that line ends there, so what you read is always what one source
printed, in order.

The name of a source also takes the place of `console` in a condition and in a
point. A run that waits for text on `ttyS1` stops at the entry that printed it,
and what the other sources print in the meantime does not interrupt it:

```bash
machine run app --until 'ttyS1~ready'
machine go app 'ttyS1~ready'
```

| Source | What it is |
|---|---|
| `console` | the console of the run, which is the default |
| `ttyS0` to `ttyS3` | the four serial ports; `ttyS0` is the console |
| `hvc0` | the virtio console |
| `debugcon` | the firmware's debug port |
| a path under `/output` | an output file, or every file under a directory |
| `all` | every source, in the order printed |

### Output files

A service on a disk has no serial port to write to, and three ports are not
many. Every service is given a directory instead, and each file it writes
there is a source of its own. The directory is named by a variable:

```bash
# inside the service
my-app --events "$MACHINE_OUTPUT_DIR/events.jsonl"
```

The file is stored with the run as it is written, each write with its entry.
Its name as a source is its path: `/output/keep`, the name of the service,
and the path the service wrote. A disk built from a binary or one image has
one service, `app`.

```bash
machine output app sources
```
```
SOURCE                            BYTES      LINES  ENTRIES
ttyS0                             10767        198  29:21127
/output/keep/app/events.jsonl      2210         31  16916:20410
```

Everything that takes a source takes the path, and the path of a directory is
every file under it:

```bash
machine output app --source /output/keep/app/events.jsonl
machine output app search '"setup_complete"' --source /output/keep/app
machine run app --until '/output/keep/app/events.jsonl~setup_complete'
```

A file does not have to be text. [`machine output app bytes`](commands.md#machine-output-bytes)
writes what a source printed exactly as it was written:

```bash
machine output app bytes --source /output/keep/app/core.bin > core.bin
```

### Output too large to keep

Debug logs can be gigabytes, and a run that stores them is slow to copy and to
read. A service writes those under a second directory, and what is written
there is not stored:

```bash
# inside the service
my-app --debug-log "$MACHINE_DROP_OUTPUT_DIR/debug.log"
```

The file is a source under `/output/drop`. It still has its name, and
`machine output app sources` lists it with 0 bytes, so you can see what a run
dropped. A run can still wait for a line of it. The wait stops the run at the
entry that wrote the line and stores nothing:

```bash
machine run app --until '/output/drop/app/debug.log~connection refused'
```

Because a run replays exactly, the file is not lost. Fork a branch that keeps
the file and starts from a point before the part you care about:

```bash
machine fork app --from ^before --name look --keep-output /output/drop/app/debug.log
machine output look --source /output/drop/app/debug.log
```

`--from` replays the branch from that point to where the run is now, and the
branch stores the file on the way. Use `--at` to stop the branch at an earlier
point. `machine go` takes `--from` too, and moves the machine onto the branch.
`machine detach` takes it for a new root that holds the file and shares nothing
with the run it came from.

`--keep-output` and `--drop-output` say what a run stores besides what the
two directories say. They are options of `create`, `fork`, `detach` and `go`,
the commands that make a run, and a run keeps them for its whole life.
`machine describe` shows the two directories and the names the run gives.

- **A name** is a file or a directory under `/output`, a port such as
  `ttyS1`, or a pattern such as `'/output/drop/*/*.log'`. A pattern is in
  the syntax of Python's `glob` module: `*`, `?`, `[abc]`, `[a-z]` and
  `[!abc]` stay within one directory name, and `**` matches any number of
  directories, as in `'/output/**/*.log'`. A name that begins with a dot is
  matched like any other.
- **When a kept and a dropped name cover the same file,** a name spelled out
  decides over a pattern, and of two names spelled out the longer one
  decides: `--keep-output /output/drop/app --drop-output
  /output/drop/app/huge.log` keeps the directory except that file.
  Otherwise the file is stored.
- **A branch has its parent's two lists.** An option on the fork replaces the
  list of its own kind and leaves the other as it was. The name `none`, given
  alone, is an empty list: `--keep-output none` keeps nothing beyond what the
  directories say.

What is stored never changes what the machine executes, so a branch that
keeps more still reproduces the recording.

## Sending input

A program that reads what a person types can be typed to.
[`machine send`](commands.md#machine-send) writes input to a device of the run:

```bash
machine send app ls                      # type ls and Enter on the console
machine send app ls --device ttyS1       # the same on another serial port
machine send -n app y                    # no Enter after it
machine send -n -e app '\x03'            # Ctrl-C
machine send app - < script.sh           # a file, exactly as it is
```

It works like `echo`: the text is sent as written and a newline follows, which
is Enter. `-n` leaves the newline out, and `-e` reads escapes such as `\t` and
`\x03`.

`send` does not run the machine. It queues the input and returns, and the
device takes it the next time the run executes:

```bash
machine send app 'echo hello'
machine run app --until 'console~hello'
```

The run records the input where it arrived, so a replay reproduces it without
being sent anything. To try other input, fork a branch and send to the branch.

At the [control prompt](#interactive-mode) the same command is `/send`. The
options come first and the text is the rest of the line, with no quotes:

```
/send ls -la
/send --device ttyS1 echo hello
/send -n -e \x03
```

A `;` separates commands at the prompt, so write a semicolon in the text as
`\x3b` with `-e`. Put the text in quotes to keep spaces at its ends, as in
`/send " y "`, and put `--` before a text that begins with a dash.

| Device | Is |
|---|---|
| `console` | the run's console, which is the default |
| `ttyS0` to `ttyS3` | the serial ports |
| `hvc0` | the virtio console, on a run created with `--console virtio` |
| `keyboard` | the PS/2 keyboard |

A serial port and the virtio console take bytes. The keyboard takes text and
types it on a US keyboard, a key pressed and released for each character, with
Shift or Ctrl held where the character needs one. Use it for a program that
reads the screen's terminal and not a serial line.

## Executing commands

[`machine exec`](commands.md#machine-exec) executes a command in the machine,
beside the programs already running there:

```bash
machine exec app run -- ls -la /             # execute it and print its output
machine exec app run -- sh -c 'ls | wc -l'   # a shell line, on a disk with sh
machine exec app start -- /app/load --rows 9 # send it and return its id
```

`run` runs the machine until the command exits, prints what it printed, and
exits with its status. A command gets 30 minutes of machine time to end, and
`--within` gives it another: `machine exec app run --within 10s -- make check`. `start` sends the command and returns an id. The
process starts the next time the run executes, so follow it with
[`machine run`](commands.md#machine-run).

A command is a program and its arguments, written after `--`. No shell reads
it. Use `-c` to give a line to the shell of the disk instead, with its pipes
and redirections: `machine exec app run -c 'ls / | wc -l'`.

At the [control prompt](#interactive-mode) the command is `/exec`, with the same
verbs. It needs no quotes and no `--`: the arguments are the words after the
verb, and a line for the shell is the rest of the line after `-c`.

```
/exec run ls -la /
/exec run -c ls / | wc -l
/exec start -c gdb -p 36 < /dev/gdb_pipe
/exec proc 7f3a9c21 stdout
/exec
```

A `;` separates commands at the prompt. To have one in the command, add `-e`
after the verb and write it `\x3b`, as `/send -e` does:
`/exec run -e -c echo a\x3b echo b`.

### In one container

Use `--container` to run a command in a container of your Compose project. It
takes the name of the service, or the name of the container:

```bash
machine exec app run --container db -- psql -c 'select 1'
machine exec app run --container db -c 'ls / | wc -l'        # the container's shell
machine exec app run --container db --user root -- id        # as another user
machine exec app start --container app -- ./worker
```

[`machine containers`](commands.md#machine-containers) lists the containers and
the service of each, which are the names `--container` takes:

```bash
machine containers app
```

```text
SERVICE  CONTAINER      STATE    IMAGE
app      compose-app-1  running  alpine:3.20
db       compose-db-1   running  alpine:3.20
```

The command has the container's environment and working directory. `--user`
picks the user it runs as, by name or as `uid:gid`; without it the command runs
as the container's own user. A service that runs several containers is refused,
and the message names them, so you pick one. [`machine put`](commands.md#machine-put)
and [`machine get`](commands.md#machine-get) take the same `--container`.

A command without `--container` runs in the machine, beside Docker, and can
call Docker itself. The project is named `compose`:

```bash
machine exec app run -- docker ps --format '{{.Names}}'                 # the containers
machine exec app run -- docker compose -p compose exec -T db hostname   # by service
machine exec app run -- docker exec compose-db-1 hostname               # by container
machine exec app run -- docker compose -p compose exec -T db sh -c 'ls / | wc -l'
```

`docker compose exec` needs `-T`, since the command has no terminal. A shell
line after the service is run by the image's own shell, with the image's
tools.

Each command is a process. The run records every line the process prints and
how it ends, each at its entry, so a replay reproduces them and a branch has
the processes of its parent:

```bash
machine exec app                       # the processes of the run
machine exec app proc 7f3a9c21         # one process: pid, state, exit status
machine exec app proc 7f3a9c21 events  # every line and state change, by entry
machine exec app proc 7f3a9c21 stdout  # its standard output
machine exec app proc 7f3a9c21 stderr  # its standard error
machine exec app proc 7f3a9c21 exits   # how it ended, and at which entry
```

An event's entry is a point. `machine go app '#20411'` forks a branch at the
entry that printed a line.

The output of a process is also a source like any other, under
`/output/exec/<id>`: `machine run app --until '/output/exec/7f3a9c21/stdout~done'`
stops the run at a line the process prints.

### Input for a program you started

A program that reads commands from its standard input, such as a debugger, is
driven through a named pipe. Make the pipe, keep it open, start the program
with its input on the pipe, and send to the pipe:

```bash
machine exec app run   -c 'mkfifo /dev/gdb_pipe'
machine exec app start -c 'sleep 1000000 > /dev/gdb_pipe'   # keeps the pipe open
machine exec app start -c 'gdb -p 36 < /dev/gdb_pipe'
machine send app 'b main' --device /dev/gdb_pipe
machine send app c --device /dev/gdb_pipe
machine run app --until vtime=+3s
machine exec app proc 7f3a9c21 stdout                       # what gdb printed
```

A `--device` that begins with `/` is the path of a file in the machine, and
[`machine send`](commands.md#machine-send) puts the bytes at its end. A process
in the machine writes them, and `send` prints its id: `machine exec app proc`
with that id says whether they were written. One send to a path carries about
2000 bytes.

`machine send` writes the machine's own files. For a program in a container,
make the pipe in the container and write it from there:

```bash
machine exec app run   -- docker exec compose-app-1 mkfifo /tmp/p
machine exec app start -- docker exec compose-app-1 sh -c 'sleep 1000000 > /tmp/p'
machine exec app start -- docker exec compose-app-1 sh -c 'gdb -p 1 < /tmp/p'
machine exec app run   -- docker exec compose-app-1 sh -c 'echo c > /tmp/p'
```

`machine exec` uses the serial port `ttyS3` for its requests. A program in the
machine that reads `ttyS3` takes them.

## Putting a file into the machine, and getting one out

[`machine put`](commands.md#machine-put) copies a file of your machine into the
running machine, or into one of its containers:

```bash
machine put app ./app.conf /etc/app.conf                    # into the machine
machine put app ./tool.sh /usr/local/bin/tool --mode 755    # with a mode
machine put app ./seed.sql /srv/seed.sql --container compose-db-1
machine put app ./d.bin /data/d.bin --owner 1000:1000       # with an owner
machine put app - /tmp/in < data.bin                        # standard input
```

- A file of any size is put, at tens of megabytes a second.
- The directories on the way to the path are made, and a file already there is
  replaced.
- The file has its name only once all of it is written, so a program never
  reads part of it.
- The machine runs while the file goes in, and the other programs in it run
  too.
- The bytes are a recorded input, so a replay puts the same file and a branch
  has it.
- The file is on the disk when `put` returns. A checkpoint taken after it has
  the file, and [`machine fs`](reading-the-disk.md) reads it there.

`--container` takes a container's name, as
`machine exec app run -- docker ps --format '{{.Names}}'` lists them, or the
name of its Compose service: `--container db` is the container of the service
`db`. A service that runs several containers is refused, and the message names
them, so you pick one. The container must be running. A path is resolved inside
the container, as a program there would resolve it.

[`machine send --device <path>`](commands.md#machine-send) is for a line into a
pipe and carries about 2000 bytes. `put` is for a file.

[`machine get`](commands.md#machine-get) copies a file the other way, from the
machine or from a container to your machine:

```bash
machine get app /var/log/app.log ./app.log
machine get app /srv/dump.sql ./dump.sql --container compose-db-1
machine get app /etc/hostname -                             # standard output
```

`get` reads the file as it is now, with what programs wrote and the disk does
not have yet. [`machine fs`](reading-the-disk.md) reads the disk at a
checkpoint instead. The machine runs while the file comes out, so a file a
program is writing can change on the way.

At the [control prompt](#interactive-mode) the commands are `/put` and `/get`,
with the same operands and options: `/put ./app.conf /etc/app.conf`.

A machine whose disk was built before `put` used this path still takes a file,
far slower. Rebuild the disk to get the speed.

## Getting a core dump

[`machine core`](commands.md#machine-core) has a process dump a core and copies
the core to your machine, where a debugger reads it with the program:

```bash
machine core app 412 ./app.core                    # pid 412 of the machine
machine core app 7 ./db.core --container db        # pid 7 of a container
gdb ./app ./app.core
```

- Taking a core ends the process: it dies of a signal, `ABRT` unless you name
  another with `--signal`.
- To keep your run as it is, [fork](checkpoints-and-branches.md) first and take the core on
  the branch.
- With `--container`, the pid is the one the process has inside the container,
  as `machine exec app run --container db -- ps` shows it.
- A process that handles the signal dumps no core. Name another, such as
  `--signal SEGV`.
- The first process of a container dumps no core. Run your program under an
  init, `init: true` in the Compose file, so it is not the first.

## Profiling

[`machine profile`](commands.md#machine-profile) samples what the machine runs
and shows where the time went:

```bash
machine profile app                            # a second of everything
machine profile app --for 5s --container db    # one container
machine profile app --pid 412                  # one process
```

```text
95 samples in 400 ms at 250 a second
 SELF   TOTAL  FUNCTION
69.5%   69.5%  chacha_permute_[k]
15.8%   21.1%  _copy_to_iter_[k]
 7.4%   76.8%  chacha_block_generic_[k]
 0.0%  100.0%  do_syscall_64_[k]
```

`SELF` is the share of samples a function was running in, and `TOTAL` the share
it was on the stack of. A name that ends in `_[k]` is a function of the kernel.

- `--flame` draws a flame graph in the terminal.
- `--folded` prints every stack with its count, one a line, as
  `program;outer;inner 42`. That text is what flame graph tools read, so you can
  save it and draw it with the tool you like, or hand it to an agent.
- `-o json` gives the same stacks as data.

The machine runs for the time sampled, and a machine that is idle has no
samples. The samples are taken by the machine's clock, so a replay of the run
takes the same ones.

A program built without frame pointers shows the function that ran and not the
functions that called it. Build with `-fno-omit-frame-pointer` to see the
callers.

## Interactive mode

When you are working on one run for a while, you can open a prompt for it.

```bash
machine control app
```

You issue commands to the run as slash commands, like `/checkpoint`,
`/branches` or `/rewind`. Most of the commands on this page have one. Type
`/help` to see them all. `-c` runs a single slash command and exits, as in
[`machine control app -c '/state'`](commands.md#machine-control), and [`machine control log app`](commands.md#machine-control) prints the
history of the commands you have issued.

## Stopping and starting

```bash
machine pause app
machine resume app
machine stop app
machine start app
machine kill app
machine delete app
```

`pause` freezes a running machine and `resume` lets it carry on. `kill` ends it
abruptly, where `stop` shuts a run down and keeps everything it recorded. `start` brings it
back at the end of its log. If the run had gone past its last checkpoint
when it stopped, Machine replays the recorded tail from that checkpoint and
tells you how many entries it replayed. Add `--no-recover` to make it
refuse instead.

`start` can also take a run back to an earlier point. `--at` replays from an
earlier checkpoint, and `--read-only` opens a checkpoint without running it
at all.

A run remembers the options you created it with: `--no-daemon`,
`--single-step`, `--limit` and `--backstop-limit`. Every `start` and `fork`
repeats them, so you type them once. `start` takes the same flags to change
them for that start only, so [`machine start app --daemon`](commands.md#machine-start) gives you a machine
to drive on a run created with `--no-daemon`. `fork` and `detach` take them
too, and the new run keeps what you gave. `--pin-cpu` is the exception: no run
remembers a CPU, so each `start` and `fork` picks the least-loaded one unless
you name it.

`delete` only removes stopped runs, unless you add `--stop`. It also refuses to
remove a run that has branches, unless you add `--recursive`. And since
[`machine delete --all`](commands.md#machine-delete) removes every run, it asks you first.

`delete` waits until the run is gone, which takes a while for a run with many
checkpoints. Add `--no-wait` and it returns as soon as the delete is accepted,
after stopping the machine if you asked it to. The delete carries on either
way, and [`machine ops`](commands.md#machine-ops) shows how it went.

To continue a run in a different session, publish it first from the session that has it.

```bash
machine sync app
```

To have a run or a disk waiting in a session before you need it, preload it.
Going the other way, [`machine offload`](commands.md#machine-offload) lists the copies in this session that
can be dropped to free space, and `-a` drops every one that isn't in use. The
durable copy stays, and starting the run brings it back.

```bash
machine preload run app
machine preload disk app
machine offload
```

[`machine cleanup`](commands.md#machine-cleanup) removes stale runs and other leftovers, and `--force` also
kills machines that have been orphaned.
