---
layout: handbook
p: /handbook
title: Preface
heading: A Practical Guide To Testing with TestFlows
icon: fas fa-book pt-5 pb-5
---

# TestFlows in 15 Minutes

## What is TestFlows?

[TestFlows] is an open-source software testing framework that can be used for functional,
integration, acceptance and unit testing across various teams. It is designed to provide
complete control of how tests are written and executed by allowing to write tests and
define test [flow] explicitely as [Python] code. It uses [everything is a test] approach
with the focus on giving test authors flexibility in writing and running their tests.
It designed to meet the needs of small QA groups at software startup companies
while providing the tools to meet the formalities of the large enterprise QA groups
producing professional test process documentation that includes detailed test and
software requirements specifications as well as requirements coverage, official test
and metrics reports. It is designed for large scale test analytics processing using
[ClickHouse] and [Grafana] and built on top of a messaging protocol to allow
writing advanced parallel tests that require test-to-test communication
and could be executed in a hive mode on multi-node clusters.

## Supported Environment

* [Ubuntu] 18.04
* [Python 3] >= 3.6

> However, known to run on other systems such as MacOS.

## Installation

You can install [TestFlows] using [pip3]

```bash
$ pip3 install testflows
```

or from sources

```bash
$ git clone https://github.com/testflows/TestFlows.git
$ cd TestFlows
$ ./build ; ./install
```

## Hello World

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

## Defining Tests

You can can define tests inline using classical [Step], [Test], [Suite], and [Module]
test definition classes or using modern [BDD]-inspired variants of these
[Scenario], [Feature], [Module] and the steps
such as [Background], [Given], [When], [Then], [But], [By], [And], and [Finally].

> You are encouraged to use the [BDD]-inspired classes to greatly improve readibiliy of
> your tests and test procedures.

### Inline

Inline tests can be defined anywhere in your test code using test definition classes
using the [with] statement.

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

### Decorated

For reusability you can also define tests using
[TestStep], [TestCase], [TestSuite], [TestModule],
[TestScenario], [TestFeature], [TestOutline],
and [TestBackground] function decorators.

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

### Calling Decorated Tests

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

## Running Tests

Top level tests can be run using either `python3` command or directly if they are made executable.
For example with a top level test defined as

```python
from testflows.core import Test

with Test("My test"):
    pass
```

you can run it with `python3` command as follows

```bash
python3 test.py
```

or if the top level test is executable and defined as

```python3
#!/usr/bin/python3
from testflows.core import Test

with Test("My test"):
    pass
```

and is made executable with

```bash
chmod +x test.py
```

then it can be executed directly as

```bash
./test.py
```

### Options

Top level test options can be obtained by passing `-h` or `--help` option.

```bash
python3 test.py --help
```

```bash
python3 test.py --log ./test.log
```

## Output

Test output can be controlled with `-o` or `--output` option which specifies the output format to use
to print to `stdout`. By default, a detailed `nice` output is used. See `--help` for other formats.

```bash
python3 test.py --output short
```

## Logs

[TestFlows] produces [LZMA] compressed logs that contains [JSON] encoded messages. For example,

```json
{"message_keyword":"TEST","message_hash":"ccd1ad1f","message_object":1,"message_num":2,"message_stream":null,"message_level":1,"message_time":1593887847.045375,"message_rtime":0.001051,"test_type":"Test","test_subtype":null,"test_id":"/68b96288-be25-11ea-8e14-2477034de0ec","test_name":"/My test","test_flags":0,"test_cflags":0,"test_level":1,"test_uid":null,"test_description":null}
```

Each message is a [JSON] object. Object fields depend on the type of the message that is specified by the `message_keyword`.

Logs can be decompressed using either standard `xzcat` utility

```bash
xzcat test.log
```

or `tfs transform decompress` command

```bash
cat test.log | tfs transform decompress
```

### Saving Log

Test log can be saved into a file by specifying `-l` or `--log` option when running the test. For example,

```bash
python3 test.py --log test.log
```

### Transformations

Test logs can be transformed using `tfs transform` command. See `tfs transform --help` for a detailed list available transformations.

#### nice

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

#### short

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

#### slick

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
#### dots

The `tfs transform dots` command can be used to transform test log into a `dots` output format which outputs dots
for each executed test.

For example,

```bash
$ cat test.log | tfs transform dots
.........................
```

#### raw

The `tfs transform raw` command can be used to transform a test log into a `raw` output format which contains raw [JSON]
messages.

For example,

```bash
$ cat test.log | tfs transform raw
{"message_keyword":"PROTOCOL","message_hash":"489eeba5","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1593904821.784232,"message_rtime":0.001027,"test_type":"Module","test_subtype":null,"test_id":"/ee772b86-be4c-11ea-8e14-2477034de0ec","test_name":"/filters","test_flags":0,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
...
```

#### compact

The `tfs transform compact` command can be used to transform a test log into a `compact` format which only contains
raw [JSON] test definition and result messages while omiting all messages for the steps.
It is used to create compact test logs used for comparison reports.

#### compress

The `tfs transform compress` command is used to compress a test log with [LZMA] compression algorithm.

#### decompress

The `tfs transform decompress` command is used to decompress a test log compressed with [LZMA] compression algorithm.

## Reports

Test logs can be used to create reports using `tfs report` command. See `tfs report --help` for a list of available reports.

### official

An official test report can generated from a test log using `tfs report official` command. The report is created in [Markdown]
and can be converted to [HTML] using `tfs document convert` command. For example,

```bash
cat test.log | tfs report official | tfs document convert > report.html
```

See `tfs report official --help` for details.

### coverage

A requirements coverage report can be generated from a test log using `tfs report coverage` command. The report is created in [Markdown]
and can be converted to [HTML] using `tfs document convert` command. For example,

```bash
cat test.log | tfs report coverage requirements.py | tfs document convert > coverage.html
```

See `tfs report coverage --help` for details.

### compare

A comparison report can be generated using one of the `tfs report compare` commands.

#### results

A results comparison report can be generated using `tfs report compare results` command. See `tfs report compare results --help` for details.

#### metrics

A metrics comparison report can be generated using `tfs report compare metrics` command. See `tfs report compare metrics --help` for details.

### specification

A test specification for the test run can be generated using `tfs report specification` command. See `tfs report specification --help` for details.

## Command Line Arguments

You can add command line arguments to the top level test either by setting [argparser] parameter of the inline test
or using [ArgumentParser] decorator if top test is defined as a decorated function.

### argparser

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

### ArgumentParser

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
# python3 ./test.py
...
test arguments:
  --arg0                                          argument 0
  --arg1                                          argument 1

```

## Tagging Tests

You can add `tags` to any test either by setting [tags] parameter of the inline test
or using [Tags] decorator if the test is defined as a decorated function. The values of the tags can be accessed
using the `tags` attribute of the test.

### tags

The [tags] parameter of the test can be use used to set [tags] of any inline test. The [tags] parameter
can be passed either a `list`, `tuple` or a `set` of tag values. For example,

```python
with Test("My test", tags=("tagA", "tagB")) as test:
    note(test.tags)
```
### Tags

A [Tags] decorator can be used to set [tags] of any test that is defined used a decorated function. For example,

```python
@TestScenario
@Tags("tagA", "tagB")
def scenario(self):
    note(self.tags)
```

## Test Attributes

You can add `attributes` to any test either by setting [attributes] parameter of the inline test
or using [Attributes] decorator if the test is defined as a decorated function. The values of the attributes can be accessed
using the `attributes` attribute of the test.

### attributes

The [attributes] parameter of the test can be used to set [attributes] of any inline test. The [attributes] parameter
can be passed either a `list` of `(name, value)` tuples or `Attribute` class instances. For example,

```python
with Test("My test", attributes=[("attr0", "value"), Attribute("attr1", "value")] as test:
    note(test.attributes)
```

### Attributes

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

## Test Requirements

You can add `requirements` to any test either by setting [requirements] parameter of the inline test
or using [Requirements] decorator if the test is defined as a decorated function. The values of the requirements can be accessed
using the `requirements` attribute of the test.

> `Requirement` class instances must be always called with the version number the test is expected to verify.
> `RequirementError` exception will be raised if version does not match the version of the instance.

### requirements

The [requirements] parameter of the test can be used to set `requirements` of any inline test. The [requirements] parameter
must be passed a `list` of called `Requirement` instances.

For example,

```python

RQ1 = Requirement("RQ1", version="1.0")

with Test("My test", requirements=[RQ1("1.0")] as test:
    note(test.requirements)
```

### Requirements

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

## [BDD]-inspired keywords

[TestFlows] encourages the usage of [BDD]-inspired keywords as they can provide the much needed context for your steps
when writing your test scenarios.

[BDD] keywords map to core [Step], [Test], [Suite], and [Module] test definition classes as follows:

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

## Test Definition Classes

### Module

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

### Suite

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

### Feature

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

### Test

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

### Scenario

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

### Outline

An [Outline] can be defined using [Outline] test definition class or [TestOutline] decorator.
An [Outline] has its own test [Type] but can be made specific when defined using [TestOutline]
decorator by passing it a specific [Type] or a [Sub-Type] such as [Scenario] or [Suite] etc.

However, because [Outline]s are meant to be called from other tests or used with [Examples]
it is best to define an [Outline] using [TestOutline] decorator as follows.

```python
@TestOutline(Scenario):
@Examples("greeting name", [
    ("Hello", "John"),
    ("Goodbye", "Eric")
])
def outline(self, greeting, name):
    note(f"{greeting} {name}!")
```

### Iteration

An [Iteration] is not meant to be used explicitely and in most cases is only used internally to implement
test repetitions.

### Step

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

### Given

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

### Background

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

### When

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

### And

An [And](#And) step is used to define a step of the same [Sub-Type] as the step right above it.
It is defined using [And] test definition class.

> It does not make sense to use [TestStep] decorator to define it so always define it inline.

```python
with When("I do some action"):
    pass

with And("I do another action"):
    pass
```

### By

A [By](#By) step is usually used to define a sub-step using [By] test definition class.

```python
with When("I do something"):
    with By("doing some action"):
        pass
```

### Then

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

### But

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

### Finally

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

[TestFlows] was implemented with the following concepts and definitions in mind.
These definitions were used as a guideline to implement test [Tree](#Tree-is) hierarchy.
While the implementation does not strictly enforce these concepts, users are encouraged
to apply these definitions during the design of their tests.

## Everything is a Test

[TestFlows] treats everything as a test including setup and teardown.

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

[TestFlows] devides tests into the following [Types] from highest to the lowest

* **Module**
* **Suite**
* **Test**
* **Outline**
* **Iteration**
* **Step**

Children of each [Type] usually must be of the same [Type] or lower with the only notable exception
being an [Iteration] that is used to implement test repetitions.

# Sub-Types

[TestFlows] uses the following [Sub-Types] in order to provide more flexibility and implement [BDD]-inspired keywords

* **Feature**
* **Scenario**
* **Example**
* **Background**
* **Given**
* **When**
* **Then**
* **And**
* **But**
* **By**
* **Finally**

[tags]: #tags
[#Tags]: #Tags
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
[Sub-Type]: #Sub-Types
[Sub-Types]: #Sub-Types
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
[TestFlows]: https://github.com/testflows/testflows
[pip3]: https://github.com/pypa/pip
[Python 3]: https://www.python.org/
[Ubuntu]: https://ubuntu.com/
[BDD]: https://en.wikipedia.org/wiki/Behavior-driven_development
[ClickHouse]: https://clickhouse.tech/
[Grafana]: https://grafana.com/
[Python]: https://www.python.org/
[LZMA]: https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm
[JSON]: https://en.wikipedia.org/wiki/JSON
[Markdown]: https://en.wikipedia.org/wiki/Markdown