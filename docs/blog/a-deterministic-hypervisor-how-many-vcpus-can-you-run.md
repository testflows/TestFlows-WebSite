<!-- agents: TestFlows, a blog post. Index: https://testflows.com/llms.txt -->

# A Deterministic Hypervisor: How Many vCPUs Can You Run?

Published 2026-11-27 by Vitaliy Zakaznikov.

Production software rarely runs on a single CPU. A database sizes its thread pools by the number of CPUs it finds, the Linux kernel keeps per-CPU queues and caches, and locks behave differently when two CPUs contend for them. Software tested on one CPU is tested on a configuration it will probably never run on. That is why we made [TestFlows Machine](/machine.md) able to have many vCPUs, so that Linux and the software under test see a multi-CPU server just like the one they run on in production, while keeping every run deterministic. So how many vCPUs can you run? Spoiler: up to 64 in one machine. In this post we show what that looks like and what it costs.<!-- more -->

## Session CPUs vs machine vCPUs

We'll start by clarifying one point of possible confusion. What is a session CPU vs a machine CPU? This will be one of the first questions you will ask. This is because before you can run anything you need a session (an allocated compute resource) and a run. To create each, the corresponding commands [machine sessions create](/docs/machine/commands.md#machine-sessions-create) and [machine create](/docs/machine/commands.md#machine-create) both take an option called `--cpus`, but they mean different things.

`machine sessions create --cpus N` sets how many host CPUs the session reserves. They are shared by every run in the session, and each running machine is placed on one of them. A session's CPUs therefore decide how many machines can run at the same time and determine the billing price per hour of the session.

`machine create --cpus N` sets how many vCPUs one machine has, which is to say how many CPUs its Linux sees, and it does not depend on the session's size. So a session with one CPU can run a machine with anywhere from 1 to 64 vCPUs with the max limit being 64 per machine.

| | `machine sessions create --cpus N` | `machine create --cpus N` |
|---|---|---|
| Sets | Host CPUs reserved for the session | vCPUs of one machine |
| Decides | How many machines run at the same time | How many CPUs the machine's Linux sees |
| Limit | The plan and the session's class | 64 |

## Maintaining determinism with multiple vCPUs

On a real server the hardware CPUs run at the same time, and the order in which they reach shared memory changes from one run to the next. That order is exactly what a deterministic hypervisor has to control as it is one source of non-determinism in the hardware. Machine therefore serializes the execution of its vCPUs, one at a time, in a fixed order: each vCPU runs one dispatch (a stretch of execution at full speed), and then the next vCPU takes its turn. Now because only one vCPU runs at any moment, every read and write of shared memory happens in an order the recording fixes, and an interrupt one vCPU sends to another arrives at a fixed point during the run. This gives the hypervisor control over the interleaving of the vCPUs and produces runs that can be replayed exactly.

The vCPUs would run serialized even if each had a host CPU of its own. As a result a machine with more vCPUs takes longer to run in real time, and a bigger session does not make it faster. What a bigger session gives is more machines running at once, such as a recording and its replay or enabling several branches to be explored side by side.

However, Linux still sees all its vCPUs as separate CPUs. It schedules threads on all of them, sends interrupts between them and keeps its per-CPU data. Most importantly, the software under test sees a multi-CPU server.

## Example: A machine with 16 vCPUs

To show this in practice, we created a session with a single CPU:

```
$ machine sessions create blog-determinism
$ machine sessions
NAME              SESSION           STATE      CPUS  MEM       DISK       CLASS        ARCH     ₡/HOUR  DURATION  IDLE   COST
blog-determinism  30316b373adb4a63  connected  1     1536M/2G  12.3G/16G  standard-ip  intel-1   ₡0.15  56m2s     6s    ₡0.14  (current)
```

Then we built a disk from the standard `ubuntu:24.04` Docker image that just prints how many CPUs the machine has and lists them from `/proc/cpuinfo` and created a machine with 16 vCPUs to run it as follows:

```
$ machine disks build --from ubuntu:24.04 --entrypoint /bin/sh hello-cpus -- -c 'echo "Hello from TestFlows Machine!"; echo "CPUs: $(nproc)"; grep -E "^(processor|model name)" /proc/cpuinfo'
$ machine create cpus16 --disk hello-cpus --cpus 16 --mem 512
$ machine run cpus16 --until halted --within 10m
```

The kernel brought up all 16 CPUs while it booted:

```
smp: Bringing up secondary CPUs ...
smp: Brought up 1 node, 16 CPUs
smpboot: Total of 16 processors activated (31997.85 BogoMIPS)
```

And the program in the container found all of them:

```
$ machine output cpus16 --source /output/keep/app/console -n :
ENTRIES           SOURCE                    LINE      OUTPUT
511483            /output/keep/app/console  1         Hello from TestFlows Machine!
511644            /output/keep/app/console  2         CPUs: 16
511764            /output/keep/app/console  3         processor	: 0
511833            /output/keep/app/console  4         model name	: TestFlows Machine v1
511901            /output/keep/app/console  5         processor	: 1
511969            /output/keep/app/console  6         model name	: TestFlows Machine v1
...
514486            /output/keep/app/console  33        processor	: 15
514573            /output/keep/app/console  34        model name	: TestFlows Machine v1
```

This run took 13.430 seconds of machine time and created 563,130 entries in our run log.

## Replaying 16 vCPUs

To show replay, we forked the run at its first checkpoint and replayed it to its end:

```
$ machine fork cpus16 --from 1 --name cpus16-replay
✔ Forked cpus16/cpus16-replay (wijSOH2JK0wdeMAikMKoL)
  From checkpoint 1 of cpus16, replayed to entry 563130
$ diff <(machine output cpus16 --source all -n :) <(machine output cpus16-replay --source all -n :) && echo identical
identical
```

Here the replay took about 17.4 seconds of real time. Its output is identical to the original on every source, and `machine hash` gave the same 187 hashes on both machines at entry 563130: the memory, the disk, the devices, the held interrupts and all the parts covering the state of each of the 16 vCPUs.

## Comparing boot time from 1 to 64 vCPUs

To demonstrate what adding more vCPUs costs we booted the same disk with 1, 2, 4, 8, 16, 32 and 64 vCPUs and 512 MB of memory. We used the [`hello-random`](https://github.com/testflows/Machine/tree/main/examples/hello-random) disk, which prints a greeting and 256 random bytes from `/dev/random`.

> Note: because it was not the same `hello-cpus` disk, the 16-vCPU data row below differs from the 13.430 seconds above.

The machines ran one after another in the same one-CPU session, each until it powered off. To keep it simple each count was recorded just once. We recorded the machine time, which is the time the machine's own clock measured, and the real time to show how long `machine run` took to return to us in our runs.

| vCPUs | Machine time | Real time |
|---|---|---|
| 1 | 4.92 s | 4.9 s |
| 2 | 5.50 s | 7.9 s |
| 4 | 10.36 s | 12.1 s |
| 8 | 9.41 s | 14.8 s |
| 16 | 11.73 s | 20.2 s |
| 32 | 17.41 s | 29.3 s |
| 64 | 20.10 s | 44.5 s |

As we can see the real time grows with the number of vCPUs, from 4.9 seconds for one to 44.5 seconds for 64, because the vCPUs take turns. Machine time grows too but not in step with the count. For example, the machine with 4 vCPUs took 10.36 seconds and the one with 8 took 9.41.

With a different number of CPUs the kernel does different work and therefore waits on different timers. Also, because the runs were recorded on a class that records repeatable runs by default, an earlier recording of the same disk with 32 vCPUs took exactly 17.410739710 seconds of machine time, the same as the one in the table to the nanosecond.

## Replaying 64 vCPUs

To check the largest machine too, we replayed the 64-vCPU run from the table the same way:

```
$ machine fork cpus-64 --from 1 --name cpus-64-replay
✔ Forked cpus-64/cpus-64-replay (wikDAFSjfkQ5bqqLHJFSw)
  From checkpoint 1 of cpus-64, replayed to entry 2633386
$ diff <(machine output cpus-64 --source all -n :) <(machine output cpus-64-replay --source all -n :) && echo identical
identical
```

In our run, the replay took about 57 seconds of real time. Its output is identical to the original on every source, and `machine hash` gave the same 715 hashes on both machines at entry 2633386: the memory, the disk, the devices, the held interrupts and the 11 parts of the state of each of the 64 vCPUs.

## Conclusion

Testing real programs benefits when the deterministic hypervisor supports multiple vCPUs. With TestFlows Machine, you can create machines with up to 64 vCPUs in a session of any size. This means that Linux and your software under test see a multi-CPU server. And while you can run with 1 or 64 vCPUs you can expect each run to replay exactly.

Give it a try. [Sign up](/machine/portal/signup/) for free and try it with as many vCPUs as your software expects.
