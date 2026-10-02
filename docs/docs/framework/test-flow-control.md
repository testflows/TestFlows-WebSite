<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test Flow Control

The control of the [Flow] of tests allows you to precisely
define the order of test execution. **{% testflows %}** allows you
to write complete test programs, and therefore the order of executed tests
is defined in your [Python] test program code explicitly.

For example, the following test program defines decorated tests
`testA`, `testB`, and `testC` which are executed in the `regression()` module
in the `testA` -> `testB` -> `testC` order.

```python
from testflows.core import *

@TestScenario
def testA(self):
    pass

@TestScenario
def testB(self):
    pass

@TestScenario
def testC(self):
    pass

@TestModule
def regression(self):
    Scenario(run=testA)
    Scenario(run=testB)
    Scenario(run=testC)
```

It is trivial to see that given that the order of test execution ([Flow]) is explicitly
defined in `regression()` we could easily change it from `testA` -> `testB` -> `testC` to
`testC` -> `testA` -> `testB`.

```python
@TestModule
def regression(self):
    Scenario(run=testC)
    Scenario(run=testA)
    Scenario(run=testB)
```

## Conditional Test Execution

Conditional execution can be added to any explictely defined test [Flow] using
standard [Python Flow Control Tools](https://docs.python.org/3.8/tutorial/controlflow.html)
using [if](https://docs.python.org/3.8/tutorial/controlflow.html#if-statements),
[while](https://docs.python.org/3.8/reference/compound_stmts.html#while),
and [for](https://docs.python.org/3.8/tutorial/controlflow.html#for-statements) statements.

For example,

```python
@TestModule
def regression(self):
    if Scenario(run=testA).result != Fail:
        for i in range(3):
            Scenario(f"testB #{i}", run=testB)
        while True:
            if Scenario(run=testC).result == OK:
                break
```

will execute `testA` and only proceed to run other tests if its result is not [Fail] otherwise
only `testA` will be executed. If result of `testA` is not [Fail] then
we run `testB` 3 times, and `testC` gets executed indefinitely until its result is [OK].

## Creating Automatic Flows

When precise control over test [Flow] is not necessary, you
can easily define a list of tests to be executed in any way you might see fit,
including using a simple list.

For example,

```python
# list of all tests
tests = [testA, testB, testC]

@TestModule
def regression(self):
    for test in tests:
        test()
```

For such simple cases, you can also use [loads() function]. See [Using `loads()`](loading-tests.md#Using-loads).

The [loads() function] allows you to create a list of tests of the specified type
from either the current or some other module.

For example,

```python
@TestModule
def regression(self):
    for test in loads(current_module(), Scenario):
        test()
```

Here is an example of loading tests from `my_project/tests.py` module,

```python
@TestModule
def regression(self):
    for test in loads("my_project.tests", Scenario):
        test()
```

The list of tests can be randomized or ordered, for example, using [ordered() function]
or [Python]'s [sorted](https://docs.python.org/3/library/functions.html#sorted) function.

> **{% attention %}** You could also write [Python] code to load your list of tests from any other source
> such as a file system, database, or API endpoint, etc.

# Setting Test Results Explicitly

A result of any test can be set explicitly using the following result functions:

* [fail() function] for [Fail]
* [err() function] for [Error]
* [skip() function] for [Skip]
* [null() function] for [Null]
* [ok() function] for [OK]
* [xfail() function] for [XFail]
* [xerr() function] for [XError]
* [xnull() function] for [XNull]
* [xok() function] for [XOK]

Here are the arguments that each result function can take. All arguments are optional.

* `message` is used to set an optional result message
* `reason` is used to set an optional reason for the result. Usually, it is only set
  for crossed out results such as [XFail], [XError], [XNull] and [XOK] to indicate
  the reason for the result being crossed out such as a link to an opened issue
* `test` argument is usually not passed, as it is set to the current test by default.
  See [current() function].

```python
ok(message=None, reason=None, test=None)
fail(message=None, reason=None, test=None, type=None)
skip(message=None, reason=None, test=None)
err(message=None, reason=None, test=None)
null(message=None, reason=None, test=None)
xok(message=None, reason=None, test=None)
xfail(message=None, reason=None, test=None)
xerr(message=None, reason=None, test=None)
xnull(message=None, reason=None, test=None)
```

These functions raise an exception that corresponds to the appropriate result class and
therefore, unless you explicitly catch the exception, the test stops
at the point at which the result function is called.

For example,

```python
from testflows.core import *

with Scenario("Hello World!"):
    fail("forcing test fail")
    # this line will not be reached
```

You can also raise the result explicitly.

For example,

```python
from testflows.core import *

with Scenario("Hello World!"):
    raise Fail("forcing test fail")
```

## Fails of Specific Types

**{% testflows %}** does not support adding types to the [Fail]s but
the [fail() function] takes an optional `type` argument that takes
one of the [Test Definition Classes] which will be used to create a sub-test
with the name specified by the `message` and failed with the specified
`reason`.

The original use case is to provide a way to separate
fails of [Check]s into [Critical], [Major] and [Minor] without explicitly
defining [Critical], [Major], or [Minor] sub-tests.

For example,

```python
from testflows.core import *

with Check("Hello World!"):
    fail("some critical check", reason="critical fail", type=Critical)
```

The above code is equivalent to the following.

```python
from testflows.core import *

with Check("Hello World!"):
    with Critical("some critical check"):
        fail("critical fail")
```
