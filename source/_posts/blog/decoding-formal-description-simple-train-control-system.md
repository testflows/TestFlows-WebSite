---
post: true
title: "Decoding Formal Description of a Simple Train Control System"
description: An article about how to read formal mathematical descriptions of a simple train control system.
date: 2024-10-30
author: Vitaliy Zakaznikov
image: images/decoding-formal-description-simple-train-control-system.png
icon: fas fa-glasses pt-5 pb-5
---

In scientific research on software testing, you often come across papers filled with complex mathematical descriptions. Formal mathematics is commonly used in academia because it offers a precise way to describe how a system should behave in various situations, ensuring all possible cases are accounted for. However, for many testers, the math in these papers can feel overwhelming and difficult to apply to everyday testing work.

Terms like “Kripke structures,” “atomic propositions,” and “equivalence classes” might sound abstract and unfamiliar. However, these concepts aren’t as intimidating as they seem. They’re simply tools that help us think more systematically about a system, allowing us to create test cases that cover all the important behaviors.

<!-- more -->

In this post, we’re going to break down an example presented in [*Exhaustive Model-Based Equivalence Class Testing* by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4). This paper provides a formal description of a ceiling speed monitoring function for a train. We’ll walk through the process of interpreting this formal description, the [Kripke structure](https://en.wikipedia.org/wiki/Kripke_structure_(model_checking)), understand each element of it including states, initial states, the transition relation, the labeling function, and most importantly the atomic propositions from which equivalence classes can be built to provide, under certain conditions, an exhaustive test suite—the ultimate goal for any tester.

# Ceiling speed monitoring controller

The simple train control system we’ll discuss here is a **Ceiling Speed Monitoring Controller**, described in [*Exhaustive Model-Based Equivalence Class Testing* by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4). This system, derived from the European Train Control System (ETCS), ensures that a train’s speed remains within safe limits by continuously comparing the train’s estimated speed ({%katex%}V_{\text{est}}{%endkatex%}) with a pre-set maximum speed, known as the Most Restrictive Speed Profile ({%katex%}V_{\text{MRSP}}{%endkatex%}).

The controller interface consists of the following inputs and outputs:

<div class="text-left">
<img style="width: 75%" src="/images/ceiling-speed-monitoring-interface.png">
<div class="text-secondary text-bold"><br>Diagram: Ceiling Speed Monitoring I/O Interface</div>
</div><br>

{% html div class="styled-table compact" %}

| Interface | Type | Description |
|---|---|---|
| {%katex%}V_{est}{%endkatex%} | Input | Current speed estimation [km/h] |
| {%katex%}V_{MRSP}{%endkatex%} | Input | Applicable speed restriction [km/h] (MRSP = Most Restrictive Speed Profile) |
| {%katex%}W{%endkatex%} | Output | Warning to train engine driver at driver machine interface (DMI) (1 = displayed, 0 = not displayed) |
| {%katex%}EB{%endkatex%} | Output | Emergency brake (1 = active, 0 = inactive) |

{% endhtml %}

The system operates in three internal states {%katex%}\ell {%endkatex%}, where ({%katex%}\ell = \{NS, WS, EB\} {%endkatex%}), as shown in the diagram below:

<div class="text-left">
<img style="width: 75%" src="/images/ceiling-speed-monitoring-chart.png">
<div class="text-secondary text-bold"><br>Diagram: Ceiling Speed Monitoring State Diagram</div>
</div><br>

The guard conditions are defined as:

> {%katex%}
g_{\text{ebi1}} \equiv V_{\text{MRSP}} > 110 \land V_{\text{est}} > V_{\text{MRSP}} + 15 \\
g_{\text{ebi2}} \equiv V_{\text{MRSP}} \leq 110 \land V_{\text{est}} > V_{\text{MRSP}} + 7.5
{%endkatex%}

Here is the description of each state and threshold:

1. **Normal Status (NS)**:
   - When the train's estimated speed {%katex%} V_{\text{est}} {%endkatex%} is within or below the speed limit {%katex%} V_{\text{MRSP}} {%endkatex%}, the system remains in this state, and no warnings or emergency braking actions are triggered.
   
2. **Warning Status (WS)**: 
   - This state doesn’t trigger the brakes but instead sends a warning signal {%katex%} W {%endkatex%} to alert the driver. It’s like a speedometer alert that reminds the driver to slow down before reaching a more dangerous level.
   - The **Warning Threshold** is when {%katex%} V_{\text{est}} {%endkatex%} slightly exceeds {%katex%} V_{\text{MRSP}} {%endkatex%} but not by a critical margin.

3. **Intervention Status (IS)**: When {%katex%} V_{\text{est}} {%endkatex%} significantly exceeds {%katex%} V_{\text{MRSP}} {%endkatex%}, meeting conditions defined by specific guard thresholds, the system activates the **emergency brake** ({%katex%} EB {%endkatex%}) to bring the train to a stop. The thresholds are specified by two guard conditions:
   - **Emergency Brake Activation Threshold for High Speeds ({%katex%} g_{\text{ebi1}} {%endkatex%})**:
     - Activated if {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} and {%katex%} V_{\text{est}} > V_{\text{MRSP}} + 15 {%endkatex%}.
     - This threshold is a safeguard for higher speeds, where even a small speed overage can quickly become dangerous. So, if the train exceeds 125 km/h where 110 km/h is the safe max, the brake kicks in to slow it down immediately.
   - **Emergency Brake Activation Threshold for Lower Speeds ({%katex%} g_{\text{ebi2}} {%endkatex%})**:
     - Activated if {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%} and {%katex%} V_{\text{est}} > V_{\text{MRSP}} + 7.5 {%endkatex%}.
     - For lower maximum speed limits (110 km/h or below), the system is slightly more cautious. Here, if the train’s estimated speed exceeds the maximum by more than 7.5 km/h, the **emergency brake (EB)** is activated. This is because, at lower speeds, it’s easier to lose control if the limit is exceeded even by a small amount, so the threshold for triggering the brake is lower (7.5 km/h instead of 15 km/h). For instance, if the limit is 80 km/h, the brake will kick in if the train goes over 87.5 km/h.

   Once the emergency brake is activated, it remains engaged until the train has come to a complete stop.

This layered approach helps avoid unnecessary braking while still maintaining safety, ensuring that the train operates within a safe speed range by alerting the driver early and only applying brakes when absolutely necessary.

# What is a Kripke structure?

In the paper, the above system is formally described by a [Kripke structure](https://en.wikipedia.org/wiki/Kripke_structure_(model_checking)). While at first glance it might sound and look intimidating, we can learn to understand and use it effectively.

A **Kripke structure** is a formal model used to represent the behavior of a system in terms of its possible states and transitions between those states. Named after the logician [Saul Kripke](https://en.wikipedia.org/wiki/Saul_Kripke), this structure is widely used in fields like model checking, formal verification, and software testing, especially in systems where we want to ensure specific properties or safety conditions.

A Kripke structure is defined by {%katex%}K=(S,S_0,R,L,AP){%endkatex%}, which is a tuple that contains the following elements (components):

1. **States** ({%katex%} S {%endkatex%}): The different configurations that the system can be in. Each state represents a unique situation or condition within the system.

2. **Initial States** ({%katex%} S_0 {%endkatex%}): A subset of {%katex%} S {%endkatex%} that contains the states in which the system can start. Initial states give the starting point(s) for evaluating the system's behavior.

3. **Transition Relation** ({%katex%} R {%endkatex%}): A relation that defines how the system can move from one state to another. Each pair {%katex%} (s, s') {%endkatex%} in {%katex%} R {%endkatex%} represents a transition from state {%katex%} s {%endkatex%} to state {%katex%} s' {%endkatex%}, specifying the possible paths the system can take over time.

4. **Labeling Function** ({%katex%} L {%endkatex%}): A function that maps each state to a set of atomic propositions that are true in that state. Atomic propositions describe properties or facts about the system (e.g., “speed exceeds limit” or “warning signal is on”).

5. **Atomic Propositions** ({%katex%} AP {%endkatex%}): The set of all **atomic propositions**. Atomic propositions are simple statements about the system that can be either true or false in each state. Again, they describe specific properties or conditions (e.g., “speed exceeds limit” or “emergency brake is active”) that help define what’s happening in any given state. The labeling function {%katex%} L {%endkatex%} uses these atomic propositions to indicate which conditions hold true in each state, making it possible to analyze the system’s behavior based on these fundamental truths.

In summary, a Kripke structure captures the dynamics of a system by defining its states, how it can transition between states, and which conditions hold true in each state. This allows for systematic analysis of the system’s behavior and helps in verifying that it meets the system's requirements or avoids unwanted conditions.

Let's start unraveling what each element in the Kripke structure is as it applies to the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller).

# The states

First, **States** ({%katex%} S {%endkatex%}) is the set of all possible states. But, what does an actual **State** look like? A **State** consists of **input**, **internal (model)**, and **output** variables. In general, it could even include **environment** variables. It’s critical to understand that **input** and **output** variables are also part of the state!

In some cases, people think that the states of the system are only the circles seen in the state diagram. This is not the case. Those circles are just a part of the overall state description. In this case, the circles in the state diagram are represented as {%katex%}\ell {%endkatex%}, where {%katex%}\ell {%endkatex%} is an internal variable that can have values {%katex%}\text{NS}, \text{WS}, \text{IS}{%endkatex%}, corresponding to each status.

So, after including **input**, **internal (model)**, and **output** variables in the state for the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller), its state is represented as a tuple:

> {%katex%}s = (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){%endkatex%}

Where:

* {%katex%}V_{\text{est}}, V_{\text{MRSP}}{%endkatex%} are input variables.
* {%katex%}\ell{%endkatex%} is an internal (model) variable.
* {%katex%}W, EB{%endkatex%} are output variables.

# The initial states

Second, we can choose by design that **Initial States** ({%katex%} S_0 {%endkatex%}) for the controller
are any states where {%katex%}\ell = \text{NS}{%endkatex%} (internal state is in Normal Status), {%katex%}W = 0{%endkatex%} (warning signal is off), and {%katex%}EB = 0{%endkatex%} (emergency braking is off). Defining initial states helps provide a starting point for evaluating the system’s behavior and ensures consistency in testing from a known configuration.

This can be expressed mathematically as:

> {%katex%}S_0=\{(V_{\text{est}},V_{\text{MRSP}},\ell,W,EB) \mid \ell = \text{NS}, W = 0, EB = 0\}{%endkatex%}

The above expression uses [set-builder notation](https://en.wikipedia.org/wiki/Set-builder_notation) to define the **initial states** {%katex%} S_0 {%endkatex%} of the system in a formal way. Here’s a breakdown of each part of the expression:

- **{%katex%} S_0 {%endkatex%}**: Represents the set of initial states for the system.
- **{%katex%} (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB) {%endkatex%}**: Each element in {%katex%} S_0 {%endkatex%} is a tuple representing a specific initial state of the system, where:
  - {%katex%} V_{\text{est}} {%endkatex%}: Estimated speed of the train.
  - {%katex%} V_{\text{MRSP}} {%endkatex%}: Maximum allowed speed.
  - {%katex%} \ell {%endkatex%}: The status of the system.
  - {%katex%} W {%endkatex%}: Warning signal status.
  - {%katex%} EB {%endkatex%}: Emergency brake status.<br>

- **Condition** {%katex%} \mid \ell = \text{NS}, W = 0, EB = 0 {%endkatex%}: This part specifies constraints for the elements in {%katex%} S_0 {%endkatex%}. It states that:
  - {%katex%} \ell {%endkatex%} must be equal to
    **NS** (Normal Status),
  - {%katex%} W {%endkatex%} must be `0` (warning signal is off),
  - {%katex%} EB {%endkatex%} must be `0` (emergency brake is inactive).

In summary, this [set-builder notation](https://en.wikipedia.org/wiki/Set-builder_notation) defines {%katex%} S_0 {%endkatex%} as the set of all possible initial configurations of the system where the system is in **Normal Status** (NS), the warning signal is off, and the emergency brake is inactive, while allowing {%katex%} V_{\text{est}} {%endkatex%} and {%katex%} V_{\text{MRSP}} {%endkatex%} to vary.

# The transition relation {%katex%} R {%endkatex%}

The transition relation {%katex%} R {%endkatex%} is one of the most important parts of the system description and provides a set of rules describing how the system shifts between states. In the paper, this transition relation is "specified by the predicate."

> "The transition relation {%katex%}R{%endkatex%} is specified by the predicate."

## What does it mean "specified by a predicate"? 

When they say that "the transition relation {%katex%} R {%endkatex%} is specified by the predicate," it means that a logical condition (or predicate) governs each possible transition. This predicate is an expression that, when true, allows a transition from one state to another. Each transition corresponds to a particular set of conditions that must be met for the system to change states.

## How does it look like?

For the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller), {%katex%} R {%endkatex%} is defined as:

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \bigvee_{i=0}^7 \varphi_i((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB'))
{%endkatex%}

This equation means that {%katex%} R {%endkatex%} is true (i.e., a transition occurs) when at least one of the conditions {%katex%} \varphi_0 {%endkatex%} through {%katex%} \varphi_7 {%endkatex%} is true.

Where {%katex%}s = (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){%endkatex%}
and {%katex%}s'=(V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB'){%endkatex%}, and
the **triple equal sign** {%katex%}\equiv{%endkatex%} in formal logic and mathematics is used to indicate "definition" or "is defined as" which means that the left side is not just equal to the right side but is defined by it.

The symbol {%katex%} \bigvee_{i=0}^{7} \varphi_i {%endkatex%} represents a **disjunction** (logical OR) of multiple conditions, indexed from {%katex%} i = 0 {%endkatex%} to {%katex%} i = 7 {%endkatex%}. 

So:

- {%katex%} \bigvee {%endkatex%} is the symbol for logical OR, indicating that at least one of the conditions must be true.
- {%katex%} i = 0 {%endkatex%} to {%katex%} i = 7 {%endkatex%} specifies the range of indices, meaning there are 8 conditions or predicates, labeled {%katex%} \varphi_0 {%endkatex%} through {%katex%} \varphi_7 {%endkatex%}.
- {%katex%} \varphi_i {%endkatex%} represents each individual predicate or condition in the set.

Thus, {%katex%} \bigvee_{i=0}^{7} \varphi_i {%endkatex%} means that the expression is true if at least one of the predicates {%katex%} \varphi_0, \varphi_1, \dots, \varphi_7 {%endkatex%} is true. We can be more explicit and rewrite it as:

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \varphi_0 \lor \varphi_1 \lor \varphi_2 \lor \varphi_3 \lor \varphi_4 \lor \varphi_5 \lor \varphi_6 \lor \varphi_7
{%endkatex%}

## The full transition relation

We can substitute the definitions {%katex%} \varphi_0, \varphi_1, \dots, \varphi_7 {%endkatex%} into {%katex%}R{%endkatex%} to get the final transition relation that fully defines how the internal (model) variable {%katex%}\ell{%endkatex%} and output variables {%katex%}W, EB{%endkatex%} change in response to the current status and input variables.

At first glance, this expression may seem hard to understand. However, be patient, as we'll break down what all of this means.

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \\
\quad \varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) \lor \\
\quad \varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) \lor \\
\quad \varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) \lor \\
\quad \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
{%endkatex%}

💡 It is important to note that the above expression defines a **formula** that describes the behavior of the system. This **formula** must hold for the system to operate correctly. Therefore, transition relations in finite-state systems can indeed be represented as **mathematical formulas**! This is very powerful and demonstrates that mathematics can model complex systems.

This idea of modeling systems as formulas can be found in [TLA+](https://en.wikipedia.org/wiki/TLA%2B). In TLA+, you describe a system's behavior as a mathematical formula using temporal logic, which is a form of logic specifically designed for reasoning about time-dependent behavior.

# Breaking down predicates (conditions)

Let's break down each predicate (condition) in the definition of {%katex%}R{%endkatex%} and see what it actually means.

Remember that each predicate {%katex%} \varphi_i {%endkatex%} specifies a condition for a possible transition. Here is the meaning of the basic logic symbols used in the predicates:

- **AND ({%katex%} \land {%endkatex%})**: Both conditions connected by this symbol must be true for the overall expression to be true. For example, {%katex%} (V_{\text{est}} > V_{\text{MRSP}}) \land (\ell = \text{NS}) {%endkatex%} means that both the estimated speed exceeds the maximum speed and the system is in Normal Status (NS) for this condition to hold.

- **OR ({%katex%} \lor {%endkatex%})**: At least one of the conditions connected by this symbol must be true for the overall expression to be true. For instance, {%katex%} g_{\text{ebi1}} \lor g_{\text{ebi2}} {%endkatex%} indicates that either the high-speed guard condition or the low-speed guard condition triggers.

- **NOT ({%katex%} \neg {%endkatex%})**: This symbol negates the following condition, meaning it’s true when the condition is false. For example, {%katex%} \neg (V_{\text{est}} > V_{\text{MRSP}}) {%endkatex%} is true when the estimated speed is less than or equal to the maximum speed.

By understanding each predicate in {%katex%} R {%endkatex%}, we gain insight into how the system behaves under different speed conditions and triggers appropriate responses like warnings or braking.

Here is the definition and explanation of each condition:

1. **{%katex%} \varphi_0 {%endkatex%}**: Normal Status with Speed Below or Equal to Limit
   {%katex%}
   \varphi_0 \equiv (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB)
   {%endkatex%}
   - This condition states that if the system is in Normal Status (NS) and the estimated speed  {%katex%} V_{\text{est}} {%endkatex%} is within or below the speed limit {%katex%} V_{\text{MRSP}} {%endkatex%}, it remains in NS, with no changes to the warning signal {%katex%} W {%endkatex%} or emergency brake {%katex%} EB {%endkatex%}.

2. **{%katex%} \varphi_1 {%endkatex%}**: Transition from Normal Status to Warning Status
   {%katex%}
   \varphi_1 \equiv (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB)
   {%endkatex%}
   - When in NS, if the estimated speed {%katex%} V_{\text{est}} {%endkatex%} exceeds the maximum speed {%katex%} V_{\text{MRSP}} {%endkatex%}, the system moves to Warning Status (WS) and activates the warning signal {%katex%} W = 1 {%endkatex%}, with the emergency brake {%katex%} EB {%endkatex%} remaining unchanged.

3. **{%katex%} \varphi_2 {%endkatex%}**: Transition from Normal Status to Intervention Status with Emergency Brake
   {%katex%}
   \varphi_2 \equiv (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1)
   {%endkatex%}
   - In NS, if the emergency braking conditions {%katex%} g_{\text{ebi1}} {%endkatex%} or {%katex%} g_{\text{ebi2}} {%endkatex%} are met, the system shifts to Intervention Status (IS), activates the warning {%katex%} W = 1 {%endkatex%}, and applies the emergency brake {%katex%} EB = 1 {%endkatex%}.

4. **{%katex%} \varphi_3 {%endkatex%}**: Warning Status with Speed Above Limit but No Emergency Brake Trigger
   {%katex%}
   \varphi_3 \equiv (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB)
   {%endkatex%}
   - When in WS and {%katex%} V_{\text{est}} {%endkatex%} exceeds {%katex%} V_{\text{MRSP}} {%endkatex%}, but emergency braking is not triggered, the system stays in WS with {%katex%} W = 1 {%endkatex%} and no change to {%katex%} EB {%endkatex%}.

5. **{%katex%} \varphi_4 {%endkatex%}**: Transition from Warning Status to Normal Status
   {%katex%}
   \varphi_4 \equiv (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
   {%endkatex%}
   - If the system is in WS and {%katex%} V_{\text{est}} {%endkatex%} returns to or below {%katex%} V_{\text{MRSP}} {%endkatex%}, it reverts to NS, turning off both the warning {%katex%} W = 0 {%endkatex%} and emergency brake {%katex%} EB = 0 {%endkatex%}.

6. **{%katex%} \varphi_5 {%endkatex%}**: Transition from Warning Status to Intervention Status
   {%katex%}
   \varphi_5 \equiv (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1)
   {%endkatex%}
   - In WS, if either {%katex%} g_{\text{ebi1}} {%endkatex%} or {%katex%} g_{\text{ebi2}} {%endkatex%} is satisfied, the system moves to IS and applies the emergency brake {%katex%} EB = 1 {%endkatex%}, with no change to the warning signal {%katex%} W {%endkatex%}.

7. **{%katex%} \varphi_6 {%endkatex%}**: Intervention Status with Speed Above Zero
   {%katex%}
   \varphi_6 \equiv (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1)
   {%endkatex%}
   - When in IS, as long as {%katex%} V_{\text{est}} {%endkatex%} remains above zero, the system stays in IS, maintaining the warning {%katex%} W {%endkatex%} and the emergency brake {%katex%} EB = 1 {%endkatex%}.

8. **{%katex%} \varphi_7 {%endkatex%}**: Transition from Intervention Status to Normal Status at Complete Stop
   {%katex%}
   \varphi_7 \equiv (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
   {%endkatex%}
   - When in IS, if {%katex%} V_{\text{est}} {%endkatex%} drops to zero, the system returns to NS, with both warning {%katex%} W = 0 {%endkatex%} and emergency brake {%katex%} EB = 0 {%endkatex%} disengaged.

As we can see from the above descriptions, the math describes the correct behavior much more precisely and concisely than natural language. While it might seem confusing at first glance, once you get used to it, you will start to appreciate the elegance of formal mathematics.

# The labeling function

With transition relations broken down into pieces, we now move on to the next element in the Kripke structure—the labeling function ({%katex%} L {%endkatex%}). We know that the labeling function ({%katex%} L {%endkatex%}) maps each state to a set of atomic propositions that are true in that state. So the key here is to know what the set of atomic propositions are, and then this function will tell us which of those propositions will be true at a given state.

Mathematically, the concept of the labeling function is defined as:

> {%katex%}
\forall s \in S : L(s) = \{ p \in AP \mid s(p) \}
{%endkatex%}

As expected, this formula describes the **labeling function** {%katex%}L{%endkatex%}, which assigns a set of atomic propositions that are true in each state. Here is how to read it and what it means:

- The **upside-down A symbol**, written as {%katex%} \forall {%endkatex%}, is a mathematical symbol that means "for all" or "for every." 

- The **crooked E** written as {%katex%} \in {%endkatex%} is used in mathematics to denote "element of" or "belongs to."

- **{%katex%}\forall s \in S{%endkatex%}**: This means "for all {%katex%}s{%endkatex%} in {%katex%}S{%endkatex%}." Remember, {%katex%}S{%endkatex%} is the set of all states in the system. This part of the expression indicates that the labeling function {%katex%}L{%endkatex%} is defined for each state {%katex%}s{%endkatex%} in {%katex%}S{%endkatex%}.

- **{%katex%}L(s){%endkatex%}**: The labeling function {%katex%}L{%endkatex%} applied to state {%katex%}s{%endkatex%} returns a set of atomic propositions that hold true in that state. In other words, {%katex%}L(s){%endkatex%} is the set of all propositions in {%katex%}AP{%endkatex%} (the set of atomic propositions) that are true in state {%katex%}s{%endkatex%}.

- **{%katex%}\{ p \in AP \mid s(p) \}{%endkatex%}**: This is **set-builder notation** again. This set represents the set of all atomic propositions {%katex%}p{%endkatex%} in {%katex%}AP{%endkatex%} for which {%katex%}s(p){%endkatex%} is true. Here:
  - **{%katex%}p \in AP{%endkatex%}**: {%katex%}p{%endkatex%} is an atomic proposition that belongs to the set of all atomic propositions {%katex%}AP{%endkatex%}.
  - **{%katex%}s(p){%endkatex%}**: This notation implies that {%katex%}p{%endkatex%} holds (is true) in the state {%katex%}s{%endkatex%}. So, {%katex%}s(p){%endkatex%} is true if the proposition {%katex%}p{%endkatex%} is valid in state {%katex%}s{%endkatex%}. Note that we implicitly assume that {%katex%} p(s) {%endkatex%} has the value True. In other words, we don’t explicitly write {%katex%} p(s) = \text{True} {%endkatex%} because it's understood that mentioning {%katex%} p(s) {%endkatex%} alone implies that {%katex%} p(s) {%endkatex%} is true in the given context. This simplification helps keep the math notation concise and avoids redundancy.

After breaking down the formula, we see that it states for each state {%katex%}s{%endkatex%} in the system, the labeling function {%katex%}L(s){%endkatex%} returns the set of all atomic propositions {%katex%}p{%endkatex%} that are true in {%katex%}s{%endkatex%}. This allows us to understand which properties or conditions hold in each state of the Kripke structure describing the system.

Because the labeling function depends on the atomic propositions, let's move on and try to define what the actual atomic propositions are for the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller).

# The atomic propositions

We've finally reached the **atomic propositions** which are grouped together in the set {%katex%}AP{%endkatex%}. But let's define what these atomic propositions are and what they represent. What is an atomic proposition?

The term **atomic proposition** is commonly used in formal logic and system modeling to describe basic, indivisible statements that can be true or false in a given state of a system. It can be thought of as a **basic condition**. Here’s a breakdown of each word:

1. **Atomic**:
   The word "atomic" comes from the Greek word "atomos," meaning "indivisible." For system modeling, "atomic" means that the proposition is a fundamental, indivisible statement that cannot be broken down into smaller logical components. For example, "the train’s estimated speed is greater than the maximum allowed speed" is an atomic statement because it cannot be further simplified in the model.

2. **Proposition**:
   In logic, a proposition is a declarative statement that is either true or false. In the context of system modeling, a proposition represents a specific condition or property that can hold in a given state. For example, "emergency brake is active" could be a proposition that is true if the brake is on and false if it is off.

Therefore, an **atomic proposition** is a simple, indivisible statement that cannot be broken down further and cannot contain other logical operators such as {%katex%}\land{%endkatex%} (AND) or {%katex%}\lor{%endkatex%} (OR), about a specific condition in the system that can be true or false.

Knowing the atomic propositions is critical for testing, and ideally, this would be the first question a tester asks before testing any system: What is the complete set of **atomic propositions** for the system? 

The reason why knowing **atomic propositions** is critical to testing is that from them you can build **equivalence classes** that can provide exhaustive test coverage if the list of atomic propositions is itself exhaustive and matches the atomic propositions of the actual implementation.

This is the main point of the [*Exhaustive Model-Based Equivalence Class Testing* by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4) paper, which shows that under certain conditions, exhaustive testing is possible using equivalence classes if the model of the system is known. Here’s a quote from the abstract:

> "We prove that a finite collection of input traces whose elements have been selected from a specific set of input equivalence classes suffices to prove a conformance relation between the specification model and the system under test."

For the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller), the paper states that the complete set of atomic propositions is:

> {%katex%}
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{%endkatex%}

But how do you build this list, or more precisely, this set? The answer is simple: You can get it from the transition relation {%katex%}R{%endkatex%} specified as a predicate. Why? Because a **predicate** is a statement or function that contains variables and becomes a **proposition** when specific values are assigned to those variables.

> "A **predicate** is a statement or function that contains variables and becomes a **proposition** when specific values are assigned to those variables."

Here is {%katex%}R{%endkatex%} again from which we can pull out the atomic propositions:

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \\
\quad \varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) \lor \\
\quad \varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) \lor \\
\quad \varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) \lor \\
\quad \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
{%endkatex%}

We also need the definitions of both guard conditions:

> {%katex%}
g_{\text{ebi1}} \equiv V_{\text{MRSP}} > 110 \land V_{\text{est}} > V_{\text{MRSP}} + 15 \\
g_{\text{ebi2}} \equiv V_{\text{MRSP}} \leq 110 \land V_{\text{est}} > V_{\text{MRSP}} + 7.5
{%endkatex%}

If we go through each {%katex%}\varphi {%endkatex%} predicate, we can list all the atomic propositions (conditions). Let’s go from top to bottom. For each {%katex%}\varphi {%endkatex%}, we’ll move from left to right and identify all unique propositions. Note that it might not be intuitive, but statements such as {%katex%}\ell = \text{NS}{%endkatex%} are propositions because they can evaluate to either true or false. How come? Because {%katex%}\ell{%endkatex%} can be equal to the value {%katex%}\text{NS}{%endkatex%} or not. Each proposition will include one of the variables that are part of the state, which we know is described by a tuple that contains all input, model (internal), and output variables. Given that {%katex%}s = (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){%endkatex%}, we are looking for propositions related to {%katex%}V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB{%endkatex%} variables.

Ok, let's get started.

From {%katex%}\varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) {%endkatex%} we get:

> {%katex%}
\ell = \text{NS}, V_{\text{est}} \leq V_{\text{MRSP}}
{%endkatex%}

We skip {%katex%}W' = W{%endkatex%} and {%katex%}EB' = EB{%endkatex%} because these propositions say that these variables will not change and nothing about what the actual values of these variables are. However, we know that the initial state has these variables set to {%katex%}W = 0, EB = 0{%endkatex%}, which means that the warning signal is off and emergency braking is off as well. Thus, we can add them as:

> {%katex%}
\ell = \text{NS}, V_{\text{est}} \leq V_{\text{MRSP}}, W = 0, EB = 0
{%endkatex%}

From {%katex%}\varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){%endkatex%} we get:

> {%katex%}
V_{\text{est}} > V_{\text{MRSP}}, \ell = \text{WS}, W = 1
{%endkatex%}

Note we don't repeat atomic propositions that we've already picked. We only look for the new ones. Therefore, because we already have {%katex%}\ell = \text{NS}{%endkatex%}, we don’t need to add it.

From {%katex%}\varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) {%endkatex%} we get:

> {%katex%}
V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 15,
V_{\text{MRSP}} \leq 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, \ell = \text{IS}, EB = 1
{%endkatex%}

Remember, because propositions are atomic, we took the definitions of {%katex%}g_{\text{ebi1}}{%endkatex%} and {%katex%}g_{\text{ebi2}}{%endkatex%} and broke them down into atomic parts:
{%katex%}
g_{\text{ebi1}} \equiv V_{\text{MRSP}} > 110 \land V_{\text{est}} > V_{\text{MRSP}} + 15 \\
g_{\text{ebi2}} \equiv V_{\text{MRSP}} \leq 110 \land V_{\text{est}} > V_{\text{MRSP}} + 7.5
{%endkatex%}<br><br>

From {%katex%}\varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){%endkatex%} we get:

> {%katex%}
V_{\text{est}} \leq V_{\text{MRSP}} + 15, V_{\text{est}} \leq V_{\text{MRSP}} + 7.5
{%endkatex%}

This is because we already have {%katex%}\ell = \text{WS}{%endkatex%} and {%katex%}V_{\text{est}} > V_{\text{MRSP}}{%endkatex%}. The {%katex%}\neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) = \neg(g_{\text{ebi1}}) \land  \neg(g_{\text{ebi2}}){%endkatex%} by using [De Morgan's Law](https://en.wikipedia.org/wiki/De_Morgan's_laws).

Thus, {%katex%} \neg(g_{\text{ebi1}}) = V_{\text{MRSP}} \leq 110 \lor V_{\text{est}} \leq V_{\text{MRSP}} + 15 {%endkatex%} and {%katex%} \neg(g_{\text{ebi2}}) = V_{\text{MRSP}} > 110 \lor V_{\text{est}} \leq V_{\text{MRSP}} + 7.5 {%endkatex%}, from which we get two new propositions.

From {%katex%}\varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {%endkatex%} we don't get anything new.

From {%katex%} \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) {%endkatex%} we don’t get anything new either.

From {%katex%}\varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1){%endkatex%} we get:

> {%katex%}
V_{\text{est}} > 0
{%endkatex%}

Finally, from {%katex%} \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {%endkatex%} we get:

> {%katex%}
V_{\text{est}} = 0 
{%endkatex%}

Now, let's combine all these propositions into one set as follows:

> {%katex%}
AP_{our} = \{ \\
\quad \ell = \text{NS}, V_{\text{est}} \leq V_{\text{MRSP}}, W = 0, EB = 0, \\
\quad V_{\text{est}} > V_{\text{MRSP}}, \ell = \text{WS}, W = 1, \\
\quad V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad V_{\text{MRSP}} \leq 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, \ell = \text{IS}, EB = 1, \\
\quad V_{\text{est}} \leq V_{\text{MRSP}} + 15, V_{\text{est}} \leq V_{\text{MRSP}} + 7.5, \\
\quad V_{\text{est}} > 0, \\
\quad V_{\text{est}} = 0 \\  
\}
{%endkatex%}

But this does not match the expected:

> {%katex%}
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{%endkatex%}

This discrepancy arises because our set includes redundant propositions. **The redundant propositions are those which are just negations or dependencies of other propositions.** So, let's go through our list and identify all the redundancies to match the expected result above.

## Removing redundant propositions

Upon careful observation, we find the following redundant propositions:

- {%katex%}V_{\text{est}} > 0{%endkatex%} is redundant because {%katex%}\neg(V_{\text{est}} = 0) = (V_{\text{est}} > 0){%endkatex%}. We assume the estimated speed cannot be negative, so {%katex%}V_{\text{est}} > 0{%endkatex%} is implicit and not necessary as an atomic proposition.
  
- {%katex%}V_{\text{est}} \leq V_{\text{MRSP}}{%endkatex%} is redundant because it’s just {%katex%}\neg(V_{\text{est}} > V_{\text{MRSP}}){%endkatex%}.

- {%katex%}V_{\text{MRSP}} \leq 110{%endkatex%} is redundant because it’s simply {%katex%}\neg(V_{\text{MRSP}} > 110){%endkatex%}.

- {%katex%}V_{\text{est}} \leq V_{\text{MRSP}} + 7.5{%endkatex%} and {%katex%}V_{\text{est}} \leq V_{\text{MRSP}} + 15{%endkatex%} are redundant as they are simply the negations of {%katex%}V_{\text{est}} > V_{\text{MRSP}} + 7.5{%endkatex%} and {%katex%}V_{\text{est}} > V_{\text{MRSP}} + 15{%endkatex%}, respectively.

- {%katex%}W = 0{%endkatex%} is redundant because it’s just {%katex%}\neg(W = 1){%endkatex%}, which can be simplified to the atomic proposition {%katex%}W{%endkatex%}.

- {%katex%}EB = 0{%endkatex%} is redundant because it’s simply {%katex%}\neg(EB = 1){%endkatex%}, so we can simplify it to {%katex%}EB{%endkatex%}.

Removing these redundant propositions gives us the following set:

> {%katex%}
AP_{our} = \{ \\
\quad \ell = \text{NS}, \cancel{V_{\text{est}} \leq V_{\text{MRSP}}}, \cancel{W = 0}, \cancel{EB = 0}, \\
\quad V_{\text{est}} > V_{\text{MRSP}}, \ell = \text{WS}, W = 1, \\
\quad V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \cancel{V_{\text{MRSP}} \leq 110}, V_{\text{est}} > V_{\text{MRSP}} + 7.5, \ell = \text{IS}, EB = 1, \\
\quad \cancel{V_{\text{est}} \leq V_{\text{MRSP}} + 15}, \cancel{V_{\text{est}} \leq V_{\text{MRSP}} + 7.5}, \\
\quad \cancel{V_{\text{est}} > 0}, \\
\quad V_{\text{est}} = 0 \\  
\}
{%endkatex%}

After removing all the crossed-out redundant propositions and rearranging the elements, we get the set of atomic propositions as stated in the paper:

> {%katex%}
AP_{our} \equiv AP, \text{where}\\
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{%endkatex%}

With the set of atomic propositions in hand, we can easily create equivalence classes that can be used in testing as described in [Using Atomic Propositions and Equivalence Classes (Part 1)](..using-atomic-propositions-and-equivalence-classes-part1/) and [Using Atomic Propositions and Equivalence Classes (Part 2)](..using-atomic-propositions-and-equivalence-classes-part2/).

# Conclusion

We've successfully decoded the formal description of a simple train control system, the [Ceiling Speed Monitoring Controller](#Ceiling-speed-monitoring-controller), as described in [*Exhaustive Model-Based Equivalence Class Testing* by W. Huang and J. Peleska, 2013](https://link.springer.com/chapter/10.1007/978-3-642-41707-8_4). In the paper, the system was formally described using a Kripke structure. We’ve explored what a Kripke structure is, examined each component used to define it, and saw how it applies to the controller. We closely analyzed how a transition relation can be specified as a predicate—a mathematical formula—and how, from it, we can extract a set of atomic propositions that allow for the construction of equivalence classes to implement test cases.

When a complete list of atomic propositions is known for a given implementation, the set of test cases constructed from equivalence classes can result in an exhaustive test suite. This level of rigor is hard to achieve without a clear understanding and application of formal mathematics. While tackling formal definitions can be challenging at first, I hope this article, where I aimed to explain the math in as much detail as possible, will inspire more test engineers to embrace it. Formal concepts provide a strong foundation for thinking about systems we test in an abstract and structured way—a critical skill when testing real-world software systems.
