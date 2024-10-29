---
post: true
title: "Using Atomic Propositions and Equivalence Classes (Part 2)"
description: An article about how to apply atomic propositions and equivalence classes in testing a simple stateful system such as a memory function (part 2).
date: 2024-10-17
author: Vitaliy Zakaznikov
image: images/using-atomic-propositions-and-equivalence-classes-part2.png
icon: fas fa-glasses pt-5 pb-5
---

Building on the foundations from [Part 1 🛸](../using-atomic-propositions-and-equivalence-classes-part1), where we introduced atomic propositions and equivalence classes as mathematically rigorous techniques, this section will dive into applying these concepts in practice. Here, we’ll explore how to account for internal states, carefully select specific input values, and utilize a combinatorial sketch to cover all equivalence classes effectively.

Ready to dive deeper? Let’s continue our journey into advanced testing strategies!

<!-- more -->

# Taking into account system's internal states

The original definition of [input equivalence class partitions {%katex%} \mathcal{I} {%endkatex%}](../using-atomic-propositions-and-equivalence-classes-part1/#Equivalence-classes) (IECP) does not explicitly consider system state. This may seem counterintuitive, as one might expect a system in different states to respond differently to inputs within the same equivalence class. In other words, the behavior of some class {%katex%}EC_1{%endkatex%} when the system is in state {%katex%}s_1{%endkatex%} may not be the same as when {%katex%}EC_1{%endkatex%} is applied in {%katex%}s_2{%endkatex%}.

For example, let’s consider **Class 47** from the [table of equivalence classes](../using-atomic-propositions-and-equivalence-classes-part1/#Table-of-equivalence-classes) for the memory function, represented as a logical conjunction of the propositions:

> {%katex%}
p_1 \land p_{1a} \land p_2 \land p_{2a} \land p_3 \land p_{3a} \land \lnot p_{3b} \land \lnot p_{3c} \land p_4
{%endkatex%}

Decoded, **Class 47** indicates that:

- {%katex%} p_1 {%endkatex%}:
  `addr` is valid; {%katex%} p_{1a} {%endkatex%}:
  `addr` is set to value `A`.
- {%katex%} p_2 {%endkatex%}:
  `value` is valid; {%katex%} p_{2a} {%endkatex%}:
  `value` is set to value `V`.
- {%katex%} p_3 {%endkatex%}:
  `mode` is valid; {%katex%} p_{3a} {%endkatex%}:
  `'r'` is in `mode`; {%katex%} \lnot p_{3b} {%endkatex%}:
  `'w'` is **not** in `mode`; {%katex%} \lnot p_{3c} {%endkatex%}:
  `'e'` is **not** in `mode`.
- {%katex%} p_4 {%endkatex%}:
  `default` is valid.

This class specifies that we are attempting to read memory at address `A`, and the result will clearly depend on the current state of the memory, such as whether this address is uninitialized or already holds a previously set value.

## Considering to include state in the definition of {%katex%} \mathcal{I} {%endkatex%}

We could consider modifying the definition of {%katex%} \mathcal{I} {%endkatex%} to account for both the input and the internal state, without requiring separate sets of classes for each state:

> {%katex%}
\mathcal{I} = \left\{ \{(s, c) \in S \times D_I \mid \bigwedge_{p \in M} p[s, c] \land \bigwedge_{p \in AP_I - M} \neg p[s, c] \} \mid M \subseteq AP_I \right\} \backslash {\emptyset}
{%endkatex%}

In this modified definition:

* **{%katex%} S {%endkatex%}**: The set of all internal states.
* **{%katex%} D_I {%endkatex%}**: The domain of input variables.
* **{%katex%} (s, c) \in S \times D_I {%endkatex%}**: Represents the input {%katex%} c {%endkatex%} along with the current internal state {%katex%} s {%endkatex%}.
* **{%katex%} p[s, c] {%endkatex%}**: Evaluates an atomic proposition {%katex%} p {%endkatex%} given both the internal state {%katex%} s {%endkatex%} and the input {%katex%} c {%endkatex%}.

This modified IECP definition creates equivalence classes that group state-input pairs {%katex%} (s, c) {%endkatex%} based on their combined behavior, ensuring that inputs leading to different outcomes in different states are handled correctly.

However, modifying the original [equivalence class {%katex%} \mathcal{I} {%endkatex%}](../using-atomic-propositions-and-equivalence-classes-part1/#Equivalence-classes) definition may not be necessary, as equivalence classes should ideally focus on partitioning the input space independently of the system's internal states. This independence allows us to create equivalence classes that describe all possible input conditions without being specific to any internal state. Here are the main reasons why:

1. **State Independence**: Traditional IECP is designed to provide a global partition of inputs that applies universally, regardless of the internal state. This approach simplifies testing by focusing solely on the inputs and ensuring coverage of all possible input conditions without needing to consider internal behavior.

2. **State Explosion Complexity**: Including {%katex%} S \times D_I {%endkatex%} in the original IECP definition would significantly increase the number of equivalence classes by requiring state-specific input combinations. This could lead to a state explosion problem, making the testing process more complex and less efficient, especially in systems with many internal states.

3. **General Applicability**: By keeping IECP state-independent, the partitioning method remains applicable to a wide range of systems, including those where input behavior does not depend on the internal state. This versatility makes the original IECP more broadly useful.

Thus, even though the system’s behavior may vary across different internal states, it is not necessary to define separate equivalence classes for each state individually.

> "Traditional IECP is designed to provide a global partition of inputs that applies universally, regardless of the internal state."

# System's internal states

Even though equivalence classes provide a global partition of inputs, we still need to account for the system's internal states. Therefore, our next step is to determine the possible internal states of the memory function. Let’s calculate the potential number of states.

Each address can either hold a value or remain uninitialized, meaning there are {%katex%} V + 1 {%endkatex%} possible states for each address (where {%katex%} V {%endkatex%} represents the set of possible values). Since the states of each address are independent, the total number of possible states for the memory function is:

> {%katex%}
\text{Total\,States} = (V+1)^A
{%endkatex%}

For example, with:

* **Addresses ({%katex%} A {%endkatex%})**: Suppose we have 100 possible addresses.
* **Values ({%katex%} V {%endkatex%})**: Suppose there are 256 possible values (e.g., bytes from 0 to 255).

Then:

* {%katex%}
\text{Total\,States} = (V+1)^A = 257^{100}
{%endkatex%}

This result is astronomically large, making the total number of states practically infinite for testing purposes. We cannot reasonably test such a vast number of states, so an abstraction is necessary to focus on the core behavior. This is achieved by defining **abstract states** — broad states that summarize the essential conditions of the system, as we did in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model/#Determining-the-minimum-number-of-calls).

Our simplified model of the memory function, based on the following assumptions, reduces the complexity:

* All addresses are considered indistinct.
* The specific values stored are irrelevant.
* Overwriting previously stored values is significant.

With these assumptions, the system can exist in only three distinct abstract states:

* **State 0 (Uninitialized)**: No write operations have been performed.
* **State 1 (Initialized without Overwrites)**: At least one write operation has been performed to an uninitialized address, but no overwrites have occurred.
* **State 2 (Initialized with Overwrites)**: At least one overwrite operation has occurred (i.e., writing to an address that has already been written to).

Mathematically, we represent the set of possible abstract states as:

> {%katex%} S = \{ s_0, s_1, s_2 \} {%endkatex%}

Thus, we abstract the memory function to have only {%katex%} 3 {%endkatex%} internal states, which represent the core behavior of the system. We will need to test all equivalence classes in each of these abstract states.

# Selecting input values to build concrete equivalence classes

Before we can use the equivalence classes defined in the [Table: Equivalent Classes](../using-atomic-propositions-and-equivalence-classes-part1/#table-equivalent-classes), we need to define each atomic proposition concretely by assigning actual input values.

This involves reviewing combinations of [refined propositions](../using-atomic-propositions-and-equivalence-classes-part1/#Equivalence-classes-from-refined-propositions) and specifying them with precise input values.

## Concrete values for `addr` (address) input

First, we’ll select specific input values to satisfy combinations of {%katex%}p_1{%endkatex%} and {%katex%} p_{1a}{%endkatex%} related to the `addr` variable:

{% html div class="styled-table compact" %}

| {%katex%}\textbf p_1{%endkatex%} | {%katex%} \textbf p_{1a}{%endkatex%} | Description | Concrete Input Values |
|---|---|---|---|
| {%katex%}p_1{%endkatex%} | {%katex%}p_{1a}{%endkatex%} | addr is valid and is A | `addr`=1000 |
| {%katex%}p_1{%endkatex%} | {%katex%}\neg p_{1a}{%endkatex%} | addr is valid and is B (not A) | `addr`=2000 (not `1000`) | 
| {%katex%}\neg p_1{%endkatex%} | {%katex%}X{%endkatex%} | addr is invalid and value doesn't matter | `addr`=`None` (non-hashable) |

{% endhtml %}

## Concrete values for `value` input

Next, we’ll select specific input values to satisfy combinations of {%katex%}p_2{%endkatex%} and {%katex%} p_{2a}{%endkatex%} related to the `value` variable:

{% html div class="styled-table compact" %}

| {%katex%}\textbf p_2{%endkatex%} | {%katex%} \textbf p_{2a}{%endkatex%} | Description | Concrete Input Values |
|---|---|---|---|
| {%katex%}p_2{%endkatex%} | {%katex%}p_{2a}{%endkatex%} | value is valid and is V | `value`=`"hello"` |
| {%katex%}p_2{%endkatex%} | {%katex%}\neg p_{2a}{%endkatex%} | value is valid and is W (not V) | `value` = `"hello2"` (not `"hello"`) |

{% endhtml %}

## Concrete values for `mode` input

Next, we’ll select input values to satisfy combinations of {%katex%}p_3{%endkatex%}, {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%} related to the `mode` variable:

{% html div class="styled-table compact" %}

| {%katex%}\textbf p_3{%endkatex%} | {%katex%} \textbf p_{3a}{%endkatex%} | {%katex%} \textbf p_{3b}{%endkatex%} | {%katex%} \textbf p_{3c}{%endkatex%} | Description | Concrete Input Values |
|---|---|---|---|---|---|
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}p_{3c}{%endkatex%} | mode is valid and 'rwe' flags are set | `mode` = `"rwe"` |
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and 'rw' flags are set | `mode` = `"rw"` |
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%} p_{3c}{%endkatex%} | mode is valid and 're' flags are set | `mode` = `"re"` |
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and 'r' flags are set | `mode` = `"r"` |
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%} p_{3c}{%endkatex%} | mode is valid and 'we' flags are set | `mode` = `"we"` |
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and 'w' flags are set | `mode` = `"w"` |
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%} p_{3c}{%endkatex%} | mode is valid and 'e' flags are set | `mode` = `"e"` |
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and no flags are set | `mode` = `""` |
| {%katex%}\neg p_3{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | mode is invalid and flags don't care| `mode` = `None` (non-iterable) |

{% endhtml %}

## Concrete values for `default` input

Lastly, we can select a value for the `default` variable to satisfy {%katex%}p_4{%endkatex%}:

{% html div class="styled-table compact" %}

| {%katex%}\textbf p_4{%endkatex%} | Description | Concrete Input Value |
|---|---|---|
| {%katex%}p_4{%endkatex%} | default value is valid and exact value doesn't matter | `default` = `0` |

{% endhtml %}

With these concrete input values assigned to combinations of atomic propositions in {%katex%}AP=\{p_1,p_{1a},p_2,p_{2a},p_3,p_{3a},p_{3b},p_{3c},p_4\}{%endkatex%}, we are now ready to use the equivalence classes in an actual test.

# Implementing equivalence class testing using combinatorial sketch

With our selected input values forming concrete equivalence classes, we’re now ready to apply them to comprehensively test the memory function. How do we achieve this? By creating all possible combinations of these input values, we can generate test inputs that cover every equivalence class defined in the [Table: Equivalent Classes](../using-atomic-propositions-and-equivalence-classes-part1/#table-equivalent-classes).

The value sets for each variable — `addr`, `value`, `mode`, and `default` — are as follows:

> {%katex%} V_{addr} = \{1000, 2000, \text{None}\} \\ {%endkatex%}  
> {%katex%} V_{value} = \{"hello", "hello2"\} \\ {%endkatex%}  
> {%katex%} V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", \text{None}\} \\ {%endkatex%}  
> {%katex%} V_{default} = \{0\} \\ {%endkatex%}  

The set {%katex%} \mathcal{I_{inputs}} {%endkatex%}, which represents all **concrete input equivalence class partitions** (cIECP), is the Cartesian product of these sets:

> {%katex%}
\mathcal{I_{inputs}} = V_{addr} \times V_{value} \times V_{mode} \times V_{default}
{%endkatex%}

By **concrete**, we mean that each variable has been assigned specific values. Substituting these values into {%katex%} \mathcal{I_{inputs}} {%endkatex%}, we obtain:

> {%katex%}
\mathcal{I_{inputs}} = \{1000, 2000, \text{None}\} \times \{"hello", "hello2"\} \times \{"r", "w", "e", "rw", "re", "we", "rwe", "", \text{None}\} \times \{0\}
{%endkatex%}

Applying the Cartesian product, we get the complete set of test input combinations:

> {%katex%}
\mathcal{I_{inputs}} = \left\{ 
\begin{array}{l}
   \left(1000,\, \text{"hello"},\, \text{"r"},\, 0\right), \\
   \left(1000,\, \text{"hello"},\, \text{"w"},\, 0\right), \\
   \vdots \\
   \left(\text{None},\, \text{"hello2"},\, \text{None},\, 0\right) \\
\end{array} 
\right\}
{%endkatex%}

The total number of combinations in {%katex%} \mathcal{I_{inputs}} {%endkatex%}:

> {%katex%}
|\mathcal{I_{inputs}}| = 3 \times 2 \times 9 \times 1 = 54
{%endkatex%}

This yields 54 unique input combinations, as expected. Each tuple in {%katex%} \mathcal{I_{inputs}} {%endkatex%} represents an input vector that satisfies exactly one equivalence class in the [Table: Equivalent Classes](../using-atomic-propositions-and-equivalence-classes-part1/#table-equivalent-classes).

## Mapping input vectors back to equivalent classes

Let's map each input vector in {%katex%} \mathcal{I_{inputs}} {%endkatex%} to its corresponding equivalence class:

1. {%katex%} (1000, \text{"hello"}, \text{"r"}, 0) {%endkatex%} maps to the following combination of propositions:
  
   * {%katex%} 1000 \implies p_1, p_{1a} {%endkatex%} 
   * {%katex%} "hello" \implies p_2, p_{2a} {%endkatex%} 
   * {%katex%} "r" \implies p_3, p_{3a}, \neg p_{3b}, \neg p_{3c} {%endkatex%} 
   * {%katex%} 0 \implies p_4 {%endkatex%}
  
   Thus, {%katex%} \{ p_1, p_{1a}, p_2, p_{2a}, p_3, p_{3a}, \neg p_{3b}, \neg p_{3c}, p_4 \} = (True, True, True, True, True, True, False, False, True) = \text{Class 29} {%endkatex%}

2. {%katex%} (1000, \text{"hello"}, \text{"w"}, 0) {%endkatex%} maps to the following combination of propositions:
  
   * {%katex%} 1000 \implies p_1, p_{1a} {%endkatex%} 
   * {%katex%} "hello" \implies p_2, p_{2a} {%endkatex%} 
   * {%katex%} "w" \implies p_3, \neg p_{3a}, p_{3b}, \neg p_{3c} {%endkatex%} 
   * {%katex%} 0 \implies p_4 {%endkatex%}

   Thus, {%katex%} \{ p_1, p_{1a}, p_2, p_{2a}, p_3, \neg p_{3a}, p_{3b}, \neg p_{3c}, p_4 \} = (True, True, True, True, True, False, True, False, True) = \text{Class 43} {%endkatex%}

3. {%katex%} (\text{None}, \text{"hello2"}, \text{None}, 0) {%endkatex%} maps to the following combination of propositions:
  
   * {%katex%} \text{None} \implies \neg p_1, p_{1a} = \text{N/A} {%endkatex%} 
   * {%katex%} "hello2" \implies p_2, \neg p_{2a} {%endkatex%} 
   * {%katex%} \text{None} \implies \neg p_3, p_{3a} = \text{N/A}, p_{3b} = \text{N/A}, p_{3c} = \text{N/A} {%endkatex%} 
   * {%katex%} 0 \implies p_4 {%endkatex%}

   Thus, {%katex%} \{ \neg p_1, \text{N/A}, p_2, \neg p_{2a}, \neg p_3, \text{N/A}, \text{N/A}, \text{N/A}, p_4 \} = (False, \text{N/A}, True, False, False, \text{N/A}, \text{N/A}, \text{N/A}, True) = \text{Class 2} {%endkatex%}

Therefore, the mappings for {%katex%} \mathcal{I_{inputs}} {%endkatex%} are:

> {%katex%}
\mathcal{I_{inputs}} = \left\{ 
\begin{array}{l}
   \left(1000,\, \text{"hello"},\, \text{"r"},\, 0\right) = \text{Class 29}, \\
   \left(1000,\, \text{"hello"},\, \text{"w"},\, 0\right) = \text{Class 43}, \\
   \vdots \\
   \left(\text{None},\, \text{"hello2"},\, \text{None},\, 0\right) = \text{Class 2} \\
\end{array} 
\right\}
{%endkatex%}

## Combinatorial sketch

We’ve demonstrated that every possible combination of the selected inputs generates {%katex%}54{%endkatex%} unique input combinations, with each combination covering one of the defined equivalence classes.

Our inputs are:

> {%katex%} V_{addr} = \{1000, 2000, \text{None}\} \\ {%endkatex%}  
> {%katex%} V_{value} = \{"hello", "hello2"\} \\ {%endkatex%}  
> {%katex%} V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", \text{None}\} \\ {%endkatex%}  
> {%katex%} V_{default} = \{0\} \\ {%endkatex%}  

Using these inputs, we can easily implement a test to cover every equivalence class by employing [TestSketch](https://testflows.com/handbook/#Using-Sketches) and the [either() function](https://testflows.com/handbook/#Using-either), similar to our approach in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model). The only difference is that our equivalence classes compel us to include a few additional input values that may have been overlooked before. Other than that, the test implementation remains nearly identical.

The modified test is as follows:

```python
@TestSketch
def check_memory(self):
    """Test all equivalent classes in each internal state."""

    model = Model()
    behavior = []

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"check internal state transitions by applying inputs for each equivalence class"):
        for i in range(len(['s0','s1','s2'])):
            addr = either(*[1000, 2000, None], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*([mode for mode in valid_modes()] + ["", None]), i=f"mode-{i}")
            default = either(*[0], i=f"default-{i}")
            behavior.append(State(addr, value, mode, default))
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
            behavior[-1].error = exc
            check_result(r=r, exc=exc, behavior=behavior, model=model)
```

Again, note that we’ve specified possible values for each variable using the [either() function](https://testflows.com/handbook/#Using-either):

```python
addr = either(*[1000, 2000, None], i=f"addr-{i}")
value = either(*["hello", "hello2"], i=f"value-{i}")
mode = either(*([mode for mode in valid_modes()] + ["", None]), i=f"mode-{i}")
default = either(*[0], i=f"default-{i}")
```

This matches our selected values to build the equivalence classes defined using sets in mathematical notation:

> {%katex%}V_{addr} = \{1000,2000,None\} \\{%endkatex%}
> {%katex%}V_{value} =  \{"hello", "hello2"\} \\{%endkatex%}
> {%katex%}V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", None\} \\{%endkatex%}
> {%katex%}V_{default} = \{0\} \\{%endkatex%}

Here, the `valid_modes()` function simply computes all possible combinations of flags `r`, `w`, `e` and returns `['r', 'w', 'e', 'rw', 're', 'we', 'rwe']`. We then add "" (empty string) to cover the case where no flags are set, and None to cover the case when mode is invalid (non-iterable).

Let’s take the test program from [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model) and update to execute our modified
`check_memory` test:

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


# Combinatorial test that covers all the equivalence classes
# for each internal state s0, s1, and s2.
@TestSketch
def check_memory(self):
    """Test all equivalent classes in each internal state."""

    model = Model()
    behavior = []

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"applying inputs for each equivalence class for all internal states"):
        for i in range(len(['s0','s1','s2'])):
            addr = either(*[1000, 2000, None], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*([mode for mode in valid_modes()] + ["", None]), i=f"mode-{i}")
            default = either(*[0], i=f"default-{i}")
            behavior.append(State(addr, value, mode, default))
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
            behavior[-1].error = exc
            check_result(r=r, exc=exc, behavior=behavior, model=model)


@TestFeature
def feature(self):
    """Check memory function."""
    check_memory()


if main():
    feature()
```

If you execute the test, you’ll notice that it fails immediately on `pattern #8`. This is because our previous behavior model didn’t correctly calculate the expected behavior when the `mode` argument is invalid (non-iterable). This issue didn’t arise before because the original combinatorial test didn’t cover this scenario. It turns out there was a gap in our test coverage, which is now addressed by incorporating equivalence classes.

```python
Oct 28,2024 16:05:59       ⟥  Combination pattern #8
                                Test all equivalent classes in each internal state.
Oct 28,2024 16:05:59         ⟥  Given memory is erased, flags:MANDATORY|SETUP
               170us         ⟥⟤ OK memory is erased, /feature/check memory/pattern #8/memory is erased
Oct 28,2024 16:05:59         ⟥  Then applying inputs for each equivalence class for all internal states
               220us         ⟥    [note] memory(addr=1000,value=hello,mode=r,default=0) = (0, None)
               255us         ⟥    [debug] expect=expect_default_value, r=0, exc=None
               301us         ⟥    [note] memory(addr=1000,value=hello,mode=r,default=0) = (0, None)
               331us         ⟥    [debug] expect=expect_default_value, r=0, exc=None
               375us         ⟥    [note] memory(addr=1000,value=hello,mode=None,default=0) = (None, TypeError("argument of type 'NoneType' is not iterable"))
               513us         ⟥    Exception: TypeError: argument of type 'NoneType' is not iterable
               576us         ⟥⟤ Error applying inputs for each equivalence class for all internal states, /feature/check memory/pattern #8/applying inputs for each equivalence class for all internal states, TypeError
```

New combinations introduced by equivalence classes compel us to refine the behavior model. First, we need to update the model’s `expect_error` method to verify whether `current_state.mode` is iterable by checking if the `in` operator can be applied. This ensures that we correctly handle cases where `mode` is invalid (non-iterable), which was previously missed.

```python
    # fixed expect_error method to account for non-iterable mode
    def expect_error(self, behavior):
        """Expect error."""
        current_state = behavior[-1]

        try:
           "" in (current_state.mode) # check if mode is iterable
        except BaseException as err:
            return partial(expect_error, error=err)

        if not ("w" in current_state.mode or "r" in current_state.mode):
            return
        try:
            hash(current_state.addr)
        except BaseException as err:
            return partial(expect_error, error=err)
```

Second, we also need to update the `expect_stored_value` method to check if an error occurred in the current state and, if so, move on to the next one. This is necessary because if an error occurred, it indicates either that `mode` was invalid (non-iterable), meaning we can’t check for the presence of any flags, or that `addr` was invalid (non-hashable). Updating this method ensures that our model handles these cases accurately.

```python
    # fixed expect_stored_value method to check state error
    def expect_stored_value(self, behavior):
        """Expect stored value."""
        current_state = behavior[-1]

        default_value = current_state.default
        stored_value = default_value

        if not "r" in current_state.mode:
            return

        for state in behavior[:-1]:
            # check if state had an error because of
            # an invalid mode or address
            if state.error is not None:
                continue
            if "e" in state.mode:
                stored_value = default_value
            if (
                "w" in state.mode
                and state.addr == current_state.addr
            ):
                stored_value = state.value

        if stored_value != default_value:
            return partial(expect_stored_value, stored_value=stored_value)
```

## The final test program

With these fixes in place, here is the complete test program that uses an updated behavior model to account for the expected behavior of inputs in each equivalence class:

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

        try:
           "" in (current_state.mode)
        except BaseException as err:
            return partial(expect_error, error=err)

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
            if state.error is not None:
                continue
            if "e" in state.mode:
                stored_value = default_value
            if (
                "w" in state.mode
                and state.addr == current_state.addr
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


# Combinatorial test that covers all the equivalence classes
# for each internal state s0, s1, and s2.
@TestSketch
def check_memory(self):
    """Test all equivalent classes in each internal state."""

    model = Model()
    behavior = []

    with Given("memory is erased"):
        memory(addr=0, value=0, mode="e")

    with Then(f"applying inputs for each equivalence class for all internal states"):
        for i in range(len(['s0','s1','s2'])):
            addr = either(*[1000, 2000, None], i=f"addr-{i}")
            value = either(*["hello", "hello2"], i=f"value-{i}")
            mode = either(*([mode for mode in valid_modes()] + ["", None]), i=f"mode-{i}")
            default = either(*[0], i=f"default-{i}")
            behavior.append(State(addr, value, mode, default))
            r, exc = call_memory(addr=addr, value=value, mode=mode, default=default)
            behavior[-1].error = exc
            check_result(r=r, exc=exc, behavior=behavior, model=model)


@TestFeature
def feature(self):
    """Check memory function."""
    check_memory()


if main():
    feature()
```

Upon execution, you'll get the following output:

```python
Passing

✔ [ OK ] '/feature/check memory' (4m 30s)
✔ [ OK ] '/feature' (4m 30s)

1 feature (1 ok)
1 sketch (1 ok)
157464 combinations (157464 ok)
314928 steps (314928 ok)

Total time 4m 30s
```

This confirms that all {%katex%} 54 \times 54 \times 54 = 54^3 = 157,464 {%endkatex%} combinations were tested and passed. Here, remember that {%katex%} 54 {%endkatex%} represents the number of input vectors matching our {%katex%} 54 {%endkatex%} equivalence classes, and {%katex%} 3 {%endkatex%} represents the number of abstract internal states we need to cover.

# Conclusion

Using atomic propositions and equivalence classes has brought us closer to formal methods and introduced the mathematical rigor needed to elevate our testing to the next level. We examined formal mathematical notation and a formal definition of input equivalence class partitions (IECP), applying them to our memory function and bringing theory into practice. Leveraging our previous work in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model), we reused much of the code, including the behavior model. This approach shows that combinatorial testing aligns naturally with equivalence class testing, both requiring a model to compute expected results across thousands of combinations, providing near-exhaustive test coverage.

Achieving this level of rigor is no small feat, underscoring that testing and formal mathematics go hand-in-hand. Concepts from formal methods are essential knowledge for every tester dedicated to mastering their craft.

> "Concepts from formal methods are essential knowledge for every tester dedicated to mastering their craft."




