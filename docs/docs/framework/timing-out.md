<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Timing Out Tests

You can set a timeout for a test by specifying the [timeouts] parameter explicitly
for inline tests or using the [Timeouts] or [Timeout] decorator for decorated tests.

Tests can have one or more [Timeout]s and inherit any timeouts from the parent test.
If `started` is not set, then the current test's start time is used.

Timeouts are cumulative, and any explicitly set timeout can't be overwritten.
Timeouts are defined using a list of the [Timeout] objects.

Timeouts can also be set externally using the [xargs] parameter that sets the [timeouts] parameter.
See the [xargs] for more details. Given that timeouts are cumulative, make sure that the pattern used
in the [xargs] is unique and does not match the parent and its child tests
at the same time, otherwise the list of timeouts will contain duplicate entries.

The test timeout is evaluated at the start of the test. If the timeout value is reached, a [Fail] result
is raised, and the test body is not executed. Given that child tests inherit
timeouts from the parent, the timeout is propagated down the test [Test Program Tree].

> **{% attention %}** Given that the test timeouts are evaluated only at the start of the test,
> it means that timeouts can be exceeded in any code that does not include
> sub-tests or steps.

Here is an example of a test with a timeout that uses a step inside
the for-loop. The **timeout will be hit** during execution of the `When` step
as it will inherit the timeout from its parent.

```python
with Test("my test", timeouts=[Timeout(10)]):
    for i in range(12):
        # timeout will be hit
        with When(f"I do something #{i}"):
            time.sleep(1)
```

Here is an example of the test where the **timeout will not be hit** as there are no sub-tests or
steps inside the for-loop.

```python
with Test("my test", timeouts=[Timeout(10)]):
    # timeout will be exceeded
    for i in range(12):
        time.sleep(1)
```

# Timing and Timing Out Code

You can place stopwatches and timeouts in your test code using a [Timer class] object.
The object should be used as the context manager that wraps
the code that needs to be timed or checked for a timeout before it gets
executed.

> **{% attention %}** The [Timer] object's timeout is only evaluated during
> the start of the code wrapped with the timer context manager.

## Using `timer()`

The [timer] is an alias for the [Timer class] object. See [Using Timer].

## Using `Timer()`

The [Timer class] object can be used to check for a timeout or as a stopwatch.
Once created, it can be used as a context manager.

```python
Timer(timeout=None, message=None, started=None)
```

where

* `timeout` timeout in sec, default: `Non3`
* `message` custom timeout error message, default: `None`
* `started` start time, default: `None` (set to current time)

The object has an `elapsed` attribute to get the current elapsed time,
which is the difference between the current and the `started` time.

The [Timer] object can be used for checking for a timeout if the `timeout` parameter is set.

```python
timeout = Timer(10)

for i in range(10):
    # check for timeout before some operation
    with timeout:
        time.sleep(1)
```

The [Timer class] object can be re-used as the `started` time is fixed to the initial value.


```python
# started time is fixed here and is set to the current time by default
timeout = Timer(10)

for i in range(5):
    # check for timeout before some operation
    with timeout:
        time.sleep(1)

for j in range(5)
    # check again for timeout before some operation
    with timeout:
        time.sleep()
```

Another approach is to keep the `started` time fixed explicitly as follows:

```python
started = time.time()

for i in range(10):
    # check for timeout before some operation
    with Timeout(10, started=started):
        time.sleep(1)
```

The [Timer] object can also be used as a stopwatch if the `timeout` parameter is not specified.

```python
stopwatch = Timer()

with stopwatch:
    for i in range(10):
        time.sleep(1)

# check elapsed time
assert stopwatch.elapsed > 10
```
