<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test Timeouts

You can set test timeouts using the [timeouts] parameter.

## Timeouts

The [Timeouts] object can be either used as the value of the [timeouts] parameter or
as a decorator that can be applied to any decorated test.

The [Timeouts] takes as an argument a list of objects that specify a timeout, either using the [Timeout] object
directly or as a tuple of arguments that will be passed to it.

```python
[
    Timeout(...),
    # tuple to be converted to a Timeout object
    (timeout, message, started, name),
    ...
]
```

The [Timeouts] decorator should be used when you want to specify more than one timeout.

> **{% attention %}** Even though more than one timeout can be specified, only the value with the smallest
> value will be the effective timeout.

```python
@TestScenario
@Timeouts([Timeout(10), Timeout(20)])
def my_test(self):
    pass
```

For a single timeout, the [Timeout] decorator can be used instead.


## Timeout

The [Timeout] object can be either used as one of the values in the list passed to the [timeouts] parameter
or as a decorator that can be applied to any decorated test.

```python
Timeout(timeout, message=None, started=None, name=None)
```

where

* `timeout` timeout in sec
* `message` custom timeout error message, default: `None`
* `started` start time, default: `None` (set to the current test's start time)
* `name` name, default: `None`

For example,

```python
with Test("my test", timeouts=[Timeout(10)]):
    for i in range(12):
        with When(f"I do something #{i}"):
            time.sleep(1)
```

or it can be used as a decorator as follows:

```python
@TestScenario
@Timeout(10)
def my_test(self):
    pass
```


# The `when` Condition

Some parameters support a [when] condition, specified as a function, as the last element.
If present, the `when` function is called before test execution.
The boolean result returned by the `when` function determines if the forced result is applied,
if the function returns `True`, or not, if it returns `False`.
The `when` function must take one argument, which is the instance of the test.

> **{% attention %}** The optional `when` function can define any logic that
> is needed to determine if some condition is met. Any [callable] that
> takes a current test object as the first and only argument that can be used.

Here is an example of using [ffails] with a [when] condition:

```python
def version(*versions):
    """Check if the value of version test context variable
    matches any in the list.
    """
    def _when(test):
        return test.context.version in versions
    return _when

with Module("regression"):
    # force to skip my_suite test only on version 2.0
    Suite(run=my_suite, ffails={"my test": (Skip, "not supported", version("2.0"))})
```

# Specialized keywords

when writing your test scenarios, the framework encourages the usage of specialized keywords because they can provide
the much-needed context for your steps.

The specialized keywords map to core [Step], [Test], [Suite], and [Module] test definition classes as follows:

* [Module](test-definition-classes.md#Module) is defined as a [Module](test-definition-classes.md#Module)
* [Suite](test-definition-classes.md#Suite) is defined as a [Feature](test-definition-classes.md#Feature)
* [Test](test-definition-classes.md#Test) is defined as a [Scenario](test-definition-classes.md#Scenario)
* [Step](test-definition-classes.md#Step) is defined as one of the following:
  * [Given](test-definition-classes.md#Given) is used define a step for precondition or setup
  * [Background](test-definition-classes.md#Background) is used define a step for a complex precondition or setup
  * [When](test-definition-classes.md#When) is used to define a step for an action
  * [And](test-definition-classes.md#And) is used as a continuation of the previous step
  * [By](test-definition-classes.md#By) is used to define a sub-step
  * [Then](test-definition-classes.md#Then) is used to define a step for positive assertion
  * [But](test-definition-classes.md#But) is used to define a step for negative assertion
  * [Finally](test-definition-classes.md#Finally) is used to define a cleanup step
