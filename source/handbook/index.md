---
layout: handbook
p: /handbook
title: Handbook
heading: Your handbook for using the framework
icon: fas fa-book pt-5 pb-5
---

# What is it?

{% testflows %} is an open-source software testing framework that can be used for functional,
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

# Supported Environment

* [Ubuntu] 20.04
* [Python 3] >= 3.8

> However, known to run on other systems such as MacOS.

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

> You are encouraged to use the specialized keyword classes to greatly improve readibiliy of
> your tests and test procedures.

Given the variety of test definition classes above, fundamentally, 
there only four core [Types] of tests in {% testflows %} and two special types
giving us six [Types] in total. The core [Types] are

  * [Module]
  * [Suite]
  * [Test]
  * [Outline] (special)
  * [Iteration] (special)
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
* [Step]
  * [Given]
  * [When]
  * [Then]
  * [But]
  * [By]
  * [Finally]
  * [Background]

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

**All arguments to tests must be passed using keyword arguments.**

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

> Use the short form only when you don't need to pass any arguments to the test.

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

> Note that for a literal match, you must wrap the meta-characters in brackets
> where `[?]` matches the character `?`.

#### --only

The `--only` option can be used to filter the test flow so that only the specified tests
are executed.

> Note that mandatory tests will still be run.

> Note that most of the time the [pattern] should end with `/*` so that
> any steps or sub-tests are executed inside the selected test.

For example,

```bash
$ python3 test.py --only "/my test/*"
```

#### --skip

The `--skip` option can be used to filter the test flow so that the specified tests
are skipped.

> Note that mandatory tests will still be run.

#### --start

The `--start` option can be used to filter the test flow so that the test flow starts at
the specified test.

> Note that mandatory tests will still be run.

#### --end

The `--end` option can be used to filter the test flow so that the test flow ends at
the specified tests.

> Note that mandatory tests will still be run.

#### --pause-before

The `--pause-before` option can be used to specify the tests before which the test flow
will be paused.

#### --pause-after

The `--pause-after` option can be used to specify the tests after which the test flow
will be paused.

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

A requirements coverage report can be generated from a test log using `tfs report coverage` command. The report is created in [Markdown]
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
* xfails
* only
* skip
* start
* end
* only_tags
* skip_tags
* args

> Most parameter names match the names of the attributes of the test which they set.
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

> For all test definition classes the first parameter is always the [name].

For example,

```python
with Test("My test") as test:
    note(test.name)
```

## Name

A [Name] decorator can be used to set the [name] of any test that is defined using a decorated function.

> The name of test defined using a decorated function
> is set to the name of the function if the [Name] decorator is not used.

For example,

```python
@TestScenario
@Name("The name of the scenario")
def scenario(self):
    note(self.name)
```

or if the [Name] decorator is not used

> Note that any underscores will be replaced with spaces in the name of the test.

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
The values of the command line arguments can be accessed using the `args` attribute of the test.

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
    note(module.args["arg0"].value)
    note(module.args["arg1"].value)
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

> `Requirement` class instances must be always called with the version number the test is expected to verify.
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

A [Requirements] decorator can be used to set `requirements` attribute of any test that is defined used a decorated function.
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

> Usually examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
with Test("My test", examples=Examples("col0 col1", [("col0_row0 col1_row0"), ("col0_row1", "col1_row1")]) as test:
    for example in test.examples:
        note(str(example))
```

## Examples

An [Examples] decorator can be used to set `examples` attribute of any test that is defined used a decorated function
or used to as an argument of the `examples` parameter for the test.
The [Examples] class defines a table of examples and should be passed a `header` and a `list` for the `rows`.

> Usually examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
@TestScenario
@Examples("col0 col1", rows=[
    ("col0_row0", "col1_row0"),
    ("col0_row1", "col1_row1")
])
def scenario(self):
    for example in test.examples:
        note(str(example))
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

> Note that here the word `test` is used to define a [Case](#Case-is) to match the most common meaning of the word `test`.
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

> Any test parameters that are specified for the example will override any common parameter values.

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

> Note that parameters set for a specific example override any common values.

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

An [Iteration] is not meant to be used explicitly and in most cases is only used internally to implement
test repetitions.

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
that can't be skipped. It is defined using [Given] test definition class or using [TestStep]
with [Given] passed as the [Sub-Type].

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

> It does not make sense to use [TestStep] decorator to define it so always define it inline.

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

> A `TypeError` exception will be raised if the [And] step is defined where it has no sibling. For example,
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
>
> A `TypeError` exception will also be raised if the [Type] of the sibling does not match the [Type] of the [And] step.
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
that can't be skipped. It can be defined using [Finally] test definition class
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

# Concepts

The framework was implemented with the following concepts and definitions in mind.
These definitions were used as a guideline to implement test [Tree](#Tree-is) hierarchy.
While the implementation does not strictly enforce these concepts, users are encouraged
to apply these definitions during the design of their tests.

## Everything is a Test

The framework treats everything as a test including setup and teardown.

## Definitions

#### **Test** is

something that produces a result.

#### **Flow** is

a specific order of execution of [Tests](#Test-is).

#### **Tree** is

a rooted tree graph that results from the execution of a [Flow](#Flow-is).

#### **Step** is

is a lowest level [Test](#Test-is).

#### **Case** is

a [Test](#Test-is) that is made up of one or more [Steps](#Step-is).

#### **Suite** is

is a [Test](#Test-is) that is made up of one or more [Cases](#Case-is).

#### **Module** is

a [Test](#Test-is) that is made up of one or more [Suites](#Suite-is).

# Types

The framework divides tests into the following [Types] from highest to the lowest

* [Module]
* [Suite]
* [Test]
* [Outline]
* [Iteration]
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

[pattern]: #pattern
[--only]: #–only
[--skip]: #–skip
[--start]: #–start
[--end]: #–end
[--pause-before]: #–pause-before
[--pause-after]: #–pause-after
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
[flags]: #flags
[Flags]: #Flags
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
