# TestFlows

> TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage. TestFlows Machine is a deterministic simulation testing environment for developers and AI coding agents, provided as a self-serve cloud service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Install TestFlows Framework, the TestFlows Machine client, or both, on this computer, one step at a time. Tell your person what you did and anything you need from them.

## OBJECTIVE

Install what your person asks for: the open-source Framework, which is a Python library, the Machine client, which is a command called `machine`, or both. The Machine client also needs an account. You sign it in with your person's help: they read a code from an email or a page and tell it to you.

## DONE WHEN

- Framework: `python3 -c "import testflows.core"` succeeds, and the Hello World test in step 2 runs and exits with status `0`.
- Machine client: `machine --version` prints `Machine Client` and a version.
- Machine account: `machine account whoami` prints your person's account and the API key saved for the client.

## TODO

- [ ] Step 1: ask your person which to install.
- [ ] Step 2: Framework: check Python, install it, run the Hello World test.
- [ ] Step 3: Machine client: check the system, ask for the account, install with the emailed code.
- [ ] Step 4: Machine account: check it.
- [ ] Step 5: tell your person what is installed and what is left.

## Step 1: choose

Ask your person whether they want the Framework, the Machine client, or both. Skip this if they have already said. The two are independent.

## Step 2: install the Framework

It needs Python 3.8 or later.

```bash
python3 --version
pip3 install testflows
```

If `pip3` refuses with `externally-managed-environment`, use a virtual environment, and keep it active for the commands below:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip3 install testflows
```

Check it with a first test. Write this to `test.py`:

```python
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
```

Then run it:

```bash
python3 ./test.py
```

It prints a passing result and exits with status `0`. How to write and run tests: https://testflows.com/framework.md

## Step 3: install the Machine client

Check the system:

```bash
uname -sm
```

The client runs on `Linux x86_64`, `Linux aarch64` and `Darwin arm64`, which is a Mac with Apple Silicon. It does not run on an Intel Mac or natively on Windows; on Windows, use WSL and treat it as Linux. On any other system, stop and tell your person.

It needs the OpenSSH client, `ssh`, which macOS and most Linux systems have. If `ssh` is missing, install it first, for example `sudo apt install openssh-client` on Debian and Ubuntu.

The installer signs in before it downloads: the client is given to an account. Ask your person: "Do you have a TestFlows Machine account? What is your email address?" Signing up is free. No command waits for your person: each one that sends an email returns at once, and the next one takes the code.

```bash
# Has an account: emails a sign-in code
curl https://testflows.com/machine/install -fsS | bash -s -- --email <address>
# Needs one: emails a sign-up link; its page shows the Terms to accept, then a code
curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --signup
```

Ask your person for the code from the email or the page. Then install. The installer never asks for root, installs the client, and saves an API key for it, so the client stays signed in:

```bash
curl https://testflows.com/machine/install -fsS | bash -s -- --email <address> --code <code>
```

A code works once, for 10 minutes, from this computer's network. If the installer refuses it, send a new one. Your person accepts the Terms of Service on the sign-up page; never accept them for your person. If the installer says the Agreement changed, your person accepts it at https://testflows.com/machine/portal/account/ and you install with a new code.

If it says that `~/.local/bin` is not on your `PATH`, add it for this session, and give your person the line the installer printed for their shell profile:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Check it:

```bash
machine --version
```

On a Mac this can run the system's own `/usr/bin/machine` instead, which prints a processor type such as `arm64` and not a version. `which machine` says which one you get: `~/.local/bin/machine` is the client. The installer writes `machine-env` beside the client for that. Run the check through it, and run every later `machine` command the same way, as `machine-env -- machine <arguments>`:

```bash
machine-env -- machine --version
```

## Step 4: check the Machine account

```bash
machine account whoami
```

It names your person's account and the API key saved for the client. Do not buy credits or create or delete other API keys unless your person asks you to. Never print an API key or commit one.

## Step 5: report

Tell your person what is installed, with the versions, and what is left for them, if anything. To work with Machine next: https://testflows.com/machine.md

## EXECUTE NOW

Start with step 1.
