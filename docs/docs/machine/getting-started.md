<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Getting started

## The client

You work with Machine through a client called `machine`. Install it with one
command:

```bash
curl https://testflows.com/machine/install -fsS | bash
```

That downloads a single binary named `machine` over HTTPS, checks it against the
SHA-256 checksum published next to it, and puts it in `~/.local/bin`, with
`machine-env` beside it. If the checksum doesn't match, nothing is installed. If that folder isn't on your `PATH`
yet, the installer says so and shows the line to add for your shell. Run the same
command again whenever you want to update.

**Supported systems.** The client runs on Linux, x86_64 and arm64, and on Macs
with Apple Silicon. It needs only the OpenSSH client, which macOS and most
Linux systems already have, and the installer never asks for root. If `ssh` is
missing, install it with your package manager, for example
`sudo apt install openssh-client` on Debian and Ubuntu. It doesn't run on Intel Macs or natively on Windows; on Windows
you can use it inside WSL. On an ARM machine, a Mac with Apple Silicon
or arm64 Linux, the disks you build must still hold x86_64 programs; see
[building disks on an ARM machine](disks.md#building-disks-on-an-arm-machine). If you
need another platform,
[contact us](/contact.html?topic=machine) and tell us which one. The
[download page](/machine/download/) has the full list, and a way to check the
download yourself.

**Behind a proxy that inspects TLS.** The client trusts only Let's Encrypt,
which issues the certificate of the Machine API, so a certificate from any other
CA is refused, a proxy's included. The error names
`TESTFLOWS_MACHINE_API_CA_FILE`, an environment variable the client reads: set
it to a PEM file of the CAs to trust instead, such as your proxy's.

```bash
export TESTFLOWS_MACHINE_API_CA_FILE=/etc/ssl/certs/corporate-proxy-ca.pem
```

The file replaces the Let's Encrypt roots rather than adding to them. If the
client must also connect without the proxy, add the
[Let's Encrypt roots](https://letsencrypt.org/certificates/) to the same file.
The variable applies to the connection to the API alone: sessions are reached
over SSH with certificates TestFlows issues, and image pulls use your system's
CAs. A file that is missing or holds no certificate is refused, and the error
names the file. The Python SDK reads the same variable.

**On a Mac, use `machine-env`.** macOS ships its own `/usr/bin/machine`, which
prints the processor type, so typing `machine` may not run the client. Putting
the client first on your `PATH` would hide the system command for every other
program. `machine-env`, which the installer writes on every system, starts a
shell in which `machine` is the client and changes nothing else. Its prompt
starts with `(machine)`, your usual shell setup is loaded, and `exit` leaves. It
supports zsh and bash.

```bash
$ machine-env
(machine) $ machine login
(machine) $ machine --version
(machine) $ exit
$
```

The `(machine)` at the start of the prompt says you are in it: there `machine` is this client. `exit` leaves it, back to the shell you were in. To run one command there without starting a shell:

```bash
machine-env -- machine --version
```

That form runs one command in that environment and starts no shell, which
suits scripts and CI. To see which `machine` you get, run `which machine`:
`~/.local/bin/machine` is the client and `/usr/bin/machine` is the system's. If
`machine --version` prints a processor type instead of a version, you are
running the system command. On Linux, if another command on your system is
also named `machine`, use `machine-env` the same way.

To read the installer first, install a specific version or into another folder,
check the download by hand, or uninstall, see the [download page](/machine/download/).

Run `machine` with no arguments, or with `--help`, to see every command. Each
command has its own `--help` too, and that is the place to look when a flag here
is not enough.

```bash
machine --help
machine fork --help
```

[`machine --version`](commands.md#options) prints the client's version and its license. Include the
version when you report a problem.

```bash
machine --version
```
```bash
  ---- o o o ----
 |   o       o   |
 | 1 o 10010 o 0 |
 |   o       o   |  TestFlows™ Machine Client YYYYMMDD-HHMM
  ---  o o oxx --
 /           xx   \
/  ^^^        xx   \
 ------------------

Copyright (C) 2026 Katteli Inc. All rights reserved.
TestFlows.com Open-Source Software Testing Framework (https://testflows.com)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, ...
```

If something does not work, [`machine ping`](commands.md#machine-ping) checks that you can reach the
service and your sessions, and how long the round trip takes.

In `machine-env`, Tab already completes commands, options and their values,
and the names of your runs. Where `machine` is the client in every shell, as on
most Linux systems, add the line for your shell to its startup file to have
the same there. On a Mac, use `machine-env` instead: outside it, `machine` is
the system's command, and the line would run that one.

```bash
eval "$(machine completion bash)"     # ~/.bashrc
eval "$(machine completion zsh)"      # ~/.zshrc
machine completion fish | source      # ~/.config/fish/config.fish
```

The client answers each Tab itself, from its own commands, so a newer client
needs no newer line.

To try it in one terminal first, run the same line there instead. Tab
completes in that shell until it exits, and no other shell changes.

## Signing up

Create your account on the [sign-up page](/machine/portal/signup/), or from
the terminal with [`machine account signup`](commands.md#machine-account-signup). Then sign in from the terminal.

```bash
machine login
```

Machine emails you a one-time code and asks for it. You stay signed in until
you sign out with [`machine logout`](commands.md#machine-logout). [`machine account show`](commands.md#machine-account-show) tells you who you
are signed in as.

For scripts and CI there is no need to sign in at all. Create an API key and
put it in the `TESTFLOWS_MACHINE_API_KEY` environment variable.

```bash
machine account api-keys create ci --expiry 90
```

When you create your first session, Machine sets up your account's storage
first, so that session takes longer to create. To do that step on its own
beforehand, run [`machine account provision`](commands.md#machine-account-provision).

## Your first run

If you have not yet signed up and signed in, do that first: see [Signing up](getting-started.md#signing-up).

This example creates a session, builds a disk, runs a program, saves a
checkpoint and starts a branch from it. The program is one line of Python, and
you need nothing installed but the client: no Docker and no compiler.

First, create a session. Machine makes it the one your commands use.

```bash
machine sessions create first --cpus 2
```
```bash
✔ Session first is running.
✔ Now using session first in this terminal.
```

Next, save this as `hello.py`.

```python
print("hello, world")
```

Build a disk named `hello` that runs it. `--from` names the public Python
image, `--add` puts your file in it, and what follows `--` is the command the
machine runs.

```bash
machine disks build --from python:3.12-slim --add hello.py hello -- python hello.py
```
```bash
➤ Packing hello (1 service)
➤ Hashing hello.pack
➤ Waiting for the receiver…
➤ Uploading 20.5kB → hello
➤ Building the disk…
✔ Built hello
  Boot machine create --disk hello
```

Only your file is uploaded. The build pulls the image itself and writes it
onto the disk, which takes about two minutes for an image of this size. You
build a disk once and create as many runs from it as you like.

A program you compile, an image of your own, or several services together
build the same way from other sources. See [Disks](disks.md).

Create a run from the disk. The machine waits for your commands. With
`--no-daemon` it would boot and run to the end by itself.

```bash
machine create hello-run --disk hello
```
```bash
✔ Started hello-run (whUxdR33Zad9Qxc0ASfig)
```

Now the run is waiting. It only moves when you drive it, and [`machine run`](commands.md#machine-run) is how
you drive it. The `--until tasks` part means "keep going until Linux is up."

```bash
machine run hello-run --until tasks
```
```bash
iterations: 15646  run ic: 271676660  vtime: +0.692741050s

VCPU  EXIT       ID     RUN IC     RCB     TOTAL IC   REGS HASH          RIP                 RCX       ITER
0     HYPERCALL  15791  271676660  192153  271676660  0x785930775efa707  0xffffffff81f9eeda  43778048  15645
```

Read the last five lines the machine printed.

```bash
machine output hello-run -n -5
```
```bash
futex hash table entries: 256 (order: 2, 16384 bytes, linear)
NET: Registered PF_NETLINK/PF_ROUTE protocol family
thermal_sys: Registered thermal governor 'step_wise'
thermal_sys: Registered thermal governor 'user_space'
cpuidle: using governor ladder
```

To see the full console log, use `-n :`. Ranges use the same colon as a Python slice. Lines are numbered from 1 and both ends count, so `-n 1:` is the first line through the last.

A negative number counts from the end, and `-1` is the last line. `-n -5` and `-n -5:` are the last five lines, and `-n -10:-2` is the tenth line from the end through the second. Both ends of a range count from the same end.

Save the machine's state so you can come back to it, and start a branch from
that point.

```bash
machine checkpoint hello-run booted
```
```bash
✔ Created checkpoint booted at entry 15792
  Make it durable machine sync hello-run
```

The checkpoint is in your session. [`machine sync`](commands.md#machine-sync) publishes the run, so the
checkpoint outlasts the session and another session can start from it.
Stopping the machine publishes it too.

```bash
machine fork hello-run --at ^booted --name try-1
```
```bash
✔ Forked hello-run/try-1 (whUxfLYSFJMDHzKaiBOvH)
```

The branch starts exactly where `booted` was taken. Notice its full name,
`hello-run/try-1`. A branch is named after the run its tree starts from, a
slash, and the name you gave it. Look at the tree.

```bash
machine branches hello-run
```
```bash
● hello-run (whUxdR33Zad9Qxc0ASfig) [0, ∞)  ← current
╰─ @15792 0.692741050s+1 → ● hello-run/try-1 (whUxfLYSFJMDHzKaiBOvH) [15793, ∞)
```

Linux is up on the branch and your program has not started yet. Drive the
branch until the machine shuts down, which it does when the program exits.

```bash
machine run hello-run/try-1 --until halted
```
```bash
iterations: 17148  run ic: 2095789032  checkpoints: 1

VCPU  EXIT                ID     RUN IC      RCB  TOTAL IC    REGS HASH           RIP                 RCX  ITER
0     IO (EXIT_SHUTDOWN)  40050  2095789032  39   2367459400  0x62064a27645eaf14  0xffffffff8103f4fc  0    17147
```

The program's own lines start with `app-1`. Find them in the branch's console.

```bash
machine output hello-run/try-1 -n : | grep app-1
```
```bash
app-1  | hello, world
app-1 exited with code 0
```

The parent `hello-run` is still at `booted`, with the program yet to run. You
can fork it again and get the same start every time.

When you are done, delete the runs and then the session. A run keeps its log
and checkpoints until you delete it, and a session costs money until you do.

```bash
machine delete hello-run --recursive --stop --yes
machine sessions delete first --yes
```

That's the whole loop. You built a disk, saved a point in a run, branched from
there and ran a program to its end. Everything else in this page is a variation on it.
