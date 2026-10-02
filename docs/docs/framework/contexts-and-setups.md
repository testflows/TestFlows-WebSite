<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Using Contexts

Each test has `context` attribute for storing and passing state
to sub-tests. Each test has a unique object instance of [Context class] however,
context variables from the parent
can be accessed as long as the same context variable is not redefined by the current
test.

The main use case for using `context` is to avoid passing along common arguments
to sub-tests, because `contexts` enable them to pass **automatically**.

Also, test clean up functions can be added to the current test using `context`.
See [Cleanup Functions](#Cleanup-Functions).

Here is an example of using `context` to store and pass state.

```python
from testflows.core import *

@TestScenario
def my_test(self):
    # note will print 'hello there'
    note(self.context.my_var)
    # this will redefine my_var for this test and any sub-tests
    # but parent.context.my_var will remain unchanged
    self.context.my_var = "hello here"
    # note will print 'hello here'
    note(self.context.my_var)

@TestModule
def regression(self):
    self.context.my_var = "hello there"

    Scenario(run=my_test)
    # my_var change in sub-test does not change the value at the parent's level
    # note will print 'hello there'
    note(self.context.my_var)

if main():
    regression()
```

and you can confirm this by running the test program above.

```bash
Sep 24,2021 10:24:54   ⟥  Module regression
Sep 24,2021 10:24:54     ⟥  Scenario my test
               671us     ⟥    [note] hello there
               730us     ⟥    [note] hello here
               898us     ⟥⟤ OK my test, /regression/my test
                10ms   ⟥    [note] hello there
                10ms   ⟥⟤ OK regression, /regression
```

> **{% attention %}** You should not modify parent's context directly (~self.parent.context~).
> Always set variables using the context of the current test, either by using
> `self.context` or `current().context`.

## Using `in` Operator

You can use `in` operator to check if a variable is set in context.

```python
# check if variable 'my_var' is set in context
note("my_var" in self.context)
```

## Using `hasattr()`

Alternatively, you can also use built-in [hasattr()] function.

```python
note(hasattr(self.context, "my_var"))
```

## Using `getattr()`

If you are not sure if context variable is set, you can use built-in [getattr()] function.

```python
note(getattr(self.context, "my_var2", "was not set"))
```

## Using `getsattr()`

If you want to set `context` variable to a specific value, if the variable
is not defined in the context, use [getsattr() function].


```python
from testflows.core import Test, note
from testflows.core import getsattr

with Test("my test") as test:
    getsattr(test.context, "my_var2", "value if my_var2 is not set")
    note(test.context.my_var2)
```

## Arbitrary Variable Names

If you would like to add a variable that, for example, has empty spaces
and therefore would not be valid to be referenced directly
as an attribute of the `context` then you can use [setattr()] and [getattr()]
to set and get the variable respectively.

```python
with Test("my test") as test:
    setattr(test.context, "my long variable with spaces", "value")
    note(getattr(test.context, "my long variable with spaces"))
```

# Setups and Teardowns

Test setup and teardown could be explicitly specified using [Given] and [Finally] steps.

For example, [Scenario] that needs to do some setup and perform clean up as part
of teardown can be defined as follows using explicit [Given] and [Finally] steps.

```python
@TestScenario
def my_scenario(self):
    try:
        with Given("my setup"):
            do_some_setup()

        with When("I perform action"):
            perform_action()
    finally:
        with Finally("clean up"):
            do_cleanup()
```

> **{% attention %}** It is recommended to use a decorated [Given] step that contains `yield` statement
> in most cases. See [Given With `yield`](#Given-With-yield).

> **{% attention %}** [Given] and [Finally] steps have [MANDATORY] flag set by default,
> and therefore these steps can't be skipped.

> **{% attention %}** [Finally] steps must be located within `finally` blocks
> to ensure their execution.

## Common Setup and Teardown

If multiple tests require the same setup and teardown and the result of the setup
can be shared between these tests, then the common setup and teardown
should be defined at the parent test level. Therefore,
for multiple [Scenario]s that share the same setup and teardown,
it should be defined at the [Feature] level and for multiple
[Feature]s that share the same setup and teardown, it should be defined
at the [Module] level.

For example,

```python
from testflows.core import *

@TestScenario
def my_scenario1(self):
    pass

@TestScenario
def my_scenario2(self):
    pass

with Feature("my feature"):
    try:
        with Given("my setup"):
            pass
        Scenario(run=my_scenario1)
        Scenario(run=my_scenario2)
    finally:
        with Finally("clean up"):
            pass
```


## Handling Resources

When setup creates a resource that needs to be cleaned up, one must
ensure that [Finally] step checks if [Given] has actually succeeded in creating
the resource that needs to be cleaned up.

For example,

```python
@TestScenario
def my_scenario(self):
    resource = None
    try:
        with Given("my setup"):
            resource = do_some_setup()

        with When("I perform action"):
            perform_action()
    finally:
        with Finally("clean up"):
        	if resource is not None:
	            do_cleanup()
```

## Multiple Setups and Teardowns

When a test needs to perform multiple setups and teardowns, then
multiple [Given] and [Finally] can be used.

> **{% attention %}** Use [And] step to make test procedure more fluid.

```python
@TestScenario
def my_scenario(self):
    try:
        with Given("my first setup"):
            do_first_setup()

        with And("my second setup"):
            do_second_setup()

        with When("I perform action"):
            perform_action()
    finally:
        with Finally("first clean up"):
            do_first_cleanup()

        with And("second clean up"):
            do_first_cleanup()
```

> **{% attention %}** [TE] flag is always implicitly set for [Finally] steps
> to ensure that failure of one step does not prevent execution
> of other [Finally] steps.
>
> Therefore,
>
> ```python
        with Finally("first clean up"):
            do_first_cleanup()

        with And("second clean up"):
            do_first_cleanup()
```
> is equivalent to the following.
> ```python
        with Finally("first clean up", flags=TE):
            do_first_cleanup()

        with And("second clean up", flags=TE):
            do_first_cleanup()
```

## Given With `yield`

Because any [Given] step usually has a corresponding [Finally] step
**{% testflows %}** supports `yield` statement inside a decorated [Given] step
to convert the decorated function into a generator that
will be first run to execute the setup and then executed
a second time to perform the clean during the test's teardown.

> **{% attention %}** It is an error to define a [Given] step that
> contains multiple `yield` statements.

```python
from testflows.core import *

@TestStep(Given)
def my_setup(self):
    try:
        #do_setup()
        yield
    finally:
        with Finally("clean up"):
            # do_cleanup()
            pass

with Scenario("my scenario"):
    with Given("my setup"):
        my_setup()
```

Executing the example above shows that the [Finally] step gets executed
at the end of the test.

```bash
Sep 07,2021 19:26:23   ⟥  Scenario my scenario
Sep 07,2021 19:26:23     ⟥  Given my setup, flags:MANDATORY
                 1ms     ⟥⟤ OK my setup, /my scenario/my setup
Sep 07,2021 19:26:23     ⟥  Finally I clean up, flags:MANDATORY
Sep 07,2021 19:26:23       ⟥  And clean up, flags:MANDATORY
               442us       ⟥⟤ OK clean up, /my scenario/I clean up/clean up
                 1ms     ⟥⟤ OK I clean up, /my scenario/I clean up
                11ms   ⟥⟤ OK my scenario, /my scenario
```

### Yielding Resources

If [Given] step creates a resource, it can by `yield`ed
as a value.

For example,

```python
from testflows.core import *

@TestStep(Given)
def my_setup(self):
    try:
        yield "resource"
    finally:
        with Finally("clean up"):
            pass

with Scenario("my scenario"):
    with Given("my setup"):
        resource = my_setup()
        note(resource)
```

produces the following output.

```bash
Sep 07,2021 19:36:52   ⟥  Scenario my scenario
Sep 07,2021 19:36:52     ⟥  Given my setup, flags:MANDATORY
               916us     ⟥    [note] resource
                 1ms     ⟥⟤ OK my setup, /my scenario/my setup
Sep 07,2021 19:36:52     ⟥  Finally I clean up, flags:MANDATORY
Sep 07,2021 19:36:52       ⟥  And clean up, flags:MANDATORY
               638us       ⟥⟤ OK clean up, /my scenario/I clean up/clean up
                 1ms     ⟥⟤ OK I clean up, /my scenario/I clean up
                12ms   ⟥⟤ OK my scenario, /my scenario
```

## Cleanup Functions

Explicit cleanup functions can be added by calling [Context.cleanup() function].

For example,

```python
from testflows.core import *

def my_cleanup():
    note("my cleanup")

@TestScenario
def my_scenario(self):
    # add explicit cleanup function to context
    self.context.cleanup(my_cleanup)

    with When("I perform action"):
        pass
```

produces the following output.

```bash
Sep 07,2021 19:58:11   ⟥  Scenario my scenario
Sep 07,2021 19:58:11     ⟥  When I perform action
               796us     ⟥⟤ OK I perform action, /my scenario/I perform action
Sep 07,2021 19:58:11     ⟥  Finally I clean up, flags:MANDATORY
               575us     ⟥    [note] my cleanup
               817us     ⟥⟤ OK I clean up, /my scenario/I clean up
                11ms   ⟥⟤ OK my scenario, /my scenario

```

# Returning Values

A test is not just a function but an entity that can either be run
within caller's thread, in another thread, in a different process,
or even on a remote host. Therefore, depending on how a test is called,
returning values from a test might not be as simple as
when one calls a regular function.

## Using `value()`

A generic way for a test to return a value is by using [value() function].
Test can call [value() function] to set one or more values.

For example,

```python
@TestStep
def my_step(self):
    value(name="first", value="my first value")
    value(name="second", value="my second value")
```

The values can be retrieved using `values` attribute of the `result` of the test

```python
with Test("my test"):
    my_values = my_step().result.values
    # [note] [Value(name='first',value='my first value',type=None,group=None,uid=None), Value(name='second',value='my second value',type=None,group=None,uid=None)]
    note(my_values)
```

and using the `value` attribute of the `result` you can get the last value.

```python
with Test("my test"):
    my_value = my_step().result.value
    note(my_value) # [note] my second value
```

Note that if the decorated test is called as a function
within the same test type, the return value is `None`
if the test function did not return any value using the `return` statement.

```python
with Step("my step"):
    my_step() # returns None
```

But if the test does `return` a value, then it is set as the last value
in the `values` attribute of the `result` of the test.

```python
@TestStep
def my_step(self):
    value(name="first", value="my first value")
    value(name="second", value="my second value")
    return "my third value"

with Test("my test"):
    my_values = my_step().result.values[-1]
    # [note] Value(name='return',value='my third value',type=None,group=None,uid=None)
    note(my_values)
```

## Using `return`

The most convenient way a decorated test can return a value is by
using `return` statement. For example, a test step can be defined as follows:

```python
@TestStep
def my_step(self):
    return "my value"
```

and when called within another step, the returned value is received just
like from a function.

```python
with Step("my step"):
    my_value = my_step()
```

This is because calling a decorated test
within a test of the same type, just runs the decorated test function
and therefore the call is similar to calling a function with the ability
to get the return value directly. See [Calling Decorated Tests](defining-tests.md#Calling-Decorated-Tests).

However, if you call a decorated test as a function
within a higher test type, for example calling a [Step] within a [Test],
or when you call an inline defined test, then the return value
is a `TestBase` object and the returned value needs to be retrieved
as `value` attribute from the `result` attribute of the `TestBase` object,
 or using `values` attribute to get a list of all the values produced by a test.

```python
with Test("my test"):
    # incorrect - `my_value` is TestBase object
    # my_value = my_step()

    # incorrect - `my_value` is Step object
    # my_value = Step(test=my_step)

    # incorrect - `my_value` is TestBase object
    # my_value = Step(test=my_step)()

    # incorrect - `my_value` is TestBase object
    # my_value = Step(run=my_step)

    # correct
    my_value = my_step().result.value

    # correct
    my_value = my_step().result.values[-1].value

    # correct
    my_value = Step(test=my_step)().result.value

    # correct
    my_value = Step(run=my_step).result.value
```
