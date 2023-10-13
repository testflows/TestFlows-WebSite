---
title: "Sketching Combinations For Combinatorial Tests"
description: Sketching combinations for combinatorial tests using TestFlows
date: 2023-10-11
author: Vitaliy Zakaznikov
image:
   asset: images/sketching-combinations.png
icon: fas fa-glasses pt-5 pb-5
---

Writing combinatorial tests usually requires that the author of the test plan be upfront.
This requires that all the combination variables and their values are identified and combined with the code
that creates possible combinations and loops through each one of them. However, it would be nice to simplify the process and
enable testers to write combinatorial tests in a manner that is as close as possible to a test that checks
just one combination. This is where combinatorial [Sketch]'es come in. A combinatorial
sketch allows a tester to write combinatorial tests in an intuitive way without worrying about
variable identification, calculation of combinations, and any explicit loops.

{% html div class="codeblock-image dark" %}
```python
@TestSketch(Scenario)
@Flags(TE)
def test_add(self):
    values = {0, 1, math.inf, math.nan, 1 / 3, 2**-200, 2**200}
    sign = {1, -1}
    check_add(a=either(*values, i="a") * either(*sign, i="sign_of_a"), b=either(*values,i="b") * either(*sign, i="sign_of_b"))
```
{% endhtml %}
<!-- more -->

Due to the problem of [combinatorial explosion](/blog/combinatorial-testing-the-introduction/#Exhaustive-testing-and-the-combinatorial-explosion-problem), a practical application of
combinatorial testing requires narrowing down the number of combinations that each test can explore.
Combinatorial testing is often even put aside altogether, as testers think that the number of combinations
is either very large or close to infinite and therefore nothing can be done, and they
only write test cases that only check one or a few of the combinations.

# The addition function

Let's take a simple toy example, the `add(a, b)` function defined below, and see how we can write
different tests for it to make sure it works as expected.

```python
def add(a, b):
    return a + b
```

# Typical check

A typical test for checking the behavior of the `add(a, b)` function could look something like this:

```python
@TestCheck
def check_add(self, a, b):
    expected = str(a + b)

    with When(f"I call the add({a},{b})"):
        result = add(a=a, b=b)

    with Then(f"the result should be {expected}"):
        assert str(result) == expected, f"failed {result} != {expected}"
```

Where the `check_add` is a parameterized test that calls the `add(a,b)` function and asserts the validity of the results.

# Basic test

Basic testing of the `add(a, b)` function could then use a feature
that calls the `check_add` test with different values for `a` and `b` of the tester's choosing.
For example,

```python
@TestFeature
def test_add(self):
    check_add(0, 1)
    check_add(1, math.inf)
    check_add(math.nan, math.nan)
    check_add(1, -1)
    check_add(2**-200, 2**200)
    check_add(1/3, 1)
```

# More advanced test

Of course, a more advanced tester could also move all the cases into something like a list of tuples data structure,
and use a for-loop to check each case. Maybe something like this:

```python
@TestFeature
def test_add(self):
    examples = [
        (0, 1),
        (1, math.inf),
        (math.nan, math.nan),
        (1, -1),
        (2**-200, (2**200),
        (1/3, 1),
    ]
    for example in examples:
        a, b = example
        check_add(a=a, b=b)
```

This version looks ok and seems like it would allow you to easily add more explicit cases as needed. However,
the two versions are conceptually the same. We are only checking six combinations
of `a` and `b` values. We could add more cases, but the list would become pretty
long. Is there a better way?

# Combinatorial sketches to the rescue!

Before sketching any combinations, let's remember that the most basic test that checks just one combination
looks like this:

```python
@TestScenario
def test_add(self):
    check_add(0, 1)
```

It has no for-loops; it is simple and sweet. Actually, if you compare the basic and more advanced versions of the
test, one might argue that the basic version is much cleaner than the second. So let's take the
simplest test above that checks only one combination and see how we can improve it with combinatorial methods.

First, it is evident from both tests that the initial set of interesting values for the `a` and `b` parameters is the following:

```python
values = {0, 1, math.inf, math.nan, 1/3, 2**-200, 2**200}
```

Second, we note that any possible value in the set above could either be positive or negative.
This can be easily expressed as multiplying a value by either a positive or negative one.
This gives us another set:

```python
sign = {1, -1}
```

Having the sets above defined, we can express a high-level test logic as follows:

1. Let `a` be either of the possible values in the set of {% katex %}values{% endkatex %} multiplied by either of the {% katex %}sign{% endkatex %} values
2. Let `b` be either of the possible values in the set of {% katex %}values{% endkatex %} multiplied by either of the {% katex %}sign{% endkatex %} values
3. Call the `check_add` with the chosen values of `a` and `b`

Reading the three steps above, some might object that we are incorrectly using the word `either`.
However, in modern English, the rules about using the word `either` are not as strict as they used to be
and `either` could be used for more than two choices. But for some of you, it might sound weird.
Here is a quote:

{% blockquote One Minute English, https://oneminuteenglish.org/en/either-more-than-two-options/ %}
In modern English, it is not unacceptable to use “either” if you are given a choice between more than two items.
{% endblockquote %}

# Let's sketch it out

Having accepted the fact that in the modern world we could use the word `either` to choose from more than two values
we could translate the three-step test procedure above into a combinatorial [Sketch]
supported by {% testflows %} as follows:

```python
@TestSketch(Scenario)
@Flags(TE)
def test_add(self):
    values = {0, 1, math.inf, math.nan, 1 / 3, 2**-200, 2**200}
    sign = {1, -1}
    check_add(
        a=either(*values, i="a") * either(*sign, i="sign_of_a"),
        b=either(*values,i="b") * either(*sign, i="sign_of_b")
    )
```

Here is the same code, but with comments:

```python
@TestSketch(Scenario)
@Flags(TE)
def test_add(self):
    # set of possible values for `a` and `b`
    values = {0, 1, math.inf, math.nan, 1 / 3, 2**-200, 2**200}
    # possible values of the sign
    sign = {1, -1}
    # call check_add where `a` and `b` are either positive or negative of one of the possible values
    check_add(a=either(*values, i="a") * either(*sign, i="sign_of_a"), b=either(*values,i="b") * either(*sign, i="sign_of_b"))
```

Let's put together a complete test program that we can run.

```python
import math
from testflows.core import *

def add(a, b):
    return a + b

@TestCheck
def check_add(self, a, b):
    expected = str(a + b)

    with When(f"I call the add({a},{b})"):
        result = add(a=a, b=b)

    with Then(f"the result should be {expected}"):
        assert str(result) == expected, f"failed {result} != {expected}"

@TestSketch(Scenario)
@Flags(TE)
def test_add(self):
    values = {0, 1, math.inf, math.nan, 1 / 3, 2**-200, 2**200}
    sign = {1, -1}
    check_add(
        a=either(*values, i="a") * either(*sign, i="sign_of_a"),
        b=either(*values, i="b") * either(*sign, i="sign_of_b"),
    )

if main():
    test_add()
```

When executed, the program will produce the following output:

```python
Oct 12,2023 20:56:21   ⟥  Scenario test add, flags:TE
Oct 12,2023 20:56:21     ⟥  Combination pattern #0, flags:TE
Oct 12,2023 20:56:21       ⟥  When I call the add(0,0)
               279us       ⟥⟤ OK I call the add(0,0), /test add/pattern #0/I call the add(0,0)
Oct 12,2023 20:56:21       ⟥  Then the result should be 0
               184us       ⟥⟤ OK the result should be 0, /test add/pattern #0/the result should be 0
               944us     ⟥⟤ OK pattern #0, /test add/pattern #0
...
Oct 12,2023 20:56:21     ⟥  Combination pattern #195, flags:TE
Oct 12,2023 20:56:21       ⟥  When I call the add(-inf,-inf)
               157us       ⟥⟤ OK I call the add(-inf,-inf), /test add/pattern #195/I call the add(-inf,-inf)
Oct 12,2023 20:56:21       ⟥  Then the result should be -inf
               157us       ⟥⟤ OK the result should be -inf, /test add/pattern #195/the result should be -inf
               618us     ⟥⟤ OK pattern #195, /test add/pattern #195
               242ms   ⟥⟤ OK test add, /test add

Passing

✔ [ OK ] /test add (242ms)

1 scenario (1 ok)
196 combinations (196 ok)
392 steps (392 ok)
```

The six lines of test code all of a sudden converted into the execution of 196 combinations for the `add(a, b)` function under test!
We actually covered all the possibilities defined by the `values` and `sign` sets.

> {% katex %}
combinations = 7 * 2 * 7 * 2 = 196
{% endkatex %}

To emphasize removing the supporting code, all the magic to create 196 combinations
was done by {% testflows %} and these six lines in the body of the test:

```python
    values = {0, 1, math.inf, math.nan, 1 / 3, 2**-200, 2**200}
    sign = {1, -1}
    check_add(
        a=either(*values, i="a") * either(*sign, i="sign_of_a"),
        b=either(*values, i="b") * either(*sign, i="sign_of_b"),
    )
```

That is one sweet combinatorial test that takes testing to a whole new level and allows new test engineers
to start seeing the true power of having combinatorial testing at their fingertips.

If you read the code carefully, you will notice that it is very intuitive, and the [either()] function defines
the possibilities, so we don't have to worry about any for-loops or calculations of all the combinations.
All the magic is done by {% testflows %}.

# Wrapping up

With test [Sketch]es, sketching out combinatorial tests becomes very easy. The use of the [either()] function
introduces the possibilities into the test code that otherwise would just check only one combination.
While the same functionality can be achieved using a standard combinatorial test code that uses either
nested for-loops or computes all combinations using a [Cartesian product] function, the ease and fun
of using test [Sketch]es is unbeatable. Sketches allow us to express choices in a very natural way,
and in more complicated test procedures, they are hard to match in terms of test code expression
and readability.

If you want to learn more, I invite you to read the [Combinatorial Tests] section in the [Handbook]
to get a glimpse of how {% testflows %} can make your testing flow. Be sure to take {% testflows %}
combinatorial [Sketch]es for a spin. You will have fun!


[Sketch]: /handbook/#Using-Sketches
[either()]: /handbook/#Using-either
[Cartesian product]: /handbook/#Cartesian-Product
[Combinatorial Tests]: /handbook/#Combinatorial-Tests
[Handbook]: /handbook






