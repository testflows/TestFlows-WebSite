<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Adding Messages

You can add custom messages to your tests using [note() function], [debug() function],
[trace() function], and [message() function].

> **{% attention %}** Use Python [f-string]s if you need to format a message using variables.


## Using `note()`

Use [note() function] to add a note message to your test.

```python
note(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    note(f"Hello {name}!")
```

when executed shows the `note` message.

```bash
Nov 15,2021 14:17:21   ⟥  Scenario my scenario
                 8ms   ⟥    [note] Hello Your Name!
                 8ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `debug()`

Use [debug() function] to add a debug message to your test.

```python
debug(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    debug(f"Hello {name}!")
```

when executed shows the `debug` message.

```bash
Nov 15,2021 14:19:27   ⟥  Scenario my scenario
                 4ms   ⟥    [debug] Hello Your Name!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `trace()`

Use [trace() function] to add a trace message to your test.

```python
trace(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    trace(f"Hello {name}!")
```

when executed shows the `trace` message.

```bash
Nov 15,2021 14:20:17   ⟥  Scenario my scenario
                 4ms   ⟥    [trace] Hello Your Name!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `message()`

Use [message() function] to add a generic message to your test
that could optionally be assigned to a `stream`.

```python
message(message, test=None, stream=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test
* `stream` (option) is a stream with which the message should be associated

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    message(f"Hello {name}!", stream="my stream")
    message(f"Hello {name} there again!", stream="another stream")
```

when executed shows the custom `message`.

```bash
Nov 15,2021 14:37:53   ⟥  Scenario my scenario
                 4ms        [my stream] Hello Your Name!
                 4ms        [another stream] Hello Your Name there again!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `exception()`

Use [exception() function] to manually add an exception message to your test.

```python
exception(exc_type, exc_value, exc_traceback, test=None)
```

where

* `exc_type` exception type
* `exc_value` exception value
* `exc_traceback` exception traceback
* `test` (optional) the instance of the test to which the message will be added, default: current test

> **{% attention %}** The `exc_type`, `exc_value`, and `exc_traceback`
> are usually obtained from [sys.exc_info()] that must be called
> within `except` block.

For example,

```python
import sys
from testflows.core import *

with Scenario("my scenario"):
    try:
        raise RuntimeError("error")
    except:
        exception(*sys.exc_info())
```

when executed shows the `exception` message.

```bash
Nov 15,2021 15:08:48   ⟥  Scenario my scenario
                 4ms   ⟥    Exception: Traceback (most recent call last):
                                File "msgs.py", line 6, in <module>
                                  raise RuntimeError("error")
                              RuntimeError: error
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

# Adding Metrics

You can add `metric` messages to your test using [metric() function].

```python
metric(name, value, units, type=None, group=None, uid=None, base=Metric, test=None)
```

where

* `name` name of the metric
* `value` value of the metric
* `units` units of the metric (string)
* `type` (optional) metric type
* `group` (optional) metric group
* `uid` (optionl) metric unique identifier
* `base` (optional) metric base class, default: [Metric class]
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    metric("my metric", 20.56, "Hz")
```

when executed shows the `metric` message.

```bash
Nov 15,2021 16:44:13   ⟥  Scenario my scenario
                 5ms   ⟥    Metric my metric
                              20.56 Hz
                 5ms   ⟥⟤ OK my scenario, /my scenario
```

You can use `cat test.log | tfs show metrics` command to see all the metrics for a given test.
See [Show Metrics](controlling-output.md#Show-Metrics) and [Metrics Report](logs-and-reports.md#Metrics-Report).

For example,

```bash
cat test.log | tfs show metrics
```
```bash
Scenario /my scenario
  Metric my metric
    20.56 Hz
```

# Reading Input

You can read input during test program execution using [input() function].
This function is commonly used in [Semi-Automated And Manual Tests](#Semi-Automated-And-Manual-Tests).

```python
input(type, multiline=False, choices=None, confirm=True, test=None
```

where

* `type` is either a string or `result` function.
* `multiline` (optional) flag to indicate if input is multiline string, default: `False`
* `choices` (optional) a list of valid options (only applies if `type` is string)
* `confirm` (optional) request confirmation, default: `True`
* `test` the instance of the test that will be associated with the input message, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    input("What is your name?", multiline=False)
```

when executed prompts for `input`

```bash
Nov 15,2021 17:19:25   ⟥  Scenario my scenario
✍  What is your name?
TestFlows
✍  Is this correct [Y/n]? Y
            6s 490ms   ⟥⟤ OK my scenario, /my scenario

```

Also, you can prompt for the result. For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    input(result)
```

when executed prompts for `result`

```bash
Nov 15,2021 17:22:26   ⟥  Scenario my scenario
✍  Enter `my scenario` result? OK success
✍  Is this correct [Y/n]?
            3s 198ms   ⟥⟤ OK my scenario, /my scenario, success
```
