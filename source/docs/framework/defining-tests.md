<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Defining Tests

You can define tests inline using the classical [Step], [Test], [Suite], and [Module]
test definition classes or using specialized keyword classes as
[Scenario], [Feature], [Module] and the steps
such as [Background], [Given], [When], [Then], [But], [By], [And], and [Finally].

In addition, you can also define sub-tests using [Check] test definition class
or its flavours [Critical], [Major] or [Minor].

> **{% attention %}** You are encouraged to use the specialized keyword classes to greatly improve the readability of
> your tests and test procedures.

Given the variety of test definition classes above, fundamentally,
there are only four core [Types] of tests in {% testflows %}.
The core [Types] are

  * [Module]
  * [Suite]
  * [Test]
  * [Step]

and all other types are just a naming variation of one of the above with the following mapping or are special types

* [Module]
* [Suite]
  * [Feature]
* [Test]
  * [Scenario]
  * [Check]
  * [Critical]
  * [Major]
  * [Minor]
  * [Example]
* [Step]
  * [Given]
  * [When]
  * [Then]
  * [But]
  * [By]
  * [Finally]
  * [Background]
  * [And] (special)
* [Sketch] (special)
* [Combination] (special)
* [Outline] (special)
* [Iteration] (special)
* [RetryIteration] (special)

see [Types] for more information.

## Inline

Inline tests can be defined anywhere in your test program by using [Test Definition Class]es above.
Because all test definition classes are [context manager]s, therefore they must be used
using the [with] statement or [async with] for asynchronous tests that leverage [Python]'s [asyncio] module.

```python
with Module("My test module"):
    with Feature("My test feature"):
        with Scenario("My test scenario"):
            try:
                with Given("I have something"):
                    note("note message")
                with When("I do something"):
                    debug("debug message")
                with And("I do something else"):
                    trace("trace message")
                with Then("I check that something is True"):
                    assert something is True
                with But("I check that something else is False"):
                    assert something_else is False
            finally:
                with Finally("I clean up"):
                    pass
```

## Decorated

For re-usability, you can also define tests using the
[TestStep], [TestBackground], [TestCase], [TestCheck], [TestCritical], [TestMajor], [TestMinor],
[TestSuite], [TestFeature], [TestModule], [TestOutline], and [TestSketch] test function decorators.

For example,

```python
@TestScenario
@Name("My scenario")
def scenario(self, action=None):
    with Given("I have something"):
        pass
    with When(f"I do some {action}"):
        pass
    with Then("I expect something"):
        pass
```

Similarly to how [class method]'s take an instance of the object as the first argument,
test functions wrapped with test decorators take an instance of the current test as the first argument
and therefore, by convention, the first argument is always named `self`.

## Calling Decorated Tests

> **{% attention %}**  All arguments to tests must be passed using keyword arguments.

For example,

```python
scenario(action="driving")
# not scenario("driving")
```

Use a test definition class to run another test as

```python
Scenario(test=scenario)(action="running")
```

where the test is passed as the argument to the `test` parameter.

If the test does not need any arguments, use a short form by passing
the test as the value of the `run` parameter.

```python
Scenario(run=scenario)
```

> **{% attention %}** Use the short form only when you don't need to pass any arguments to the test.

This will be equivalent to

```python
Scenario(test=scenario)()
```

You can also call decorated tests directly as

```python
scenario(action="swimming")
```

Note that `scenario()` call will only create its own [Scenario] if and only if it is
running within a parent that has a higher test [Type] such as [Feature] or [Module].

However, if you call it within the same test [Type]
then it will not create its own [Scenario] but will run simply as a function
within the scope of the current test.

For example,

```python
with Scenario("My scenario"):
    scenario()
```

will run in the scope of `My scenario` where `self` will be an instance of the

```python
Scenario("My scenario")
```

but

```python
with Feature("My feature"):
    scenario(action="sliding")
```

will create its own test.

# Running Tests

Top level tests can be run using either `python3` command or directly if they are made executable.
For example, with a top level test defined as

```python
from testflows.core import Test

with Test("My test"):
    pass
```

you can run it with `python3` command as follows

```bash
python3 test.py
```

or we can make the top level test executable and defined as

```python
#!/usr/bin/python3
from testflows.core import Test

with Test("My test"):
    pass
```

and then we can make it executable with

```bash
chmod +x test.py
```

allowing us to execute it directly as follows.

```bash
./test.py
```
