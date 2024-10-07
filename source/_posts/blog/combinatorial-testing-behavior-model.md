---
post: true
title: "Combinatorial Testing: Writing Behavior Model"
description: An article about how to write a simple behavior model to verify expected results of combinatorial tests for a memory function.
date: 2024-10-07
author: Vitaliy Zakaznikov
image: images/combinatorial-tests-writing-behavior-model.png
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

# Understanding the memory function

The `memory` function allows users to write or read values at specific addresses and erase all memory contents. Memory is managed by the `mem_` dictionary, which retains its contents between function calls. The `default` argument defines the value returned when no value has previously been stored at the specified address.

The `mode` argument controls the operation performed by the `memory` function and can include any combination of the following flags:

- `'r'` - Read a value from the specified address.
- `'w'` - Write a value to the specified address.
- `'e'` - Erase all memory contents.

The function only raises exceptions if the `addr` is a non-hashable value, resulting in a `TypeError`, since dictionary keys must be hashable.

When multiple mode flags are set (e.g., `'rwe'`), the operations are performed in a specific order: read first, then erase, and finally write. Since the `memory` function represents a stateful system, the sequence of user actions affects the results, making the order of actions important.

For example, attempting to read from a memory address before writing to it will return the default value, while writing first allows the correct value to be read later.

# Defining user actions

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

# Writing a combinatorial test

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

# Handling infinite combinations with representative values

How do we handle the fact that the number of ways a user can call the `memory` function is practically unlimited? The solution is to select "representative" valid values.

A "representative" value can be informally defined as a value that will produce the same behavior as other values sharing the same characteristics. For example, we can use the number `1000` as a representative value for `addr`, assuming that other integers used as `addr` will behave similarly. Furthermore, since `1000` is hashable, we can assume that other hashable objects will behave the same way.

Of course, these assumptions may or may not hold true. We could even test these assumptions by keeping all other arguments fixed while iterating over different values for a given argument assumed to belong to the same representation class. However, the number of representation classes depends on the number of potential failure modes, which we might not know in advance. Therefore, choosing the "right" representative values is not trivial, but we can start with some reasonable choices.

For example, we can select the following values:

- `addr`: Either `1000` or `2000`.
- `value`: Either `'hello'` or `'hello2'`.
- `mode`: Any of the 7 valid modes (`'r'`, `'w'`, `'e'`, `'rw'`, `'re'`, `'we'`, `'rwe'`).
- `default`: Either `0` or `None`.

Using these representative values, we can write a combinatorial test to explore all possible ways to execute the `memory` function. Additionally, we will go further and check all possible sequences of such calls, up to a specified `number_of_calls`.

# Sketching the test

Sketching such combinatorial tests using {% testflows %} is straightforward. We can use the [TestSketch] decorator along with the [either()] function as shown below:

```python
@TestSketch
def check_memory(self, number_of_calls):
    """Check sequence of memory calls."""

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check sequence of {number_of_calls} memory calls"):
        for i in range(number_of_calls):
            addr = either(*[1000, 2000], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*[mode for mode in valid_modes()], i=f"mode-{i}")
            default = either(*[0, None], i=f"default-{i}")
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
```

The test code above checks up to `number_of_calls` sequential memory calls, covering all possible ways to call the memory function each time. In this case, there are {%katex%}2 * 2 * 7 * 2 = 56{%endkatex%} possible ways to call the memory function based on our chosen values.

# First test program

Below is the first version of the test program that we can execute:

```python
from testflows.core import *
from testflows.combinatorics import combinations, product


# The memory function
def memory(addr, value=0, mode="r", default=0, mem_={}):
    """Read or write a value into memory at a given address.
    The mode is combination of flags, where 'r', for read, or 'w', for write,
    or 'e' for erase all, the default is 'r'."""
    _value = default
    if "r" in mode:
        _value = mem_.get(addr, _value)
    if "e" in mode:
        mem_.clear()
    if "w" in mode:
        mem_[addr] = value
    return _value


# Calculating all possible valid combinations of modes.
def valid_modes():
    """Return all possible valid combinations of modes."""
    flags = ["r", "w", "e"]

    for i in range(1, 4):
        modes = list(combinations(flags, i))
        for combination in modes:
            yield "".join(combination)


# Test steps for user actions
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


@TestStep(Given)
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


# Combinatorial sketch
@TestSketch
def check_memory(self, number_of_calls):
    """Check sequence of all possible valid combinations of memory calls."""

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check sequence of {number_of_calls} memory calls"):
        for i in range(number_of_calls):
            addr = either(*[1000, 2000], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*[mode for mode in valid_modes()], i=f"mode-{i}")
            default = either(*[0, None], i=f"default-{i}")
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)

# Test feature
@TestFeature
def feature(self):
    """Check memory function."""
    check_memory(number_of_calls=1)


if main():
    feature()
```

# First test program output

When executed, this test program produces the following output:

```bash
Passing

✔ [ OK ] '/feature/check memory' (46ms)
✔ [ OK ] '/feature' (49ms)

1 feature (1 ok)
1 sketch (1 ok)
56 combinations (56 ok)
112 steps (112 ok)

Total time 49ms
```

The output indicates that all `56` combinations were successfully executed without any failures.

The detailed test log for the first combination is below:

```
Oct 07,2024 13:30:11       ⟥  Combination pattern #0
                                Check sequence of all possible valid combinations of memory calls.
Oct 07,2024 13:30:11         ⟥  Given memory is erased, flags:MANDATORY|SETUP
               258us         ⟥⟤ OK memory is erased, /feature/check memory/pattern #0/memory is erased
Oct 07,2024 13:30:11         ⟥  Then check sequence of 1 memory calls
               203us         ⟥    [note] memory(addr=1000,value=hello,mode=r,default=0) = (0, None)
               251us         ⟥⟤ OK check sequence of 1 memory calls, /feature/check memory/pattern #0/check sequence of 1 memory calls
               880us       ⟥⟤ OK pattern #0, /feature/check memory/pattern #0
```

In this output:

* Combination pattern #0 represents the first of the 56 test combinations.
* The test starts by erasing the memory to ensure a clean state before proceeding.
* It then executes the memory call `memory(addr=1000, value=hello, mode=r, default=0)` and confirms the result is `(0, None)`— meaning the default value of 0 is returned, and no exception occurs.

The full log illustrates how each combination is executed in sequence, and provides a clear view of the memory operations and their outcomes. By exploring all `56` combinations, we ensure comprehensive coverage of different input scenarios for the memory function using our selected representative values.

# Increasing number of calls

To demonstrate how easy it is to extend our test program, we can increase the number of memory function calls to `2` by modifying the feature that calls the `check_memory` combinatorial sketch and passing `number_of_calls=2`:

```python
@TestFeature
def feature(self):
    """Check memory function."""
    check_memory(number_of_calls=2)
```

By executing this modified test program, we will observe that it now results in {%katex%}3136{%endkatex%} combinations being covered! This is calculated as `56` combinations for the first memory call multiplied by `56` combinations for the second memory call, giving us a total of:

{%katex%}56 \times 56 = 3136{%endkatex%} total combinations.

```bash
Passing

✔ [ OK ] '/feature/check memory' (4s 214ms)
✔ [ OK ] '/feature' (4s 217ms)

1 feature (1 ok)
1 sketch (1 ok)
3136 combinations (3136 ok)
6272 steps (6272 ok)

Total time 4s 217ms
```

This output demonstrates that increasing the number of sequential memory calls results in an exponential increase in the number of combinations covered, ensuring even more comprehensive test coverage. In this case, the test program executed `3136` different combinations, and all combinations passed successfully, giving us greater confidence in the correctness of the memory function for longer sequences of calls.

[TestSketch]: https://testflows.com/handbook/#Sketch
[either()]: https://testflows.com/handbook/#Using-either

# Determining the minimum number of calls

We have seen how easily we can adjust the length of the sequence of memory function calls. Now, it would be beneficial to determine the minimum number of calls needed to ensure comprehensive coverage of all possible system states.

To simplify our analysis, let's consider a simplified model of the `memory` function with the following assumptions:

1. All addresses are considered identical (indistinct).
2. The specific values stored are irrelevant.
3. Overwriting previously stored values is significant.

With these assumptions, we can represent the system in terms of **abstract states**—broad states that summarize the underlying conditions of the system. The simplified system can exist in only three distinct abstract states:

1. **State 0 (Uninitialized)**: No write operations have been performed.
2. **State 1 (Initialized without Overwrites)**: At least one write operation has been performed to an uninitialized address, but no overwrites have occurred.
3. **State 2 (Initialized with Overwrites)**: At least one overwrite operation has occurred (i.e., writing to an address that has already been written to).

Mathematically, we represent the set of possible system abstract states as \{%katex%} S = \{ s_0, s_1, s_2 \} {%endkatex%}, where each {%katex%} s_i {%endkatex%} corresponds to one of the abstract states above.

By applying the [Pigeonhole Principle](https://en.wikipedia.org/wiki/Pigeonhole_principle)—which states that if {%katex%} n {%endkatex%} items are placed into {%katex%} k {%endkatex%} containers, and {%katex%} n > k {%endkatex%}, then at least one container must contain more than one item—we conclude that after {%katex%} n = 3 {%endkatex%} operations (the number of unique abstract states {%katex%} |S| = 3 {%endkatex%}), any subsequent operation ({%katex%} n > 3 {%endkatex%}) must result in an abstract state that has already occurred, causing a repetition. Formally, since {%katex%} n_{\text{operations}} > |S| {%endkatex%}, an abstract state must repeat.

Thus, the minimum number of operations before the system abstract state repeats is:

{%katex%}
n_{\text{min}} = |S| = 3
{%endkatex%}

This understanding is crucial for effective testing and allows us to ensure that all possible combinations of representative values are tested using the fewest necessary operations. By ensuring that the number of operations {%katex%} n \geq n_{\text{min}} {%endkatex%}, we guarantee comprehensive coverage of all system abstract states, facilitating thorough verification and validation of the `memory` function's behavior.

The analysis shows that we need to set *number_of_calls* to `3`
and the total number of combinations using our chosen values is:

{%katex%}56 * 56 * 56 = 175616 {%endkatex%}.

# Introducing the behavior model

So far, our combinatorial test sketch was actually a dummy and did not check the returned value and exception after calling the `call_memory` action. To fix that, we need to write a behavior model that can calculate the expected result and exception for any possible combination of memory calls.

Conceptually, the behavior model needs to implement only the `expect` method, which takes the current behavior (i.e., the current sequence of states) and returns a function that takes the current result and exception and asserts if they are correct. The model's `expect` method should just contain an **or** expression that will select the expected user action with predefined values (using partial functions).

To implement the behavior model, we need to define two key classes: `State` and `Model`.

## State class

The `State` class must represent the state of the system at a given point in time and
is defined as follows:

```python
class State:
    def __init__(self, addr, value, mode, default, error=None) -> None:
        self.addr = addr
        self.value = value
        self.mode = mode
        self.default = default
        self.error = error

    def __str__(self) -> str:
        return f"State(addr={self.addr},value={self.value},mode={self.mode},default={self.default},error={self.error})"

```

Each `State` object captures the relevant parameters of a memory operation, including the address (`addr`), value (`value`), mode (`mode`), default value (`default`), and any error (`error`). These state objects are used to represent the sequence of operations that have been performed, forming the current system **behavior**.

## Model class

The `Model` class implements the behavior model of the memory function. It is responsible for determining the expected outcome of a memory operation based on the history of operations (i.e., the sequence of states). The class contains several methods to determine what should happen during the next memory operation based on the accumulated behavior.

* **`expect_error` Method**: This method checks if an error is expected based on the current state. For example, if the address is not hashable (e.g., a list), this method will predict that an error should be raised.

* **`expect_default_value` Method**: This method returns the default value if no write operation has modified the value at the specified address. It helps determine the expected output when a read operation is performed on an uninitialized memory address.

* **`expect_stored_value` Method**: This method checks if a previously stored value should be returned. It considers the impact of previous write operations and whether there have been any erase operations that would have cleared the memory.

* **`expect` Method**: This method determines the correct expectation by invoking one of the above methods, based on the current behavior. It uses an **or** expression to select the first valid expected outcome.

```python
class Model:
    """Behavior model of the memory function."""

    def expect_error(self, behavior):
        """Expect error."""
        current_state = behavior[-1]

        if not ("w" in current_state.mode or "r" in current_state.mode):
            return
        try:
            hash(current_state.addr)
        except BaseException as err:
            return partial(expect_error, error=err)

    def expect_default_value(self, behavior):
        """Expect default value."""
        current_state = behavior[-1]

        return partial(expect_default_value, default=current_state.default)

    def expect_stored_value(self, behavior):
        """Expect stored value."""
        current_state = behavior[-1]

        default_value = current_state.default
        stored_value = default_value

        if not "r" in current_state.mode:
            return

        for state in behavior[:-1]:
            if "e" in state.mode and not (
                "r" in state.mode and state.error is not None
            ):
                stored_value = default_value
            if (
                "w" in state.mode
                and state.addr == current_state.addr
                and state.error is None
            ):
                stored_value = state.value

        if stored_value != default_value:
            return partial(expect_stored_value, stored_value=stored_value)

    def expect(self, behavior):
        return (
            self.expect_error(behavior)
            or self.expect_stored_value(behavior)
            or self.expect_default_value(behavior)
        )
```

## Understanding the Expectation Methods

The order of methods in the expect method is important:

1. `expect_error`: The model first checks if an error should be expected for the current state, such as when an address is unhashable.
2. `expect_stored_value`: If no error is expected, the model then checks if a stored value should be returned based on prior operations.
3. `expect_default_value`: If no error or stored value applies, the model defaults to expecting the predefined default value.
The or expression ensures that the first applicable outcome is returned, which makes the model efficient and deterministic.

## Model Methods vs. User Actions

There is a clear distinction between the model's expect methods and the user actions that take place during testing:

The model's `expect_*` methods predict what should happen based on the sequence of operations. The corresponding user actions (test steps) are then used to verify that the actual behavior of the memory function matches the predicted behavior.
For example, the model's `expect_stored_value` method returns a partial `expect_stored_value` user action, which will be called later in the `check_result` action to assert that the observed behavior matches the expected behavior.

## Adding model to the test

Here is the modified version of the test that now uses the behavior model defined above. This version integrates the behavior model to automatically determine the expected results of each memory operation:

```python
@TestSketch
def check_memory(self, number_of_calls):
    """Check sequence of all possible valid combinations of memory calls."""
    model = Model() # behavior model
    behavior = [] # sequence of states

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check sequence of {number_of_calls} memory calls"):
        for i in range(number_of_calls):
            addr = either(*[1000, 2000], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*[mode for mode in valid_modes()], i=f"mode-{i}")
            default = either(*[0, None], i=f"default-{i}")
            # add the state to the current behavior
            behavior.append(State(addr, value, mode, default))
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
            # set current state's error, if any, to simplify model calculations
            behavior[-1].error = exc
            # check result against the model for the current behavior
            check_result(r=r, exc=exc, behavior=behavior, model=model)
```

The `check_result` function is defined as a test step to validate the result of the memory function call. It takes several parameters:

- `r`: The result of the memory operation.
- `exc`: The exception that was raised during the memory operation, if any.
- `behavior`: A list that stores the sequence of states representing the history of operations.
- `model`: The behavior model used to determine the expected outcome.

The function uses the behavior model to get the `expect` function, which will then be called to assert if the result (`r`) and the exception (`exc`) are correct.

```python
@TestStep(Then)
def check_result(self, r, exc, behavior, model):
    """Check result of the memory call."""
    expect = model.expect(behavior)
    debug(f"expect={expect.__name__}, r={r}, exc={exc}")
    expect(r=r, exc=exc)
```

# Complete test program

Below is the complete test program that uses the behavior model, which we can execute to validate the behavior of the `memory` function, checking if the results match the expected behavior for any given sequence of operations:

```python
from testflows.core import *
from testflows.combinatorics import combinations, product


# The memory function
def memory(addr, value=0, mode="r", default=0, mem_={}):
    """Read or write a value into memory at a given address.
    The mode is combination of flags, where 'r', for read, or 'w', for write,
    or 'e' for erase all, the default is 'r'."""
    _value = default
    if "r" in mode:
        _value = mem_.get(addr, _value)
    if "e" in mode:
        mem_.clear()
    if "w" in mode:
        mem_[addr] = value
    return _value


# Calculating all possible valid combinations of modes.
def valid_modes():
    """Return all possible valid combinations of modes."""
    flags = ["r", "w", "e"]

    for i in range(1, 4):
        modes = list(combinations(flags, i))
        for combination in modes:
            yield "".join(combination)


# Test steps for user actions
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


@TestStep(Given)
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


@TestStep(Then)
def check_result(self, r, exc, behavior, model):
    """Check result of the memory call."""
    expect = model.expect(behavior)
    debug(f"expect={expect.__name__}, r={r}, exc={exc}")
    expect(r=r, exc=exc)


# State class
class State:
    def __init__(self, addr, value, mode, default, error=None) -> None:
        self.addr = addr
        self.value = value
        self.mode = mode
        self.default = default
        self.error = error

    def __str__(self) -> str:
        return f"State(addr={self.addr},value={self.value},mode={self.mode},default={self.default},error={self.error})"


# Model class
class Model:
    """Behavior model of the memory function."""

    def expect_error(self, behavior):
        """Expect error."""
        current_state = behavior[-1]

        if not ("w" in current_state.mode or "r" in current_state.mode):
            return
        try:
            hash(current_state.addr)
        except BaseException as err:
            return partial(expect_error, error=err)

    def expect_default_value(self, behavior):
        """Expect default value."""
        current_state = behavior[-1]

        return partial(expect_default_value, default=current_state.default)

    def expect_stored_value(self, behavior):
        """Expect stored value."""
        current_state = behavior[-1]

        default_value = current_state.default
        stored_value = default_value

        if not "r" in current_state.mode:
            return

        for state in behavior[:-1]:
            if "e" in state.mode and not (
                "r" in state.mode and state.error is not None
            ):
                stored_value = default_value
            if (
                "w" in state.mode
                and state.addr == current_state.addr
                and state.error is None
            ):
                stored_value = state.value

        if stored_value != default_value:
            return partial(expect_stored_value, stored_value=stored_value)

    def expect(self, behavior):
        return (
            self.expect_error(behavior)
            or self.expect_stored_value(behavior)
            or self.expect_default_value(behavior)
        )


# Combinatorial sketch that uses the behavior model
@TestSketch
def check_memory(self, number_of_calls=3):
    """Check sequence of all possible valid combinations of memory calls."""

    model = Model()
    behavior = []

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check sequence of {number_of_calls} memory calls"):
        for i in range(number_of_calls):
            addr = either(*[1000, 2000], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*[mode for mode in valid_modes()], i=f"mode-{i}")
            default = either(*[0, None], i=f"default-{i}")
            behavior.append(State(addr, value, mode, default))
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
            behavior[-1].error = exc
            check_result(r=r, exc=exc, behavior=behavior, model=model)


@TestFeature
def feature(self):
    """Check memory function."""
    check_memory(number_of_calls=3)


if main():
    feature()
```

# Complete test program output

When executed, the complete test program produces the following output:

```bash
Passing

✔ [ OK ] '/feature/check memory' (5m 4s)
✔ [ OK ] '/feature' (5m 4s)

1 feature (1 ok)
1 sketch (1 ok)
175616 combinations (175616 ok)
351232 steps (351232 ok)

Total time 5m 4s
```

This output shows that we executed {%katex%}56 \times 56 \times 56 = 175616 {%endkatex%} combinations, covering all possible ways to execute a sequence of 3 memory function calls. Each combination is verified against the expected behavior as defined by the behavior model.

As an example, the detailed test log for the 189th combination is shown below:

```bash
Oct 07,2024 17:30:44       ⟥  Combination pattern #189
                                Check sequence of all possible valid combinations of memory calls.
                                Arguments
                                  number_of_calls
                                    3
Oct 07,2024 17:30:44         ⟥  Given memory is erased, flags:MANDATORY|SETUP
               170us         ⟥⟤ OK memory is erased, /feature/check memory/pattern #189/memory is erased
Oct 07,2024 17:30:44         ⟥  Then check sequence of 3 memory calls
               185us         ⟥    [note] memory(addr=1000,value=hello,mode=r,default=0) = (0, None)
               223us         ⟥    [debug] expect=expect_default_value, r=0, exc=None
               268us         ⟥    [note] memory(addr=1000,value=hello,mode=w,default=None) = (None, None)
               298us         ⟥    [debug] expect=expect_default_value, r=None, exc=None
               339us         ⟥    [note] memory(addr=1000,value=hello2,mode=rw,default=None) = ('hello', None)
               366us         ⟥    [debug] expect=expect_stored_value, r=hello, exc=None
               412us         ⟥⟤ OK check sequence of 3 memory calls, /feature/check memory/pattern #189/check sequence of 3 memory calls
               937us       ⟥⟤ OK pattern #189, /feature/check memory/pattern #189
Oct 07,2024 17:30:44       ⟥  Combination pattern #190

```

The log shows that we called the memory function 3 times as specified by the number_of_calls argument:

1. First Memory Call:

* The call attempts to read from the memory (`mode=r`).
* Since no previous value has been written to the specified address (`addr=1000`), the default value (`0`) is returned.
* The behavior model correctly computed the expected outcome as `expect_default_value`.

2. Second Memory Call:

* The call writes the value `"hello"` to the memory at address `1000` (`mode=w`).
* The expected outcome was to write successfully without an exception, resulting in (None, None).
* The behavior model correctly computed `expect_default_value` since it was a write operation without a read.

3. Third Memory Call:

* The call reads from and writes to memory in one operation (`mode=rw`). The value `"hello2"` is written, but it also reads from the memory address.
* The previously stored value `"hello"` (written during the second call) is returned.
* The behavior model correctly computed the outcome as `expect_stored_value`, indicating that the value stored earlier should be returned.

The log messages show debug information that provides insight into the behavior model's expectations for each call. Entries such as `[debug] expect=expect_default_value, r=0, exc=None` indicate the expected outcome calculated by the model (`expect_default_value`) and confirm that the actual result (`r=0`) and exception (`exc=None`) match the expected result.

The output confirms that the behavior model accurately predicted the expected results for all `3` memory operations in this combination. The model's predictions align perfectly with the actual outcomes, as evidenced by the `OK` status for each test step.

By executing `175616` combinations, we thoroughly validated the memory function across a wide range of input sequences, ensuring that all possible behaviors are correctly handled. This approach provides comprehensive coverage and confidence in the correctness of the implementation.

# Conclusion

Combinatorial testing is a powerful method for exhaustively verifying the behavior of systems. By building a behavior model, we addressed the "oracle problem"—the challenge of determining correct outcomes for every possible combination of inputs. By focusing on representative values and abstract states, we were able to reduce the number of combinations and limit the maximum length of memory function calls, while still ensuring comprehensive coverage of the system’s behavior.

The behavior model, designed to compute the correct outcomes for a sequence of operations, was invaluable for testing a stateful system like the memory function. It allowed us to verify the correct behavior for 175,616 combinations of three consecutive memory function calls. Although demonstrated with a simple system, this approach is scalable and adaptable to far more complex, real-world scenarios.

Ultimately, the combination of combinatorial testing and behavior models provides an efficient and systematic way to verify stateful systems, offering a level of test coverage and thoroughness that surpasses and can't be achieved using traditional methods.