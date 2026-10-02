<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Async Tests

Asynchronous tests are natively supported.
All asynchronous tests get [ASYNC](test-program-options.md#ASYNC) flag set in [flags].

> **{% attention %}** Note that the top level test must *not* be asynchronous.

If you try to run an asynchronous test as the top level test, you will get an error:

> `error: top level test was not started in main thread`

## Inline Async Tests

An inline asynchronous test can be defined using [async with] statement as follows.

```python
from testflows.core import *

@TestSuite
async def suite(self):
    async with Test("my async test"):
        async with Step("my async test step"):
            note("Hello from asyncio!")

with Module("module"):
    suite()
```

## Decorated Async Tests

A decorated asynchronous test can be defined in a similar way as a non-asynchronous test.
The only difference is that the decorated function must be asynchronous
and be defined using `async def` keyword just like any other asynchronous function.

```python
from testflows.core import *

@TestScenario
async def my_test(self, number):
    note("Hello from async scenario {number}!")

@TestSuite
async def suite(self):
    await Scenario(name="my test 0", test=my_test)(number=0)
    await Scenario(name="my test 1", test=my_test)(number=1)

with Module("module"):
    suite()
```

> **{% attention %}** See [asyncio] module to learn more about asynchronous programming in [Python].

# Parallel Tests

## Running Parallel Tests

Tests can be executed in parallel either using threads
or an asynchronous executor defined using [ThreadPool class] or [AsyncPool class] respectively.

In order to run a test in parallel, it must either have [PARALLEL](test-program-options.md#PARALLEL) flag
set or `parallel=True` specified during the test definition.

A parallel executor can be specified using `executor` parameter. If no executor
is explicitly specified, then a default executor is created for the
test of the type that is needed to execute a test.

> **{% attention %}** Note that the default executor does not have a limit on the number
> of parallel tests because the pool size is not limited.

Here is an example when `executor` is not specified.

```python
import time
from testflows.core import *

@TestScenario
def my_test(self, number, sleep=1):
    note(f"{self.name} starting")
    time.sleep(sleep)
    note(f"{self.name} done")

@TestModule
def module(self):
    Scenario(name="my test 0", test=my_test, parallel=True)(number=0)
    Scenario(name="my test 1", test=my_test, parallel=True)(number=1)

if main():
    module()
```

## Using `join()`

The [join() function] can be used to join any currently running parallel tests.
For example,

```python
@TestModule
def module(self):
    Scenario(name="my test 0", test=my_test, parallel=True)(number=0)
    Scenario(name="my test 1", test=my_test, parallel=True)(number=1)
    # wait until `my test 0` and `my test 1` complete
    join()
    Scenario(name="my test 2", test=my_test, parallel=True)(number=2)
```

# Parallel Executors

Parallel executors can be used to gain fine grained control over how many
tests are executed in parallel.

> **{% attention %}** You should not share a single pool executor between different tests
> as it can lead to a deadlock given that a situation might arise when a parent test
> can be left waiting for the child test to complete, and a child test will not be
> able to complete due to the shared pool having no available workers.

If you want to share a pool between different tests, you must use either
`SharedThreadPool class` or `SharedAsyncPool class` for normal or asynchronous tests,
respectively. These classes ensure that a deadlock between a parent and child test is avoided
by blocking and waiting for the completion of any task that is submitted when no idle workers
are available.

## Thread Pool

A thread pool executor is defined by creating an object of [Pool class] which is
a short form for defining a [ThreadPool class] and will run a test in another thread.

The maximum number of threads can be controlled by setting `max_workers`
parameter, and by default is set to `16`. If `max_workers` is set to `None`
then the pool size is not limited.

If there are more tasks submitted to the pool than there are currently available
threads, then any extra tasks will block until a worker in the pool
is freed up.

```python
with Pool(5) as pool:
    Scenario(name="my test 0", test=my_test, parallel=True, executor=pool)(number=0)
    Scenario(name="my test 1", test=my_test, parallel=True, executor=pool)(number=1)
```

## Async Pool

An asynchronous pool executor is defined by creating an object of [AsyncPool class]
and will run an asynchronous test using a new loop running in another thread unless
`loop` parameter is explicitly specified during executor object creation.

The maximum number of concurrent asynchronous tasks can be controlled by setting `max_workers`
parameter, and by default is set to `1024`. If `max_workers` is set to `None`
then the pool size is not limited.

If there are more tasks submitted to the pool than there are currently available
threads, then any extra tasks will block until a worker in the pool
is freed up.

```python
with AsyncPool(5) as pool:
    Scenario(name="my async test 0", test=my_async_test, parallel=True, executor=pool)(number=0)
    Scenario(name="my async test 1", test=my_async_test, parallel=True, executor=pool)(number=1)
```
