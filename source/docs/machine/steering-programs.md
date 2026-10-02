<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Steering programs

By default Machine lets the guest schedule itself. Sometimes that isn't what
you want. A bug that needs one thread to run past another will not show up
if the scheduler never picks that order. Machine lets you pick it.

Everything here is recorded, so a replay repeats it exactly.

## Looking at tasks

```bash
machine tasks app
```

That lists the tasks in the guest, one row per thread, with the process each one
belongs to. You will want a thread's id, or a program's path, in the commands
below. `machine syscalls app` and `machine ints app` list the guest kernel's
system calls and interrupt vectors.

## Focus

Machine matches a program by its absolute path in the guest. Tell it which
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

## Holding threads

```bash
machine tasks app hold 56         # take thread 56 off the run queue
machine tasks app release 56      # put it back
machine tasks app yield 56        # let its peers go first
machine tasks app slice 56 10us   # how long it runs between decisions
```

Each of these takes effect at the next scheduling decision. If you hold the
last thread that could run, there is no next decision coming, so force one
with `machine irq app preempt --vcpu all`.

There is also `pin`, which places a thread on the vCPUs you choose the next
time it wakes. Run `machine tasks pin --help` to see how to name them.

Two more things you can ask of `tasks`. `machine tasks app exits` lists the
tasks that have left and how each one ended, and `machine tasks app cgroups`
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
many instructions to run, or what to do with the scheduler. `machine plan
--help` lists all of them.

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

Time inside the guest is Machine's, not the host's. `machine vtime app rate`
changes how fast it passes, and `machine vtime app add` pushes it forward
without running anything.

```bash
machine vtime app add 5000000000    # five seconds, in nanoseconds
```

There is no way back. The guest's clock only goes forward, so to return to an
earlier time, branch there with `machine go app 1.5s`.
