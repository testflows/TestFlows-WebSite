<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Semi-Automated and Manual Tests

Tests can be semi-automated and include one or more manual steps, or
be fully manual.

> **{% attention %}** It is often common to use [input() function] to prompt
> for input during execution of semi-automated or manual tests. See [Reading Input](messages-metrics-and-input.md#Reading-Input).

## Semi-Automated Tests

Semi-automated tests are tests that have one or more steps with the [MANUAL] flag set.

> **{% attention %}** [MANUAL] test flag is propagated down to all sub-tests.

For example,

```python
from testflows.core import *

with Scenario("my mixed scenario"):
    with Given("automated setup"):
        pass
    with Step("manual step", flags=MANUAL):
        pass
```

When a semi-automated test is run, the test program pauses and asks for input
for each manual step.

```bash
Sep 06,2021 18:39:00   ⟥  Scenario my mixed scenario
Sep 06,2021 18:39:00     ⟥  Given automated setup, flags:MANDATORY
               559us     ⟥⟤ OK automated setup, /my mixed scenario/automated setup
Sep 06,2021 18:39:00     ⟥  Step manual step, flags:MANUAL
✍  Enter `manual step` result? OK
✍  Is this correct [Y/n]? Y
            3s 203ms     ⟥⟤ OK manual step, /my mixed scenario/manual step
            3s 212ms   ⟥⟤ OK my mixed scenario, /my mixed scenario
```

## Manual Tests

A manual test is just a test that has [MANUAL] flag set at the test level.
Any sub-tests, such as steps, inherit [MANUAL] flag from the parent test.

> **{% attention %}** Manual tests are best executed using [manual output](controlling-output.md#manual-Output) format.

For example,

```python
from testflows.core import *

with Scenario("manual scenario", flags=MANUAL):
    with Given("manual setup"):
        pass
    with When("manual action"):
        pass
```

When a manual test is run, the test program pauses for each test step as well as to get
the result of the test itself.

```bash
Sep 06,2021 18:44:30   ⟥  Scenario manual scenario, flags:MANUAL
Sep 06,2021 18:44:30     ⟥  Given manual setup, flags:MANUAL|MANDATORY
✍  Enter `manual setup` result? OK
✍  Is this correct [Y/n]? Y
            3s 168ms     ⟥⟤ OK manual setup, /manual scenario/manual setup
Sep 06,2021 18:44:33     ⟥  When manual action, flags:MANUAL
✍  Enter `manual action` result? OK
✍  Is this correct [Y/n]? Y
            6s 529ms     ⟥⟤ OK manual action, /manual scenario/manual action
✍  Enter `manual scenario` result? OK
✍  Is this correct [Y/n]? Y
           13s 368ms   ⟥⟤ OK manual scenario, /manual scenario
```

## Manual With Automated Steps

A test that has [MANUAL] flag could also include some automated steps,
which can be marked as automated using [AUTO] flag.

For example,

```python
from testflows.core import *

with Scenario("manual scenario", flags=MANUAL):
    with Given("manual setup"):
        pass
    with When("automated action", flags=AUTO):
        note("some note")
```

When the above example is executed, it will produce the following output that shows that the
result for `/manual scenario/automated action` was set automatically
based on the automated actions performed in this step.

```bash
Oct 31,2021 18:24:53   ⟥  Scenario manual scenario, flags:MANUAL
Oct 31,2021 18:24:53     ⟥  Given manual setup, flags:MANUAL|MANDATORY
✍  Enter `manual setup` result?
✍  Is this correct [Y/n]?
            1s 410ms     ⟥⟤ OK manual setup, /manual scenario/manual setup
Oct 31,2021 18:24:54     ⟥  When automated action, flags:AUTO
               304us     ⟥    [note] some note
               374us     ⟥⟤ OK automated action, /manual scenario/automated action
✍  Enter `manual scenario` result?
✍  Is this correct [Y/n]?
            5s 611ms   ⟥⟤ OK manual scenario, /manual scenario
```
