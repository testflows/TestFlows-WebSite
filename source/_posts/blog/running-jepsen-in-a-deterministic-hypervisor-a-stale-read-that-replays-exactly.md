---
post: true
title: "Running Jepsen in a Deterministic Hypervisor: A Stale Read That Replays Exactly"
seo_title: "Running Jepsen in a Deterministic Hypervisor: A Stale Read That Replays"
description: We ran an unmodified Jepsen test of etcd inside TestFlows Machine, made it catch stale reads under a partition, and replayed the failing history exactly.
date: 2026-11-24
author: Vitaliy Zakaznikov
keywords: Jepsen, etcd, deterministic simulation testing, DST, linearizability, network partition, stale reads, record and replay, deterministic hypervisor
image: images/running-jepsen-in-a-deterministic-hypervisor.png
social_image: images/running-jepsen-in-a-deterministic-hypervisor-card.jpg
social_image_width: 2400
social_image_height: 1254
icon: fas fa-glasses pt-5 pb-5
---

[Jepsen](https://jepsen.io) is a well-known framework used for finding bugs in distributed databases, and its approach is simple to describe. A control node drives a cluster over SSH, runs operations against it while a nemesis partitions the network, kills processes or skews clocks, and then a checker decides whether the history it recorded could have happened on a correct system. What Jepsen doesn't promise is that a failure it finds will happen again, because the cluster runs on real machines with real scheduling and real timing, so the next run takes a different path. We wanted to see what happens when the whole Jepsen setup runs inside a deterministic hypervisor, and whether a failure it catches can be replayed exactly.<!-- more -->

## The setup

Our example is a single Docker Compose project with three etcd nodes and a Jepsen control node, which [TestFlows Machine](/machine/) turns into a disk and boots. The test itself is the classic one, the same shape as Jepsen's own etcd tutorial: a compare-and-set register, clients that read, write and compare-and-set it through etcd's HTTP gateway, and `partition-random-halves`, which cuts the nodes into two groups with iptables for 5 seconds out of every 10. At the end, the linearizability checker looks for any order of the operations that a single register could have produced.

Neither Jepsen nor etcd required any changes to run on the machine. Since the machine has no external network access, etcd, the Jepsen test, and all its dependencies are baked into the container images.

At the time of our initial runs, the machine's kernel only supported legacy iptables, so we used `iptables-legacy` on the nodes. The kernel now supports nftables as well, and the updated example uses Debian's default iptables with the nftables backend, while retaining the option to build the nodes with `iptables-legacy`. The logs in this example are from the new runs with nftables.

The rest came down to the usual small things missing from fresh containers, such as `git` and `scp` on the control node and `killall` on the nodes, which we discovered together with our coding agent, one crash at a time.

The complete example is available in our public repository at [examples/compose/jepsen-etcd](https://github.com/testflows/Machine/tree/main/examples/compose/jepsen-etcd).

## Running it

The machine has 2 vCPUs and 4G of memory, so it needs a bigger session. We used 4 vCPUs and 8G of memory. Once the two images are built, as the [README](https://github.com/testflows/Machine/tree/main/examples/compose/jepsen-etcd) shows, we built the disk from the example's directory, created a run, and ran it until Jepsen printed a verdict:

```
$ machine sessions create jepsen --cpus 4 --mem 8G
$ machine disks build --compose . jepsen
$ machine create jepsen --disk jepsen --cpus 2 --mem 4096
$ machine run jepsen --until 'console~(Everything looks good|Analysis invalid|Jepsen broke)' --within 10m
$ machine output jepsen -n : | grep -E ':linear \{|:valid\? (true|false)\}|Everything looks good|Analysis invalid'
control |  :linear {:valid? true,
control |  :valid? true}
control | Everything looks good! ヽ(‘ー`)ノ
```

That run took 186 seconds of machine time and 188 seconds of real time, with three partitions along the way, and Jepsen found no linearizability violations through any of them, which is what you'd expect from etcd with its default linearizable reads. The full log, with every operation, is in [logs/pass.log](https://github.com/testflows/Machine/blob/4f7550f/examples/compose/jepsen-etcd/logs/pass.log).

## Making it fail

A test that only passes doesn't show much, so we needed a way to force a failure for Jepsen to catch. etcd gives us one if we ask for it. A serializable read is answered by the node from its own copy, without going through the leader, which is faster but means a node that is behind can answer with an old value. That is documented etcd behavior, not a defect, and it is not linearizable, so Jepsen should catch it. The example has a [stale-reads.patch](https://github.com/testflows/Machine/blob/main/examples/compose/jepsen-etcd/stale-reads.patch) that turns those reads on, and with it applied, the run ends very differently:

```
$ git apply stale-reads.patch
$ machine disks build --compose . jepsen-stale
$ machine create jepsen-stale --disk jepsen-stale --cpus 2 --mem 4096
$ machine run jepsen-stale --until 'console~(Everything looks good|Analysis invalid|Jepsen broke)' --within 10m
$ machine output jepsen-stale -n : | grep -E ':linear \{|:valid\? (true|false)\}|Everything looks good|Analysis invalid'
control |  :linear {:valid? false,
control |  :valid? false}
control | Analysis invalid! (ﾉಥ益ಥ）ﾉ ┻━┻
```

Right after a partition started, a write of 0 completed, and the very next read, invoked 10 ms later, came back with 1, the value the write had just replaced:

```
control | INFO [2026-03-01 00:02:11,247] jepsen worker 2 - jepsen.print 2	:ok	:write	0
control | INFO [2026-03-01 00:02:11,257] jepsen worker 1 - jepsen.print 1	:invoke	:read	nil
control | INFO [2026-03-01 00:02:11,276] jepsen worker 1 - jepsen.print 1	:ok	:read	1
```

No single register can do that, and Jepsen says so. The full log of this run is in [logs/fail.log](https://github.com/testflows/Machine/blob/4f7550f/examples/compose/jepsen-etcd/logs/fail.log).

## Replaying the failure

This is the part we cared about most. On real hardware, you would now have a log of a failure and no way to get the same run back, because the next run partitions at a different moment and the stale read lands somewhere else, if it lands at all. In the machine, the run is recorded, so we forked it at its first checkpoint and replayed it:

```
$ machine fork jepsen-stale --at 1 --name jepsen-stale-replay
✔ Forked jepsen-stale/jepsen-stale-replay
  From checkpoint 1 of jepsen-stale, nothing replayed
$ machine replay jepsen-stale-replay
✔ Replayed 460379 entries to entry 460380. Converged.
$ diff <(machine output jepsen-stale -n :) <(machine output jepsen-stale-replay -n :) && echo identical
identical
```

All 460,379 entries converged, and the output of the replay is identical to the original, line for line, including every timestamp, every value, the stale read and the verdict. So the failing history is there to come back to as many times as you need, to put a breakpoint in etcd at the moment that read is served, or to fork just before the partition and try something else.

The replay was also a lot faster than the run it replayed:

{% html div class="styled-table results" %}

| Run | Machine time | Recorded in | Replayed in |
|---|---|---|---|
| Passing | 186 s | 188 s | 33 s |
| Failing | 177 s | 180 s | 32 s |

{% endhtml %}

We first thought the difference was the cache, since the original run reads the disk for the first time, so we recorded the passing test again from the same checkpoint with everything warm, and it took as long as the first time. The difference is the cost of recording, and replaying a recorded run is more than five times faster than recording it.

## What's next

Jepsen does its own fault injection, from inside the nodes, with iptables over SSH. Machine can also inject faults from outside, into the network, the clocks and the disks, with no changes to the nodes at all, and those faults are recorded in the run like everything else. That part is still experimental, and it's what we want to try with Jepsen next.

If you work on a distributed system and have a Jepsen test of your own, we'd love to hear how it does in a machine, and the example is a good place to start. [Sign up](/machine/portal/signup/), and for the bigger session it needs, just ping us at [contact@testflows.com](mailto:contact@testflows.com). Happy distributed database testing!
