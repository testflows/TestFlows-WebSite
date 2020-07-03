---
layout: handbook
p: /handbook
title: Preface
heading: A Practical Guide To Testing with TestFlows
icon: fas fa-book pt-5 pb-5
---

# TestFlows in 15 Minutes

## TestFlows in One Paragraph

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