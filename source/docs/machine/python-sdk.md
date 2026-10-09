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
        for line in run.console(lines=-20):
            print(line)
```

This creates a session, boots a run from the disk `hello` and prints the last
twenty lines of its console. A run waits for commands, so it moves only when
you call `run.run(...)`; pass `daemon=False` to have it run to the end by
itself.
Leaving a `with` block deletes what it created, whether the block ends normally
or with an error. That is how you make sure a session never outlives your
program.

## It looks like the client

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
| `run.describe()`, `run.state()`, `run.now()`, `run.entries(...)` | reads it |
| `run.console(...)` | reads what it printed |
| `run.artifacts.ls(path, at=...)`, `.cat(...)`, `.cp(...)` | reads its disk |
| `run.tasks()`, `run.focus.add(...)`, `run.irq(...)`, `run.vtime.rate(...)` | steers the machine |
| `run.start()`, `run.stop()`, `run.pause()`, `run.kill()`, `run.delete()` | lifecycle |

Every call returns a record with named fields, such as a `RunInfo` from
`describe()` or a list of `Task` from `tasks()`. Call `as_json()` on one to get
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

```python
done = run.run(iters=300, when="/app:on", mode="step")
for clause in done.clauses:
    print(clause.clause, clause.matched)   # when /app:on mode step×246  246
```

`until` takes the conditions [`machine run`](commands.md#machine-run) `--until` does,
including a machine time: `run.run(until="vtime=+10ms")`.

## Watching and following

A listing takes `watch=True` and then gives you a new list every time
something changes. A log takes `follow=True` and gives you new lines as they
come, like `tail -f`.

```python
for runs in client.runs(states=["running"], watch=True, timeout=60):
    print([r.name for r in runs])

for line in run.console(follow=True, timeout=60):
    print(line)
```

## Choosing entries

Anything that reads entries takes the same few spellings.

| You write | Means |
|---|---|
| `200` or `(100, 200)` | that entry, or that range, both ends included |
| `"100:200"`, `"100:"`, `":200"` | a range, from 100 on, or up to 200 |
| `"-20"` | the last 20 entries |
| `slice(100, 200)` | a Python slice, so 100 through 199 |

Be careful with the last row. A pair and a string include both ends, the way
Machine's own messages do. A slice is Python's, so it stops before the end.
That makes `(100, 200)` one entry longer than `slice(100, 200)`.

`lines=` selects lines of output in the same grammar: `20` is line 20, `-20`
the last 20, and `0` none, which starts a follow at the end.

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
| `Diverged` | a replay did not reproduce what was recorded |
| `Timeout` | a wait ran out of time |
| `ServiceUnavailable` | the service could not be reached |
| `ApiError` | the service refused the request |

```python
try:
    branch.replay()
except machine.Diverged:
    print(branch.diff())
```

## Examples

The SDK comes with small scripts. Each one runs as
`python <script> --disk <name>`, creates its own session, and deletes it at the end.

| Script | Shows |
|---|---|
| `hello.py` | creates a run, boots it, reads its console |
| `checkpoint_and_fork.py` | a checkpoint after boot, and branches from it |
| `replay_verify.py` | replays a recording and names what diverged |
| `explore_seeds.py` | one branch per seed, with the failing ones marked and kept |
| `force_interleaving.py` | holds one thread while another runs past it |
| `plan_file.py` | drives a run with `when` and `else` clauses |
| `watch_and_follow.py` | watches a listing and follows a console |
| `syscall_profile.py` | counts a program's system calls and interrupts |
| `read_artifacts.py` | reads and copies files from a checkpoint's disk |
| `machine_time.py` | changes the machine's clock (vtime) rate and pushes it forward |
| `inject_interrupt.py` | injects an interrupt and replays it |
| `stop_and_resume.py` | what `stop`, `kill`, `start` and `sync` keep |
| `resume_elsewhere.py` | stops a run in one session and starts it in another |
| `ci_job.py` | a CI job with an API key, a session per job and an exit code |
| `error_handling.py` | every error and how to recover from it |

## License

The SDK is licensed under Apache 2.0. The Machine core it runs on,
`testflows.machine.core`, is not part of it and has its own license.
