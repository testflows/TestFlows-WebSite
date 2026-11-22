<!-- agents: TestFlows, a blog post. Index: https://testflows.com/llms.txt -->

# Introducing TestFlows Machine: Deterministic Simulation Testing for Everyone

Published 2026-11-22 by Vitaliy Zakaznikov.

A self-serve deterministic simulation testing (DST) environment for developers and AI coding agents has been a long time coming, and today we're introducing [TestFlows Machine](/machine.md) to make that vision a reality. Because for many teams, deterministic simulation testing has changed how some of the most reliable software systems are built and tested. It gives you control over software execution, lets you inject failures, and makes runs reproducible, enabling you to investigate bugs that might otherwise take days to reproduce, or never show up again at all. However, getting there has usually meant walking a steep path that starts with building a custom system yourself, specific to your project, or diving into the development of a deterministic hypervisor for a more generic approach. That takes specialized knowledge, infrastructure, and a significant investment, and most teams would rather spend that time and tokens on their own software. And our vision is different.<!-- more -->

## Our vision

We all see that software development is changing quickly, and AI coding agents now write, test, and debug most, if not all, of the software today. They can investigate a bug, propose a fix, and run the tests, but they still run into the same problem developers do, which is that software doesn't always fail the same way twice. Race conditions, timing issues, and network failures don't become easier to reproduce just because an agent is doing the debugging.

**Our vision is to make deterministic simulation testing a natural part of the modern AI-driven development cycle.** An agent should be able to reproduce a failure, step back through the execution, attach a debugger at the exact point where things went wrong, and try a fix against the same conditions. It should be able to inject faults precisely, compress execution time, and read logs after the fact with retroactive logging, without waiting for fuzzers. And you should be able to do all of that yourself, without having to build or maintain a deterministic hypervisor, or break your engineering budget to get access to systems that already provide this capability.

With TestFlows Machine, you can start doing that today.

## Agent first, but for the human in the loop

DST gives you an enormous amount of control over execution, including which vCPU and thread runs and when (yes, we do support multiple vCPUs, `cat /proc/cpuinfo` after you get started), which system call fails, what time the machine sees, and where a run branches. That control is the whole point, but it is also what makes the technique hard to adopt, as few developers have the time to learn a new execution model, its vocabulary, and a long list of commands before they see their first result. Many engineers struggle to even remember all the GDB commands, and that is without adding time travel, branches, and support for more debugging commands that you can run from the outside without disturbing the system state.

AI coding agents don't have that problem. They can read the code, the docs, and the command reference in seconds and drive Machine with precision, which is why we built Machine to be AI agent first. You install the Machine skill, ask your agent what Machine can do for your project, and it sets things up with you, signs in with a code from your email, and gets to work.

But agent first doesn't mean we want to deliver an AI-driven black box. We want agents to do the heavy lifting, while developers stay in the loop and can see every step they take, repeat it, and take over at any point. That's why the agent drives Machine through the same `machine` CLI client that a developer uses, and full programmatic control is available to both you and your agent through the [Python SDK](/docs/machine/python-sdk.md#python-sdk), which also lets you write your own custom fuzzers.

<figure class="post-figure">
<svg viewBox="30 0 760 290" role="img" aria-labelledby="ms-title ms-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="ms-title">Exploring the state space together</title>
<desc id="ms-desc">A mesh of the states a program can reach, running left to right from a single start, each state leading to the neighbouring states of the next step. Your agent's path, highlighted, ends where it found a failure. From a shared point along it, your own branch takes a different path, a passing run.</desc>
<style>
.ms-e{stroke:currentColor;stroke-opacity:.18;stroke-width:1.2}
.ms-n{fill:currentColor;fill-opacity:.28}
.ms-path{fill:none;stroke:var(--tf-cta);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.ms-pn{fill:var(--tf-cta)}
.ms-fork{fill:none;stroke:currentColor;stroke-opacity:.7;stroke-width:2.2;stroke-dasharray:7 5;stroke-linejoin:round}
.ms-fn{fill:currentColor;fill-opacity:.7}
.ms-cp{fill:none;stroke:var(--tf-cta);stroke-width:2}
.ms-l{fill:currentColor;fill-opacity:.65;font-size:13px;font-style:italic}
.ms-bad{fill:#e0533d}
.ms-badt{fill:#e0533d;font-size:14px;font-weight:700}
.ms-ok{fill:none;stroke:currentColor;stroke-opacity:.8;stroke-width:2.2}
.ms-okt{fill:currentColor;fill-opacity:.8;font-size:14px;font-weight:700}
.ms-who{fill:var(--tf-cta);font-size:14px;font-weight:700}
.ms-whoy{fill:currentColor;fill-opacity:.8;font-size:14px;font-weight:700}
</style>
<line class="ms-e" x1="60" y1="150" x2="160" y2="50"/><line class="ms-e" x1="60" y1="150" x2="160" y2="100"/><line class="ms-e" x1="60" y1="150" x2="160" y2="200"/><line class="ms-e" x1="60" y1="150" x2="160" y2="250"/><line class="ms-e" x1="160" y1="50" x2="260" y2="50"/><line class="ms-e" x1="160" y1="50" x2="260" y2="100"/><line class="ms-e" x1="160" y1="100" x2="260" y2="50"/><line class="ms-e" x1="160" y1="100" x2="260" y2="100"/><line class="ms-e" x1="160" y1="100" x2="260" y2="150"/><line class="ms-e" x1="160" y1="150" x2="260" y2="150"/><line class="ms-e" x1="160" y1="150" x2="260" y2="200"/><line class="ms-e" x1="160" y1="200" x2="260" y2="150"/><line class="ms-e" x1="160" y1="200" x2="260" y2="200"/><line class="ms-e" x1="160" y1="200" x2="260" y2="250"/><line class="ms-e" x1="160" y1="250" x2="260" y2="200"/><line class="ms-e" x1="160" y1="250" x2="260" y2="250"/><line class="ms-e" x1="260" y1="50" x2="360" y2="50"/><line class="ms-e" x1="260" y1="50" x2="360" y2="100"/><line class="ms-e" x1="260" y1="100" x2="360" y2="50"/><line class="ms-e" x1="260" y1="100" x2="360" y2="100"/><line class="ms-e" x1="260" y1="150" x2="360" y2="100"/><line class="ms-e" x1="260" y1="150" x2="360" y2="150"/><line class="ms-e" x1="260" y1="150" x2="360" y2="200"/><line class="ms-e" x1="260" y1="200" x2="360" y2="150"/><line class="ms-e" x1="260" y1="200" x2="360" y2="200"/><line class="ms-e" x1="260" y1="200" x2="360" y2="250"/><line class="ms-e" x1="260" y1="250" x2="360" y2="200"/><line class="ms-e" x1="260" y1="250" x2="360" y2="250"/><line class="ms-e" x1="360" y1="50" x2="460" y2="50"/><line class="ms-e" x1="360" y1="50" x2="460" y2="100"/><line class="ms-e" x1="360" y1="100" x2="460" y2="50"/><line class="ms-e" x1="360" y1="100" x2="460" y2="100"/><line class="ms-e" x1="360" y1="100" x2="460" y2="150"/><line class="ms-e" x1="360" y1="150" x2="460" y2="150"/><line class="ms-e" x1="360" y1="200" x2="460" y2="150"/><line class="ms-e" x1="360" y1="200" x2="460" y2="200"/><line class="ms-e" x1="360" y1="200" x2="460" y2="250"/><line class="ms-e" x1="360" y1="250" x2="460" y2="200"/><line class="ms-e" x1="360" y1="250" x2="460" y2="250"/><line class="ms-e" x1="460" y1="50" x2="560" y2="50"/><line class="ms-e" x1="460" y1="50" x2="560" y2="100"/><line class="ms-e" x1="460" y1="100" x2="560" y2="50"/><line class="ms-e" x1="460" y1="100" x2="560" y2="150"/><line class="ms-e" x1="460" y1="150" x2="560" y2="100"/><line class="ms-e" x1="460" y1="150" x2="560" y2="150"/><line class="ms-e" x1="460" y1="150" x2="560" y2="200"/><line class="ms-e" x1="460" y1="200" x2="560" y2="150"/><line class="ms-e" x1="460" y1="200" x2="560" y2="250"/><line class="ms-e" x1="460" y1="250" x2="560" y2="200"/><line class="ms-e" x1="460" y1="250" x2="560" y2="250"/><line class="ms-e" x1="560" y1="50" x2="660" y2="50"/><line class="ms-e" x1="560" y1="50" x2="660" y2="100"/><line class="ms-e" x1="560" y1="100" x2="660" y2="100"/><line class="ms-e" x1="560" y1="100" x2="660" y2="150"/><line class="ms-e" x1="560" y1="150" x2="660" y2="100"/><line class="ms-e" x1="560" y1="150" x2="660" y2="150"/><line class="ms-e" x1="560" y1="150" x2="660" y2="200"/><line class="ms-e" x1="560" y1="200" x2="660" y2="150"/><line class="ms-e" x1="560" y1="200" x2="660" y2="200"/><line class="ms-e" x1="560" y1="250" x2="660" y2="200"/><line class="ms-e" x1="560" y1="250" x2="660" y2="250"/><circle class="ms-n" cx="60" cy="150" r="5"/><circle class="ms-n" cx="160" cy="50" r="5"/><circle class="ms-n" cx="160" cy="100" r="5"/><circle class="ms-n" cx="160" cy="150" r="5"/><circle class="ms-n" cx="160" cy="200" r="5"/><circle class="ms-n" cx="160" cy="250" r="5"/><circle class="ms-n" cx="260" cy="50" r="5"/><circle class="ms-n" cx="260" cy="100" r="5"/><circle class="ms-n" cx="260" cy="150" r="5"/><circle class="ms-n" cx="260" cy="200" r="5"/><circle class="ms-n" cx="260" cy="250" r="5"/><circle class="ms-n" cx="360" cy="50" r="5"/><circle class="ms-n" cx="360" cy="100" r="5"/><circle class="ms-n" cx="360" cy="150" r="5"/><circle class="ms-n" cx="360" cy="200" r="5"/><circle class="ms-n" cx="360" cy="250" r="5"/><circle class="ms-n" cx="460" cy="50" r="5"/><circle class="ms-n" cx="460" cy="100" r="5"/><circle class="ms-n" cx="460" cy="150" r="5"/><circle class="ms-n" cx="460" cy="200" r="5"/><circle class="ms-n" cx="460" cy="250" r="5"/><circle class="ms-n" cx="560" cy="50" r="5"/><circle class="ms-n" cx="560" cy="100" r="5"/><circle class="ms-n" cx="560" cy="150" r="5"/><circle class="ms-n" cx="560" cy="200" r="5"/><circle class="ms-n" cx="560" cy="250" r="5"/><circle class="ms-n" cx="660" cy="50" r="5"/><circle class="ms-n" cx="660" cy="100" r="5"/><circle class="ms-n" cx="660" cy="150" r="5"/><circle class="ms-n" cx="660" cy="200" r="5"/><circle class="ms-n" cx="660" cy="250" r="5"/><polyline class="ms-fork" points="360,150 460,100 560,100 660,50"/><polyline class="ms-path" points="60,150 160,150 260,100 360,150 460,200 560,200 660,250"/><circle class="ms-pn" cx="60" cy="150" r="6"/><circle class="ms-pn" cx="160" cy="150" r="6"/><circle class="ms-pn" cx="260" cy="100" r="6"/><circle class="ms-pn" cx="360" cy="150" r="6"/><circle class="ms-pn" cx="460" cy="200" r="6"/><circle class="ms-pn" cx="560" cy="200" r="6"/><circle class="ms-fn" cx="460" cy="100" r="6"/><circle class="ms-fn" cx="560" cy="100" r="6"/><circle class="ms-cp" cx="360" cy="150" r="10"/><text class="ms-l" x="360" y="180" text-anchor="middle">shared point</text><circle class="ms-bad" cx="660" cy="250" r="9"/><text class="ms-badt" x="678" y="255">failure found</text><circle class="ms-ok" cx="660" cy="50" r="9"/><text class="ms-okt" x="678" y="55">passing run</text><text class="ms-who" x="520" y="236" text-anchor="middle">your agent</text><text class="ms-whoy" x="420" y="112" text-anchor="middle">you</text><text class="ms-l" x="60" y="178" text-anchor="middle">start</text>
</svg>
<figcaption>Every run is one path through the state space of your software. You and your agent explore it together: fork from any point, take a different path, and replay any of them exactly.</figcaption>
</figure>

## Name the bug, verify the fix

We believe the most valuable thing you can give an agent is fine-grained control over execution and fast feedback on its fixes. An agent that suspects a race shouldn't have to start hours of fuzzing and hope for the best, as it can hold one thread at the exact line, run the other one through, and see the failure in seconds. It can then apply its fix, run the same interleaving again, and know that the fix holds, which turns a guess into a verified fix.

Fuzzing still matters once the bugs you can name are fixed and you need to search for the ones you can't. Machine supports that today with plans and seeds, and with the Python SDK.

We walk through exactly what this looks like on a real example at the end of this post.

## Beyond the deterministic hypervisor

We stand on the shoulders of prior art, and deterministic simulation testing is gaining momentum. We're excited to see new deterministic hypervisor projects appearing in research and open source. We think that's great, as more people working on deterministic execution means more innovation and more attention to a technology that has been out of reach for too long.

However, a deterministic hypervisor is only the foundation, and building a complete deterministic simulation testing system is a much bigger undertaking. You need to manage recordings, checkpoints, and branches, control execution, inject faults, debug failures, explore different schedules, and make all of that work together reliably, and then make it accessible through tools that developers and AI agents can actually use. The goal was never just to build a hypervisor but to make deterministic simulation testing practical for everyone, and that also takes the infrastructure to run it, as deterministic execution needs machines prepared for it. That's why, with Machine, we run that infrastructure for you as a cloud service, where you create a session sized to your work when you need it, and you only pay while your sessions run.

<figure class="post-figure">
<svg viewBox="0 0 760 525" role="img" aria-labelledby="st-title st-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="st-title">What a deterministic simulation testing system takes</title>
<desc id="st-desc">A stack of layers. At the top, you and your AI coding agent. Below, the machine CLI, the Python SDK and the Agent skill; execution control, fault injection, debugging and schedules; recordings, checkpoints, branches and replay; your software and its containers; then the foundation of three layers, Linux in the machine, the deterministic hypervisor and host Linux; and at the bottom, cloud infrastructure with sessions on demand. A bracket marks every layer below you and your agent as TestFlows Machine, with your software shown as yours.</desc>
<style>
.st-you{fill:none;stroke:currentColor;stroke-opacity:.45;stroke-width:1.4;stroke-dasharray:6 4}
.st-m{fill:var(--tf-cta);fill-opacity:.12;stroke:var(--tf-cta);stroke-width:1.5}
.st-f{fill:currentColor;fill-opacity:.06;stroke:currentColor;stroke-opacity:.45;stroke-width:1.4}
.st-t{fill:currentColor;font-size:15px;font-weight:600}
.st-tyou{fill:currentColor;font-size:15px;font-weight:600;fill-opacity:.8}
.st-tf{fill:currentColor;font-size:15px;font-weight:600;fill-opacity:.75}
.st-br{fill:none;stroke:var(--tf-cta);stroke-width:1.6}
.st-brt{fill:var(--tf-cta);font-size:15px;font-weight:700}
.st-fbr{fill:none;stroke:currentColor;stroke-opacity:.55;stroke-width:1.4}
.st-fbt{fill:currentColor;fill-opacity:.65;font-size:13px;font-style:italic}
</style>
<rect class="st-you" x="64" y="20" width="540" height="46" rx="8"/><text class="st-tyou" x="334.0" y="49" text-anchor="middle">You and your AI coding agent</text><rect class="st-m" x="64" y="75" width="540" height="46" rx="8"/><text class="st-t" x="334.0" y="104" text-anchor="middle">machine CLI · Python SDK · Agent skill</text><rect class="st-m" x="64" y="130" width="540" height="46" rx="8"/><text class="st-t" x="334.0" y="159" text-anchor="middle">Execution control · Fault injection · Debugging · Schedules</text><rect class="st-m" x="64" y="185" width="540" height="46" rx="8"/><text class="st-t" x="334.0" y="214" text-anchor="middle">Recordings · Checkpoints · Branches · Replay</text><rect class="st-you" x="64" y="240" width="540" height="46" rx="8"/><text class="st-tyou" x="334.0" y="269" text-anchor="middle">Your software and its containers</text><rect class="st-f" x="64" y="295" width="540" height="46" rx="8"/><text class="st-tf" x="334.0" y="324" text-anchor="middle">Linux in the machine</text><rect class="st-f" x="64" y="350" width="540" height="46" rx="8"/><text class="st-tf" x="334.0" y="379" text-anchor="middle">Deterministic hypervisor</text><rect class="st-f" x="64" y="405" width="540" height="46" rx="8"/><text class="st-tf" x="334.0" y="434" text-anchor="middle">Host Linux</text><rect class="st-m" x="64" y="460" width="540" height="46" rx="8"/><text class="st-t" x="334.0" y="489" text-anchor="middle">Cloud infrastructure · Sessions on demand</text>
<path class="st-br" d="M620,75 q10,0 10,10 V282.5 l8,8 l-8,8 V496 q0,10 -10,10"/><text class="st-brt" x="656" y="295.5">TestFlows</text><text class="st-brt" x="656" y="313.5">Machine</text>
<path class="st-fbr" d="M52,295 q-10,0 -10,10 V365.0 l-8,8 l8,8 V441 q0,10 10,10"/><text class="st-fbt" x="26" y="373.0" text-anchor="middle" transform="rotate(-90 26 373.0)">DST foundation</text>
</svg>
<figcaption>The deterministic hypervisor, with the Linux it runs on and the Linux it runs, is only the foundation. Machine provides the whole system around it and runs it for you.</figcaption>
</figure>

## Get started

We hope you are as excited about the future as we are. You can [create a free account](/machine/portal/signup/) and have your first run in [about five minutes](/docs/machine/getting-started.md#getting-started), either on your own or together with your AI coding agent. Then head over to our public [testflows/Machine](https://github.com/testflows/Machine) repository on GitHub, where you'll find the examples, the Python SDK, and the Machine skill for coding agents, and when you need more than the free plan gives you, take a look at our [pricing](/machine/pricing/).

We'd love to hear what you find, so come and share it with us in the repository's [Discussions](https://github.com/testflows/Machine/discussions).

## What this looks like

To show what this looks like, take [missed-wakeup.c](https://github.com/testflows/Machine/blob/main/examples/starvation/missed-wakeup.c), one of the examples in our public repository. Here are the waiter and the signaler of this simple C program, with their line numbers:

```c
 67	pthread_mutex_lock(&mutex);
 68	waiter_ready = 1;
 69	if (!done) {
 75		pthread_mutex_unlock(&mutex);
 76		pthread_mutex_lock(&mutex);
 	...
 86		rc = pthread_cond_timedwait(&cond, &mutex, &ts);
 87		if (rc == ETIMEDOUT && done) {        /* the missed wakeup */

106	pthread_mutex_lock(&mutex);               /* signaler */
107	done = 1;
108	pthread_cond_signal(&cond);
109	pthread_mutex_unlock(&mutex);
```

The race window is between lines 75 and 76, where the waiter has already seen `done == 0` and dropped the lock. If the signaler runs lines 106 to 109 right then, the signal arrives before the wait on line 86 is armed, wakes nobody, and the waiter sleeps out its whole 50 ms timeout with `done` already set. On real hardware, that window is only a few instructions wide, so the failure shows up once in a while and, you can bet, almost never when you are looking for it.

<figure class="post-figure">
<svg viewBox="0 0 760 560" role="img" aria-labelledby="mw-title mw-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-family:inherit">
<title id="mw-title">The missed wakeup in missed-wakeup.c</title>
<desc id="mw-desc">The waiter checks done under the lock, sees 0, and drops the lock at line 75. While Machine holds it before line 76, the signaler takes the lock, sets done to 1, signals and unlocks. The signal wakes nobody. The waiter then retakes the lock, waits at line 86, and times out after 50 ms with done already 1.</desc>
<style>
.mw-box{fill:var(--tf-card-bg);stroke:currentColor;stroke-opacity:.35;stroke-width:1.2}
.mw-life{stroke:currentColor;stroke-opacity:.35;stroke-width:1.5}
.mw-arrow{stroke:currentColor;stroke-width:1.6;fill:none}
.mw-head{fill:currentColor}
.mw-t{fill:currentColor;font-size:14px}
.mw-h{fill:currentColor;font-size:16px;font-weight:700}
.mw-n{fill:currentColor;fill-opacity:.6;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.mw-win{fill:var(--tf-cta);fill-opacity:.12;stroke:var(--tf-cta);stroke-width:1.5;stroke-dasharray:6 4}
.mw-wt{fill:var(--tf-cta);font-size:13px;font-weight:700}
.mw-bad{stroke:#e0533d;stroke-width:1.6;fill:none;stroke-dasharray:5 4}
.mw-badt{fill:#e0533d;font-size:14px;font-weight:700}
.mw-res{fill:#e0533d;fill-opacity:.1;stroke:#e0533d;stroke-width:1.5}
</style>
<defs><marker id="mw-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="mw-head"/></marker></defs>
<rect class="mw-box" x="60" y="16" width="160" height="44" rx="8"/><text class="mw-h" x="140" y="44" text-anchor="middle">Waiter</text>
<rect class="mw-box" x="260" y="16" width="240" height="44" rx="8"/><text class="mw-h" x="380" y="44" text-anchor="middle">Shared state (mutex, done)</text>
<rect class="mw-box" x="540" y="16" width="160" height="44" rx="8"/><text class="mw-h" x="620" y="44" text-anchor="middle">Signaler</text>
<line class="mw-life" x1="140" y1="60" x2="140" y2="182"/><line class="mw-life" x1="140" y1="360" x2="140" y2="490"/><line class="mw-life" x1="380" y1="60" x2="380" y2="490"/><line class="mw-life" x1="620" y1="60" x2="620" y2="490"/>
<line class="mw-arrow" x1="140" y1="95" x2="372" y2="95" marker-end="url(#mw-ah)"/><text class="mw-t" x="258" y="87" text-anchor="middle">lock</text><text class="mw-n" x="40" y="99">67</text>
<line class="mw-arrow" x1="380" y1="130" x2="148" y2="130" marker-end="url(#mw-ah)"/><text class="mw-t" x="258" y="122" text-anchor="middle">sees done == 0</text><text class="mw-n" x="40" y="134">69</text>
<line class="mw-arrow" x1="140" y1="165" x2="372" y2="165" marker-end="url(#mw-ah)"/><text class="mw-t" x="258" y="157" text-anchor="middle">unlock</text><text class="mw-n" x="40" y="169">75</text>
<rect class="mw-win" x="56" y="182" width="168" height="178" rx="6"/>
<text class="mw-wt" x="140" y="262" text-anchor="middle">Machine holds waiter</text>
<text class="mw-wt" x="140" y="280" text-anchor="middle">after unlock,</text>
<text class="mw-wt" x="140" y="298" text-anchor="middle">before relock</text>
<line class="mw-arrow" x1="620" y1="205" x2="388" y2="205" marker-end="url(#mw-ah)"/><text class="mw-t" x="502" y="197" text-anchor="middle">lock</text><text class="mw-n" x="700" y="209">106</text>
<line class="mw-arrow" x1="620" y1="240" x2="388" y2="240" marker-end="url(#mw-ah)"/><text class="mw-t" x="502" y="232" text-anchor="middle">done = 1</text><text class="mw-n" x="700" y="244">107</text>
<line class="mw-bad" x1="620" y1="285" x2="240" y2="285"/><text class="mw-badt" x="420" y="277" text-anchor="middle">signal wakes nobody</text><text class="mw-badt" x="232" y="290" text-anchor="middle">✕</text><text class="mw-n" x="700" y="289">108</text>
<line class="mw-arrow" x1="620" y1="330" x2="388" y2="330" marker-end="url(#mw-ah)"/><text class="mw-t" x="502" y="322" text-anchor="middle">unlock</text><text class="mw-n" x="700" y="334">109</text>
<line class="mw-arrow" x1="140" y1="385" x2="372" y2="385" marker-end="url(#mw-ah)"/><text class="mw-t" x="258" y="377" text-anchor="middle">lock</text><text class="mw-n" x="40" y="389">76</text>
<line class="mw-arrow" x1="140" y1="420" x2="372" y2="420" marker-end="url(#mw-ah)"/><text class="mw-t" x="258" y="412" text-anchor="middle">pthread_cond_timedwait()</text><text class="mw-n" x="40" y="424">86</text>
<line class="mw-bad" x1="140" y1="428" x2="140" y2="478"/><text class="mw-t" x="152" y="458">50 ms, nobody signals</text>
<rect class="mw-res" x="60" y="496" width="640" height="48" rx="8"/>
<text class="mw-badt" x="380" y="525" text-anchor="middle">ETIMEDOUT with done == 1: FAILURE: missed wakeup</text>
</svg>
<figcaption>Machine holds the waiter between unlocking and relocking the mutex, allowing the signaler to send its signal before the waiter begins waiting. The signal is lost, and the waiter times out.</figcaption>
</figure>

Instead of running the program thousands of times, an agent reads the code and names that window as the suspect.

First, it creates a session with two vCPUs, so that both threads can run at once:

```bash
machine sessions create --cpus 2
```

Then it builds the program with debug information and makes a disk from it that runs a single trial:

```bash
gcc -O0 -g -static -pthread -o missed-wakeup missed-wakeup.c
machine disks build --binary ./missed-wakeup mw -- 1
```

Next, it creates a run from the disk, focuses the program so that its threads can be steered, and runs the machine until the program has started:

```bash
machine create mw --disk mw --cpus 2
machine focus mw add comm=missed-wakeup
machine run mw --until comm=missed-wakeup:exec
machine run mw --until comm=missed-wakeup:sched
```

Now, it sets a breakpoint on line 76 and runs until the waiter stops there. The process and thread IDs shown below are from our run and will differ in yours:

```
$ machine break mw add 254 missed-wakeup.c:76
✔ Breakpoint 1 at waiter+137, missed-wakeup.c:76, in tgid 254
$ machine run mw --iters 0
✔ Stopped at breakpoint 1: waiter+137, missed-wakeup.c:76, in tid 273
```

With the waiter in the race window, it holds it there, removes the breakpoint, and runs the signaler until it has sent its signal:

```
$ machine tasks mw hold 273
✔ Marked 273 to hold
$ machine break mw delete 1
✔ Deleted breakpoint 1
$ machine run mw --until 'tid=274:at=missed-wakeup.c:109'
✔ Reached signaler+139, missed-wakeup.c:109, in tid 274
```

Finally, it releases the waiter and lets the program finish:

```
$ machine tasks mw release 273
✔ Marked 273 to release
$ machine run mw --until 'console~(FAILURE: missed|SUCCESS:)'
$ machine output mw -n : | grep -E 'FAILURE:|SUCCESS:'
app | FAILURE: missed wakeup (trial 0)
```

The bug shows up on the first try. The agent then applies its fix, which rechecks `done` in a loop around the wait:

```diff
-		rc = pthread_cond_timedwait(&cond, &mutex, &ts);
+		rc = 0;
+		while (!done && rc != ETIMEDOUT)
+			rc = pthread_cond_timedwait(&cond, &mutex, &ts);
```

To verify the fix, it builds the fixed program into a disk of its own, `mwfix`, and creates a run from it the same way:

```bash
gcc -O0 -g -static -pthread -o missed-wakeup missed-wakeup.c
machine disks build --binary ./missed-wakeup mwfix -- 1
machine create mwfix --disk mwfix --cpus 2
machine focus mwfix add comm=missed-wakeup
machine run mwfix --until comm=missed-wakeup:exec
machine run mwfix --until comm=missed-wakeup:sched
```

Now, it stops the waiter on the same line and holds it there:

```
$ machine break mwfix add 256 missed-wakeup.c:76
✔ Breakpoint 1 at waiter+137, missed-wakeup.c:76, in tgid 256
$ machine run mwfix --iters 0
✔ Stopped at breakpoint 1: waiter+137, missed-wakeup.c:76, in tid 278
$ machine tasks mwfix hold 278
✔ Marked 278 to hold
$ machine break mwfix delete 1
✔ Deleted breakpoint 1
```

Then it runs the signaler past its signal, which is now on line 111 because the fix added two lines, and releases the waiter:

```
$ machine run mwfix --until 'tid=279:at=missed-wakeup.c:111'
✔ Reached signaler+139, missed-wakeup.c:111, in tid 279
$ machine tasks mwfix release 278
✔ Marked 278 to release
$ machine run mwfix --until 'console~(FAILURE: missed|SUCCESS:)'
$ machine output mwfix -n : | grep -E 'FAILURE:|SUCCESS:'
app | SUCCESS: every wait saw the signal
```

The same interleaving that broke the original now passes, and both runs are recorded, so you can replay either one, step through it, and see for yourself.
