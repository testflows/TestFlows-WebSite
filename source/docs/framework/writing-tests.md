<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Writing Tests

With {% testflows %} you actually write test programs, not just tests. This means
that the [Python] source file that contains [Top Level Test] can be run directly if
it is made executable and has `#!/usr/bin/env python3`
or using `python3` command.

> {% attention %} Note that {% testflows %} only allows one top level test in your test program.
> See [Top Level Test].

Writing tests is actually very easy, given that you are in full control of your test program.
You can either define inline tests anywhere in your test program
code or define them separately as test decorated functions.

An inline test is defined using the [with] statement and one of the [Test Definition Classes].
The choice of which test definition class you should use depends only on your preference.
See [Defining Tests](defining-tests.md#Defining-Tests).

The example from the [Hello World](introduction.md#Hello-World) shows an example of how an inline test
can be easily defined.

```python
#!/usr/bin/env python3
from testflows.core import Scenario

with Scenario("Hello World!"):
    pass
```

The same test can be defined using the [TestScenario] decorated function.
See [Decorated Tests](defining-tests.md#Decorated).

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

> {% attention %} Note that if the code inside the test does not raise any exceptions and does not
> [explicitly set test result](test-flow-control.md#Setting-Test-Results-Explicitly) it is considered as passing and will have [OK] result.

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
python3 hello_world.py
```
```bash
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

Now, let's raise some other exception like [RuntimeError] to see [Error] result.

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    raise RuntimeError("boom!")
```

```bash
python3 hello_world.py
```
```bash
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

## Flexibility in Writing Tests

{% testflows %} provides unmatched flexibility in how you can author your tests, and
this is what makes it adaptable to your testing projects at hand.

Let's look at an example of how to test the functionality
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

The test code seems to be redundant, so we could move the [When] and [Then] steps into
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
    with Then(f"I expect the result to be {expected}"):
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
    with Then(f"I expect the result to be {expected}"):
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
    with Then(f"I expect the result to be {expected}"):
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

Another option is to switch to using decorated tests. See [Decorated Tests](defining-tests.md#Defining-Tests).

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
            with Then(f"I expect the result to be {expected}"):
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
    with Then(f"I expect the result to be {expected}"):
        assert r == expected, error()

def regression():
    Scenario("check `add(a, b)` function", run=check_add)

if main():
    regression()
```

The [Outline] with [Examples] turns out to be the exact fit for the problem.
However, there are many cases where you would want to have choice, and **{% testflows %}**
provides the flexibility you need to author your tests in the way that fits best for you.

## Using Test Steps

When writing tests, it is best practice to break the test procedure
into individual test [Step]s. While using **{% testflows %}** you can write
tests without explicitly defining [Step]s it is not recommended.

Breaking tests into steps has the following advantages:

* improves code structure
* results in a self documented test code
* significantly improves test failure debugging
* enables auto generation of test specifications

### Structuring Code

Using test [Step]s helps structure test code. Any test inherently implements a
test procedure, and the procedure is usually described by a set of steps.
Therefore, it is natural to structure tests in the form of a series of individual
[Step]s. In **{% testflows %}** test [Step]s are defined and used just like [Test]s
or [Scenario]s as [Step]s also have results just like [Test]s.

Test [Step]s can either be defined inline or using [TestStep] function decorator,
with the combination of both being the most common.

For example, the following code clearly shows that by identifying steps such as setup,
action, and assertion, the structure of test code is improved.

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

In many cases, steps themselves can be reused between many different tests. In this
case, defining steps as decorated functions helps to make them reusable.

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

The best practice, however, is to wrap calls to decorated test steps with inline
[Step]s which allows you to clearly give each [Step] a proper `name` in the context
of the specific test scenario as well as allows you to specify a detailed `description`
when necessary.

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
> calls are similar to just calling a function, which is another advantage of wrapping calls
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
when given proper `name`s and `description`s make reading test code
a pleasant experience as the test author has a way to clearly communicate
the test procedure to the reader.

The result of using test [Step]s is a clear, readable, and highly maintainable
test code. Given that each [Step] produces corresponding messages in the test output, it forces
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
> However, this allows for the failure to be examined just by looking at the result of the
> [Top Level Test].

### Auto Generation of Test Specifications

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

If you save the test log using `--log test.log` option, then you can also use `tfs show procedure` command to
extract the procedure of a given test within a test program run.

```bash
cat test.log | tfs show procedure "/my scenario"
```
```bash
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
