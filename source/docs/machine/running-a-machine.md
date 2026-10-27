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
| `--mem-hash` | hash the machine's memory at every entry, so a replay compares it too (off by default) |
| `--disk-hash` | hash the machine's disk at every entry, so a replay compares it too (off by default) |
| `--repeatable` | record so that recording the run again gives the same entries (off by default, and recording is slower) |
| `--fence-timer-slack d` | with `--repeatable`, how late a timer may arrive in a program that computes without waiting, 20ms by default |
| `--no-wait` | return as soon as the request is accepted |

Change the seed and the program sees different random numbers. Keep it and it
sees the same ones every time. This one is only about the random numbers the
machine asks for. For exploring thread schedules there is another seed, on
[`machine run`](commands.md#machine-run), covered next.

## Multiple vCPUs

A machine can have more than one vCPU. Ask for them with `--cpus` and the guest
sees every one, so its kernel spreads threads across them just as it would on
your own computer.

Here is a quick way to see it. Build a disk from Ubuntu 26.04 whose container
just runs `sleep infinity`, so it stays up and waits for your commands. Then
create a run with four vCPUs and ask the guest what it has:

```bash
machine disks build --from ubuntu:26.04 ubuntu-26.04 --entrypoint /bin/sleep -- infinity
machine create app4 --disk ubuntu-26.04 --cpus 4
machine exec app4 run --container app -- nproc
machine exec app4 run --container app -- grep -E '^processor|^model name' /proc/cpuinfo
```
```
4
processor	: 0
model name	: TestFlows Machine v1
processor	: 1
model name	: TestFlows Machine v1
processor	: 2
model name	: TestFlows Machine v1
processor	: 3
model name	: TestFlows Machine v1
```

Nothing about recording changes with more vCPUs. The machine records each of
them, along with every interrupt one vCPU sends to another, so a run on four
vCPUs replays exactly like a run on one. A race between two threads on
different vCPUs plays out the same way every time you replay it.

Each scheduling cycle gives every vCPU a turn. To drive just one of them, use
`machine run --vcpu N`. And to explore how threads on several vCPUs could
interleave, see [Trying different schedules](running-a-machine.md#trying-different-schedules).

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

The two commands read a text condition differently. `run --until` waits for
text printed during the run, so a line already on the console does not end
it, and the same `--until` can stop at the next of several lines alike.
`wait --for` asks whether the text has been printed at all, before the run
or during it:

```bash
machine run app --until 'console~ready'    # runs until the next ready line
machine wait --for 'console~ready' app     # true if one was printed already
```

A source name with a `~` in it is quoted inside the pattern, as in
`'"/output/keep/app/app.log~"~ERROR'`.

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

`--mode` is how the machine runs: `fast`, `step`, `step-into`, `free` or
`fence`, or a comma list to draw from. `--step` and `--fast` give the length of
a stretch in each mode, as a number or a range like `1:200`. `--strategy` sets
how the draws are made, `random` (the default), `golden` or `sweep`, and
`--seed` is the seed for the random and golden ones.

A `fence` stretch ends in the same place every time the same state is
recorded, where a `fast` stretch ends close to its length but not always at the
same instruction. That exactness makes a `fence` stretch somewhat slower than a
`fast` one. Give its length with `--fence` or `--limit`.
[Recording that repeats](#recording-that-repeats) shows how to make a whole run
record the same way every time.

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

## Recording that repeats

A [replay](replay.md) always repeats a recording exactly. Recording the same
run a second time is different: by default two recordings of one run, from the
same disk and the same seeds, start out the same and then drift apart a little.

When you need the second recording to match the first, create the run with
`--repeatable`. Every recording of it then records the same entries, whether the
run has one vCPU or several, and a branch you fork from one of its checkpoints
records exactly what its parent recorded after that checkpoint.

```bash
machine create app --disk app.img --repeatable --cpus 2
machine run app --until tasks
machine checkpoint app booted
machine run app --until 'console~done'
machine fork app --at ^booted --name again       # records the same entries again
machine fork app --at ^booted --no-repeatable    # a branch that records as usual
```

Repeatable recording is slower, and how much slower depends on the program.
Booting PostgreSQL 17 on one vCPU took 1 minute 10 seconds to record with
`--repeatable` and 14 seconds without it. Loading its test data with
`pgbench -i`, which computes with hardly a pause, took 1 minute 20 seconds
against 4 seconds. A program that spends its time waiting on the disk, the
network or a timer pays much less. Replaying a repeatable run is as fast as
replaying any other.

Two options trade recording speed against how closely the recording follows
the clock. `--fence-timer-slack` is how late a timer may arrive while the
program computes without waiting on anything: 20ms by default, `0` to keep
every timer on time, which records slowest. `--fence-margin` is how early,
counted in branches, the machine slows down to reach each exact stop: 10000 by
default. A smaller margin records faster, and one too small leaves stops a
later recording may not repeat.

A branch keeps whatever its parent does unless you give it `--repeatable` or
`--no-repeatable`, and the same holds for the two options. `start` keeps what
the run was created with.

What you send a run is part of what a recording repeats. Commands given with
[`machine exec`](commands.md#machine-exec), `put` and `get` in the same order
at the same points name their processes alike in every recording, such as
`40787p1`: the entry the run stood at, and the command's place among those
sent there.

## Time compression

Idle time takes almost no time.

When every vCPU is halted and waiting for a timer, the machine doesn't sit
through the wait. It moves its clock straight to the earliest timer the guest
armed, and the guest wakes up at exactly the time it asked for, as if it had
waited. No instruction runs in between, so there is nothing for the host to
do. Time the guest spends working is never skipped.

So a program that sleeps for ten minutes sleeps ten minutes of machine time,
and only a few seconds of yours. Try it on a one-vCPU run of the Ubuntu disk
from [Multiple vCPUs](running-a-machine.md#multiple-vcpus):

```bash
machine create app --disk ubuntu-26.04
time machine exec app run --container app -- sh -c 'date; sleep 600; date'
```
```
Sun Mar  1 00:00:05 UTC 2026
Sun Mar  1 00:10:05 UTC 2026

real	0m2.802s
```

Ten minutes went by in the guest, and 2.8 seconds went by for you.

### On more than one vCPU

Time compression works the same way with [several vCPUs](running-a-machine.md#multiple-vcpus).
The machine only moves the clock once all of them are idle, so a vCPU that
still has work finishes it first. Here is the same sleep on the four-vCPU run:

```bash
time machine exec app4 run --container app -- sh -c 'date; sleep 600; date'
```
```
Sun Mar  1 00:00:07 UTC 2026
Sun Mar  1 00:10:07 UTC 2026

real	0m7.166s
```

### Replaying it

Every move of the clock is recorded in the run's log, so a replay makes the same
moves at the same points and ends up in the same state. Fork a branch from the
start of the run and replay it, ten minutes of sleep included:

```bash
machine stop app4
machine fork app4 --at ^1 --name check
machine replay app4/check
```

Then [`machine diff`](commands.md#machine-diff) compares the branch with the
original:

```bash
machine diff app4/check
```
```
✔ No differences
```

How much a run compresses depends on how idle the guest really is. A database
that keeps running background tasks while your test sleeps uses machine time
for them, and that time is never skipped.

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

At the [control prompt](#interactive-mode) the two are `/run until` and
`/wait for`, and `/run` takes `within` too:

```
/run until 'console~ready' within 30s
/wait for 'console~ready'
```

`/wait for` answers at once, because nothing drives the machine while the
prompt waits. `timeout 5` makes it wait 5 seconds, for a run another session
drives.

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

`console:N` is a line by its number, as `machine output -n` numbers it: the
point where the console finished printing line N. Any source takes it, such as
`ttyS1:20`. A line counts from 1, so the point names the same place each time
it is read:

```bash
machine go app console:120
```

If you would rather search with your own tools, pipe the console to them.
`grep -b` prints the byte offset of a match, and
[`machine output app entry`](commands.md#machine-output-entry) turns an offset into its entry:

```bash
machine output app -n : | grep -bo 'Linux version'    # 438:Linux version
machine output app entry 438                          # 1276
```

On a terminal, every line shows the range of entries that printed it, the
source it came from and its number. Into a pipe or a file the lines are printed
alone, as the machine printed them. `--wide` and `--plain` choose either way:

```bash
machine output app -n -5                      # with their entries
machine output app -n : --plain > boot.log    # the text alone
```

On a terminal, a control character the guest printed shows as text, such as
`␛[?25l`, and your terminal does not act on it. Colors stay colors. A pipe or a
file gets every byte as the guest printed it.

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
options come first and the text is the rest of the line, as you typed it,
quotes included:

```
/send ls -la
/send --device ttyS1 echo hello
/send echo "a;b"
/send -n -e \x03
```

The prompt reads quotes as a shell does. A `;` separates commands, except
inside quotes, so `/send echo "a;b"` sends `echo "a;b"`. A quote that is not
closed refuses the whole line, so write `/send "don't"`. Put the text in
quotes to keep spaces at its ends, as in `/send " y "`, and put `--` before a
text that begins with a dash.

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

`machine exec app` with no verb lists every command executed in the run, with
the entries it started and ended at:

```text
ID       PID  STATE     ENTRIES      COMMAND
23035p1  138  exited 0  23084:23090  ls
23090p1  139  exited 0  23220:23226  echo foo > /tmp/foo.txt
```

A process's id is the entry it was sent at and its number. In the machine,
its standard output and standard error are the files
`/.machine/output/exec/23090p1/stdout` and `/.machine/output/exec/23090p1/stderr`,
and its events are in `/.machine/output/exec/23090p1/status`.
`machine exec app proc 23090p1 stdout` prints one stream, and the output source
`/output/exec/23090p1/stdout` names it in
[`machine output`](commands.md#machine-output) and `--until`.

At the [control prompt](#interactive-mode) the command is `/exec`, with the same
verbs. It needs no `--`: the arguments are the words after the verb, and a line
for the shell is the rest of the line after `-c`, its quotes kept for the shell.

```
/exec run ls -la /
/exec run -c ls / | wc -l
/exec run -c 'X=1;echo $X'
/exec run -- sh -c 'X=1;echo $X'
/exec start -c gdb -p 36 < /dev/gdb_pipe
/exec proc 40787p1 stdout
/exec
```

A `;` separates commands at the prompt, except inside quotes, so a line with
one is written in quotes, as in a terminal. A pair of quotes around the whole
`-c` line is taken off. A `$` line, below, needs none of this.

### Shell lines at the control prompt

At the [control prompt](#interactive-mode), `$` puts you in the machine's
shell. Type a line after it as you would in a terminal. The prompt runs the
machine until the line finishes and prints what it wrote. A line that exits
other than 0 says so after its output.

Nothing in the line is the prompt's. Everything after the `$` goes to the shell
as you typed it, so pipes, redirections, `;`, `&&`, variables and quotes all
work without escaping:

```
$ uname -a
$ ls -la /srv
$ ps aux | grep worker
$ head -3 /etc/os-release
$ cd /srv; make test
$ X=1; echo $X
$ grep -c ERROR /var/log/app.log || echo none
$ echo 'retries=5' >> /etc/app.conf
```

A `$` line is `/exec run -c` with that line, so the run records it like any
other command. `/exec` lists it, a checkpoint keeps what it changed, and a fork
or a replay repeats it. Look around between two steps of a run, change a file,
and rewind to a checkpoint to try something else.

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
machine exec app proc 40787p1         # one process: pid, state, exit status
machine exec app proc 40787p1 events  # every line and state change, by entry
machine exec app proc 40787p1 stdout  # its standard output
machine exec app proc 40787p1 stderr  # its standard error
machine exec app proc 40787p1 exits   # how it ended, and at which entry
```

An event's entry is a point. `machine go app '#20411'` forks a branch at the
entry that printed a line.

The output of a process is also a source like any other, under
`/output/exec/<id>`: `machine run app --until '/output/exec/40787p1/stdout~done'`
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
machine exec app proc 40787p1 stdout                       # what gdb printed
```

A `--device` that begins with `/` is the path of a file in the machine, and
[`machine send`](commands.md#machine-send) puts the bytes at its end. A process
in the machine writes them, and `send` prints its id: `machine exec app proc`
with that id says whether they were written. One send to a path carries about
2000 bytes.

`machine send` writes the machine's own files. For a program in a container,
make the pipe in the container and write it from there:

```bash
machine exec app run   --container db -- mkfifo /tmp/p
machine exec app start --container db -c 'sleep infinity > /tmp/p'
machine exec app start --container db -c 'gdb -p $(pidof postgres) < /tmp/p'
machine exec app start --container db -c 'echo c > /tmp/p'
machine run app --until '/output/exec/<id>/stdout~Continuing' --within 10s
```

`<id>` is the id `exec start` printed for GDB.

[GDB inside the machine](debugging.md#a-session-that-stays-attached) walks
through a whole session this way, on ClickHouse.

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

[`machine profile`](commands.md#machine-profile) shows where a run spent its
time, by function and by call stack:

```bash
machine profile app                            # a second of everything
machine profile app --for 5s --container db    # one container
machine profile app --pid 412                  # one process
```

Here is one second of [`memstress`](https://github.com/testflows/Machine-Examples),
one of the example programs, which maps, touches and unmaps memory from four
threads:

```text
463 samples at 250 a second
 SELF  TOTAL  FUNCTION
34.1%  34.1%  kernel_[k]
34.1%  34.1%  sys_munmap_[k]
19.2%  94.4%  worker
 5.4%   5.4%  sys_madvise_[k]
 5.2%   5.2%  sys_mmap_[k]
 1.1%   1.1%  sys_clone3_[k]
```

`SELF` is the share of samples a function was running in, and `TOTAL` the share
it was on the stack of. So `worker` itself ran in 19% of the samples and was on
the stack of 94% of them: the rest of its time went to the calls under it.

A name that ends in `_[k]` is time in the kernel. `sys_munmap_[k]` is the
`munmap` system call. `kernel_[k]` is kernel time that is no system call, here
the page faults of touching fresh memory.

- `--flame` draws a flame graph in the terminal.
- `--folded` prints every stack with its count, one a line. That text is what
  flame graph tools read, so you can save it and draw it with the tool you
  like, or hand it to an agent:

  ```text
  memstress;clone3;start_thread;worker;kernel_[k] 56
  memstress;clone3;start_thread;worker;munmap;sys_munmap_[k] 32
  memstress;clone3;start_thread;worker 31
  memstress;clone3;start_thread;worker;mmap64;sys_mmap_[k] 12
  memstress;clone3;start_thread;worker;madvise;sys_madvise_[k] 10
  ```

- `-o json` gives the same stacks as data.

Machine takes the samples from outside the guest, at every timer interrupt of
each CPU. Nothing is installed in your image and nothing runs in the guest for
it, so a run is the same with a profile and without. Your programs do not need
frame pointers: a stack is walked by the unwind information every program
carries for exceptions.

### Profiling a run that already happened

Because a run is recorded, you can profile a stretch of it after the fact, even
if no profiler was on at the time:

```bash
machine profile app --from ^request --to ^reply
machine profile app --from 12s --to 14s --flame
```

The stretch is replayed on a branch, which is deleted afterwards. Your run is
not touched, and it does not need to be running. Profile the same stretch twice
and you get the same samples.

### Good to know

- Names come from the program files on the machine's disk as it is when the
  stretch ends. You do not need a checkpoint, and a profile does not take one.
- A file the guest has written but not synced to disk yet shows as `[file]`.
  Run `sync` in the guest first.
- A stripped program with no unwind information, such as Alpine's `busybox`,
  is one frame named after its file.
- Time in the kernel is one frame. The functions of the kernel itself are not
  shown.
- `--in-guest` samples with a small process inside the guest instead. Use it
  when you need the kernel's own functions by name. It is part of the run, and
  it cannot profile a recorded stretch.
- Samples are taken 250 times a second on each CPU.
- C++ names are printed as the program has them. Pipe `--folded` through
  `c++filt` to read them.

## Interactive mode

When you are working on one run for a while, you can open a prompt for it, so
you no longer type `machine` and the run's name before every command.

```bash
machine control app
```

You issue commands to the run as slash commands, like `/checkpoint`,
`/branches` or `/rewind`. Most of the commands on this page have one, written
the same way without the run's name. Commands that run the machine, take
checkpoints or make and switch branches take their options as plain words, so
`--at ^booted` becomes `at ^booted`. Commands that execute something in the
guest or read its state, such as `/exec`, `/send`, `/profile` or `/regs`, take
the same flags as on the command line: `/exec run --container app nproc`. Type
`/help` to see them all, and `/q` or Ctrl+D to leave.

`/h` and a command shows that command with examples, such as `/h exec`. A word
in capitals in the help is a type: `/h RANGE` says how to write a range, and
`/h POINT` a point.

Above the prompt, a line shows where the run is: its time, its entry, the vCPU,
the RIP, what the entry is, such as `IO_OUT`, and its state hash. Back at an
entry, the same hash means the same state.

```text
⌖ vtime=4.648247180s  entry=32103  vcpu=0  rip=0xffffffff8104880d  IO_OUT  hash=0x91c170d2d6da8e05
```

The prompt is the easiest way to try something and come back. The session below
starts from a new run made from the `ubuntu-26.04` disk, the one built in
[Multiple vCPUs](#multiple-vcpus) from Ubuntu 26.04 with a container that waits
for your commands. [Disks](disks.md) has more on building one.

```bash
machine disks build --from ubuntu:26.04 ubuntu-26.04 --entrypoint /bin/sleep -- infinity
machine create app --disk ubuntu-26.04
```
```
✔ Started app (whyvcWEKxc7c5b2UwO7r6)
```
```bash
machine control app
```

At the prompt, it boots the machine until Docker attaches to its container,
keeps that point as a checkpoint, and removes a file:

```text
/f until console~Attaching within 60s
iterations: 24957  run ic: 1525715866  vtime: +3.730915228s  checkpoints: 1

VCPU  EXIT  ID     RUN IC   RCB  TOTAL IC    REGS HASH           RIP                 RCX  ITER
0     IO    27777  1905719  148  1525715866  0x26180340852cf271  0xffffffff8104880d  1    4

/checkpoint name booted
✔ Created checkpoint booted at entry 27777
  Make it durable /sync

/exec run cat /etc/hostname
docker-test

/exec run rm /etc/hostname

/exec run cat /etc/hostname
cat: can't open '/etc/hostname': No such file or directory
✗ Exited 1.
```

`/f` runs the machine until `Attaching` appears on the console, or for 60
seconds of the machine's own time at most. It took 3.7 seconds of the machine's
time here, and the table shows where each vCPU stopped. To see the
machine as it was before the file was removed, fork a branch at `booted` and
switch onto it:

```text
/go to ^booted
✔ Branched app/27777 (whyvg0aXMSf6g7H2pU5wa) at entry 27777 and switched onto it.

/exec run cat /etc/hostname
docker-test

/switch app
✔ Switched to app (whyvcWEKxc7c5b2UwO7r6)
```

The branch is named after the entry it was forked at, and the file is there
again, while `app` keeps its own history without it. `/switch app` moves the
machine back. The prompt also remembers the branches you have visited:
`/go back` returns to where the last switch started, `/go up` and `/go down`
walk the visits in order, and `/history` lists them. `/mark good` gives the
branch you are on a name, and `/switch %good` returns to it.

A branch made at the prompt takes the same options as one made with
[`machine fork`](commands.md#machine-fork), written as words. This one records
a branch that repeats, with a smaller timer slack than the default, as
[Recording that repeats](#recording-that-repeats) describes:

```text
/fork at ^booted name exact repeatable fence-timer-slack 5ms
✔ Forked app/exact (whyvhjPaLbY3hsz3KyytQ)
  From checkpoint 27777 of app, nothing replayed
```

`/fork` starts the branch beside the one you are on and leaves you where you
are. `/switch app/exact` moves onto it, and `/describe:app/exact` shows
`Repeatable: true` and `Fence Timer Slack: 5ms`.

`-c` runs a single slash command and exits, as in
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
abruptly, where `stop` shuts a run down and keeps everything it recorded. In
a session, both wait until what the run recorded is saved to your storage,
and show how far the save has got. `start` brings it
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

What a run records is fixed when you create it: `--side-dump`, `--side-trace`,
`--mem-hash`, `--disk-hash` and `--repeatable`. A `start` keeps it. A branch is
where it changes: `fork`, `detach` and `go` take each of them, and
`--no-mem-hash`, `--no-disk-hash` or `--no-repeatable` to turn one off, and a
branch given none records what its parent records. [Replay](replay.md) says what the two hashes add.

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
