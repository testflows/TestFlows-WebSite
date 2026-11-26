<!-- agents: TestFlows, a blog post. Index: https://testflows.com/llms.txt -->

# Is It Really Fixed? Confirming a JuiceFS Fix in a Deterministic Hypervisor

Published 2026-11-25 by Vitaliy Zakaznikov.

Back in August, JuiceFS 1.3.1 silently corrupted data in our cloud, and unfortunately we had to stop using it. A few weeks later, after we switched to a different storage solution, someone reported a bug upstream that looked a lot like ours, and the fix shipped in JuiceFS 1.3.4 and 1.4.2. That left us with two questions. Was it really our bug? And is it really fixed? This post is about how we answered both by combining our AI coding agent and [TestFlows Machine](/machine.md) to reproduce the corruption on the version we had used, replay it exactly, and then run the same test against the fixed release with added fault injection.<!-- more -->

> Note: the bug affects only volumes formatted with zstd compression (`juicefs format --compress zstd`), which is not the default, and files written in many small appends. A volume formatted with the default, no compression, was never affected.

## What happened

We used JuiceFS to store our runs and disk images. One day, a ClickHouse server inside a machine refused to start because its own integrity check failed. The uploaded binary was not the binary we had pushed. Its size was right, but some of the bytes in the middle were wrong.

Chasing it down with our coding agent took a while, and a pattern slowly emerged. The data was compressible, the volume used zstd, and the file had been written in many small appends, the way a slow network transfer writes it. Writing the same bytes in one pass was always clean. Incompressible data was always clean too. Worst of all, the local cache hid the problem. A freshly written file read back fine, and the damage only showed up once its blocks were fetched again from the object store.

There was no fix to wait for, so we stopped using JuiceFS the same day and had to switch.

## The upstream fix

About three weeks later, on September 20, `stevapple` opened issue [juicefs#7555](https://github.com/juicedata/juicefs/issues/7555), titled "zstd decompression writes past the requested output and corrupts neighboring slices in the same read buffer". Reading it felt like reading our own notes.

When JuiceFS reads a chunk, it fetches the chunk's slices concurrently into one shared buffer. The zstd library it uses, however, decompresses up to the capacity of the buffer it is given rather than its length, and it uses the spare room after the output as scratch space for a block's literals. As a result, decompressing one slice can overwrite the bytes of the slice next to it, and whether that happens depends on which goroutine finishes first. A file written in one pass has a single slice per chunk, with nothing next to it to overwrite, which explains why our bulk writes were always clean. It also means the objects in the object store were correct the whole time. Only the read was wrong.

The fix, [juicefs#7556](https://github.com/juicedata/juicefs/pull/7556), was merged the next day and shipped in JuiceFS 1.3.4 and 1.4.2 on October 22. We had been running 1.3.1.

Every symptom we had written down matched. Still, a matching description is not proof. We wanted to see 1.3.1 fail and 1.4.2 pass for ourselves.

## The test

We asked our coding agent to build the smallest setup that writes data the way our store did and checks it the way we had. The result is a Docker Compose project with three services:

- `redis`, which holds the JuiceFS metadata,
- `rustfs`, a [RustFS](https://rustfs.com) server acting as the S3 object store,
- `jfs`, a JuiceFS client built from a release tag, which formats a volume with zstd and runs the test.

The test writes 64 MiB of compressible data into a file through a single open file descriptor. The writes result in appends of random sizes between 13 KiB and 1 MiB, with a `sync` after each one, so every chunk of the file ends up made of many slices. It then unmounts the volume and mounts it again, read-only and with an empty cache, so that every block has to be fetched from RustFS and decompressed. Finally, it reads the file back in 4 MiB reads and compares its hash with the original. The test repeats this for several rounds and prints one line per round.

Two details turned out to matter. First, the data has to be compressible but full of literals, like the data in the issue's own test. Random data is stored almost as is and never reaches the broken code. Second, the appends have to be irregular. Our first version used 256 KiB appends, which made every slice end exactly on a zstd block boundary, and 1.3.1 came back clean every single time.

## Reproducing it on 1.3.1

Before involving our deterministic machine at all, we ran the test against 1.3.1 on a regular host. One round out of six came back corrupt, while the other five were clean. That is what you would expect from a bug that depends on goroutine timing.

Running the same project in a machine took one extra step. The machine's kernel did not have FUSE (now it has it), which a JuiceFS mount needs, so we added it. After that, it was a matter of creating a session, building a disk from the Compose project, and running it until the test printed its verdict:

```
$ machine sessions create jfs --cpus 4 --mem 8G
$ machine disks build --compose . jfs131
$ machine create jfs131 --disk jfs131 --cpus 2 --mem 4096
$ machine run jfs131 --until 'console~(done: [0-9]+ of|mount of /. failed|jfs-1 exited)' --within 20m
```

The run took 103 seconds of machine time. Inside the machine, the corruption showed up even more often than on the host, in four rounds out of five:

```
$ machine output jfs131 -n : | grep -E "round|done"
jfs | jfs | round 1: clean (48 slice rows)
jfs | jfs | round 2: CORRUPT sha 062fafd058ade5ed != 599049e5570df6de, first byte 46428229, 57841 bytes differ (56 slice rows)
jfs | jfs | round 3: CORRUPT sha 44c92a8033f63d3f != 599049e5570df6de, first byte 50112720, 51899 bytes differ (46 slice rows)
jfs | jfs | round 4: CORRUPT sha 31953d6bf4126d97 != 599049e5570df6de, first byte 46130511, 6507 bytes differ (64 slice rows)
jfs | jfs | round 5: CORRUPT sha 57e6c73d3af2f1cd != 599049e5570df6de, first byte 47054881, 57712 bytes differ (57 slice rows)
jfs | jfs | done: 4 of 5 rounds corrupt
```

Each corrupt round names the hash it got, the first byte that differs from the original, and how many bytes changed. In particular, round 2 showed that its file got corrupted at byte 46,428,229, and 57,841 of its bytes were affected.

## Replaying the corruption

Timing bugs are the hardest kind to pin down. Run the test again, and it corrupts different bytes, if it corrupts anything at all. In a machine, though, the run is recorded, so instead of running the test again, we forked the run at its first checkpoint and replayed it:

```
$ machine fork jfs131 --at 1 --name jfs131-again
✔ Forked jfs131/jfs131-again (wiijUfnvMWQgnxkDLjaCQ)
  From checkpoint 1 of jfs131, nothing replayed
$ machine replay jfs131-again
  Replaying segment 1/1 from jfs131 (wiiiaaImnHJiBU1CLifok) to the end
✔ Replayed 1962564 entries to entry 1962565. Converged.
```

All 1,962,564 entries converged, and in our specific run, the replay took about 50 seconds of real time. As one would expect from a deterministic machine, the replayed test reached exactly the same verdict, down to the byte:

```
$ machine output jfs131-again -n : | grep -E "round|done"
jfs | jfs | round 1: clean (48 slice rows)
jfs | jfs | round 2: CORRUPT sha 062fafd058ade5ed != 599049e5570df6de, first byte 46428229, 57841 bytes differ (56 slice rows)
jfs | jfs | round 3: CORRUPT sha 44c92a8033f63d3f != 599049e5570df6de, first byte 50112720, 51899 bytes differ (46 slice rows)
jfs | jfs | round 4: CORRUPT sha 31953d6bf4126d97 != 599049e5570df6de, first byte 46130511, 6507 bytes differ (64 slice rows)
jfs | jfs | round 5: CORRUPT sha 57e6c73d3af2f1cd != 599049e5570df6de, first byte 47054881, 57712 bytes differ (57 slice rows)
jfs | jfs | done: 4 of 5 rounds corrupt
```

Round 2 went wrong at byte 46,428,229 again, with the same 57,841 bytes changed, and so did every other round. The rest of the output matched too, every line of it:

```
$ diff <(machine output jfs131 -n :) <(machine output jfs131-again -n :) && echo identical
identical
```

Matching output is a good sign, but the console only shows what the programs chose to print. So we also compared the state of the machines themselves. `machine hash` hashes a machine's memory, its disk, every device and every vCPU. We ran it on the replay, then on the original, both stopped at the same entry:

```
$ machine hash jfs131-again
Entry 1962565
mem          0xb7439284308266a6
disk         0xd25fd82248763171
...
vCPU 0
  state        0x88896d997d38f4be
  regs_hash    0x6161187886c321be
...
$ machine hash jfs131
Entry 1962565
mem          0xb7439284308266a6
disk         0xd25fd82248763171
...
vCPU 0
  state        0x88896d997d38f4be
  regs_hash    0x6161187886c321be
...
```

All 33 hashes matched: memory, disk, nine devices, and eleven parts of each of the two vCPUs, from their registers to their timers. In other words, the replay did not just print the same lines. It arrived at the very same machine state, with the same corrupted reads in its memory. That means the corruption is now something we can come back to as often as we like, for example to stop in the read path at the very moment one slice overwrites another.

## Confirming the fix on 1.4.2

With the bug pinned down on 1.3.1, we built 1.4.2 from its release tag and ran the same test. In the machine, all 12 rounds now came back clean, just as they did on the host:

```
$ machine output jfs142 -n : | grep -E "juicefs version|round|done"
jfs | jfs | juicefs version 1.4.2+unknown, volume formatted
jfs | jfs | round 1: clean (59 slice rows)
jfs | jfs | round 2: clean (55 slice rows)
...
jfs | jfs | round 12: clean (59 slice rows)
jfs | jfs | done: 0 of 12 rounds corrupt
```

## Pushing on the fix

A clean run only shows that the fix holds on the paths the test happened to take. The old bug depended on which goroutine finished first, so a solid fix has to hold no matter what order things happen in. That is something we can push on in a machine, by injecting faults that shuffle the timing in exactly the place the fix protects.

We ran both versions up to the moment the volume was formatted and took a checkpoint there. From that checkpoint, we forked one branch per experiment, applied one fault to it, and ran it to the test's verdict:

```
$ machine fork f142 --at formatted --name f142-jitter
$ machine net f142-jitter delay jfs 20ms --jitter 15ms --to rustfs
✔ Set the link of compose-jfs-1 (jfs) to compose-rustfs-1: delay 20ms jitter 15ms, seed 1882325056
$ machine run f142-jitter --until 'console~(done: [0-9]+ of|mount of /. failed)' --within 40m
```

We tried six variations, each aimed at a different part of the read path:

- **none**, a plain fork as the control,
- **jitter**, 20 ms ± 15 ms on the link from the client to RustFS, so slices arrive in a random order,
- **loss**, 2% of the packets on that link dropped, so some fetches take much longer than others,
- **throttle**, the client limited to 0.3 of a CPU, so its goroutines are starved and overlap,
- **memory**, the client limited to 512 MB,
- **sched**, interrupts delayed by up to 2 ms and timers by up to 20 ms, which changes how goroutines interleave on the vCPUs.

On 1.3.1, the faults made the bug easier to hit, not harder. Jitter was the most effective: all five rounds came back corrupt, with 412,456 to 813,387 bytes wrong in each, up to fourteen times the damage of the worst round without faults. The other faults corrupted two or three rounds out of five. On 1.4.2, every experiment came back clean, all 72 rounds of them.

### Making sure the faults were real

A fault that silently fails to apply would make a clean result meaningless, so we wanted to confirm that each one was applied. The obvious way to get it, looking inside the machine while the test runs, has a catch: every look runs commands in the machine, and that changes the very run we are trying to measure.

Each experiment's recording has checkpoints of its own, so we forked a branch at one of them, about 47 seconds into the test, and inspected the branch instead. The branch starts from the exact state of the experiment at that exact moment, and whatever we do there never reaches the original recording. For example, here is our jitter experiment on 1.4.2:

```
$ machine fork f142-jitter --at 509519 --name f142-jitter-look
✔ Forked f142/f142-jitter-look (wiiokgTpG3M3CsA82hzwl)
  From checkpoint 509519 of f142/f142-jitter, nothing replayed
$ machine net f142-jitter-look
SERVICE  CONTAINER      TO                MATCH  FAULTS                  SEED        SENT   DROPPED  QUEUED
jfs      compose-jfs-1  compose-rustfs-1  -      delay 20ms jitter 15ms  1882325056  13170  0        7
```

We can see that by that point, 13,170 packets had gone through the delay, and seven were still waiting in the queue. The other faults had the following traces:

| Fault | Evidence on 1.4.2, at about 47 seconds |
|---|---|
| loss | 3,349 packets sent, 76 dropped |
| throttle | the client's cgroup was throttled in 387 of 393 periods, 39 seconds in total |
| sched | an interrupt was being held at that very instant, an IPI to vCPU 1 due in 683 µs |
| memory | the 512 MB limit was set, but the client peaked at 430 MB and never reached it |

Out of all of them, the memory experiment turned out to be the weak one: the limit was there, but it never pushed the client. Every other fault clearly did its job. The same faults gave us the same evidence on both versions: 1.3.1 broke under them, and 1.4.2 did not.

As a final check, we ran the regression test that came with the fix against both versions. On 1.3.1, it failed with `zstd at offset 0: wrote 74712 bytes after the requested output`. On 1.4.2, it passed as expected.

## Why should you care?

When an upstream project fixes a bug, the fix lives in their tests and their release notes. However, for a production system, the confidence has to be ours, especially for a bug that once cost us data. The best part is that a test like this one is small enough for most AI coding agents to write quite fast. And when the AI coding agent has access to a deterministic machine, a failure is more than a red line in a log. It becomes a recording you and your AI coding agent can replay exactly. The last property is hard to get and now it is available to everyone.

The whole test is in our public repository, in [examples/compose/juicefs](https://github.com/testflows/Machine/tree/main/examples/compose/juicefs), so you can run it yourself against any JuiceFS version.

[Sign up](/machine/portal/signup/) for free today and combine the power of your AI with our deterministic machine.
