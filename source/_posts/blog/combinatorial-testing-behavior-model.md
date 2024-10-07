---
post: true
title: "Combinatorial Testing: Writing Behavior Model"
description: An article about how to write a simple behavior model to verify expected results of combinatorial tests for a memory function.
date: 2024-08-06
author: Vitaliy Zakaznikov
image: images/combinatorial-tests-simple-behavior-model.png
icon: fas fa-glasses pt-5 pb-5
---

Combinatorial testing significantly increases the test coverage of software systems, achieving levels of thoroughness that are unattainable with traditional test suites focusing on individual scenarios or limited combinations of user actions. However, combinatorial testing introduces the notorious test oracle problem—how to determine or compute the expected behavior for every possible combination of user actions.

The survey ["The Oracle Problem in Software Testing: A Survey"](https://web.eecs.umich.edu/~weimerw/481/readings/testoracles.pdf) provides an excellent overview of this issue, highlighting that deriving or even knowing the correct outcomes for complex combinations is often not straightforward. A common approach to solve this is by developing a behavior model that can compute expected outcomes for given system behaviors. Yet, many testers have never encountered the oracle problem, as they primarily deal with single combination tests. Fewer still have created or even understand what a behavior model entails.

To demystify behavior models, we will explore the development of such a model for a simple stateful system: a memory function that allows users to write, read, or erase data. We'll illustrate how to apply combinatorial testing to this function and develop a behavior model from scratch to verify expected results.<!-- more -->

# The memory function

To illustrate the approach, we’ll use a memory function as our system under test. This system is straightforward to understand, yet the technique is easily adaptable to more complex, real-world systems.

<img src="/images/memory-function-diagram.png" max-width="100%" height="500px" style="display:block; margin:auto">

In Python, we'll define the `memory` function as follows:

```python
def memory(addr, value=0, mode="r", default=0, mem_={}):
    """Read or write a value into memory at a given address.
    The mode is a combination of flags: 'r' for read, 'w' for write,
    or 'e' for erase all. The default mode is 'r'."""
    _value = default
    if "r" in mode:
        _value = mem_.get(addr, _value)
    if "e" in mode:
        mem_.clear()
    if "w" in mode:
        mem_[addr] = value
    return _value
```

## Understanding the Memory Function

The `memory` function allows users to write or read values at specific addresses and erase all memory contents. Memory is managed by the `mem_` dictionary, which retains its contents between function calls. The `default` argument defines the value returned when no value has previously been stored at the specified address.

The `mode` argument controls the operation performed by the `memory` function and can include any combination of the following flags:

- `'r'` - Read a value from the specified address.
- `'w'` - Write a value to the specified address.
- `'e'` - Erase all memory contents.

The function only raises exceptions if the `addr` is a non-hashable value, resulting in a `TypeError`, since dictionary keys must be hashable.

When multiple mode flags are set (e.g., `'rwe'`), the operations are performed in a specific order: read first, then erase, and finally write. Since the `memory` function represents a stateful system, the sequence of user actions affects the results, making the order of actions important.

For example, attempting to read from a memory address before writing to it will return the default value, while writing first allows the correct value to be read later.

## Defining user actions

Whether or not one uses combinatorial testing techniques, explicitly defining all possible user actions is crucial for effectively testing any system.

What are the possible user actions for the `memory` function? Here is the complete list:

1. The user can call the `memory` function with specific arguments.
2. The user can expect to receive a default value.
3. The user can expect to receive a stored value.
4. The user can expect to encounter an error, such as a `TypeError` exception
   when the `addr` is non-hashable.

The last three actions can generally be categorized as "checking the result." However, the action of "checking the result" is too generic. To thoroughly test the correct behavior of the `memory` function, each expectation must be explicitly identified.

Note that we have kept the action of calling the `memory` function generic, rather than breaking it into separate actions based on specific combinations of arguments. This is because we aim to explore as many argument combinations as possible during testing.

Below is the definition of these actions in code, where each action is represented as a test step:

```python
@TestStep(Then)
def expect_default_value(self, r, exc, default):
    """Expect default value."""
    assert exc is None, f"unexpected exception: {exc}"
    assert r == default, f"'{r}' did not match expected default value '{default}'"


@TestStep(Then)
def expect_stored_value(self, r, exc, stored_value):
    """Expect stored value."""
    assert exc is None, f"unexpected exception: {exc}"
    assert (
        r == stored_value
    ), f"'{r}' did not match expected stored value '{stored_value}'"


@TestStep(Then)
def expect_error(self, r, exc, error):
    """Expect error."""
    assert r is None, f"unexpected result: {r}"
    assert str(exc) == str(error), f"expected exception '{error}' but got '{exc}'"


@TestStep(When)
def call_memory(self, addr, value, mode, default):
    """Call memory function."""
    r = None
    exc = None
    try:
        r = memory(addr=addr, value=value, mode=mode, default=default)
    except BaseException as err:
        exc = err
    finally:
        note(
            f"memory(addr={addr},value={value},mode={mode},default={default}) = {r, exc}"
        )
    return r, exc
```

It is important to note that the library of user actions can be built incrementally. This approach is crucial for real-world systems, where the complete list of user actions may not be clear at the project's outset. However, it is also important to recognize that failing to identify possible user actions will inevitably result in gaps in test coverage.

## Writing a combinatorial test

With the user action steps defined, we could write a number of simple tests to start verifying different functionalities. However, how many tests do we really need? Many testers don't even consider this question, and after writing ten, twenty, or perhaps hundred tests, they often assume that is sufficient.

To determine how many tests are truly needed, we first have to calculate the number of ways a user can call the `memory` function. Next, we need to consider the length of the sequence of calls that users can make and determine the minimum sequence length before we start seeing repeated behaviors in the system.

To calculate the number of ways a user can call the `memory` function, we need to identify all possible values for each argument that the `memory` function accepts and multiply these possibilities together.

Specifically, we need to know all possible values for:

- `addr`
- `value`
- `mode`
- `default`

The number of possible valid values for the `addr`, `value`, and `default` arguments is effectively unlimited from a practical perspective because:

- `addr` can be any hashable object.
- `value` can be any object.
- `default` can be any object.

On the other hand, the number of possible valid values for the `mode` argument can be calculated as follows:

```python
from testflows.combinatorics import combinations

def valid_modes():
    """Return all possible valid combinations of modes."""
    flags = ["r", "w", "e"]

    for i in range(1, 4):
        modes = list(combinations(flags, i))
        for combination in modes:
            yield "".join(combination)
```

This results in the following list of possible `mode` values:

```python
['r', 'w', 'e', 'rw', 're', 'we', 'rwe']
```

This list is derived from {%katex%}C(3,1) + C(3,2) + C(3,3){%endkatex%}, where {%katex%}C(n, k){%endkatex%} represents the number of ways to choose `k` unordered elements from `n` elements. In our case, `n` is `3`, corresponding to the valid flags (`r`, `w`, `e`), and we are choosing up to `3` elements.

The {%katex%}C(n, k){%endkatex%} calculation can be done using the `combinations` function from Python's `itertools` standard module, or alternatively, you can import it from the `testflows.combinatorics` module for convenience.

The number of possible valid values for the `mode` argument is `7`, resulting in the following possible values for each argument:

- `addr`: Any hashable object.
- `value`: Any object.
- `mode`: One of 7 possible values (`'r'`, `'w'`, `'e'`, `'rw'`, `'re'`, `'we'`, `'rwe'`).
- `default`: Any object.

There are also numerous invalid `mode` values or values that are partially valid, such as the string `'write me a letter'`, which would be treated as `'rwe'` due to containing all the valid flags. However, for simplicity, we will focus only on the valid values.

## Handling infinite combinations with representative values

How do we handle the fact that the number of ways a user can call the `memory` function is practically unlimited? The solution is to select "representative" valid values.

A "representative" value can be informally defined as a value that will produce the same behavior as other values sharing the same characteristics. For example, we can use the number `1000` as a representative value for `addr`, assuming that other integers used as `addr` will behave similarly. Furthermore, since `1000` is hashable, we can assume that other hashable objects will behave the same way.

Of course, these assumptions may or may not hold true. We could even test these assumptions by keeping all other arguments fixed while iterating over different values for a given argument assumed to belong to the same representation class. However, the number of representation classes depends on the number of potential failure modes, which we might not know in advance. Therefore, choosing the "right" representative values is not trivial, but we can start with some reasonable choices.

For example, we can select the following values:

- `addr`: Either `1000` or `2000`.
- `value`: Either `'hello'` or `'hello2'`.
- `mode`: Any of the 7 valid modes (`'r'`, `'w'`, `'e'`, `'rw'`, `'re'`, `'we'`, `'rwe'`).
- `default`: Either `0` or `None`.

Using these representative values, we can write a combinatorial test to explore all possible ways to execute the `memory` function. Additionally, we will go further and check all possible sequences of such calls, up to a specified `number_of_actions`.

## Sketching the test

Sketching such combinatorial tests using {% testflows %} is straightforward. We can use the [TestSketch] decorator along with the [either()] function as shown below:

```python
@TestSketch
def check_memory(self, number_of_actions):
    """Check sequence of memory calls."""

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check sequence of {number_of_actions} memory calls"):
        for i in range(number_of_actions):
            addr = either(*[1000, 2000], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*[mode for mode in valid_modes()], i=f"mode-{i}")
            default = either(*[0, None], i=f"default-{i}")
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
```

The test code above checks up to `number_of_actions` sequential memory calls, covering all possible ways to call the memory function each time. In this case, there are {%katex%}2 * 2 * 7 * 2 = 56{%endkatex%} possible ways to call the memory function based on our chosen values.

[TestSketch]: https://testflows.com/handbook/#Sketch
[either()]: https://testflows.com/handbook/#Using-either


