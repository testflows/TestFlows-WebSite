---
post: true
title: "Writing Test Programs — Not Just Tests"
description: Exploring how writing test programs with TestFlows puts testers back in control — an alternative to runner-centric frameworks.
date: 2025-09-12
author: Vitaliy Zakaznikov
image: images/writing-test-programs-not-just-tests.png
icon: fas fa-glasses pt-5 pb-5
---

Have you ever found yourself fighting your test framework? Wasting hours searching for the right plugin just to run a test conditionally or in a dynamic loop? If so, you're not alone. The problem might not be your tests, but the dominant "runner mentality" that governs them.
For years, the software testing landscape has relied on this model. We diligently write tests as passive objects, only to hand them over to a separate runner that dictates their execution. This approach, popularized by frameworks like *Pytest*, and many others, certainly has its merits. Runners offer convention over configuration, and features like auto-discovery make it incredibly easy for beginners to get started. They provide a standardized way to execute tests, which is valuable. However, this convenience comes at a cost.<!-- more -->

> The separation of what to run (the tests) from how it runs (the flow) creates a fundamental disconnect, leading to awkward workarounds and limitations.

This article explores a more powerful alternative: writing test programs instead of just tests. We'll show how unifying tests and control flow empowers you with complete programmatic control, turning your testing from a constrained activity into a creative one.

# The pain of the runner-centric world

The core design choice of separating the test from the runner leads to real-world pain. The moment you need dynamic control, you hit a wall.
Have you ever tried to:
* Conditionally run a test based on the result of another? You likely had to find, install, and learn a special dependency plugin.
* Loop a test with parameters generated at runtime? This often requires contorting your code to fit a rigid parameterization scheme that wasn't designed for dynamic inputs.

These are not edge cases. The need for plugins to handle such basic control flow is a clear sign that the model is flawed. Plugins are a patch, an attempt to bridge the disconnect between the tests and the runner's limited vocabulary.

Let's consider a concrete example using *Pytest*. To create a dependency between two tests and run one repeatedly, you need two separate plugins: *pytest-dependency* and *pytest-repeat*.

```python
import pytest

@pytest.mark.dependency(name="login")
def test_login():
    assert True

@pytest.mark.dependency(depends=["login"])
@pytest.mark.repeat(10)
def test_purchase():
    assert 1 + 1 == 2
```

This works for a static number of repetitions. But what if the repeat count is dynamic—calculated moments before the test runs? The plugin breaks. You're stuck again, fighting your framework instead of writing tests.

# The alternative: embracing test programs

The alternative is to eliminate the runner and, instead, write a test program. In this everything-is-code paradigm, your tests are simply functions, and the control flow is explicitly defined using the full power of your programming language.

Let's rewrite the previous example using {% testflows %}, where the framework is just a library, not a runner.

```python
from testflows.core import *

@TestScenario
def login(self):
    assert True

@TestScenario
def purchase(self):
    assert 1 + 1 == 2

with Feature("login and purchase"):
    if Scenario(run=login) == OK:
        # Easily replace 10 with any dynamic value
        for i in range(10):
            Scenario(f"purchase #{i}", run=purchase)
```

This might look like more code upfront, but this explicitness is a feature. It completely eliminates the "hidden work" of finding, learning, and maintaining a fragile ecosystem of plugins. The dependency is a simple if statement. The repetition is a standard for loop. It’s not a new DSL; it's just Python.

And how do you run it? You execute the file directly.

```bash
python3 ./test-program.py
```

The lack of auto-discovery is also a feature, not a bug. It forces explicit composition, which means the execution flow is always clear, predictable,
and defined by you—not by some runner's discovery process.

```bash
$ python3 test_program.py 
Sep 12,2025 12:43:15   ⟥  Feature login and purchase
Sep 12,2025 12:43:15     ⟥  Scenario login
               270us     ⟥⟤ OK login, /login and purchase/login
Sep 12,2025 12:43:15     ⟥  Scenario purchase #0
               211us     ⟥⟤ OK purchase #0, /login and purchase/purchase #0
...
Sep 12,2025 12:43:15     ⟥  Scenario purchase #9
               180us     ⟥⟤ OK purchase #9, /login and purchase/purchase #9
                 6ms   ⟥⟤ OK login and purchase, /login and purchase
```

# Test program tree

Test program code naturally forms a program tree—just like any other program.
A critic might argue, “Of course a program has a call stack—that’s obvious,” and they’re right.
The real magic isn’t the tree itself—it’s that you have explicit control over building it.

For example, consider this simple test program:

```python
from testflows.core import *

@TestScenario
def test_a(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestScenario
def test_b(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

with Module("Top Test"):
    with Suite("Suite A"):
        Scenario("Test A", run=test_a)
        Scenario("Test B", run=test_b)

```

When executed, will form this tree structure.

<img style="width: 75%" src="/images/writing-test-programs-not-just-tests-pic-1.png">

This structure isn’t discovered by magic—it’s directed by your test program code.

Also, note how everything is a test. The flow of the program is described only by the executed tests, and each test defines its own flow. There is no special distinction between test types—everything is uniform and logical.

* The scenarios `Test A` and `Test B` each define their flow as two inline test steps: `Step A` and `Step B`.

* The suite `Suite A` defines its flow as running the `Test A` and `Test B` scenarios.

* The module `Top Test`, which is the top-level test of the program, defines its flow as running the inline suite `Suite A`.

The test program begins with the top-level test and proceeds by executing nested tests.

> Just like the famous saying goes: “it’s turtles all the way down”—only here, it’s tests.

That consistency, where every test defines its flow in the same way, has a kind of mathematical beauty—like a recursive definition, where the whole is built from smaller parts that mirror the same structure. No runner is needed—and if you add one, you break that consistency, and there’s no way back.

# The power of explicit control

When you are the captain, you have the full power of a programming language at your fingertips. Complex testing logic becomes trivial.

* Conditional Execution: Need to run one test only if another test failed? That's an **if** statement.

  ```python
  with Module("Test program"):
      if Scenario(run=testA) != OK:
          Scenario(run=testB) # Conditional execution
  ```

* Running Until Pass: Need to retry a flaky test until it succeeds? A while loop is your friend.

  ```python
  with Module("Test program"):
      while Scenario(run=flaky_test) != OK:
          continue # Retry until it passes
  ```

* Parallel Execution: Running tests in parallel is no longer a complex configuration file. It's an argument in a function call.

  ```python
  with Module("Test program"):
      # Run testA and testB in parallel
      Scenario(run=testA, parallel=True)
      Scenario(run=testB, parallel=True)
      join() # Wait for both to finish
      Scenario(run=testC)
  ```

# Everything is reusable and composable

One of the most powerful ideas behind test programs is that **everything can be defined once, reused anywhere, and composed into larger flows**.  
When reusability isn’t needed, you can define everything inline. In practice, mixing both styles is not only possible but often beneficial for improving test code readability.  

For reusability:  

* A suite can be defined with the [@TestSuite](/handbook/#Suite) decorator.  
* A scenario can be defined with the [@TestScenario](/handbook/#Scenario) decorator.  
* A step can be defined with the [@TestStep](/handbook/#Step) decorator.  

This makes tests uniform, consistent, and naturally composable. Suites can call scenarios, scenarios can call steps, and steps themselves can wrap other steps.  

For example, we can define reusable steps:

```python
@TestStep(Given)
def have_something(self):
    pass

@TestStep(When)
def do_something(self):
    pass

@TestStep(Then)
def check_something(self):
    pass
```

Next, define a reusable scenario that uses these steps:

```python
@TestScenario
def scenarioA(self):
    with Given("I have something"):
        have_something()
    with When("I do something"):
        do_something()
    with Then("I check something"):
        check_something()
```

The wrapping inline steps are optional, but they make the scenario’s procedure much more readable.
Readability comes from the way reusable pieces are named and composed inline.

We can do the same for a reusable suite:

```python
@TestSuite
def suiteA(self):
    Scenario(run=scenarioA)
```

A full test program looks like this:

```python
from testflows.core import *

@TestStep(Given)
def have_something(self):
    pass

@TestStep(When)
def do_something(self):
    pass

@TestStep(Then)
def check_something(self):
    pass

@TestScenario
def scenarioA(self):
    with Given("I have something"):
        have_something()
    with When("I do something"):
        do_something()
    with Then("I check something"):
        check_something()

@TestSuite
def suiteA(self):
    Scenario(run=scenarioA)

with Module("Test program"):
    Suite(run=suiteA)
```

Which produces the following output:

```bash
$ python3 test_program.py
Sep 12,2025 14:05:16   ⟥  Module Test program
Sep 12,2025 14:05:16     ⟥  Suite suiteA
Sep 12,2025 14:05:16       ⟥  Scenario scenarioA
Sep 12,2025 14:05:16         ⟥  Given I have something, flags:MANDATORY|SETUP
               218us         ⟥⟤ OK I have something, /Test program/suiteA/scenarioA/I have something
Sep 12,2025 14:05:16         ⟥  When I do something
               181us         ⟥⟤ OK I do something, /Test program/suiteA/scenarioA/I do something
Sep 12,2025 14:05:16         ⟥  Then I check something
               177us         ⟥⟤ OK I check something, /Test program/suiteA/scenarioA/I check something
                 1ms       ⟥⟤ OK scenarioA, /Test program/suiteA/scenarioA
                 1ms     ⟥⟤ OK suiteA, /Test program/suiteA
                 4ms   ⟥⟤ OK Test program, /Test program
```

If we change the output format to short with the `-o short` option:

```bash
$ python3 test_program.py -o short
Module Test program
  Suite suiteA
    Scenario scenarioA
      Given I have something
      OK
      When I do something
      OK
      Then I check something
      OK
    OK
  OK
OK
```

The short output may now start to look like a Gherkin specification. The difference is that here it’s output, not input. You don’t lose control, and you stay entirely within Python—while making both your test code and test output readable and maintainable. That balance becomes essential as your testing grows to hundreds or thousands of cases.

# From simple to advanced with ease

Because your tests are just code, scaling from simple to advanced techniques is simply a matter of applying different coding patterns.
Dynamic test generation—often a nightmare elsewhere—becomes as simple as writing a nested **for** loop.

Here’s an example from [Combinatorial Testing: The Introduction](/blog/combinatorial-testing-the-introduction):

```python
@TestScenario
def check_pressure_switch(self):
    """Check all pressure and volume combinations."""
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 100, 200, 300, 400]

    for pressure in pressures:
        for volume in volumes:
            with Check(f"pressure={pressure},volume={volume}"):
                pressure_switch(pressure=pressure, volume=volume)
```

This same approach unlocks truly advanced strategies like property-based testing and model-based testing,
as introduced in [Combinatorial Testing: Writing Behavior Model](/blog/combinatorial-testing-behavior-model/).
It can also extend to working with formal system descriptions, as in [Testing Simple Train Control System Using Its Formal Description](/blog/testing-simple-train-control-system-using-formal-description/), and even fuzzing—all using test programs.

>  In the end, it’s just code.

# Understanding some of the trade-offs

Like any architectural choice, writing test programs comes with trade-offs. The paradigm gives you explicit control, but that power comes with responsibility.

* Conventions vs. ownership – Runners provide auto-discovery and naming rules for free. Test programs put you in charge of defining and maintaining them.

* Guardrails vs. freedom – Without restrictions, test code can be elegant or messy. Discipline shifts from the framework to your team’s practices.

* Tooling convenience – IDE buttons, discovery panels, and green checkmarks don’t come automatically. Replicating them takes extra effort.

* Learning curve and perception – New contributors must learn your flow, and some teams may see programmatic tests as unconventional.

At the same time, for teams moving into advanced testing techniques—like autonomous testing with property-based or behavior models—test programs open the freedom to explore approaches that would be difficult or impossible under a runner’s constraints.

In short, you trade the convenience of implicit frameworks for the explicit power of code. For teams hitting the ceiling of what their runner can do,
that trade can be liberating and sometimes unavoidable.

# Get started

If this idea of freedom and control resonates with you, I encourage you to explore it further.
{% testflows %} is an open-source project that embodies these principles. You can get started with a simple:

```bash
pip3 install testflows
```

Try the "Hello World" example.

```python
from testflows.core import *

with Scenario("test"):
    note("Hello World")
```

For more information, read the [Handbook](/handbook) or explore and contribute on [GitHub](https://github.com/testflows/TestFlows-Core).
And remember: no runner required—it’s just Python.
