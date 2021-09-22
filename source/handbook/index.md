---
layout: handbook
p: /handbook
title: Handbook
heading: Your handbook for using the framework
icon: fas fa-book pt-5 pb-5
---

# What is it?

**{% testflows %}** is an open-source software testing framework that can be used for functional,
integration, acceptance and unit testing across various teams. It is designed to provide
complete control of how tests are written and executed by allowing to write tests and
define test [flow](#Flow-is) explicitly as [Python] code. It uses [everything is a test] approach
with the focus on giving test authors flexibility in writing and running their tests.
It designed to meet the needs of small QA groups at software startup companies
while providing the tools to meet the formalities of the large enterprise QA groups
producing professional test process documentation that includes detailed test and
software requirements specifications as well as requirements coverage, official test
and metrics reports. It is designed for large scale test analytics processing using
[ClickHouse] and [Grafana] and built on top of a messaging protocol to allow
writing advanced parallel tests that require test-to-test communication
and could be executed in a hive mode on multi-node clusters.

# Using Handbook

This handbook is a one-page document that you can search using standard
browser search (`Ctrl-F`). For ease of navigation you can always click any
heading to go back to the table of contents. 

> **{% attention %}** Try clicking `Using Handbook` heading and you will see that the page
> will scroll up and the corresponding entry in the table of contents
> will be highlighted in red. This handy feature will make sure you are never lost!

There is also <span><a class="fas fa-chevron-up" style="color: orange" href="#Contents"></a><span>
icon on the bottom right of the page to allow you quickly scroll to the top.

If you find any errors or would like to add documentation for something that is
still not documented then feel free to submit a pull request
with your changes to [handbook source file](https://github.com/testflows/TestFlows-WebSite/blob/master/source/handbook/index.md).

# Supported Environment

* [Ubuntu] 20.04
* [Python 3] >= 3.8

> **{% attention %}** Known to run on other systems such as MacOS.

# Installation

You can install the framework using [pip3]

```bash
$ pip3 install testflows
```

or from sources

```bash
$ git clone https://github.com/testflows/TestFlows.git
$ cd TestFlows
$ ./build ; ./install
```

# Hello World

You can write an inline test scenario in just three lines.

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    pass
```

and simply run it using `python3` command.

```bash
$ python3 ./test.py
Jun 28,2020 14:47:02   ⟥  Scenario Hello World!
                 2ms   ⟥⟤ OK Hello World!, /Hello World!

Passing

✔ [ OK ] /Hello World!

1 scenario (1 ok)
```

# Defining Tests

You can define tests inline using classical [Step], [Test], [Suite], and [Module]
test definition classes or using specialized keyword classes as
[Scenario], [Feature], [Module] and the steps
such as [Background], [Given], [When], [Then], [But], [By], [And], and [Finally].

In addition, you can also define sub-tests using [Check] test definition class
or its flavours [Critical], [Major] or [Minor]. 

> **{% attention %}** You are encouraged to use the specialized keyword classes to greatly improve readibiliy of
> your tests and test procedures.

Given the variety of test definition classes above, fundamentally, 
there only four core [Types] of tests in {% testflows %} and two special types
giving us six [Types] in total. The core [Types] are

  * [Module]
  * [Suite]
  * [Test]
  * [Outline] (special)
  * [Iteration] (special)
  * [RetryIteration] (special)
  * [Step]

and all other types are just a naming variation of one of the above having the following mapping

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
* [Outline] (special)
* [Iteration] (special)
* [RetryIteration] (special)
* [Step]
  * [Given]
  * [When]
  * [Then]
  * [But]
  * [By]
  * [Finally]
  * [Background]
  * [And] (special)

see [Types] for more information.

## Inline

Inline tests can be defined anywhere in your test code by using [Test Definition Class]es above.
Because all test definition classes are [context manager]s and therefore must be used
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

For re-usability you can also define tests using the
[TestStep], [TestBackground], [TestCase], [TestCheck], [TestCritical], [TestMajor], [TestMinor],
[TestSuite], [TestFeature], [TestModule], and [TestOutline] test function decorators.

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

Similar to how [class method]s take an instance of the object as the first argument, 
test functions wrapped with test decorators take an instance of the current test as the first argument
and therefore by convention the first argument is always named `self`.

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

If the test does not need any arguments use a short form by passing
the test as the argument of the `run` parameter.

```python
Scenario(run=scenario)
```

> **{% attention %}** Use the short form only when you don't need to pass any arguments to the test.

This will be equivalent to

```python
Scenario(test=scenario)()
```

You can also call also the decorated test directly as

```python
scenario(action="swimming")
```

Note that `scenario()` call will only create its own [Scenario] if and only if it is running within
a parent that has a higher test [Type] such as [Feature] or [Module].

However, if you call it within the same test [Type]
then it will not crete its own [Scenario] but will run simply as a function within the scope of the current test.

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
For example with a top level test defined as

```python
from testflows.core import Test

with Test("My test"):
    pass
```

you can run it with `python3` command as follows

```bash
$ python3 test.py
```

or if the top level test is executable and defined as

```python
#!/usr/bin/python3
from testflows.core import Test

with Test("My test"):
    pass
```

and is made executable with

```bash
$ chmod +x test.py
```

then it can be executed directly as

```bash
$ ./test.py
```

# Top Level Test

{% testflows %} only allows one top level test to exist in any given test program execution.
Because a [Flow](#Flow-is) of tests can be represented as a rooted [Tree](#Tree-is), a test program
exits on completion of the top level test. Therefore, any code that is defined after the top
level test **is not executed**.

```python
with Module("module"):
  pass

something_else() # will not be executed
```

# Test Program Options

## Options

### -h, --help

The `-h`, `--help` option can be used to obtain help message that describes all the command line
options a test can accept. For example,

```bash
$ python3 test.py --help
```

### -l, --log

The `-l`, `--log` option can be used to specify the path of the file where test log will be saved.
For example,

```bash
$ python3 test.py --log ./test.log
```

### --name

The `--name` option can be used to specify the name of the top level test.
For example,

```bash
$ python3 test.py --name "My custom top level test name"
```

### --tag

The `--tag` option can be used to specify one or more tags for the top level test.
For example,

```bash
$ python3 test.py --tag "tag0" "tag1"
```

### --attr

The `--attr` option can be used to specify one or more attributes for the top level test.
For example,

```bash
$ python3 test.py --attr attr0=value0 attr1=value1
```

### Filtering

#### pattern

Options such as [--only], [--skip], [--start], [--end] as well as
[--pause-before] and [--pause-after] take a [pattern] to specify the exact test
to which the option shall be applied.

The [pattern] is used to match test names using a [unix-like file path pattern] that supports wildcards

* `/` path level separator
* `*` matches everything
* `?` matches any single character
* `[seq]` matches any character in seq
* `[!seq]` matches any character not in seq
* `:` matches anything at the current path level

> **{% attention %}** Note that for a literal match, you must wrap the meta-characters in brackets
> where `[?]` matches the character `?`.

#### --only

The `--only` option can be used to filter the test flow so that only the specified tests
are executed.

> **{% attention %}** Note that mandatory tests will still be run.

> **{% attention %}** Note that most of the time the [pattern] should end with `/*` so that
> any steps or sub-tests are executed inside the selected test.

For example,

```bash
$ python3 test.py --only "/my test/*"
```

#### --skip

The `--skip` option can be used to filter the test flow so that the specified tests
are skipped.

> **{% attention %}** Note that mandatory tests will still be run.

#### --start

The `--start` option can be used to filter the test flow so that the test flow starts at
the specified test.

> **{% attention %}** Note that mandatory tests will still be run.

#### --end

The `--end` option can be used to filter the test flow so that the test flow ends at
the specified tests.

> **{% attention %}** Note that mandatory tests will still be run.

#### --pause-before

The `--pause-before` option can be used to specify the tests before which the test flow
will be paused.

#### --pause-after

The `--pause-after` option can be used to specify the tests after which the test flow
will be paused.

#### --repeat

The `--repeat` option can be used to specify the tests to be repeated.

#### --retry

The `--retry` option can be used to specify the tests to be retried.

# Output

Test output can be controlled with `-o` or `--output` option which specifies the output format to use
to print to `stdout`. By default, a detailed `nice` output is used. See `--help` for other formats.

```bash
$ python3 test.py --output short
```

# Logs

The framework produces [LZMA] compressed logs that contains [JSON] encoded messages. For example,
<br>
<br>

```json
{"message_keyword":"TEST","message_hash":"ccd1ad1f","message_object":1,"message_num":2,"message_stream":null,"message_level":1,"message_time":1593887847.045375,"message_rtime":0.001051,"test_type":"Test","test_subtype":null,"test_id":"/68b96288-be25-11ea-8e14-2477034de0ec","test_name":"/My test","test_flags":0,"test_cflags":0,"test_level":1,"test_uid":null,"test_description":null}
```

Each message is a [JSON] object. Object fields depend on the type of the message that is specified by the `message_keyword`.

Logs can be decompressed using either standard `xzcat` utility

```bash
$ xzcat test.log
```

or `tfs transform decompress` command

```bash
$ cat test.log | tfs transform decompress
```

## Saving Log

Test log can be saved into a file by specifying `-l` or `--log` option when running the test. For example,

```bash
$ python3 test.py --log test.log
```

## Transformations

Test logs can be transformed using `tfs transform` command. See `tfs transform --help` for a detailed list available transformations.

### nice

The `tfs transform nice` command can be used to transform test log into a `nice` output format which the default output
used for the `stdout`.

For example,

```bash
$ cat test.log | tfs transform nice
Jul 04,2020 19:20:21   ⟥  Module filters
Jul 04,2020 19:20:21     ⟥  Scenario test_0
Jul 04,2020 19:20:21       ⟥  Step first step
               596us       ⟥⟤ OK first step, /filters/test_0/first step
                 1ms     ⟥⟤ OK test_0, /filters/test_0
Jul 04,2020 19:20:21     ⟥  Suite suite 0
...
```

### short

The `tfs transform short` command can be used to transform test log into a `short` output format which contains test procedure
and test results.

For example,

```bash
$ cat test.log | tfs transform short
Module filters
  Scenario test_0
    Step first step
    OK
  OK
  Suite suite 0
...
```

### slick

The `tfs transform slick` command can be used to transform test log into a `slick` output format which contains only test names
with results provided as icons in front of the test name. This output format is very concise.

For example,

```bash
$ cat test.log | tfs transform slick
➤ Module filters
  ✔ Scenario test_0
  ➤ Suite suite 0
...
```
### dots

The `tfs transform dots` command can be used to transform test log into a `dots` output format which outputs dots
for each executed test.

For example,

```bash
$ cat test.log | tfs transform dots
.........................
```

### raw

The `tfs transform raw` command can be used to transform a test log into a `raw` output format which contains raw [JSON]
messages.

For example,

```bash
$ cat test.log | tfs transform raw
{"message_keyword":"PROTOCOL","message_hash":"489eeba5","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1593904821.784232,"message_rtime":0.001027,"test_type":"Module","test_subtype":null,"test_id":"/ee772b86-be4c-11ea-8e14-2477034de0ec","test_name":"/filters","test_flags":0,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
...
```

### compact

The `tfs transform compact` command can be used to transform a test log into a `compact` format which only contains
raw [JSON] test definition and result messages while omiting all messages for the steps.
It is used to create compact test logs used for comparison reports.

### compress

The `tfs transform compress` command is used to compress a test log with [LZMA] compression algorithm.

### decompress

The `tfs transform decompress` command is used to decompress a test log compressed with [LZMA] compression algorithm.

# Reports

Test logs can be used to create reports using `tfs report` command. See `tfs report --help` for a list of available reports.

## results

A results report can be generated from a test log using `tfs report results` command.
The report can be generated in either [Markdown] format (default) or [JSON] format
by specifying `--format json` option.
The report in [Markdown] can be converted to [HTML] using `tfs document convert` command.
For example,

```bash
$ cat test.log | tfs report results | tfs document convert > report.html
```

See `tfs report results --help` for details.

## coverage

Requirements coverage report can be generated from a test log using `tfs report coverage` command. The report is created in [Markdown]
and can be converted to [HTML] using `tfs document convert` command. For example,

```bash
$ cat test.log | tfs report coverage requirements.py | tfs document convert > coverage.html
```

See `tfs report coverage --help` for details.

## compare

A comparison report can be generated using one of the `tfs report compare` commands.

### results

A results comparison report can be generated using `tfs report compare results` command. See `tfs report compare results --help` for details.

### metrics

A metrics comparison report can be generated using `tfs report compare metrics` command. See `tfs report compare metrics --help` for details.

## specification

A test specification for the test run can be generated using `tfs report specification` command. See `tfs report specification --help` for details.

# Test Results

Any given test will have one of the following results.

## OK

Test has passed.

## Fail

Test has failed.

## Error

Test produced an error.

## Null

Test result was not set.

## Skip

Test was skipped.

## XOK

[OK] result was crossed out. Result is considered as passing.

## XFail

[Fail] result was crossed out. Result is considered as passing.

## XError

[Error] result was crossed out. Result is considered as passing.

## XNull

[Null] result was crossed out. Result is considred as passing.


# Test Parameters

Test parameters can be used to set attributes of a test. Here is a list of most common
parameters for a test:

* [name]
* [flags]
* uid
* [tags]
* [attributes]
* [requirements]
* [examples]
* description
* [xfails]
* [xflags]
* [ffails]
* only
* skip
* start
* end
* only_tags
* skip_tags
* args

> **{% attention %}** Most parameter names match the names of the attributes of the test which they set.
> For example, [name] parameter sets the name attribute of the test.

When test is defined inline then parameters can be specified right when test definition class is instantiated.
The first parameter is always `name` that sets the name of the test. The other parameters are usually
specified using keyword arguments.

For example,

```python
with Scenario("My test", description="This is a description of an inline test"):
    pass
```

# Naming Tests

You can set the name of any test either by setting the [name] parameter of the inline test
or using the [Name] decorator if the test is defined as a decorated function.
The name of the test can be accessed using the `name` attribute of the test.

## name

The [name] parameter of the test can be use used to set the [name] of any inline test. The [name] parameter
must be passed a `str` which will define the name of the test.

> **{% attention %}** For all test definition classes the first parameter is always the [name].

For example,

```python
with Test("My test") as test:
    note(test.name)
```

## Name

A [Name] decorator can be used to set the [name] of any test that is defined using a decorated function.

> **{% attention %}** The name of test defined using a decorated function
> is set to the name of the function if the [Name] decorator is not used.

For example,

```python
@TestScenario
@Name("The name of the scenario")
def scenario(self):
    note(self.name)
```

or if the [Name] decorator is not used

> **{% attention %}** Note that any underscores will be replaced with spaces in the name of the test.

```python
@TestScenario
def the_name_of_the_scenario(self):
    note(self.name)
```

# Test Flags

You can set the flags of any test either by setting the [flags] parameter of the inline test
or using the [Flags] decorator if the test is defined as a decorated function.
The flags of the test can be accessed using the `flags` attribute of the test.

## TE

Test to end flag. Continues executing tests even if this test fails.

## UT

Utility test flags. Marks test as utility for reporting.

## SKIP

Skip test flag. Skips the test during execution.

## EOK

Expected [OK] flag. Test result will be set to [Fail] if the test result is not [OK] otherwise [OK].

## EFAIL

Expected [Fail] flag. Test result will be set to [Fail] if the test result is not [Fail] otherwise [OK].

## EERROR

Expected [Error] flag. Test result will be set to [Fail] if the test result is not [Error] otherwise [OK].

## ESKIP

Expected [Skip] flag. Test result will be set to [Fail] if the test result is not [Skip] otherwise [OK].

## XOK

Cross out [OK] flag. Test result will be set to [XOK] if the test result is [OK].

## XFAIL

Cross out [Fail] flag. Test result will be set to [XFail] if the test result is [Fail].

## XERROR

Cross out [Error] flag. Test result will be set to [XError] if the test result is [Error].

## XNULL

Cross out [Null] flag. Test result will be set to [XNull] if the test result is [Null].

## FAIL_NOT_COUNTED

[Fail] not counted. [Fail] result will not be counted.

## ERROR_NOT_COUNTED

[Error] not counted. [Error] result will not be counted.

## NULL_NOT_COUNTED

[Null] not counted. [Null] result will not be counted.

## PAUSE_BEFORE

Pause before test execution. Test flow will be paused before test execution.

## PAUSE

Pause before test execution short form. See [PAUSE_BEFORE].

## PAUSE_AFTER

Pause after test execution. Test flow will be pause after test execution.

## REPORT

Report flag. Mark test to be included for reporting.

## DOCUMENT

Document flag. Mark test to be included in the documentation.

## MANDATORY

Mandatory flag. Mark test as mandatory such that it can't be skipped.

## ASYNC

Asynchronous test flag. This flag is set for all asynchronous tests.

## PARALLEL

Parallel test flag. This flag is set if test is running in parallel.

## MANUAL

Manual test flag. This flag indicates that test is manual.

## LAST_RETRY

Last retry flag. This flag is auto-set for the last retry iteration.

## flags

The [flags] parameter of the test can be use used to set the [flags] of any inline test. The [flags] parameter
must be passed valid flag or multiple flags combined with binary `OR` opertor.

For example,

```python
with Test("My test", flags=TE) as test:
    note(test.flags)
```

## Flags

A [Flags] decorator can be used to set the [flags] of any test that is defined using a decorated function.

For example,

```python
@TestScenario
@Flags(TE)
def scenario(self):
    note(self.flags)
```

# Command Line Arguments

You can add command line arguments to the top level test either by setting [argparser] parameter of the inline test
or using [ArgumentParser] decorator if top test is defined as a decorated function.

## argparser

The [argparser] parameter can be used to set a custom command line argument parser by passing it a function that takes `parser` as the first
parameter. This function will be called with an instance of [argparse] parser instance as the argument for the `parser` parameter.
The values of the command line arguments can be accessed using the `attributes` attribute of the test.

> **{% attention %}** Note that all arguments of the top level test become its `attributes`.

For example,

```python
def argparser(parser):
    """Custom command line arguments.

    :param parser: an instance of argparse parser.
    """
    parser.add_argument("--arg0", action="store_true",
        help="argument 0")
    parser.add_argument("--arg1", action="store_true",
        help="argument 1")

with Module("regression", argparser=argparser) as module:
    note(module.attributes["arg0"].value)
    note(module.attributes["arg1"].value)
```

## ArgumentParser

If [Module] is defined using a decorated function then [ArgumentParser] decorator can be used to set custom command line argument parser.
The values of the custom command line arguments will be passed to the decorated function as test arguments and therefore
the decorated function must take the first parameters with the same name as command line arguments.

For example,

```python
def argparser(parser):
    """Custom command line arguments.

    :param parser: an instance of argparse parser.
    """
    parser.add_argument("--arg0", action="store_true",
        help="argument 0")
    parser.add_argument("--arg1", action="store_true",
        help="argument 1")

@TestModule
@ArgumentParser(argparser)
def regression(self, arg0, arg1):
    note(arg0)
    note(arg1)
```

When custom command line argument parser is defined then the help messages obtained using `-h` or `--help` option will include
the description of the custom arguments. For example,

```bash
$ python3 ./test.py
...
test arguments:
  --arg0                                          argument 0
  --arg1                                          argument 1

```

# Tagging Tests

You can add `tags` to any test either by setting [tags] parameter of the inline test
or using [Tags] decorator if the test is defined as a decorated function. The values of the tags can be accessed
using the `tags` attribute of the test.

## tags

The [tags] parameter of the test can be use used to set [tags] of any inline test. The [tags] parameter
can be passed either a `list`, `tuple` or a `set` of tag values. For example,

```python
with Test("My test", tags=("tagA", "tagB")) as test:
    note(test.tags)
```
## Tags

A [Tags] decorator can be used to set [tags] of any test that is defined used a decorated function. For example,

```python
@TestScenario
@Tags("tagA", "tagB")
def scenario(self):
    note(self.tags)
```

# Test Attributes

You can add `attributes` to any test either by setting [attributes] parameter of the inline test
or using [Attributes] decorator if the test is defined as a decorated function. The values of the attributes can be accessed
using the `attributes` attribute of the test.

## attributes

The [attributes] parameter of the test can be used to set [attributes] of any inline test. The [attributes] parameter
can be passed either a `list` of `(name, value)` tuples or `Attribute` class instances. For example,

```python
with Test("My test", attributes=[("attr0", "value"), Attribute("attr1", "value")] as test:
    note(test.attributes)
```

## Attributes

An [Attributes] decorator can be used to set [attributes] of any test that is defined used a decorated function. For example,

```python
@TestScenario
@Attributes(
    ("attr0", "value"),
    Attribute("attr1", "value")
)
def scenario(self):
    note(self.attributes)
```

# Test Requirements

You can add `requirements` to any test either by setting [requirements] parameter of the inline test
or using [Requirements] decorator if the test is defined as a decorated function. The values of the requirements can be accessed
using the `requirements` attribute of the test.

> **{% attention %}** `Requirement` class instances must be always called with the version number the test is expected to verify.
> `RequirementError` exception will be raised if version does not match the version of the instance.

## requirements

The [requirements] parameter of the test can be used to set `requirements` of any inline test. The [requirements] parameter
must be passed a `list` of called `Requirement` instances. of the inline test
or using [Requirements] decorator if the test is defined as a decorated function. The values of the requirements can be accessed
using the `requirements` attribute of the test.

For example,

```python

RQ1 = Requirement("RQ1", version="1.0")

with Test("My test", requirements=[RQ1("1.0")] as test:
    note(test.requirements)
```

## Requirements

A [Requirements] decorator can be used to set `requirements` attribute of any test that is defined using a decorated function.
The decorator must be called with one or more called `Requirement` instances. For example,

```python
RQ1 = Requirement("RQ1", version="1.0")

@TestScenario
@Requirements(
    RQ1("1.0")
)
def scenario(self):
    note(self.requirements)
```

# Test Examples

You can add `examples` to any test by setting [examples] parameter of the inline test
or using [Examples] decorator if the test is defined as a decorated function. The examples can be accessed
using the `examples` attribute of the test.

## examples

The [examples] parameter of the test can be used to set `examples` of any inline test. The [examples] parameter
must be passed an table of examples which can be defined using `Examples` class for an inline test
or using the same [Examples] class as a decorator if the test is defined as a decorated function.
The rows of the examples table can be accessed
using the `examples` attribute of the test.

> **{% attention %}** Usually examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
with Test("My test", examples=Examples("col0 col1", [("col0_row0", "col1_row0"), ("col0_row1", "col1_row1")])) as test:
    for example in test.examples:
        note(str(example))
```

## Examples

An [Examples] decorator can be used to set `examples` attribute of any test that is defined using a decorated function
or used as an argument of the `examples` parameter for the test.
The [Examples] class defines a table of examples and should be passed a `header` and a `list` for the `rows`.

> **{% attention %}** Usually examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
@TestScenario
@Examples("col0 col1", rows=[
    ("col0_row0", "col1_row0"),
    ("col0_row1", "col1_row1")
])
def scenario(self):
    for example in self.examples:
        note(str(example))
```

# Test XFails

You can specify test results to be crossed out known as `xfails` for any test
either by setting `xfails` parameter of the inline test or using `XFails` decorator
if the test is defined as a decorated function. See [Crossing Out Results](#Crossing-Out-Results)
for more information.

## xfails

The [xfails] parameter of the test can be used to set `xfails` of any inline test. The [xfails] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        [(Result, "cross out reason"), ...],
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which one
or more results can be crossed out that are specified by the list.
A list must contain one or more `(Result, "reason")` two-tuples where
`Result` shall be the result that you want to cross out, for example [Fail],
and the reason shall be a string that specifies a reason why this result is being
crossed out.

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

> **{% attention %}** If the test `pattern` is not absolute then it is
> anchored to the test where [xfails] is being specified.

## XFails

The [XFails] decorator can be used to set `xfails` attribute of any test that is defined using a decorated function
or used as an extra argument when defining a row for the [examples] of the test.
The [XFails] decorator takes a dictionary of the same form as the [xfails] parameter.

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
for decorated tests. See [Setting or Clearing Flags](#Setting-or-Clearing-Flags).

## xflags

The [xflags] parameter of the test can be used to set `xflags` of a test. The [xflags] parameter
must be passed a dictionary of the form

```python
{
    "pattern":
        (set_flags, clear_flags),
    ...
}
```

where key `pattern` is a test [pattern] that matches one or more tests for which
flags will be set or cleared. The flags to be set or cleared are
specified by a two-tuple of the form`(set_flags, clear_flags)` where the
first element specifies flags to be set and the second element specifies
flags to cleared.

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

# Test FFails

You can force result, including [Fail] result, of any test by setting
`ffails` parameter or using `FFails` decorator
for decorated tests. See [Forcing Results](#Forcing-Results).

## ffails

The [ffails] parameter of the test can be used to force any result of a test including [Fail]
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
the result will be set by force and the body of the test will not be executed.
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

### Optional `when` Condition 

Optionally, the tuple can include 
a `when` condition, specified as a function, as the last element.
If present, the `when` function is called before test execution.
The boolean result returned by the `when` function determines if the forced result is applied, 
if the function returns `True`, or not, if it returns `False`. 
The `when` function must take one argument which is the instance of the test.

> **{% attention %}** The optional `when` function can define any logic that 
> is needed to determine if some condition is met. Any [callable] can be used.

For example,

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

# Specialized keywords

The framework encourages the usage of specialized keywords as they can provide the much needed context for your steps
when writing your test scenarios.

The specialized keywords map to core [Step], [Test], [Suite], and [Module] test definition classes as follows:

* [Module](#Module) is defined as a [Module](#Module)
* [Suite](#Suite) is defined as a [Feature](#Feature)
* [Test](#Test) is defined as a [Scenario](#Scenario)
* [Step](#Step) is defined as one of the following:
  * [Given](#Given) is used define a step for precondition or setup
  * [Background](#Background) is used define a step for a complex precondition or setup
  * [When](#When) is used to define a step for an action
  * [And](#And) is used as a continuation of the previous step
  * [By](#By) is used to define a sub-step
  * [Then](#Then) is used to define a step for positive assertion
  * [But](#But) is used to define a step for negative assertion
  * [Finally](#Finally) is used to define a cleanup step

# Semi-Automated And Manual Tests

Tests can be semi-automated and include one or more manual steps or
be fully manual.

## Semi-Automated

Semi-automated tests are tests that have one or more steps with the [MANUAL] flag set.

> **{% attention %}** [MANUAL] test flag is propagated down to all sub-tests.

For example,

```python
from testflows.core import *

with Scenario("my mixed scenario"):
    with Given("automated setup"):
        pass
    with Step("manual step", flags=MANUAL):
        pass
```

When a semi-automated test is run the test program pauses and asks for input
for each manual step.

```bash
Sep 06,2021 18:39:00   ⟥  Scenario my mixed scenario
Sep 06,2021 18:39:00     ⟥  Given automated setup, flags:MANDATORY
               559us     ⟥⟤ OK automated setup, /my mixed scenario/automated setup
Sep 06,2021 18:39:00     ⟥  Step manual step, flags:MANUAL
✍  Enter `manual step` result? OK
✍  Is this correct [Y/n]? Y
            3s 203ms     ⟥⟤ OK manual step, /my mixed scenario/manual step
            3s 212ms   ⟥⟤ OK my mixed scenario, /my mixed scenario
```

## Manual

A manual test is just test that has [MANUAL] flag set at the test level.
Any sub-tests such as steps inherit [MANUAL] flag from the parent test.

For example,

```python
from testflows.core import *

with Scenario("manual scenario", flags=MANUAL):
    with Given("manual setup"):
        pass
    with When("manual action"):
        pass
```

When a manual test is run the test program pauses for each test step as well as to get
the result of the test itself.

```bash
Sep 06,2021 18:44:30   ⟥  Scenario manual scenario, flags:MANUAL
Sep 06,2021 18:44:30     ⟥  Given manual setup, flags:MANUAL|MANDATORY
✍  Enter `manual setup` result? OK
✍  Is this correct [Y/n]? Y
            3s 168ms     ⟥⟤ OK manual setup, /manual scenario/manual setup
Sep 06,2021 18:44:33     ⟥  When manual action, flags:MANUAL
✍  Enter `manual action` result? OK
✍  Is this correct [Y/n]? Y
            6s 529ms     ⟥⟤ OK manual action, /manual scenario/manual action
✍  Enter `manual scenario` result? OK
✍  Is this correct [Y/n]? Y
           13s 368ms   ⟥⟤ OK manual scenario, /manual scenario
```
# Test Definition Classes

## Module

A [Module] can be defined using [Module] test definition class or [TestModule] decorator.

```python
@TestModule
def module(self):
    Feature(run=feature)
```

or inline as

```python
with Module("module"):
    Feature(run=feature)
```

## Suite

A [Suite] can be defined using [Suite] test definition class or [TestSuite] decorator.

```python
@TestSuite
@Name("My suite")
def suite(self):
    Test(run=testcase)
```

or inline as

```python
with Suite("My suite"):
    Test(run=testcase)
```

## Feature

A [Feature] can be defined using [Feature] test definition class or [TestFeature] decorator.

```python
@TestFeature
@Name("My feature")
def feature(self):
    Scenario(run=scenario)
```

or inline as

```python
with Feature("My feature"):
    Scenario(run=scenario)
```

## Test

A [Case](#Case-is) can be defined using [Test] test definition class or [TestCase] decorator.

```python
@TestCase
@Name("My testcase")
def testcase(self):
    with Step("do something"):
        pass
```

or inline as

```python
with Test("My testcase"):
    with Step("do something"):
        pass
```

> **{% attention %}** Note that here the word `test` is used to define a [Case](#Case-is) to match the most common meaning of the word `test`.
> When someone says they will run a `test` they most likely mean they will run a test [Case](#Case-is).

## Scenario

A [Scenario] can be defined using [Scenario] test definition class or [TestScenario] decorator.

```python
@TestScenario
@Name("My scenario"):
def scenario(self):
    pass
```

or inline as

```python
with Scenario("My scenario"):
    pass
```

## Check

A [Check] can be defined using [Check] test definition class or [TestCheck] decorator

```python
@TestCheck
@Name("My check")
def check(self):
    pass
```

or inline as

```python
with Check("My check"):
    pass
```

and is usually used inside either [Test] or [Scenario] to define an inline sub-test

```python
with Scenario("My scenario"):
    with Check("My check"):
        pass

    with Check("My other check"):
        pass
```

## Critical, Major, Minor

A [Critical], [Major], or [Minor] checks can be defined using [Critical], [Major]
or [Minor] test definition class respectively or similarly using [TestCritical], [TestMajor],
[TestMinor] decorators

```python
@TestCritical
@Name("My critical check")
def critical(self):
    pass

@TestMajor
@Name("My major check")
def major(self):
    pass

@TestMinor
@Name("My minor minor")
def minor(self):
    pass
```

or inline as

```python
with Critical("My critical check"):
    pass

with Major("My major check"):
    pass

with Minor("My minor check"):
    pass
```

and are usually used inside either [Test] or [Scenario] to define inline sub-tests.

```python
with Scenario("My scenario"):
    with Critical("my critical check"):
        pass

    with Major("my major check"):
        pass

    with Minor("my minor check"):
        pass
```

These classes are usually used for classification of checks during reporting.

```bash
1 scenario (1 ok)
1 critical (1 ok)
1 major (1 ok)
1 minor (1 ok)
```

## Example

An [Example] can be only defined inline using [Example] test definition class. There is no decorator
to define it outside of existing test. An [Example] is of a [Test Type] and is used to define
one or more sub-tests. Usually, [Example]s are created automatically using [Outline]s.

```python
with Scenario("My scenario"):
    with Example("Example 1"):
        pass

    with Example("Example 2"):
        pass
```

## Outline

An [Outline] can be defined using [Outline] test definition class or [TestOutline] decorator.
An [Outline] has its own test [Type] but can be made specific when defined using [TestOutline]
decorator by passing it a specific [Type] or a [Sub-Type] such as [Scenario] or [Suite] etc.

However, because [Outline]s are meant to be called from other tests or used with [Examples]
it is best to define an [Outline] using [TestOutline] decorator as follows.

```python
from testflows.core import *

@TestOutline(Scenario)
@Examples("greeting name", [
    ("Hello", "John"),
    ("Goodbye", "Eric")
])
def outline(self, greeting, name):
    note(f"{greeting} {name}!")

outline()
```

When [Examples] are defined for the [Outline] and an outline is called with no arguments from a test
that is of higher [Type] than the [Type] of outline itself then when called the outline will iterate over all
the examples defined in the [Examples] table. For example, run the example above that executes the outline
with no arguments you will see that the outline iterates over all the examples in the [Examples] table where
each example, a row in the examples table, defines the values of the arguments for the outline.

```bash
Jul 05,2020 18:16:34   ⟥  Scenario outline
                            Examples
                              greeting | name
                              -------- | ----
                              Hello    | John
                              Goodbye  | Eric
Jul 05,2020 18:16:34     ⟥  Example greeting='Hello', name='John'
                              Arguments
                                greeting
                                  Hello
                                name
                                  John
               757us     ⟥    [note] Hello John!
               868us     ⟥⟤ OK greeting='Hello', name='John', /outline/greeting='Hello', name='John'
Jul 05,2020 18:16:34     ⟥  Example greeting='Goodbye', name='Eric'
                              Arguments
                                greeting
                                  Goodbye
                                name
                                  Eric
               675us     ⟥    [note] Goodbye Eric!
               766us     ⟥⟤ OK greeting='Goodbye', name='Eric', /outline/greeting='Goodbye', name='Eric'
                 4ms   ⟥⟤ OK outline, /outline
```

If we run the same outline with arguments, then the outline will not use the [Examples] but instead will
use the argument values that were provided to the outline. For example,

```python
with Scenario("My scenario"):
    outline(greeting="Hey", name="Bob")
```

will produce the following output.

```bash
Jul 05,2020 18:23:02   ⟥  Scenario My scenario
                 1ms   ⟥    [note] Hey Bob!
                 2ms   ⟥⟤ OK My scenario, /My scenario
```

### Setting Parameters

#### **For an Example**

You can set parameters for an individual example by specifying them right after the values for the example row.

> **{% attention %}** Any test parameters that are specified for the example will override any common parameter values.

For example,

```python
@TestOutline(Scenario)
@Examples("greeting name", [
    ("Hello", "John", {"tags": ("tag0", "tag1"), "attributes": [("attr0", "value0")]}),
    ("Goodbye", "Eric")
])
def outline(self, greeting, name):
    note(f"{greeting} {name}!")
```

#### **For All Examples**

You can set common parameter values for all the examples specified by the [Examples] table using the `args` parameter
and passing it a `dict` with parameter values as the argument.

> **{% attention %}** Note that parameters set for a specific example override any common values.

```python
@TestOutline(Scenario)
@Examples("greeting name", [
    ("Hello", "John", {"tags": ("tag0", "tag1"), "attributes":[("attr0", "value0")]}),
    ("Goodbye", "Eric")
], args={"tags": ("common_tag0", "common_tag1")})
def outline(self, greeting, name):
    note(f"{greeting} {name}!")
```

## Iteration

An [Iteration] is not meant to be used explicitly and in most cases is only used
internally to implement test repetitions.

## RetryIteration

A [RetryIteration] is not meant to be used explicitly and in most cases is only used
internally to implement test retries.

## Step

A [Step] can be defined using [Step] test definition class or [TestStep] decorator.

```python
@TestStep
def step(self):
    note("generic test step")
```

A [TestStep] can be made specific by passing it a specific [BBD] step [Sub-Type].

```python
@TestStep(When)
def step(self):
    note("a When step")
```

A [Step] can be defined inline as

```python
with Step("step"):
    note("generic test step")
```

## Given

A [Given] step is used to define precodition or setup and is always treated as a mandatory step
that can't be skipped because [MANDATORY] flag will be set by default.
It is defined using [Given] test definition class or using [TestStep] with [Given] passed as the [Sub-Type].

```python
@TestStep(Given)
def I_have_something(self):
    pass
```

or inline as

```python
with Given("I have something"):
    pass
```

## Background

A [Background] step is used define a complex precodition or setup usually containing multiple
[Given](#Given)'s and can be defined using [Background] test definition class or [TestBackground]
decorator. It is treated as a mandatory step that can't be skipped.

```python
@TestBackground
@Name("My complex setup")
def background(self):
    with Given("I need to setup something"):
        pass

    with And("I need to setup something else"):
        pass
```

or inline as

```python
with Background("My complex setup"):
    with Given("I need to setup something"):
        pass

    with And("I need to setup something else"):
        pass
```

## When

A [When](#When) step is used to define an action within a [Scenario]. It can be defined using [When] test definition class
or using [TestStep] decorator with [When] passed as the [Sub-Type].

```python
@TestStep(When)
def I_do_some_action(self):
    do_some_action()
```

or inline as

```python
with When("I do some action"):
    do_some_action()
```

## And

An [And](#And) step is used to define a step of the same [Sub-Type] as the step right above it.
It is defined using [And] test definition class.

> **{% attention %}** It does not make sense to use [TestStep] decorator to define it so always define it inline.

```python
with When("I do some action"):
    pass

with And("I do another action"):
    pass
```

or

```python
with Given("I have something"):
    with When("I do some action to setup things"):
        pass
    with And("I do another action to continue the setup"):
        pass
```

> **{% attention %}** `TypeError` exception will be raised if the [And] step is defined where it has no sibling. For example,
>
> ```python
with Given("I have something"):
   # TypeError exception will be raised on the next line
   # and can be fixed by changing the `And` step into a `When` step
   with And("I do something"):
       pass
```
>
> with the exception being as follows.
>
> ```
TypeError: `And` subtype can't be used here as it has no sibling from which to inherit the subtype
```

> **{% attention %}** `TypeError` exception will also be raised if the [Type] of the sibling does not match the [Type] of the [And] step.
> For example,
>
> ```python
with Scenario("My scenario"):
   pass

# TypeError exception will be raised on the next line
# and can be fixed by changing the `And` step into a `When` step
with And("I do something"):
   pass
```
>
> with the exception being as follows.
>
> ```
TypeError: `And` subtype can't be used here as it sibling is not of the same type
```

## By

A [By](#By) step is usually used to define a sub-step using [By] test definition class.

```python
with When("I do something"):
    with By("doing some action"):
        pass
```

## Then

A [Then] step is used to define a step that usually contains a positive assertion.
It can be defined using [Then] test definition class
or using [TestStep] decorator with [Then] passed as the [Sub-Type].

```python
@TestStep(Then)
def I_check_something_is_true(self):
    assert something
```

or inline as

```python
with Then("I expect something"):
    assert something
```

## But

A companion of the [Then] step is a [But] step and is
used to define a step that usually contains an negative assertion.
It can be defined using [But] test definition class
or using [TestStep] decorator with [But] passed as the [Sub-Type].

```python
@TestStep(But)
def I_check_something_is_not_true(self):
    assert not something
```

or inline as

```python
with But("I check something is not true"):
    assert not something
```

## Finally

A [Finally] step is used to define a cleanup step and is treated as a mandatory step
that can't be skipped because [MANDATORY] flag will be set by default.

It can be defined using [Finally] test definition class
or using [TestStep] decorator with [Finally] passed as the [Sub-Type].

```python
@TestStep(Finally)
def I_clean_up(self):
    pass
```

or inline as


```python
with Finally("I clean up"):
    pass
```

The [TE] flag is always set for [Finally] steps as multiple [Finally]
steps can be defined back to back and the failure
of previous step should not prevent execution of other [Finally] steps that follow.

# Concepts

The framework was implemented with the following concepts and definitions in mind.
These definitions were used as a guideline to implement test [Tree](#Tree-is) hierarchy.
While the implementation does not strictly enforce these concepts, users are encouraged
to apply these definitions during the design of their tests.

## Everything is a Test

The framework treats everything as a test including setup and teardown.

## Definitions

### Test is

something that produces a result.

### Flow is

a specific order of execution of [Tests](#Test-is)

### Tree is

a rooted tree graph that results from the execution of a [Flow](#Flow-is)

### Step is

is a lowest level [Test](#Test-is)

### Case is

a [Test](#Test-is) that is made up of one or more [Steps](#Step-is)

### Suite is

is a [Test](#Test-is) that is made up of one or more [Cases](#Case-is)

### Module is

a [Test](#Test-is) that is made up of one or more [Suites](#Suite-is)

# Types

The framework divides tests into the following [Types] from highest to the lowest

* [Module]
* [Suite]
* [Test]
* [Outline]
* [Iteration]
* [RetryIteration]
* [Step]

Children of each [Type] usually must be of the same [Type] or lower with the only notable exception
being an [Iteration] that is used to implement test repetitions.

# Sub-Types

The framework uses the following [Sub-Types] in order to provide more flexibility and implement specialized keywords

* [Feature]
* [Scenario]
* [Example]
* [Check]
* [Critical]
* [Major]
* [Minor]
* [Background]
* [Given]
* [When]
* [Then]
* [And]
* [But]
* [By]
* [Finally]

# Sub-Types Mapping

The [Sub-Types] have the following mapping to the core six [Types]

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
* [Outline]
* [Iteration]
* [Step]
  * [Given]
  * [When]
  * [Then]
  * [But]
  * [By]
  * [Finally]
  * [Background]

# Setups And Teardowns

Test setup and teardown could be explicitly specified using [Given] and [Finally] steps.

For example [Scenario] that needs to do some setup and perform clean up as part
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

> **{% attention %}** [Given] and [Finally] steps have [MANDATORY] flag set by default
> and therefore these steps can't be skipped.

> **{% attention %}** [Finally] steps must be located within `finally` blocks
> to ensure their execution.

## Common Setup And Teardown

If multiple tests require the same setup and teardown and the result of setup
can be shared between these tests then the common setup and teardown
should be defined at the parent test level. Therefore,
for multiple [Scenario]s that share the same setup and teardown
it should be defined at the [Feature] level and for multiple
[Feature]s that share the same setup and teardown it should be defined
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

When setup creates a resource that needs to be cleaned up one must 
ensure that [Finally] step checks if [Given] has actually suceeded in creating
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

When a test needs to perform multiple setups and teardowns then
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
the second time to perform the clean during test's teardown.

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

If [Given] step creates a resource it can by `yield`ed
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
within caller's thread, another thread, in a different process
or even on a remote host. Therefore, depending on how a test is called 
returning values from a test might not be as simple as
when one calls a regular function. 

## Using `value()`

A generic way for a test to return a value is using [value() function].
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
within the same test type the return value is `None`
if the test function did not return any value using the `return` statement.

```python
with Step("my step"):
    my_step() # returns None
```

But if the test does `return` a value then it is set as the last value
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

The most convenient way a decorated test can return a value is 
using `return` statement. For example, a test step can be defined as follows

```python
@TestStep
def my_step(self):
    return "my value"
```

and when called within another step the returned value is received just
like from a function. 

```python
with Step("my step"):
    my_value = my_step()  
```

This is because calling a decorated test 
within a test of the same type just runs the decorated test function
and therefore the call is similar to calling a function with the ability
to get the return value directly. See [Calling Decorated Tests](#Calling-Decorated-Tests).

However, if you call a decorated test as a function
within a higher test type, for example calling a [Step] within a [Test],
or when you call an inline defined test, then the return value
is a `TestBase` object and the returned value needs to be retrieved
as `value` attribute from the `result` attribute of the `TestBase` object
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

# Loading Tests

## Using `load()`

You can use [load() function] to load a test or any object from another
module.

For example, given a [Scenario] defined in `tests/another_module.py`

```python
from testflows.core import *

@TestScenario
def my_test_in_another_module(self):
    pass

```

then you can use [load() function] to load this test in another module 
and use it as a base for an inline defined [Scenario] as follows.

```python
with Module("my module"):
     Scenario("my test", run=load("tests.another_module", test="my_test_in_another_module"))
```

## Using `loads()`

You can use [loads() function] to load one or more tests of a given 
test class.

For example, given multiple [Scenario]s defined in the same file one can
use `loads() function` to execute all the [Scenario]s as follows

```python
@TestScenario
def test1(self):
    pass

@TestScenario
def test2(self):
    pass

@TestFeature
def feature(self):
    for scenario in loads(current_module(), Scenario):
        scneario()
```

If a file contains multiple test types then you can just 
specify them as needed. For example,

```python
@TestSuite
def test1(self):
    pass

@TestScenario
def test2(self):
    pass

@TestFeature
def feature(self):
    for test in loads(current_module(), Scenario, Suite):
        test()
```

See also [using current_module()].

## Using `ordered()`

By default [loads() function] returns tests in random order. If you want
a deterministic order then use [ordered() function] to sort
a list of tests loaded with [loads() function] by test function name.

For example,

```python
@TestFeature
def feature(self):
    for scenario in ordered(loads(current_module(), Scenario)):
        scenario()
```

# Loading Modules

## Using `current_module()`

Using [current_module() function] allows to conveniently reference
the current module. For example,

```python
@TestFeature
def feature(self):
    for test in loads(current_module(), Scenario, Suite):
        test()
```

## Using `load_module()`

The [load_module() function] allows to load any module by specifying module name.

For example,

```python
@TestFeature
def feature(self):
    for scenario in loads(load_module("tests.another_module"), Scenario):
        scenario()
```

# Async Tests

Asynchronous tests are natively supported.
All asynchronous tests get [ASYNC](#ASYNC) flag set in [flags].

## Inline

An inline asynchronous tests can be defined using [async with] statement as follows.

```python
import asyncio
from testflows.core import *

@TestModule
async def module(self):
    async with Test("my async test"):
        async with Step("my async test step"):
            note("Hello from asyncio!")

        
asyncio.run(module())
```

## Decorated

A decorated asynchronous test can be defined in a similar way as a non-asynchronous test. 
The only difference is that the decorated function must be asynchronous
and be defined using `async def` keyword just like any other asynchronous function.

```python
import asyncio
from testflows.core import *

@TestScenario
async def my_test(self, number):
    note("Hello from async scenario {number}!")

@TestModule
async def module(self):
    await Scenario(name="my test 0", test=my_test)(number=0)
    await Scenario(name="my test 1", test=my_test)(number=1)
        
asyncio.run(module())
```

> **{% attention %}** See [asyncio] module to learn more about asynchronous programming in [Python].

# Parallel Tests

## Running

Tests can be executed in parallel either using threads 
or asynchronous executor defined using [ThreadPool class] or [AsyncPool class] respectively.

In order to run a test in parallel, a test must either have [PARALLEL](#PARALLEL) flag
set or `parallel=True` specified during test definition.

A parallel executor can be specified using `executor` parameter. If no executor
is explicitly specified then a default executor is created for the
test of the type that is needed to execute a test. 

> **{% attention %}** Note that the default executor does not have a limit on a number
> of parallel tests as the pool size is not limited.

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

Parallel executors can be used to gain fine grain control of how many
tests are executed in parallel.

> **{% attention %}** You should not share a single pool executor between different tests
> as it can lead to a deadlock given that a situation might arise when a parent test
> can be left waiting for the child test to complete and a child test will not be
> able to complete due to the shared pool having no available workers.

If you want to share a pool between different tests you must use either 
`SharedThreadPool class` or `SharedAsyncPool class` for normal or asynchronous tests
respectively. These classes ensure that a deadlock between a parent and child test is avoided
by blocking and waiting for completion of any task that is submitted when no idle workers
are available.

## Thread Pool

A thread pool executor is defined by creating an object of [Pool class] which is
a short form to define a [ThreadPool class] and will run a test in another thread. 

The maximum number of threads can be controlled by setting `max_workers`
parameter and by default is set to `16`. If `max_workers` is set to `None`
then the pool size is not limited.

If there are more tasks submitted to the pool then the currently available
threads then any extra tasks will block until a worker in the pool
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
parameter and by default is set to `1024`. If `max_workers` is set to `None`
then the pool size is not limited.

If there are more tasks submitted to the pool then the currently available
threads then any extra tasks will block until a worker in the pool
is freed up.

```python
with AsyncPool(5) as pool:
    Scenario(name="my async test 0", test=my_async_test, parallel=True, executor=pool)(number=0)
    Scenario(name="my async test 1", test=my_async_test, parallel=True, executor=pool)(number=1)
```

# Crossing Out Results

All test results except [Skip] result can be cross out including [OK]. This functionality
is useful when one or more tests fail and you don't want to see the next run
fail because of the same test failing.

Crossing out a result means converting it to the corresponding crossed out result
that starts with `X`.

* ~[Fail]~ becomes [XFail]
* ~[Error]~ becomes [XError]
* ~[Null]~ becomes [XNull]
* ~[OK]~ becomes [XOK]

> **{% attention %}** The concept of crossing out result should not be confused with expected results.
> It is invalid to say that, for example [XFail], means an expected fail. 
> In general if you expect a fail then if the result of the test is [Fail] then
> the final test result is [OK] and anything other result would cause the final
> result to be [Fail] as the expectation was not satisfied.

The correct way to think about crossed out results is to imagine that a test
summary report is printed on a paper and after looking over the test results
and performing some analysis any result can be crossed out with an optional reason. 

Only the result that exactly matches the result to be crossed out is actually crossed out.
For example, if you want to cross out [Fail] result of the test but the test has
a different result then it will not be crossed out.

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
anchored to the top level test during assignment.

# Setting or Clearing Flags

Test flags can be set or cleared externally using [xflags] or [XFlags] decorator.
This test attribute is pushed down the flow from parent test to child tests
as long as the [pattern] has a chance of matching.

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

Test result can be forced and the body of the test skipped
by using [ffails] or [FFails] decorator.
This test attribute is pushed down the flow from parent test to child tests
as long as the [pattern] has a chance of matching.

This allows to force the result of any child test at any level of the test flow
including at the top level test.

> **{% attention %}** When test result is forced the body of the test is not executed.

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
and [XOkayed] can be used to tie force result right where the test is defined.

> **{% attention %}** When test result is forced the body of the test is not executed.

These decorators are just a short-hand form of
specifying forced results using [ffails]
test attribute. Therefore, if parent test explicitly specifies [ffails] then it overrides
forced results tied to the test.

> **{% attention %}** Only one such decorator can be applied to a given test.
> If you need to specify more than one forced result then [FFails] decorator shall be used.

See also description for the [Optional `when` Condition].

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

# Repeating Tests

You can repeat tests by specifying [repeats] parameter either explicitly
for inline tests or using [Repeats] or [Repeat] decorator for decorated tests.

Repeating a test means to rerun it multiple times. For each run a new [Iteration] is 
creating with the name being the index of the current iteration. The result of each
iteration is counted and fails are not ignored. 

In general, it's useful to repeat a test when you would like to confirm test stability.
In addition to specifying repeats inside a test program you can also pass [--repeat option]
to your test program to specify which tests you would like to repeat from the command line.

> {% attention %} If need you need to repeat a test and you would like to count only
> the last passing iteration see [Retrying Tests] section.

You can combine [Repeats] with [Retries] and if done so retries are performed
for each [Iteration]. 

You can repeat a test `until` either `pass`, `fail` or `complete` criteria is met
by specifying `until` parameter.

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

Until **complete** means that iteration over a test will stop only after the specified number
of repeats is performed regardless of the result of each iteration. 


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

If you want to specify to repeat only one test it is more convenient to use [Repeat]
decorator instead.

## Repeat

The [Repeat] decorator is used to specify a repetition for a single test that has
a [Test Type] or higher. Repeating test [Step]s is not allowed. The [Repeat] decorator is 
usually applied the test to which the decorator is attached as by default, the `pattern` is empty
and means it applies to the current test and the `until` is set to `complete`
which means that the test will be repeated the specified number of times.

> **{% attention %}** If you need to specify repeat for more than one test
> use [Repeats] decorator instead.

> **{% attention %}** [Repeat] decorator cannot be applied more than one time
> to the same test.

For example,

```python
@TestScenario
@Repeat(5) # by default pattern="", until="complete"
def my_scenario(self):
    pass
```

If you want to specify custom `pattern` or `until` condition then pass them
using `pattern` and `until` parameters respectively.

```python
@TestScenario
@Repeat(count=5, pattern="my subtest", until="fail")
def my_scenario(self):
    Scenario(name="my subtest", run=my_test)
```

# Retrying Tests

You can retry tests until they pass or until the number of retries is exhausted 
by specifying [retries] parameter either explicitly
for inline tests or using [Retries] or [Retry] decorator for decorated tests.

Retrying a test means to rerun it multiple times until it passes.
A pass means that a retry has either [OK], [XFail], [XError], [XNull], [XOK], or [Skip]
result.

For each attempt a [RetryIteration] is created with the name corresponding to the 
try number. Any fails of an individual
attempt is ignored unless it is the last retry attempt. Last [RetryIteration]
is marked by [LAST_RETRY] flag.

In general, it's useful to retry a test when test is unstable and sometimes could fail
but you still would like to run it as long as it passes within the specified number
of retries.

## Retries

The [Retries] decorator can be applied to a decorated test that has a [Test Type] or higher.
Retrying test [Step]s is not allowed. The [Retries] decorator should be used
when you want to specify more than one test to be retried. The tests to be retried
are selected using test [pattern]s. The [Retries] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes or maximum
number of retries is reached.

For example,

```python
@TestFeature
@Retries({
    "my scenario 0": 5,
    "my scenario 1": 10
})
def my_feature(self):
    Scenario(name="my scenario 0", run=my_scenario)
    Scenario(name="my scneario 1", run=my_scenario)
```

If you want to specify to retry only one test it is more convenient to use [Retry]
decorator instead.

## Retry

The [Retry] decorator is used to specify a retry for a single test that has
a [Test Type] or higher. Retrying test [Step]s is not allowed. The [Retry] decorator is 
usually applied the test to which the decorator is attached as by default, the `pattern` is empty
and means it applies to the current test.
The [Retry] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes or maximum
number of retries is reached. 

> **{% attention %}** If you need to specify retries for more than one test
> use [Retries] decorator instead.

> **{% attention %}** [Retry] decorator cannot be applied more than one time
> to the same test.

For example,

```python
@TestScenario
@Retry(5) # by default pattern=""
def my_scenario(self):
    pass
```

or you can specify `pattern` as

```python
@TestScenario
@Retry(5, pattern="test to repeat")
def my_scenario(self):
    pass
```

# Retrying Code or Function Calls

When you need to retry a block of code or a function call you can use
**retries** class and **retry** class respectively provided by `testflows.asserts` module.

> **{% attention %}** `retries()` or `retry()` should not be used to retry tests.
> Use [Retries] or [Retry] decorator or explicitly specify [retries] parameter instead.

## Using `retries()`

For example, you can retry any block of code using **retries** from `testflows.asserts`
as follows where we wait for the code to succeed within `5` sec using `0.1` sec delay
between retries and backoff multiplier of `1.2` with jitter range
between `-0.05` min to `0.05` max.

```python
import random
from testflows.core import *
from testflows.asserts import retries, error

with Scenario("my test"):
    with When("I try to get a random number")
        for attempt in retries(AssertionError, timeout=5, delay=0.1, backoff=1.2, jitter=(-0.05,0.05)):
            with By(f"using random.random() attempt #{attempt.number}"):
                with attempt:
                    assert random.random() > 0.8, error()
```

The code block is considered as succeeded if no exception is raised. 
If an exception is raised and it is one of the expected exceptions then 
the code is retried until it succeeds or timeout occurs.

> **{% attention %}** If code blocks raises an exception that is not one of the expected exceptions
> then the unexpected exception is not caught.

More than one exception can be specified as follows.

```python
for attempt in retries(TypeError, ValueError, AssertionError, timeout=5):
    with attempt:
        value = random.random()
        if value < 0.5:
            raise TypeError("less than 0.5")
        elif value < 0.7:
            raise ValueError("greater or equal to 0.5 but less than 0.7")
        else:
            assert random.random() > 0.9, error()
```

## Using `retry()`

The **retry** from `testflows.asserts` can be used both as a plain function decorator
or as wrapper for a plain function call.

For example, using it as a decorator.

```python
import random

@retry(AssertionError, timeout=5, delay=0.1)
def my_func():
    assert random.random() > 0.2, error()
```

> **{% attention %}** You cannot combine **retry** decorator with test decorators.
> 
> Therefore, the following code will not work
> ```python
@retry(Fail, timeout=5)
@TestScenario
def my_scenario(self):
    pass
```
> neither will this
> ```python
@TestScenario
@retry(Fail, timeout=5)
def my_scenario(self):
    pass
```

Another usage is to retry a common function call. For example,

```python
def my_func(x):
    assert random.random() > x, error()

with Test("my test"):
    value = retry(AssertionError, timeout=5).call(my_func, x=0.2)
```

[using current_module()]: #Using-current-module
[pattern]: #pattern
[--only]: #–only
[--skip]: #–skip
[--start]: #–start
[--end]: #–end
[--pause-before]: #–pause-before
[--pause-after]: #–pause-after
[--repeat]: #–repeat
[--retry]: #–retry
[OK]: #OK
[Fail]: #Fail
[Error]: #Error
[Null]: #Null
[Skip]: #Skip
[XOK]: #XOK
[XFail]: #XFail
[XError]: #XError
[XNull]: #XNull
[TE]: #TE
[UT]: #UT
[SKIP]: #SKIP
[EOK]: #EOK
[EFAIL]: #EFAIL
[EERROR]: #EERROR
[ESKIP]: #ESKIP
[XOK]: #XOK
[XFAIL]: #XFAIL
[XERROR]: #XERROR
[XNULL]: #XNULL
[FAIL_NOT_COUNTED]: #FAIL_NOT_COUNTED
[ERROR_NOT_COUNTED]: #ERROR_NOT_COUNTED
[NULL_NOT_COUNTED]: #NULL_NOT_COUNTED
[PAUSE_BEFORE]: #PAUSE_BEFORE
[PAUSE]: #PAUSE
[PAUSE_AFTER]: #PAUSE_AFTER
[REPORT]: #REPORT
[DOCUMENT]: #DOCUMENT
[MANDATORY]: #MANDATORY
[MANUAL]: #MANUAL
[LAST_RETRY]: #LAST_RETRY
[flags]: #flags
[Flags]: #Flags
[xfails]: #xfails
[XFails]: #XFails
[xflags]: #xflags
[XFlags]: #XFlags
[ffails]: #ffails
[FFails]: #FFails
[name]: #name
[Name]: #Name
[examples]: #examples
[Examples]: #Examples
[tags]: #tags
[Tags]: #Tags
[attributes]: #attributes
[Attributes]: #Attributes
[requirements]: #requirements
[Requirements]: #Requirements
[argparser]: #argparser
[ArgumentParser]: #ArgumentParser
[argparse]: https://docs.python.org/3/library/argparse.html
[Module]: #Module
[Feature]: #Feature
[Type]: #Types
[Types]: #Types
[Module Type]: #Types
[Suite Type]: #Types
[Test Type]: #Types
[Outline Type]: #Types
[Iteration Type]: #Types
[Step Type]: #Types
[Sub-Type]: #Sub-Types
[Sub-Types]: #Sub-Types
[Sub-Types Mapping]: #Sub-Type-Mapping
[everything is a test]: #Everything-is-a-Test
[Given]: #Given
[When]: #When
[And]: #And
[By]: #By
[Then]: #Then
[But]: #But
[Finally]: #Finally
[Step]: #Step
[TestStep]: #Step
[Test]: #Test
[TestCase]: #Test
[Check]: #Check
[TestCheck]: #Check
[Critical]: #Critical-Major-Minor
[Major]:  #Critical-Major-Minor
[Minor]:  #Critical-Major-Minor
[TestCritical]:  #Critical-Major-Minor
[TestMajor]:  #Critical-Major-Minor
[TestMinor]:  #Critical-Major-Minor
[Example]: #Example
[Scenario]: #Scenario
[TestScenario]: #Scenario
[Suite]: #Suite
[TestSuite]: #Suite
[Module]: #Module
[TestModule]: #Module
[Feature]: #Feature
[TestFeature]: #Feature
[Outline]: #Outline
[TestOutline]: #Outline
[Iteration]: #Iteration
[RetryIteration]: #RetryIteration
[Background]: #Background
[TestBackground]: #Background
[with]: https://docs.python.org/3/reference/compound_stmts.html#the-with-statement
[async with]: https://docs.python.org/3/reference/compound_stmts.html#async-with
[Classes]: https://docs.python.org/3/tutorial/classes.html
[Class]: https://docs.python.org/3/tutorial/classes.html
[class]: https://docs.python.org/3/tutorial/classes.html
[class method]: https://docs.python.org/3/tutorial/classes.html#method-objects
[pip3]: https://github.com/pypa/pip
[Python 3]: https://www.python.org/
[asyncio]: https://docs.python.org/3/library/asyncio.html
[Ubuntu]: https://ubuntu.com/
[ClickHouse]: https://clickhouse.tech/
[Grafana]: https://grafana.com/
[Python]: https://www.python.org/
[LZMA]: https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm
[JSON]: https://en.wikipedia.org/wiki/JSON
[Markdown]: https://en.wikipedia.org/wiki/Markdown
[unix-like file path pattern]: https://en.wikipedia.org/wiki/Glob_(programming)
[HTML]: https://en.wikipedia.org/wiki/HTML
[Framework]: https://testflows.com
[framework]: https://testflows.com
[Test Definition Class]: #Defining-Tests
[context manager]: https://docs.python.org/3/reference/datamodel.html#context-managers
[Top Level Test]: #Top-Level-Test
[callable]: https://docs.python.org/3/library/functions.html#callable
[Skipped]: #Skipped
[Failed]: #Failed
[XFailed]: #XFailed
[XErrored]: #XErrored
[Okayed]: #Okayed
[XOkayed]: #XOkayed
[Optional `when` Condition]: #Optional-when-Condition
[Repeats]: #Repeats
[Repeat]: #Repeat
[Repeating Tests]: #Repeating-Tests
[Retrying Tests]: #Retrying-Tests
[Retries]: #Retries
[Retry]: #Retry

[And class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2046
[Args class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L615
[Argument class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L181
[ArgumentParser class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L664
[ArgumentParser.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[AsyncPool class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/asyncio.py#L102
[AsyncPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[AsyncPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/asyncio.py#L198
[AsyncPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/asyncio.py#L137
[Attribute class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L196
[Attributes class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L625
[Attributes.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L491
[Background class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2030
[But class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2049
[By class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2052
[Check class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1992
[Context class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L120
[Context.cleanup() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L132
[Critical class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1997
[Description class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L673
[Description.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Error class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L120
[Error.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[Error.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L123
[Example class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1963
[Examples class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L676
[Examples.default_row_format() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/baseobject.py#L120
[Examples.from_table() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/baseobject.py#L147
[Executor class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L658
[Executor.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Fail class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L106
[Fail.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[Fail.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L108
[Feature class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1982
[Finally class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2055
[Flags class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/flags.py#L83
[Flags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/flags.py#L156
[Given class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2037
[Major class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2002
[Metric class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L240
[Minor class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2007
[Module class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1920
[Name class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L670
[Name.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Node class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L148
[Null class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L132
[Null.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[Null.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L135
[NullStep class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2058
[OK class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L97
[OK.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[OK.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L99
[Outline class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1936
[Parallel class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L652
[Parallel.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Pool class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L49
[Pool.map() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[Pool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L132
[Pool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L75
[Repeat class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L583
[Repeat.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L491
[Repetition class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L589
[Repetition.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L606
[Requirement class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L211
[Requirements class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L631
[Requirements.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L491
[Scenario class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1987
[Secret class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L336
[Secret.clear() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L360
[Setup class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L503
[Setup.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Skip class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L117
[Skip.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[Skip.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L77
[Specification class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L287
[Specifications class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L637
[Specifications.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L491
[Step class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1971
[Suite class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1928
[Table class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/baseobject.py#L81
[Table.default_row_format() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/baseobject.py#L120
[Table.from_table() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/baseobject.py#L147
[Tag class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L170
[Tags class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L643
[Tags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L491
[Test class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1944
[TestBackground class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2297
[TestBackground.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2030
[TestCase class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2270
[TestCase.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1944
[TestCheck class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2276
[TestCheck.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1992
[TestFeature class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2291
[TestFeature.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1982
[TestModule class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2294
[TestModule.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1920
[TestOutline class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2241
[TestOutline.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1936
[TestScenario class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2273
[TestScenario.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1987
[TestStep class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2216
[TestStep.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1971
[TestSuite class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2288
[TestSuite.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L1928
[The class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/filters.py#L20
[The.at() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/filters.py#L32
[The.match() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/filters.py#L41
[The.set() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/filters.py#L38
[TheTags class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/filters.py#L45
[Then class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2043
[ThreadPool class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L49
[ThreadPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[ThreadPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L132
[ThreadPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/executor/thread.py#L75
[Ticket class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L271
[Uid class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L649
[Uid.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[Value class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L256
[When class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2040
[XError class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L129
[XError.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[XError.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L77
[XFail class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L114
[XFail.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[XFail.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L77
[XFails class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L506
[XFails.add() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L522
[XFails.items() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L519
[XFails.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[XFlags class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L557
[XFlags.add() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L573
[XFlags.items() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L570
[XFlags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[XNull class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L141
[XNull.Type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L37
[XNull.xout() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L77
[XSkips class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L532
[XSkips.add() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L548
[XSkips.items() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L545
[XSkips.keys() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/objects.py#L469
[append_path() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L73
[args class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L102
[attribute() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L105
[current() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/__init__.py#L91
[current_dir() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L29
[current_module() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L36
[debug() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L168
[err() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L232
[exception() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L183
[fail() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L213
[getsattr() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L358
[has class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L87
[has.attribute class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L115
[has.attribute.BaseFilter class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L118
[has.attribute.BaseFilter.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.BaseFilter.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.BaseFilter.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.BaseFilter.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.BaseFilter.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.attribute.group class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L141
[has.attribute.group.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.group.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.group.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.group.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.group.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.attribute.name class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L99
[has.attribute.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.name.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.attribute.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L136
[has.attribute.type.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.type.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.type.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.type.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.type.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.attribute.uid class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L126
[has.attribute.uid.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.uid.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.uid.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.uid.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.uid.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.attribute.value class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L131
[has.attribute.value.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.attribute.value.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.attribute.value.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.attribute.value.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.attribute.value.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.flag class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L106
[has.name class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L99
[has.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.name.getattr() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L102
[has.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L146
[has.requirement.BaseFilter class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L118
[has.requirement.BaseFilter.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.BaseFilter.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.BaseFilter.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.BaseFilter.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.BaseFilter.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.group class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L141
[has.requirement.group.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.group.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.group.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.group.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.group.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.name class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L99
[has.requirement.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.name.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.priority class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L168
[has.requirement.priority.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.priority.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.priority.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.priority.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.priority.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.type class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L136
[has.requirement.type.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.type.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.type.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.type.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.type.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.uid class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L126
[has.requirement.uid.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.uid.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.uid.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.uid.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.uid.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.requirement.version class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L163
[has.requirement.version.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.requirement.version.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.requirement.version.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L54
[has.requirement.version.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.requirement.version.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[has.tag class]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L92
[has.tag.containing() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L70
[has.tag.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L64
[has.tag.getattr() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L95
[has.tag.matching() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L76
[has.tag.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/has.py#L58
[input() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L275
[join() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/__init__.py#L105
[load() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L48
[load_module() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L43
[loads() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2315
[main() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L93
[message() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L178
[metric() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L132
[note() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L163
[null() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L238
[ok() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L207
[ordered() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/test.py#L2306
[pause() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L268
[previous() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/__init__.py#L98
[private_key() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L154
[requirement() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L114
[result() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L188
[skip() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L226
[tag() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L125
[ticket() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L139
[top() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/parallel/__init__.py#L84
[trace() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L173
[value() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L146
[xerr() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L256
[xfail() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L250
[xnull() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L262
[xok() function]: https://github.com/testflows/TestFlows-Core/blob/885496ab88c56335240c5a8fd826a5b03e92a00b/testflows/_core/funcs.py#L244
