<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

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

A [Case](concepts-and-types.md#Case-is) can be defined using [Test] test definition class or [TestCase] decorator.

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

> **{% attention %}** Note that here the word `test` is used to define a [Case](concepts-and-types.md#Case-is) to match the most common meaning of the word `test`.
> When someone says they will run a `test` they most likely mean they will run a test [Case](concepts-and-types.md#Case-is).

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
or [Minor] test definition class, respectively, or similarly using [TestCritical], [TestMajor],
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

These classes are usually used for the classification of checks during reporting.

```bash
1 scenario (1 ok)
1 critical (1 ok)
1 major (1 ok)
1 minor (1 ok)
```

## Example

An [Example] can only be defined inline using [Example] test definition class. There is no decorator
to define it outside of existing test. An [Example] is a sub-type of a [Test Type] and is used to define
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
An [Outline] is a sub-type of a [Test] type but you can change the type
by passing it another [Type] or a [Sub-Type] such as [Scenario] or [Suite] etc.

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
that is of a higher [Type] than the [Type] of outline itself, then when called, the outline will iterate over all
the examples defined in the [Examples] table. For example, if you run the example above that executes the outline
with no arguments, you will see that the outline iterates over all the examples in the [Examples] table, where
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

## Combination

A [Combination] is not meant to be used explicitly, and in most cases it is only used
internally to represent each combination of a [Sketch].

## Sketch

A [Sketch] is defined using the [TestSketch] decorator. In most cases you should not
use [Sketch] test definition class directly as it will not execute its [Combination]s.
A [Sketch] is a sub-type of a type [Test] but you can specify a different type. For example,
you can pass a specific [Type] or a [Sub-Type] such as [Scenario], [Suite], or [Feature] etc. when defining a [TestSketch].

Because [Sketch]s are designed to execute different [Combination]s, one for each [Combination]
defined by the [either() function], it is best to define a [Sketch] only using a [TestSketch] decorator.

> **{% attention %}** [TestSketch] is designed to work with [either() function]
> that is used to define combination variables and their possible values.

For example,

```python
def add(a, b):
    return a + b

@TestSketch(Scenario)
def my_sketch(self):
    a = either(1,2)
    b = either(2,3)
    r = add(a, b)
    note(f"{a} + {b} = {r}")
    assert r == a + b
```

The [TestSketch] above calls the `add()` function with different combinations of its `a` and `b` parameters.
The [Sketch] checks combinations when `a` argument is either `1` or `2`, and `b` argument is either `2` or `3`.
Therefore, the following combination patterns are covered:

> * `pattern #0`: add(1,2)
> * `pattern #1`: add(1,3)
> * `pattern #2`: add(2,2)
> * `pattern #3`: add(2,3)

You can see this from the output of the test.

```bash
Sep 21,2023 13:42:38   ⟥  Scenario my sketch
Sep 21,2023 13:42:38     ⟥  Combination pattern #0
               264us     ⟥    [note] 1 + 2 = 3
               332us     ⟥⟤ OK pattern #0, /my sketch/pattern #0
Sep 21,2023 13:42:38     ⟥  Combination pattern #1
               264us     ⟥    [note] 1 + 3 = 4
               324us     ⟥⟤ OK pattern #1, /my sketch/pattern #1
Sep 21,2023 13:42:38     ⟥  Combination pattern #2
               186us     ⟥    [note] 2 + 2 = 4
               236us     ⟥⟤ OK pattern #2, /my sketch/pattern #2
Sep 21,2023 13:42:38     ⟥  Combination pattern #3
               171us     ⟥    [note] 2 + 3 = 5
               218us     ⟥⟤ OK pattern #3, /my sketch/pattern #3
                 4ms   ⟥⟤ OK my sketch, /my sketch
```

See [Using Sketches] for more details.

## Iteration

An [Iteration] is not meant to be used explicitly, and in most cases it is only used
internally to implement test repetitions.

## RetryIteration

A [RetryIteration] is not meant to be used explicitly and, in most cases, is only used
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

A [Given] step is used to define preconditions or setup and is always treated as a mandatory step
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

A [Background] step is used to define a complex preconditions or setup, usually containing multiple
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

> **{% attention %}** It does not make sense to use [TestStep] decorator to define it, so always define it inline.

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

> **{% attention %}** `TypeError` exception will be raised if the [And] step is defined where it has no siblings. For example,
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
used to define a step that usually contains a negative assertion.
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
of a previous step should not prevent execution of other [Finally] steps that follow.
