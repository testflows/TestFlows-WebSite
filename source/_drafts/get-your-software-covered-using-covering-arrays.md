---
title: Get Your Software Covered Using Covering Arrays
description: Article about how TestFlows enables using covering arrays as part of combinatorial testing
date: 2023-09-28
author: Vitaliy Zakaznikov
image:
   asset: images/covering-arrays.png
icon: fas fa-glasses pt-5 pb-5
---

For any non-trivial number of parameters, exhaustively testing all possibilities is not feasible.
For example, if we have `10` parameters (`k=10`) that each have `10` possible values (`v=10`), the
number of all possibilities is {% katex %}v^k=10^{10} = {10}_{billion}{% endkatex %}, thus requiring 10 billion tests for complete coverage <!-- more -->.

Given that exhaustive testing might not be practical, a covering array could give us a much smaller
number of tests if we choose to check all possible interactions only between some fixed number
of parameters at least once, where an interaction is some specific combination, where order does not matter,
of some `t` number of parameters, covering all possible values that each selected parameter could have.

The US National Institute of Standards and Technology's (NIST) has excellent [Introduction to Covering Arrays](https://math.nist.gov/coveringarrays/coveringarray.html) page, if you are not familiar with them.

**{% testflows %}** provides a `CoveringArray` class to allow you to calculate a covering array
for some `k` parameters having the same or different number of possible values. The class uses [IPOG], an in-parameter-order algorithm as described in [IPOG: A General Strategy for T-Way Software Testing] by Yu Lei et al.

The `CoveringArray(parameters, strength=2)` is provided by `testflows.combinatorics`, and takes the following arguments:

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

# Checking Covering Array

The `CoveringArray.check()` function can be used to verify that the tests
inside the covering array cover all possible `t-way` interactions at least once and thus
meet the definition of a covering array.

For example,

```python
from testflows.combinatorics import CoveringArray

parameters = {"a": [0, 1], "b": ["a", "b"], "c": [0, 1, 2], "d": ["d0", "d1"]}
tests = CoveringArray(parameters, strength=2)

print(tests.check())
```

# Dumping Covering Array

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

[IPOG]: https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=1362e14b8210a766099a9516491693c0c08bc04a
[IPOG: A General Strategy for T-Way Software Testing]: https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=1362e14b8210a766099a9516491693c0c08bc04a
