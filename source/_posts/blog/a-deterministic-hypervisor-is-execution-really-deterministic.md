---
post: true
title: "A Deterministic Hypervisor: Is Execution Really Deterministic?"
seo_title: "A Deterministic Hypervisor: Is Execution Really Deterministic?"
description: What a deterministic hypervisor records, why a recording belongs to the CPU it was made on, and how TestFlows Machine confirms that a replay reaches the same state.
date: 2026-11-26
author: Vitaliy Zakaznikov
keywords: deterministic hypervisor, deterministic execution, record and replay, machine state, state hash, CPUID, deterministic simulation testing, DST, TestFlows
image: images/a-deterministic-hypervisor-is-execution-really-deterministic.png
social_image: images/a-deterministic-hypervisor-is-execution-really-deterministic-card.jpg
social_image_width: 2400
social_image_height: 1254
icon: fas fa-glasses pt-5 pb-5
---

When we tell people that a replay in a deterministic hypervisor is the same run, the first question is always the same: really? Bit for bit? It is a fair question, because it is a strong promise. The short answer is that execution is deterministic on a CPU compatible with the one the run was recorded on, and that you don't have to take our word for it, because you can check it yourself. This post explains why a recording belongs to its original CPU, what the state of a machine actually consists of, and how [TestFlows Machine](/machine/) confirms that a replay reaches the same state, using a small example that boots Linux and prints 256 random bytes from `/dev/random`.<!-- more -->

## CPU compatibility

A machine runs on a real processor. To make it fast, the hypervisor does not interpret instructions one by one. Instead, the processor executes them directly, and the hypervisor steps in only at the points where the machine needs something from outside, for example, a timer interrupt, a disk request or a read of the clock. Those points, and what came back at each of them, are what a run log records. Everything in between them is the processor's own work, and that is what makes the recording tied to the processors that do that work exactly the same way.

We can highlight three main reasons that tie a recording to its CPU.

1. The first is what the machine is told about the processor. When Linux boots, it asks the CPU who it is using the CPUID instruction which reads back the vendor, the family, the model, the stepping and the list of CPU features. It then patches its own code to match it. For example, it picks the fastest implementation of a routine for the features it finds, and it applies the workarounds for any errata (known misbehaviors or quirks) that apply to that exact model. This means that two different processors run different instructions from the very same disk and the very same start. Even though we hide some of what the processor reports, such as its brand string and the instructions that produce random numbers in hardware, things like the family, model and features stay as the processor reports them, because hiding them would change what the kernel does.

2. The second is how a position in a run is measured. For example, to stop a replay at exactly the point where the recording took an interrupt, Machine needs a count that advances identically every time the same code runs. It uses the processor's PMC counters for this, together with the instruction pointer and a hash of the registers. How a processor counts, and how far its counter can run past the point it was asked to stop at, is a property of its family. A family that counts differently lands on a different point.

3. The third is the virtualization path itself. For example, AMD and Intel processors provide virtualization through different hardware interfaces, and the hypervisor code that decides where a run can stop therefore differs between them.

For these reasons, every run carries the CPUID table its machine saw, and Machine refuses to start, fork or replay a run in a session whose processor reports a different table. 

> The refusal says "This session's CPU differs from the one the run was recorded on." and suggests starting the run in a session of its class or recording it again.

Making runs portable between families would take a fixed, named CPU model presented to every machine, the way some hypervisors do for live migration with the proof that the counters of the two families agree. But while we can change software, we can't control hardware, so until then, the cost is small: on new hardware, the program must be run again, and the new recording replays exactly but will not match a run on the old hardware.

## What the state of a machine is

"The state of a machine" sounds like an abstraction, but it is just bits. At any point of a run, it is a finite, concrete sequence of zeros and ones, and we can precisely name every part of it:

- **Each vCPU**: its general registers and instruction pointer, its segment and control registers, the x87, SSE and AVX registers, the debug registers, the model-specific registers, its local interrupt controller and timer, and any exception or interrupt it has pending.
- **The interrupt controllers and timers** shared by the vCPUs.
- **Every device**: the serial ports, the keyboard controller, and all the others.
- **Memory**: every byte of RAM.
- **The disk**: every block of it.

<figure class="post-figure">
<svg viewBox="0 0 760 494" role="img" aria-labelledby="sm-title sm-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="sm-title">The state of a machine</title>
<desc id="sm-desc">Blocks that make up the state of a machine. Each vCPU: general registers and instruction pointer, segment and control registers, x87, SSE and AVX registers, debug registers, model-specific registers, local interrupt controller and timer, and pending exceptions and interrupts. The interrupt controllers and timers shared by the vCPUs. Every device: the serial ports, the keyboard controller and the other devices. Memory, every byte of RAM. The disk, every block of it.</desc>
<style>.sm-v{fill:var(--tf-cta);fill-opacity:.12;stroke:var(--tf-cta);stroke-width:1.5}.sm-vb{fill:none;stroke:var(--tf-cta);stroke-opacity:.6;stroke-width:1.2}.sm-f{fill:currentColor;fill-opacity:.06;stroke:currentColor;stroke-opacity:.45;stroke-width:1.4}.sm-c{fill:currentColor;fill-opacity:.05;stroke:currentColor;stroke-opacity:.3;stroke-width:1}.sm-h{fill:currentColor;font-size:15px;font-weight:600}.sm-s{fill:currentColor;fill-opacity:.65;font-size:13px;font-style:italic}.sm-ct{fill:currentColor;fill-opacity:.85;font-size:12.5px}.sm-o{fill:none;stroke:currentColor;stroke-opacity:.55;stroke-width:1.4;stroke-dasharray:6 4}.sm-ot{fill:currentColor;font-size:15px;font-weight:700}</style>
<rect class="sm-o" x="20" y="8" width="720" height="478" rx="12"/>
<text class="sm-ot" x="40" y="36">Machine state at time <tspan font-style="italic">T</tspan></text>
<g transform="translate(0,40)">
<path class="sm-vb" d="M60,30 V28 Q60,20 68,20 H712 Q720,20 720,28 V168 Q720,176 712,176 H710"/>
<path class="sm-vb" d="M50,40 V38 Q50,30 58,30 H702 Q710,30 710,38 V178 Q710,186 702,186 H700"/>
<rect class="sm-v" x="40" y="40" width="660" height="156" rx="8"/>
<text class="sm-h" x="56" y="64">Each vCPU</text>
<rect class="sm-c" x="56.0" y="76" width="149.5" height="46" rx="6"/><text class="sm-ct" x="130.8" y="96.0" text-anchor="middle">General registers,</text><text class="sm-ct" x="130.8" y="111.0" text-anchor="middle">instruction pointer</text><rect class="sm-c" x="215.5" y="76" width="149.5" height="46" rx="6"/><text class="sm-ct" x="290.2" y="96.0" text-anchor="middle">Segment and</text><text class="sm-ct" x="290.2" y="111.0" text-anchor="middle">control registers</text><rect class="sm-c" x="375.0" y="76" width="149.5" height="46" rx="6"/><text class="sm-ct" x="449.8" y="96.0" text-anchor="middle">x87, SSE and</text><text class="sm-ct" x="449.8" y="111.0" text-anchor="middle">AVX registers</text><rect class="sm-c" x="534.5" y="76" width="149.5" height="46" rx="6"/><text class="sm-ct" x="609.2" y="103.5" text-anchor="middle">Debug registers</text>
<rect class="sm-c" x="56.0" y="132" width="202.7" height="46" rx="6"/><text class="sm-ct" x="157.3" y="159.5" text-anchor="middle">Model-specific registers</text><rect class="sm-c" x="268.7" y="132" width="202.7" height="46" rx="6"/><text class="sm-ct" x="370.0" y="152.0" text-anchor="middle">Local interrupt</text><text class="sm-ct" x="370.0" y="167.0" text-anchor="middle">controller and timer</text><rect class="sm-c" x="481.3" y="132" width="202.7" height="46" rx="6"/><text class="sm-ct" x="582.7" y="152.0" text-anchor="middle">Pending exceptions</text><text class="sm-ct" x="582.7" y="167.0" text-anchor="middle">and interrupts</text>
<rect class="sm-f" x="40" y="206" width="680" height="46" rx="8"/>
<text class="sm-h" x="380" y="234" text-anchor="middle">Interrupt controllers and timers shared by the vCPUs</text>
<rect class="sm-f" x="40" y="262" width="680" height="92" rx="8"/>
<text class="sm-h" x="56" y="286">Every device</text>
<rect class="sm-c" x="56.0" y="298" width="209.3" height="40" rx="6"/><text class="sm-ct" x="160.7" y="322.5" text-anchor="middle">Serial ports</text><rect class="sm-c" x="275.3" y="298" width="209.3" height="40" rx="6"/><text class="sm-ct" x="380.0" y="322.5" text-anchor="middle">Keyboard controller</text><rect class="sm-c" x="494.7" y="298" width="209.3" height="40" rx="6"/><text class="sm-ct" x="599.3" y="322.5" text-anchor="middle">Other devices</text>
<rect class="sm-f" x="40" y="364" width="335" height="64" rx="8"/>
<text class="sm-h" x="207.5" y="391" text-anchor="middle">Memory</text><text class="sm-s" x="207.5" y="412" text-anchor="middle">every byte of RAM</text>
<rect class="sm-f" x="385" y="364" width="335" height="64" rx="8"/>
<text class="sm-h" x="552.5" y="391" text-anchor="middle">Disk</text><text class="sm-s" x="552.5" y="412" text-anchor="middle">every block of it</text>
</g>
</svg>
<figcaption>The state of a machine at any point of a run.</figcaption>
</figure>

If two machines hold the same bits in all of these, they are the same machine state. Nothing else in theory exists that could make them behave differently from that point on.

<figure class="post-figure">
<svg viewBox="0 0 760 150" role="img" aria-labelledby="sq-title sq-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="sq-title">A run is a sequence of machine states</title>
<desc id="sq-desc">A row of machine states joined by arrows: the state at time T0, when the machine powers on, then T1, T2 and so on, up to the final state at time Tn, when the machine halts.</desc>
<style>.sq-o{fill:none;stroke:currentColor;stroke-opacity:.55;stroke-width:1.4;stroke-dasharray:5 3}.sq-v{fill:var(--tf-cta);fill-opacity:.12;stroke:var(--tf-cta);stroke-width:1.2}.sq-f{fill:currentColor;fill-opacity:.06;stroke:currentColor;stroke-opacity:.45;stroke-width:1}.sq-a{fill:none;stroke:var(--tf-cta);stroke-width:1.8}.sq-ah{fill:var(--tf-cta)}.sq-t{fill:currentColor;font-size:15px;font-weight:700}.sq-s{fill:currentColor;fill-opacity:.65;font-size:13px;font-style:italic}.sq-d{fill:currentColor;fill-opacity:.65;font-size:22px;font-weight:700}</style>
<rect class="sq-o" x="25" y="16" width="110" height="80" rx="8"/><rect class="sq-v" x="35" y="26" width="90" height="22" rx="4"/><rect class="sq-f" x="35" y="53" width="90" height="9" rx="3"/><rect class="sq-f" x="35" y="66" width="90" height="9" rx="3"/><rect class="sq-f" x="35" y="79" width="42.0" height="9" rx="3"/><rect class="sq-f" x="83.0" y="79" width="42.0" height="9" rx="3"/>
<text class="sq-t" x="80.0" y="120" text-anchor="middle"><tspan font-style="italic">T</tspan><tspan font-size="11" dy="3">0</tspan></text>
<text class="sq-s" x="80.0" y="140" text-anchor="middle">power-on</text>
<path class="sq-a" d="M141,56.0 H164"/><path class="sq-ah" d="M171,56.0 l-9,-5 v10 z"/>
<rect class="sq-o" x="177" y="16" width="110" height="80" rx="8"/><rect class="sq-v" x="187" y="26" width="90" height="22" rx="4"/><rect class="sq-f" x="187" y="53" width="90" height="9" rx="3"/><rect class="sq-f" x="187" y="66" width="90" height="9" rx="3"/><rect class="sq-f" x="187" y="79" width="42.0" height="9" rx="3"/><rect class="sq-f" x="235.0" y="79" width="42.0" height="9" rx="3"/>
<text class="sq-t" x="232.0" y="120" text-anchor="middle"><tspan font-style="italic">T</tspan><tspan font-size="11" dy="3">1</tspan></text>
<path class="sq-a" d="M293,56.0 H316"/><path class="sq-ah" d="M323,56.0 l-9,-5 v10 z"/>
<rect class="sq-o" x="329" y="16" width="110" height="80" rx="8"/><rect class="sq-v" x="339" y="26" width="90" height="22" rx="4"/><rect class="sq-f" x="339" y="53" width="90" height="9" rx="3"/><rect class="sq-f" x="339" y="66" width="90" height="9" rx="3"/><rect class="sq-f" x="339" y="79" width="42.0" height="9" rx="3"/><rect class="sq-f" x="387.0" y="79" width="42.0" height="9" rx="3"/>
<text class="sq-t" x="384.0" y="120" text-anchor="middle"><tspan font-style="italic">T</tspan><tspan font-size="11" dy="3">2</tspan></text>
<path class="sq-a" d="M445,56.0 H468"/><path class="sq-ah" d="M475,56.0 l-9,-5 v10 z"/>
<text class="sq-d" x="536.0" y="63.0" text-anchor="middle">…</text>
<path class="sq-a" d="M597,56.0 H620"/><path class="sq-ah" d="M627,56.0 l-9,-5 v10 z"/>
<rect class="sq-o" x="633" y="16" width="110" height="80" rx="8"/><rect class="sq-v" x="643" y="26" width="90" height="22" rx="4"/><rect class="sq-f" x="643" y="53" width="90" height="9" rx="3"/><rect class="sq-f" x="643" y="66" width="90" height="9" rx="3"/><rect class="sq-f" x="643" y="79" width="42.0" height="9" rx="3"/><rect class="sq-f" x="691.0" y="79" width="42.0" height="9" rx="3"/>
<text class="sq-t" x="688.0" y="120" text-anchor="middle"><tspan font-style="italic">T</tspan><tspan font-size="11" dy="3">n</tspan></text>
<text class="sq-s" x="688.0" y="140" text-anchor="middle">HALT</text>
</svg>
<figcaption>A run is a sequence of machine states, from the state at power-on to the final state, when the machine halts.</figcaption>
</figure>

And an execution of a run is nothing more than a sequence of these machine states.

## Confirming the state

There are two ways we confirm a replay.

1. First, while a replay runs, Machine checks every recorded entry. Each entry carries the instruction pointer, the count and a hash of the registers at the point the recording stopped, and the replay has to arrive at all three. Each entry also carries hashes of the rest of the vCPU state, computed in groups, and each of the devices. If any of them differs, the replay reports a divergence at that entry, and the group that differs says where to look.

2. Second, hashing all of memory and the whole disk at every entry is expensive, so it is off by default. Instead, at any point, the `machine hash` command computes every hash of the machine as it stands, memory and disk included, so two machines stopped at the same entry can be compared in full. For debugging, `--mem-hash` and `--disk-hash` on `create` or `fork` make a run hash memory and the disk at every entry, so that a replay of it compares them at every entry too and finds the first one where they differ.

## A small example

Let's see how Machine boots the kernel, starts Docker, and runs one command using the `ubuntu:24.04` Docker container. The command prints a greeting and the date, then reads 256 bytes from `/dev/random` and prints them in hex. Random numbers here are a good test, as on a normal computer you expect every run to print different bytes.

This is how we built a disk from the image, created a run from it, and ran it until the machine powered off:

```
$ machine sessions create blog-determinism
$ machine disks build --from ubuntu:24.04 --entrypoint /bin/sh hello-random -- -c 'echo "Hello from TestFlows Machine!"; date; head -c 256 /dev/random | od -A x -t x1 -v'
$ machine create hello-random --disk hello-random
$ machine run hello-random --until halted --within 5m
```

The run took 5.213 seconds of machine time and 33,452 entries, from the first line of the kernel to the reboot. Here is the part of its output where the container runs, with the entries that printed each line:

<div class="scroll-output">

```
$ machine output hello-random -n 219:240
ENTRIES           SOURCE    LINE      OUTPUT
31660:31661       ttyS0     219        Container compose-app-1  Started
32531:32532       ttyS0     220       app | Hello from TestFlows Machine!
32535:32536       ttyS0     221       app | Sun Mar  1 00:00:03 UTC 2026
32538:32540       ttyS0     222       app | 000000 05 47 34 4b 9f 2d b7 88 20 f1 5d 72 c5 be 6e de
32543:32544       ttyS0     223       app | 000010 cc 63 da cb 21 b0 08 c7 b0 22 af de fa a0 d6 55
32546:32547       ttyS0     224       app | 000020 c5 18 0a 8c 00 10 5f 64 4b e7 ee ea 4d ae dc 69
32549:32550       ttyS0     225       app | 000030 68 f2 4f b3 73 74 c5 5e f3 22 12 7c d4 89 00 7f
32552:32553       ttyS0     226       app | 000040 b2 fc fc 3d fd be 9f b1 8b c2 7e b2 1b be ae 08
32555:32556       ttyS0     227       app | 000050 bc 84 6a 1a c8 9c 88 00 d2 e2 2b ad a9 b6 dc aa
32558:32559       ttyS0     228       app | 000060 48 48 b3 27 ec 6b de b5 8d 08 d4 26 8a c5 2f 33
32561:32562       ttyS0     229       app | 000070 90 59 5d e2 ca c8 d5 d6 32 d5 35 1c bd 82 91 01
32564:32565       ttyS0     230       app | 000080 e6 f5 10 bb 9e 6c 72 5d 04 d4 28 63 35 6e fa 50
32567:32568       ttyS0     231       app | 000090 cf 0f 8b 45 b8 fe c9 ba dc f6 40 93 2c 35 8e 1b
32570:32571       ttyS0     232       app | 0000a0 29 42 dc f2 cb e0 7a 69 e0 86 48 d2 a3 73 dc d2
32573:32574       ttyS0     233       app | 0000b0 98 ed 17 b4 45 db 1c 4f c4 c3 8a b3 33 31 71 7c
32576:32577       ttyS0     234       app | 0000c0 e5 74 13 e3 90 03 7e 36 d2 5e 26 f5 3b 59 8d 6d
32579:32580       ttyS0     235       app | 0000d0 14 28 5e b7 70 df 78 5e 06 c2 85 89 22 8b 09 e4
32582:32583       ttyS0     236       app | 0000e0 27 6b be d0 42 13 9c 2a 60 38 d6 36 23 db f5 41
32585:32587       ttyS0     237       app | 0000f0 b9 bf 5f d1 a1 b4 85 1d 29 0c ed 25 43 56 0b 64
32602:32603       ttyS0     238       app | 000100
32646:32647       ttyS0     239       === app exited by itself: code 0 ===
33011:33012       ttyS0     240        Container compose-app-1  Stopping
```

</div>

The first lines of the boot look like this:

<div class="scroll-output">

```
ENTRIES           SOURCE                    LINE      OUTPUT
29:93             ttyS0                     1         early console in extract_kernel
99:169            ttyS0                     2         input_data: 0x0000000001fba2c4
175:243           ttyS0                     3         input_len: 0x000000000056f095
249:311           ttyS0                     4         output: 0x0000000001000000
317:387           ttyS0                     5         output_len: 0x00000000014f405c
393:477           ttyS0                     6         kernel_total_size: 0x0000000001230000
483:555           ttyS0                     7         needed_size: 0x0000000001600000
561:643           ttyS0                     8         trampoline_32bit: 0x0000000000000000
649:651           ttyS0                     9         
653:655           ttyS0                     10        
661:741           ttyS0                     11        KASLR disabled: 'nokaslr' on cmdline.
743:745           ttyS0                     12        
751:753           ttyS0                     13        
755:905           ttyS0                     14        Decompressing Linux... Parsing ELF... No relocation needed... done.
907:1025          ttyS0                     15        Booting the kernel (entry_offset: 0x0000000000000000).
1042:1474         ttyS0                     16        Linux version 6.11.11-testflows-os-v1.0 (user@user-ubox) (gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #221 SMP PREEMPT_DYNAMIC Wed Nov 25 04:22:14 EST 2026 (TestFlows OS v1.0)
1476:1626         ttyS0                     17        Kernel is locked down from Kernel configuration; see man kernel_lockdown.7
1628:2316         ttyS0                     18        Command line: noapic noacpi pci=conf1 reboot=k panic=1 i8042.direct=1 i8042.dumbkbd=1 i8042.nopnp=1 numa_balancing=disable transparent_hugepage=never zswap.enabled=0 nokaslr lockdown=confidentiality sysctl.kernel.kptr_restrict=2 sysctl.kernel.dmesg_restrict=1 earlyprintk=serial i8042.noaux=1 console=ttyS0 root=/dev/vda rw  reclaim_rng_seed=0
2318:2382         ttyS0                     19        BIOS-provided physical RAM map:
2384:2508         ttyS0                     20        BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable
2510:2638         ttyS0                     21        BIOS-e820: [mem 0x000000000009fc00-0x000000000009ffff] reserved
2640:2768         ttyS0                     22        BIOS-e820: [mem 0x00000000000f0000-0x00000000000fffff] reserved
2770:2894         ttyS0                     23        BIOS-e820: [mem 0x0000000000100000-0x000000000fffffff] usable
2896:2990         ttyS0                     24        printk: legacy bootconsole [earlyser0] enabled
3001:3085         ttyS0                     25        ERROR: earlyprintk= earlyser already used
3087:3167         ttyS0                     26        NX (Execute Disable) protection: active
3169:3231         ttyS0                     27        APIC: Static calls initialized
3233:3289         ttyS0                     28        DMI not present or invalid.
3291:3363         ttyS0                     29        tsc: Fast TSC calibration using PIT
...
```

</div>

The date is March 1, 2026, three seconds after the machine's clock started, because a machine's clock starts at its own base time and advances with what the machine executes, not with the clock on the wall. The complete output of the run, all 275 lines of the console from the kernel's first message to the reboot, together with the container's own output stream and the entries of every line, can be found in [hello-random.log](https://github.com/testflows/Machine/blob/main/examples/hello-random/hello-random.log).

## Replaying it

To replay the example, we forked the run at its first checkpoint, which is the very start of the machine, and replayed the branch to the end:

```
$ machine fork hello-random --from 1 --name hello-random-replay
✔ Forked hello-random/hello-random-replay (wijPOx6dhlRle9NinfZKR)
  From checkpoint 1 of hello-random, replayed to entry 33452
$ diff <(machine output hello-random --source all -n :) <(machine output hello-random-replay --source all -n :) && echo identical
identical
```

In our run, the replay took about 8.5 seconds of real time, and it printed every line of every source again, the same 256 bytes among them. Then we compared the machines themselves, both stopped at entry 33452:

<div class="scroll-output">

```
$ machine hash hello-random-replay
Entry 33452
mem          0x50728d55dc839142
disk         0x708517d3cab003a1
irq_pending  0x0000000000000000
serial       0x7e39f245ced1502d
i8042        0xbe1ba65e39053f23
rtc          0xab94ee4e2d08fd65
rng          0xb27153e372867d18
blk          0xea4b22bb247c4205
console      0x0000000000000000
pci          0xa4208d7b6c693b0c
vesa         0x0000000000000000
vCPU 0
  state        0xe69542d8c284d2d9
  regs_hash    0x6ee28a15235e2f14
  regs         0xc82fe05af11c90ff
  events       0x8dc91fb7a6c04b0b
  xsave        0xb416fda2764dc7e8
  debug        0x2f58f9f63a1a7212
  msrs         0x9a0925feeb9b25a3
  lapic        0xd857be67733c02ee
  timers       0xc32e6dc1314620ec
  pic          0xac7265df936c7d37
  ioapic       0x62b04df5c505ff07
```

</div>

`machine hash hello-random` printed the same 22 hashes: memory, the disk, the eight devices, the interrupts held for delivery, and the eleven parts of the vCPU. Each hash stands for the bits listed in the previous section. Strictly speaking, matching hashes are not a mathematical proof that every bit is equal, because two different states could in theory produce the same 64-bit hash. In practice, the chance of that is vanishingly small, and `machine dump` shows the bits themselves. Here are the vCPU's general registers at the last entry of the original run:

<div class="scroll-output">

```
$ machine dump hello-random --show regs
  Registers:
    rax      0xfffffffe
    rbx      0x0
    rcx      0x0
    rdx      0xc4b8
    rsi      0x0
    rdi      0x136b8e2be
    rsp      0xffffc90000223db0
    rbp      0xa
    r8       0xc1be
    r9       0x0
    r10      0xffffefff
    r11      0xffffffff81c3bce0
    r12      0x0
    r13      0x6b
    r14      0xfffffffe
    r15      0xfee1dead
    rip      0xffffffff8103f4fc
    rflags   0x86
  ...
```

</div>

> Fun fact, the `0xfee1dead` in `r15` is the magic number Linux passes to its `reboot` system call, still in the register as the machine powers off.

Let's now look at something that can be confusing.

## Replayable vs repeatable

Replayable and repeatable properties are easy to interpret as meaning the same. However, we say a run is **replayable** when a replay of its recording reproduces it exactly. A run is **repeatable** when recording it again, from the same start with the same commands, produces the same recording.

Every run in Machine is replayable but not every run is repeatable, and Machine does not need it to be, because a replay never records anything: it follows the recording it was given.

But in the case of our example run, it is repeatable because its session class records repeatable runs by default, and `machine describe` indicates this by showing `Repeatable: true`. To show that it is actually repeatable, we created a second run from the same disk and recorded it from scratch:

```
$ machine create hello-random-again --disk hello-random
$ machine run hello-random-again --until halted --within 5m
$ diff <(machine output hello-random --source all -n :) <(machine output hello-random-again --source all -n :) && echo identical
identical
```

The new recording also took 5.213108010 seconds of machine time, ended at entry 33452, printed the same 256 bytes and reached the same 22 hashes.

So why don't all runs repeat? To see why, you need to know one thing about how a machine executes: it runs in dispatches.

A dispatch is a stretch of execution on one vCPU that the processor runs at full speed. At the end of each one, the hypervisor takes control back to handle what the machine asked for, record an entry, accept commands and give the next vCPU its turn. A dispatch ends when the machine needs the hypervisor, for example to read the disk, when a timer is due, or when the vCPU has retired its count budget.

But code that never needs the hypervisor and never advances the count would keep a dispatch running forever. So every dispatch also has a bound in host time, 1 second by default, set with the `--dispatch-bound` option of `create`. When it is reached, the hypervisor stops the dispatch wherever it is, and the machine always comes back to answer commands.

Therefore, some recordings made again can differ from the first one for reasons that have nothing to do with the program:

- **A stop placed by host time.** Where the dispatch bound stops a dispatch depends on how fast the host ran during that second.
- **Loops that never advance the count.** The counter does not advance in such a loop, so the stop that ends its dispatch is placed by the dispatch bound or hits its stop limit.
- **Counter skid.** The processor's counter interrupts some distance past the point it was asked to stop at, and the distance varies.
- **A missed stop.** A repeatable run interrupts before each count stop and steps from there, but it can still miss the stop, for example when the counter skids too far. The stop then lands later, and the recording still replays.
- **A user command.** `machine cancel`, or Ctrl-C, stops the machine wherever it happens to be at that moment.
- **A choice drawn without a seed.** A fault or a delay given without `--seed` draws a seed and shows it. The recording keeps the seed, so a replay follows it, but a new recording draws another one.

For a repeatable run, `machine describe` shows how far a new recording would repeat it. The `Repeats To: tip` message means all of it is repeatable, as is the case for our `hello-random` example. Otherwise, the line names the first entry that would not repeat and what placed it, such as a host-time stop.

It is important to note that in every one of these cases, the recording is still replayable. This is because each stop is recorded with its instruction pointer, its count and its register hashes, so a replay arrives at the same stop no matter how the recording got there.

## Changing the inputs

Another factor is inputs. A replay reproduces a run because it gives the machine the same inputs. Change an input, and the run changes with it. For our example, two inputs matter: the seed of the machine's random number generator device, and the rate of its clock.

Let's see what happened when we forked the run at its first checkpoint with another seed and ran the branch to the end:

```
$ machine fork hello-random --at 1 --name hello-random-seed7 --rng-seed 7
✔ Forked hello-random/hello-random-seed7 (wijPCpkvHXN7oF2BeH28T)
  From checkpoint 1 of hello-random, nothing replayed
$ machine run hello-random-seed7 --until halted --within 5m
$ machine output hello-random-seed7 --source /output/keep/app/console -n :
Hello from TestFlows Machine!
Sun Mar  1 00:00:03 UTC 2026
000000 f7 7e 81 3f 12 95 7a f7 8c 06 6f 78 7d 72 7c 55
000010 88 5e 28 fa 76 a0 3e be 65 fe 47 7b 06 6b 24 f1
...
```

The bytes are different, but the date is not. The boot also took a little longer, 5.289 seconds of machine time instead of 5.213.

Then we forked it again with the original seed and doubled the clock rate, from 10 to 20 nanoseconds of machine time:

```
$ machine fork hello-random --at 1 --name hello-random-rate20
✔ Forked hello-random/hello-random-rate20 (wijPDnwGqppLEdjXwsLKg)
  From checkpoint 1 of hello-random, nothing replayed
$ machine vtime hello-random-rate20 rate 20
$ machine run hello-random-rate20 --until halted --within 5m
$ machine output hello-random-rate20 --source /output/keep/app/console -n :
Hello from TestFlows Machine!
Sun Mar  1 00:00:08 UTC 2026
000000 74 b2 99 ab 90 94 1f 4e 29 5c 81 3f d3 61 2f ae
000010 6a f4 e5 b2 85 f4 1e a9 29 6e a3 7f 31 77 c6 a5
...
```

The boot took 10.969 seconds of machine time instead of 5.213, and the date moved from 00:00:03 to 00:00:08, as expected. The random bytes changed as well, even though the seed did not.

This is because the Linux random number generator mixes the timing of interrupts and the time stamp counter into its pool, so the machine's clock is one of its inputs. However, both changes are recorded like everything else: a replay of the `hello-random-rate20` branch printed the same output as the branch and reached the exact same 22 hashes.

| Run | Seed | Clock rate | Machine time | Date | First random bytes |
|---|---|---|---|---|---|
| `hello-random` | 0 | 10 | 5.213 s | 00:00:03 | `05 47 34 4b` |
| `hello-random-replay` | 0 | 10 | 5.213 s | 00:00:03 | `05 47 34 4b` |
| `hello-random-seed7` | 7 | 10 | 5.289 s | 00:00:03 | `f7 7e 81 3f` |
| `hello-random-rate20` | 0 | 20 | 10.969 s | 00:00:08 | `74 b2 99 ab` |

## When a replay diverges

Of course, our goal is that every recording replays without divergence, every time. A replay that converges on one recording does not prove that the next one will, which is why Machine checks every entry of every replay rather than trusting that it worked.

If a replay of yours ever reports a divergence, keep the run and its branches, and ping us at [support@testflows.com](mailto:support@testflows.com) with the session, the run, the entry the replay stopped at, and provide the commands that led to it. We will definitely investigate it. In general, a divergence is either a recording that captured a point the replay cannot reach, or something on the host that interfered with the replay, and we want to know about both so that it doesn't happen again.

## Conclusion

So, is execution really deterministic? On the CPU it was recorded on, yes, literally. The state of a machine is a sequence of bits, the replay reaches the same bits, and `machine hash` lets you check it yourself, from memory and disk down to each register group of each vCPU.

In this post, we used a machine with a single vCPU. Machines with many vCPUs replay the same way, but that is the subject of the next post. So stay tuned and keep testing!

Don't forget to try all of this by yourself. [Sign up](/machine/portal/signup/) for free and run your own programs deterministically.
