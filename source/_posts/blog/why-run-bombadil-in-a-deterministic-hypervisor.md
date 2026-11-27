---
post: true
title: "Why Run Bombadil in a Deterministic Hypervisor?"
seo_title: "Why Run Bombadil in a Deterministic Hypervisor? Violations That Replay Exactly"
description: "We ran Bombadil's terminal examples, nano, btop, tetris and the TigerBeetle REPL among them, unchanged inside TestFlows Machine deterministic hypervisor, replayed the run exactly, and turned every violation into a point in the run to branch from."
date: 2026-12-01
author: Vitaliy Zakaznikov
keywords: Bombadil, property-based testing, terminal UI testing, TigerBeetle, deterministic simulation testing, DST, record and replay, deterministic hypervisor, TestFlows Machine
image: images/why-run-bombadil-in-a-deterministic-hypervisor.png
social_image: images/why-run-bombadil-in-a-deterministic-hypervisor-card.jpg
social_image_width: 2400
social_image_height: 1254
icon: fas fa-glasses pt-5 pb-5
---

[Bombadil](https://github.com/antithesishq/bombadil) is a property-based testing tool for web and terminal UIs. It allows you to describe how your application should behave and what actions can be taken to interact with it using a TypeScript specification. Bombadil uses this specification to explore your application, selecting and performing actions based on its current state while checking your properties along the way.

You can run Bombadil in your local development environment, in CI, or inside Antithesis. Naturally, we also wanted to see how it would run inside Machine, our deterministic hypervisor behind the [TestFlows Machine](/machine/) simulation testing environment. Inside Antithesis, though, Bombadil runs differently because it is [integrated with their fuzzer](https://github.com/antithesishq/bombadil/pull/257). What we can do is run Bombadil much as you would run it locally, but deterministically.<!-- more -->

Why would we want to do that? Simple. When Bombadil finds a violation, its [reproduce](https://antithesishq.github.io/bombadil/terminal/4.1-reproducing-violations.html#reproducing-violations) option allows you to play back the same sequence of actions, but reproduction is only best-effort because giving a program the same input doesn't necessarily mean you'll get the same output. However, by running both Bombadil and the application it tests inside a deterministic hypervisor, we can replay the whole run and any failures exactly, not just the actions Bombadil took.

## The setup

We selected five of Bombadil's terminal [examples](https://github.com/antithesishq/bombadil/tree/v0.8.0/examples):

{% html div class="styled-table" %}

| Example | Program | What its specification checks |
|---|---|---|
| `cat` | `cat` | `hello world` appears on more than five lines within 5 seconds; `cat` never exits with an error code or shows a replacement character |
| `nano` | `nano` | The bottom lines show nano's main key bindings, `Help`, `Exit` and `Read`, outside its prompts |
| `btop` | `btop` | `btop` never exits with an error code or shows a replacement character |
| `tetris` | `bastet` | The screen is never blank |
| `tb` | `tigerbeetle repl` against a one-replica cluster | The REPL never exits with an error code or shows a replacement character |

{% endhtml %}

We used Bombadil 0.8.0 and its specifications, along with TigerBeetle 0.17.9. We left out the other examples because they either required internet access (the machine has none) or did not specify which program to test.

Of the five examples, the TigerBeetle example needed a little extra work. It turns out that TigerBeetle does all of its disk and network I/O through `io_uring`, and Docker's default seccomp profile blocked those calls. But setting `seccomp:unconfined` for the service was enough to get it running.

> You can find the complete example in our public repository under [examples/compose/bombadil](https://github.com/testflows/Machine/tree/main/examples/compose/bombadil).

We put all five examples into a single Docker container, built a disk from it, and ran the examples unchanged, one after another, inside the machine using the following commands:

```
$ docker compose build
$ machine sessions create bombadil --cpus 2 --mem 4G
$ machine disks build --compose . bombadil
$ machine create bombadil --disk bombadil --cpus 2 --mem 2560
$ machine run bombadil --until halted --within 15m
```

For testing, we gave each example 20 seconds of machine time. The whole run took 194.9 seconds of machine time and had 2,316,101 entries.

A great feature of Bombadil is that it logs every screen it samples and every action it takes. By collecting the screen log and trace for each example as output files of the run, we could go back and see what Bombadil saw at the sampled points in the run.

## What we found

Four of the five examples ran until their time was up without a single violation. With `nano`, however, Bombadil found six violations of the same property, `hasStandardBindings`, which means nano's key bindings were missing from the bottom two lines of the screen.

This was unexpected. Did we find a bug in nano? Since we can tell which machine entry produced each line of the screen log, we went back to see what the screen looked like just before, during and immediately after each violation:

{% html div class="styled-table" %}

| Violation | Screen before | Screen that violated the property | Next screen |
|---|---|---|---|
| 1 at 3.507 s | 26 rows, bindings shown | 85 rows, last two empty | 85 rows, bindings shown |
| 2 at 9.759 s | 53 rows, bindings shown | 65 rows, last two empty | 65 rows, bindings shown |
| 3 at 11.693 s | 25 rows, bindings shown | 76 rows, last two empty | 76 rows, bindings shown |
| 4 at 17.286 s | 16 rows, bindings shown | 85 rows, last two empty | 85 rows, bindings shown |
| 5 at 18.856 s | 19 rows, bindings shown | 99 rows, last two empty | 99 rows, bindings shown |
| 6 at 18.964 s | 87 rows, bindings shown | 98 rows, last two empty | 98 rows, bindings shown |

{% endhtml %}

This revealed an interesting corner case. In all six cases, the terminal had just been resized to make it taller. Bombadil sampled the screen before nano had finished repainting the bottom two lines. By the next sample, 15 to 20 milliseconds later, the bindings were back. This raised a question. How long can a property be false before we consider it violated?

A screen caught in the middle of a repaint may simply be unfinished. Whether that counts as incorrect depends on what our property is meant to check. A few milliseconds can make all the difference.

A closer look showed that the violations come from how the spec's `hasStandardBindings` property samples the screen, rather than from nano itself. It is a `next` property and checks the very next screen after a resize, when what we really want to know is whether nano eventually puts the bindings back, but not necessarily right away. The original property is:

```typescript
export const hasStandardBindings = always(
  next(() => {
    const text = statusLinesText.current ?? "";
    // Bail out only in genuinely-non-main-mode states:
    //  - just exited (Ctrl-C / Ctrl-D)
    //  - prompt mode (Save / Open / Search / Replace / Y-N): the menu shows
    //    `^C Cancel` instead of `^X Exit`, so the main bindings legitimately
    //    aren't present.
    if (justExited() || text.includes("Cancel")) return true;
    return (
      text.includes("Help") && text.includes("Exit") && text.includes("Read")
    );
  }),
);
```

To test this hypothesis, we can switch to `eventually` instead of `next`. The patch below changes the import and two lines of the property, giving nano up to a second to put the bindings back:

```diff
-import { always, Cell, next } from "@antithesishq/bombadil";
+import { always, Cell, eventually } from "@antithesishq/bombadil";
 ...
 export const hasStandardBindings = always(
-  next(() => {
+  eventually(() => {
     ...
-  }),
+  }).within(1, "seconds"),
 );
```

But first, why does nano hit this in the machine at all? Because Bombadil samples the next screen once the program has been quiet for 5 ms, and on a fast computer nano repaints well within that. In the machine, though, time is the machine's own: by default its clock advances 10 ns for every count of the system's progress, which makes the machine's vCPU appear slower than the one underneath it, so nano takes longer to repaint. So we ran nano with the original property and with the patched one, 20 seconds each, at different machine clock rates:

{% html div class="styled-table" %}

| ns per count | Screens a second | Original | Patched |
|---|---|---|---|
| 1 | 118 | 0 violations | 0 |
| 2 | 117 | 0 | 0 |
| 5 | 93 | 0 | 0 |
| 10, the default | 67 | 3 | 0 |
| 20 | 46 | 4 | 0 |

{% endhtml %}

Five more runs with other seeds, three at 10 and two at 20, gave 14 more violations of the original property and none of the patched one. As we slowed down the machine's apparent CPU speed, the original property began to fail. Is it then just the machine? No. We ran the same example on our own computer with Docker, where a whole CPU gave no violations in three minutes, and then limited the container's CPU with `--cpus`:

{% html div class="styled-table" %}

| Host CPU | Original | Patched |
|---|---|---|
| a whole CPU | 0 violations | 0 |
| 0.2 | 2 | 0 |
| 0.1 | 5 | 0 |
| 0.05 | 2 | 0 |

{% endhtml %}

We got the same violations on the first screen after a resize, now also after resizes that made the terminal shorter, since the bindings live on the bottom rows wherever they move. At 0.1 of a CPU the example samples 68 screens a second, about what it does in the machine at the default rate. So this is a race that any slow enough computer will lose, a busy CI runner included, and the machine simply loses it often enough to surface it quickly.

Here is a Dockerfile that installs nano, Bombadil 0.8.0 and the unmodified example that you can use to reproduce this violation yourself:

```dockerfile
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends nano curl ca-certificates
RUN curl -fsSL -o /usr/local/bin/bombadil \
      https://github.com/antithesishq/bombadil/releases/download/v0.8.0/bombadil-$(uname -m)-linux \
 && chmod +x /usr/local/bin/bombadil
WORKDIR /spec
RUN curl -fsSL -o nano.ts \
      https://raw.githubusercontent.com/antithesishq/bombadil/v0.8.0/examples/nano.ts
```

Build it and run the example for 60 seconds on a tenth of a CPU:

```
$ docker build -t bombadil-nano .
$ docker run --rm --cpus 0.1 bombadil-nano \
    bombadil terminal test --specification nano.ts --time-limit 60s nano \
    > run.log 2>&1; echo "exit $?"; grep -A25 'was violated' run.log
exit 1
hasStandardBindings was violated:

as of 00:01.401, it should always be the case that next:
...
however at 00:27.027:

lastAction =
  Resize:
    size:
      columns: 42.0
      rows: 63.0
statusLinesText =
```

When we ran it, we saw that the last action was a resize, and 7 milliseconds later the bottom two lines were still empty. The number of violations varied from run to run, so if one run comes back clean, try another.

Is the patched property still doing its job? Against `nano -x`, which hides the bindings for good, it is violated, just like the original. Giving nano a second does not remove the race completely, though: on a CPU slow enough for a repaint to take longer than that, the patched property would still fail.

> We are not sure whether the example is meant to show this, so we did not file an issue. You can find the patch in our example: [nano-eventually.patch](https://github.com/testflows/Machine/blob/main/examples/compose/bombadil/nano-eventually.patch).

## Replaying

When running Bombadil locally, we can reproduce its actions, but not necessarily the execution of the program it tests. In the machine, the run is recorded, so we forked it at its first checkpoint and replayed it to its end, entry 2,316,101 in our run:

```
$ machine fork bombadil --at 1 --name bombadil-replay --no-start
$ machine start bombadil/bombadil-replay
$ machine replay bombadil/bombadil-replay bombadil --to '#2316101'
✔ Replayed 2316100 entries to entry 2316101. Converged.
```

All 2,316,100 entries converged. We also compared every output source with the original run, including the console, TigerBeetle's log, and the five screen logs and traces. The bytes, lines and entries all matched. `machine hash` gave the same hashes for both, so the state matched exactly. So the same random keys, the same resizes, the same screens and the same six violations came back in the replay, from TigerBeetle's cluster to nano's last repaint. The replay took about 2.5 minutes of real time for us.

## Going to a violation

A violation in a machine is not just a message in a log. It is a place in the run, and we can go there.

To make this easy, we wrote a small Python script, [bombadil_events.py](https://github.com/testflows/Machine/blob/main/examples/compose/bombadil/bombadil_events.py). It reads an example's screen log using our SDK and gives us both Bombadil's timestamp and the machine entry for each action and violation:

```
$ python bombadil_events.py bombadil --example nano --events nano.tsv --cast nano.cast
nano: 1323 screens, 1323 actions, 6 violations
  1. hasStandardBindings at 3.507s, entry 121303
     machine fork bombadil --at '#121303' --name nano-violation-1
  2. hasStandardBindings at 9.759s, entry 160318
     machine fork bombadil --at '#160318' --name nano-violation-2
...
```

Pick any of the fork commands and you get a new branch of the run starting at that violation, with nano in exactly the state it was in at the time. You can inspect it, attach a debugger or try different input from there. The original run stays as it was.

The `--events` option writes the timestamp and machine entry for every action and violation, while the `--cast` option produces an [asciinema](https://asciinema.org) recording of the screens with a marker at each violation. When we see a violation in the recording, we can look it up in the event log and go straight to that point in the machine's execution.

Here is the recording of nano from our run, the 1,323 screens Bombadil sampled. It opens on the first violation, and each button below it shows the screen of one of the six violations:

{% html div data-term-frames="/casts/why-run-bombadil-nano.json" data-term-title="nano.screen.log" data-term-offset="1.115" data-term-poster="3.507" %}
The recording plays with JavaScript enabled.
{% endhtml %}

Here is what is wrong in each of the six violations:

1. At 3.507 s, entry 121303, the terminal grew from 26 to 85 rows. The bindings are still at rows 25 and 26, where the old bottom was, and the last two rows are empty.
2. At 9.759 s, entry 160318, the terminal grew from 53 to 65 rows and got wider. nano had cleared the screen and not drawn anything yet, so the whole screen is empty.
3. At 11.693 s, entry 169103, the terminal grew from 25 to 76 rows. The bindings are still at rows 24 and 25.
4. At 17.286 s, entry 215475, the terminal grew from 16 to 85 rows. The bindings are still at rows 15 and 16.
5. At 18.856 s, entry 232260, the terminal grew from 19 to 99 rows. The bindings are still at rows 18 and 19.
6. At 18.964 s, entry 233152, the terminal grew from 87 to 98 rows and got narrower. The old bindings wrapped onto rows 83 to 87, and the last two rows are empty.

## What we learned

Running someone else's testing tool is also a good way to test our own. We found a few things in Machine that needed improvement.

For example, reading the screen log was slow. We also found that the default 256M of memory for the run was not enough when we included TigerBeetle, and nothing told us that memory was the problem.

We also ran into an issue with `MACHINE_OUTPUT_DIR`. We save files written there with the run as they are being written, but when we tried to read one back from inside the machine, we got an empty file, even though we hadn't written it into the drop folder. Not quite what you expect when a script is waiting for something to appear in its own log.

We fixed two of these. Reading a large output got a lot faster, and a file written to `MACHINE_OUTPUT_DIR` can now be read back from inside the machine. Telling you when a machine is short of memory is next.

## What's next

One of the main use cases for Bombadil is testing web UIs through a browser. That is what we want to try next, using a full web application running inside the machine. We will also add support for the Antithesis interface, using their [stub library](https://github.com/antithesishq/antithesis_stub).

If you have Bombadil specifications of your own, we'd love for you to try running them in Machine. Our example is a good place to start. You can [sign up](/machine/portal/signup/) for free, and if you need a bigger session for your project, just drop us a note at [contact@testflows.com](mailto:contact@testflows.com).
