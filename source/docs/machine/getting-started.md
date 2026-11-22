<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Getting started

## The client

You work with Machine through a client called `machine`. Install it with one
command:

```bash
curl https://testflows.com/machine/install -fsS | bash
```

The client is available only with a TestFlows account, so the installer first
signs you in, or creates your account, at the terminal: you give your email and
the code sent to it. If your account has not accepted the current Terms of
Service and Client EULA, the installer shows both and asks you to accept them
before anything is downloaded. The
installer signs out when it ends, so sign in with `machine login` afterwards.
Without a terminal, as in CI, the installer takes an API key from
`TESTFLOWS_MACHINE_API_KEY` instead, from an account that has accepted them.

The installer then downloads the client over HTTPS, checks it against the
SHA-256 checksum published next to it, and puts `machine` and `machine-env` in
`~/.local/bin`. If the checksum doesn't match, nothing is installed. Where
another program named `machine` is already on your `PATH`, as
`/usr/bin/machine` is on a Mac, `machine` goes to `~/.local/share/machine/bin`
instead, which is not on your `PATH`, and `~/.local/bin` holds `machine-env`
alone. If `~/.local/bin` isn't on your `PATH` yet and your shell is bash or
zsh, the installer offers to add it to `~/.bashrc` or `~/.zshrc`. Otherwise,
or if you decline, it shows you the line to add yourself.
The installer also puts the SDK Core,
which the [Python SDK](python-sdk.md#installing) runs on, in
`~/.testflows/machine/sdk`, checked the same way. Run the same command again
whenever you want to update.

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
CA is refused, including a proxy's. The error names
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
shell in which `machine` is the client and changes nothing else. The shell
loads your usual setup, and its prompt starts with `(machine)`. `machine-env`
supports zsh and bash.

```bash
$ machine-env
(machine) $ machine login
(machine) $ machine --version
(machine) $ exit
$
```

While the prompt starts with `(machine)`, `machine` is the client. `exit` returns you to the shell you were in. To run one command in this environment without starting a shell:

```bash
machine-env -- machine --version
```

This form suits scripts and CI. To see which `machine` you get, run `which machine`:
`/usr/bin/machine` is the system's, and the client is
`~/.local/share/machine/bin/machine` on a Mac or `~/.local/bin/machine` on
Linux. If
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
version when you [report a problem](getting-started.md#getting-help).

```bash
machine --version
```
```bash
  ---- o o o ----
 |   o       o   |
 | 1 o 10010 o 0 |
 |   o       o   |  TestFlows Machine Client YYYYMMDD-HHMM
  ---  o o oxx --   https://testflows.com
 /           xx   \
/  ^^^        xx   \
 ------------------

Copyright (C) 2026 Katteli Inc. All rights reserved.

Licensed under the Client EULA:
https://testflows.com/machine/legal/client-eula/
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

The client computes each completion itself from its own commands, so the line
does not change when you update the client.

To try it in one terminal first, run the same line there instead. Tab
completes in that shell until it exits, and no other shell changes.

## Signing up

The installer creates your account if you have none. You can also create it on
the [sign-up page](/machine/portal/signup/), or from the terminal with [`machine account signup`](commands.md#machine-account-signup). Then sign in from the terminal.

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

A coding agent signs the client in with your help, because its shell has no
terminal to type a code at. It asks for your email address and runs
`machine login --email you@example.com`, or
`machine account signup --email you@example.com` if you have no account yet.
You tell it the code from the email, or from the page the sign-up link opens,
where you also accept the Terms of Service. The agent then signs in with the
code and saves an API key for the client, so the client stays signed in after
the login ends:

```bash
machine login --email you@example.com --code 482913
machine account api-keys create laptop --save
```

The client uses `TESTFLOWS_MACHINE_API_KEY` when it is set, then the login,
then the saved key. [`machine account whoami`](commands.md#machine-account-whoami)
says which account and which of them the client uses. Signing out with
`machine logout` leaves the saved key, and deleting the key with
`machine account api-keys delete` removes it from the client.

When you create your first session, Machine sets up your account's storage
first, so that session takes longer to create. To do that step on its own
beforehand, run [`machine account provision`](commands.md#machine-account-provision).

## Your first run

If you have not yet signed up and signed in, do that first: see [Signing up](getting-started.md#signing-up).

This example creates a session, builds a disk, runs a program, creates a
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
➤ Waiting for the upload to start  2s
➤ Uploading 20.5kB → hello
➤ Building the disk  900ms
➤ Pulling the images  6s
➤ Writing the images  5s
➤ Hashing the disk  7s
➤ Storing the disk  21s
✔ Built hello
  Boot machine create --disk hello
```

Only your file is uploaded. The build pulls the image itself and writes it
onto the disk, which takes about a minute for an image of this size. You
build a disk once and create as many runs from it as you like.

A program you compile, an image of your own, or several services together
build the same way from other sources. See [Disks](disks.md).

Create a run from the disk. By default, the machine then waits for your
commands. With `--no-daemon`, it would boot and run to the end by itself.

```bash
machine create hello-run --disk hello
```
```bash
✔ Started hello-run (wiceT2fDBSIct7ewdeiAb)
```

Now the run is waiting. It only moves when you drive it, and [`machine run`](commands.md#machine-run) is how
you drive it. The `--until tasks` part means "keep going until Linux is up."

```bash
machine run hello-run --until tasks
```
```bash
iterations: 15647  run ic: 276752606  vtime: +0.785224370s  checkpoints: 1

VCPU  EXIT       ID     RUN IC     RCB     TOTAL IC   REGS HASH           RIP                 RCX       ITER
0     HYPERCALL  15790  276752606  310967  276752606  0x149d66b90aed56a7  0xffffffff81fb3074  43778048  15646
```

Read the last five lines the machine printed. `--plain` prints only the
lines. Without it, a terminal also shows the entry, the source and the number
of each line.

```bash
machine output hello-run -n -5 --plain
```
```bash
NET: Registered PF_NETLINK/PF_ROUTE protocol family
thermal_sys: Registered thermal governor 'step_wise'
thermal_sys: Registered thermal governor 'user_space'
cpuidle: using governor ladder
cpuidle: using governor menu
```

To see the full console log, use `-n :`. Ranges use the same colon as a Python slice. Lines are numbered from 1 and both ends count, so `-n 1:` is the first line through the last.

A negative number counts from the end, and `-1` is the last line. `-n -5` and `-n -5:` are the last five lines, and `-n -10:-2` is the tenth line from the end through the second. Both ends of a range count from the same end.

Create a checkpoint of the machine's state so you can come back to it, and
start a branch from there.

```bash
machine checkpoint hello-run booted
```
```bash
  Checkpointing: writing state 100%  130ms
✔ Created checkpoint booted at entry 15790
  Make it durable machine sync hello-run
```

The checkpoint is in your session. [`machine sync`](commands.md#machine-sync) publishes the run, so the
checkpoint outlasts the session and another session can start from it.
Stopping the machine publishes it too.

```bash
machine fork hello-run --at ^booted --name try-1
```
```bash
  Branching  170ms
  Branching  1s
  Branching  2s
  Branching  3s
✔ Forked hello-run/try-1 (wiceUDYg8Ot26kHsV1LAE)
  From checkpoint 15790 of hello-run, nothing replayed
```

The branch starts exactly where `booted` was taken. Its full name,
`hello-run/try-1`, is the name of the root of its tree, a slash, and the name
you gave it. Look at the tree.

```bash
machine branches hello-run
```
```bash
● hello-run (wiceT2fDBSIct7ewdeiAb) [0, ∞)  ← this run
╰─ @15790 0.785224370s → ● hello-run/try-1 (wiceUDYg8Ot26kHsV1LAE) [15791, ∞)
```

Linux is up on the branch and your program has not started yet. Drive the
branch until the machine shuts down, which it does when the program exits.

```bash
machine run hello-run/try-1 --until halted
```
```bash
iterations: 9168  run ic: 2810612750  vtime: +4.606870296s  checkpoints: 1

VCPU  EXIT                ID     RUN IC      RCB  TOTAL IC    REGS HASH           RIP                 RCX  ITER
0     IO (EXIT_SHUTDOWN)  31283  2810612750  39   3087365356  0x6d5c6eda235eaf14  0xffffffff8103f4fc  0    9167
```

Your program runs as a service named `app`, so each line it prints starts
with `app |`. When it exits, the machine says so on a line of its own. Find
these lines in the branch's console.

```bash
machine output hello-run/try-1 -n : | grep 'app '
```
```bash
app | hello, world
=== app exited by itself: code 0 ===
```

The parent `hello-run` is still at `booted`, with the program yet to run. You
can fork it again and get the same start every time.

When you are done, delete the runs and then the session. A run keeps its log
and checkpoints until you delete it, and a session costs money until you do.

```bash
machine delete hello-run --recursive --stop --yes
machine sessions delete first --yes
```

That is the whole workflow. You built a disk, created a checkpoint in a run,
forked a branch from it and ran a program to its end. Everything else in these
docs is a variation on it.

## Getting help

TestFlows Machine is in public beta, and reports from users directly influence
what gets fixed and built next. Report bugs, request features and ask
questions in the [TestFlows Machine repository](https://github.com/testflows/Machine) on GitHub.

To report a bug, search the [issues](https://github.com/testflows/Machine/issues) first, then
[open an issue](https://github.com/testflows/Machine/issues/new/choose) with the commands you ran, what you
expected, what happened, and the output of `machine --version`. To request a
feature, [open a feature request](https://github.com/testflows/Machine/issues/new/choose) that describes what
you're trying to do. To ask a question or share an idea, start a discussion in
[Discussions](https://github.com/testflows/Machine/discussions). You can also send feedback through the
[contact form](/contact.html?topic=Machine%20feedback).

> **{% attention %}** Issues and discussions are public. Never include an API
> key, a token, a password or other secrets in them.

For questions about your account or billing, email `support@testflows.com`.
For privacy-related questions, email `privacy@testflows.com`. Report
abuse to `abuse@testflows.com`. Report security vulnerabilities to
`security@testflows.com`, or through GitHub's
[private vulnerability reporting](https://github.com/testflows/Machine/security/advisories/new).
