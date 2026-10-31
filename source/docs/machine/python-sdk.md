<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Python SDK

The SDK does what the client does, from Python. If you can type it in a
terminal, you can call it from a program.

## Installing

```bash
pip3 install testflows.machine
```

It needs Python 3.11 or later on Linux x86_64, the same systems as the client. If
you need another platform, [contact us](/contact.html?topic=machine). pip installs
the Machine core that the SDK runs on, `testflows.machine.core`, along with it.

## Hello Machine

```python
import testflows.machine.v1 as machine

client = machine.Client()

with client.sessions.create(cpus=1) as session:
    client.sessions.use(session)
    with client.create(disk="hello") as run:
        run.run(until="tasks", timeout=300)
        for line in run.output(lines=-20):
            print(line)
```

This creates a session, boots a run from the disk `hello` and prints the last
twenty lines of its console. A run waits for commands, so it moves only when
you call `run.run(...)`; pass `daemon=False` to have it run to the end by
itself.
Leaving a `with` block deletes what it created, whether the block ends normally
or with an error. That is how you make sure a session never outlives your
program.

## The same names

Every client command has a matching SDK call, and the names follow a simple
rule.

| In the client | In the SDK |
|---|---|
| a top-level command, [`machine create --disk app`](commands.md#machine-create) | a method on the client, `client.create(disk="app")` |
| a group, [`machine sessions use ci-1`](commands.md#machine-sessions-use) | an attribute of the client, `client.sessions.use("ci-1")` |
| a command that takes a run, [`machine fork app --at ^boot`](commands.md#machine-fork) | a method on the run, `run.fork(at="^boot")` |
| a group that takes a run, [`machine tasks app hold 56`](commands.md#machine-tasks-hold) | an attribute of the run, `run.tasks.hold(56)` |
| a positional argument | a positional argument |
| a flag like `--no-wait`, `-w` or `-f` | a keyword argument like `wait=False`, `watch=True` or `follow=True` |

So once you know the client, you know most of the SDK. [Commands](commands.md)
lists them, and the client's `--help` says what each call takes.

## Signing in

The SDK signs in with an API key from `TESTFLOWS_MACHINE_API_KEY` if it is set.
If it isn't, it uses the login that [`machine login`](commands.md#machine-login) stored, which it shares
with the client.

A program can sign in on its own too. The one-time code arrives by email.

```python
machine.login.start("me@example.com")
client = machine.login.verify("me@example.com", code="123456")
```

`machine.login.logout()` signs out.

## Sessions

A client has a current session, like the CLI does. You can set it when you
create the client, or later.

```python
client = machine.Client(session="ci-1")      # like -s ci-1
client.sessions.use("ci-2")                  # for this client only
```

`sessions.use` only changes the session for this client. It never changes it for
the `machine` command. Without a session you can still read your account's runs:
`client.runs()`, `client.branches()` and a run's `describe()`, `lineage()`
and `checkpoints()` all work.

`client.sessions` does what [`machine sessions`](commands.md#machine-sessions)
does. A session is a context manager, so leaving the `with` block deletes it:

```python
with client.sessions.create("ci-1", cpus=4, mem=8192) as session:
    print(session.name, session.state)
```

| Call | Does |
|---|---|
| `client.sessions.create(name, cpus=..., mem=..., storage=..., class_=...)` | creates a session and waits until it runs; `mem` is in MB and `storage` in GB |
| `client.sessions()`, `client.sessions.show(name)` | lists them, or reads one |
| `client.sessions.keep(name, minutes)` | keeps a session running idle for that long |
| `client.sessions.rename(name, new_name)`, `client.sessions.delete(name)` | renames or deletes one |

## Disks

`client.disks` builds and manages disks, as [`machine disks`](commands.md#machine-disks)
does. A build takes the same sources: `binary`, `from_`, `image` or `compose`.

```python
disk = client.disks.build("hello-py", from_="python:3.12-slim",
                          add=["hello.py"], command=["python", "hello.py"])
run = client.create("hello", disk=disk.name)
```

`image` and `compose` read your local Docker, as `--image` and `--compose` do.
[Disks](disks.md) says what each source needs.

| Call | Does |
|---|---|
| `client.disks()`, `client.disks.show(name)` | lists your disks, or reads one: `name`, `size_bytes`, `state`, `labels` |
| `client.disks.rename(name, new_name)` | renames one |
| `client.disks.delete(name)` | deletes one |
| `client.preload.disk(name)`, `client.offload.disk(name)` | copies a disk into the session ahead of time, or drops the session's copy; `preload_and_offload.py` shows both |

## Runs

Here is a typical run, from creating it to branching and replaying.

```python
run = client.create("app", disk="app", rng=True)
run.run(until="tasks")
run.focus.add("/app")
run.run(until="/app:exit")

booted = run.checkpoint("booted")
branch = run.fork(at="^booted", name="retry")
branch.replay()
```

And the calls you will reach for most often:

| Call | Does |
|---|---|
| `client.create(name, disk=..., cpus=..., ...)` | creates a run and boots it; takes every option [`machine create`](commands.md#machine-create) does |
| `client.runs()`, `client.runs["app"]` | lists runs, or finds one by name |
| `run.run(until=..., iters=...)`, `run.plan(file)` | drives it |
| `run.checkpoint(name)`, `run.checkpoints()` | saves a checkpoint, lists them |
| `run.fork(...)`, `run.go(point)`, `run.switch(branch)`, `run.detach(...)` | branches |
| `run.replay()`, `run.play(...)`, `run.diff(...)` | replays and compares |
| `run.hash()` | the hashes of the machine as it stands, memory and the disk included, as [`machine hash`](commands.md#machine-hash) |
| `run.dump(show="regs")`, `run.vcpu()` | the machine's state, and where one vCPU stopped |
| `run.rng()`, `run.rng.seed(7)`, `run.fork(at="^booted", rng_seed=7)` | the RNG device's seed, seeding it again, and a branch whose guest draws other random numbers |
| `run.run(irq_delay="blk=1ms", timer_slack="0:20ms")`, `run.irq.pending()` | hold interrupts a drawn time, draw how late a timer may be, and list the interrupts owed and held |
| `run.describe()`, `run.state()`, `run.now()`, `run.entries(...)` | reads it |
| `run.output(...)` | reads what it printed |
| `run.output.search(pattern, from_=..., to=...)`, `run.output.find(pattern)`, `run.output.entry(offset)` | finds text in what it printed, between two points if you like; each match has the entry that printed it and a `place` to go to |
| `run.output.sources()`, `run.output(source="ttyS1")`, `run.output.lines(source="all")` | lists the sources that printed, reads one, and reads them all with the source of each line |
| `run.fs.ls(path, at=...)`, `.cat(...)`, `.cp(...)` | reads its disk at a checkpoint, which `at` names |
| `run.send(text, device=...)` | sends input to a device or to a file in the machine, as [`machine send`](commands.md#machine-send) does; returns a `Sent` with `queued`, and `process` for a file |
| `run.exec(command)`, `run.exec(command, wait=False)`, `run.process(id)`, `run.processes()` | executes a command in the machine, a list for a program and a str for a shell line, and returns its `Process`: `pid`, `exit_code`, `stdout`, `stderr`, `events`, `exits` |
| `run.exec(command, container="db", user="root")` | executes it in a container, named by its Compose service or by its own name, as a user of it |
| `run.core(pid, dest, container=...)` | gets a core dump of a process into a file; the process dies of it |
| `run.profile("2s", container=..., pid=...)` | samples what runs for a time and returns a `Profile`: `samples`, `functions`, `stacks`, and `folded` text for flame graph tools |
| `run.profile(from_="^request", to="^reply")` | profiles a stretch the run already recorded, without changing the run |
| `run.profile("2s", in_guest=True)` | samples with a process in the run, for the functions of the kernel by name |
| `run.containers()`, `run.containers.kill("db", restart="5s")`, `run.containers.crash("db", restart="0")` | lists the containers and the Compose service of each; `stop`, `kill`, `crash`, `start`, `pause`, `resume` and `throttle` put a fault on one, as `machine containers` does |
| `run.put(source, path, container=..., mode=..., owner=...)` | puts a file of any size into the machine or into a container of it; `source` is bytes or the path of a file |
| `run.get(path, dest, container=...)` | gets a file out, as it is now; returns a `Got` with `size`, `mode`, `uid`, `gid`, and `data` when no `dest` is given |
| `run.tasks()`, `run.focus.add(...)`, `run.irq(...)`, `run.vtime.rate(...)` | steers the machine |
| `run.inject.add("syscall", "read", "valid", in_="/usr/bin/app", pick=1, prob=0.1)`, `run.inject.add("syscall", "read", delay="0:20ms", in_="/usr/bin/app")`, `run.inject.add("disk", in_="all", prob=0.01)`, `run.inject.add("disk-corrupt", in_="all", file="/var/lib/db/*/data.bin", op="write", bytes=8, times=1)`, `run.inject()`, `run.inject.delete(2)`, `run.inject.clear()` | injects faults as `machine inject` does: system calls fail with chosen errors or wait first, and the kernel's disk, allocation, usercopy and futex-access sites fail, and the disk corrupts, tears or loses data; lists the faults with their counts, and deletes them; `in_` takes the words `--in` takes, `delay` the span `--delay` takes, and `file`, `op`, `sectors` and `bytes` the disk options |
| `run.tasks.exist("/usr/bin/app")` | returns the tasks running that program, comm, tid or tgid now, or raises `NotFound`; it changes nothing |
| `run.task(tid)` | a guest task to debug, by its tid: `registers()`, `read(address, size)`, `address("main+4")`, `symbol(address)`, `symbols(regex="^wait")`, `backtrace()`, `libraries()` |
| `task.set(rax=0, rip="main+4")`, `task.write(address, data)` | writes its registers and its tgid's memory; a replay makes the writes again |
| `task.print("shape->at.x", frame=1)`, `task.print("counter = 3")`, `task.locals(args=True)` | an expression in a frame, a write with `TARGET = VALUE`, the locals or the arguments of a frame |
| `task.step()`, `task.step(line=True, over=True)`, `task.finish()` | steps an instruction or a line, over calls, or out of the function |
| `task.back()`, `task.back(line=True, over=True)` | goes back over the task's code onto a branch, as reverse-stepi and reverse-next |
| `task.call("strlen", "buf")`, `task.return_(0)` | calls a function in the task, or returns from its innermost one |
| `task.breakpoint("main")`, `task.watch("counter", on="access")` | stops its tgid at a location, or at a write or an access of its bytes; `run.run(...).hits` names the one the run ended at |
| `run.breakpoints.catch("fork", in_="tgid=1")`, `run.breakpoints.catch("io", file="/db/*/data.bin", op="write")` | stops at an event of a task: exec, exit, fork, vfork, syscall, signal, load, unload, fault, io, throw, catch, rethrow; `in_` takes the words `--in` takes, `tid=N`, `tgid=N` or `comm=NAME`; `file` and `op` are an `io` catchpoint's, as `--file` and `--op` |
| `run.breakpoints.list()`, `.enable(2, False)`, `.condition(2, "n > 3")`, `.ignore(2, 5)`, `.delete(2)`, `.hits()` | the run's stops, changed one at a time, and the hits the run log keeps |
| `run.run(iters=0)`, `run.run(until="tid=412:at=main")`, `run.back()` | runs to the next hit, or until a task reaches a location; goes back onto a branch at the newest hit |
| `run.tasks.signal(412, "SIGTERM")` | sends a task a signal; a replay sends it at the same instruction |
| `run.start()`, `run.stop()`, `run.pause()`, `run.kill()`, `run.delete()` | lifecycle |
| `run.start(at="^booted")`, `run.start(at="^booted", read_only=True)`, `run.start(recover=False)` | replays from a checkpoint to the tip, opens a checkpoint to read, or refuses to replay the tail, as [`machine start`](commands.md#machine-start) does |
| `run.fork(from_="^booted", name="b")`, `run.rewind("^booted")` | a branch forked at the checkpoint before a point and replayed to it; the run put back at a checkpoint |
| `run.sync()`, `run.cancel()` | publishes the run to your storage; cancels the drive or checkpoint in progress |
| `run.keep()` | keeps a run created in a `with` block when the block exits, such as one that just failed, with its tree |
| `run.marks.add("good")`, `run.marks.list()`, `run.marks.remove("good")`, `client.marks.list()` | names a branch, as [Marks](checkpoints-and-branches.md#marks) describes; the last lists every mark |
| `run.tasks.hold(56)`, `.release(56)`, `.yield_(56)`, `.slice(56, "10us")`, `.pin(56, "2")` | steers one thread, as [Holding threads](steering-programs.md#holding-threads) describes |
| `run.syscalls.counts("/usr/bin/app")`, `run.ints.counts(...)`, `run.vtime.add("5s")` | counts a task's system calls or interrupts; pushes the clock forward |
| `run.debug.log(lines=-20)`, `run.debug.err()`, `run.control.log()` | the run's debug output, its error log, and the commands issued to it |

Every call returns a record with named fields, such as a `RunInfo` from
`describe()` or a list of `TaskInfo` from `tasks()`. Call `as_json()` on one to get
a plain dict.

`run.run(...)` and `run.plan(...)` return a `RunResult`, which says how far the
drive went. An iteration has no fixed length, so `iterations` alone does not
tell you:

| Field | Is |
|---|---|
| `iterations` | the iterations that ran |
| `vtime_elapsed` | how far the machine's clock moved, in nanoseconds |
| `reached` | whether `until` held; `False` when `iters` ran out first |
| `clauses` | each clause the drive drew from, with the iterations it applied to |
| `entry_id` | the entry the drive ended at |
| `entries` | where each vCPU stopped |
| `hits` | the breakpoints, watchpoints and catchpoints the drive ended at; empty when none ended it |
| `printed` | the lines printed by stops that print, in the order the stops hit |

```python
done = run.run(iters=300, when="/app:on", mode="step")
for clause in done.clauses:
    print(clause.clause, clause.matched)   # when /app:on mode step×246  246
```

`until` takes the conditions [`machine run`](commands.md#machine-run) `--until` does,
including a machine time: `run.run(until="vtime=+10ms")`.

### Bounding a drive

`within` bounds a drive by the machine's clock, as `--within` does. With
`until`, the one that happens first ends the drive, and `reached` says which. The machine checks the bound itself, so a slow host never ends the drive
early:

```python
done = run.run(until="console~ready", within="30s")
if not done.reached:
    print("not ready after 30s of machine time")
```

`timeout` is different: it is how many seconds of your time the call waits,
and it raises `Timeout` when they run out. To wait for a run that something
else drives, such as another program or a run stopping in the background, use
`run.wait`:

```python
run.stop(wait=False)
run.wait(for_="stopped", timeout=60)
```

`for_` takes the predicates `machine wait` does: `ready`, `stopped`,
`halted`, `entry>=N`, `vtime>=T`, `console~REGEX`, or a task event such as
`/app:exit`.

### Scheduling from Python

Every option of `machine run` is a keyword. The draws described in
[Schedules](running-a-machine.md#schedules) look like this, on a run whose
program was focused with `run.focus.add("/app")` before `booted`, so that its
branches have the focus too:

```python
for seed in range(10):
    branch = run.fork(at="^booted", name=f"seed-{seed}")
    done = branch.run(until="/app:exit", within="60s", mode="step,fast",
                      step="1:200", task_sched="keep:hold:yield", seed=seed)
```

The `explore_seeds.py` example keeps the branches that fail and marks them.

## Faults

`run.inject` adds the faults [Fault injection](fault-injection.md)
describes, with the same subsystems and options as keywords. Check the target
first with `run.tasks.exist`, which raises `NotFound` when nothing runs it:

```python
run.tasks.exist(f"tgid={pid}")
run.inject.add("syscall", ["open", "openat"], "ENOENT", in_=f"tgid={pid}", times=3)
run.run(within="5s")
for fault in run.inject():
    print(fault.number, fault.syscall, fault.matched, fault.fired)
run.inject.clear()
```

A C library opens a file with `open` or `openat`, depending on the library,
so the fault takes both. `matched` counts the calls the fault saw and `fired`
the ones it failed. A disk fault takes the file and the operation:

```python
run.inject.add("disk", in_="comm=dd", file="/var/data.bin", op="write")
```

The `fault_injection.py` example runs both and prints what the program saw.

`on` and `off` make a fault [cycle](fault-injection.md#faults-that-cycle):
`run.inject.add("disk", in_="all", on="2s", off="5s")` fails every disk
request for 2 seconds in every 7 of machine time. Each `Fault` says where it
is: `active`, and `left_ns`, the time left in that window.

## Container faults

`run.containers` puts a fault on one service of a Compose project, as
[Container faults](container-faults.md) describes, while the
others keep running. A crash loses what the service had not synced to the
volumes its project names under `x-machine`:

```python
run.exec("echo synced > /data/kept && sync", container="app")
run.exec("echo in memory > /data/lost", container="app")

crashed = run.containers.crash("app", restart="0")
print(crashed.volumes)                      # the volumes the crash cut
run.run(within="5s")

print(run.exec("ls /data", container="app").stdout)   # kept is there, lost is not
```

`stop`, `kill`, `start`, `pause`, `resume` and `throttle` work the same way.
`stop` and `kill` take `restart=` as `crash` does, `stop` takes `grace=`,
`fresh=True` starts a new container instead of the old one, `pause` and
`throttle` take `for_=`, and `throttle` takes `cpus=`. `run.containers()` lists the containers with the
service, name and state of each. The `container_crash.py` example builds a
project, crashes one service and reads its volume after the restart.

## Clock faults

`run.clock` changes the guest's date or one container's, as
[Clock faults](clock-faults.md) describes. Each method returns the date as it
stands, with the change waiting for the run to execute:

```python
run.clock.jump("+59m50s")
run.run(within="30s", until="console~token refresh")
print(run.clock().offset)                    # ns from machine time

run.clock.drift("+200ppm", container="db")
run.clock.jump("+4s", for_="2m", slew="30s", container="db")
run.clock.jitter("-200ms:200ms", every="10m", seed=42, container="api")
run.clock.leap("insert")
run.clock.reset()
```

`run.clock(container="db")` reads one container. `ClockInfo.containers` lists
each container off the guest's date with its `offset`, `drift`, `slew` and
`jitter`, and `ClockInfo.jitter` and `ClockInfo.leap` are the guest's.

The guest kernel takes a change when the run executes, so read the clock after
that run to see whether it was refused. `ClockInfo.refused` names each change
of the last batch the guest refused, with its errno and the reason:

```python
run.clock.set("2038-01-19T03:13:30Z")
run.run(within="1s")
for refused in run.clock().refused:
    print(refused.command, refused.error, refused.reason)
```

To find how much skew a system tolerates, fork one checkpoint into branches,
one skew each:

```python
for skew_ms in (50, 100, 200, 400, 800):
    branch = run.fork(at="^steady")
    branch.clock.jump(f"+{skew_ms}ms", container="node2")
    result = branch.run(within="2m", until="console~two leaders")
    print(skew_ms, result.reached)
```

## Network faults

`run.net` puts faults on the links between a run's containers, as
[Network faults](network-faults.md) describes. A fault acts on the packets a
container sends: every one, or those a match takes, `to` a peer, of a
`proto`, of a `port`, or the TCP SYNs that open a connection with `syn`:

```python
run.net.delay("db", "100ms", jitter="20ms", seed=7)
run.net.loss("db", "10%", to="api")
run.net.loss("api", "100%", to="db", port=5432, for_="5s")
run.net.partition("db", "nest", for_="10s")
run.run(within="30s")

for link in run.net():
    print(link.container, link.peer or "-", link.port, link.delay, link.loss, link.seed)

run.net.heal()
```

`delay`, `loss`, `duplicate`, `corrupt`, `reorder`, `rate` and `hold`
return a `LinkChange`, the link before and after; `partition` returns one
for each link it cuts, and `heal` and `release` return the links they
changed. `duplicate`, `corrupt` and `reorder` take a share as `loss` does,
and `rate` takes bits a second, such as `"1mbit"`. A `Link` gives its delay
and jitter in nanoseconds and its shares in parts per billion. A replay
delays and drops the same packets.

`hold` keeps a link's packets until `release`, or for `for_`, and they then
leave together. `reset` aborts TCP connections and returns how many:

```python
run.net.hold("node1", for_="10s")         # node1's messages arrive late, in a burst
run.net.reset("api", to="db", port=5432)  # api's connections to db get a reset
```

`run.net.arp` shows and changes a container's neighbour table, and returns
the table as `Neighbor` entries:

```python
run.net.loss("db", "100%", proto="arp", to="api")   # db's ARP to api lost
run.net.arp.set("api", "db", "02:42:ac:12:00:99")   # a wrong MAC for db
for entry in run.net.arp.show("api"):
    print(entry.address, entry.peer, entry.mac, entry.state)
run.net.arp.flush("api")
```

## Stopping at an event

A catchpoint stops the run at an event of a task, as
[`machine catch`](commands.md#machine-catch) does. The drive that reaches it
returns the hit in `hits`:

```python
stop = run.breakpoints.catch("syscall", "open", "openat", in_="comm=cat")
run.exec(["cat", "/etc/hostname"], wait=False)
done = run.run(within="10s")
for hit in done.hits:
    print(hit.number, done.entry_id, hit.event)
run.breakpoints.delete(stop.number)
```

The kinds are `exec`, `exit`, `fork`, `vfork`, `syscall`, `signal`, `load`,
`unload`, `fault`, `io`, `throw`, `catch` and `rethrow`. An `io` catchpoint
takes `file=` and `op=`, and stops at a file's disk request before any disk
fault decides on it:

```python
run.breakpoints.catch("io", file="/var/lib/db/*/data.bin", op="write")
```

## Debugging a task

`run.task(tid)` is a task to debug while the machine is stopped, by its tid,
as [Debugging](debugging.md) describes for the command line:

```python
task = run.task(412)
regs = task.registers()
print(regs["rip"], regs["rsp"])
print(task.read(regs["rsp"], 16))
for frame in task.backtrace():
    print(frame.level, frame.address, frame.function, frame.path)
```

The `debug_task.py` example stops at a catchpoint, reads the registers of the
task that hit it, reads the path it was opening from its memory, and prints
its stack.

## Points in a run's history

Calls that take a point, such as `fork(at=...)`, `go`, `rewind`,
`replay(to=...)` and `profile(from_=..., to=...)`, take it as text, `"^booted"`,
`"#300"`, `"1.194s"` or `"-10ms"`, or as one of three records:

| Record | Is | Works on |
|---|---|---|
| `Point` | a time: `vtime`, the machine's clock in nanoseconds | every run; each finds its own entry at that time |
| `Place` | one entry: the `run_id` that recorded it, `entry_id`, `point` and `vtime_offset` | the run that recorded it, and branches forked after it |
| `Checkpoint` | a saved state: its `name`, and the `place` it was saved at | wherever its place works |

`start(at=...)` and the `fs` readers take only a checkpoint, by its name or as
a `Checkpoint`: they open a saved state, and a time or an entry is not one.

A point moves by a duration: an int of nanoseconds, a string such as `"10ms"`,
or a `timedelta`. Subtract one point from another for the nanoseconds between
them. `run.now()` returns a `Place`, and `run.place(point)` finds the entry a
point names.

```python
booted = run.checkpoint("booted")
branch = run.fork(at=booted.place.point + "10ms")
here = branch.now()
run.place(here.point)    # the same time, on the parent
```

A place is one run's entry, so once the parent and the branch have both run
past the fork, `run.place(here)` is refused: the parent's entry with that id
is another state. Pass `here.point` to take the same time instead.

## Watching and following

A listing takes `watch=True` and then gives you a new list every time
something changes. A log takes `follow=True` and gives you new lines as they
come, like `tail -f`.

```python
for runs in client.runs(states=["running"], watch=True, timeout=60):
    print([r.name for r in runs])

for line in run.output(follow=True, timeout=60):
    print(line)
```

## Choosing entries

Anything that reads entries takes the same few spellings.

| You write | Means |
|---|---|
| `200` or `(100, 200)` | that entry, or that range, both ends included |
| `"100:200"`, `"100:"`, `":200"` | a range, from 100 on, or up to 200 |
| `"-20"` or `"-20:"` | the last 20 entries |
| `"-20:-2"` | the 20th entry from the end through the 2nd |
| `slice(100, 200)` | a Python slice, so 100 through 199 |
| `slice(-20, -1)` | a Python slice from the end, so the same as `"-20:-2"` |

Be careful with the slice rows. A pair and a string include both ends, the way
Machine's own messages do. A slice is Python's, so it stops before the end.
That makes `(100, 200)` one entry longer than `slice(100, 200)`.

Both ends of a range count from the same end: `"-20:5"` and `slice(-20, 5)`
are refused.

`lines=` selects lines of output in the same grammar: `20` is line 20, `-20`
the last 20, `"-10:-2"` the tenth line from the end through the second, and
`0` none, which starts a follow at the end.

## Cleaning up

A session costs from the moment you create it, and a run keeps its log and
checkpoints until you delete it. Both can be used as context managers, as
in the first example, and deleting a run takes its branches with it.

If you want to keep a run that found something, don't wrap it in a `with`
block. Nothing is deleted until you call `delete()`.

## Errors

Every exception the SDK raises is a `machine.Error`, and each one says what
went wrong.

| Exception | Raised when |
|---|---|
| `NotSignedIn` | there are no credentials |
| `Unauthorized` | a key or a sign-in code was rejected |
| `Forbidden` | your account is not allowed to do that |
| `NotFound` | nothing matches the name or id |
| `AlreadyExists` | something with that name exists |
| `InvalidArgument` | an argument is wrong, or a name matches more than one thing |
| `NotRunning` | it exists, but it is not running |
| `Conflict` | the request does not fit the thing's current state |
| `NoCapacity` | no host of the session's class has room for it now; the same request can succeed later, or a smaller session or another class may fit |
| `Diverged` | `play()` could not follow the recording; `replay()` returns a divergence in its result instead |
| `Timeout` | a wait ran out of time; the work goes on in the service |
| `ServiceUnavailable` | the service could not be reached |
| `ApiError` | the service refused the request |

A replay that does not reproduce the recording is a result, not an
exception, so check it:

```python
result = branch.replay()
if not result.converged:
    print(branch.diff(entry=result.entry_id).diverged)
```

The exceptions you will usually handle are the ones with a way out. A full
class can be retried or sized down, and a run that stopped can be started
again:

```python
try:
    session = client.sessions.create("ci-1", cpus=8)
except machine.NoCapacity:
    session = client.sessions.create("ci-1", cpus=4)

try:
    run.run(until="console~ready", within="60s")
except machine.NotRunning:
    run.start()
```

The `error_handling.py` example goes through every exception.

## Examples

The SDK comes with small scripts. Each one creates its own session and
deletes it at the end. Most run as `python <script> --disk <name>`.
`disks.py` builds the disk first and takes `--binary` and `--name`.
`container_crash.py` builds its own disk too and takes `--name`, and deletes
the disk at the end.

| Script | Shows |
|---|---|
| `hello.py` | creates a run, boots it, reads its console |
| `disks.py` | builds a disk from a static executable, boots a run from it, renames the disk and deletes it |
| `checkpoint_and_fork.py` | a checkpoint after boot, and branches from it |
| `replay_verify.py` | replays a recording and names what diverged |
| `explore_seeds.py` | one branch per seed, with the failing ones marked and kept |
| `force_interleaving.py` | holds one thread while another runs past it |
| `plan_file.py` | drives a run with `when` and `else` clauses |
| `watch_and_follow.py` | watches a listing and follows a console |
| `syscall_profile.py` | counts a program's system calls and interrupts |
| `read_fs.py` | reads and copies files from a checkpoint's disk |
| `machine_time.py` | changes the machine's clock (vtime) rate and pushes it forward |
| `inject_interrupt.py` | injects an interrupt and replays it |
| `stop_and_resume.py` | what `stop`, `kill`, `start` and `sync` keep |
| `resume_elsewhere.py` | stops a run in one session and starts it in another |
| `preload_and_offload.py` | preloads a disk onto the session, then drops the session's copy |
| `ci_job.py` | a CI job with an API key, a session per job and an exit code |
| `error_handling.py` | every error and how to recover from it |
| `fault_injection.py` | fails a program's opens with a syscall fault and its synced write with a disk fault, and prints what the program saw and the fault counts |
| `container_crash.py` | builds a Compose project with an `x-machine` volume, crashes one service, and reads what the volume kept; takes `--name` for the disk it builds |
| `debug_task.py` | stops at a catchpoint on `open`, reads the task's registers, memory and stack |

## License

The SDK is licensed under Apache 2.0. The Machine core it runs on,
`testflows.machine.core`, is not part of it and has its own license.
