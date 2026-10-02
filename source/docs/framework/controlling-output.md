<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Controlling Output

Test output can be controlled with `-o` or [--output] option, which specifies the output format to use
to print to `stdout`. By default, the most detailed `nice` output is used.

```bash
  -o format, --output format                      stdout output format, choices are: ['new-fails',
                                                  'fails', 'classic', 'slick', 'nice', 'brisk',
                                                  'quiet', 'short', 'manual', 'dots', 'progress',
                                                  'raw'], default: 'nice'
```

For example, you can use the following test and see how the output format
changes based on the output that is specified.

> `test.py`
>```python
from testflows.core import *

with Module("regression", flags=TE, attributes=[("name","value")], tags=("tag1", "tag2")):
    with Scenario("my test", description="Test description."):
        with When("I do something"):
            note("do something")
        with Then("I check the result"):
            note("check the result")
```

## `nice` Output

The [`nice`] output format is the default output format and provides the most
details when developing and debugging tests. This output format includes all test types,
their attributes and results, as well as any messages that are associated with them.

> **{% attention %}** This output format is the most useful for developing and
> debugging an individual test.
> This output format is not useful when tests are executed in parallel.

For example,

```bash
python3 test.py --output nice
```
```bash
 Sep 25,2021 9:29:39   ⟥  Module regression, flags:TE
                            Attributes
                              name
                                value
                            Tags
                              tag1
                              tag2
 Sep 25,2021 9:29:39     ⟥  Scenario my test
                              Test description.
 Sep 25,2021 9:29:39       ⟥  When I do something
               508us       ⟥    [note] do something
               715us       ⟥⟤ OK I do something, /regression/my test/I do something
 Sep 25,2021 9:29:39       ⟥  Then I check the result
               471us       ⟥    [note] check the result
               704us       ⟥⟤ OK I check the result, /regression/my test/I check the result
                 2ms     ⟥⟤ OK my test, /regression/my test
                12ms   ⟥⟤ OK regression, /regression
```

produces the same output as when [--output] is omitted.

```python
python3 test.py
```

## `brisk` Output

The [`brisk`] output format is very similar to [`nice`] output format but
omits all steps (tests that have [Step Type]). This format is useful when
you would like to focus on the actions of the test, such as commands executed
on the system under test, rather than on the test procedure itself.

> **{% attention %}** This output format is useful for
> debugging individual tests when you would like to omit test steps.
> This output format is not useful when tests are executed in parallel.

```bash
python3 output.py -o brisk
```
```bash
Sep 25,2021 12:05:25   ⟥  Module regression, flags:TE
                            Attributes
                              name
                                value
                            Tags
                              tag2
                              tag1
Sep 25,2021 12:05:25     ⟥  Scenario my test
                              Test description.
               479us     ⟥    [note] do something
               719us     ⟥    [note] check the result
                 2ms     ⟥⟤ OK my test, /regression/my test
                12ms   ⟥⟤ OK regression, /regression
```

## `short` Output

The [`short`] output format provides a shorter output than [`nice`] output format
as only test and result messages are formatted.

> **{% attention %}** This output format is very useful to highlight and verify test procedures.
> This output format is not useful when tests are executed in parallel.

```bash
python3 test.py -o short
```
```bash
Module regression
  Attributes
    name
      value
  Tags
    tag1
    tag2
  Scenario my test
    Test description.
    When I do something
    OK
    Then I check the result
    OK
  OK
OK
```

## `classic` Output

The [`classic`] output format shows only full test names for
any test with a [Test Type] of higher will receive test and result messages.
Tests with [Step Type] are not displayed.

> **{% attention %}** This output format can be used for CI/CD runs as long as the
> number of tests is not too large.
> This output format can be used when tests are executed in parallel.

```bash
python3 test.py -o classic
```
```bash
➤ Sep 25,2021 11:14:15 /regression
➤ Sep 25,2021 11:14:15 /regression/my test
✔ 2ms       [   OK   ] /regression/my test
✔ 12ms      [   OK   ] /regression
```

## `progress` Output

The [`progress`] output format shows the progress of the test run.
The output is always printed on one line on progress updates and is useful
when running tests locally.

Any test failures are printed inline as soon as they occur.

> **{% attention %}** This output format should not be used for CI/CD runs
> as it outputs terminal control codes to update the same line.
> This output format can be used when tests are executed in parallel.

```bash
python3 test.py -o progress
```
```bash
Executing 2 tests /regression/my test/I do something
```

## `fails` Output

The [`fails`] output format only shows failing results [Fail], [Error], and [Null]
and crossed out the results [XFail], [XError], [XNull], [XOK].

Failing results are only shown for tests with [Test Type] of higher.

> **{% attention %}** This output format can be used for CI/CD runs
> as long as the number of crossed-out results is not too large; otherwise,
> use [`new-fails`] output format instead.
> This output format can be used when tests are executed in parallel.

```bash
python3 test.py -o fails
```
```bash
✘ 3ms       [ XFail  ] /regression/my test
    expected fail
```

## `new-fails` Output

The [`new-fails`] output format only shows failing results [Fail], [Error], and [Null].
Crossed out results are not shown.

Failing results are only shown for tests with [Test Type] of higher.

> **{% attention %}** This output format can be used for CI/CD runs.
> This output format can be used when tests are executed in parallel.

```bash
python3 test.py -o new-fails
```
```bash
✘ 3ms       [  Fail  ] /regression/my test
    AssertionError
    Traceback (most recent call last):
      File "output.py", line 8, in <module>
        assert False
    AssertionError
```

## `slick` Output

The [`slick`] output format provides even shorter output than [`short`] output format
as it only shows test and result messages for any test that has [Test Type] of higher.
Tests that have [Step Type] are not showed.

> **{% attention %}** This output format is more eye-candy.
> This output format is not useful when tests are executed in parallel.

```bash
python3 test.py --output slick
```
```bash
➤ Module regression
  ✔ Scenario my test
✔ Module regression
```

## `quiet` Output

The [`quiet`] output format does not output anything to stdout.

> **{% attention %}** This output format can be used for CI/CD runs.
> This output format can be used when tests are executed in parallel.

```bash
python3 test.py -o quiet
```

## `manual` Output

The [`manual`] output format is only suitable for running manual or semi-automated
tests where the tester is constantly prompted for input. The terminal screen is always cleared
before starting any test with [Test Type] or higher.

> **{% attention %}** This output format is only useful for manual or semi-automated tests.

```bash
python3 test.py -o manual
────────────────────────────────────────────────────────────────────────────────
SCENARIO my test
Test description.
────────────────────────────────────────────────────────────────────────────────
□ When I do something
[note] do something
✍  Enter `I do something` result?
```

## `raw` Output

The [`raw`] output format outputs raw messages.

> **{% attention %}** This output format is only useful for **{% testflows %}**
> developers and curious users who want to understand what raw messages look like.

```bash
python3 test.py -o raw
```
```bash
{"message_keyword":"PROTOCOL","message_hash":"1336ea41","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1632584893.162271,"message_rtime":0.009011,"test_type":"Module","test_subtype":null,"test_id":"/fd823a2c-1e17-11ec-8830-cb614fe11752","test_name":"/regression","test_flags":1,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
...
{"message_keyword":"STOP","message_hash":"6956b3c5","message_object":0,"message_num":7,"message_stream":null,"message_level":2,"message_time":1632584893.167364,"message_rtime":0.014104,"test_type":"Module","test_subtype":null,"test_id":"/fd823a2c-1e17-11ec-8830-cb614fe11752","test_name":"/regression","test_flags":1,"test_cflags":0,"test_level":1}
```

Advanced users can use this format to apply custom message transformations.

For example, it can be transformed using `tfs transform nice` command into [`nice`]
format

```bash
python3 test.py -o raw | tfs transfrom nice
```

or combined with other unix tools such as `grep` with further message transformations.

```bash
python3 output.py -o raw | grep '{"message_keyword":"RESULT",' | tfs transform nice
```

## Summary Reports

Most output formats include one or more summary reports.
These reports are printed after all tests have been executed.

> **{% attention %}** Most summary reports only include tests that have [Test Type] or higher.
> Tests with [Step Type] are not included.

### Passing

This report generates `Passing` section and show passing tests.

```bash
Passing

✔ [ OK ] /regression/my test
✔ [ OK ] /regression
```

### Failing

This report generates `Failing` section and shows failing tests.

```bash
Failing

✘ [ Fail ] /regression/my test
✘ [ Fail ] /regression
```

### Known

This report generates `Known` section.

```bash
Known

✘ [ XFail ] /regression/my test ᐅ expected fail
```

### Unstable

This report generates `Unstable` section. Tests are considered unstable
if they are repeated and different iterations have different results.

```bash
Unstable

◔ [ 50.00% ] /regression/my test (1 ok, 1 failed)
```

### Coverage

This report generates `Coverage` section. It is only generated if
at least one `Specification` is attached to any of the tests and shows
requirements coverage statistics for each `Specification`.

```bash
Coverage

QA-SRS004 Tiered Storage
  86 requirements (72 satisfied 83.7%, 4 unsatisfied 4.7%, 10 untested 11.6%)
```

### Totals

This report generates test counts and total test time section.

```bash
1 module (1 ok)
1 scenario (1 ok)
2 steps (2 ok)

Total time 12ms
```

### Version

This report generates a message that shows the date time of the test run
and the version of the framework that was used to run the test program.

```bash
Executed on Sep 25,2021 12:05
TestFlows.com Open-Source Software Testing Framework v1.7.210922.1181131
```

# Turning Off Color Highlighting

There are times when color highlighting might be in the way. For example,
when piping output to a different utility or saving it into the file.
In both of these cases, use [--no-colors] to tell **{% testflows %}**
to turn off adding terminal control color codes.

```bash
python3 test.py --no-colors > nice.log
```

or

```bash
python3 test.py --no-colors | less
```

The same option can be specified for the `tfs` utility.

```bash
cat test.log | tfs --no-colors show messages
```

or

```bash
tail -f test.log | tfs --no-colors transform nice | less
```

## Use `--no-colors` in Code

You can also detect if terminal color codes are turned off in code
by looking at `settings.no_colors` attribute, as follows

```python
import testflows.settings as settings
from testflows.core import *

with Test("my test"):
    if settings.no_colors:
        debug("do something when terminal colors are turned off")
```

# Forcing To Abort on First Fail

You can force a test program to abort on first failure irrespective
of the presence of [TE] flags by using [--first-fail]
test program argument.

For example,

```bash
python3 test.py --first-fail
```

# Forcing To Continue on Fail

You can force the test program to continue running if any of the tests fail
irrespective of the presence of [TE] flags by using [--test-to-end]
test program argument.

For example,

```bash
python3 test.py --test-to-end
```

# Enabling Debug Mode

You can enable debug mode by specifying [--debug] option to your test program.
When debug mode is enabled, the tracebacks will include more details, such as
internal function calls inside the framework that are hidden by default to reduce
clutter.

```bash
python3 test.py --debug
```

## Use `--debug` in Code

You can also trigger actions in your test code based on if [--debug] option
was specified or not. When [--debug] option is specified, the value
can be retrieved from `settings.debug` as follows

```python
import testflows.settings as settings
from testflows.core import *

with Test("my test"):
    if settings.debug:
        debug("do something in debug mode")
```

# Getting Test Time

## Using `current_time()`

*{% available %}* [1.7.57]

You can get current test execution time using [current_time() function].

```python
current_time(test=None)
```

where

* `test` (optional) the instance of the test for which a test time should be obtained, default: current test

The returned value is fixed after test has finished its execution.

For example,

```python
from testflows.core import *

with Scenario("my test"):
    with Step("my step") as step:
        note(current_time())
    note(current_time(test=step))
```

# Show Test Data

After the test program is executed, you can retrieve different test data related to the test run
using `tfs show` command.

The following commands are available:

```bash
tfs show -h
```
```bash
commands:
  command
    results         results
    passing         passing
    fails           fails
    unstable        unstable
    totals          totals
    coverage        coverage
    version         version
    tests           tests
    messages        messages
    details         details
    procedure       procedure
    description     description
    arguments       arguments
    attributes      attributes
    requirements    requirements
    tags            tags
    metrics         metrics
    examples        examples
    specifications  specifications
    result          result
```

## Show Metrics

Use `tfs show metrics` command to show metrics for a given test.

```bash
positional arguments:
  name               test name

optional arguments:
  -h, --help         show this help message and exit
  --log [input]      input log, default: stdin
  --output [output]  output, default: stdout
```

For example,

```bash
cat test.log | tfs show metrics
```
