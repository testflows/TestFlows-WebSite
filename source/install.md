# TestFlows

> TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage. TestFlows Machine is a deterministic execution machine in the cloud, provided as a self-serve service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Install TestFlows Framework, the TestFlows Machine client, or both, on this computer, one step at a time. Tell your person what you did and anything you need from them.

## OBJECTIVE

Install what your person asks for: the open-source Framework, which is a Python library, the Machine client, which is a command called `machine`, or both. The Machine client also needs an account, which only your person can create and sign in to.

## DONE WHEN

- Framework: `python3 -c "import testflows.core"` succeeds, and the Hello World test in step 2 runs and exits with status `0`.
- Machine client: `machine --version` prints `TestFlows Machine Client` and a version.
- Machine account: `machine account show` prints your person's account. Until they have signed in it exits with status `2` and says `Not signed in`. That is expected: finish step 4 with them.

## TODO

- [ ] Step 1: ask your person which to install.
- [ ] Step 2: Framework: check Python, install it, run the Hello World test.
- [ ] Step 3: Machine client: check the system, run the installer, check the version.
- [ ] Step 4: Machine account: your person signs up and signs in, or gives you an API key.
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

Install it. It never asks for root:

```bash
curl https://testflows.com/machine/install -fsS | bash
```

If it says that `~/.local/bin` is not on your `PATH`, add it for this session, and give your person the line the installer printed for their shell profile:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Check it:

```bash
machine --version
```

## Step 4: the Machine account, which needs your person

You cannot do this step for your person. Do not buy credits or create or delete API keys unless they ask you to. Never print an API key or commit one.

1. They create an account, which is free, at https://testflows.com/machine/portal/signup/
2. They sign in, in one of two ways:
   - **On this computer:** they run `machine login` themselves and type the one-time code that is emailed to them. They stay signed in until `machine logout`.
   - **With an API key,** for a sandbox or CI where they cannot sign in: they run `machine account api-keys create <name> --expiry 30`, which needs a sign-in code, copy the secret, which is shown once, and put it in the environment variable `TESTFLOWS_MACHINE_API_KEY` for you.
3. Check it:

```bash
machine account show
```

## Step 5: report

Tell your person what is installed, with the versions, and what is left for them, if anything. To work with Machine next: https://testflows.com/machine.md

## EXECUTE NOW

Start with step 1.
