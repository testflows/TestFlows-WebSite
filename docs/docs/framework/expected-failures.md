<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test XFails

You can specify test results to be crossed out, known as `xfails` for any test
either by setting `xfails` parameter of the inline test or by using `XFails` decorator
if the test is defined as a decorated function. See [Crossing Out Results](crossing-out-and-forcing-results.md#Crossing-Out-Results)
for more information.

## xfails

The [xfails] parameter of the test can be used to set `xfails` of any inline test. The [xfails] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        [(result, "cross out reason"[, when][, result_message]), ...],
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which one
or more results can be crossed out that are specified by the list.
A list must contain one or more `(result, "reason"[, when][, result_message])` tuples where
`result` shall be the result that you want to cross out, for example [Fail],
the reason shall be a string that specifies a reason why this result is being
crossed out. You can also specify an optional [when] condition that shall be a function that
takes a current test object as the first and only argument and shall either return
`True` or `False`. The cross-out will only be applied if the `when` function returns `True`.
For a fine-grained control over which test results should be crossed out,
you can also specify `result_message` to select only results with a specific message.
It shall be a regex expression that will be used to match the result message
with `DOTALL|MULTILINE` flags set during matching.
If `result_message` is specified, then a test result will only be crossed out if a match is found.

> **{% attention %}** A reason for a crossed out result can be a URL such as
> for an issue in an issue tracker.

For example,

```python
with Suite("My test", xfails={"my_test": [(Fail, "needs to be investigated")]}):
    Scenario(name="my_test", run=my_test)
```

or

```python
Suite(run=my_suite, xfails={"my test": [Fail, "https://my.issue.tracker.com/issue34567"]})
```

> **{% attention %}** If the test `pattern` is not absolute, then it is
> anchored to the test where [xfails] is specified.

## XFails

The [XFails] decorator can be used to set `xfails` attribute of any test that is defined using a decorated function
or used as an extra argument when defining a row for the [examples] of the test.
The [XFails] decorator takes a dictionary of the same form as the [xfails] parameter, where
you can also specify `when` and `result_message` arguments.

```python
@TestSuite
@XFails({
    "my_test": [
        (Fail, "needs to be investigated")
    ]
})
def suite(self):
    Scenario(run=my_test)
```

# Test XFlags

You can specify flags to be externally set or cleared for any test by setting `xflags` parameter or using `XFlags` decorator
for decorated tests. See [Setting or Clearing Flags](crossing-out-and-forcing-results.md#Setting-or-Clearing-Flags).

## xflags

The [xflags] parameter of the test can be used to set `xflags` of a test. The [xflags] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        (set_flags, clear_flags[, when]),
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which
flags will be set or cleared. The flags to be set or cleared are
specified by a tuple of the form `(set_flags, clear_flags[, when])` where the
first element specifies flags to be set, and the second element specifies
flags to be cleared. An optional [when] condition can be specified that shall be a function that
takes a current test object as the first and only argument and shall either return
`True` or `False`. If specified, the flags will only be set and cleared if
the `when` function returns `True`.

Here is an example to set [TE] flag and to clear the [SKIP] flag,

```python
with Suite("My test", xflags={"my_test": (TE, SKIP)}):
    Scenario(name="my_test", run=my_test)
```

or just set [SKIP] flag without clearing any other flag

```python
Suite(run=my_suite, xflags={"my test": (SKIP, 0)})
```

and multiple flags can be combined using the binary `OR` (`|`) operator.

```python
# clear SKIP and TE flags for "my test"
Suite(run=my_suite, xflags={"my test": (0, SKIP|TE)})
```

> **{% attention %}** If the test `pattern` is not absolute then it is
> anchored to the test where [xflags] is being specified.

## XFlags

The [XFlags] decorator can be used to set `xflags` attribute of any test that is defined using a decorated function
or used as an extra argument when defining a row for the [examples] of the test.

The [XFlags] decorator takes a dictionary of the same form as the [xflags] parameter.

```python
@TestSuite
@XFlags({
    "my_test": (TE, SKIP) # set TE and clear SKIP flags
})
def suite(self):
    Scenario(run=my_test)
```

# Test XArgs

You can specify test parameters to be set externally by setting the [xargs] parameter or using the [XArgs] decorator
for decorated tests. The [xargs] parameter can be used to set most test parameters externally
when the parameter lacks a dedicated method to do it. For example, the [xflags] should be used instead of the [xargs]
to externally set the [flags] of the test.

The following parameters can't be set:

* [name]

## xargs

The [xargs] parameter of the test can be used to set most other parameters of the test. The [xargs] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        ({"parameter name": parameter_value, ...}[, when]),
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which
parameters will be set. An optional [when] condition can be specified that shall be a function that
takes a current test object as the first and only argument and shall either return
`True` or `False`. If specified, the parameters will only be set if
the `when` function returns `True`.

Here is an example of setting the [TE] flag,

```python
with Suite("My test", xargs={"my_test": ({"flags": TE},)}):
    Scenario(name="my_test", run=my_test)
```

but note that it is recommended to use [xflags] to set flags externally.

> **{% attention %}** If the test `pattern` is not absolute, then it is anchored to the test where the [xargs] is being specified.

## XArgs

The [XArgs] decorator can be used to set the `xargs` attribute of any test that is defined using a decorated function
or used as an extra argument when defining a row for the [examples] of the test.

The [XArgs] decorator takes a dictionary of the same form as the [xargs] parameter. For example,

```python
@TestSuite
@XArgs({
    "my_test": ({"flags": TE},) # set TE flag
})
def suite(self):
    Scenario(run=my_test)
```

# Test FFails

You can force the result, including [Fail] result, of any test by setting
`ffails` parameter or using `FFails` decorator
for decorated tests. See [Forcing Results](crossing-out-and-forcing-results.md#Forcing-Results).

## ffails

The [ffails] parameter of the test can be used to force any result of a test, including [Fail]
while skipping the execution of its test body. The [ffails] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        (Result, reason[, when]),
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which
the result will be set by force, and the body of the test will not be executed.
The forced result is specified by a two-tuple of the form `(Result, reason)` where the
first element specifies the force test result, such as [Fail], and the second element specifies
the reason for forcing the result as a string.

For example,

```python
with Suite("My test", ffails={"my_test": (Fail, "test gets stuck")}):
    Scenario(name="my_test", run=my_test)
```

or

```python
Suite(run=my_suite, ffails={"my test": (Skip, "not supported")})
```

> **{% attention %}** If the test `pattern` is not absolute then it is
> anchored to the test where [ffails] is being specified.

## FFails

The [FFails] decorator can be used to set `ffails` attribute of any test that is defined using a decorated function
or used as an extra argument when defining a row for the [examples] of the test.

The [FFails] decorator takes a dictionary of the same form as the [ffails] parameter.

```python
@TestSuite
@FFails({
    "my test": (Fail, "test gets stuck") # force fail "my test" because it gets stuck
})
def suite(self):
    Scenario(run=my_test)
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
    "my test": (Fail, "test gets stuck", version("2.0")) # force fail "my test" because it gets stuck on version 2.0
})
def suite(self):
    Scenario(run=my_test)
```
