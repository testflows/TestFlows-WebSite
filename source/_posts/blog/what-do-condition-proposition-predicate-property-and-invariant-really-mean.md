---
post: true
title: "What Do Condition, Proposition, Predicate, Property, and Invariant Really Mean?"
description: Understand Condition, Proposition, Predicate, Property, and Invariant in software testing using the Die Hard water jug problem.
date: 2025-02-28
author: Vitaliy Zakaznikov
image: images/what-do-condition-proposition-predicate-property-invariant-really-mean.png
icon: fas fa-glasses pt-5 pb-5
---

In software testing, you often hear terms like "condition," "proposition," "predicate," "property," and "invariant"—but what do they really mean? In this article, we'll break each of them down by defining them in relation to the states and state transitions that make up state machines. After all, software programs are, at their core, state machines. To aid understanding, we'll use a well-known puzzle: the *Die Hard* water jug problem as our system under test.<!-- more -->

## The Die Hard water jug problem

In *Die Hard with a Vengeance* (1995), the characters face a logical challenge to defuse a bomb: measure exactly 4 gallons of water using only a 5-gallon jug and a 3-gallon jug, with access to an unlimited water source. This example was popularized by the [TLA+ Video Course](https://www.youtube.com/watch?v=IW0oA3Pxe-Q), and you can watch the scene on [YouTube](https://www.youtube.com/watch?v=2vdF6NASMiE). 

The problem can be represented as a simple state machine, and since we aim to define our terms precisely, we need to establish how they apply to states it will serve as our framework for doing so.

To solve the problem, the trick is to use a sequence of available actions to achieve the goal. 
The possible actions and the resulting states are:

{% html div class="styled-table compact" %}

| Action                                      | State (after action)                  |
|---------------------------------------------|---------------------------------------|
| Fill the 3-gallon jug                       | {%katex%}(small=3, big=big){%endkatex%} |
| Fill the 5-gallon jug                       | {%katex%}(small=small, big=5){%endkatex%} |
| Empty the 3-gallon jug                      | {%katex%}(small=0, big=big){%endkatex%} |
| Empty the 5-gallon jug                      | {%katex%}(small=small, big=big){%endkatex%} |
| Pour from the 5-gallon jug into the 3-gallon jug | {%katex%}(small=min(small + big, 3), big=max(0, small + big - 3)){%endkatex%} |
| Pour from the 3-gallon jug into the 5-gallon jug | {%katex%}(small=max(0, small + big - 5), big=min(small + big, 5)){%endkatex%} |

{% endhtml %}

The initial state is {%katex%}(small=0, big=0){%endkatex%}.

To help us understand states better we can visualize the *"Die Hard water jug problem"* using the following state diagram that shows all the reachable states and all possible state transitions:

<div class="text-center">
<img style="width: 55%" src="/images/die-hard-states.png">
<div class="text-secondary text-bold"><br>The Die Hard Water Jug Problem: State Diagram</div>
</div><br>

Therea are {%katex%}24{%endkatex%} possible states. Why? Because we have {%katex%}4{%endkatex%} possible values
for the small jug {%katex%}[0,1,2,3]{%endkatex%} and {%katex%}6{%endkatex%} possible values for the big jug
{%katex%}[0,1,2,3,4,5]{%endkatex%} giving us {%katex%}4 \times 6 = 24{%endkatex%}. However, only {%katex%}16{%endkatex%} states are reachable. The states {%katex%}(1,1), (2,1), (1,2), (2,2), (1,3), (2,3), (1,4), (2,4){%endkatex%} are not reachable no matter what sequence of actions we perform. Nonetheless, we can see that using these two jugs we
can measure 0, 1, 2, 3, 4, or 5 gallons of water.

## What's a state?

A **state** is defined as **assignment of values to variables** and this means that any state is defined by its variables
and the values that those variables have. Therefore, for any system there are only two questions you really need to ask:

> A **state** is an assignment of values to variables.

* **What are the variables that define the state of the system?**
* **What possible values each state variable can have?**

A *state* in the *Die Hard water jug problem* is simply a snapshot of how much water is in each jug at a given moment. We can represent a state as a pair {%katex%}(small, big){%endkatex%}, where:

- {%katex%}small{%endkatex%} is a variable that defines the amount of water in the 3-gallon jug.

- {%katex%}big{%endkatex%} is a variable that defines the amount of water in the 5-gallon jug.

- **Initial State**: Both jugs are empty: {%katex%}(small=0, big=0){%endkatex%}.

- **Goal State**: The 5-gallon jug contains exactly 4 gallons: {%katex%}(small, big=4){%endkatex%}, where {%katex%}small{%endkatex%} can be any integer value from 0 to 3.

We, can also write the initial state using matrix-like notation:

{%katex%}
\begin{bmatrix} 
small=0 \\ 
big=0
\end{bmatrix}
{%endkatex%}

<br>Then, the only two solution states for the problem can be written as:

{%katex%}
\begin{bmatrix} 
small=0 \\ 
big=4
\end{bmatrix}
{%endkatex%}, 
{%katex%}
\begin{bmatrix} 
small=3 \\ 
big=4
\end{bmatrix}
{%endkatex%}

<br>Let's highlight the **variables** (they are in {%katex%}\textcolor{red}{red}{%endkatex%}):

{%katex%}
\begin{bmatrix} 
\textcolor{red}{small}=0 \\ 
\textcolor{red}{big}=4
\end{bmatrix}
{%endkatex%}, 
{%katex%}
\begin{bmatrix} 
\textcolor{red}{small}=3 \\ 
\textcolor{red}{big}=4
\end{bmatrix}
{%endkatex%}

<br>Let's highlight the **values** (they are in {%katex%}\textcolor{green}{green}{%endkatex%}):

{%katex%}
\begin{bmatrix} 
small=\textcolor{green}{0} \\ 
big=\textcolor{green}{4}
\end{bmatrix}
{%endkatex%}, 
{%katex%}
\begin{bmatrix} 
small=\textcolor{green}{3} \\ 
big=\textcolor{green}{4}
\end{bmatrix}
{%endkatex%}

<br>Do you see that each state is indeed **an assignment of values to variables** and nothing else! Easy.

{%katex%}
\begin{bmatrix} 
\textcolor{red}{small}=\textcolor{green}{0} \\ 
\textcolor{red}{big}=\textcolor{green}{4}
\end{bmatrix}
{%endkatex%}, 
{%katex%}
\begin{bmatrix} 
\textcolor{red}{small}=\textcolor{green}{3} \\ 
\textcolor{red}{big}=\textcolor{green}{4}
\end{bmatrix}
{%endkatex%}

<br>Easy! And this is universal and applies to any system whatsoever and therefore to any program that you will ever test.
Programs will have states, those states will be made up of variables and those variables will have some values and
each state will be defined by a specific combination of values assigned to the state variables.

## What's a sequence of states?

Knowing exactly what a **state** is can now help us clearly understand what a **sequence of states** is.
Actually, it is what it sounds like, just a sequence of states.

For example, one solution the *Die Hard water jug problem* is the following sequence:

{%katex%}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 0 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 5 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 3 \\ \text{big} = 2 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 2 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 2 \\ \text{big} = 0 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 2 \\ \text{big} = 5 \end{bmatrix} 
\xrightarrow{}
\begin{bmatrix} \text{small} = 3 \\ \text{big} = 4 \end{bmatrix}
{%endkatex%}

<br>Each specific *sequence of states* defines a **behavior**.

## What's an action?

In the *Die Hard water jug problem* we saw that there are 6 unique actions that you can perform
to solve the challenge.

* **Filling a Jug**: Pouring water in until it's full.

   1. Fill the 5-gallon jug
   2. Fill the 3-gallon jug

* **Emptying a Jug**: Dumping all the water out.

   3. Empty the 5-gallon jug
   4. Empty the 3-gallon jug

* **Pouring Water from One Jug to Another**: Transfer water until the source is empty or the destination is full.

   5. Pour from 5-gallon into 3-gallon
   6. Pour from 3-gallon into 5-gallon

However, what precisely is an **action**?

It turns out the answer is simple, an **action** is **the act of assigning values to state variables**. 

> An **action** is the act of assigning values to state variables.

For example, if we take the *Fill the 5-gallon jug* action. This action is an act of assigning 5 to variable {%katex%}big{%endkatex%} and previous value of {%katex%}small{%endkatex%} to the next value of {%katex%}small'{%endkatex%}.

We can write this as:

{%katex%}
\begin{bmatrix} \text{small}' = \text{small} \\ \text{big} = 5 \end{bmatrix}
{%endkatex%}

<br>Sometimes, you'll read or hear someone defining an action as

{% html div class="classic-quote" %}
> *an operation that **transitions** the system from one state to another*
{% endhtml %}

This definition can be confusing as sometimes one can mistakenly assume that **transitions** means
that the system actually changes to a **different state**. This however is not always a case. For example,
starting from the initial state {%katex%}(small=0, big=0){%endkatex%}, the *Fill the 5-gallon jug* action
results in the next state being {%katex%}(small=0, big=5){%endkatex%}, but if we perform the *Fill the 5-gallon jug* action
again the system will remain in the {%katex%}(small=0, big=5){%endkatex%} state. No state change actually occurs!
The system remained in the {%katex%}(small=0, big=5){%endkatex%} state and will keep staying in that state forever as long
as you keep repeating the *Fill the 5-gallon jug* action.
However, the system does transition in a sense that in a **sequence of states** a new state is added to the sequence even though the new state is the same as the previous state.

{%katex%}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 0 \end{bmatrix} 
\xrightarrow{\text{fill\_big}}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 5 \end{bmatrix} 
\xrightarrow{\text{fill\_big}}
\begin{bmatrix} \text{small} = 0 \\ \text{big} = 5 \end{bmatrix} 
\xrightarrow{\text{fill\_big}}
\text{...}
{%endkatex%}

<br>Subtle but very important difference to catch and understand!

## State transition formula

The last thing we need to understand is that a program like any state machine
can be described using a mathematical formula. Why on earth you would want to do that?
Well, as we've seen from the example of the example problem, the actual
state diagram for the *Die Hard Water Jug Problem* is very complex and hard to follow.

Mathematics allows for a much more elegant way to expressed, as shown below:

{%katex%}
   (\text{action} = \text{"fill\_small"}) \land (\text{small}' = 3 \land \text{big}' = \text{big}) \lor \\
   (\text{action} = \text{"fill\_big"}) \land (\text{small}' = \text{small} \land \text{big}' = 5) \lor \\
   (\text{action} = \text{"empty\_small"}) \land (\text{small}' = 0 \land \text{big}' = \text{big}) \lor \\
   (\text{action} = \text{"empty\_big"}) \land (\text{small}' = \text{small} \land \text{big}' = 0) \lor \\
   (\text{action} = \text{"pour\_big\_to\_small"}) \land (\text{small}' = \min(\text{small} + \text{big}, 3) \land \text{big}' = \max(0, \text{small} + \text{big} - 3)) \lor \\
   (\text{action} = \text{"pour\_small\_to\_big"}) \land (\text{small}' = \max(0, \text{small} + \text{big} - 5) \land \text{big}' = \min(\text{small} + \text{big}, 5))
{%endkatex%}

<br>Where we've added the {%katex%}action{%endkatex%} input variable to help select the action to be performed.
While the formula might look scary, don't be intimidated, the {%katex%}\land{%endkatex%} is a logical *`AND`* operation
and {%katex%}\lor{%endkatex%} is a logical *`OR`* operation. Also, given this is a mathematical formula, the {%katex%}={%endkatex%} is not an assignment but is equality operator.

We need this representation of the system to help us understand some of the terms.

# Defining our terms precisely

Having laid the foundation with our *Die Hard water jug problem* example, we are ready
to define the terms **condition**, **proposition**, **predicate**, **property**, and **invariant**
precisely in terms of how it applies to states.

## What's a **condition**?

A **condition** is a **boolean expression that serves as a guard for a state transition**.
It is the simple yes/no question (that's why it is *boolean*) that determines whether a particular action (act of assinging values to state variables) is applicable in the current state.

> A **condition** is a **boolean expression that serves as a guard for a state transition**.

For example, in the state transition rule for filling the small jug:

{%katex%}
(\text{action} = \text{"fill\_small"}) \land (\text{small}' = 3 \land \text{big}' = \text{big})
{%endkatex%}

<br> the condition is:

{%katex%}
\text{action} = \text{"fill\_small"}
{%endkatex%}

<br>This condition answers the question: **"Is the chosen action 'fill_small'?"** If it evaluates to **true**, the corresponding state transition occurs; if it evaluates to **false**, the transition does not take place.


## What's a proposition

A **proposition** is a statement that has a definite truth value—either **true** or **false** (boolean)—in a given state.
A proposition makes a concrete assertion about the state of the system.

> A **proposition** is a statement that has a definite truth value—either **true** or **false** (boolean)—in a given state. It makes a concrete assertion about the state of the system.

For example, in the *Die Hard water jug problem*, the statement:

{%katex%}
big = 4
{%endkatex%}

<br>is a **proposition**. It asserts that "the big jug contains exactly 4 gallons" and is either true or false in any particular state.

### But wait, what about {%katex%}action = \text{"fill\_small"}{%endkatex%}?

Both {%katex%}big = 4{%endkatex%} and {%katex%}action = \text{"fill\_small"}{%endkatex%} depend on state variables, but the key difference lies in how they are used and interpreted in context.

- **{%katex%}big = 4{%endkatex%}** is typically treated as a **proposition** because it asserts a specific fact about the state (namely, that the big jug contains exactly 4 gallons). When evaluated in any given state, this statement is either true or false.

- **{%katex%}action = \text{"fill\_small"}{%endkatex%}** is used as a **condition** in the transition system. Although it also depends on the variable **action**, it functions as a guard that determines whether a particular state transition is triggered. It is a Boolean expression that tells us if the specified action is being applied.

In summary, while both depend on state variables, {%katex%}big = 4{%endkatex%} is considered a proposition (a fact about the state), whereas {%katex%}action = \text{"fill\_small"}{%endkatex%} serves as a condition (a guard for a transition) in our system.

## What's a predicate?

A **predicate** is a logical formula that includes one or more **free variables** and evaluates to **true** or **false** once those variables are assigned specific values. It can be seen as a function from a domain (such as the states of a system) to Boolean values.

Consider the **fill_big** transition:

{%katex%}
T\big((\text{small}, \text{big}), (\text{small}', \text{big}'), \text{action}\big) \iff \big(\text{action} = \text{"fill\_big"}\big) \land \big(\text{small}' = \text{small} \land \text{big}' = 5\big)
{%endkatex%}

<br>This is predicate because it has free variables:

- {%katex%}\text{small}{%endkatex%} and {%katex%}\text{big}{%endkatex%}: These represent the values in the current state.
- {%katex%}\text{small}'{%endkatex%} and {%katex%}\text{big}'{%endkatex%}: These represent the values in the next state.
- {%katex%}\text{action}{%endkatex%}: This is also a free variable. Although the predicate includes the clause
  {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%} which restricts the value of {%katex%}\text{action}{%endkatex%} to "fill_big" for this transition, {%katex%}\text{action}{%endkatex%} remains a free variable in the formula—it receives its specific value when the predicate is evaluated in a particular context.

In contrast, a **proposition** is a declarative statement that is unambiguously either **true** or **false** in a given context—it contains no free variables. Once all variables are instantiated, a predicate becomes a proposition.

**Comparison:**

- **Predicate:**
  - Contains free variables.
  - Its truth value depends on the assignment of those variables.
  - Example: {%katex%} (\text{action} = \text{"fill\_small"}) {%endkatex%} is a predicate because its truth depends on the value of **action**.

- **Proposition:**
  - Contains no free variables.
  - Has a fixed truth value in any specific state.
  - Example: If in a given state {%katex%} \text{big} = 4 {%endkatex%} holds, then the statement "big = 4" is a proposition that evaluates to **true**.

In short, a predicate becomes a proposition once all its variables are assigned, turning it into a definite statement with a truth value.

### So, is {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%} a predicate or proposition?

The expression {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%} is a Boolean expression that depends on the free variable {%katex%}\text{action}{%endkatex%}. 

- **As a predicate:** When {%katex%}\text{action}{%endkatex%} is not given a specific value, the expression is a predicate because it can be seen as a function that takes {%katex%}\text{action}{%endkatex%} as input and returns a Boolean value.
- **As a proposition:** Once {%katex%}\text{action}{%endkatex%} is assigned a specific value, the expression becomes a proposition—it then has a definite truth value (either true or false).

Thus, in its general form with {%katex%}\text{action}{%endkatex%} free, {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%} is a predicate. When the variable is instantiated with a specific value, it becomes a proposition.

### But, {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%} is also a condition?

That's right. A **condition** is expressed as a predicate—a Boolean expression with free variables that evaluates to true or false depending on those variable assignments. Thus, in our system, a **condition**—such as {%katex%}\text{action} = \text{"fill\_big"}{%endkatex%}—is fundamentally a predicate. When all free variables are instantiated, it becomes a proposition.

## What's a property?

A **property** is a statement that is either true or false in a set of states or the behavior (sequence of states) of the system as it evolves over time. It is typically a predicate that is meant to hold over multiple states or even throughout an entire execution (for example, along every possible execution path). For instance, consider the property:

{%katex%}
P(small, big) \equiv \big(0 \leq \text{small} \leq 3\big) \land \big(0 \leq \text{big} \leq 5\big)
{%endkatex%}

<br>This property asserts that every state {%katex%} s = (\text{small}, \text{big}) {%endkatex%} of the system must satisfy the jug capacities. It is not limited to a single state but is expected to hold across all (or a significant collection of) states of the system.

### How does it compare to proposition?

A **proposition**, on the other hand, is a statement that makes an assertion about a single state—it has a definite truth value (true or false) in that state. Therefore,

- A **proposition** is a statement about one specific state.
- A **property** is a condition or rule that applies to many states (or an entire execution trace) of the system.


## What's invariant?

An **invariant** is a *property* that must hold in **every reachable state of a system throughout its execution**. It is a condition that remains unchanged, no matter which transitions occur.

In our water jug system, an example we used for a property is also an invariant:

{%katex%}
0 \leq \text{small} \leq 3 \quad \land \quad 0 \leq \text{big} \leq 5
{%endkatex%}

<br>This invariant guarantees that, regardless of the sequence of actions (filling, emptying, or pouring), the amount of water in the small jug will always be between 0 and 3 gallons, and the amount of water in the big jug will always be between 0 and 5 gallons.

Invariants are critical for ensuring that the system never reaches an invalid state, thus providing a global, unchanging constraint on the system's behavior.

### Covering unreachable states

Another invariant for our system is the statement that the states {%katex%}(1,1), (2,1), (1,2), (2,2), (1,3), (2,3), (1,4), (2,4){%endkatex%} are not reachable.

{%katex%}
\big((\text{small} \neq 0 \land \text{small} \neq 3) \implies (\text{big} = 0 \lor \text{big} = 5)\big)
{%endkatex%}

<br>This invariant ensures that whenever the small jug is partially filled (i.e., it has 1 or 2 gallons), the big jug must be either completely empty (0 gallons) or completely full (5 gallons). 

It "covers" the unreachable states by ruling them out:

- If {%katex%}\text{small} = 1{%endkatex%} or {%katex%}\text{small} = 2{%endkatex%}, then the invariant requires {%katex%}\text{big} = 0{%endkatex%} or {%katex%}\text{big} = 5{%endkatex%}.
- Any state where {%katex%}\text{small} \in \{1,2\}{%endkatex%} and {%katex%}\text{big} \notin \{0,5\}{%endkatex%} (for example, (1,1), (2,1), (1,2), (2,2), (1,3), (2,3), (1,4), (2,4)) would violate the invariant.

Because an invariant must hold for every reachable state, we'll enforce that such states cannot be reached.

## Comparing the terms

Now, let's compare all the terms that we've defined:

{% html div class="styled-table compact" %}

| Term         | Definition                                                                                                                                                                                                                                                                                                              | Example in the Water Jug System                                                                                                                                                   | Role/Usage                                                                                                                                                   |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Condition**    | A Boolean expression (i.e. a predicate with free variables) that serves as a guard for a state transition. It determines whether an action is allowed in a given state.                                                                                                                                        | {%katex%}\text{action} = \text{"fill\_small"}{%endkatex%}                                                                                                                        | Determines whether a specific transition (e.g. filling the small jug) should occur.                                                                         |
| **Proposition**  | A declarative statement about a single state that is either true or false. It has no free variables once the state is fixed.                                                                                                                                                                                             | {%katex%}\text{big} = 4{%endkatex%}                                                                                                                                                | Asserts a fact about one state (e.g. in a given state, the big jug contains exactly 4 gallons).                                                              |
| **Predicate**    | A logical formula that may contain free variables and evaluates to true or false once the variables are instantiated. It becomes a proposition when all its variables are assigned.                                                                                                                                | {%katex%}P(\text{big}) = (\text{big} = 4){%endkatex%}                                                                                                                            | Used to define conditions or properties that depend on state variables.                                                                                      |
| **Property**     | A predicate that expresses a constraint or rule expected to hold over a set of states or along an execution path. It is not confined to a single state but applies to many states in the system.                                                                                                                 | {%katex%}0 \le \text{small} \le 3 \land 0 \le \text{big} \le 5{%endkatex%}                                                                                                        | Describes global constraints (e.g. jug capacities) that guide the system’s behavior over many states.                                                         |
| **Invariant**    | A property that must hold in every reachable state of the system throughout its execution. It is a global, unchanging constraint that prevents the system from entering an invalid state.                                                                                                                       | {%katex%}\big(\text{if } \text{small} \in \{1,2\} \text{ then } \text{big} \in \{0,5\}\big){%endkatex%}                                                                          | Ensures the system never enters an invalid state (e.g. excludes states like (1,1) or (2,4) that violate the physical limits of the jugs).                      |

{% endhtml %}

## Conclusion

So, as it turns out, the *Die Hard water jug problem* isn’t just a cool puzzle—it provides us with a fun way to explore essential testing concepts in a practical context. By defining what conditions, propositions, predicates, properties, and invariants mean in terms of the states that make up a system's state machine, we saw firsthand how these terms are applied in real-world scenarios. Connecting these concepts directly to states and state transitions not only clarifies their meanings but also demonstrates how they work together to ensure that your system behaves correctly—from the instant an action is taken to the evolution of the entire behavior over time. This understanding is critical for effective software testing; without a precise grasp of these concepts, software testers handicap themselves in their ability to fully comprehend and evaluate the overall behavior of the systems they test.

Until the next time – happy testing!




