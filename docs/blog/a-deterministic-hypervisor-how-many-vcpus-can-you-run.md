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

<figure class="post-figure">
<svg viewBox="0 0 760 340" role="img" aria-labelledby="vt-title vt-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="vt-title">Machine time and real time of a boot, from 1 to 64 vCPUs</title>
<desc id="vt-desc">Grouped bars for 1, 2, 4, 8, 16, 32 and 64 vCPUs. Machine time: 4.92 s, 5.50 s, 10.36 s, 9.41 s, 11.73 s, 17.41 s, 20.10 s. Real time in our runs: 4.9 s, 7.9 s, 12.1 s, 14.8 s, 20.2 s, 29.3 s, 44.5 s.</desc>
<style>.vt-m{fill:#257de0}.vt-r{fill:#f47230}[data-theme="dark"] .vt-m{fill:#338ced}[data-theme="dark"] .vt-r{fill:#e76624}.vt-g{stroke:currentColor;stroke-opacity:.12;stroke-width:1}.vt-b{stroke:currentColor;stroke-opacity:.45;stroke-width:1}.vt-t{fill:currentColor;fill-opacity:.65;font-size:13px}.vt-l{fill:currentColor;font-size:13px}.vt-v{fill:currentColor;font-size:12px;font-weight:600}.vt-m:hover,.vt-r:hover{opacity:.8}</style>
<text class="vt-t" x="52" y="294.0" text-anchor="end">0 s</text>
<line class="vt-g" x1="60" x2="740" y1="244.0" y2="244.0"/>
<text class="vt-t" x="52" y="248.0" text-anchor="end">10 s</text>
<line class="vt-g" x1="60" x2="740" y1="198.0" y2="198.0"/>
<text class="vt-t" x="52" y="202.0" text-anchor="end">20 s</text>
<line class="vt-g" x1="60" x2="740" y1="152.0" y2="152.0"/>
<text class="vt-t" x="52" y="156.0" text-anchor="end">30 s</text>
<line class="vt-g" x1="60" x2="740" y1="106.0" y2="106.0"/>
<text class="vt-t" x="52" y="110.0" text-anchor="end">40 s</text>
<line class="vt-g" x1="60" x2="740" y1="60.0" y2="60.0"/>
<text class="vt-t" x="52" y="64.0" text-anchor="end">50 s</text>
<line class="vt-b" x1="60" x2="740" y1="290" y2="290"/>
<path class="vt-m" d="M77.6,290 V271.4 Q77.6,267.4 81.6,267.4 H103.6 Q107.6,267.4 107.6,271.4 V290 Z"><title>1 vCPU: 4.92 s of machine time</title></path>
<path class="vt-r" d="M109.6,290 V271.5 Q109.6,267.5 113.6,267.5 H135.6 Q139.6,267.5 139.6,271.5 V290 Z"><title>1 vCPU: 4.9 s of real time</title></path>
<text class="vt-t" x="108.6" y="310" text-anchor="middle">1</text>
<path class="vt-m" d="M174.7,290 V268.7 Q174.7,264.7 178.7,264.7 H200.7 Q204.7,264.7 204.7,268.7 V290 Z"><title>2 vCPUs: 5.50 s of machine time</title></path>
<path class="vt-r" d="M206.7,290 V257.7 Q206.7,253.7 210.7,253.7 H232.7 Q236.7,253.7 236.7,257.7 V290 Z"><title>2 vCPUs: 7.9 s of real time</title></path>
<text class="vt-t" x="205.7" y="310" text-anchor="middle">2</text>
<path class="vt-m" d="M271.9,290 V246.3 Q271.9,242.3 275.9,242.3 H297.9 Q301.9,242.3 301.9,246.3 V290 Z"><title>4 vCPUs: 10.36 s of machine time</title></path>
<path class="vt-r" d="M303.9,290 V238.3 Q303.9,234.3 307.9,234.3 H329.9 Q333.9,234.3 333.9,238.3 V290 Z"><title>4 vCPUs: 12.1 s of real time</title></path>
<text class="vt-t" x="302.9" y="310" text-anchor="middle">4</text>
<path class="vt-m" d="M369.0,290 V250.7 Q369.0,246.7 373.0,246.7 H395.0 Q399.0,246.7 399.0,250.7 V290 Z"><title>8 vCPUs: 9.41 s of machine time</title></path>
<path class="vt-r" d="M401.0,290 V225.9 Q401.0,221.9 405.0,221.9 H427.0 Q431.0,221.9 431.0,225.9 V290 Z"><title>8 vCPUs: 14.8 s of real time</title></path>
<text class="vt-t" x="400.0" y="310" text-anchor="middle">8</text>
<path class="vt-m" d="M466.1,290 V240.0 Q466.1,236.0 470.1,236.0 H492.1 Q496.1,236.0 496.1,240.0 V290 Z"><title>16 vCPUs: 11.73 s of machine time</title></path>
<path class="vt-r" d="M498.1,290 V201.1 Q498.1,197.1 502.1,197.1 H524.1 Q528.1,197.1 528.1,201.1 V290 Z"><title>16 vCPUs: 20.2 s of real time</title></path>
<text class="vt-t" x="497.1" y="310" text-anchor="middle">16</text>
<path class="vt-m" d="M563.3,290 V213.9 Q563.3,209.9 567.3,209.9 H589.3 Q593.3,209.9 593.3,213.9 V290 Z"><title>32 vCPUs: 17.41 s of machine time</title></path>
<path class="vt-r" d="M595.3,290 V159.2 Q595.3,155.2 599.3,155.2 H621.3 Q625.3,155.2 625.3,159.2 V290 Z"><title>32 vCPUs: 29.3 s of real time</title></path>
<text class="vt-t" x="594.3" y="310" text-anchor="middle">32</text>
<path class="vt-m" d="M660.4,290 V201.5 Q660.4,197.5 664.4,197.5 H686.4 Q690.4,197.5 690.4,201.5 V290 Z"><title>64 vCPUs: 20.10 s of machine time</title></path>
<path class="vt-r" d="M692.4,290 V89.3 Q692.4,85.3 696.4,85.3 H718.4 Q722.4,85.3 722.4,89.3 V290 Z"><title>64 vCPUs: 44.5 s of real time</title></path>
<text class="vt-t" x="691.4" y="310" text-anchor="middle">64</text>
<text class="vt-v" x="675.4" y="191.5" text-anchor="middle">20.1 s</text>
<text class="vt-v" x="707.4" y="79.3" text-anchor="middle">44.5 s</text>
<text class="vt-t" x="400.0" y="332" text-anchor="middle">vCPUs</text>
<rect class="vt-m" x="60" y="18" width="14" height="14" rx="3"/><text class="vt-l" x="80" y="30">Machine time</text>
<rect class="vt-r" x="200" y="18" width="14" height="14" rx="3"/><text class="vt-l" x="220" y="30">Real time, in our runs</text>
</svg>
<figcaption>Real time grows with the number of vCPUs, because they take turns. Machine time grows much less.</figcaption>
</figure>

As we can see the real time grows with the number of vCPUs, from 4.9 seconds for one to 44.5 seconds for 64, because the vCPUs take turns. Machine time grows too but not in step with the count. For example, the machine with 4 vCPUs took 10.36 seconds and the one with 8 took 9.41.

With a different number of CPUs the kernel does different work and therefore waits on different timers. Also, because the runs were recorded on a class that records repeatable runs by default, an earlier recording of the same disk with 32 vCPUs took exactly 17.410739710 seconds of machine time, the same as the one in the table to the nanosecond.

## Replaying all 64 vCPUs

Booting with 64 vCPUs costs real time, but, you might still wonder, does it still replay exactly? Earlier we showed that we replayed the machine with 16 vCPUs, so to be sure, here we also replayed the largest machine from the table, the one with 64 vCPUs, the same way:

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
