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
It's designed to meet the needs of small QA groups at software startup companies
while providing the tools to meet the formalities of the large enterprise QA groups
producing professional test process documentation that includes detailed test and
software requirements specifications as well as requirements coverage, official test
and metrics reports. Designed for large scale test analytics processing using
[ClickHouse] and [Grafana] and built on top of a messaging protocol to allow
writing advanced parallel tests that require test-to-test communication
and could be executed in a hive mode on multi-node clusters.

# Differentiating Features

**{% testflows %}** has the following differentiating features that makes
it stand out from a plenty of other open and closed source test frameworks.

**Use what you need design**

**{% testflows %}** has many advanced features but it allows you to use only
the pieces that you need. For example, if you don't want to use requirements
you don't have to or if you don't want to break your tests into steps or
using behavior driven step keywords that is perfectly fine. 
At the heart, **{% testflows %}** is just a collection of Python modules so you are always
in control and you are not forced to use anything that you don't need.

**Supports requirements oriented quality assurance process**

An enterprise quality assurance process must always revolve around ***requirements***.
However, requirements are most often ignored in software development groups even at
large companies. **{% testflows %}** is designed to break that trend
and allows to write and work with requirements just like you work with code.
However, if you are not ready to use requirements then you don't have to.

Whether you realize it or not the only true purpose of writing any test is
_to verify one or more requirements_ and it does not really matter if you have
clearly identified these requirements or not. _Tests verify requirements_ and
each requirement must be verified by either fully automated, semi-automated or
manual test. If you don't have any tests to verify some requirement
then you can't be sure that requirement is met or that the next version
of your software does not break it.

With **{% testflows %}** you don't have to wait for your company's culture related
to handling and managing requirements to change. You are able
to write and manage requirements yourself just like code. Requirements are simply
written in [Markdown] document where each requirement has a unique identifier and version.
These documents are the source of the requirements that you can convert to Python requirement objects 
which you can easily link with your tests. **{% testflows %}** allows
one-to-one, one-to-many, many-to-one, or many-to-many requirement to test
relationships to match real-world complexities of requirement verification.

**Allows to write test programs not just tests**

**{% testflows %}** allows you to write Python _test programs_ not just tests. A _test program_
can execute any number of tests. This provides the unsurpassed flexibility to match any project needs.
Tests are not decoupled from test flow where the flow defines a precise order of
how tests are executed. However, you can write many kind of test runners
using the framework if you need them. For example, you can write _test programs_
that read tests cases from databases, API endpoints or file systems and trigger
your test cases based on any condition. By writing a _test program_ you are in total control
of how you want to structure and approach testing of a given project. 

Through its flexibility, **{% testflows %}** helps to avoid test tools fragmentation
where each project in a company sooner or later starts to use their own test framework
and nobody knows how to run tests written by other groups and reporting accross
groups becomes inconsistent and difficult to follow.

**Allows to write self-documenting tests with explicitly defined test procedures**

**{% testflows %}** provides tools for test authors to break tests into test [Step]s and
use behavior driven step keywords such as [Given], [When], [Then] and others to make
tests and test procedures pleasantly readable. Breaking tests into steps brings the advantage
of test code becoming self-documenting, provides an easy way to auto-generate
formal documentation such as test specification without doing any extra work,
produces detailed test logs and test fail debugging.  

Test steps can also be made reusable allowing test authors to create reusable 
steps modules that greatly simplify writing new test scenarios. Just
like you write regular programs by using function calls you can
modularize tests by using reusable test steps. Using reusable steps
produces clean test code and greatly improves readability and maintainability
of tests.

**Allows to write asynchronous tests**

Writing asynchronous tests is as easy as writing regular tests. 
**{% testflows %}** even allows you to run asynchronous and synchronous test code
in the same test program. 

**Allows to auto-generate test specifications**

If your test process or your manager requires you to produce formal test
specifications that must describe procedure of each test then you can easily
auto-generate these documents using **{% testflows %}**.

**Supports writing semi-automated and manual tests**

Testing real-world applications usually is not done only by fully automated test scenarios.
Most often verification requires a mix of automated, semi-automated and manual tests.

**{% testflows %}** allows to unify your testing and provides uniform test reporting
no matter what type of tests you need for you project by natively supporting
authoring of automated, semi-automated and manual tests. 

**Supports authoring parallel tests and executing tests in parallel**

**{% testflows %}** natively supports authoring of parallel tests and
executing tests in parallel with fine-grain control of what and where runs in parallel.
Asynchronous tests are also supported and allow to run thousands of concurrent
tests at the same time. Mixing parallel and asynchronous tests is also supported.

**Uses everything is a test approach**

It uses everything is a test approach that allows unified treatment
of any code that is executed during testing. There are no second class test code.
If test fails in setup or teardown or during execution of one of its actions
the fail is treated in exactly same way. This avoids mixing analysis of why the test failed
with test execution and results in clean and uniform approach to testing.

**Uses message based protocol**

It is built on top of a messaging protocol. This brings
many benefits including ability to transform test output and logs into variety of
different formats as well as enables advanced parallel testing.

**Supports test log storage and test data analytics using ClickHouse**

**{% testflows %}** test logs were designed to be easily stored in [ClickHouse].
Given that testing produces huge amounts of data this integration
brings test data analytics right to your fingertips.

**Test data visualization using Grafana**

Standard [Grafana] dashboards are available to visualize your test data
stored in [ClickHouse]. Additional dashboards can be easily created in [Grafana]
to highlight test results that are the most important for your project.

**Avoids unnecessary abstraction layers**

**{% testflows %}** tries to avoid unnecessary abstraction layers such
as when test runners are decoupled from tests or the usage of behavior driven
(BDD) keywords is always tied to Gherkin specifications. These abstractions,
while providing some benefit, in most cases lead to more problems than
solutions when applied to real-world projects.

# Using Handbook

This handbook is a one-page document that you can search using standard
browser search (`Ctrl-F`).

For ease of navigation you can always click any heading to go back to the table of contents. 

> **{% attention %}** Try clicking `Using Handbook` heading and you will see that the page
> will scroll up and the corresponding entry in the table of contents
> will be highlighted in red. This handy feature will make sure you are never lost!

There is also <span><a class="fas fa-chevron-up" style="color: orange" href="#Contents"></a><span>
icon on the bottom right of the page to allow you quickly scroll to the top.

Also, feel free to click on any internal or external references as you can
use your browser's &#8678; back button to return back to where you were. 

>  **{% attention %}** Try clicking [Using Handbook](#Using-Handbook) link and then
> browser's use &#8678; back button to return to the same scroll position in the handbook.

If you find any errors or would like to add documentation for something that is
still not documented then submit a pull request
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

Similarly to how [class method]s take an instance of the object as the first argument, 
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

or we can make the top level test executable and defined as

```python
#!/usr/bin/python3
from testflows.core import Test

with Test("My test"):
    pass
```

and then we can make it executable with

```bash
$ chmod +x test.py
```

allowing us to execute it directly as follows.

```bash
$ ./test.py
```

# Writing Tests

With {% testflows %} you actually write test programs not just tests. This means
that the [Python] source file that contains [Top Level Test] can be run directly if 
it is made executable and has `#!/usr/bin/env python3` 
or using `python3` command.

> {% attention %} Note that {% testflows %} only allows one top level test in your test program. 
> See [Top Level Test].

Writing tests is actually very easy given that you are in full control of your test program.
You can either define inline tests anywhere in your test program
code or define them separately as test decorated functions. 

An inline test is defined using the [with] statement and one of the [Test Definition Classes].
The choice of which test definition class you should use depends only on your preference.
See [Defining Tests](#Defining-Tests).

The example from the [Hello World](#Hello-World) shows an example of how an inline test
can be easily defined.

```python
#!/usr/bin/env python3
from testflows.core import Scenario

with Scenario("Hello World!"):
    pass
```

The same test can be defined using [TestScenario] decorated function.
See [Decorated Tests](#Decorated).

```python
#!/usr/bin/env python3
from testflows.core import TestScenario, Name

@TestScenario
@Name("Hello World!")
def hello_world(self):
    pass

# run `Hello World!` test
hello_world()
```

> {% attention %} Note that if the code inside the test does not raise any exception and does not
> [set test result explicitly](#Setting-Test-Results-Explicitly) it is considered as passing and will have [OK] result.

In the above example, the `Hello World` is the [Top Level Test] and the only test
in the test program. 

> **{% attention %}** Note that instead of just having `pass` you could **add any code you want**. 
 
The `Hello World` test will pass if no exception is raised in the
[with] block otherwise it will have a [Fail] or [Error] result. [Fail] result is set
if code raises [AssertionError] any other exceptions will result in [Error].

Let's add a failing [assert] to `Hello World` test.

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    assert 1 == 0, "1 != 0"
```

The result will be as follows.

```bash
$ python3 hello_world.py 
Nov 03,2021 17:09:17   ⟥  Scenario Hello World!
                 8ms   ⟥    Exception: Traceback (most recent call last):
                                File "hello_world.py", line 4, in <module>
                                  assert 1 == 0, "1 != 0"
                              AssertionError: 1 != 0
                 8ms   ⟥⟤ Fail Hello World!, /Hello World!, AssertionError
                         Traceback (most recent call last):
                           File "hello_world.py", line 4, in <module>
                             assert 1 == 0, "1 != 0"
                         AssertionError: 1 != 0
```

Now raise let's raise some other exception like [RuntimeError] to see [Error] result.

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    raise RuntimeError("boom!")
```

```bash
$ python3 hello_world.py 
Nov 03,2021 17:14:10   ⟥  Scenario Hello World!
                 5ms   ⟥    Exception: Traceback (most recent call last):
                                File "hello_world.py", line 4, in <module>
                                  raise RuntimeError("boom!")
                              RuntimeError: boom!
                 5ms   ⟥⟤ Error Hello World!, /Hello World!, RuntimeError
                         Traceback (most recent call last):
                           File "hello_world.py", line 4, in <module>
                             raise RuntimeError("boom!")
                         RuntimeError: boom!
```

## Flexibility In Writing Tests

{% testflows %} provides unmatched flexibility in how you can author your tests and
this is what makes it adaptable to your testing projects at hand.

Let's see this using an example of how you could verify functionality
of a simple `add(a, b)` function.

> **{% attention %}** Note that this is just a toy example used for demonstration purposes only.

```python
from testflows.core import *

def add(a, b):
    return a + b

with Feature("check `add(a, b)` function"):
    with Scenario("check 2 + 2 == 4"):
        assert add(2,2) == 4
    with Scenario("check -5 + 100 == -95"):
        assert add(-5,100) == 95
    with Scenario("check -5 + -5 == -10"):
        assert add(-5,-5) == -10   
```

Now you can put the code above anywhere you want. Let's move it into a function.
For example,

```python
from testflows.core import *

def add(a, b):
    return a + b

def regression():
    with Feature("check `add(a, b)` function"):
        with Scenario("check 2 + 2 == 4"):
            assert add(2,2) == 4
        with Scenario("check -5 + 100 == -95"):
            assert add(-5,100) == 95
        with Scenario("check -5 + -5 == -10"):
            assert add(-5,-5) == -10   

if main(): # short for `if __name__ == "__main__":` which is ugly
    regression()
```

We can also decide that we don't want to use [Feature] and [Scenario] in this case
but you'd like to use [Scenario] that has multiple [Example]s with test steps
such as [When] and [Then].

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

def regression():
    with Scenario("check `add(a, b)` function"):
        with Example("check 2 + 2 == 4"):
            with When("I call add function with 2,2"):
                r = add(2, 2)
            with Then("I expect the result to be 4"):
                # error() will generate detailed error message if assertion fails
                assert r == 4, error()

        with Example("check -5 + 100 == -95"):
            with When("I call add function with -5,100"):
                r = add(-5, 100)
            with Then("I expect the result to be -95"):
                assert r == 95, error()

        with Example("check -5 + -5 == -10"):
            with When("I call add function with -5,-5"):
                r = add(-5, -5)
            with Then("I expect the result to be -10"):
                assert r == -10, error()

if main():
    regression()
```

The test code seems to be redundant so we could move the [When] and [Then] steps into
a function `check_add(a, b, expected)` that can be called with different parameters.

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

def check_add(a, b, expected):
    """Check that function add(a, b)
    returns expected result for given `a` and `b` values.
    """
    with When(f"I call add function with {a},{b}"):
        r = add(a, b)
    with Then("I expect the result to be -95"):
        assert r == expected, error()

def regression():
    with Scenario("check `add(a, b)` function"):
        with Example("check 2 + 2 == 4"):
            check_add(a=2, b=2, expected=4)

        with Example("check -5 + 100 == 95"):
            check_add(a=-5, b=100, expected=95)

        with Example("check -5 + -5 == -10"):
            check_add(a=-5, b =-5, expected=-10)

if main():
    regression()
```

We could actually define all examples we want to check up-front and generate
[Example] steps on the fly depending on how many examples we want to check.

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

def check_add(a, b, expected):
    """Check that function add(a, b)
    returns expected result for given `a` and `b` values.
    """
    with When(f"I call add function with {a},{b}"):
        r = add(a, b)
    with Then("I expect the result to be -95"):
        assert r == expected, error()

def regression():
    with Scenario("check `add(a, b)` function"):
        examples = [
            (2, 2, 4),
            (-5, 100, 95),
            (-5, -5, -10)
        ] 
        for example in examples:
            a, b, expected = example
            with Example(f"check {a} + {b} == {expected}"):
                check_add(a=a, b=b, expected=expected)

if main():
    regression()
```

We could modify the above code and use [Examples] instead of our custom list of tuples.

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

def check_add(a, b, expected):
    """Check that function add(a, b)
    returns expected result for given `a` and `b` values.
    """
    with When(f"I call add function with {a},{b}"):
        r = add(a, b)
    with Then("I expect the result to be -95"):
        assert r == expected, error()

def regression():
    with Scenario("check `add(a, b)` function", examples=Examples("a b expected", [
            (2, 2, 4),
            (-5, 100, 95),
            (-5, -5, -10)
        ])) as scenario:
        for example in scenario.examples:
            with Example(f"check {example.a} + {example.b} == {example.expected}"):
                # `vars(example)` converts example named tuple to a dictionary
                check_add(**vars(example))

if main():
    regression()
```

Another option is to move to using decorated tests. See [Decorated Tests](#Defining-Tests).

Let's move inline [Scenario] into a decorated [TestScenario] function with [Examples]
and create [Example]s for each example that we have.

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

@TestScenario
@Examples("a b expected", [
    (2, 2, 4),
    (-5, 100, 95),
    (-5, -5, -10)
])
def check_add(self):
    """Check that function add(a, b)
    returns expected result for given `a` and `b` values.
    """
    for example in self.examples:
        a, b, expected = example
        with Example(f"check {a} + {b} == {expected}"):
            with When(f"I call add function with {a},{b}"):
                r = add(a, b)
            with Then("I expect the result to be {expected}"):
                assert r == expected, error()

def regression():
    Scenario("check `add(a, b)` function", run=check_add)

if main():
    regression()
```

We could also get rid of the explicit [for loop] over examples by
using [Outline] with [Examples].

```python
from testflows.core import *
from testflows.asserts import error

def add(a, b):
    return a + b

@TestOutline(Scenario)
@Examples("a b expected", [
    (2, 2, 4),
    (-5, 100, 95),
    (-5, -5, -10)
])
def check_add(self, a, b, expected):
    """Check that function add(a, b)
    returns expected result for given `a` and `b` values.
    """
    with When(f"I call add function with {a},{b}"):
        r = add(a, b)
    with Then("I expect the result to be {expected}"):
        assert r == expected, error()

def regression():
    Scenario("check `add(a, b)` function", run=check_add)

if main():
    regression()
```

The [Outline] with [Examples] turns out to be the exact fit for the problem.
However, there are many cases where you would want to have choice and **{% testflows %}**
provides the flexibility you need to author your tests the way that fits best for you.

## Using Test Steps

When writing tests it is best practice to break the test procedure
into individual test [Step]s. While using **{% testflows %}** you can write
tests without explicitly defining [Step]s it is not recommended.

Breaking tests into steps has the following advantages:

* improves code structure
* results in self documented test code
* greatly improves debugging of test fails
* enables auto generation of test specifications

### Structuring Code

Using test [Step]s helps to structure test code. Any test inherently implements a 
test procedure and the procedure is usually described by a set of steps.
Therefore, it is natural to structure tests in form of a series of individual
[Step]s. In **{% testflows %}** test [Step]s are defined and used just like [Test]s
or [Scenario]s as [Step]s also have results just like [Test]s. 

Test [Step]s can be either be defined inline or using [TestStep] function decorator
with the combination of both being the most common.

For example, the following code clearly shows that by identifying steps such as setup,
action and assertion the structure of test code is improved.

```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Given("I setup something"):
        pass

    with When("I do something"):
        pass
    
    with Then("I expect something"):
        pass

if main():
    my_scenario()
```

In many cases steps themselves can be reused between many different tests. In this
case defining steps as decorated functions helps to make them reusable.

For example,

```python
from testflows.core import *

@TestStep(Given)
def setup_something(self):
    pass

@TestStep(When)
def do_something(self):
    pass

@TestStep(Then)
def expect_something(self):
    pass
```

The [Step]s above just like [Test]s can be called directly (not recommended) as follows:

```python
@TestScenario
def my_scenario(self):
    setup_something()
    do_something()
    expect_something()
```

However, the best practice is to wrap calls to decorated test steps with inline
[Step]s which allows to clearly give each [Step] a proper `name` in the context
of the specific test scenario as well as allows to specify a detailed `description`
when needed.

For example,

```python
@TestScenario
def my_scenario(self):
    with Given("I setup something",
               description="""detailed description if needed"""):
        setup_something()

    with When("I do something",
              description="""detailed description if needed"""):
        do_something()
    
    with Then("I expect something",
              description="""detailed description if needed"""):
        expect_something()
```

> **{% attention %}** Note that because decorated test steps are being called within a [Step] these
> calls are similar to just calling a function which is another advantage of wrapping calls
> with inline steps. This means that return value from the 
> decorated test step can be received just like from a function:
> ```python
@TestStep(When)
def do_something(self):
    return "hello there"

@TestScenario
def my_scenario(self):
    with When("I do something",
              description="""detailed description if needed"""):
        value = do_something() # value will be set to "hello there"
```

### Self Documenting Test Code

Using test [Step]s results in self documented test code. Take another look at this example.

```python
@TestScenario
def my_scenario(self):
    with Given("I setup something",
               description="""detailed description if needed"""):
        setup_something()

    with When("I do something",
              description="""detailed description if needed"""):
        do_something()
    
    with Then("I expect something",
              description="""detailed description if needed"""):
        expect_something()
```

It is clear to see that explicitly defined [Given], [When], and [Then] steps
when given proper `name`s and `description`s makes reading test code
a pleasant experience as test author has a way to clearly communicate
the test procedure to the reader.

The result of using test [Step]s is clear, readable and highly maintainable
test code. Given that each [Step] produces corresponding messages in the test output it forces
test maintainers to ensure [Step] `name`s and `description`s are
maintained accurate over the lifetime of the test.

### Improved Debugging of Test Fails

Using test [Step]s helps with debugging test fails as you can clearly see
at which [Step] of the test procedure the test has failed. Combined with the
clearly identified test procedure it becomes much easier to debug any test fails.

For example,

```python
from testflows.core import *

@TestStep(Given)
def setup_something(self):
    pass

@TestStep(When)
def do_something(self):
    pass

@TestStep(Then)
def expect_something(self):
    pass

@TestScenario
def my_scenario(self):
    with Given("I setup something",
               description="""detailed description if needed"""):
        setup_something()

    with When("I do something",
              description="""detailed description if needed"""):
        do_something()
    
    with Then("I expect something",
              description="""detailed description if needed"""):
        expect_something()

if main():
  my_scenario()
```

Running the test program above results in the following output using the default [`nice`]
format.

```bash
Nov 12,2021 10:56:17   ⟥  Scenario my scenario
Nov 12,2021 10:56:17     ⟥  Given I setup something, flags:MANDATORY
                              detailed description if needed
               305us     ⟥⟤ OK I setup something, /my scenario/I setup something
Nov 12,2021 10:56:17     ⟥  When I do something
                              detailed description if needed
               165us     ⟥⟤ OK I do something, /my scenario/I do something
Nov 12,2021 10:56:17     ⟥  Then I expect something
                              detailed description if needed
               225us     ⟥⟤ OK I expect something, /my scenario/I expect something
                 7ms   ⟥⟤ OK my scenario, /my scenario
```

If we introduce a fail in the [When] step, we can see that it will be easy to see at which 
point in the test procedure the test is failing.

```python
@TestStep(When)
def do_something(self):
    assert False
```

```bash
Nov 12,2021 10:58:02   ⟥  Scenario my scenario
Nov 12,2021 10:58:02     ⟥  Given I setup something, flags:MANDATORY
                              detailed description if needed
               328us     ⟥⟤ OK I setup something, /my scenario/I setup something
Nov 12,2021 10:58:02     ⟥  When I do something
                              detailed description if needed
               689us     ⟥    Exception: Traceback (most recent call last):
                                  File "steps.py", line 30, in <module>
                                    my_scenario()
                                  File "steps.py", line 23, in my_scenario
                                    do_something()
                                  File "steps.py", line 9, in do_something
                                    assert False
                                AssertionError
               824us     ⟥⟤ Fail I do something, /my scenario/I do something, AssertionError
                           Traceback (most recent call last):
                             File "steps.py", line 30, in <module>
                               my_scenario()
                             File "steps.py", line 23, in my_scenario
                               do_something()
                             File "steps.py", line 9, in do_something
                               assert False
                           AssertionError
                 7ms   ⟥⟤ Fail my scenario, /my scenario, AssertionError
                         Traceback (most recent call last):
                           File "steps.py", line 30, in <module>
                             my_scenario()
                           File "steps.py", line 23, in my_scenario
                             do_something()
                           File "steps.py", line 9, in do_something
                             assert False
                         AssertionError
```

> **{% attention %}** Note that the failing test result always `bubbles up` all the way to the 
> [Top Level Test] and therefore it might seem that the output is redundant.
> However, this allows to examine the fail just by looking at the result of the 
> [Top Level Test].

### Auto Generation Of Test Specifications

When tests are broken up into [Step]s generating test specifications is very easy.

For example,

```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Given("I setup something"):
        pass

    with When("I do something"):
        pass
    
    with Then("I expect something"):
        pass

if main():
    my_scenario()
```

when executed with [`short`] output format highlights the test procedure.

```bash
Scenario my scenario
  Given I setup something
  OK
  When I do something
  OK
  Then I expect something
  OK
OK
```

If you save test log using `--log test.log` option, then you can also use `tfs show procedure` command to
extract the procedure of a given test within a test program run.

```bash
$ cat test.log | tfs show procedure "/my scenario"
Scenario my scenario
  Given I setup something
  When I do something
  Then I expect something
```

Full test specification for a given test program run can be obtained
using `tfs report specification` command.

```bash
 cat test.log | tfs report specification | tfs document convert > specification.html
```

# Test Flow Control

The control of the [Flow] of tests allows you to precisely 
define the order of test execution. **{% testflows %}** allows
to write complete test programs and therefore the order of executed tests
is defined in your [Python] test program code explicitly. 

For example, the following test program defines decorated tests
`testA`, `testB`, and `testC` which are executed in the `regression()` module
in the `testA` -> `testB` -> `testC` order.

```python
from testflows.core import *

@TestScenario
def testA(self):
    pass

@TestScenario
def testB(self):
    pass

@TestScenario
def testC(self):
    pass

@TestModule
def regression(self):
    Scenario(run=testA)
    Scenario(run=testB)
    Scenario(run=testC)
```

It is trivial to see that given that the order or test execution ([Flow]) is explicitely
defined in `regression()` we could easily change it from `testA` -> `testB` -> `testC` to
`testC` -> `testA` -> `testB`.

```python
@TestModule
def regression(self):
    Scenario(run=testC)
    Scenario(run=testA)
    Scenario(run=testB)
```

## Conditional Test Execution

Conditional execution can be added to any explictely defined test [Flow] using
standard [Python Flow Control Tools](https://docs.python.org/3.8/tutorial/controlflow.html)
using [if](https://docs.python.org/3.8/tutorial/controlflow.html#if-statements),
[while](https://docs.python.org/3.8/reference/compound_stmts.html#while),
and [for](https://docs.python.org/3.8/tutorial/controlflow.html#for-statements) statements. 

For example,

```python
@TestModule
def regression(self):
    if Scenario(run=testA).result != Fail:
        for i in range(3):
            Scenario(f"testB #{i}", run=testB)
        while True:
            if Scenario(run=testC).result == OK:
                break
```

will execute `testA` and only proceed to run other tests if its result is not [Fail] otherwise
only `testA` will be executed. If result of `testA` is not [Fail] then
we run `testB` 3 times and `testC` gets executed forever until its result is not [OK].

## Creating Automatic Flows

When precise control over test [Flow] is not necessary you
can easily define a list of tests to be executed in any way you might see fit
including using a simple list.

For example,

```python
# list of all tests
tests = [testA, testB, testC]

@TestModule
def regression(self):
    for test in tests:
        test()
```

For such simple cases you can also use [loads() function]. See [Using `loads()`](#Using-loads).

The [loads() function] allows you to create a list of tests of the specified type
from either current or some other module.

For example,

```python
@TestModule
def regression(self):
    for test in loads(current_module(), Scenario):
        test()
```

Here is an example of loading tests from `my_project/tests.py` module,

```python
@TestModule
def regression(self):
    for test in loads("my_project.tests", Scenario):
        test()
```

The list of tests can be randomized or ordered for example using [ordered() function]
or [Python]'s [sorted](https://docs.python.org/3/library/functions.html#sorted) function.

> **{% attention %}** You could also write [Python] code to load your list of tests from any other source
> such as a file system, database, or API endpoint, etc.

# Setting Test Results Explicitly

A result of any test can be set explicitly using the following result functions:

* [fail() function] for [Fail]
* [err() function] for [Error]
* [skip() function] for [Skip]
* [null() function] for [Null]
* [ok() function] for [OK]
* [xfail() function] for [XFail]
* [xerr() function] for [XError]
* [xnull() function] for [XNull]
* [xok() function] for [XOK]

Here are the arguments that each result function can take. All arguments are optional.

* `message` is used to set an optional result message
* `reason` is used to set an optional reason for the result. Usually is only set
  for crossed out results such as [XFail], [XError], [XNull] and [XOK] to indicate
  the reason for the result being crossed out such as a link to an opened issue
* `test` argument is usually not passed as it is set by to the current test by default.
  See [current() function].

```python
ok(message=None, reason=None, test=None)
fail(message=None, reason=None, test=None, type=None)
skip(message=None, reason=None, test=None)
err(message=None, reason=None, test=None)
null(message=None, reason=None, test=None)
xok(message=None, reason=None, test=None)
xfail(message=None, reason=None, test=None)
xerr(message=None, reason=None, test=None)
xnull(message=None, reason=None, test=None)
```

These functions raise an exception that corresponds to appropriate result class and 
therefore unless you explicitly catch the exception the test stops
at the point in which the result function is called.

For example, 

```python
from testflows.core import *

with Scenario("Hello World!"):
    fail("forcing test fail")
    # this line will not be reached
```

You can also raise the result explicitly.

For example,

```python
from testflows.core import *

with Scenario("Hello World!"):
    raise Fail("forcing test fail")
```

## Fails of Specific Types

**{% testflows %}** does not support adding types to the [Fail]s but
the [fail() function] takes an optional `type` argument that takes
one of the [Test Definition Classes] which will be used to create a sub-test
with the name specified by the `message` and failed with the specified
`reason`.

The original use case is to provide a way to seperate
fails of [Check]s into [Critical], [Major] and [Minor] without explicitly
defining [Critical], [Major], or [Minor] sub-tests.

For example,

```python
from testflows.core import *

with Check("Hello World!"):
    fail("some critical check", reason="critical fail", type=Critical)
```

The above code is equivalent to the following.

```python
from testflows.core import *

with Check("Hello World!"):
    with Critical("some critical check"):
        fail("critical fail")
```

# Working With Requirements

Requirements must be at the core of any enterprise QA process. Many proprietary and complex
systems exist for handling requirements. This complexity is usually not necessary
and **{% testflows %}** provides a way to work with requirements just like with code
and leverage the same development tools to enable easy linking of requirements to your tests.

In general when writing requirements you should think how they will be tested.
Requirements are can either be high level or low level. High level
requirements are usually verified by [Feature]s or [Module]s and low level requirements
by individual [Test]s or [Scenario]s.

Writing untestable requirements is not of much use. Keep this in mind during
your software testing process.

> _When writing requirements you should be thinking about tests or test suites that would verify them and
> when writing tests or test suites you should think about which requirements they will verify._

The ideal requirement to test relationship is one-to-one. Where one requirement
is verified by one test. However, in practice the relationship can be
one-to-many, many-to-one, and many-to-many and **{% testflows %}** supports
all of these cases.

In many cases don't be afraid to modify and restructure your requirements once you
start writing tests. Refactoring of requirements during test development is a natural
process that helps better align requirements to tests and vice versa. 

> _Writing requirements is hard but developing enterprise software without requirements
> is even harder._

## Requirements As Code

Working with requirements as code is very convenient but it does not necessary mean
that we need to write requirements as [Python] code.

Requirements form documents such as SRS (Software Requirements Specification)
where in addition to pure requirements you might find additional sections
such as introductions, diagrams, references etc. Therefore, the most
convenient way to define requirements is inside a document. 

**{% testflows %}** allows to write requirements as a [Markdown]
document that serves as the source of all the requirements. The document is the source
and is stored just like code in the source control repository such as [Git](https://git-scm.com/).
This allows the same process to be applied to requirements as to the code.
For example, you can use the same review process and the same tools. You also get full
tracebility of when and who defined the requirement and keep track of any changes
just like for your other source files.

For example, a simple requirements document in [Markdown] can be defined as follows.

> requirements.md
>
> ```markdown
# SRS001 `ls` Unix Command Utility
# Software Requirements Specification

## Introduction

This software requirements specification covers behavior of the standard
Unix `ls` utility.

## Requirements

### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.
```

The above document serves as the source of all the requirements and can be
used to generate corresponding [Requirement class] objects that can be linked with tests
using `tfs requirements generate` command. See [Generating Requirements Objects](#Generating-Requirements-Objects).

Each requirement is defined as a heading that starts with `RQ.` prefix and contains
attributes such as `version`, `priority`, `group`, `type` and `uid` defined
on the following line which must be followed by an empty line.

```markdown
### RQ.SRS001-CU.LS
version: 1.0
```

Only the `version` attribute is always required and the others are optional.
The `version` attribute allows to track material changes to the requirement over the 
lifetime of the product and makes sure the tests get updated when requirement has been
updated to a new version.

Any text found until the next section is considered to be the description of the requirement.

```markdown
### RQ.SRS001-CU.LS
version: 1.0

This is the first paragraph of the requirements description.

This is the second paragraph.
```

Here is an example where multiple requirements are defined.

```markdown
### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.

### RQ.SRS001-CU.LS.ListHiddenEntries
version: 1.0

The [ls](#ls) utility SHALL accept `-a, --all` option that SHALL cause the output
to list entries starting with `.` that SHALL be considered to be hidden.
```

> **{% attention %}** Except for the basic format to define the requirements described above,
> you can structure and organize the document in any way that is the most appropriate for
> your case.

Each requirement must be given a unique name. The most common convention
is to start with the SRS number as a prefix followed by a dot separated
name. The `.` separator serves to implicitly group the requirements.
It is usually best to combine the grouping with the corresponding document sections.

For example, we can create `Options` section where we would add requirements
for the supported options. Then all the requirements in this sections would have
`RQ.SRS001-CU.LS.Options.` prefix.


```markdown
### Options

#### RQ.SRS001-CU.LS.Options.ListHiddenEntries
version: 1.0
```

> **{% attention %}** Names are usually prefered over numbers to facilitate moving of requirements between
> different parts of the document.

## Generating Requirements Objects

[Requirement class] objects can be auto generated from the [Markdown] requirements source files
using `tfs requirements generate` command.

```bash
$ tfs requirements generate -h
usage: tfs requirements generate [-h] [input] [output]

Generate requirements from an SRS document.

positional arguments:
  input       input file, default: stdin
  output      output file, default: stdout
```

For example, given `requirements.md` file having the following content.

> requirements.md
>
> ```markdown
# SRS001 `ls` Unix Command Utility
# Software Requirements Specification

## Introduction

This software requirements specification covers behavior of the standard
Unix `ls` utility.

## Requirements

### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.
```

You can generate `requirements.py` file from it using the following command.

```bash
$ cat srs.md | tfs requirements generate > requirements.py
```

The `requirements.py` will have the following content.

```python
# These requirements were auto generated
# from software requirements specification (SRS)
# document by TestFlows v1.7.211105.1001849.
# Do not edit by hand but re-generate instead
# using 'tfs requirements generate' command.
from testflows.core import Specification
from testflows.core import Requirement

Heading = Specification.Heading

RQ_SRS001_CU_LS = Requirement(
    name='RQ.SRS001-CU.LS',
    version='1.0',
    priority=None,
    group=None,
    type=None,
    uid=None,
    description=(
        'The [ls](#ls) utility SHALL list the contents of a directory.\n'
        ),
    link=None,
    level=2,
    num='2.1')
...
```

Where for each requirement a corresponding [Requirement class] object will be
defined in addition to the [Specification class] object that describes
full requirements specification document.

```python
SRS001_ls_Unix_Command_Utility = Specification(
    name='SRS001 `ls` Unix Command Utility', 
    description=None,
    ...
```

The objects defined in the `requirements.py` can now be imported into test
source files and used to link with tests.

## Linking Requirements

Once you have written your requirements in a [Markdown] document as described in [Requirements As Code](#Requirements-As-Code)
and have generated [Requirement class] objects from the requirements source file using `tfs requirements generate`
command as desribed in [Generating Requirements Objects](#Generating-Requirements-Objects)
you can link the requirements to any of the tests by either setting
[requirements](#requirements) attribute of the inline test or using [Requirements](#Requirements)
decorator for decorated tests.

For example,

```python
from requirements import RQ_SRS001_CU_LS

with Test("My test", requirements=[RQ_SRS001_CU_LS("1.0")] as test:
    note(test.requirements)
```

The `requirements` argument takes a list of requirements so you can link
any number of requirements to a single test.

Instead of passing a list you can also pass [Requirements] object directly as follows,

```python
from requirements import RQ_SRS001_CU_LS

with Test("My test", requirements=Requirements(RQ_SRS001_CU_LS("1.0")) as test:
    note(test.requirements)
```

where [Requirements] can be passed one or more requirements.

> **{% attention %}** Note that when linking requirements to test you should
> **always** call the requirement
> with the version which the test is verifying. If the version does not match
> the actual requirement version `RequirementError` exception will be raised.
> See [Test Requirements](#Test-Requirements).

For decorated tests, [Requirements] class can also act as a decorator.

For example,

```python
from requirements import RQ_SRS001_CU_LS

@TestScenario
@Requirements(
  RQ_SRS001_CU_LS("1.0")
)
def my_test(self):
    note(self.requirements)
```

## Linking Specifications

When generating requirements, in addition to [Requirement class] objects created
for each requirement [Specification class] object is also generated that describes
the whole requirements specification document. This object can be 
linked to higher level tests so that coverage report can be easily calculated
for a specific test program run.

To link [Specification class] object to a test either use 
[specifications] parameter for inline tests or [Specifications] decorator
for decorated tests.

> **{% attention %}** Specifications are usually linked to higher level tests such as
> [Feature], [Suite], or [Module].

For example,

```python
from requirements import SRS001_ls_Unix_Command_Utility

with Module("regression", specifications=[SRS001_ls_Unix_Command_Utility]) as test:
   note(test.specifications)
```

One or more specifications can be linked.

Instead of passing a list you can also pass [Specifications] object directly as follows,

```python
from requirements import SRS001_ls_Unix_Command_Utility

with Module("regression", specifications=Specifications(SRS001_ls_Unix_Command_Utility)) as test:
   note(test.specifications)
```

> **{% attention %}** Note that [Specification class] object call also be
> called with a specific version just like [Requirement class] objects.

If a higher level test is defined using a decorated function then you can use [Specifications]
decorator.

For example,

```python
from requirements import SRS001_ls_Unix_Command_Utility

@TestModule
@Specifications(
  SRS001_ls_Unix_Command_Utility
)
def regression(self):
    note(self.specifications)
```

# Top Level Test

{% testflows %} only allows one top level test to exist in any given test program execution.
Because a [Flow](#Flow-is) of tests can be represented as a rooted [Tree](#Tree-is), a test program
exits on completion of the top level test. Therefore, any code that is defined after the top
level test **will not be executed**.

```python
with Module("module"):
  pass

something_else() # will not be executed
```

## Renaming Top Test

Top level test name can be changed using [--name] command line argument.

```bash
--name name                                     test run name
```

> **{% attention %}** This is not recommended as you can break any test name patterns
> that are not relative. For example, this can affect [xfails], [ffails], etc.

For example,

> `test.py`
> ```python
from testflows.core import *

with Module("regression"):
    with Scenario("my test"):
        pass
```

```bash
$ python3 test.py --name "new top level test name"
 Sep 25,2021 8:55:18   ⟥  Module new top level test name
 Sep 25,2021 8:55:18     ⟥  Scenario my test
               661us     ⟥⟤ OK my test, /new top level test name/my test
                 9ms   ⟥⟤ OK new top level test name, /new top level test name
```

## Adding Tags to Top Test

On the command line, tags can be added to [Top Level Test] using [--tag] option.
One or more tags can be specified.

```bash
 --tag value [value ...]                         test run tags
```

For example,

> `test.py`
>```python
from testflows.core import *

with Module("regression"):
    with Scenario("my test"):
        pass
```

```bash
$ python3 test.py --tag tag1 tag2
 Sep 25,2021 8:56:58   ⟥  Module regression
                            Tags
                              tag1
                              tag2
 Sep 25,2021 8:56:58     ⟥  Scenario my test
               640us     ⟥⟤ OK my test, /regression/my test
                 9ms   ⟥⟤ OK regression, /regression
```

## Adding Attributes to Top Test

Attributes of the [Top Level Test] can be used to associate important
information with your test run. For example, common attributes include
tester name, build number, CI/CD job id, artifacts URL and many others.

> **{% attention %}** These attributes can be used extensively when filtering test runs
> in test results database.

On the command line, attributes can be added to [Top Level Test] using [--attr] option.
One or more attributes can be specified.


```bash
  --attr name=value [name=value ...]              test run attributes
```

For example,

> `test.py`
>```python
from testflows.core import *

with Module("regression"):
    with Scenario("my test"):
        pass
```

```bash
$ python3 top_name.py --attr build=21.10.1 tester="Vitaliy Zakaznikov" job_id=4325432 job_url="https://jobs.server.com/4325432"
 Sep 25,2021 9:04:11   ⟥  Module regression
                            Attributes
                              build
                                21.10.1
                              tester
                                Vitaliy Zakaznikov
                              job_id
                                4325432
                              job_url
                                https://jobs.server.com/4325432
 Sep 25,2021 9:04:11     ⟥  Scenario my test
               781us     ⟥⟤ OK my test, /regression/my test
                10ms   ⟥⟤ OK regression, /regression
```

## Custom Top Test Id

By default [Top Level Test] test id is generated automatically using [UUIDv1]. However,
if needed, you can specify custom id value using [--id] test program option.

> **{% attention %}** Specifying [Top Level Test] id should only be done by advanced
> users as each test run must have a unique id. 

In general, the most common use case when you need to specify custom [--id]
is when you need to know [Top Level Test] id before running your test program.
Therefore, you would generate [UUIDv1] externaly using for example `uuid` utility
 
 ```bash
$ uuid
52da6a26-1e54-11ec-9d7b-cf20ccc24475
```
 
and passing the generated value to your test program.

For example, give the following test program

> `test.py`
> ```python
from testflows.core import *

with Test("my test"):
    pass
```

if it is executed without [--id] you can check top level test id by looking at [`raw`] output
messages and looking at `test_id` field.

```bash
python3 id.py -o raw
{"message_keyword":"PROTOCOL",...,"test_id":"/8a75f8b2-1e52-11ec-8830-cb614fe11752",...}
...
```

Now if you specify [--id] then you will see that `test_id` field of each message
will contain the new id.

```bash
$ python3 id.py -o raw --id 112233445566
{"message_keyword":"PROTOCOL",...,"test_id":"/112233445566",...}
...
```

# Test Program Tree

Executing any **{% testflows %}** test program results in a [Tree]. Below is a
diagram that depicts a simple test program execution [Tree].

&#128270; **Test Program Tree**

<img src="/handbook/assets/flow.png" alt="Test Program Tree" style="width: 100%">

During test program execution, when all tests are executed sequentially,
the [Tree] is traversed in a depth first order. 

The order of execution of tests shown is the diagram above is as follows

>  * /Top Test
>  * /Top Test/Suite A
>  * /Top Test/Suite A/Test A/
>  * /Top Test/Suite A/Test A/Step A
>  * /Top Test/Suite A/Test A/Step B
>  * /Top Test/Suite A/Test B/
>  * /Top Test/Suite A/Test B/Step A
>  * /Top Test/Suite A/Test B/Step B

and this order of execution forms the [Flow] of the test program.
This [Flow] can also be shown graphically as in the diagram below where depth first 
order of execution is highlighted by the magenta colored arrows.

&#128270; **Test Program Tree Traversal** *(sequential)*

<img src="/handbook/assets/flow_traversal.png" alt="Test Program Tree Traversal" style="width: 100%">

When dealing with test names when [Filtering Tests](#Filtering-Tests-By-Name) it is best
to keep the diagram above in mind to help visualize and understand how **{% testflows %}**
works.

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

## Saving Log File

Test log can be saved into a file by specifying `-l` or `--log` option when running the test. For example,

```bash
$ python3 test.py --log test.log
```

## Transforming Logs

Test logs can be transformed using `tfs transform` command. See `tfs transform --help`
for a detailed list available transformations.

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

# Creating Reports

Test logs can be used to create reports using `tfs report` command. See `tfs report --help` for a list of available reports.

## Results Report

A results report can be generated from a test log using `tfs report results` command.
The report can be generated in either [Markdown] format (default) or [JSON] format
by specifying `--format json` option.
The report in [Markdown] can be converted to [HTML] using `tfs document convert` command.

```bash
Generate results report.

positional arguments:
  input                      input log, default: stdin
  output                     output file, default: stdout

optional arguments:
  -h, --help                 show this help message and exit
  -a link, --artifacts link  link to the artifacts
  --format type              output format choices: 'md', 'json', default: md (Markdown)
  --copyright name           add copyright notice
  --confidential             mark as confidential
  --logo path                use logo image (.png)
  --title name               custom title
```

For example,

```bash
$ cat test.log | tfs report results | tfs document convert > report.html
```

## Coverage Report

Requirements coverage report can be generated from a test log using `tfs report coverage` command. The report is created in [Markdown]
and can be converted to [HTML] using `tfs document convert` command. For example,

```bash
Generate requirements coverage report.

positional arguments:
  requirements                requirements source file, default: '-' (from input log)
  input                       input log, default: stdin
  output                      output file, default: stdout

optional arguments:
  -h, --help                  show this help message and exit
  --show status [status ...]  verification status. Choices: 'satisfied', 'unsatisfied', 'untested'
  --input-link attribute      attribute that is used as a link to the input log, default: job.url
  --format type               output format, default: md (Markdown)
  --copyright name            add copyright notice
  --confidential              mark as confidential
  --logo path                 use logo image (.png)
  --title name                custom title
  --only name [name ...]      name of one or more specifications for which to generate coverage
                              report, default: include all specifications. Only a unique part of the
                              name can be specified.
```

For example,

```bash
$ cat test.log | tfs report coverage requirements.py | tfs document convert > coverage.html
```

## Metrics Report

You can generate metrics report using `tfs report metrics` command.

```bash
Generate metrics report.

positional arguments:
  input          input log, default: stdin
  output         output file, default: stdout

optional arguments:
  -h, --help     show this help message and exit
  --format type  output format choices: 'openmetrics', 'csv' default: openmetrics
```

## Comparison Reports

A comparison report can be generated using one of the `tfs report compare` commands.

```bash
Generate comparison report between runs.

optional arguments:
  -h, --help  show this help message and exit

commands:
  command
    results   results report
    metrics   metrics report
```

### Compare Results

A results comparison report can be generated using `tfs report compare results` command.

```bash
Generate results comparison report.

positional arguments:
  output                        output file, default: stdout

optional arguments:
  -h, --help                    show this help message and exit
  --log pattern [pattern ...]   log file pattern
  --log-link attribute          attribute that is used as a link for the log, default: job.url
  --only pattern [pattern ...]  compare only selected tests
  --order-by attribute          attribute that is used to order the logs
  --sort direction              sort direction. Either 'asc' or 'desc', default: asc
  --format type                 output format, default: md (Markdown)
  --copyright name              add copyright notice
  --confidential                mark as confidential
  --logo path                   use logo image (.png)
```

### Compare Metrics

A metrics comparison report can be generated using `tfs report compare metrics` command.

```bash
Generate metrics comparison report.

positional arguments:
  output                        output file, default: stdout

optional arguments:
  -h, --help                    show this help message and exit
  --log pattern [pattern ...]   log file pattern
  --log-link attribute          attribute that is used as a link for the log, default: job.url
  --only pattern [pattern ...]  compare only selected tests
  --order-by attribute          attribute that is used to order the logs
  --sort direction              sort direction. Either 'asc' or 'desc', default: asc
  --format type                 output format, default: md (Markdown)
  --copyright name              add copyright notice
  --confidential                mark as confidential
  --logo path                   use logo image (.png)
  --name name [name ...]        metrics name, default: test-time
```

## Specification Report

A test specification for the test run can be generated using `tfs report specification` command.

```bash
Generate specifiction report.

positional arguments:
  input             input log, default: stdin
  output            output file, default: stdout

optional arguments:
  -h, --help        show this help message and exit
  --copyright name  add copyright notice
  --confidential    mark as confidential
  --logo path       use logo image (.png)
  --title name      custom title
```

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

# Setting Test Flags

You can set the [Test Flags](#Test-Flags) of any test either by setting the [flags] parameter of the inline test
or using the [Flags] decorator if the test is defined as a decorated function.
The flags of the test can be accessed using the `flags` attribute of the test.

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

# Filtering Tests By Name

**{% testflows %}** allows to control which tests to run during any
specific test program run using advanced test filtering [pattern]s.
Test filters can be either specified in the code or controlled using command line
options.

In both cases test filtering is performed by setting `skips`, `onlys`, `skip_tags`
and `only_tags` attributes of a test. These attributes are propagated down
to sub-tests as long as filtering [pattern] has a chance of matching
test name. Therefore, parent test filtering attributes, if specified,
always override the same attributes of any of its sub-tests if the parent test
filter is applicable to the sub-test and could match either the sub-test name
or any of the sub-test children names.

Test are filtered using a [pattern].
The [pattern] is used to match test names and **{% testflows %}** uses 
[unix-like file path pattern]s that support wildcards where

* `/` is path level separator
* `*` matches anything (zero or more characters)
* `?` matches any single character
* `[seq]` matches any character in seq
* `[!seq]` matches any character not in seq
* `:` matches one or more characters only at the current path level

> **{% attention %}** Note that for a literal match, you must wrap the meta-characters in brackets
> where `[?]` matches the character `?`.

It is important to remember that execution of test program results in a [Tree] where
each test is node and test name being a unique path to this node in the [Tree].
The [unix-like file path pattern]s work well because test program
execution [Tree] is similar to the structure of a file system.

Filtering tests is then nothing but selecting which nodes in the tree should be
selected and which shall be skipped. Filtering is performed by matching the [pattern]
to the test name. See [Test Program Tree](#Test-Program-Tree).

Skipping a test then means that the body of the test is skipped along with the sub-tree
that is below the corresponding test node.

When we want to include a test 
it usually means that we also want to execute the test along with all the tests
that form the sub-tree below the coresponding test node and therefore
the [pattern] that indicates which tests should be included most of the time ends with `/*`.

For example, 

> `/Top Test/Suite A/Test A/*` [pattern] will match `/Top Test/Suite A/Test A`
> and all its sub-tests which are `/Top Test/Suite A/Test A/Step A` and
> `/Top Test/Suite A/Test A/Step B` because they also match the specified [pattern] as
> it ends with `/*` where `*` matches any zero or more characters.

Internally **{% testflows %}** converts all [pattern]s into
regular expressions but these expressions become very complex and therefore
not practicle to be specified explicitely.

Let's see how test filtering can be specified either using command line or inside the
test program code.

## [--only] option 

You can specify which tests you want to include in your test run using [--only]
option. This option takes one or more test name [pattern]s that if not matched
will cause the test to be skipped.

```bash
   --only pattern [pattern ...]                    run only selected tests
```

If you pass a relative pattern, any pattern that does not start with `/`, 
then the pattern will be anchored to the top level test.
For example, [pattern] `Suite A/*` for the example below will become
`/Top Test/Suite A/*`.

Let's practice. Given this example test program,

> `test.py`
>```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestSuite
def my_suite(self):
    Scenario("Test A", run=my_scenario)
    Scenario("Test B", run=my_scenario)

with Module("Top Test"):
    Suite("Suite A", run=my_suite)
    Suite("Suite B", run=my_suite)
```

the following command will run only `Suite A` and its sub-tests.

```bash
$ python3 test.py --only "Suite A/*"
```

To select only running `Test A` in `Suite A`.

```bash
$ python3 test.py --only "/Top Test/Suite A/Test A/*"
```

To select running any test at second level that ends with letter `B`.
This will select every test in `Suite B`.

```bash
$ python3 filtering.py --only "/Top Test/:B/*"
```

To run only `Test A` in `Suite A` and `Test B` in `Suite B`.

```bash
$ python3 test.py --only "/Top Test/Suite A/Test A/*" "/Top Test/Suite B/Test B/*"
```

If you forget to specify `/*` at the end your test [pattern] then 
tests that are not mandatory will be skipped.

```bash
$ python3 test.py --only "/Top Test/Suite A/Test A"
```

From the output below you can see that steps inside `Test A` which
are `Step A` and `Step B` are skipped as these tests don't have
[MANDATORY] flag set.

>```bash
Sep 27,2021 14:19:46   ⟥  Module Top Test
Sep 27,2021 14:19:46     ⟥  Suite Suite A
Sep 27,2021 14:19:46       ⟥  Scenario Test A
                 3ms       ⟥⟤ OK Test A, /Top Test/Suite A/Test A
                 6ms     ⟥⟤ OK Suite A, /Top Test/Suite A
                18ms   ⟥⟤ OK Top Test, /Top Test
```

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and 
> [Given] and [Finally] steps always have [MANDATORY] flag set.

If you want to see which tests where skipped you can specify [--show-skipped] option.

```bash
$ python3 test.py --only "/Top Test/Suite A/Test A" --show-skipped
```

## [--skip] option

You can specify which tests you want to skip in your test run using [--skip]
option. This option takes one of more test name [pattern]s that
if match will cause the test be skipped. 

```bash
  --skip pattern [pattern ...]                    skip selected tests
```

Skipping test means that a [SKIP] flag will be added to the test, the body
of the test will not be executed and the result of the test will be set to [Skip].
By default, most output formats do not show [Skip]ped tests and thus you must
use [--show-skipped] option to see them.

Just like for [--only option], if you pass a relative pattern, any pattern that does not start with `/`, 
then the [pattern] will be anchored to the top level test.
For example, the [pattern] `Suite A/*` for the example below will become
`/Top Test/Suite A/*`.

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and 
> [Given] and [Finally] steps always have [MANDATORY] flag set.

Here are a couple of examples that are based on the same example test program
that is used in the [--only option] section above.

> **{% attention %}** Unlike for the [--only option] the [pattern]s for [--skip]
> do not have to end with `/*` as skipping a test automatically
> skips any sub-tests of the test being skipped.

To skip running `Test A` in `Suite A`.

```bash
$ python3 test.py --skip "/Top Test/Suite A/Test A"
```

To skip running any test at second level that ends with letter `B`.

```bash
$ python3 filtering.py --skip "/Top Test/:B"
```

Here is an example of combining [--only] option with [--show-skipped] option
to show [Skip]ped tests.

```bash
$ python3 test.py --skip "/Top Test/Suite A/Test A" --show-skipped
```

```bash
✔ [ Skip ] /Top Test/Suite A/Test A
```

Now let's skip `Test A` in either `Suite A` or `Suite B`.

```bash
$ python3 test.py --skip "/Top Test/:/Test A" --show-skipped
```

```bash
✔ [ Skip ] /Top Test/Suite A/Test A
✔ [ Skip ] /Top Test/Suite B/Test A
```

## [--only] and [--skip]

You can combine selecting and skipping tests by specifying both [--only] and
[--skip] options. See [--only option] and [--skip option] sections above.

When [--only] and [--skip] are specified at the same time the [--only] option
is applied first and selects a list of tests that will be run. If [--skip] option
is present then it can only filter down the selected tests.

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and 
> [Given] and [Finally] steps always have [MANDATORY] flag set.

For example, using example test program found in [--only option] section
we can select to run `Test A` in either `Suite A` or `Suite B` but then
skip `Test A` in `Suite B` using [--skip option] as follows.

```bash
$ python3 test.py --only "/Top Test/:/Test A" --skip "Suite B/Test A"
```

```bash
Passing

✔ [ OK ] /Top Test/Suite A/Test A
✔ [ OK ] /Top Test/Suite A
✔ [ OK ] /Top Test/Suite B
✔ [ OK ] /Top Test
```

As you can see from the output above the `Suite B` gets started but all its tests are skipped
as `Test B` did not match the [pattern] specified to the [--only] 
and `Test A` was skipped by the [--skip].

## Filtering Tests In Code

In your test program you can filter child tests to control what tests are included or skipped 
by setting `only` and `skip` test attributes.

### `only` and `skip` Arguments

When test is defined inline you can explicitly set filtering using `only` and `skip`
arguments. These arguments either take a list of [pattern]s or you can use
[Onlys class] or [Skips class] respectively.

```python
Onlys(pattern, ...)
```

or 

```python
Skips(pattern,...)
```

> **{% attention %}** [Onlys class] or [Skips class] can also act as decorators
> to set `only` and `skip` attributes of decorated tests.
> See [`Onlys` and `Skips` Decorators](#Onlys-and-Skips-Decorators).

```python
with Scenario("my tests", only=[pattern,...], skip=[pattern,...])
    pass
```

or 

```python
with Scenario("my tests", only=Onlys(pattern,...), skip=Skips(pattern,...))
    pass
```

For example,

```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestSuite
def my_suite(self):
    with Scenario("Test A", only=["Step B"]): # run only "Step B"
        my_scenario()

    with Scenario("Test B", skip=Skips("Step B")): # run only "Step A"
        my_scenario()

if main():
    my_suite()
```

### `Onlys` and `Skips` Decorators

You can also specify `only` and `skip` attributes of decorated tests
using [Onlys class] and [Skips class] that can act as decorators to
set `only` and `skip` attributes of a decorated test respectively.

```python
@Onlys(pattern, ...)
```

or 

```python
@Skips(pattern,...)
```

For example,

```python
@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestScenario
@Onlys("Step B") # run only "Step B"
def test_A(self):
    my_scenario()

@TestScenario
@Skips("Step B") # run only "Step A
def test_B(self):
    my_scenario()
```

# Filtering Tests By Tags

In addition to filtering test by name you can also filter them by tags.
When you filter by tags a `type` must be specified to indicate which test [Types]
should have the tag.

> **{% attention %}** Filtering test [Step]s by tags is not supported.

## Tags Filtering `type`

The `type` can be one of the following:
  * `test` will require all tests with [Test Type] to have the tag
    * `scenario` is just an alias for `test`
  * `suite` will require all tests with [Suite Type] to have the tag
    * `feature` is just an alias for `suite`
  * `module` will require all tests with [Module Type] to have the tag
  * `any` will require all test with either [Test Type], [Suite Type] or [Module Type] to have the tag

## `--only-tags` option

If you assign tags to your tests then [--only-tags] option can be used to select
only the tests that match a particular tag. This option takes values
of the form `type:tag1` where [type](#Tags-Filtering-type) is used to specify a test type
of the tests that must have the specified tag.

If you want to select tests that must have more than one tag use `type:tag1,tag2,...` form.

```bash
 --only-tags type:tag,... [type:tag,... ...]     run only tests with selected tags
```

For example, you can select all tests with [Suite Type] that have `tag A` tag
as follows.

```bash
python3 test.py --only-tags suite:"tag A"
```

You can select all tests with [Test Type] that either have `tag A` **OR** `tag B`.

```bash
python3 test.py --only-tags test:"tag A" test:"tag B"
```

You can select all tests with [Test Type] that have both `tag A` **AND** `tag B`.

```bash
python3 test.py --only-tags test:"tag A","tag B"
```

You can select all tests with [Test Type] that must have either `tag A` **OR** (`tag A` **AND** `tag B`).

```bash
python3 test.py --only-tags test:"tag A" test:"tag A","tag B"
```

## `--skip-tags` option

If you assign tags to your tests then you can also use [--skip-tags] option to select
which tests should be skipped based on tests matching a particular tag. 
Similar to [--only-tags] option, it also takes values
of the form `type:tag` where [type](#Tags-Filtering-type) is used to specify a test type
of the tests that must have the specified tags.

If you want to skip tests that must have more than one tag use `type:tag1,tag2,...` form.

```bash
  --skip-tags type:tag,... [type:tag,... ...]     skip tests with selected tags
```

For example, you can skip all tests with [Suite Type] that have `tag A` tag
as follows.

```bash
python3 test.py --skip-tags suite:"tag A"
```

You can skip all tests with [Test Type] that either have `tag A` **OR** `tag B`.

```bash
python3 test.py --skip-tags test:"tag A" test:"tag B"
```

You can skip all tests with [Test Type] that have both `tag A` **AND** `tag B`.

```bash
python3 test.py --skip-tags test:"tag A","tag B"
```

You can skip all tests with [Test Type] that must have either `tag A` **OR** (`tag A` **AND** `tag B`).

```bash
python3 test.py --skip-tags test:"tag A" test:"tag A","tag B"
```

## Filtering By Tags In Code

In your test program you can filter child tests by tags to control what tests are included or skipped 
by setting `only_tags` and `skip_tags` test attributes.

### `only_tags` and `skip_tags` Arguments

When test is defined inline you can explicitly set filtering by tags using `only_tags` and `skip_tags`
arguments. These arguments take [OnlyTags class] or [SkipTags class] object instances respectively
that provide a convenient way to set these filters.

For example,

```python
    OnlyTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

or similarly 

```python
    SkipTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

> **{% attention %}** [OnlyTags class] or [SkipTags class] can also act as decorators
> to set `only_tags` and `skip_tags` attributes of decorated tests.
> See [`OnlyTags` and `SkipTags` Decorators](#OnlyTags-and-SkipTags-Decorators).

```python
with Scenario("my tests", only_tags=OnlyTags(test=["tag1",("tag1","tag2"),...]), skip_tags=SkipTags(suite=["tag2",...])
    pass
```

### `OnlyTags` and `SkipTags` Decorators

You can also specify `only_tags` and `skip_tags` attributes of the decorated tests
using [OnlyTags class] and [SkipTags class] that can act as decorators to
set `only_tags` and `skip_tags` attributes of a decorated test respectively.

```python
    @OnlyTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

or similarly 

```python
    @SkipTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

For example,

```python
@TestScenario
@Tags("Tag A")
def test_A(self):
    pass

@TestScenario
@Tags("Tag B")
def test_B(self):
    pass

@TestSuite
@OnlyTags(test=["tag A"])
def my_suite(self):
    for scenario in loads(current_module(), Scenario):
        scenario()

@TestSuite
@SkipTags(test=["tag A"])
def my_other_suite(self):
    for scenario in loads(current_module(), Scenario):
        scenario()
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

# Test Specifications

You can add `specifications` to higher level tests either by setting [specifications] parameter of the inline test
or using [Specifications] decorator if the test is defined as a decorated function. The values of the specifications can be accessed
using the `specifications` attribute of the test.

> **{% attention %}** [Specification class] instances may be called with the version number the test is expected to verify.
> `SpecificationError` exception will be raised if version does not match the version of the instance.

## specifications

The [specifications] parameter of the test can be used to set `specifications` of any inline test. The [specifications] parameter
must be passed a `list` of [Specification class] object instances for the inline tests
or using [Specifications] decorator if the test is defined as a decorated function. The values of the specifications can be accessed
using the `specifications` attribute of the test.

For example,

```python
from requirements import SRS001

with Test("My test", specifications=[SRS001] as test:
    note(test.specifications)
```

## Specifications

A [Specifications] decorator can be used to set `specifications` attribute of a higher level test that is defined using a decorated function.
The decorator must be called with one or more [Specification class] object instances. For example,

```python
from requirements import SRS001

@TestFeature
@Specifications(
    SRS001
)
def feature(self):
    note(self.specifications)
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

> **{% attention %}** It is often common to use [input() function] to prompt
> for input during execution of semi-automated or manual tests. See [Reading Input](#Reading-Input).

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

> **{% attention %}** Manual tests are best executed using [manual output](#manual-Output) format.

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

## Manual With Automated Steps

A test that has [MANUAL] flag could also include some automated steps
which can be marked as automated using [AUTO] flag.

For example,

```python
from testflows.core import *

with Scenario("manual scenario", flags=MANUAL):
    with Given("manual setup"):
        pass
    with When("automated action", flags=AUTO):
        note("some note")
```

When the above example is executed it will produce the following output that shows that the
result for `/manual scenario/automated action` was set automatically
based on the automated actions performed in this step.

```bash
Oct 31,2021 18:24:53   ⟥  Scenario manual scenario, flags:MANUAL
Oct 31,2021 18:24:53     ⟥  Given manual setup, flags:MANUAL|MANDATORY
✍  Enter `manual setup` result? 
✍  Is this correct [Y/n]? 
            1s 410ms     ⟥⟤ OK manual setup, /manual scenario/manual setup
Oct 31,2021 18:24:54     ⟥  When automated action, flags:AUTO
               304us     ⟥    [note] some note
               374us     ⟥⟤ OK automated action, /manual scenario/automated action
✍  Enter `manual scenario` result? 
✍  Is this correct [Y/n]? 
            5s 611ms   ⟥⟤ OK manual scenario, /manual scenario
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

# Pausing Tests

When tests perform complex automated actions it is often useful to pause a test either
right before it starts executing it body or right after its completion. 
Pausing a test means that the test execution will be halted and input in a form
of pressing `Enter` will be requested from the user. This pause allows
time to manually examine system under test as well the test environment.

Pausing either before or after a test is controlled by setting either [PAUSE_BEFORE]
or [PAUSE_AFTER] flags respectively. You can also conditionally pause
after test execution on passing or failing result using [PAUSE_ON_PASS] or [PAUSE_ON_FAIL].

> *{% attention %}* [PAUSE_BEFORE], [PAUSE_AFTER], [PAUSE_ON_PASS], and [PAUSE_ON_FAIL]
> flags can be applied to any test but the [Top Level Test] test.
> For [Top Level Test] test these flags are ignored.

## Pausing Using Command Line  

Most of the time the most convenient way to pause a test program is to specify at which
test the program should pause using [--pause-before], [--pause-after],
[--pause-on-pass], and [--pause-on-fail] arguments.

These arguments accept one or more test name [pattern]s. Any test name
that matches the pattern except for the [Top Level Test] will be paused.

```bash
  --pause-before pattern [pattern ...]            pause before executing selected tests
  --pause-after pattern [pattern ...]             pause after executing selected tests
  --pause-on-fail pattern [pattern ...]           pause after selected tests on failing result
  --pause-on-pass pattern [pattern ...]           pause after selected tests on passing result
```


For example, if we have the following test program.

> `pause.py`

```python
from testflows.core import *

with Test("my test"):
    with Step("my step 1"):
        note("my step 1")
    
    with Step("my step 2"):
        note("my step 2")
```

Then if we want to pause before executing the body of `my step 1` and right after
executing `my step 2` we can execute our test program as follows.

```bash
$ python3 pause.py --pause-before "/my test/my step 1" --pause-after "/my test/my step 2"
```

This will cause the test program to be halted twice requesting `Enter` input
from the user to continue execution.

```bash
 Sep 25,2021 8:34:45   ⟥  Test my test
 Sep 25,2021 8:34:45     ⟥  Step my step 1, flags:PAUSE_BEFORE
✋ Paused, enter any key to continue...
               830ms     ⟥    [note] my step 1
               830ms     ⟥⟤ OK my step 1, /my test/my step 1
 Sep 25,2021 8:34:45     ⟥  Step my step 2, flags:PAUSE_AFTER
               609us     ⟥    [note] my step 2
               753us     ⟥⟤ OK my step 2, /my test/my step 2
✋ Paused, enter any key to continue...
            1s 490ms   ⟥⟤ OK my test, /my test
```

## Pausing In Code

You can explicitly specify [PAUSE_BEFORE], [PAUSE_AFTER], [PAUSE_ON_PASS] and 
[PAUSE_ON_FAIL] flags inside your test program.

For example,

```python
with Test("my test"):
    with Step("my step 1", flags=PAUSE_BEFORE):
        note("my step 1")
    
    with Step("my step 2", flags=PAUSE_AFTER):
        note("my step 2")

    with Step("my step 2", flags=PAUSE_ON_PASS):
        note("my step 2")
        
    with Step("my step 2", flags=PAUSE_ON_FAIL):
        note("my step 2")
```

For decorated tests [Flags] decorator can be used to set these flags.

```python
@TestScenario
@Flags(PAUSE_BEFORE|PAUSE_AFTER) # pause before and after this test
def my_scenario(self):
    pass
```

### Using `pause()`

You can also use [pause() function] to explicitely pause the test during test program
execution.

```python
pause(test=None)
```

where

* `test` the instance of the test where test program will be paused, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    pause()
```

when executed the test program is paused.

```bash
Nov 15,2021 17:31:58   ⟥  Scenario my scenario
✋ Paused, enter any key to continue...
             1s 55ms   ⟥⟤ OK my scenario, /my scenario
```

# Using Contexts

Each test has `context` attribute that can be used for storing and passing state
to sub-tests. Each test has unique object instance of [Context class] however
context variables from the parent
can be accessed as long as the same context variable was not redefined by the current
test.

The main use case for using `context` is to avoid passing common arguments
to sub-tests and as `context`s allow to pass them _automatically_.

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
> Always set variables using the context of the current test either using
> `self.context` or `current().context`.

## Using `in` Operator

You can use `in` operator to check if variable is set in context.

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

If you are not sure if context variable is set you can use built-in [getattr()] function.

```python
note(getattr(self.context, "my_var2", "was not set"))
```

## Using `getsattr()`

If you would like to set `context` variable to some value if the variable
is not defined in the context use [getsattr() function].


```python
from testflows.core import Test, note
from testflows.core import getsattr

with Test("my test") as test:
    getsattr(test.context, "my_var2", "value if my_var2 is not set")
    note(test.context.my_var2)
```

## Arbitrary Variable Names

If you would like to add a variable that for example has empty spaces
and therefore would not be valid to be referenced directly
as an attribute of the `context` then you can use [setattr()] and [getattr()]
to set and get variable respectively.

```python
with Test("my test") as test:
    setattr(test.context, "my long variable with spaces", "value")
    note(getattr(test.context, "my long variable with spaces"))
```

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

```python
loads(name, *types, package=None, frame=None, filter=None)
```
where 

* `name` module name or module 
* `*types` test types ([Step], [Test], [Scenario], [Suite], [Feature], or [Module]), default: all
* `package` package name if module name is relative (optional)
* `frame` caller frame if module name is not specified (optional)
* `filter` filter function (optional)

and **returns** list of tests.

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
        scenario()
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
or timeout is reached by specifying [retries] parameter either explicitly
for inline tests or using [Retries] or [Retry] decorator for decorated tests.

Retrying a test means to rerun it multiple times until it passes.
A pass means that a retry has either [OK], [XFail], [XError], [XNull], [XOK], or [Skip]
result.

For each attempt a [RetryIteration] is created with the name corresponding to the 
attempt number. Any fails of an individual
attempt are ignored except for the last retry attempt. Last [RetryIteration]
is marked using [LAST_RETRY] flag.

In general, it's useful to retry a test when test is unstable and sometimes could fail
but you still would like to run it as long as it passes within the specified number
of attempts or within a specified timeout period.

## Retries

The [Retries] decorator can be applied to any decorated test including steps or higher.
The [Retries] decorator should be used when you want to specify more than one test to be retried.
The tests to be retried are selected using test [pattern]s. The [Retries] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes or maximum
number of retries is reached or timeout occurs if a timeout was specified.

The [Retries] decorator takes as an argument a dictionary of the following form

```python
{
    pattern: count[, timeout[, delay[, backoff[, jitter]]]],
    ...
}
```

where 

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter 
  normally distributed between the `min` and `max` values, default: `None`

If both `count` and `timeout` are specified then the test is retried until
either until maximum retry `count` is reached or `timeout` is hit - whichever comes first.

> **{% attention %}** By default, if number of retries or timeout is not specified then
> the test will be retried until it passes but note that if the test can't reach a passing result
> then it can lead to an infinite loop.

For example,

```python
@TestFeature
@Retries({
    "my scenario 0": 5,
    "my scenario 1": 10
})
def my_feature(self):
    Scenario(name="my scenario 0", run=my_scenario)
    Scenario(name="my scenario 1", run=my_scenario)
```

will retry test `my scenario 0` maximum `5` times and `my scenario 1` maximum 10 times.  

If you want to retry only one test it is more convenient to use [Retry]
decorator instead.

## Retry

The [Retry] decorator is used to specify a retry for a single test that has
a [Step Type] or higher. The [Retry] decorator is 
usually applied the test to which the decorator is attached as by default, the `pattern` is empty
and that means it applies to the current test.
The [Retry] decorator sets [retries] attribute
of the test and causes the test to be retried until either it passes, maximum
number of retries or timeout is reached. 

> **{% attention %}** If you need to specify retries for more than one test
> use [Retries] decorator instead.

> **{% attention %}** [Retry] decorator cannot be applied more than one time
> for the same test.

The [Retry] decorator can take the following optional arguments

```python
Retry(count=None, timeout=None, delay=0, backoff=1, jitter=None, pattern="")
```

where 

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter 
  normally distributed between the `min` and `max` values, default: `None`
* `pattern` is the test name pattern, default: `""` which means the current test

If both `count` and `timeout` are specified then the test is retried until
either until maximum retry `count` is reached or `timeout` is hit - whichever comes first.

> **{% attention %}** By default, if number of retries or timeout is not specified then
> the test will be retried until it passes but note that if the test can't reach a passing result
> then it can lead to an infinite loop.

For example,

```python
@TestScenario
@Retry(5) # by default pattern=""
def my_scenario(self):
    pass
```

or you can specify `pattern` explicitely. For example,

```python
@TestScenario
@Retry(5, pattern="test to repeat")
def my_scenario(self):
    pass
```

# Retrying Code or Function Calls

When you need to retry a block of code or a function call you can use
[retries class] and [retry() function] respectively. This class and function
is flexible enough to retry functions or inline code that contains tests.

## Using `retries()`

The [retries class] can be used to retry any block of inline code and is flexible
enough to retry code includes tests. 

It takes the following optional arguments:

```python
retries(count=None, timeout=None, delay=0, backoff=1, jitter=None)
```

where

* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter 
  normally distributed between the `min` and `max` values, default: `None`

and returns an iterator that can be used in `for` loop. For each iteration
the iterator return a `RetryIteration` object that wrap the code that needs to be retries.

For example, below we wait for the code to succeed within `5` sec using `0.1` sec delay
between retries and backoff multiplier of `1.2` with jitter range
between `-0.05` min to `0.05` max.

```python
import random
from testflows.core import *
from testflows.asserts import error

with Scenario("my test"):
    with When("I try to get a random number"):
        for attempt in retries(timeout=5, delay=0.1, backoff=1.2, jitter=(-0.05,0.05)):
            with attempt:
                assert random.random() > 0.8, error()
```

The code block is considered as succeeded if no exception is raised. 

If an exception is raised the code is retried until it succeeds or if specified 
the maximum number of retries or timeout is reached.


## Using `retry()`

The [retry() function] can be used to retry any function call
including decorated tests.

It takes the following arguments where only `func` is mandatory.

```python
retry(func, count=None, timeout=None, delay=0, backoff=1, jitter=None)(*args, **kwargs)
```

where

* `func` is the function to be retried
* `count` is the number of retries, default: `None`
* `timeout` is timeout in seconds, default: `None`
* `delay` delay between retries in seconds, default: `0`
* `backoff` delay backoff multiplier, default: `1`
* `jitter` tuple of the form `(min, max)` that specifies delay jitter 
  normally distributed between the `min` and `max` values, default: `None`

that returns a wrapper function which then can be called with any arguments that are
passed to the retried `func` on each retry.

For example,

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

with Test("my test"):
    value = retry(my_func, timeout=5)(0.2)
```

Here is an example that shows how [retry() function] can be used to retry a test step.

```python
import random
from testflows.core import *
from testflows.asserts import error

def my_func(x):
    v = random.random()
    assert v < x, error()
    return v

@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    note(retry(my_step, timeout=5)(x=0.2).result.value)
```

The same behavior can be achieved by setting `retries` attribute of the test.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    When("I run my step", test=my_step, retries=Retry(timeout=5))(x=0.2)
```

You can also use `retry() function` inside an inline step.

```python
@TestStep
def my_step(self, x):
    return my_func(x)

with Test("my test"):
    with When("I run my step"):
        retry(my_step, timeout=5)(x=0.2)
```

# Using YML Config Files

All the test programs have a common optional `--config` argument that allows to 
specify one or more configuration files in [YML](https://yaml.org/) format.
The configuration files can be used to specify either common test program arguments 
such as [--no-colors], [--output], etc. as well custom
[Command Line Arguments](#Command-Line-Arguments) that added using 
[argparser](#argparser) parameter.

> *{% attention %}* Technically [YML] files should always start with `---`
> to indicate the start of a new document. However, in *{% testflows %}* configuration
> files you can omit them.

## Test Run Arguments

Common test run arguments such as [--no-colors], [--output], etc. must be specified
in the `test run:` section of the [YML] configuration file.

For example,

> `test.py`
> 
> ```python
from testflows.core import *

with Scenario("my test"):
    pass
```

can be called with the following [YML] config file to set [--output] and [--no-colors]
options for the test program run.

> `config.yml`
> 
> ```yml
test run:
  no-colors: true
  output: progress
```

> {% attention %} Names of the common test run arguments have the same names as the corresponding
> command line option without the `--` prefix.
>
> For example,
>  *  `--no-colors` is `no-colors:`
>  *  `--output` is `output:`
>  *  `--show-skipped` is `show-skipped:`

If you run `test.py` and apply the above `config.yml` you will see that the output format
for the test run will be set to `progress` and no terminal color highlighting will be applied
to the output.

```bash
$ python3 test.py --config config.yml
Executed 1 test (1 ok)

Passing

✔ [ OK ] /my test

1 scenario (1 ok)
```

## Custom Arguments

Test program custom [Command Line Arguments](#Command-Line-Arguments) that are added using 
[argparser](#argparser) parameter can be specified at the top level of [YML] configuration file.

> {% attention %} Names of the custom options have the same names as the corresponding
> command line option without the `--` prefix.
>
> For example,
> *  `--custom-arg` is `custom-colors:`
> *  `--build` is `build:`

For example,

> `test.py`
> 
> ```python
from testflows.core import *

def argparser(parser):
    parser.add_argument("--custom-arg", type=str, help="my custom test program argument")

with Scenario("my test", argparser=argparser):
    pass
```

and if you havee the following configuration file

> `config.yml`
> 
> ```yml
custom-arg: hello there
```

and apply it when running `test.py` then you will see that `custom-arg` value
will be set to the one you've specified in the `config.yml`.

```bash
$ python3 test.py -c config.yml
Sep 24,2021 21:40:52   ⟥  Scenario my test
                            Attributes
                              custom-arg
                                hello there
                 3ms   ⟥⟤ OK my test, /my test
```

## Applying Multiple YML Files

If more than one [YML] configuration file is specified on the command line
then config files are applied left to right based on the order they are specified
on the command line with the right most file having the highest precedence.

For example,

> `config1.yml`
> 
> ```yml
custom-arg: hello here
```

> `config2.yml`
> 
> ```yml
custom-arg: hello there
```

```bash
$ python3 test.py -c config1.yml -c config2.yml
Sep 24,2021 21:48:47   ⟥  Scenario my test
                            Attributes
                              custom-arg
                                hello there
                 4ms   ⟥⟤ OK my test, /my test
```

# Adding Messages

You can add custom messages to your tests using [note() function], [debug() function],
[trace() function], and [message() function].

> **{% attention %}** Use Python [f-string]s if you need to format a message using variables.


## Using `note()`

Use [note() function] to add a note message to your test.

```python
note(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    note(f"Hello {name}!")
```

when executed shows the `note` message.

```bash
Nov 15,2021 14:17:21   ⟥  Scenario my scenario
                 8ms   ⟥    [note] Hello Your Name!
                 8ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `debug()`

Use [debug() function] to add a debug message to your test.

```python
debug(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    debug(f"Hello {name}!")
```

when executed shows the `debug` message.

```bash
Nov 15,2021 14:19:27   ⟥  Scenario my scenario
                 4ms   ⟥    [debug] Hello Your Name!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `trace()`

Use [trace() function] to add a trace message to your test.

```python
trace(message, test=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    trace(f"Hello {name}!")
```

when executed shows the `trace` message.

```bash
Nov 15,2021 14:20:17   ⟥  Scenario my scenario
                 4ms   ⟥    [trace] Hello Your Name!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `message()`

Use [message() function] to add a generic message to your test
that could optionally be assigned to a `stream`.

```python
message(message, test=None, stream=None)
```

where

* `message` is a string that contains your message
* `test` (optional) the instance of the test to which the message will be added, default: current test
* `stream` (option) is a stream with which the message should be associated

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    name = "Your Name"
    message(f"Hello {name}!", stream="my stream")
    message(f"Hello {name} there again!", stream="another stream")
```

when executed shows the custom `message`.

```bash
Nov 15,2021 14:37:53   ⟥  Scenario my scenario
                 4ms        [my stream] Hello Your Name!
                 4ms        [another stream] Hello Your Name there again!
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

## Using `exception()`

Use [exception() function] to manually add an exception message to your test.

```python
exception(exc_type, exc_value, exc_traceback, test=None)
```

where

* `exc_type` exception type
* `exc_value` exception value
* `exc_traceback` exception traceback
* `test` (optional) the instance of the test to which the message will be added, default: current test

> **{% attention %}** The `exc_type`, `exc_value`, and `exc_traceback`
> are usually obtained from [sys.exc_info()] that must be called
> within `except` block.

For example,

```python
import sys
from testflows.core import *

with Scenario("my scenario"):
    try:
        raise RuntimeError("error")
    except:
        exception(*sys.exc_info())
```

when executed shows the `exception` message.

```bash
Nov 15,2021 15:08:48   ⟥  Scenario my scenario
                 4ms   ⟥    Exception: Traceback (most recent call last):
                                File "msgs.py", line 6, in <module>
                                  raise RuntimeError("error")
                              RuntimeError: error
                 4ms   ⟥⟤ OK my scenario, /my scenario
```

# Adding Metrics

You can add `metric` messages to your test using [metric() function].

```python
metric(name, value, units, type=None, group=None, uid=None, base=Metric, test=None)
```

where

* `name` name of the metric
* `value` value of the metric
* `units` units of the metric (string)
* `type` (optional) metric type
* `group` (optional) metric group
* `uid` (optionl) metric unique identifier
* `base` (optional) metric base class, default: [Metric class]
* `test` (optional) the instance of the test to which the message will be added, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    metric("my metric", 20.56, "Hz")
```

when executed shows the `metric` message.

```bash
Nov 15,2021 16:44:13   ⟥  Scenario my scenario
                 5ms   ⟥    Metric my metric
                              20.56 Hz
                 5ms   ⟥⟤ OK my scenario, /my scenario
```

You can use `cat test.log | tfs show metrics` command to see all the metrics for a given test.
See [Show Metrics](#Show-Metrics) and [Metrics Report](#Metrics-Report).

For example,

```bash
$ cat test.log | tfs show metrics
Scenario /my scenario
  Metric my metric
    20.56 Hz
```

# Reading Input

You can read input during test program execution using [input() function].
This function is commonly used in [Semi-Automated And Manual Tests](#Semi-Automated-And-Manual-Tests).

```python
input(type, multiline=False, choices=None, confirm=True, test=None
```

where 

* `type` is either a string or `result` function.
* `multiline` (optional) flag to indicate if input is multiline string, default: `False`
* `choices` (optional) a list of valid choices (only applies if `type` is string)
* `confirm` (optional) ask for confirmation, default: `True`
* `test` the instance of the test with which input message will be associated, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    input("What is your name?", multiline=False)
```

when executed prompts for `input`

```bash
Nov 15,2021 17:19:25   ⟥  Scenario my scenario
✍  What is your name?
TestFlows
✍  Is this correct [Y/n]? Y
            6s 490ms   ⟥⟤ OK my scenario, /my scenario

```

Also, you can prompt for the result. For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    input(result)
```

when executed prompts for `result`

```bash
Nov 15,2021 17:22:26   ⟥  Scenario my scenario
✍  Enter `my scenario` result? OK success
✍  Is this correct [Y/n]? 
            3s 198ms   ⟥⟤ OK my scenario, /my scenario, success
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

### --debug

Enable debugging mode. Turned off by default.

### --output

The `--output` option can be used to control output format of messages printed to `stdout`.

### --no-colors

The `--no-colors` option can be used to turn off terminal color highlighting.

### --id

The `--id` option can be used to specify custom [Top Level Test] id.

### --show-skipped

Show skipped tests.

### --show-retries

Show retried tests.

### --test-to-end

Force all tests to be test to end and continue the run even if one of the tests fails.

### --first-fail

Force all tests to be first fail and stop the run on the first failing test.

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

#### --only-tags

The `--only-tags` option can be used to filter the test flow so that only
tests with particular tag are selected to run and other are skipped.

> **{% attention %}** Note that mandatory tests will still be run.

#### --skip-tags

The `--skip-tags` option can be used to filter the test flow so that only
tests with particular tag are skipped.

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

#### --pause-on-pass

The `--pause-on-pass` option can be used to specify the tests after which the test flow
will be paused if the test has a passing result.

#### --pause-on-fail

The `--pause-on-fail` option can be used to specify the tests after which the test flow
will be paused if the test has a failing result.

#### --repeat

The `--repeat` option can be used to specify the tests to be repeated.

#### --retry

The `--retry` option can be used to specify the tests to be retried.

# Test Flags

**{% testflows %}** supports the following test flags.

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

Pause before test execution.

## PAUSE

Pause before test execution short form. See [PAUSE_BEFORE].

## PAUSE_AFTER

Pause after test execution.

## PAUSE_ON_PASS

Pause after test execution on passing result.

## PAUSE_ON_FAIL

Pause after test execution on failing result.

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

## AUTO

Automated test flag. This flag indicates that the test is automated
when parent test has [MANUAL] flag set.

## LAST_RETRY

Last retry flag. This flag is auto-set for the last retry iteration.



# Controlling Output

Test output can be controlled with `-o` or [--output] option which specifies the output format to use
to print to `stdout`. By default, the most detailed `nice` output is used.

```bash
  -o format, --output format                      stdout output format, choices are: ['new-fails',
                                                  'fails', 'classic', 'slick', 'nice', 'brisk',
                                                  'quiet', 'short', 'manual', 'dots', 'progress',
                                                  'raw'], default: 'nice'
```

For example, you can use the following test and see how output format
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
their attributes and results as well as any messages that are associated with them.

> **{% attention %}** This output format is the most useful for developing and 
> debugging an individual test.
> This output format is not useful when tests are executed in parallel.

For example,

```bash
$ python3 test.py --output nice
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
$ python3 test.py
```

## `brisk` Output

The [`brisk`] output format is very similar to [`nice`] output format but
omits all steps (tests that have [Step Type]). This format is useful when
you would like to focus on actions of the test such as commands executed
on the system under test rather than on the test procedure itself.

> **{% attention %}** This output format is useful for 
> debugging individual test when you would like to omit test steps.
> This output format is not useful when tests are executed in parallel.

```bash
$ python3 output.py -o brisk
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

> **{% attention %}** This output format is very useful to highlight and verify test procedure.
> This output format is not useful when tests are executed in parallel.

```bash
$ python3 test.py -o short
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
test and result messages for any test that has [Test Type] of higher.
Tests that have [Step Type] are not showed.

> **{% attention %}** This output format can be used for CI/CD runs as long as
> number of tests is not too large.
> This output format can be used when tests are executed in parallel.

```bash
$ python3 test.py -o classic
➤ Sep 25,2021 11:14:15 /regression
➤ Sep 25,2021 11:14:15 /regression/my test
✔ 2ms       [   OK   ] /regression/my test
✔ 12ms      [   OK   ] /regression
```

## `progress` Output

The [`progress`] output format shows the progress of the test run. 
The output is always printed on one line on progress updates and is useful
when running tests locally.

Any test fails are printed inline as soon as they occur.

> **{% attention %}** This output format should not be used for CI/CD runs
> as it outputs terminal control codes to update the same line.
> This output format can be used when tests are executed in parallel.

```bash
$ python3 test.py -o progress
Executing 2 tests /regression/my test/I do something
```

## `fails` Output

The [`fails`] output format only shows failing results [Fail], [Error], and [Null]
and crossed out results [XFail], [XError], [XNull], [XOK]. 

Failing results are only shown for tests with [Test Type] of higher.

> **{% attention %}** This output format can be used for CI/CD runs
> as long as the number of cross out results is not too large otherwise
> use [`new-fails`] output format instead.
> This output format can be used when tests are executed in parallel.

```bash
$ python3 test.py -o fails
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
$ python3 test.py -o new-fails
✘ 3ms       [  Fail  ] /regression/my test
    AssertionError
    Traceback (most recent call last):
      File "output.py", line 8, in <module>
        assert False
    AssertionError
```

## `slick` Output

The [`slick`] output format provides even shorter output than [`short`] output format
as only shows test and result messages for any test that has [Test Type] of higher.
Tests that have [Step Type] are not showed.

> **{% attention %}** This output format is more of an eye-candy.
> This output format is not useful when tests are executed in parallel.

```bash
$ python3 test.py --output slick
➤ Module regression
  ✔ Scenario my test
✔ Module regression
```

## `quiet` Output

The [`quiet`] output format does not output anything to stdout.

> **{% attention %}** This output format can be used for CI/CD runs.
> This output format can be used when tests are executed in parallel.

```bash
$ python3 test.py -o quiet
```

## `manual` Output

The [`manual`] output format is only suitable for running manual or semi-automated
tests where tester is constantly prompted for input. The terminal screen is always cleared
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
> developers and curious users that want to understand what raw messages look like.

```bash
$ python3 test.py -o raw
{"message_keyword":"PROTOCOL","message_hash":"1336ea41","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1632584893.162271,"message_rtime":0.009011,"test_type":"Module","test_subtype":null,"test_id":"/fd823a2c-1e17-11ec-8830-cb614fe11752","test_name":"/regression","test_flags":1,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
...
{"message_keyword":"STOP","message_hash":"6956b3c5","message_object":0,"message_num":7,"message_stream":null,"message_level":2,"message_time":1632584893.167364,"message_rtime":0.014104,"test_type":"Module","test_subtype":null,"test_id":"/fd823a2c-1e17-11ec-8830-cb614fe11752","test_name":"/regression","test_flags":1,"test_cflags":0,"test_level":1}
```

Advanced users can use this format to apply custom message transformations. 

For example, it can be transformed using `tfs transform nice` command into [`nice`]
format

```bash
$ python3 test.py -o raw | tfs transfrom nice
```

or combined with other unix tools such as `grep` with further message transformations.

```bash
$ python3 output.py -o raw | grep '{"message_keyword":"RESULT",' | tfs transform nice
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

This report generates `Failing` section and show failing tests.

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

This report generates `Unstable` section. Tests are considered to be unstable
if they are repeated and different iterations have different results.

```bash
Unstable

◔ [ 50.00% ] /regression/my test (1 ok, 1 failed)
```

### Coverage

This reports generates `Coverage` section. It is only generated if
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

This report generate a message that shows date time of test run 
and version of the framework that was used to run the test program.

```bash
Executed on Sep 25,2021 12:05
TestFlows.com Open-Source Software Testing Framework v1.7.210922.1181131
```

# Turning Off Color Highlighting

There are times when color highlighting might be in the way. For example,
when piping output to a different utility or saving it into the file.
In both of these cases use [--no-colors] to tell **{% testflows %}** 
to turn off adding terminal control color codes.

```bash
$ python3 test.py --no-colors > nice.log
```

or 

```bash
$ python3 test.py --no-colors | less 
```

The same option can be specified for the `tfs` utility.

```bash
$ cat test.log | tfs --no-colors show messages
```

or

```bash
$ tail -f test.log | tfs --no-colors transform nice | less
```

## Use `--no-colors` in Code

You can also detect if terminal color codes are turned off in code
by looking at `settings.no_colors` attribute as follows

```python
import testflows.settings as settings
from testflows.core import *

with Test("my test"):
    if settings.no_colors:
        debug("do something when terminal colors are turned off")
```

# Forcing To Abort On First Fail

You can force test program to abort on first fail irrespective
of the presence of [TE] flags by using [--first-fail]
test program argument.

For example,

```bash
$ python3 test.py --first-fail
```

# Forcing To Continue On Fail

You can force test program to continue running if any of the tests fail
irrespective of the presence of [TE] flags by using [--test-to-end]
test program argument.

For example,

```bash
$ python3 test.py --test-to-end
```

# Enabling Debug Mode

You can enable debug mode by specifying [--debug] option to your test program.
When debug mode is enabled the tracebacks will include more details such as
internal function calls inside the framework which are hidden by default to reduce
clutter.

```bash
$ python3 test.py --debug
```

## Use `--debug` in Code

You can also trigger actions in your test code based on if [--debug] option 
was specified or not. When [--debug] option is specified the value
can be retrieved from `settings.debug` as follows

```python
import testflows.settings as settings
from testflows.core import *

with Test("my test"):
    if settings.debug:
        debug("do something in debug mode")
```

# Show Test Data

After test program is executed you can retrieve different test data related to the test run
using `tfs show` command.

The following commands are available:

```bash
$ tfs show -h

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
$ cat test.log | tfs show metrics
```


[Show Test Data]: #Show-Test-Data
[for loop]: https://docs.python.org/3/tutorial/controlflow.html#for-statements
[assert]: https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
[AssertionError]: https://docs.python.org/3/library/exceptions.html#AssertionError
[RuntimeError]: https://docs.python.org/3/library/exceptions.html#RuntimeError
[Test Definition Classes]: #Test-Definition-Classes
[--only option]: #–only-option
[--skip option]: #–skip-option
[Tree]: #Tree-is
[Flow]: #Flow-is
[`nice`]: #nice-Output
[`short`]: #short-Output
[`slick`]: #slick-Output
[`classic`]: #classic-Output
[`progress`]: #progress-Output
[`fails`]: #fails-Output
[`new-fails`]: #new-fails-Output
[`dots`]: #dots-Output
[`brisk`]: #brisk-Output
[`manual`]: #manual-Output
[`quiet`]: #quiet-Output
[`raw`]: #raw-Output
[YML]: https://yaml.org/
[using current_module()]: #Using-current-module
[pattern]: #pattern
[--name]: #–name
[--tag]: #–tag
[--id]: #–id
[--attr]: #–attr
[--only]: #–only
[--skip]: #–skip
[--only-tags]: #–only-tags
[--skip-tags]: #–skip-tags
[--start]: #–start
[--end]: #–end
[--debug]: #–debug
[--pause-before]: #–pause-before
[--pause-after]: #–pause-after
[--pause-on-pass]: #–pause-on-pass
[--pause-on-fail]: #–pause-on-fail
[--repeat]: #–repeat
[--retry]: #–retry
[--no-colors]: #–no-colors
[--output]: #–output
[--show-skipped]: #–show-skipped
[--show-retries]: #–show-retries
[--test-to-end]: #–test-to-end
[--first-fail]: #–first-fail
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
[PAUSE_ON_PASS]: #PAUSE_ON_PASS
[PAUSE_ON_FAIL]: #PAUSE_ON_FAIL
[REPORT]: #REPORT
[DOCUMENT]: #DOCUMENT
[MANDATORY]: #MANDATORY
[MANUAL]: #MANUAL
[AUTO]: #AUTO
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
[specifications]: #specifications
[Specifications]: #Specifications
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
[f-string]: https://docs.python.org/3/tutorial/inputoutput.html#tut-f-strings
[sys.exc_info()]: https://docs.python.org/3/library/sys.html#sys.exc_info

[hasattr()]: https://docs.python.org/3/library/functions.html#hasattr
[getattr()]: https://docs.python.org/3/library/functions.html#getattr
[setattr()]: https://docs.python.org/3/library/functions.html#setattr
[UUIDv1]: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address)
[And class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2237
[Args class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L782
[Argument class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L178
[ArgumentParser class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L831
[ArgumentParser.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[AsyncPool class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L103
[AsyncPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[AsyncPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L199
[AsyncPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L138
[Attribute class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L193
[Attributes class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L792
[Attributes.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Background class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2221
[But class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2240
[By class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2243
[Check class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2180
[Context class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L123
[Context.cleanup() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L135
[Critical class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2185
[Description class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L840
[Description.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Error class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L116
[Error.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Error.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L119
[Example class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2151
[Examples class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L843
[Examples.default_row_format() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/baseobject.py#L120
[Examples.from_table() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/baseobject.py#L147
[Executor class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L825
[Executor.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[FFails class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L601
[FFails.add() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L619
[FFails.items() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L616
[FFails.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Fail class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L102
[Fail.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Fail.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L104
[Failed class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L656
[Failed.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Failed.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L102
[Failed.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Failed.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L104
[Feature class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2170
[Finally class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2246
[Flags class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/flags.py#L91
[Flags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/flags.py#L166
[Given class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2228
[Major class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2190
[Metric class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L237
[Minor class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2195
[Module class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2097
[Name class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L837
[Name.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Node class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L145
[Null class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L128
[Null.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Null.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L131
[NullStep class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2249
[OK class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L93
[OK.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[OK.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L95
[Okayed class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L671
[Okayed.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Okayed.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L93
[Okayed.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Okayed.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L95
[OnlyTags class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L544
[OnlyTags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Onlys class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L500
[Onlys.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Outline class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2113
[Parallel class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L819
[Parallel.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Pool class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L50
[Pool.map() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[Pool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L133
[Pool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L76
[Repeat class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L720
[Repeat.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Repeats class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L707
[Repeats.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Requirement class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L208
[Requirements class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L798
[Requirements.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Retries class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L737
[Retries.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Retry class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L752
[Retry.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Scenario class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2175
[Secret class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L333
[Secret.clear() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L357
[Setup class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L572
[Setup.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[SharedAsyncPool class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L227
[SharedAsyncPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[SharedAsyncPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L199
[SharedAsyncPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/asyncio.py#L236
[SharedThreadPool class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L144
[SharedThreadPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[SharedThreadPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L133
[SharedThreadPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L153
[Skip class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L113
[Skip.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Skip.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[SkipTags class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L558
[SkipTags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Skipped class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L651
[Skipped.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Skipped.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L113
[Skipped.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[Skipped.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[Skips class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L515
[Skips.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Specification class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L284
[Specifications class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L804
[Specifications.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Step class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2159
[Suite class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2105
[Table class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/baseobject.py#L81
[Table.default_row_format() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/baseobject.py#L120
[Table.from_table() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/baseobject.py#L147
[Tag class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L167
[Tags class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L810
[Tags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L488
[Test class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2121
[TestBackground class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2497
[TestBackground.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2221
[TestCase class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2470
[TestCase.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2121
[TestCheck class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2476
[TestCheck.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2180
[TestFeature class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2491
[TestFeature.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2170
[TestModule class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2494
[TestModule.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2097
[TestOutline class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2441
[TestOutline.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2113
[TestScenario class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2473
[TestScenario.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2175
[TestStep class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2416
[TestStep.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2159
[TestSuite class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2488
[TestSuite.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2105
[The class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/filters.py#L20
[The.at() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/filters.py#L32
[The.match() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/filters.py#L41
[The.set() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/filters.py#L38
[Then class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2234
[ThreadPool class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L50
[ThreadPool.map() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/usr/lib/python3.8/concurrent/futures/_base.py#L583
[ThreadPool.shutdown() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L133
[ThreadPool.submit() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/executor/thread.py#L76
[Ticket class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L268
[Uid class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L816
[Uid.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[Value class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L253
[When class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2231
[XError class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L125
[XError.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XError.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[XErrored class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L666
[XErrored.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[XErrored.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L125
[XErrored.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XErrored.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[XFail class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L110
[XFail.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XFail.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[XFailed class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L661
[XFailed.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[XFailed.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L110
[XFailed.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XFailed.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[XFails class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L575
[XFails.add() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L591
[XFails.items() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L588
[XFails.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[XFlags class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L681
[XFlags.add() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L697
[XFlags.items() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L694
[XFlags.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[XNull class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L137
[XNull.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XNull.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[XOkayed class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L676
[XOkayed.keys() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L466
[XOkayed.result class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L98
[XOkayed.result.Type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L33
[XOkayed.result.xout() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/objects.py#L73
[append_path() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L73
[args class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L102
[attribute() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L105
[current() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/__init__.py#L91
[current_dir() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L29
[current_module() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L36
[debug() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L168
[err() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L232
[exception() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L183
[fail() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L213
[getsattr() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L358
[has class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L87
[has.attribute class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L115
[has.attribute.BaseFilter class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L118
[has.attribute.BaseFilter.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.BaseFilter.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.BaseFilter.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.BaseFilter.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.BaseFilter.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.attribute.group class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L141
[has.attribute.group.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.group.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.group.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.group.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.group.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.attribute.name class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L99
[has.attribute.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.name.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.attribute.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L136
[has.attribute.type.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.type.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.type.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.type.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.type.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.attribute.uid class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L126
[has.attribute.uid.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.uid.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.uid.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.uid.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.uid.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.attribute.value class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L131
[has.attribute.value.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.attribute.value.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.attribute.value.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.attribute.value.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.attribute.value.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.flag class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L106
[has.name class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L99
[has.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.name.getattr() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L102
[has.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L146
[has.requirement.BaseFilter class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L118
[has.requirement.BaseFilter.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.BaseFilter.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.BaseFilter.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.BaseFilter.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.BaseFilter.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.group class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L141
[has.requirement.group.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.group.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.group.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.group.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.group.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.name class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L99
[has.requirement.name.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.name.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.name.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.name.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.name.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.priority class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L168
[has.requirement.priority.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.priority.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.priority.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.priority.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.priority.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.type class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L136
[has.requirement.type.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.type.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.type.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.type.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.type.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.uid class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L126
[has.requirement.uid.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.uid.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.uid.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.uid.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.uid.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.requirement.version class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L163
[has.requirement.version.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.requirement.version.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.requirement.version.getattr() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L54
[has.requirement.version.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.requirement.version.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[has.tag class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L92
[has.tag.containing() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L70
[has.tag.endingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L64
[has.tag.getattr() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L95
[has.tag.matching() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L76
[has.tag.startingwith() method]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/has.py#L58
[input() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L275
[join() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/__init__.py#L105
[load() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L48
[load_module() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L43
[loads() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2515
[main() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L93
[message() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L178
[metric() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L132
[note() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L163
[null() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L238
[ok() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L207
[ordered() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2506
[pause() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L268
[previous() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/__init__.py#L98
[private_key() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L154
[requirement() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L114
[result() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L188
[retries class]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2547
[retry() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/test.py#L2619
[skip() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L226
[tag() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L125
[ticket() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L139
[top() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/parallel/__init__.py#L84
[trace() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L173
[value() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L146
[xerr() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L256
[xfail() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L250
[xnull() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L262
[xok() function]: https://github.com/testflows/TestFlows-Core/blob/6ce5978f80aabb84544eefc8dbd753aa39245fc2/testflows/_core/funcs.py#L244
