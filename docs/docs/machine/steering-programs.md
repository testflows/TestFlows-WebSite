<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Steering programs

By default the machine schedules itself, and sometimes that isn't what you
want. A bug that needs one thread to run past another will not show up if the
scheduler never picks that order, so Machine lets you pick it.

Everything on this page is recorded, so a replay repeats it exactly.

## Looking at tasks

```bash
machine tasks app
```

`machine tasks app` lists the tasks in the machine, one row per thread, with
the process each one belongs to. The commands below take a thread's id or a
program's path. [`machine syscalls app`](commands.md#machine-syscalls) and
[`machine ints app`](commands.md#machine-ints) list the kernel's system calls
and interrupt vectors.

## Focus

Machine matches a program by its absolute path in the machine. Use
`machine focus` to tell Machine which programs to watch and steer.

```bash
machine focus app add /app
machine run app --until /app:exit
```

You can also focus on a cgroup (`cgroup=/path`) or a single process
(`tgid=12`), and `focus remove` and `focus clear` take them off again.

Once a program is focused, you can wait for things that happen to it. The task
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

Each of these commands takes effect at the next scheduling decision. If you
hold the last thread that could run, no next decision is coming, so force one
with [`machine irq app preempt --vcpu all`](commands.md#machine-irq).

There is also `machine tasks pin`, which places a thread on the vCPUs you
choose the next time the thread wakes. Run
[`machine tasks pin`](commands.md#machine-tasks-pin) `--help` to see how to
name them.

`machine tasks` does two more things.
[`machine tasks app exits`](commands.md#machine-tasks-exits) lists the tasks
that have left and how each one ended, and
[`machine tasks app cgroups`](commands.md#machine-tasks-cgroups) groups the
tasks by cgroup. `--focused` shows only the tasks you are steering.

## Plans

When one rule isn't enough, write a plan file. A plan is a list of clauses,
each of which says when it applies and what to do.

```
when /test:on       mode step,fast   fast=1:100k step=1:200
when /test:kernel   task-sched hold
else                mode fast
```

Machine tries the clauses in order and the last match wins, so a later
clause overrides an earlier one. `else` covers whatever nothing matched.

Each `when` names a state of a program: `/test:on` is the program running its
own code, and `/test:kernel` is the program running in the kernel. After the
state come the things to choose for each stretch of execution the clause
covers, such as the mode, how many instructions to run, or what to do with the
scheduler. [`machine plan`](commands.md#machine-plan) `--help` lists all of
them.

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

Machine time is not the host's time.
[`machine vtime app rate`](commands.md#machine-vtime-rate) changes how fast
machine time passes, and
[`machine vtime app add`](commands.md#machine-vtime-add) pushes it forward
without running anything.

```bash
machine vtime app add 5s
```

There is no way back: the machine's clock only goes forward. To return to an
earlier time, branch there with
[`machine go app 1.5s`](commands.md#machine-go).
