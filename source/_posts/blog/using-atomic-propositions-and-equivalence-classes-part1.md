---
post: true
title: "Using Atomic Propositions and Equivalence Classes (Part 1)"
description: An article about how to apply atomic propositions and equivalence classes in testing a simple stateful system such as a memory function (part 1).
date: 2024-10-17
author: Vitaliy Zakaznikov
image: images/using-atomic-propositions-and-equivalence-classes-part1.png
icon: fas fa-glasses pt-5 pb-5
---

Atomic propositions and equivalence classes offer a practical solution for making testing manageable when dealing with large or infinite input domains. While these concepts are widely used in formal verification—such as in [Exhaustive Model-Based Equivalence Class Testing by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4), from which we'll borrow the formal definition of equivalence classes—they are extremely useful in everyday testing tasks.

In this two-part post, we explore how atomic propositions and equivalence classes help us select "representative values" when input spaces are large. These representative values group inputs that behave equivalently, enabling thorough system testing without needing to cover every possible input within each group. Given that atomic propositions and equivalence classes are commonly used in formal verification, we also delve into the formal mathematical notation that defines these concepts.

<!-- more -->

Let's start by defining what atomic propositions are, how they relate to equivalence classes, and why they always go hand-in-hand.

# Atomic propositions and equivalence classes

**Atomic propositions** and **equivalence classes** are closely related concepts. Atomic propositions are logical statements that evaluate to either true or false based on the current state of the system. Equivalence classes, on the other hand, are partitions of the input space where all inputs in the same class are expected to produce the same system behavior.

## Atomic propositions

> "Atomic propositions are logical statements that evaluate to either true or false, based on the current state of the system."

Each atomic proposition describes a condition on the system's variables, which make up the state of the system, such as a specific range or threshold. For example, in an industrial heating system, an atomic proposition could define a condition where a temperature value is greater than 100°C. Such atomic propositions are used to define **equivalence classes**: inputs that make the proposition true belong to one class, while inputs that make the proposition false belong to another.

For instance, if we have an atomic proposition like:

> {%katex%} p_1: \text{Temperature} > 100 {%endkatex%}

Then, the corresponding equivalence classes are:

- **Class 1**: Inputs where {%katex%} p_1 {%endkatex%} is **true** (temperature is greater than 100°C).
- **Class 2**: Inputs where {%katex%} p_1 {%endkatex%} is **false** (temperature is less than or equal to 100°C).

By using multiple atomic propositions, we can create a more granular partition of the input space. For example, consider the atomic propositions:

> - {%katex%} p_1: \text{Temperature} > 100 {%endkatex%}
> - {%katex%} p_2: \text{Pressure} < 50 {%endkatex%}

These atomic propositions define four equivalence classes:

- **Class 1**: {%katex%} p_1 {%endkatex%} is true and {%katex%} p_2 {%endkatex%} is true
- **Class 2**: {%katex%} p_1 {%endkatex%} is true and {%katex%} p_2 {%endkatex%} is false
- **Class 3**: {%katex%} p_1 {%endkatex%} is false and {%katex%} p_2 {%endkatex%} is true
- **Class 4**: {%katex%} p_1 {%endkatex%} is false and {%katex%} p_2 {%endkatex%} is false

Each equivalence class represents a distinct combination of true/false values for the atomic propositions, effectively reducing the input space to a set of classes where system behavior is expected to be equivalent.

## Equivalence classes

Equivalence classes defined by atomic propositions partition the input space into groups where inputs are expected to behave similarly. By testing combinations of representative inputs from each class, we can reduce the number of combinations that need to be checked, assuming equivalent behavior for all inputs within the same class. This approach is especially useful when it’s not feasible to check all possible combinations due to the large or infinite cardinality (the number of unique values) of inputs.

> "Therefore, **equivalence classes** allow for the **reduction of the number of combinations** that need to be checked."

To illustrate how we can use atomic propositions and equivalence classes, we’ll again use a memory function as our system under test, which we explored in the [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model) post.

However, before we start applying atomic propositions and equivalence classes to a real system under test, let's take a more formal approach and define these concepts more precisely using the formal mathematical notation commonly found in scientific papers related to formal methods.


# Definition of atomic propositions ({%katex%} AP {%endkatex%})

Let {%katex%} p_1, p_2, \dots, p_k {%endkatex%} be atomic propositions that describe various properties of the system. The set {%katex%} AP {%endkatex%} is the collection of all these atomic propositions:

> {%katex%} 
AP = \{ p_1, p_2, \dots, p_k \} 
{%endkatex%}

In Python, we can represent this definition as follows:

```python
# 'set' is a collection of unordered unique elements 
AP = set([p_1, p_2, ..., p_k])
```

> Remember that an atomic proposition is a logical statement that evaluates to either true
  or false. For example:
> {%katex%} p_1: \text{Temperature} > 100 {%endkatex%}

Each {%katex%} p_i {%endkatex%} is an atomic proposition that evaluates to **true** or **false** based on the values of the system's variables in a particular state {%katex%} s {%endkatex%}. Thus, for any {%katex%} p_i {%endkatex%}, we have:

> {%katex%} 
p_i : \varphi_i(s(v_1), s(v_2), \dots, s(v_n)) \in \{ \text{true}, \text{false} \} 
{%endkatex%}

where:
- {%katex%} s {%endkatex%} is the current state of the system,
- {%katex%} v_1, v_2, \dots, v_n {%endkatex%} are the variables of the system,
- {%katex%} \varphi_i {%endkatex%} is a logical condition on these variables that defines {%katex%} p_i {%endkatex%}.

In Python, each atomic proposition can be thought of as a function that returns either a `True` or `False` boolean value:

```python
# Define atomic proposition p_i as a function of system state s(v1), s(v2), ..., s(vn)
def p_i(s_v1: Any, s_v2: Any, *args: Any) -> bool:
    # Define the logical condition φ_i(s(v1), s(v2), ..., s(vn))
    φ_i = some_condition_based_on(s_v1, s_v2, *args)
    
    # Return the boolean result of φ_i
    return φ_i
```

Now, let's break the set of atomic propositions {%katex%} AP {%endkatex%} into separate components based on **input** variables, **model** (internal) variables, and **output** variables, and redefine {%katex%} AP {%endkatex%} as follows:

> {%katex%} 
AP = AP_I \cup AP_M \cup AP_O 
{%endkatex%}

where:
- {%katex%} AP_I {%endkatex%} is the set of atomic propositions that relate to
  **input** variables.
- {%katex%} AP_M {%endkatex%} is the set of atomic propositions that relate to
  **model** (internal) variables.
- {%katex%} AP_O {%endkatex%} is the set of atomic propositions that relate to
  **output** variables.

In Python, {%katex%} AP {%endkatex%} can be represented as a list that includes all atomic propositions, which we can split into three separate lists for input, model, and output variables, respectively:

```python
# Define the lists for AP_I, AP_M, and AP_O
AP_I = [...]  # Replace with atomic propositions related to input variables
AP_M = [...]  # Replace with atomic propositions related to model variables
AP_O = [...]  # Replace with atomic propositions related to output variables

# Combine the lists and convert to a set to ensure uniqueness
AP = set(AP_I + AP_M + AP_O)
```

Since we are performing black box testing, this decomposition of {%katex%} AP {%endkatex%} is very convenient. We can define atomic propositions related only to {%katex%} AP_I {%endkatex%} (input) and {%katex%} AP_O {%endkatex%} (output), as we may not have access to the internals of the implementation to know the {%katex%} AP_M {%endkatex%} (model) variables.


# Definition of Equivalence classes {%katex%} \mathcal{I} {%endkatex%}

We can informally define equivalent classes as a group of inputs that
produce equivalent system behavior. A formal definition can be taken
from the paper [Exhaustive Model-Based Equivalence Class Testing by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4), where
input equivalence class partitions (IECP) are defined as follows:

> {%katex%}
\mathcal{I} = \left\{ \left\{ c \in D_I \mid \bigwedge_{p \in M} p[x/c] \land \bigwedge_{p \in AP_I - M} \neg p[x/c] \right\} \mid M \subseteq AP_I \right\} \setminus \{\emptyset\}
{%endkatex%}

Where:
- **{%katex%} D_I {%endkatex%}**: The domain of input variables.
- **{%katex%} p[x/c] {%endkatex%}**: An atomic proposition {%katex%} p {%endkatex%} evaluated with the input variable {%katex%} c {%endkatex%} substituted for {%katex%} x {%endkatex%}. This means that the proposition {%katex%} p {%endkatex%} is evaluated based on the current value of the input variable.
- **{%katex%} M \subseteq AP_I {%endkatex%}**: A subset of the atomic propositions from {%katex%} AP_I {%endkatex%}, the set of atomic propositions related to input variables.
- **{%katex%} \wedge {%endkatex%}**: Logical AND operator that requires all atomic propositions in {%katex%} M {%endkatex%} to be true.
- **{%katex%} \neg p[x/c] {%endkatex%}**: Negation of atomic proposition {%katex%} p {%endkatex%}, meaning the proposition is false.
- **{%katex%} \setminus \{\emptyset\} {%endkatex%}**: Removes empty sets, ensuring that we don't include cases where no states match.

The expression {%katex%} M \subseteq AP_I {%endkatex%} means that {%katex%} M {%endkatex%} is a subset of {%katex%} AP_I {%endkatex%}, but we consider **all possible subsets** {%katex%} M {%endkatex%}, therefore {%katex%} M {%endkatex%} represents elements from the **powerset** of {%katex%} AP_I {%endkatex%}.

To clarify:

- The expression {%katex%} M \subseteq AP_I {%endkatex%} means that {%katex%} M {%endkatex%} is any subset of {%katex%} AP_I {%endkatex%}.
- Given that we are considering all possible values of {%katex%} M {%endkatex%}, we are essentially looking at the **powerset** {%katex%} \mathcal{P}(AP_I) {%endkatex%}, which includes all subsets of {%katex%} AP_I {%endkatex%}, including the empty set and {%katex%} AP_I {%endkatex%} itself.

Thus, when you're iterating over all possible subsets {%katex%} M \subseteq AP_I {%endkatex%}, you're effectively iterating over the **powerset** {%katex%} \mathcal{P}(AP_I) {%endkatex%}.

In Python, we can calculate a powerset as follows:

```python
# Define the original set (as a list, set, or tuple)
AP_I = ['p1', 'p2', 'p3']

# Calculate the powerset
powerset = []
for r in range(len(AP_I) + 1):  # Iterate over all subset sizes (0 to len(AP_I))
    powerset.extend(combinations(AP_I, r)) # Generate all subsets (combinations) of size r from AP_I
```

We can simplify the definition and remove {%katex%}D_I{%endkatex%}
so that we can only focus on the equivalence classes without specifying
values for the input variables. Removing {%katex%}D_I{%endkatex%},
we get a simplified expression:

> {%katex%}
\mathcal{I} = \left\{ \bigwedge_{p \in M} p(x) \land \bigwedge_{p \in AP_I - M} \neg p(x) \mid M \subseteq AP_I \right\}  \setminus \{\emptyset\}
{%endkatex%}

Where:
- **{%katex%} p(x) {%endkatex%}**: An atomic proposition {%katex%} p {%endkatex%} evaluated based on the values of input variables {%katex%} x {%endkatex%}.
- **{%katex%} \neg p(x) {%endkatex%}**: Negation of atomic proposition {%katex%} p {%endkatex%}, meaning the proposition is false.

# Simplified {%katex%} \mathcal{I} {%endkatex%} is just a Cartesian product

Even though the simplified version of {%katex%}\mathcal{I}{%endkatex%} still looks intimidating,

> {%katex%} \left\{ \bigwedge_{p \in M} p(x) \land \bigwedge_{p \in AP_I - M} \neg p(x) \mid M \subseteq AP_I \right\} {%endkatex%}

it is equivalent to a Cartesian product of all possible true and false values for each atomic proposition in the set {%katex%} AP_I {%endkatex%}. Each atomic proposition {%katex%} p_i \in AP_I {%endkatex%} can either be true, represented as 

> {%katex%} p_i(x) {%endkatex%}

or false, represented as 

> {%katex%} \neg p_i(x) {%endkatex%}

The set of all possible combinations of these truth values is effectively the Cartesian product of the two possible states for each atomic proposition:

> {%katex%} \left\{ [p_1(x), \neg p_1(x)] \times [p_2(x), \neg p_2(x)] \times \dots \times [p_n(x), \neg p_n(x)] \right\} {%endkatex%}

This Cartesian product represents all possible subsets {%katex%} M \subseteq AP_I {%endkatex%}, where for each subset {%katex%} M {%endkatex%}, the propositions in {%katex%} M {%endkatex%} are true, and those not in {%katex%} M {%endkatex%} are false. By evaluating the truth of the propositions for all possible subsets {%katex%} M {%endkatex%}, we generate all possible truth value assignments across the set of atomic propositions.

# The memory function

Let's use a simple memory function as an example to demonstrate the application of atomic propositions and equivalence classes in a practical context. This memory function will allow us to see how these concepts work together in organizing and testing input scenarios based on expected behaviors.


<img class="img-fluid" src="/images/memory-function-diagram.png" height="500px" style="display:block; margin:auto">

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

# Atomic propositions for input variables ({%katex%} AP_I{%endkatex%}) of the memory function

Defining atomic propositions for a real-world black-box tested software system is not easy. A tester must be able to break down the system's inputs into the simplest, indivisible conditions that affect the system's behavior (the output or the internal state). The focus must always be on behavior-causing differences. If the system has internal states, like our memory function, then differences in behavior must be considered for each state.

> "Focus on behavior-causing differences."

An iterative approach works best. Start with high-level atomic propositions and refine them as needed, keeping the focus on behavior-causing differences.


## High-level atomic propositions

If you don't know where to start, it always helps to start with simple propositions that state the validity of each input variable. After all, we do expect that each input must have some valid value and we do expect that valid input should cause differences in system behavior as compared to invalid input.

Therefore, we can define the following high-level atomic propositions for each input variable (`addr`, `value`, `mode`, `default`):

> * {%katex%} p_1 {%endkatex%}: `addr` is valid
> * {%katex%} p_2 {%endkatex%}: `value` is valid
> * {%katex%} p_3 {%endkatex%}: `mode` is valid
> * {%katex%} p_4 {%endkatex%}: `default` is valid

Having a set of our four simple high-level atomic propositions in hand, we can use them to define the equivalence classes that correspond to these propositions using the [definition {%katex%} \mathcal{I} {%endkatex%}](#Simplified-is-just-a-Cartesian-product). There are {%katex%} 2^n {%endkatex%} classes where {%katex%} n {%endkatex%} is the number of propositions. In our case, we have {%katex%} 4 {%endkatex%} propositions, which gives us {%katex%} 2^4=16 {%endkatex%} classes.

{% html div class="styled-table compact" %}

|    |   |   |   |   |
|:---|---:|---:|---:|---:|
| **Class**   | {%katex%} \textbf p_1 {%endkatex%} | {%katex%} \textbf p_2 {%endkatex%} | {%katex%} \textbf p_3 {%endkatex%} | {%katex%} \textbf p_4 {%endkatex%} |
|Class 1 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |
|Class 2 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} p_3 {%endkatex%} | {%katex%} \neg p_4 {%endkatex%} |
|Class 3 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} \neg p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |
|Class 4 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} \neg p_3 {%endkatex%} | {%katex%} \neg p_4 {%endkatex%} |
...
|Class 16 | {%katex%} \neg p_1 {%endkatex%} | {%katex%} \neg p_2 {%endkatex%} | {%katex%} \neg p_3 {%endkatex%} | {%katex%} \neg p_4 {%endkatex%} |

{% endhtml %}

Note that {%katex%}\land{%endkatex%} (logical `AND`) operation is implied between all the columns. For example, Class 2, {%katex%} p_1, p_2, p_3, \neg p_4 {%endkatex%} means that `addr` is valid, `value` is valid, `mode` is valid, but `default` value is invalid.

You can also recognize that equivalence classes are generated similar to how you count in binary and the invalid input is **automatically** considered by negation of each proposition. This means defining a proposition like {%katex%} p_{1a}: addr\,is\,invalid {%endkatex%} would be redundant because {%katex%}\neg p_1 {%endkatex%} logically means that and {%katex%}\neg p_{1a} {%endkatex%} would be just {%katex%}p_1{%endkatex%}.

In Python, we can calculate this simply by using the Cartesian product (`testflows.combinatorics.product` or `itertools.product`) function as follows:

```python
list(product(['p1','¬p1'],['p2','¬p2'],['p3','¬p3'],['p4','¬p4']))
```

```python
[('p1', 'p2', 'p3', 'p4'),
 ('p1', 'p2', 'p3', '¬p4'),
 ('p1', 'p2', '¬p3', 'p4'),
 ('p1', 'p2', '¬p3', '¬p4'),
 ...
 ('¬p1', '¬p2', '¬p3', '¬p4')]
```

If you don't remember how a Cartesian product works, recall that a Cartesian product can be represented using nested for-loops as follows:
 
```python
for p1 in ['p1','¬p1']:
  for p2 in ['p2','¬p2']:
    for p3 in ['p3','¬p3']:
      for p4 in ['p4','¬p4']:
        (p1, p2, p3, p4)
```

In a [TestSketch](https://testflows.com/handbook/#Using-Sketches) which supports the [either()](https://testflows.com/handbook/#Using-either) function, the same Cartesian product can be naturally defined as possibilities as follows:

```python
@TestSketch
def combinatorial_test(self):
    p1 = either('p1', '¬p1') # p1 is either 'p1' or '¬p1'
    p2 = either('p2', '¬p2') # ...
    p3 = either('p3', '¬p3') # ...
    p4 = either('p4', '¬p4') # ...
    (p1, p2, p3, p4)
```

## Defining the meaning of each proposition and its negation

Having defined the first four high-level propositions and the equivalent classes derived from them, we need to give meaning to what it actually means for a given input to be valid or invalid. For this, we need to look at each input individually, as what it means to be valid or invalid for one input does not apply to another. We'll define an input to be invalid when the memory function raises an exception; otherwise, we'll consider any value that does not lead to an exception to be valid. Therefore, now we just need to think if there are any values for each input that would cause the memory function to raise an exception.

After a quick examination of the [memory function](#The-memory-function) implementation, we can conclude the following:

1. The `addr` is valid when the value is hashable and invalid when it is not hashable. This is because the `addr` is used as a key in a dictionary, and Python dictionary keys must be hashable.

2. The `value` is valid for any value, and therefore there are no invalid values for it.

3. The `mode` is valid when the value is iterable and invalid when it is not. This is because the `mode` is used with the `in` operator, which only works for iterable objects.

4. The `default` is valid for any value, and therefore there are no invalid values for it.

## Filtering out invalid classes

Given that both `value` and `default` inputs don't have invalid values, we reduce the equivalent classes to just four. This is because `value` and `default` propositions must always be true, and only propositions for `addr` and `mode` can vary.

{% html div class="styled-table compact" %}

|    |   |   |   |   |
|:---|---:|---:|---:|---:|
| **Class**   | {%katex%} \textbf p_1 {%endkatex%} | {%katex%} \textbf p_2 {%endkatex%} | {%katex%} \textbf p_3 {%endkatex%} | {%katex%} \textbf p_4 {%endkatex%} |
|Class 1 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |
|Class 2 | {%katex%} p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} \neg p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |
|Class 3 | {%katex%} \neg p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |
|Class 4 | {%katex%} \neg p_1 {%endkatex%} | {%katex%} p_2 {%endkatex%} | {%katex%} \neg p_3 {%endkatex%} | {%katex%} p_4 {%endkatex%} |

{% endhtml %}

# Refining atomic propositions

We've started with high-level input validity propositions and after analysis of what valid and invalid values can be for each input, we've narrowed down our equivalence classes to just four. However, as intuition tells us, this is not enough to test the memory function. This is because we need to think about if all values that fall into the valid or invalid class for a given variable would lead to the same behavior, or if some values would cause the behavior to be different. 

Let's start with the `mode` and add additional atomic propositions that would cause differences in behavior. When `mode` is invalid, the only behavior that we expect is an exception, so we don't need to add an additional proposition to differentiate behavior when `mode` is invalid. However, this is not the case when `mode` is valid. When the `mode` is valid, the behavior of the system will depend on the presence or absence of each mode flag `r`, `w`, and `e`. Therefore, we need to add additional propositions
to account for difference in the behavior when these flags are set. This gives us
three new propositions:

> * {%katex%} p_{3a} {%endkatex%}: `r` in `mode`
> * {%katex%} p_{3b} {%endkatex%}: `w` in `mode`
> * {%katex%} p_{3c} {%endkatex%}: `e` in `mode`

Next, let's think about the `addr`. If `addr` is invalid, meaning the value is non-hashable, we expect the behavior to be the same - an exception will be raised. Now, what about when `addr` is valid? Can we say that for any valid value of `addr` the behavior is the same? The answer is obviously, no. It is a memory function after all, so the behavior of the system depends on the actual value of the `addr`. Therefore, we need to add an additional proposition to cover this.

> * {%katex%} p_{1a} {%endkatex%}: `addr` is set to valid value `A` 

The same logic will apply for the `value` argument. The invalid case does not even apply; however, for valid values we expect that the behavior of the system will be different for different values. Therefore, again we need to add an additional proposition to cover it.

> * {%katex%} p_{2a} {%endkatex%}: `value` is set to valid value `V` 

Note that we only want to fix a value for `addr` and `value` inputs when these values are valid. We don't care about fixing any values for the invalid cases for these variables.

The last one is the `default`. The invalid case again does not apply, but even for the valid case, we expect the system to behave the same irrespective of the actual value set for the `default`. Therefore, we don't need to add any additional propositions related to the `default`.

It is clear from the above that choosing the right propositions requires a tester to think about the system at the right abstraction level. Not too high and not too low, but just enough to cover the important cases that lead to different behaviors.

The previously stated quote is critical to defining atomic propositions for real-world systems at hand.

> "Focus on behavior-causing differences" - specific variations in inputs that lead a software system to exhibit different behaviors.

Also, note that we are maintaining the right level of abstraction by saying that for `addr` and `value` the actual value matters, but we don't care what it actually is. Instead, we do care when the value will be different to the one we select, which is covered by the negation of those propositions.

For the memory function, the full set of atomic propositions {%katex%}AP_I{%endkatex%} now sits at nine and is the following:

> * {%katex%} p_1 {%endkatex%}: `addr` is valid
> * {%katex%} p_{1a} {%endkatex%}: `addr` is set to valid value `A` 
> * {%katex%} p_2 {%endkatex%}: `value` is valid
> * {%katex%} p_{2a} {%endkatex%}: `value` is set to valid value `V` 
> * {%katex%} p_3 {%endkatex%}: `mode` is valid
> * {%katex%} p_{3a} {%endkatex%}: `r` in `mode`
> * {%katex%} p_{3b} {%endkatex%}: `w` in `mode`
> * {%katex%} p_{3c} {%endkatex%}: `e` in `mode`
> * {%katex%} p_4 {%endkatex%}: `default` is valid

We can scratch our heads now and ask if we've defined enough propositions? What does it mean to be enough? Well, enough is simply the smallest set of propositions that cover all possible differences in system's behavior. Remember that the negations of these propositions are included by default.


# Equivalence classes from refined propositions

Having our nine refined propositions ready, we can now build our equivalence classes. If we consider each proposition to be independent, then we would have {%katex%}2^9=512{%endkatex%} classes. However, some propositions are dependent, and we need to take that into account.

Let's start with {%katex%}p_1{%endkatex%} and {%katex%}p_{1a}{%endkatex%}, which are propositions related to the `addr`. When {%katex%}\neg p_1{%endkatex%} (address is invalid), the {%katex%}p_{1a}{%endkatex%} is a don't care. Therefore, for {%katex%}p_1{%endkatex%} and {%katex%}p_{1a}{%endkatex%}, we only have {%katex%}3{%endkatex%} possible combinations.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_1{%endkatex%} |  {%katex%} \textbf p_{1a}{%endkatex%} | Description |
|---|---|---|
| {%katex%}p_1{%endkatex%} | {%katex%}p_{1a}{%endkatex%} | addr is valid and is A |
| {%katex%}p_1{%endkatex%} | {%katex%}\neg p_{1a}{%endkatex%} | addr is valid and is B (not A) |  
| {%katex%}\neg p_1{%endkatex%} | {%katex%}X{%endkatex%} | addr is invalid and value doesn't matter |

{% endhtml %}

For the two propositions related to the `value`, {%katex%}p_2{%endkatex%} and {%katex%}p_{2a}{%endkatex%}, we know that we don't need to consider {%katex%}\neg p_2{%endkatex%},
as value can't be invalid. Therefore, we only have {%katex%}2{%endkatex%} possible combinations.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_2{%endkatex%} |  {%katex%} \textbf p_{2a}{%endkatex%} | Description |
|---|---|---|
| {%katex%}p_2{%endkatex%} | {%katex%}p_{2a}{%endkatex%} | value is valid and is V |
| {%katex%}p_2{%endkatex%} | {%katex%}\neg p_{2a}{%endkatex%} | value is valid and is W (not V) |  

{% endhtml %}

Next, let's look at propositions for the `mode`. The mode is covered by propositions {%katex%}p_3{%endkatex%}, {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%}. Here, we note that when {%katex%}\neg p_3{%endkatex%}, the mode is invalid, and the other propositions {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%} are don't care. Therefore, we have {%katex%}9{%endkatex%} possible combinations {%katex%}(2 \times 2 \times 2) + 1 = 9 {%endkatex%}.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_3{%endkatex%} |  {%katex%} \textbf p_{3a}{%endkatex%} | {%katex%} \textbf p_{3b}{%endkatex%} | {%katex%} \textbf p_{3c} {%endkatex%} | Description |
|---|---|---|---|---|
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}p_{3c}{%endkatex%} | mode is valid and 'rwe' flags are set |
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and 'rw' flags are set |
...
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and no flags are set |
| {%katex%}\neg p_3{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | mode is invalid and flags don't care| 

{% endhtml %}

Lastly, we only have one proposition for `default`, which is {%katex%}p_4{%endkatex%}. Given that the default value can only be valid, there is only {%katex%}1{%endkatex%} possible combination.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_4{%endkatex%} | Description |
|---|---|
| {%katex%}p_4{%endkatex%} | default value is valid and exact value doesn't matter |

{% endhtml %}

Therefore, the total number of equivalent classes that we need to consider is:

> {%katex%}3 \times 2 \times 9 \times 1 = 54 {%endkatex%}

giving us only {%katex%}54{%endkatex%} classes that we need to consider for comprehensive test coverage of the memory function. This is much less than {%katex%}512{%endkatex%}, if we did not consider interdependency between propositions and when valid or invalid propositions actually applied.

## Table of equivalence classes

Here are all the {%katex%}54{%endkatex%} classes and the description for each:


{% html div class="styled-table compact" %}

###### **Table:** Equivalent Classes

| Class | {%katex%} \textbf p_1 {%endkatex%} | {%katex%}\textbf p_{1a} {%endkatex%} | {%katex%}\textbf p_2{%endkatex%} | {%katex%}\textbf p_{2a}{%endkatex%} | {%katex%}\textbf p_3{%endkatex%} | {%katex%}\textbf p_{3a} {%endkatex%} | {%katex%}\textbf p_{3b}{%endkatex%} | {%katex%}\textbf p_{3c}{%endkatex%} | {%katex%}\textbf p_4{%endkatex%} | Description |
|:-----:|:---------------------------------:|:------------------------------------:|:---------------------------------:|:------------------------------------:|:---------------------------------:|:------------------------------------:|:------------------------------------:|:------------------------------------:|:---------------------------------:|-------------|
| **1** | False | N/A | True | True | False | N/A | N/A | N/A | True | addr invalid; value set to V; mode invalid; default is valid |
| **2** | False | N/A | True | False | False | N/A | N/A | N/A | True | addr invalid; value not V; mode invalid; default is valid |
| **3** | False | N/A | True | True | True | False | False | False | True | addr invalid; value set to V; mode valid; no flags; default is valid |
| **4** | False | N/A | True | False | True | False | False | False | True | addr invalid; value not V; mode valid; no flags; default is valid |
| **5** | False | N/A | True | True | True | False | False | True | True | addr invalid; value set to V; mode 'e'; erases memory; default is valid |
| **6** | False | N/A | True | False | True | False | False | True | True | addr invalid; value not V; mode 'e'; erases memory; default is valid |
| **7** | False | N/A | True | True | True | False | True | False | True | addr invalid; value set to V; mode 'w'; writes value; default is valid |
| **8** | False | N/A | True | False | True | False | True | False | True | addr invalid; value not V; mode 'w'; writes value; default is valid |
| **9** | False | N/A | True | True | True | False | True | True | True | addr invalid; value set to V; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **10** | False | N/A | True | False | True | False | True | True | True | addr invalid; value not V; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **11** | False | N/A | True | True | True | True | False | False | True | addr invalid; value set to V; mode 'r'; attempts to read; default is valid |
| **12** | False | N/A | True | False | True | True | False | False | True | addr invalid; value not V; mode 'r'; attempts to read; default is valid |
| **13** | False | N/A | True | True | True | True | False | True | True | addr invalid; value set to V; mode 'r' & 'e'; attempts to read; erases memory; default is valid |
| **14** | False | N/A | True | False | True | True | False | True | True | addr invalid; value not V; mode 'r' & 'e'; attempts to read; erases memory; default is valid |
| **15** | False | N/A | True | True | True | True | True | False | True | addr invalid; value set to V; mode 'r' & 'w'; attempts to read; writes value; default is valid |
| **16** | False | N/A | True | False | True | True | True | False | True | addr invalid; value not V; mode 'r' & 'w'; attempts to read; writes value; default is valid |
| **17** | False | N/A | True | True | True | True | True | True | True | addr invalid; value set to V; mode all flags; reads; erases memory; writes value; default is valid |
| **18** | False | N/A | True | False | True | True | True | True | True | addr invalid; value not V; mode all flags; reads; erases memory; writes value; default is valid |
| **19** | True | False | True | True | False | N/A | N/A | N/A | True | addr valid; not A; value set to V; mode invalid; default is valid |
| **20** | True | False | True | False | False | N/A | N/A | N/A | True | addr valid; not A; value not V; mode invalid; default is valid |
| **21** | True | False | True | True | True | False | False | False | True | addr valid; not A; mode valid; no flags; default is valid |
| **22** | True | False | True | False | True | False | False | False | True | addr valid; not A; value not V; mode valid; no flags; default is valid |
| **23** | True | False | True | True | True | False | False | True | True | addr valid; not A; mode 'e'; erases memory; default is valid |
| **24** | True | False | True | False | True | False | False | True | True | addr valid; not A; value not V; mode 'e'; erases memory; default is valid |
| **25** | True | False | True | True | True | False | True | False | True | addr valid; not A; mode 'w'; writes value; default is valid |
| **26** | True | False | True | False | True | False | True | False | True | addr valid; not A; value not V; mode 'w'; writes value; default is valid |
| **27** | True | False | True | True | True | False | True | True | True | addr valid; not A; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **28** | True | False | True | False | True | False | True | True | True | addr valid; not A; value not V; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **29** | True | False | True | True | True | True | False | False | True | addr valid; not A; mode 'r'; reads from addr; returns value or default |
| **30** | True | False | True | False | True | True | False | False | True | addr valid; not A; value not V; mode 'r'; reads from addr; returns value or default |
| **31** | True | False | True | True | True | True | False | True | True | addr valid; not A; mode 'r' & 'e'; reads; erases memory; returns value or default |
| **32** | True | False | True | False | True | True | False | True | True | addr valid; not A; value not V; mode 'r' & 'e'; reads; erases memory; returns value or default |
| **33** | True | False | True | True | True | True | True | False | True | addr valid; not A; mode 'r' & 'w'; reads; writes value; returns value or default |
| **34** | True | False | True | False | True | True | True | False | True | addr valid; not A; value not V; mode 'r' & 'w'; reads; writes value; returns value or default |
| **35** | True | False | True | True | True | True | True | True | True | addr valid; not A; mode all flags; reads; erases memory; writes value; returns value or default |
| **36** | True | False | True | False | True | True | True | True | True | addr valid; not A; value not V; mode all flags; reads; erases memory; writes value; returns value or default |
| **37** | True | True | True | True | False | N/A | N/A | N/A | True | addr valid; A; mode invalid; default is valid |
| **38** | True | True | True | False | False | N/A | N/A | N/A | True | addr valid; A; value not V; mode invalid; default is valid |
| **39** | True | True | True | True | True | False | False | False | True | addr valid; A; mode valid; no flags; default is valid |
| **40** | True | True | True | False | True | False | False | False | True | addr valid; A; value not V; mode valid; no flags; default is valid |
| **41** | True | True | True | True | True | False | False | True | True | addr valid; A; mode 'e'; erases memory; default is valid |
| **42** | True | True | True | False | True | False | False | True | True | addr valid; A; value not V; mode 'e'; erases memory; default is valid |
| **43** | True | True | True | True | True | False | True | False | True | addr valid; A; mode 'w'; writes value; default is valid |
| **44** | True | True | True | False | True | False | True | False | True | addr valid; A; value not V; mode 'w'; writes value; default is valid |
| **45** | True | True | True | True | True | False | True | True | True | addr valid; A; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **46** | True | True | True | False | True | False | True | True | True | addr valid; A; value not V; mode 'w' & 'e'; erases memory; writes value; default is valid |
| **47** | True | True | True | True | True | True | False | False | True | addr valid; A; mode 'r'; reads from addr; returns value |
| **48** | True | True | True | False | True | True | False | False | True | addr valid; A; value not V; mode 'r'; reads from addr; returns value |
| **49** | True | True | True | True | True | True | False | True | True | addr valid; A; mode 'r' & 'e'; reads; erases memory; returns value |
| **50** | True | True | True | False | True | True | False | True | True | addr valid; A; value not V; mode 'r' & 'e'; reads; erases memory; returns value |
| **51** | True | True | True | True | True | True | True | False | True | addr valid; A; mode 'r' & 'w'; reads; writes value; returns value |
| **52** | True | True | True | False | True | True | True | False | True | addr valid; A; value not V; mode 'r' & 'w'; reads; writes value; returns value |
| **53** | True | True | True | True | True | True | True | True | True | addr valid; A; mode all flags; reads; erases memory; writes value; returns value |
| **54** | True | True | True | False | True | True | True | True | True | addr valid; A; value not V; mode all flags; reads; erases memory; writes value; returns value |
{% endhtml %}

# Conclusion

In this first part, we've introduced formal definitions for atomic propositions and equivalence classes, applying them to a memory function as a practical example. By analyzing each input variable and refining our initial set of propositions, we reduced the potential input space to a manageable set of equivalence classes. Through this process, we illustrated how to focus on behavior-causing differences in inputs, ensuring comprehensive test coverage without redundancy.

Next, in Part 2, we’ll explore how to take internal states into account, select specific input values, and use a combinatorial sketch to cover all equivalence classes effectively.

{% html div class="classic-quote" %}

> 🛸 Continue to **[Using Atomic Propositions and Equivalence Classes (Part 2)](../using-atomic-propositions-and-equivalence-classes-part2/)**

{% endhtml %}
