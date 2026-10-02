<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Crossing Out Results

All test results except [Skip] result can be crossed out, including [OK]. This functionality
is useful when one or more tests fail and you don't want to see the next run
fail because of the same test failing.

Crossing out a result means converting it to the corresponding crossed out result
that starts with `X`.

* ~[Fail]~ becomes [XFail]
* ~[Error]~ becomes [XError]
* ~[Null]~ becomes [XNull]
* ~[OK]~ becomes [XOK]

> **{% attention %}** The concept of crossing out a result should not be confused with expected results.
> It is invalid to say that, for example, [XFail], means an expected fail.
> In general, if you expect a fail, then if the result of the test is [Fail], then
> the final test result is [OK] and any other result would cause the final
> result to be [Fail] as the expectation was not satisfied.

The correct way to think about crossed out results is to imagine that a test
summary report is printed on a paper, and after looking over the test results
and performing some analysis, any result can be crossed out with an optional reason.

Only the result that exactly matches the result to be crossed out is actually crossed out.
For example, if you want to cross out [Fail] result of the test but the test has
a different result, then it will not be crossed out.

The actual crossing out of the results is done by specifying either [xfails] parameter
of the test or using [XFails] decorator.

In general, the [xfails] are set at the level of the top test. For example,

```python
@TestModule
@XFails({
    "my suite/my test": [
        (Fail, "known issue"),
        (OK, "need to check if the issue has been fixed"),
    ],
    "my suite/my other test": [
        (Fail, "other known issue"),
        (Error, "can also error")
    ]
})
def regression(self):
    Suite(run=my_suite)
```

All the [pattern]s are usually specified using relative form and are
anchored to the top level test during the assignment.

# Setting or Clearing Flags

Test flags can be set or cleared externally using [xflags] or [XFlags] decorator.
As long as the [pattern] has a chance of matching, this test attribute is pushed down the flow from parent test to child tests.

This allows setting or clearing flags for any child test at any level of the test flow
including at the top level test.

For example,

```python
@TestModule
@XFlags({
    "my suite/my test": (0, TE), # clear TE flag
    "my suite/my other test": (TE, 0) # set TE flag
})
def regression(self):
    Suite(run=my_suite)
```

# Forcing Results

Test results can be forced, and the body of the test can be skipped
by using [ffails] or [FFails] decorator.
As long as the [pattern] has a chance of matching, this test attribute is pushed down the flow
from parent test to child tests


This enables the result of any child test to be force at any level of the test flow,
including at the top level test.

> **{% attention %}** When a test result is forced, the body of the test is not executed.

For example,

```python
@TestModule
@FFails({
    "my suite/my test": (Fail, "test gets stuck"), # skip body of the test and force `Fail` result
    "my suite/my other test": (SKIP, "not supported") # skip body of the test and force `Skip` result
})
def regression(self):
    Suite(run=my_suite)
```

The optional `when` function can also be specified.

```python
def version(*versions):
    """Check if the value of version test context variable
    matches any in the list.
    """
    def _when(test):
        return test.context.version in versions
    return _when

@TestSuite
@FFails({
    # force fail "my test" because it gets stuck on version 2.0
    "my test": (Fail, "test gets stuck", version("2.0"))
})
def suite(self):
    Scenario(run=my_test)
```

## Forced Result Decorators

Forced result decorators such as [Skipped], [Failed], [XFailed], [XErrored], [Okayed],
and [XOkayed] can be used to tie the force result right where the test is defined.

> **{% attention %}** When a test result is forced, the body of the test is not executed.

These decorators are just a short-hand form of
specifying forced results using [ffails]
test attribute. Therefore, if parent test explicitly specifies [ffails] then it overrides
forced results tied to the test.

> **{% attention %}** Only one such decorator can be applied to a given test.
> If you want to specify more than one forced result, use [FFails] decorator.

See also the description for the [when] condition.

### Skipped

The [Skipped] decorator can be used to force [Skip] result.

```python
@TestScenario
@Skipped("not supported on 2.0", when=version("2.0"))
def my_test(self):
    pass
```

### Failed

The [Failed] decorator can be used to force [Fail] result.

```python
@TestScenario
@Failed("force Fail on 2.0", when=version("2.0"))
def my_test(self):
    pass
```

### XFailed

The [XFailed] decorator can be used to force [XFail] result.

```python
@TestScenario
@XFailed("force XFail on 2.0", when=version("2.0"))
def my_test(self):
    pass
```

### XErrored

The [XErrored] decorator can be used to force [XError] result.

```python
@TestScenario
@XErrored("force XError on 2.0", when=version("2.0"))
def my_test(self):
    pass
```

### Okayed

The [Okayed] decorator can be used to force [OK] result.

```python
@TestScenario
@Okayed("force OK result on 2.0", when=version("2.0"))
def my_test(self):
    pass
```

### XOkayed

The [XOkayed] decorator can be used to force [XOK] result.

```python
@TestScenario
@XOkayed("force XOK result on 2.0", when=version("2.0"))
def my_test(self):
    pass
```
