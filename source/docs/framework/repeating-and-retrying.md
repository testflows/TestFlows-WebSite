<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Repeating Tests

You can repeat tests by specifying [repeats] parameter either explicitly
for inline tests or using [Repeats] or [Repeat] decorator for decorated tests.

Repeating a test means to run it multiple times. For each run, a new [Iteration] is
created, with the name being the index of the current iteration. The result of each
iteration is counted, and failures are not ignored.

In general, it's useful to repeat a test when you would like to confirm test stability.
In addition to specifying repeats inside a test program, you can also pass [--repeat option]
to your test program to specify which tests you would like to repeat from the command line.

> {% attention %} If you need to repeat a test and you would like to count only
> the last passing iteration, see [Retrying Tests] section.

You can combine [Repeats] with [Retries] and if done so, retries are performed
for each [Iteration].

By specifying `until` parameter, you can repeat a test `until` either `pass`, `fail` or `complete` criteria is met.

> **{% attention %}** Repeats can only be applied to tests that have a [Test Type] or higher.
> Repeating [Step]s is not supported.

## Until Condition

### `pass`

Until **pass** means that iteration over a test will stop before the specified number of
repeats if an iteration has a passing results. Passing results include [OK], [XFail], [XError], [XOK], [XNull].

### `fail`

Until **fail** means that iteration over a test will stop before the specified number
of repeats if an iteration has a failing results. Failing results include [Fail], [Error], and [Null].

### `complete`

Until **complete** indicates that iteration over a test will end only after the specified number
of repetitions completes, regardless of the outcome of the result of each iteration.


## Repeats

The [Repeats] decorator can be applied to a decorated test that has a [Test Type] or higher.
Repeating test [Step]s is not allowed. The [Repeats] decorator should be used
when you want to specify more than one test to be repeated. The tests to be repeated
are selected using test [pattern]s. The [Repeats] decorator sets [repeats] attribute
of the test.

For example,

```python
@TestFeature
@Repeats({
    "my scenario 0": (5, "pass") # (count, until)
    "my scenario 1": (10, "complete"),
    "my scenario 2": (3, "fail")
})
def my_feature(self):
    Scenario(run="my_scenario")
```

If you want to specify that only one test should repeat, it is more convenient to use [Repeat]
decorator instead.

## Repeat

The [Repeat] decorator is used to specify a repetition for a single test that has
a [Test Type] or higher. Repeating test [Step]s is not allowed. The [Repeat] decorator is
usually applied to the test to which the decorator is attached as, by default, the `pattern` is empty
and means it applies to the current test, and the `until` is set to `complete`
which means that the test will be repeated the specified number of times.

> **{% attention %}** If you need to specify repeat for more than one test,
> use [Repeats] decorator instead.

> **{% attention %}** [Repeat] decorator cannot be applied more than once
> to the same test.

For example,

```python
@TestScenario
@Repeat(5) # by default pattern="", until="complete"
def my_scenario(self):
    pass
```

If you want to specify a custom `pattern` or `until` condition, then pass them
using the parameters `pattern` and `until` respectively.

```python
@TestScenario
@Repeat(count=5, pattern="my subtest", until="fail")
def my_scenario(self):
    Scenario(name="my subtest", run=my_test)
```

# Repeating Code or Function Calls

When you need to repeat a block of code or a function call, you can use
[repeats class] and [repeat() function] respectively. This class and function
are flexible enough to repeat functions or inline code that contains tests.

## Using `repeats()`

The [repeats class] can be used to repeat any block of inline code and is flexible
enough to repeat code that includes tests.

It takes the following optional arguments:

```python
repeats(count=None, until="complete", delay=0, backoff=1, jitter=None)
```

where

* `count` number of iterations, default: `None`
* `until` stop condition, either `pass`, `fail`, or `complete`, default: `complete`
* `delay` delay in seconds between iterations, default: 0 seconds
* `backoff` backoff multiplier that is applied to the delay, default: 1
* `jitter` jitter added to delay between iterations specified as a tuple(min, max), default: `(0,0)`

and returns an iterator that can be used in `for` loop. For each iteration,
the iterator returns an `Iteration` object that you can use to wrap the code that needs to be repeated.

For example, below, we repeat for the code `5` times until all iterations are complete using `0.1` sec delay
between each iteration, a backoff multiplier of `1.2`, and jitter range between `-0.05` min to `0.05` max.

```python
import random
from testflows.core import *
from testflows.asserts import error

with Scenario("my test"):
    with When("I try to get a random number"):
        for iteration in repeats(count=5, until="complete", delay=0.1, backoff=1.2, jitter=(-0.05,0.05)):
            with iteration:
                assert random.random() > 0.8, error()
```

The code block is considered successful if no exception is raised during any of the iterations.
If an exception is raised in the code, the corresponding iteration is marked as failed.
The until condition controls when to stop iterations.


## Using `repeat()`

The [repeat() function] can be used to repeat any function call
including decorated tests.

It takes the following arguments, where only `func` is mandatory.

```python
repeat(func, count=None, until="complete", delay=0, backoff=1, jitter=None)(*args, **kwargs)
```

where

* `func` is the function to be retried
* `count` is the number of iterations, default: `None`
* `until` stop condition, either `pass`, `fail`, or `complete`, default: `complete`
* `delay` delay between iterations in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter
  normally distributed between the `min` and `max` values, default: `None`

that returns a wrapper function, which then can be called with any arguments that are
passed to the repeated `func` on each iteration.

For example,

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

with Test("my test"):
    value = repeat(my_func, count=5)(0.2)
```

Here is an example that shows how [repeat() function] can be used to repeat a test step.

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    note(repeat(my_step, count=5)(x=0.2)[0].result.value)
```

The same behavior can be achieved by setting `repeats` attribute of the test.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    When("I run my step", test=my_step, repeats=Repeat(count=5))(x=0.2)
```

You can also use `repeat() function` inside an inline step.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    with When("I run my step"):
        repeat(my_step, count=5)(x=0.2)
```

# Retrying Tests

You can retry tests until they pass or until the number of retries is exhausted
or a timeout is reached by specifying [retries] parameter either explicitly
for inline tests or using [Retries] or [Retry] decorator for decorated tests.

Retrying a test means to run it multiple times until it passes.
A pass means that a retry has either [OK], [XFail], [XError], [XNull], [XOK], or [Skip]
result.

For each attempt, a [RetryIteration] is created with a name corresponding to the
attempt number. Any failures of an individual
attempt are ignored except for the last retry attempt. The last [RetryIteration]
is marked using [LAST_RETRY] flag.

In general, it's useful to retry a test when test is unstable and sometimes could fail.
However, you still would like to run it as long as it passes within the specified number
of attempts or within a specified timeout period.

## Retries

The [Retries] decorator can be applied to any decorated test, including steps or higher.
The [Retries] decorator should be used when you want to specify more than one test to be retried.
The tests to be retried are selected using test [pattern]s. The [Retries] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes, the maximum
number of retries is reached, or timeout occurs if a timeout was specified.

The [Retries] decorator takes as an argument a dictionary of the following form

```python
{
    pattern: count[, timeout[, delay[, backoff[, jitter[, initial_delay]]]]],
    ...
}
```

where

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter
  normally distributed between the `min` and `max` values, default: `None`
* `initial_delay` initial delay in seconds, default: `0`

If both `count` and `timeout` are specified, then the test is retried
either until the maximum retry `count` is reached or `timeout` is hit - whichever comes first.

> **{% attention %}** By default, if the number of retries or timeout is not specified, then
> the test will be retried until it passes, but note that if the test can't reach a passing result
> then it can lead to an infinite loop.

For example,

```python
@TestFeature
@Retries({
    "my scenario 0": 5,
    "my scenario 1": 10
})
def my_feature(self):
    Scenario(name="my scenario 0", run=my_scenario)
    Scenario(name="my scenario 1", run=my_scenario)
```

will retry test `my scenario 0` up to `5` times and `my scenario 1` up to 10 times.

If you want to retry only one test, it is more convenient to use [Retry]
decorator instead.

## Retry

The [Retry] decorator is used to specify a retry for a single test that has
a [Step Type] or higher. The [Retry] decorator is
usually applied to the test to which the decorator is attached, as by default, the `pattern` is empty,
which means it applies to the current test.
The [Retry] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes, the maximum
number of retries or timeout is reached.

> **{% attention %}** If you need to specify retries for more than one test,
> use [Retries] decorator instead.

> **{% attention %}** [Retry] decorator cannot be applied more than once
> for the same test.

The [Retry] decorator can take the following optional arguments

```python
Retry(count=None, timeout=None, delay=0, backoff=1, jitter=None, pattern="", initial_delay=0)
```

where

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter
  normally distributed between the `min` and `max` values, default: `None`
* `pattern` is the test name pattern, default: `""` which means the current test
* `initial_delay` initial delay in seconds, default: `0`

If both `count` and `timeout` are specified, then the test is retried until
either the maximum retry `count` is reached or `timeout` is hit - whichever comes first.

> **{% attention %}** By default, if number of retries or timeout is not specified, then
> the test will be retried until it passes, but note that if the test can't reach a passing result
> then it can lead to an infinite loop.

For example,

```python
@TestScenario
@Retry(5) # by default pattern=""
def my_scenario(self):
    pass
```

or you can specify `pattern` explicitly. For example,

```python
@TestScenario
@Retry(5, pattern="test to repeat")
def my_scenario(self):
    pass
```

# Retrying Code or Function Calls

When you need to retry a block of code or a function call, you can use
[retries class] and [retry() function] respectively. This class and function
are flexible enough to retry functions or inline code that contains tests.

## Using `retries()`

The [retries class] can be used to retry any block of inline code and is flexible
enough to retry code that includes tests.

It takes the following optional arguments:

```python
retries(count=None, timeout=None, delay=0, backoff=1, jitter=None, initial_delay=0)
```

where

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter
  normally distributed between the `min` and `max` values, default: `None`
* `initial_delay` initial delay in seconds, default: `0`

and returns an iterator that can be used in `for` loop. For each iteration,
the iterator returns a `RetryIteration` object that wraps the code that needs to be retried.

For example, below we wait for the code to succeed within `5` sec using `0.1` sec delay
between retries and backoff multiplier of `1.2` with a jitter range
of `-0.05` min to `0.05` max.

```python
import random
from testflows.core import *
from testflows.asserts import error

with Scenario("my test"):
    with When("I try to get a random number"):
        for attempt in retries(timeout=5, delay=0.1, backoff=1.2, jitter=(-0.05,0.05)):
            with attempt:
                assert random.random() > 0.8, error()
```

The code block is considered successful if no exception is raised.

If an exception is raised, the code is retried until it succeeds, or, if specified,
the maximum number of retries or timeout is reached.


## Using `retry()`

The [retry() function] can be used to retry any function call,
including decorated tests.

It takes the following arguments, where only `func` is mandatory.

```python
retry(func, count=None, timeout=None, delay=0, backoff=1, jitter=None, initial_delay=0)(*args, **kwargs)
```

where

* `func` is the function to be retried
* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter
  normally distributed between the `min` and `max` values, default: `None`
* `initial_delay` initial delay in seconds, default: `0`

that returns a wrapper function, which then can be called with any arguments that are
passed to the retried `func` on each retry.

For example,

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

with Test("my test"):
    value = retry(my_func, timeout=5)(0.2)
```

Here is an example that shows how [retry() function] can be used to retry a test step.

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    note(retry(my_step, timeout=5)(x=0.2).result.value)
```

The same behavior can be achieved by setting `retries` attribute of the test.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    When("I run my step", test=my_step, retries=Retry(timeout=5))(x=0.2)
```

You can also use `retry() function` inside an inline step.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    with When("I run my step"):
        retry(my_step, timeout=5)(x=0.2)
```
