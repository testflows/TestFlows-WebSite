---
post: true
title: "Using Atomic Propositions and Equivalence Classes (Part 2)"
description: An article about how to apply atomic propositions and equivalence classes in testing a simple stateful system such as a memory function (part 2).
date: 2024-10-17
author: Vitaliy Zakaznikov
image: images/using-atomic-propositions-and-equivalence-classes-part2.png
icon: fas fa-glasses pt-5 pb-5
---

Atomic propositions and equivalence classes offer a practical solution for making testing manageable when dealing with large or infinite input domains. While these concepts are widely used in formal verification—such as in [Exhaustive Model-Based Equivalence Class Testing by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4), from which we'll borrow the formal definition of equivalence classes—they are extremely useful in everyday testing tasks.

In this post, we'll explore how atomic propositions and equivalence classes help us choose "representative values" when input spaces are large. These values represent groups of inputs that behave equivalently, allowing us to ensure the system is thoroughly tested without needing to cover every possible input within each group. Given that atomic propositions and equivalence classes are commonly used in formal verification, we'll also delve into the formal mathematical notation that defines these concepts.

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

Let {%katex%} p_1, p_2, \dots, p_k {%endkatex%} be atomic propositions that describe various properties of the system, then the set {%katex%} AP {%endkatex%} is the collection of all these atomic propositions:

> {%katex%} 
AP = \{ p_1, p_2, \dots, p_k \} 
{%endkatex%}

In Python, we can rewrite this definition as follows:

```python
# set is a collection of unordered unique elements 
AP = set([p_1, p_2, ..., p_k])
```

> Remember that an atomic proposition is logical statement that evaluate to either true or > false. For example,
> {%katex%} p_1: \text{Temperature} > 100 {%endkatex%}


Each {%katex%} p_i {%endkatex%} is an atomic proposition that evaluates to **true** or **false** based on the values of the system's variables in a particular state {%katex%} s {%endkatex%}. Thus, for any {%katex%} p_i {%endkatex%}, we have:

> {%katex%} 
p_i : \varphi_i(s(v_1), s(v_2), \dots, s(v_n)) \in \{ \text{true}, \text{false} \} 
{%endkatex%}

where:
- {%katex%} s {%endkatex%} is the current state of the system,
- {%katex%} v_1, v_2, \dots, v_n {%endkatex%} are the variables of the system,
- {%katex%} \varphi_i {%endkatex%} is a logical condition on these variables that defines {%katex%} p_i {%endkatex%}.

In Python, we can think of each atomic proposition as a function that returns either `True` or `False` boolean value:

```python
# Define atomic proposition p_i as a function of system state s(v1), s(v2), ..., s(vn)
def p_i(s_v1: Any, s_v2: Any, *args: Any) -> bool:
    # Define the logical condition φ_i(s(v1), s(v2), ..., s(vn))
    φ_i = some_condition_based_on(s_v1, s_v2, *args)
    
    # Return the boolean result of φ_i
    return φ_i
```

Now let's break the set of atomic propositions {%katex%} AP {%endkatex%} into separate components based on **input** variables, **model** (internal) variables, and **output** variables and redefine the {%katex%} AP {%endkatex%} as follows:

> {%katex%} 
AP = AP_I \cup AP_M \cup AP_O 
{%endkatex%}

where:
- {%katex%} AP_I {%endkatex%}
is the set of atomic propositions that relate to **input** variables.
- {%katex%} AP_M {%endkatex%}
is the set of atomic propositions that relate to **model** (or internal) variables.
- {%katex%} AP_O {%endkatex%}
is the set of atomic propositions that relate to **output** variables.

In Python, you can think of {%katex%} AP {%endkatex%} as just a list that includes
all atomic propositions which we can break up into three separate lists,
one for input, model, and output variables respectively. 

```python
# Define the lists for AP_I, AP_M, and AP_O
AP_I = [...]  # Replace with atomic propositions related to input variables
AP_M = [...]  # Replace with atomic propositions related to model variables
AP_O = [...]  # Replace with atomic propositions related to output variables

# Combine the lists and convert to a set to ensure uniqueness
AP = set(AP_I + AP_M + AP_O)
```

Given that we are doing black box testing, such decomposition of {%katex%} AP {%endkatex%} is very convenient, as we can only define atomic propositions
related to {%katex%} AP_I {%endkatex%} (input) and {%katex%} AP_O {%endkatex%} (output) because we don't know the internals of the implementation to know the {%katex%} AP_M {%endkatex%} (model) variables.

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

Let's use a simple memory function below to see how we can apply atomic propositions
and equivalence classes.

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

# Atomic propositions for input variables ({%katex%} AP_I{%endkatex%}) of the memory function

Defining atomic propositions for a real-world black-box tested software system is not easy.
A tester must be able to break down the system's inputs into the simplest,
indivisible conditions that affect system's behavior (the output). 
The focus always must be on a behavior-causing differences. 
If the system has internal states, like our memory function, then the differences in
behavior must be considered for each state.


> "Focus on a behavior-causing differences".


An iterative approach works best. First start with high level atomic propositions
and refine them as needed keeping focused on the behavior causing differences.

## High-level atomic propositions

If you don't know where to start, it always helps to start with simple
propositions that state the validity of each input variable. After all,
we do expect that each input must have some valid value and we do expect
that valid input should cause differences in systems behavior as compared 
to invalid input.

Therefore, we can define the following high-level atomic propositions for each input variables (`addr`, `value`,
`mode`, `default`):

> * {%katex%} p_1 {%endkatex%}:
  `addr` is valid
> * {%katex%} p_2 {%endkatex%}:
  `value` is valid
> * {%katex%} p_3 {%endkatex%}:
  `mode` is valid
> * {%katex%} p_4 {%endkatex%}:
  `default` is valid

Having a set of our four simple high-level atomic propositions in hand we can use them
to define the equivalence classes that correspond to these propositions using the [definition {%katex%} \mathcal{I} {%endkatex%}](#Simplified-is-just-a-Cartesian-product). There are {%katex%} 2^n {%endkatex%} classes where {%katex%} n {%endkatex%}
is the number of propositions. In our case we have {%katex%} 4 {%endkatex%} propositions, which gives us {%katex%} 2^4=16 {%endkatex%}
classes.

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

Note that {%katex%}\land{%endkatex%} (logical `AND`) operation is implied between all the columns. For example,
Class 2, {%katex%} p_1, p_2, p_3, \neg p_4 {%endkatex%} means that `addr` is valid, `value` is valid, `mode` is valid, but
`default` value is invalid.

You can also recognize that equivalence classes are generated similar to how you count in binary and the invalid input is **automatically**
considered by negation of each proposition. This means defining a proposition like {%katex%} p_{1a}:
  addr\,is\,invalid {%endkatex%} would be redundant because {%katex%}\neg p_1 {%endkatex%} logically means that and {%katex%}\neg p_{1a} {%endkatex%} would be just {%katex%}p_1{%endkatex%}.

In Python we can calculate this simply by using the Cartesian product (`testflows.combinatorics.product` or `itertools.product`) function as follows:

```python
list(product(['p1','¬p1'],['p2','¬p2'],['p3','¬p3'],['p4','¬p4']])))
```

```python
[('p1', 'p2', 'p3', 'p4'),
 ('p1', 'p2', 'p3', '¬p4'),
 ('p1', 'p2', '¬p3', 'p4'),
 ('p1', 'p2', '¬p3', '¬p4'),
 ...
 ('¬p1', '¬p2', '¬p3', '¬p4')]
 ```

If don't you remember how a Cartesian product works, remember that a Cartesian product
can be represented using nested for-loops as follows:
 
 ```python
for p1 in ['p1','¬p1']:
  for p2 in ['p2','¬p2']:
    for p2 in ['p2','¬p2']:
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

Having defined first four high-level propositions and the equivalent classes derived from them,
we need to give meaning of what it actually means for a given input to be valid or invalid.
For this, we need to look at each input individually as what it means to be valid or invalid
for one input does not apply to another. We'll define an input to be invalid when the memory
function raises an exception, otherwise we'll consider any value that does not lead to an exception to be valid.
Therefore, now just need to think if there are any values for each input that would cause the memory
function to raise an exception.

After quick examination of the [memory function](#The-memory-function) implementation we can conclude the following.

1. The `addr` is valid when the value is hashable and invalid when it is not hashable. This because
the `addr` is used as a key in dictionary and Python dictionary keys must be hashable.

2. The `value` is valid for any value and therefore there are no invalid values for it.

3. The `mode` is valid when the value is iterable and invalid when it is not. This is because
the `mode` is used with the `in` operator which only works for iterable objects.

4. The `default`is valid for any value and therefore there are no invalid values for it.

## Filtering out invalid classes

Given that both `value` and `default` inputs don't have invalid values we reduce the equivalent classes
to just four. This is because `value` and `default` proposition must always be true and only
propositions for `addr` and `mode` can vary.

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

We've started with high-level input validity propositions and after analysis of what valid and invalid
values can be for each input we've narrowed down our equivalence classes to just four.
However, as the intuition tells us this is not enough to test the memory function.
This is because we need to think about if all values that fall into the valid or invalid
class for a given variable would lead to the same behavior or if some values would cause
the behavior to be different. 

Let's start with the `mode` and add additional atomic propositions that would cause
difference in a behavior. When `mode` is invalid the only behavior that we expect is
an exception therefore we don't need to add additional proposition to be able to
differentiate behavior when `mode` is invalid. However, this is not the case when `mode` is valid.
When the `mode` is valid, the behavior of the system will depend on the presence or absence
of each mode flag `r`,`w`, and `e`. Therefore, we need to add additional propositions
to account for difference in the behavior when these flags are set. This gives us
three new propositions:

> * {%katex%} p_{3a} {%endkatex%}:
  `r` in `mode`
> * {%katex%} p_{3b} {%endkatex%}:
  `w` in `mode`
> * {%katex%} p_{3c} {%endkatex%}:
  `e` in `mode`

Next, let's think about the `addr`. If `addr` is invalid, meaning the value is non-hashable, we expect
the behavior to be the same - an exception will be raised. Now, what about when `addr` is valid?
Can we say that for any valid value of `addr` the behavior is the same? The answer is obviously, no.
It is a memory function after all, therefore the behavior of the system depends on the actual value of the
`addr`. Therefore, we need to add additional proposition to cover this.

> * {%katex%} p_{1a} {%endkatex%}:
  `addr` is set to valid value `A` 

The same logic will apply for the `value` argument. The invalid case does not even apply, however
for the valid values we expect that behavior of the system will be different for different values.
Therefore, again we need to add additional proposition to cover it.

> * {%katex%} p_{2a} {%endkatex%}:
  `value` is set to valid value `V` 

Note, that we only want to fix a value for `addr` and `value` inputs when these values are valid.
We don't really care about fixing any values for the invalid cases for these variables.

The last one is the `default`. The invalid case again does not apply, but even for the valid
we expect the system to behave the same irrespective of what the actual value we set for the `default`.
Therefore, we don't need to add any additional propositions related to the `default`.

It is clear from the above that choosing the right propositions require a tester to think about the
system at the right abstraction level. Not too high and not too low, but just enough to cover
the important cases that lead to different behaviors.

The previously stated quote is critical to defining atomic propositions for real-world systems at hand.

> "Focus on a behavior-causing differences" - specific variations in inputs that lead a software system to exhibit different behaviors.

Also, note that we are maintaining the right level of abstraction by saying that for `addr` and `value`
the actual value matters, but we don't care what it actually is, instead we do care
when the value will be different to the one we select which is covered by negation of those propositions.

For the memory function, full set of atomic propositions {%katex%}AP_I{%endkatex%} now sits at nine and is the following:

> * {%katex%} p_1 {%endkatex%}:
  `addr` is valid
> * {%katex%} p_{1a} {%endkatex%}:
  `addr` is set to valid value `A` 
> * {%katex%} p_2 {%endkatex%}:
  `value` is valid
> * {%katex%} p_{2a} {%endkatex%}:
  `value` is set to valid value `V` 
> * {%katex%} p_3 {%endkatex%}:
  `mode` is valid
> * {%katex%} p_{3a} {%endkatex%}:
  `r` in `mode`
> * {%katex%} p_{3b} {%endkatex%}:
  `w` in `mode`
> * {%katex%} p_{3c} {%endkatex%}:
  `e` in `mode`
> * {%katex%} p_4 {%endkatex%}:
  `default` is valid


We can scratch our head now and ask if we've defined enough propositions? What does it mean to be enough?
Well, enough, is simply the smallest set of propositions that cover all possible differences in system's behavior.
Remember that the negations of these propositions are included by default.

# Equivalence classes from refined propositions

Having our nine refined propositions ready we can now build our equivalence classes.
If we consider each proposition to be independent then we would have {%katex%}2^9=512{%endkatex%} classes. However, some propositions are dependent and we need to take that into account.

Let's start with {%katex%}p_1{%endkatex%} and {%katex%}p_{1a}{%endkatex%} which
are propositions related to the `addr`.
When {%katex%}\neg p_1{%endkatex%} (address is invalid) the {%katex%}p_{1a}{%endkatex%}
is a don't care. Therefore, for {%katex%}p_1{%endkatex%} and {%katex%}p_{1a}{%endkatex%} we only have {%katex%}3{%endkatex%} possible combinations.

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

Next, let's look at propositions for the `mode`. The mode is covered by propositions {%katex%}p_3{%endkatex%}, {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%}. Here, we note that when {%katex%}\neg p_3{%endkatex%}, the mode is invalid, the other propositions {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%} are don't care. Therefore, 
we have {%katex%}9{%endkatex%} possible combinations {%katex%}(2 \times 2 \times 2) + 1 = 9 {%endkatex%}.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_3{%endkatex%} |  {%katex%} \textbf p_{3a}{%endkatex%} | {%katex%} \textbf p_{3b}{%endkatex%} | {%katex%} \textbf p_{3c} {%endkatex%} | Description |
|---|---|---|---|---|
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}p_{3c}{%endkatex%} | mode is valid and 'rwe' flags are set |
| {%katex%}p_3{%endkatex%} | {%katex%}p_{3a}{%endkatex%} | {%katex%}p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and 'rw' flags are set |
...
| {%katex%}p_3{%endkatex%} | {%katex%}\neg p_{3a}{%endkatex%} | {%katex%}\neg p_{3b}{%endkatex%} | {%katex%}\neg p_{3c}{%endkatex%} | mode is valid and no flags are set |
| {%katex%}\neg p_3{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | {%katex%}X{%endkatex%} | mode is invalid and flags don't care| 

{% endhtml %}

Lastly, we only have one propositions for `default` which is {%katex%}p_4{%endkatex%}.
Given that default value can only be valid, there is only {%katex%}1{%endkatex%} possible combination.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_4{%endkatex%} | Description |
|---|---|
| {%katex%}p_4{%endkatex%} | default value is valid and exact value doesn't matter |


{% endhtml %}

Therefore, the total number of equivalent classes that we need to consider is:

> {%katex%}3 \times 2 \times 9 \times 1 = 54 {%endkatex%}

giving us only {%katex%}54{%endkatex%} that we need to consider for comprehensive test coverage of the memory function. This is much less than {%katex%}512{%endkatex%}, if we did not consider interdependency between propositions and when valid or invalid propositions actually applied.

## Table of equivalence classes

Here are all the {%katex%}54{%endkatex%} classes and the description for each:


{% html div class="styled-table compact" %}

###### **Table:** Equivalent Classes

| Class | {%katex%} \textbf p_1 {%endkatex%} | {%katex%}\textbf p_{1a} {%endkatex%} | {%katex%}\textbf p_2{%endkatex%} | {%katex%}\textbf p_{2a}{%endkatex%} | {%katex%}\textbf p_3{%endkatex%} | {%katex%}\textbf p_{3a} {%endkatex%} | {%katex%}\textbf p_{3b}{%endkatex%} | {%katex%}\textbf p_{3c}{%endkatex%} | {%katex%}\textbf p_4{%endkatex%} | Description |
|:-----:|:---------------------------------:|:------------------------------------:|:---------------------------------:|:------------------------------------:|:---------------------------------:|:------------------------------------:|:------------------------------------:|:------------------------------------:|:---------------------------------:|-------------|
| **1** | False | N/A | True | True | False | N/A | N/A | N/A | True | `addr` invalid; `value` set to `V`; `mode` invalid; `default` is valid |
| **2** | False | N/A | True | False | False | N/A | N/A | N/A | True | `addr` invalid; `value` not `V`; `mode` invalid; `default` is valid |
| **3** | False | N/A | True | True | True | False | False | False | True | `addr` invalid; `value` set to `V`; `mode` valid; no flags; `default` is valid |
| **4** | False | N/A | True | False | True | False | False | False | True | `addr` invalid; `value` not `V`; `mode` valid; no flags; `default` is valid |
| **5** | False | N/A | True | True | True | False | False | True | True | `addr` invalid; `value` set to `V`; `mode` `'e'`; erases memory; `default` is valid |
| **6** | False | N/A | True | False | True | False | False | True | True | `addr` invalid; `value` not `V`; `mode` `'e'`; erases memory; `default` is valid |
| **7** | False | N/A | True | True | True | False | True | False | True | `addr` invalid; `value` set to `V`; `mode` `'w'`; writes `value`; `default` is valid |
| **8** | False | N/A | True | False | True | False | True | False | True | `addr` invalid; `value` not `V`; `mode` `'w'`; writes `value`; `default` is valid |
| **9** | False | N/A | True | True | True | False | True | True | True | `addr` invalid; `value` set to `V`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **10** | False | N/A | True | False | True | False | True | True | True | `addr` invalid; `value` not `V`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **11** | False | N/A | True | True | True | True | False | False | True | `addr` invalid; `value` set to `V`; `mode` `'r'`; attempts to read; `default` is valid |
| **12** | False | N/A | True | False | True | True | False | False | True | `addr` invalid; `value` not `V`; `mode` `'r'`; attempts to read; `default` is valid |
| **13** | False | N/A | True | True | True | True | False | True | True | `addr` invalid; `value` set to `V`; `mode` `'r'` & `'e'`; attempts to read; erases memory; `default` is valid |
| **14** | False | N/A | True | False | True | True | False | True | True | `addr` invalid; `value` not `V`; `mode` `'r'` & `'e'`; attempts to read; erases memory; `default` is valid |
| **15** | False | N/A | True | True | True | True | True | False | True | `addr` invalid; `value` set to `V`; `mode` `'r'` & `'w'`; attempts to read; writes `value`; `default` is valid |
| **16** | False | N/A | True | False | True | True | True | False | True | `addr` invalid; `value` not `V`; `mode` `'r'` & `'w'`; attempts to read; writes `value`; `default` is valid |
| **17** | False | N/A | True | True | True | True | True | True | True | `addr` invalid; `value` set to `V`; `mode` all flags; reads; erases memory; writes `value`; `default` is valid |
| **18** | False | N/A | True | False | True | True | True | True | True | `addr` invalid; `value` not `V`; `mode` all flags; reads; erases memory; writes `value`; `default` is valid |
| **19** | True | False | True | True | False | N/A | N/A | N/A | True | `addr` valid; not `A`; `value` set to `V`; `mode` invalid; `default` is valid |
| **20** | True | False | True | False | False | N/A | N/A | N/A | True | `addr` valid; not `A`; `value` not `V`; `mode` invalid; `default` is valid |
| **21** | True | False | True | True | True | False | False | False | True | `addr` valid; not `A`; `mode` valid; no flags; `default` is valid |
| **22** | True | False | True | False | True | False | False | False | True | `addr` valid; not `A`; `value` not `V`; `mode` valid; no flags; `default` is valid |
| **23** | True | False | True | True | True | False | False | True | True | `addr` valid; not `A`; `mode` `'e'`; erases memory; `default` is valid |
| **24** | True | False | True | False | True | False | False | True | True | `addr` valid; not `A`; `value` not `V`; `mode` `'e'`; erases memory; `default` is valid |
| **25** | True | False | True | True | True | False | True | False | True | `addr` valid; not `A`; `mode` `'w'`; writes `value`; `default` is valid |
| **26** | True | False | True | False | True | False | True | False | True | `addr` valid; not `A`; `value` not `V`; `mode` `'w'`; writes `value`; `default` is valid |
| **27** | True | False | True | True | True | False | True | True | True | `addr` valid; not `A`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **28** | True | False | True | False | True | False | True | True | True | `addr` valid; not `A`; `value` not `V`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **29** | True | False | True | True | True | True | False | False | True | `addr` valid; not `A`; `mode` `'r'`; reads from `addr`; returns value or `default` |
| **30** | True | False | True | False | True | True | False | False | True | `addr` valid; not `A`; `value` not `V`; `mode` `'r'`; reads from `addr`; returns value or `default` |
| **31** | True | False | True | True | True | True | False | True | True | `addr` valid; not `A`; `mode` `'r'` & `'e'`; reads; erases memory; returns value or `default` |
| **32** | True | False | True | False | True | True | False | True | True | `addr` valid; not `A`; `value` not `V`; `mode` `'r'` & `'e'`; reads; erases memory; returns value or `default` |
| **33** | True | False | True | True | True | True | True | False | True | `addr` valid; not `A`; `mode` `'r'` & `'w'`; reads; writes `value`; returns value or `default` |
| **34** | True | False | True | False | True | True | True | False | True | `addr` valid; not `A`; `value` not `V`; `mode` `'r'` & `'w'`; reads; writes `value`; returns value or `default` |
| **35** | True | False | True | True | True | True | True | True | True | `addr` valid; not `A`; `mode` all flags; reads; erases memory; writes `value`; returns value or `default` |
| **36** | True | False | True | False | True | True | True | True | True | `addr` valid; not `A`; `value` not `V`; `mode` all flags; reads; erases memory; writes `value`; returns value or `default` |
| **37** | True | True | True | True | False | N/A | N/A | N/A | True | `addr` valid; `A`; `mode` invalid; `default` is valid |
| **38** | True | True | True | False | False | N/A | N/A | N/A | True | `addr` valid; `A`; `value` not `V`; `mode` invalid; `default` is valid |
| **39** | True | True | True | True | True | False | False | False | True | `addr` valid; `A`; `mode` valid; no flags; `default` is valid |
| **40** | True | True | True | False | True | False | False | False | True | `addr` valid; `A`; `value` not `V`; `mode` valid; no flags; `default` is valid |
| **41** | True | True | True | True | True | False | False | True | True | `addr` valid; `A`; `mode` `'e'`; erases memory; `default` is valid |
| **42** | True | True | True | False | True | False | False | True | True | `addr` valid; `A`; `value` not `V`; `mode` `'e'`; erases memory; `default` is valid |
| **43** | True | True | True | True | True | False | True | False | True | `addr` valid; `A`; `mode` `'w'`; writes `value`; `default` is valid |
| **44** | True | True | True | False | True | False | True | False | True | `addr` valid; `A`; `value` not `V`; `mode` `'w'`; writes `value`; `default` is valid |
| **45** | True | True | True | True | True | False | True | True | True | `addr` valid; `A`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **46** | True | True | True | False | True | False | True | True | True | `addr` valid; `A`; `value` not `V`; `mode` `'w'` & `'e'`; erases memory; writes `value`; `default` is valid |
| **47** | True | True | True | True | True | True | False | False | True | `addr` valid; `A`; `mode` `'r'`; reads from `addr`; returns value |
| **48** | True | True | True | False | True | True | False | False | True | `addr` valid; `A`; `value` not `V`; `mode` `'r'`; reads from `addr`; returns value |
| **49** | True | True | True | True | True | True | False | True | True | `addr` valid; `A`; `mode` `'r'` & `'e'`; reads; erases memory; returns value |
| **50** | True | True | True | False | True | True | False | True | True | `addr` valid; `A`; `value` not `V`; `mode` `'r'` & `'e'`; reads; erases memory; returns value |
| **51** | True | True | True | True | True | True | True | False | True | `addr` valid; `A`; `mode` `'r'` & `'w'`; reads; writes `value`; returns value |
| **52** | True | True | True | False | True | True | True | False | True | `addr` valid; `A`; `value` not `V`; `mode` `'r'` & `'w'`; reads; writes `value`; returns value |
| **53** | True | True | True | True | True | True | True | True | True | `addr` valid; `A`; `mode` all flags; reads; erases memory; writes `value`; returns value |
| **54** | True | True | True | False | True | True | True | True | True | `addr` valid; `A`; `value` not `V`; `mode` all flags; reads; erases memory; writes `value`; returns value |
{% endhtml %}

# Taking into account system's internal states

The original definition of [input equivalence class partitions {%katex%} \mathcal{I} {%endkatex%}](#Equivalence-classes) (IECP) does not mention any state. This is counter intuitive
as one expects that a system in different states might respond differently for
inputs that fall into the same equivalence class. We can restate this as that the behavior of some class {%katex%}EC_1{%endkatex%} when system in state {%katex%}s_1{%endkatex%} might not be the same when
we apply the same {%katex%}EC_1{%endkatex%} in {%katex%}s_2{%endkatex%}.

For example, if take Class 47 from the table of equivalence classes for the memory function.
We represent **Class 47** as a logical conjunction of the propositions:

> {%katex%}
p_1 \land p_{1a} \land p_2 \land p_{2a} \land p_3 \land p_{3a} \land \lnot p_{3b} \land \lnot p_{3c} \land p_4
{%endkatex%}

Which when decoded means that:

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

This class means that we are trying to read memory at address `A` and obviously the result
of this input will depend on the state of the memory such as if the value in this memory address is unintilized or was set to some value beforehand.

## Considering to include state in the definition of {%katex%} \mathcal{I} {%endkatex%}

We could consider to modify the definition of {%katex%} \mathcal{I} {%endkatex%} to consider both the input and the internal state, without requiring separate sets of classes for each state:

> {%katex%}

\mathcal{I} = \left\{ \{(s, c) \in S \times D_I \mid \bigwedge_{p \in M} p[s, c] \land \bigwedge_{p \in AP_I - M} \neg p[s, c] \} \mid M \subseteq AP_I \right\} \backslash {\emptyset}

{%endkatex%}

In this modified definition:

* {%katex%} S {%endkatex%}: The set of all internal states.
* {%katex%} D_I {%endkatex%}: The domain of input variables.
* {%katex%} (s, c) \in S \times D_I {%endkatex%}: Represents the input {%katex%} c {%endkatex%} and the current internal state {%katex%} s {%endkatex%}.
* {%katex%} p[s, c] {%endkatex%}: Evaluates an atomic proposition {%katex%} p {%endkatex%} given both the internal state {%katex%} s {%endkatex%} and the input {%katex%} c {%endkatex%}.

This modified definition of IECP produces equivalence classes that group state-input pairs {%katex%} (s, c) {%endkatex%} based on their combined behavior, ensuring that inputs which lead to different outcomes in different states are handled correctly.

However, modifying the original definition of [equivalence classes {%katex%} \mathcal{I} {%endkatex%}](#Equivalence-classes) is not necessary. This is because equivalent classes
should focus on partitioning the input space independently of the system's internal states, meaning we create equivalence classes that describe all possible input conditions without considering which internal state the system is in.

Here are the main reasons why:

1. **State Independence**: Traditional IECP is designed to provide a global partition of inputs that applies universally, regardless of the internal state. This approach simplifies testing by focusing only on the inputs and ensuring coverage of all possible input conditions without considering internal behavior.

2. **State Explosion Complexity**: Including {%katex%} S \times D_I {%endkatex%}
​in the original IECP definition would drastically increase the number of equivalence classes to account for each state-specific input combination, leading to a state explosion problem. This would make the process more complex and less efficient, especially for systems with many internal states.

3. **General Applicability**: By keeping IECP state-independent, the partitioning method remains applicable to a broad range of systems, including those where input behavior does not depend on the internal state. This makes the original IECP more versatile.

Now that we undestand that equivalent classes provide a global partition of inputs and apply universally, regardless of the internal state, we know that even though
behavior can be different when system is in different internal states this
does not mean that we need to define equivalent classes for each internal state individually.

> "Traditional IECP is designed to provide a global partition of inputs that applies universally, regardless of the internal state."

# System's internal states

Even though equivalent classes provide global partition of inputs we still need to worry about the internal states of the system.
Therefore, we need to determine the internal states of the memory function. Let's try to calculate the number of possible states.
Each address can hold any of the possible values or be uninitialized. Therefore, for each address, there are {%katex%}𝑉+1{%endkatex%} possible states (including uninitialized). 
Since the addresses are independent, the total number of possible states is:

> {%katex%}
\text{Total\,States}=(𝑉+1)^A
{%endkatex%}

Therefore, even if you have:

* Addresses ({%katex%}A{%endkatex%}): Let's say 100 possible addresses.
* Values ({%katex%}V{%endkatex%}): Let's say 256 possible values (e.g., bytes from 0 to 255).

Then:

* {%katex%}
\text{Total\,States}=(𝑉+1)^𝐴=257^{100}
{%endkatex%}
 
This number is astronomically large,  making total number of staets practically infinite for testing purposes.
We can't reasonable work with such large number of states. An abstraction is needed to focus on the core
behavior. This is accomplished using **abstract states** —broad states that summarize the underlying conditions of the system, as we did in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model/#Determining-the-minimum-number-of-calls).
This means that we consider a simplified model of the memory function with the following assumptions:

* All addresses are considered identical (indistinct).
* The specific values stored are irrelevant.
* Overwriting previously stored values is significant.

With these assumptions, the simplified system can exist in only three distinct abstract states:

* **State 0 (Uninitialized)**: No write operations have been performed.
* **State 1 (Initialized without Overwrites)**: At least one write operation has been performed to an uninitialized address, but no overwrites have occurred.
* **State 2 (Initialized with Overwrites)**: At least one overwrite operation has occurred (i.e., writing to an address that has already been written to).

Mathematically, we represent the set of possible system abstract states as:

> {%katex%}S=\{s_0, s_1, s_2\} {%endkatex%}

Therefore, the memory function is abstracted to have only {%katex%}3{%endkatex%} internal states that represent
the core behavior of the system and we'll need to test all equivalent classes in each of these states.

# Selecting input values to build concrete equivalent classes

Before we can use equivalent classes defined in the [Table: Equivalent Classes](#table-equivalent-classes), we need to define each atomic proposition concretely
using actual input values.

This means we need to go through combinations of [refined propositions](##Equivalence-classes-from-refined-propositions) and respecify them
with input values.

First, let's pick concrete input values to satisfy combinations of {%katex%}p_1{%endkatex%} and {%katex%} p_{1a}{%endkatex%} related to `addr` input variable:

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_1{%endkatex%} |  {%katex%} \textbf p_{1a}{%endkatex%} | Description | Concrete Input Values |
|---|---|---|---|
| {%katex%}p_1{%endkatex%} | {%katex%}p_{1a}{%endkatex%} | addr is valid and is A | `addr`=1000 |
| {%katex%}p_1{%endkatex%} | {%katex%}\neg p_{1a}{%endkatex%} | addr is valid and is B (not A) | `addr`=2000 (not `1000`) | 
| {%katex%}\neg p_1{%endkatex%} | {%katex%}X{%endkatex%} | addr is invalid and value doesn't matter | `addr`=`None` (non-hashable) |

{% endhtml %}

Second, let's pick concrete input values to satisfy combinations of propositions {%katex%}p_2{%endkatex%} and {%katex%} p_{2a}{%endkatex%} related to `value` input variable:

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_2{%endkatex%} |  {%katex%} \textbf p_{2a}{%endkatex%} | Description | Concrete Input Values |
|---|---|---|---|
| {%katex%}p_2{%endkatex%} | {%katex%}p_{2a}{%endkatex%} | value is valid and is V | `value`=`"hello"` |
| {%katex%}p_2{%endkatex%} | {%katex%}\neg p_{2a}{%endkatex%} | value is valid and is W(not V) | `value` = `"hello2"` (not `"hello"`) |

{% endhtml %}


Third, let's pick concreate input values to satisfy combinations of propositions {%katex%}p_3{%endkatex%}, {%katex%}p_{3a}{%endkatex%}, {%katex%}p_{3b}{%endkatex%}, and {%katex%}p_{3c}{%endkatex%} related to `mode` input variable.

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_3{%endkatex%} |  {%katex%} \textbf p_{3a}{%endkatex%} | {%katex%} \textbf p_{3b}{%endkatex%} | {%katex%} \textbf p_{3c}{%endkatex%} | Description | Concrete Input Values |
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

Fourth, we can pick any value for the `default` input variable to satisfy {%katex%}p_4{%endkatex%}:

{% html div class="styled-table compact" %}

|  {%katex%}\textbf p_4{%endkatex%} | Description | Concrete Input Value |
|---|---|---|
| {%katex%}p_4{%endkatex%} | default value is valid and exact value doesn't matter | `default` = `0` |

{% endhtml %}

Having specified the concrete input values that corespond to all combinations of atomic propositions in {%katex%}AP=\{p_1,p_{1a},p_2,p_{2a},p_3,p_{3a},p_{3b},p_{3c},p_4\}{%endkatex%}, we are ready to use equivalent classes in an actual test.

# Implementing equivalence class testing using combinatorial sketch

Having picked input values to build concrete equivalent classes, we are ready to
finally apply them to comprehensively test the memory function. How can we do that?
By building all possible combinations of inputs we've selected above to create inputs to cover all equivalent classes that we've defined in the [Table: Equivalent Classes](#table-equivalent-classes).

The set of values for each variable `addr`, `value`, `mode`, and `default` are the following:

> {%katex%}V_{addr} = \{1000,2000,None\} \\{%endkatex%}
> {%katex%}V_{value} =  \{"hello", "hello2"\} \\{%endkatex%}
> {%katex%}V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", None\} \\{%endkatex%}
> {%katex%}V_{default} = \{0\} \\{%endkatex%}

The {%katex%}\mathcal{I_{inputs}}{%endkatex%}, the set of all **concrete input equivalence class partitions** (cIECP), is just all possible combinations of them which is just a Cartesian product:

> {%katex%}
\mathcal{I_{inputs}} = V_{addr} \times V_{value} \times V_{mode} \times V_{default} 
{%endkatex%}

Note that by **concrete**, we mean that we've assigned specific values to input variables and if we substitue the values into {%katex%}\mathcal{I_{inputs}}{%endkatex%}, we get:

> {%katex%}
\mathcal{I_{inputs}} = \{1000,2000,None\} \times \{"hello", "hello2"\} \times \{"r", "w", "e", "rw", "re", "we", "rwe", "", None\} \times \{0\} 
{%endkatex%}

When we apply the Cartesian product, the {%katex%}\mathcal{I_{inputs}}{%endkatex%} will be:

>{%katex%}
\mathcal{I_{inputs}} = \left\{ 
\begin{array}{l}
   \left(1000,\, \text{"hello"},\, \text{"r"},\, 0\right), \\
   \left(1000,\, \text{"hello"},\, \text{"w"},\, 0\right), \\
   \vdots \\
   \left(\text{None},\, \text{"hello2"},\, \text{None},\, 0\right) \\
\end{array} 
\right\}
{%endkatex%}

The length of {%katex%}\mathcal{I_{inputs}}{%endkatex%}:

> {%katex%}
|\mathcal{I_{inputs}}| = 3 \times 2 \times 9 \times 1 = 54
{%endkatex%}

It is {%katex%}54{%endkatex%} as expected because each tuple in {%katex%}\mathcal{I_{inputs}}{%endkatex%} represents an input vector to satisfy exactly one equivalence class in [Table: Equivalent Classes](#table-equivalent-classes).

## Mapping input vectors back to equivalent classes

Let's map input vectors in {%katex%}\mathcal{I_{inputs}}{%endkatex%} to the corresponding equivalence class:

1\. {%katex%}(1000, \text{"hello"}, \text{"r"}, 0) {%endkatex%} maps to the following combination of propositions:
  
* {%katex%}1000 \implies p_1, p_{1a} {%endkatex%} 
* {%katex%}"hello" \implies p_2, p_{2a} {%endkatex%} 
* {%katex%}"r" \implies p_3, p_{3a}, \neg p_{3b}, \neg p_{3c} {%endkatex%} 
* {%katex%}0 \implies p_4 {%endkatex%}
  
Thus, {%katex%} \{p_1, p_{1a}, p_2, p_{2a}, p_3, p_{3a}, \neg p_{3b}, \neg p_{3c}, p_4   \} = (True, False, True, True, True, True, False, False, True) = Class\ 29{%endkatex%}

2\. {%katex%}(1000, \text{"hello"}, \text{"w"}, 0) {%endkatex%} maps to the following combination of propositions:
  
* {%katex%}1000 \implies p_1, p_{1a} {%endkatex%} 
* {%katex%}"hello" \implies p_2, p_{2a} {%endkatex%} 
* {%katex%}"w" \implies p_3, \neg p_{3a}, p_{3b}, \neg p_{3c} {%endkatex%} 
* {%katex%}0 \implies p_4 {%endkatex%}

Thus, {%katex%} \{p_1, p_{1a}, p_2, p_{2a}, p_3, \neg p_{3a}, p_{3b}, \neg p_{3c}, p_4   \} = (True, False, True, True, True, False, True, False, True) = Class\ 43{%endkatex%}

3\. {%katex%}(None, \text{"hello2"}, None, 0) {%endkatex%} maps to the following combination of propositions:
  
* {%katex%}None \implies \neg p_1, p_{1a}=\text{NA} {%endkatex%} 
* {%katex%}"hello2" \implies p_2, \neg p_{2a} {%endkatex%} 
* {%katex%}None \implies \neg p_3, p_{3a}=\text{NA}, p_{3b}=\text{NA}, p_{3c}=\text{NA} {%endkatex%} 
* {%katex%}0 \implies p_4 {%endkatex%}

Thus, {%katex%} \{\neg p_1, \text{NA}, p_2, \neg p_{2a}, \neg p_3, \text{NA}, \text{NA}, \text{NA}, p_4  \} = (False, \text{NA}, True, False, False, \text{NA}, \text{NA}, \text{NA}, True) = Class\ 2{%endkatex%}

Therefore,

>{%katex%}
\mathcal{I_{inputs}} = \left\{ 
\begin{array}{l}
   \left(1000,\, \text{"hello"},\, \text{"r"},\, 0\right) = Class\ 29, \\
   \left(1000,\, \text{"hello"},\, \text{"w"},\, 0\right) = Class\ 42, \\
   \vdots \\
   \left(\text{None},\, \text{"hello2"},\, \text{None},\, 0\right) = Class\ 2 \\
\end{array} 
\right\}
{%endkatex%}

## Combinatorial sketch

We've shown that every possible combination of inputs that we've selected will generate {%katex%}54{%endkatex%} input combinations where each combination will cover
one of the equivalent classes.

Our inputs are:

> {%katex%}V_{addr} = \{1000,2000,None\} \\{%endkatex%}
> {%katex%}V_{value} =  \{"hello", "hello2"\} \\{%endkatex%}
> {%katex%}V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", None\} \\{%endkatex%}
> {%katex%}V_{default} = \{0\} \\{%endkatex%}

Therefore, we can easily implement a test to cover every equivalence class
using [TestSketch](https://testflows.com/handbook/#Using-Sketches) and the [either() function](https://testflows.com/handbook/#Using-either) just like we did in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model).
The only difference is that equivalence classes force us to consider a few
additional input values which we've missed before other than that the
test is almost identical.

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

Again, note that we've specified possible values for each variables using the [either()
function](https://testflows.com/handbook/#Using-either):

```python
addr = either(*[1000, 2000, None], i=f"addr-{i}")
value = either(*["hello", "hello2"], i=f"value-{i}")
mode = either(*([mode for mode in valid_modes()] + ["", None]), i=f"mode-{i}")
default = either(*[0], i=f"default-{i}")
```

which match our selected values to build equivalent classes that we've defined using
sets in the mathematical notation:

> {%katex%}V_{addr} = \{1000,2000,None\} \\{%endkatex%}
> {%katex%}V_{value} =  \{"hello", "hello2"\} \\{%endkatex%}
> {%katex%}V_{mode} = \{"r", "w", "e", "rw", "re", "we", "rwe", "", None\} \\{%endkatex%}
> {%katex%}V_{default} = \{0\} \\{%endkatex%}

Note that the `valid_modes()` just computes all possible combination of flags `r`,`w`,`e` and returns `['r', 'w', 'e', 'rw', 're', 'we', 'rwe']` to which we add `''` (empty string) to cover
the case when no flags are set, and the `None` value to cover the case when mode value is invalid (non-iterable).

Let's take the test program from [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model) and update to execute our modified
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

If you execute it, you'll see that it will fail straightaway on `pattern #8`
because our old behavior model was not properly calculating
correct behavior when the `mode` argument is invalid (non-iterable).
We did not run into this problem before because the old combinatorial test
did not cover this case. It was a hole in our test coverage which is now
covered by equivalence classes.

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

New combinations introduced by equivalence classes force us to fix the behavior model.
First, we need to update the model's `expect_error` method
to check if `current_state.mode` is iterable by checking if the `in` operator
will work.

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

Second, we also need to update the `expect_stored_value` method to check
if a given state had error and if so move on to the next one.
This is becuase if an error occured, it means either `mode` was invalid (non-iterable)
and therefore we can check for presence of any flags, or `addr` was invalid (non-hashable).

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

With these fixes in place, here is a full test program that uses an update behavior
model that accounts for the behavior for inputs in each equivalence class:

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

Upone execution, you'll get the following output:

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

Which confirms that all {%katex%}54 \times 54 \times 54 = 54^3 = 157464{%endkatex%} combinations were tested and passed, where remember {%katex%}54{%endkatex%} is the number
of input vectors to match our {%katex%}54{%endkatex%} equivalence classes and {%katex%}3{%endkatex%} is the number
of abstract internal states that we need to cover.

# Conclusion

Using atomic propositions and equivalence classes pushed us closer to formal methods and introduced mathematical rigor that elevates our testing to the next level. We've examined formal mathematical notation and a formal definition of input equivalence class partitions (IECP) and applied it to our memory function, bringing theory into practice. We leveraged our previous work in [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model) and reused most of the code, including the behavior model. This demonstrates that combinatorial testing aligns well with equivalence class testing, both of which require a model to calculate expected results across the thousands of combinations needed for near-exhaustive test coverage. This is no small feat and underscores that testing and formal mathematics go hand-in-hand—concepts from formal methods should be learned by every tester who takes their work seriously.

> "Concepts from formal methods should be learned by every tester who takes their work seriously."



