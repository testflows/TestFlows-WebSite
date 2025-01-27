---
post: true
title: "Transforming Testing Behavior Models into Formal Models"
description: An article about how to transform testing behavior models of the software system to formal mathematical models.
date: 2025-01-03
author: Vitaliy Zakaznikov
image: images/transforming-testing-behavior-models-into-formal-models.png
icon: fas fa-glasses pt-5 pb-5
---

Most software systems do not come with formal models. However, formal models are invaluable for constructing comprehensive test suites based on atomic propositions and for verifying the correctness of a system's behavior using tools like [TLA+](https://en.wikipedia.org/wiki/TLA%2B).

In the previous article, [Testing Simple Train Control System Using Its Formal Description](../testing-simple-train-control-system-using-formal-description/), we explored how a formal model can be used to create a behavior model, which, in turn, was leveraged to calculate expected results for tests. However, in real-world applications, the inverse process—deriving a formal model from a behavior model developed during testing—is even more powerful.

In this article, we'll explore exactly that process: how a testing behavior model can be transformed into a formal model. This approach opens up another dimension in understanding and testing software systems, offering a deeper level of rigor and insight.<!-- more -->

## What are behavior and formal models?

Before diving into the process of transforming behavior model into the formal model,
it’s important to understand the distinction between the two. These two types of models serve different purposes
but complement each other in testing and verification.

### Behavior model

A behavior model is a representation of a system’s behavior that uses a sequence of states, the behavior,
and calculates the expected values in the current state based on that specific sequence.
It is an essential tool, as it provides a structured way to predict and verify
the system’s expected behavior under various conditions.

In testing, a behavior model allows to cleanly
separate test procedures into user or system actions and assertions, where the test scenario becomes a sequence
of pure actions and all assertions are performed by the behavior model.
Behavior models come to life as testing scales beyond a few scenarios and the coverage is pushed
to hundreds, thousands, or millions of combinations of user and system actions where the expected
result can't be hard-coded into the tests but must be dynamically calculated.

> The behavior model is used to separate assertions from user and system actions to calculate
> expected results.

The behavior model is implemented in Python usually as a class that implements the `expect` method
which takes a sequence of states (the behavior) and either returns the expected action that does
assertions or calls the assertions directly before returning. In code, it looks like the following:

```python
class Model:
    """Behavior model."""
    def expect(self, behavior):
        # calculate expected values in the current state
        # using the sequence of previous states
        pass
```

A more detailed introduction to behavior models with the specific example can be found
in the article [Combinatorial Testing Using a Behavior Model](../combinatorial-testing-behavior-model).

In summary:

* *Code-implemented*: The behavior model is implemented in code such as a Python programming language.
* *State-centric*: The behavior model calculates the expected values in the current state of the system based on the prior states.
* *Test-focused*: It serves as a foundation for generating expected results and validating the system’s behavior during testing.

### Formal model

A formal model provides a mathematical representation of a system, enabling precise verification of its properties. Formal models allow engineers to verify logical correctness, uncover inconsistencies, and prove properties like safety (something bad never happens) and liveness (something good eventually happens).

One common formal model is a [Kripke structure](https://en.wikipedia.org/wiki/Kripke_structure_(model_checking)), which is defined as a tuple {% katex %} (S, S_0, R, L, AP) {% endkatex%}. Where, {%katex%}S{%endkatex%} is a set of states, {%katex%}S_0{%endkatex%} are the initial state(s), {%katex%}R{%endkatex%} is the transition relation representing valid transitions between states, {%katex%}L{%endkatex%} is a labeling function mapping states to atomic propositions, and {%katex%}AP{%endkatex%} is a set of atomic propositions.

The main part in this model is the transition relation ({%katex%}R{%endkatex%}), which describes how the system moves from one state to another. This relation can be expressed as a predicate and maps directly to the behavior model where a **predicate** is a statement or function that contains variables and becomes a **proposition** when specific values are assigned to those variables.

The transition relation ({%katex%}R{%endkatex%}) is just a logical disjunction (logical `OR`) of
different predicates:

* {%katex%}R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s'){%endkatex%}

If you are not that good at reading math, you can think of the above definition as the following Python code where each function `phi` takes current state `s` and the next state `s_prime` and when some condition is met sets new or keeps the same values in the next state `s_prime`.

```python
# Define the phi functions where each maps to a single predicate (condition)
def phi_0(s, s_prime):
    # Define the condition for phi_0
    return some_condition_0(s, s_prime)

def phi_1(s, s_prime):
    # Define the condition for phi_1
    return some_condition_1(s, s_prime)

def phi_2(s, s_prime):
    # Define the condition for phi_2
    return some_condition_2(s, s_prime)

# ... Define other phi functions as needed

def phi_n(s, s_prime):
    # Define the condition for phi_n
    return some_condition_n(s, s_prime)

# List of phi functions
phi_functions = [phi_0, phi_1, phi_2, ..., phi_n]

# Define R(s, s')
def R(s, s_prime):
    # Use map to evaluate each phi function and any() for logical OR
    return any(map(lambda phi: phi(s, s_prime), phi_functions))
```

The important part is that the state transitions defined in the behavior model align with the predicates (a type of logical condition) in the transition relation {%katex%}R{%endkatex%}, creating a seamless link between the practical behavior model and the formal Kripke structure.

> If you want to understand formal models better, read [Decoding Formal Description of a Simple Train Control System](../decoding-formal-description-simple-train-control-system/) that goes into the details of decoding a simple formal model.

### How they complement each other

The behavior model is implemented in code and provides an intuitive and practical way to represent and calculate system behavior during testing of the actual software system implementation. The formal model, with its mathematical precision, offers a deeper level of verification of an abstract system by proving properties about the system. Therefore, behavior model is used to test an actual implementation of the system and the formal model is used to verify the abstract system. This is the classical distinction between testing vs verification. Testing checks the actual implementation by running specific executions, while verification proves the correctness of an abstract system model through mathematical methods.

> "Testing checks the actual implementation by running specific executions, while verification proves the correctness of an abstract system model through mathematical methods."

However, because both models are modeling the same system it is not coincidence there is a lot of overlap between them. In the ideal software development cycle, the formal modal is defined first and the correctness of the abstract system is verified even before a single line of implementation code is written.
From the formal model it is easy to define a corresponding behavior model. However, given that formal
models are hard to come by for actual production software extracting formal model from the behavior model
is practical technique in obtaining full or partial formal model.


### Example behavior model

As an example of transforming testing behavior model to formal model, we'll
again work with the Ceiling Speed Monitoring Contoller (CSMC) that
we've introduced in the previous articles [Decoding Formal Description of a Simple Train Control System](../decoding-formal-description-simple-train-control-system/), and [Testing Simple Train Control System Using Its Formal Description](../testing-simple-train-control-system-using-formal-description/).
While this is a very contrived example given that we already know what the formal model
for the controller is, it serves as a good example of the procedure given us
a clear relationship between the two models.

The testing behavior model for the system was implemented in Python using the following
`Model` class and while most engineers will have trouble working with abstract mathematical
definitions reading and understanding the code below is relatively straight forward and intuitive.

Writing such behavior models from scratch is also not so difficult, and you can find an example
in the [Combinatorial Testing: Writing Behavior Model](.../combinatorial-testing-behavior-model/).

But let's go back to our train control model. Here it is:

```python
class Model:
    """Ceiling Speed Monitoring Contoller (CSMC) behavior model."""

    def __init__(self, V_MRSP_threshold=110, g_ebi1_threshold=15, g_ebi2_threshold=7.5):
        self.V_MRSP_threshold = V_MRSP_threshold
        self.g_ebi1_threshold = g_ebi1_threshold
        self.g_ebi2_threshold = g_ebi2_threshold

    def g_ebi1(self, current_state):
        """Guard 1 condition (gₑᵦᵢ₁)."""
        return (
            current_state.V_MRSP > self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi1_threshold
        )

    def g_ebi2(self, current_state):
        """Guard 2 condition (gₑᵦᵢ₂)."""
        return (
            current_state.V_MRSP <= self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi2_threshold
        )

    def expect_normal_status(self, behavior):
        """Expect normal status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State == "NS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "WS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "IS":
            if current_state.V_est == 0:
                return expect_normal_status

    def expect_warning_status(self, behavior):
        """Expect warning status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in ("NS", "WS"):
            if current_state.V_est > current_state.V_MRSP:
                if not (self.g_ebi1(current_state) or self.g_ebi2(current_state)):
                    return expect_warning_status

    def expect_emergency_brake_status(self, behavior):
        """Expect emergency brake status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in "NS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "WS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "IS":
            if current_state.V_est > 0:
                return expect_emergency_brake_status

    def expect(self, behavior):
        """Return expected behavior."""
        return (
            self.expect_normal_status(behavior)
            or self.expect_warning_status(behavior)
            or self.expect_emergency_brake_status(behavior)
        )
```

### Transformation to formal model

To start the transformation of the behavior model to formal model we need to remember
that the transition relation, which is the {% katex %}R{% endkatex %} in the Kripke structure {% katex %} (S, S_0, R, L, AP) {% endkatex%}, expressed as a predicate maps directly to the behavior model.

It is also critical to understand that this predicate

* {%katex%}R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s'){%endkatex%}

is nothing but a logical statement that `OR`s a bunch of logical functions.

This is very convenient because it means that the model can be build by pieces (logical functions) and is easily composable.

Let's get started. We'll choose top-down transformation where we'll start with the `expect` method
and work our way down.

#### The `expect` method

Let's formalize the `expect` method. 

```python
    def expect(self, behavior):
        """Return expected behavior."""
        return (
            self.expect_normal_status(behavior)
            or self.expect_warning_status(behavior)
            or self.expect_emergency_brake_status(behavior)
        )
```

This method can be transformed into the following transition relation:

* {%katex%}R(s, s') \equiv {normal\_status} \lor {warning\_status} \lor {emergency\_brake\_status} {%endkatex%}

where,

* `behavior` contains the current state {% katex %}s{% endkatex %} and the next state {% katex %}s'{%endkatex%}.
   However, note that the behavior model can be thought of as lagging the actual model as
   what is considered by the behavior model to be the current state for which we are calculating the
   expected values is the next state in the formal model.

* `normal_status`, `warning_status`, and `emergency_brake_status` are individual logical functions, predicates,
  that are combined using the logical `OR` operator to give us the combined transition relation predicate
  and each of these predicates (logical functions) match the corresponding methods of the model. 

Of course, it is not enough for us to just leave the formal model defined by the above transition relation as
it lacks the details, but we can fill them in by now looking at each part individually.

#### The `expect_normal_status` method

The `expect_normal_status` method is defined as below.

```python
    def expect_normal_status(self, behavior):
        """Expect normal status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State == "NS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "WS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "IS":
            if current_state.V_est == 0:
                return expect_normal_status
```

The formal definition of this function can be read as follows and for convenience
is added as inline comments to the code so that it is easy to align the math with
the code. 

```python
    def expect_normal_status(self, behavior):
        """Expect normal status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State == "NS":
            # φ₀ : (ℓ = NS ∧ Vₑₛₜ ≤ Vₘᵣₛₚ ∧ ℓ′ = NS ∧ W′ = W ∧ EB′ = EB)
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "WS":
            # φ₄ : (ℓ = WS ∧ Vₑₛₜ ≤ Vₘᵣₛₚ ∧ ℓ′ = NS ∧ W′ = 0 ∧ EB′ = 0)
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "IS":
            # φ₇ : (ℓ = IS ∧ Vₑₛₜ = 0 ∧ ℓ′ = NS ∧ W′ = 0 ∧ EB′ = 0)
            if current_state.V_est == 0:
                return expect_normal_status
```

Here the {% katex %}l{%endkatex%} is the internal state variable
that can either be {% katex %}{NS}, {WS}, {EB}{%endkatex%} corresponding to `normal status` (NS),
`warning status` (WS), or `emergency brake status` (EB) of the controller.

Again, note that what behavior model considers to be the current state
is actually the next state in the context of the formal model and what the behavior
model calls the previous state in the context of the formal mode is the current state.

The values of the next state are actually hidden in the `expect_normal_status`
action which is defined as follows by the test program:

```python
@TestStep(Then)
def expect_normal_status(self, state, W, EB):
    """Expect normal status."""
    assert state == "NS", f"expected state NS but got {state}"
    assert W == 0, f"expected W=0 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"
```

Combining these three {%katex%}\varphi{%endkatex%} expressions we conretely define the `normal_status`
as follows:

* {%katex%}{normal\_status} \equiv \varphi_0 \lor \varphi_4 \lor \varphi_7 {%endkatex%}

where,

* {%katex%}\varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) {%endkatex%}
* {%katex%}\varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {%endkatex%}
* {%katex%} \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {%endkatex%} 

Now the definition of {%katex%}{normal\_status}{%endkatex%} is precise as it expressed completely in terms
of the internal variable {%katex%}\ell{%endkatex%}, input variable {%katex%}V_{\text{est}}{%endkatex%},
and output variables {%katex%}W, EB{%endkatex%} and the corresponding next state variables
{%katex%}\ell', W', EB'{%endkatex%}.


#### The `expect_warning_status` method

Following a similar approach that we've applied to the `expect_normal_status` method,
we can read the formal definition of the `expect_warning_status` method which is defined as follows:

```python
    def expect_warning_status(self, behavior):
        """Expect warning status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in ("NS", "WS"):
            if current_state.V_est > current_state.V_MRSP:
                if not (self.g_ebi1(current_state) or self.g_ebi2(current_state)):
                    return expect_warning_status
```

Again, let's add these definitions as inline comments to easily compare the math to the code.s

```python
    def expect_warning_status(self, behavior):
        """Expect warning status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in ("NS", "WS"):
            # φ₁ : (ℓ = NS ∧ Vₑₛₜ > Vₘᵣₛₚ ∧ ℓ′ = WS ∧ W′ = 1 ∧ EB′ = EB)
            # φ₃ : (ℓ = WS ∧ Vₑₛₜ > Vₘᵣₛₚ ∧ ¬(gₑᵦᵢ₁ ∨ gₑᵦᵢ₂) ∧ ℓ′ = WS ∧ W′ = 1 ∧ EB′ = EB)
            if current_state.V_est > current_state.V_MRSP:
                if not (self.g_ebi1(current_state) or self.g_ebi2(current_state)):
                    return expect_warning_status
```

The `expect_warning_status` action provides the values for the next state values:

```python
@TestStep(Then)
def expect_warning_status(self, state, W, EB):
    """Expect warning status."""
    assert state == "WS", f"expected state WS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"
```

Combining the {%katex%}\varphi{%endkatex%} expressions we concretely define the `warning_status`
as follows:

* {%katex%}{normal\_status} \equiv \varphi_1 \lor \varphi_3 {%endkatex%}

where,

* {%katex%}\varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){%endkatex%} 
* {%katex%}\varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){%endkatex%}

This precisely defines the {%katex%}{warning\_status}{%endkatex%} predicate. Now, we are only
left to define the {%katex%}{emergency\_brake\_status}{%endkatex%}.

#### The `expect_emergency_brake_status` method

At this point you most likely got a gist of how it goes. 
The `expect_emergency_brake_status` method is defined as follows:

```python
    def expect_emergency_brake_status(self, behavior):
        """Expect emergency brake status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in "NS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "WS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "IS":
            if current_state.V_est > 0:
                return expect_emergency_brake_status
```

Reading the code carefully, we extract the formal definitions:

```python
    def expect_emergency_brake_status(self, behavior):
        """Expect emergency brake status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in "NS":
            # φ₂ : (ℓ = NS ∧ (gₑᵦᵢ₁ ∨ gₑᵦᵢ₂) ∧ ℓ′ = IS ∧ W′ = 1 ∧ EB′ = 1)
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "WS":
            # φ₅ : (ℓ = WS ∧ (gₑᵦᵢ₁ ∨ gₑᵦᵢ₂) ∧ ℓ′ = IS ∧ W′ = W ∧ EB′ = 1)
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "IS":
            # φ₆ : (ℓ = IS ∧ Vₑₛₜ > 0 ∧ ℓ′ = IS ∧ W′ = W ∧ EB′ = 1)
            if current_state.V_est > 0:
                return expect_emergency_brake_status
```

The `expect_emergency_brake_status` action provide the next state values:

```python
@TestStep(Then)
def expect_emergency_brake_status(self, state, W, EB):
    """Expect emergency brake status."""
    assert state == "IS", f"expected state IS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 1, f"expected EB=1 but got {EB}"
```

Combining the {%katex%}\varphi{%endkatex%} expressions above we define the `emergengy_brake_status`
as follows:

* {%katex%}{emergency\_brake\_status} \equiv \varphi_2 \lor \varphi_5 \lor \varphi_6 {%endkatex%}

where,

* {%katex%}\varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) {%endkatex%}
* {%katex%} \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) {%endkatex%}
* {%katex%}\varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1){%endkatex%}

The {%katex%}{emergency\_brake\_status}{%endkatex%} predicate is ready.

### Putting the transition relation together

We can now precisely define the transition relation that we obtained from the `expect` method.

* {%katex%}R(s, s') \equiv {normal\_status} \lor {warning\_status} \lor {emergency\_brake\_status} {%endkatex%}

By simply substitution the definitions for each status predicate we obtain the final
formal definition of the transition relation as follows:

* {%katex%}
R(s, s') \equiv \\
\quad \varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) \lor \\
\quad \varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) \lor \\
\quad \varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) \lor \\
\quad \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
{%endkatex%}

where,

* {%katex%}s: (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){%endkatex%}
* {%katex%}s': (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB') {%endkatex%}

### Completing the formal model

Having transition relation {%katex%}R{%endkatex%} expressed as a predicate derived from the
testing behavior model we can use it to complete the rest of the Kripke structure {% katex %} (S, S_0, R, L, AP) {% endkatex%}.

The only non-trivial part is the derivation of the set of atomic propositions.
However, given that we've worked with this formal model before, you can find the 
full procedure of how to do it in the [Decoding Formal Description of a Simple Train Control System](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/#The-atomic-propositions)
article.

From there, the set of atomic proposition for this model is:

* {%katex%}
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{%endkatex%}

The set of states {% katex %} S {%endkatex%} would actually be infinite given that each state is
represented by {%katex%}s: (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){%endkatex%} where {% katex %}V_{est}{%endkatex%}
is an input variable with an infinite domain. However, a finite set could be obtained if we
use equivalent classes.

The set of initial states {% katex %}S_0{%endkatex%} is also infinite because the system
could be restarted in the middle of train's movement thus again having dependency on {% katex %}V_{est}{%endkatex%}.

Lastly, the labeling function ({%katex%}L{%endkatex%}), is a function that maps each state
to a set of atomic propositions that are true in that state. We've defined that set
of atomic propositions {%katex%}AP{%endkatex%} and know that the set of states {%katex%}S{%endkatex%}
is infinite. However, the label function can be defined piecewise using equivalent classes
derived from the set of atomic propositions. See the [Building test input sequences](https://testflows.com/blog/testing-simple-train-control-system-using-formal-description/#Building-test-input-sequences),
where we've worked out the equivalent classes.

### Conclusion

In this article we've looked at procedure of how testing behavior model can be transformed 
into formal model. Specifically, of how to transform the model represent by code into
a transition relation ({%katex%}R{%endkatex%}) represented as a predicate.
To demonstrate the procedure of transforming a testing behavior model into a formal model we've used
the Ceiling Speed Monitoring Contoller example that we've worked with before and therefore
facilitated the direct comparison of going from formal model to testing behavior model and then
transforming back testing behavior model into the formal model.

Obtaining formal models for real world systems is not a simple task. This is mostly because few
engineers have experience of working with abstract mathematical concepts and thinking about 
a system abstractly is not intuitive.

In this article, however, we showed that testing behavior models written in Python
can be transformed into formal models, and showed how code can be transformed to mathematical formulas
that then can be used in tools like [TLA+](https://en.wikipedia.org/wiki/TLA%2B) 
for formal verification of system properties.


