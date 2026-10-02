<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Combinatorial Tests

> **{% attention %}** Available in version >= `2.1.2`

Combinatorial testing is supported by allowing you to define tests that can take arguments,
as well as allowing you to easily define tests that check different combinations using [TestSketch]es.

In addition, a convenient collection of tools used for combinatorial testing is provided
including calculation of [Covering Arrays] for pairwise and n-wise testing using the [IPOG] algorithm.

<figure id="Example-Pressure-Switch" class="example">Example: Pressure Switch</figure>

Let's see the basic application of combinatorial tests to testing a simple pressure switch
defined by the `pressure_switch` function below, where it has a fault when
`pressure < 10` or `pressure > 30`, and `volume > 250`.

```python
def pressure_switch(pressure, volume):
    """Pressure switch.

    `pressure` levels: 0, 20, 40
    `volume` levels: 0, 100, 200, 300
    """
    if (pressure < 10 or pressure > 30):
       if (volume > 250):
           assert False, "boom!"
       else:
           note("ok, no problem")
    else:
        note("ok")
```

## Simple Approach (Nested For-loops)

We can check all the combinations, including some extra values, using the following
[TestScenario] that uses nested for-loops to iterate over each combination of
`pressure` and `volume` values to check our [Example: Pressure Switch].

```python
@TestScenario
def check_pressure_switch(self):
    """Check all combinations of pressure and volume."""
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 100, 200, 300, 400]

    for pressure in pressures:
        for volume in volumes:
            with Check(f"pressure={pressure},volume={volume}", flags=TE):
                pressure_switch(pressure=pressure, volume=volume)
```

As expected it will catch the fault in the following combinations:

```bash
Failing

✘ [ Fail ] /check pressure switch/pressure=0,volume=300 (732us)
✘ [ Fail ] /check pressure switch/pressure=0,volume=400 (448us)
✘ [ Fail ] /check pressure switch/pressure=40,volume=300 (411us)
✘ [ Fail ] /check pressure switch/pressure=40,volume=400 (345us)
```

## Computed Combinations (Cartesian Product)

Another approach to using [nested for-loops] is to compute all the combinations
using the [Cartesian Product] function. Here is the
[TestScenario] that uses the `product(*iterables, repeat=1)` function
to compute all combinations of `pressure` and `volume` values to check our [Example: Pressure Switch].

The advantage of using the cartesian product function is that it avoids writing nested for-loops
and is much more scalable when the number of variables is large.

```python
from testflows.combinatorics import product

@TestScenario
def check_pressure_switch(self):
    """Check all combinations of pressure and volume
    using cartesian product."""
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 100, 200, 300, 400]

    for combination in product(pressures, volumes):
        pressure, volume = combination
        with Check(f"pressure={pressure},volume={volume}", flags=TE):
            pressure_switch(pressure=pressure, volume=volume)
```

## Using Sketches

A simple approach to check all possible combinations is to use a [TestSketch].

> ✋ [Sketch]es currently do not support filtering or [Covering Arrays].
> See [Filtering Combinations] and [Covering Array Combinations] for more details.

A [TestSketch] allows you to check all possible combinations, where each combination
variable and its values are defined by the [either() function].
[TestSketch] with [either() function] makes writing combinatorial tests
as simple as writing a simple test that would check one combination.

> ✋ If you call the [either() function] multiple times on the same line of code
> or you have a call to the [either() function] inside a `for-loop` or `while-loop`,
> then unique identifier `i` must be specified explicitly.

For the [Example: Pressure Switch], our [TestSketch] would be as follows:

```python
@TestSketch(Scenario)
@Flags(TE)
def check_pressure_switch(self):
    """Check all combinations of pressure and volume using a TestSketch."""
    pressure = either(0, 10, 20, 30, 40)
    volume = either(0, 100, 200, 300, 400)

    with Check(f"pressure={pressure},volume={volume}"):
        pressure_switch(pressure=pressure, volume=volume)
```

Each [either() function] defines a new combination variable and its possible values,
and then {% testflows %} automatically loops through all the combinations
when a [TestSketch] is called.

Running the [TestSketch] above results in the following output:

```bash
Sep 22,2023 16:29:07   ⟥  Scenario check pressure switch, flags:TE
Sep 22,2023 16:29:07     ⟥  Combination pattern #0, flags:TE
Sep 22,2023 16:29:07       ⟥  Check pressure=0,volume=0
               181us       ⟥    [note] ok, no problem
               255us       ⟥⟤ OK pressure=0,volume=0, /check pressure switch/pattern #0/pressure=0,volume=0
               705us     ⟥⟤ OK pattern #0, /check pressure switch/pattern #0
Sep 22,2023 16:29:07     ⟥  Combination pattern #1, flags:TE
Sep 22,2023 16:29:07       ⟥  Check pressure=0,volume=100
               175us       ⟥    [note] ok, no problem
               222us       ⟥⟤ OK pressure=0,volume=100, /check pressure switch/pattern #1/pressure=0,volume=100
               705us     ⟥⟤ OK pattern #0, /check pressure switch/pattern #1
...
```

Fails are reported as below.

```bash
Failing

✘ [ Fail ] /check pressure switch/pattern #3/pressure=0,volume=300 (541us)
✘ [ Fail ] /check pressure switch/pattern #4/pressure=0,volume=400 (360us)
✘ [ Fail ] /check pressure switch/pattern #23/pressure=40,volume=300 (519us)
✘ [ Fail ] /check pressure switch/pattern #24/pressure=40,volume=400 (340us)
```

A [TestSketch] allows for an advanced and intuitive definition of combinatorial tests
especially when the number of combination variables grows.

Each call to the [either() function] must be unique, or a unique identifier `i` must be specified.
By default, the unique identifier of the [either() function] is the source code line number;
therefore, if you call the [either() function] multiple times on the same line of code
or you have a call to the [either() function] inside a `for-loop` or `while-loop`,
then the unique identifier `i` must be specified explicitly.

For example, let's assume we have a function `add(a, b, c)` that we want to test.

```python
def add(a, b, c):
    note(f"{a} + {b} + {c}")
```

We could write a [TestSketch] that calls the [either() function] inside a `for-loop`
on the same line multiple times as follows:

```python
@TestSketch(Scenario)
def check_add(self):
    for i in range(either(value=range(1, 2))):
        add(a=either(1, 2, i=f"a{i}"), b=either(3, 4, i=f"b{i}"), c=either(5, 6, i=f"c{i}"))
```

Note that we had to pass a unique identifier `i` for each [either() function] call that defined possible
values of `a`, `b`, and `c`. Also, note that the unique identifier was a combination of the variable name
and the loop variable `i`.

```python
add(a=either(1, 2, i=f"a{i}"), b=either(3, 4, i=f"b{i}"), c=either(5, 6, i=f"c{i}"))
```

The [TestSketch] above results in the generation of eight combinations. This is because
`range(1,2)` is `[1]`, and therefore the `for-loop` has only one iteration.

```python
    for i in range(either(value=range(1, 2))):
```

```bash
Sep 22,2023 17:00:48   ⟥  Scenario check add
Sep 22,2023 17:00:48     ⟥  Combination pattern #0
               371us     ⟥    [note] 1 + 3 + 5
               444us     ⟥⟤ OK pattern #0, /check add/pattern #0
Sep 22,2023 17:00:48     ⟥  Combination pattern #1
               216us     ⟥    [note] 1 + 3 + 6
               270us     ⟥⟤ OK pattern #1, /check add/pattern #1
Sep 22,2023 17:00:48     ⟥  Combination pattern #2
               190us     ⟥    [note] 1 + 4 + 5
               238us     ⟥⟤ OK pattern #2, /check add/pattern #2
Sep 22,2023 17:00:48     ⟥  Combination pattern #3
               184us     ⟥    [note] 1 + 4 + 6
               231us     ⟥⟤ OK pattern #3, /check add/pattern #3
Sep 22,2023 17:00:48     ⟥  Combination pattern #4
               174us     ⟥    [note] 2 + 3 + 5
               220us     ⟥⟤ OK pattern #4, /check add/pattern #4
Sep 22,2023 17:00:48     ⟥  Combination pattern #5
               186us     ⟥    [note] 2 + 3 + 6
               234us     ⟥⟤ OK pattern #5, /check add/pattern #5
Sep 22,2023 17:00:48     ⟥  Combination pattern #6
               232us     ⟥    [note] 2 + 4 + 5
               279us     ⟥⟤ OK pattern #6, /check add/pattern #6
Sep 22,2023 17:00:48     ⟥  Combination pattern #7
               168us     ⟥    [note] 2 + 4 + 6
               214us     ⟥⟤ OK pattern #7, /check add/pattern #7
                 5ms   ⟥⟤ OK check add, /check add
```

Let's change the `for-loop` so that it can iterate either one or two times.

```python
@TestSketch(Scenario)
def check_add(self):
    for i in range(either(value=range(1, 3))):
        add(a=either(1, 2, i=f"a{i}"), b=either(3, 4, i=f"b{i}"), c=either(5, 6, i=f"c{i}"))
```

Then the number of combinations will be `72`, and it will not be that intuitive what each combination is.
The first run of the `for-loop`, where it iterates only once, will produce the same `8` combinations
as before. However, the second run of the `for-loop`, when it iterates twice, will
create combinations similar to the ones below. The combination `1 + 3 + 5`
is followed by each of the `8` possibilities, including itself, and this is done for each
combination of `a + b + c`, and thus resulting in `8 * 8 + 8 = 72` total combinations.

```
Sep 22,2023 17:08:13     ⟥  Combination pattern #8
               155us     ⟥    [note] 1 + 3 + 5
               181us     ⟥    [note] 1 + 3 + 5
               220us     ⟥⟤ OK pattern #8, /check add/pattern #8
Sep 22,2023 17:08:13     ⟥  Combination pattern #9
               156us     ⟥    [note] 1 + 3 + 5
               183us     ⟥    [note] 1 + 3 + 6
               222us     ⟥⟤ OK pattern #9, /check add/pattern #9
Sep 22,2023 17:08:13     ⟥  Combination pattern #10
               161us     ⟥    [note] 1 + 3 + 5
               189us     ⟥    [note] 1 + 4 + 5
               231us     ⟥⟤ OK pattern #10, /check add/pattern #10
Sep 22,2023 17:08:13     ⟥  Combination pattern #11
               166us     ⟥    [note] 1 + 3 + 5
               195us     ⟥    [note] 1 + 4 + 6
               235us     ⟥⟤ OK pattern #11, /check add/pattern #11
Sep 22,2023 17:08:13     ⟥  Combination pattern #12
               163us     ⟥    [note] 1 + 3 + 5
               190us     ⟥    [note] 2 + 3 + 5
               230us     ⟥⟤ OK pattern #12, /check add/pattern #12
Sep 22,2023 17:08:13     ⟥  Combination pattern #13
               225us     ⟥    [note] 1 + 3 + 5
               252us     ⟥    [note] 2 + 3 + 6
               292us     ⟥⟤ OK pattern #13, /check add/pattern #13
Sep 22,2023 17:08:13     ⟥  Combination pattern #14
               156us     ⟥    [note] 1 + 3 + 5
               183us     ⟥    [note] 2 + 4 + 5
               225us     ⟥⟤ OK pattern #14, /check add/pattern #14
Sep 22,2023 17:08:13     ⟥  Combination pattern #15
               155us     ⟥    [note] 1 + 3 + 5
               182us     ⟥    [note] 2 + 4 + 6
...
```

### Randomizing Combinations

Use the `random` test attribute of the [TestSketch] to randomize the order of combinations.

For example,

```python
@TestSketch(Scenario)
@Flags(TE)
def check_pressure_switch(self):
    """Check all combinations of pressure and volume using a TestSketch."""
    pressure = either(0, 10, 20, 30, 40)
    volume = either(0, 100, 200, 300, 400)

    with Check(f"pressure={pressure},volume={volume}"):
        pressure_switch(pressure=pressure, volume=volume)

# Run the sketch in random combination order
Sketch(test=check_pressure_switch, random=True)()
```

> ✋ See [Using either()] for how to randomize order for a given combination variable.

You can combine `random` with the `limit` test attribute. See the [Limiting Number of Combinations] section below.
Also, you can use the [Args] decorator to specify the default value of the `random` test attribute.

For example,

```python
@TestSketch(Scenario)
@Flags(TE)
@Args(random=True, limit=3)
def check_pressure_switch(self):
    """Check all the combinations of pressure and volume using TestSketch."""
    pressure = either(0, 10, 20, 30, 40)
    volume = either(0, 100, 200, 300, 400)

    with Check(f"pressure={pressure},volume={volume}"):
        pressure_switch(pressure=pressure, volume=volume)
```

### Limiting the Number of Combinations

Use the `limit` test attribute of the [TestSketch] to limit the number of combinations.

For example,

```python
@TestSketch(Scenario)
@Flags(TE)
def check_pressure_switch(self):
    """Check all combinations of pressure and volume using a TestSketch."""
    pressure = either(0, 10, 20, 30, 40)
    volume = either(0, 100, 200, 300, 400)

    with Check(f"pressure={pressure},volume={volume}"):
        pressure_switch(pressure=pressure, volume=volume)

# Run the sketch only for the first 5 combinations
Sketch(test=check_pressure_switch, limit=5)()
```

> ✋ See [Using either()] for how to limit the number of values for a given combination variable.

Use both the `random` and `limit` attributes of the [TestSketch] to execute a limited number of random
combinations.

For example,

```python
# Run the sketch only for the first 5 random combinations
Sketch(test=check_pressure_switch, random=True, limit=5)()
```

You can also use the [Args] decorator to specify the default value of the `limit` test attribute.

```python
@TestSketch(Scenario)
@Flags(TE)
@Args(limit=3)
def check_pressure_switch(self):
    """Check all combinations of pressure and volume using TestSketch."""
    pressure = either(0, 10, 20, 30, 40)
    volume = either(0, 100, 200, 300, 400)

    with Check(f"pressure={pressure},volume={volume}"):
        pressure_switch(pressure=pressure, volume=volume)
```

### Using `either()`

The [either() function] selects values for a combination variable one at a time until all values are consumed.

> **{% attention %}** This function must be called only once for each line of code in the same source file,
> or a unique identifier `i` must be specified.

> ✋ It is used in [TestSketch]es to check all possible combinations. See [Using Sketches].

Values can be specified either using `*values` or by passing an iterator or generator
as a `value`.

If neither `*values` nor `value` is explicitly specified, then `*values`
is set to a `(True, False)` tuple.

If `random` is `True`, then all values will be shuffled using the default shuffle function.

Optionally, you can pass a custom `shuffle` function that takes values as an argument
and modifies the sequence in place. By default, `random.shuffle()` is used.

You can use `limit` to limit the number of values to choose.

```python
either(*values, value=None, i=None, random=False, shuffle=random.shuffle, limit=None)
```

where

* `*values` zero or more of values to choose from
* `value` iterator or generator of values
* `random` (optional) randomize order of values (values must fit into memory), default: `False`
* `shuffle` (optional) custom function to shuffle the values
* `limit` (optional) limit number of values (integer `> 0`), default: `None`
* `i` (optional) unique identifier, default: `None`

## Using Combination Outlines

[TestSketch] provides a very easy way to define a combinatorial test. However,
[Sketch]es do have their limitations, and sometimes using a [Combination] [Outline]
is necessary.

```python
@TestOutline(Combination)
```

Here is an example of using [TestSketch] for testing a few combinations of a calculator's
`+`, `-`, `*`, and `/` operations when the user enters some positive or negative numbers,
and presses the `=` sign to get the results.

```python
@TestSketch(Scenario)
def check_basic_operations(self):
    """Check basic operations `+`, `-`, `*`, `/`
    with some one digit positive or negative numbers including `0`.
    """
    try:
        with When("I enter either positive or negative 0,1,2"):
            if either(True, False):
                By(test=press_minus)()
            By(test=either(press_0, press_1, press_2))()

        with And("then I press either +, -, *, / operation"):
            By(test=either(press_plus, press_minus, press_multiply, press_divide))()

        with And("I enter second argument either positive or negative 0,1,2"):
            if either(True, False):
                By(test=press_minus)()
            By(test=either(press_0, press_1, press_2))()

        with And("I press equals to calculate the result"):
            By(test=press_equal)()

        with Then("I check calculator state"):
            By(test=check_state)()
    finally:
        with Finally("I reset calculator back to 0"):
            By(test=reset_calculator)()
```

Let's now implement the [TestSketch] above using a [Combination] [Outline] and the `product() function`
to see the difference between them.

```python
@TestOutline(Combination)
def check_basic_operations_outline(self, combination):
    """Check basic operation that takes two arguments `a` and `b`
    that can either be positive or negative.
    """
    is_a_negative, press_a, press_operation, is_b_negative, press_b = combination

    try:
        with When("I enter either a positive or negative number as the first argument `a`"):
            if is_a_negative:
                By(test=press_minus)()
            By(test=press_a)()

        with And("I enter arithmetic operation"):
            By(test=press_operation)()

        with And("I enter either a positive or negative number as the second argument `b`"):
            if is_b_negative:
                By(test=press_minus)()
            By(test=press_b)()

        with And("I press equal sign to calculate the result"):
            By(test=press_equal)()

        with Then("I check calculator state"):
            By(test=check_state)()
    finally:
        with Finally("I reset calculator back to 0"):
            By(test=reset_calculator)()


@TestScenario
def check_basic_operations(self):
    """Check basic operations `+`, `-`, `*`, `/`
    with some one digit positive or negative numbers including `0`.
    """
    for i, combination in enumerate(
        product(
            [True, False], #is_a_negative
            [press_0, press_1, press_2], #press_a
            [press_plus, press_minus, press_multiply, press_divide], # operations
            [True, False], # is_b_negative
            [press_0, press_1, press_2], #press_b
        )
    ):
        with Combination(f"pattern #{i}"):
            check_basic_operations_outline(combination=combination)
```

As can be seen above, using an [Outline] is more involved and forces us to create a named variable for each combination variable and compute each combination explicitly using the cartesian `product() function` that produces combinations that need to be passed to the [Outline], which then has to unpack the combination into its individual combination variables to be used in its test procedure.
However, a combination outline can provide more control over how a test iterates over each combination, allowing the possibility of filtering invalid combinations as well as the ability to use them with [Covering Arrays].

{% html div class="styled-table" %}

| Feature | Sketch    | Combination Outline |
| ------- | --------- | ------- |
| Ease of use  | Easy | Moderate  |
| Combination Filtering | No | Yes |
| Covering Arrays | No | Yes |

{% endhtml %}

## Filtering Combinations

Use a [Combination Outline] to filter invalid combinations.

For example,

```python
@TestScenario
def check_basic_operations(self):
    """Check basic operations `+`, `-`, `*`, `/`
    with some one digit positive or negative numbers including `0`.
    """
    for i, combination in enumerate(
        product(
            [True, False], #is_a_negative
            [press_0, press_1, press_2], #press_a
            [press_plus, press_minus, press_multiply, press_divide], # operations
            [True, False], # is_b_negative
            [press_0, press_1, press_2], #press_b
        )
    ):
        # explicitly filter out `-2 * 1` combination
        if combination == (True, press_2, press_multiply, False, press_1):
            continue

        with Combination(f"pattern #{i}"):
            check_basic_operations_outline(combination=combination)
```

## Covering Array Combinations

Use a [Combination Outline] to generate a limited number of combinations using a [Covering Array].

For example, with a `CoveringArray(strength=3)`, we will have to only check `37` combinations
instead of all the `144 (2*3*4*2*3)` combinations if we do not use a [Covering Array], and instead do exhaustive testing.

```python
@TestScenario
def check_basic_operations(self):
    """Check basic operations `+`, `-`, `*`, `/`
    with some one digit positive or negative numbers including `0`
    using a covering array of strength `3`.
    """
    for i, combination in enumerate(
        CoveringArray(
            {
                "is_a_negative": [True, False],
                "press_a": [press_0, press_1, press_2],
                "operation": [press_plus, press_minus, press_multiply, press_divide],
                "is_b_negative": [True, False],
                "press_b": [press_0, press_1, press_2],
            },
            strength=3,
        )
    ):
        with Combination(f"pattern #{i}"):
            check_basic_operations_outline(combination=combination.values())
```

## Covering Arrays - (Pairwise, N-wise) Testing

The [CoveringArray class] allows you to calculate a covering array
for some `k` parameters having the same or different number of possible values.

The class uses [IPOG], an in-parameter-order algorithm as described in [IPOG: A General Strategy for T-Way Software Testing] by Yu Lei et al.

For any non-trivial number of parameters, exhaustively testing all possibilities is not feasible.
For example, if we have `10` parameters (`k=10`) that each have `10` possible values (`v=10`), the
number of all possibilities is {% katex %}v^k=10^{10} = {10}_{billion}{% endkatex %}, thus requiring 10 billion tests for complete coverage.

Given that exhaustive testing might not be practical, a covering array could give us a much smaller
number of tests if we choose to check all possible interactions only between some fixed number
of parameters at least once, where an interaction is some specific combination, where order does not matter,
of some `t` number of parameters, covering all possible values that each selected parameter could have.

> **{% attention %}** You can find out more about covering arrays by visiting the US National Institute of Standards and Technology's (NIST) [Introduction to Covering Arrays](https://math.nist.gov/coveringarrays/coveringarray.html) page.

The `CoveringArray(parameters, strength=2)` takes the following arguments:

where,

* `parameters` specifies parameter names and their possible values and
   is specified as a `dict[str, list[value]]`, where *key* is the parameter name and
   *value* is a list of possible values for a given parameter.
* `strength` specifies the strength `t` of the covering array that indicates the number of parameters
   in each combination, for which all possible interactions will be checked.
   If `strength` equals the number of parameters, then you get the exhaustive case.

The return value of the `CoveringArray(parameters, strength=2)` is a `CoveringArray` object that is an iterable
of tests, where each test is a dictionary, with each key being the parameter name and its value
being the parameter value.

For example,

```python
from testflows.combinatorics import CoveringArray

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}

print(CoveringArray(parameters, strength=2))
```

Gives the following output:

```bash
CoveringArray({'a': [0, 1], 'b': ['a', 'b'], 'c': [0, 1, 2], 'd': ['d0', 'd1']},2)[
6
a b c d
-------
0 b 2 d1
0 a 1 d0
1 b 1 d1
1 a 2 d0
0 b 0 d0
1 a 0 d1
]
```

Given that in the example above, the `strength=2`, all possible 2-way (pairwise)
combinations of parameters `a`, `b`, `c`, and `d` are the following:

```python
[('a', 'b'), ('a', 'c'), ('a', 'd'), ('b', 'c'), ('b', 'd'), ('c', 'd')]
```

The six tests that make up the covering array cover all the possible interactions
between the values of each of these parameter combinations. For example, the `('a', 'b')`
parameter combination covers all possible combinations of the values that
parameters `a` and `b` can take.

Given that parameter `a` can have values `[0, 1]`, and parameter `b` can have values `['a', 'b']`
all possible interactions are the following:

```python
[(0, 'a'), (0, 'b'), (1, 'a'), (1, 'b')]
```

where the first element of each tuple corresponds to the value of the parameter `a`, and the second
element corresponds to the value of the parameter `b`.

Examining the covering array above, we can see that all possible interactions of parameters
`a` and `b` are indeed covered at least once. The same check can be done for other parameter combinations.

## Checking Covering Array

The [CoveringArray.check() function] can be used to verify that the tests
inside the covering array cover all possible `t-way` interactions at least once and thus
meet the definition of a covering array.

For example,

```python
from testflows.combinatorics import CoveringArray

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}
tests = CoveringArray(parameters, strength=2)

print(tests.check())
```

## Dumping Covering Array

The `CoveringArray` object implements a custom `__str__` method, and therefore it can be easily converted into
a string representation similar to the format used in the [NIST covering array tables](https://math.nist.gov/coveringarrays/ipof/ipof-results.html).

For example,

```python
   print(CoveringArray(parameters, strength=2))
```

```bash
CoveringArray({'a': [0, 1], 'b': ['a', 'b'], 'c': [0, 1, 2], 'd': ['d0', 'd1']},2)[
6
a b c d
-------
0 b 2 d1
0 a 1 d0
1 b 1 d1
1 a 2 d0
0 b 0 d0
1 a 0 d1
]
```

## Combinations

The `combinations(iterable, r, with_replacement=False)` function can be used to calculate
all the `r-length` combinations of elements in a specified iterable.

For example,

```python
from testflows.combinatorics import combinations

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}

print(list(combinations(parameters.keys(), 2)))
```

```python
[('a', 'b'), ('a', 'c'), ('a', 'd'), ('b', 'c'), ('b', 'd'), ('c', 'd')]
```

> This function is equivalent to the standard library's [itertools.combinations](https://docs.python.org/3/library/itertools.html#itertools.combinations).

## Combinations With Replacement

You can calculate all combinations with replacement by setting the `with_replacement` argument to `True`.

For example,

```python
from testflows.combinatorics import combinations

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}

print(list(combinations(parameters.keys(), 2, with_replacement=True)))
```

```python
[('a', 'a'), ('a', 'b'), ('a', 'c'), ('a', 'd'), ('b', 'b'), ('b', 'c'), ('b', 'd'), ('c', 'c'), ('c', 'd'), ('d', 'd')]
```

> The `with_replacement=True` option is equivalent to the standard library's [itertools.combinations_with_replacement](https://docs.python.org/3/library/itertools.html#itertools.combinations_with_replacement).


## Cartesian Product

You can calculate all possible combinations of elements from different iterables using
the cartesian `product(*iterables, repeat=1)` function.

For example,

```python
from testflows.combinatorics import *

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}

print(list(product(parameters["a"], parameters["b"])))
```


```python
[(0, 'a'), (0, 'b'), (1, 'a'), (1, 'b')]
```

> This function is equivalent to the standard library's [itertools.product](https://docs.python.org/3/library/itertools.html#itertools.product).

## Permutations

The `permutations(iterable, r=None)` function can be used to calculate
the `r-length` permutations of elements for a given iterable.

> **{% attention %}** Permutations are different from `combinations`.
> In a combination, the elements don't have any order, but in a permutation, the order of elements is important.

For example,

```python
from testflows.combinatorics import *

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}

print(list(permutations(parameters.keys(), 2)))
```


```python
('a', 'b'), ('a', 'c'), ('a', 'd'), ('b', 'a'), ('b', 'c'), ('b', 'd'), ('c', 'a'), ('c', 'b'), ('c', 'd'), ('d', 'a'), ('d', 'b'), ('d', 'c')]
```

As we can see, both `('a', 'b')` and `('b', 'a')` elements are present.

> This function is equivalent to the standard library's [itertools.permutations](https://docs.python.org/3/library/itertools.html#itertools.permutations).

## Binomial Coefficients

You can calculate the binomial coefficient, which is the same as
the number of ways to choose `k` items from `n` items without repetition and without order.

Binomial coefficient is defined as

> {% katex %}\binom{n}{k} = \frac{n!}{k!(n-k)!}{% endkatex %}

when {% katex %}k <= n{% endkatex %}, and is zero when {% katex %}k > n{% endkatex %}.

For example,

```python
from testflows.combinatorics import *

print(binomial(4,2))
```

```python
6
```

which means that there are `6` ways to choose `2` elements out of `4`.

> This function is equivalent to the standard library's [math.comb](https://docs.python.org/3/library/math.html#math.comb).
