---
post: true
title: "Transforming Testing Behavior Models into Formal Models"
description: An article about transforming software testing behavior models into formal mathematical representations for rigorous system validation. 
date: 2025-01-27
author: Vitaliy Zakaznikov
image: images/transforming-testing-behavior-models-into-formal-models.png
icon: fas fa-glasses pt-5 pb-5
---

Most software systems do not come with formal models. However, formal models are invaluable for constructing comprehensive test suites based on atomic propositions and for verifying the correctness of a system's behavior using tools like [TLA+](https://en.wikipedia.org/wiki/TLA%2B).

In the previous article, [Testing Simple Train Control System Using Its Formal Description](/blog/testing-simple-train-control-system-using-formal-description/), we explored how a formal model can be used to create a behavior model, which, in turn, was leveraged to calculate expected results for tests. However, in real-world applications, the inverse process—deriving a formal model from a behavior model developed during testing—is even more powerful.

In this article, we'll explore exactly that process: how a testing behavior model can be transformed into a formal model. This approach opens up another dimension in understanding and testing software systems, offering a deeper level of rigor and insight.<!-- more -->

## What are behavior and formal models?

Before diving into the process of transforming a behavior model into a formal model,
it’s important to understand the distinction between the two. These two types of models serve
different purposes but complement each other.

### Behavior model

A behavior model represents a system’s behavior by using a sequence of states and calculating
the expected values in the current state based on that specific sequence.
It is an essential tool because it provides a structured way to calculate and verify
the system’s expected behavior under various conditions.

In testing, a behavior model allows for a clear separation of test procedures
into user or system actions and assertions. Test scenarios become a sequence of pure actions,
with all assertions performed by the behavior model. Behavior models become indispensable
as testing scales beyond a few scenarios to hundreds, thousands, or even millions of combinations
of user and system actions. In such cases, the expected results cannot be hard-coded into the
tests and must instead be dynamically calculated.

> The behavior model is used to separate assertions from user and system actions to calculate expected results.

The behavior model is typically implemented in Python as a class that defines
an `expect` method. This method takes a sequence of states (the behavior) and
either returns the expected action that performs the assertions or directly calls the assertions
before returning. In code, it looks like the following:

```python
class Model:
    """Behavior model."""
    def expect(self, behavior):
        # calculate expected values in the current state
        # using the sequence of previous states
        pass
```

A more detailed introduction to behavior models, along with a specific example, can be found in
the article [Combinatorial Testing Using a Behavior Model](/blog/combinatorial-testing-behavior-model).

In summary:

* **Code-implemented**: The behavior model is implemented in code, often using a programming language like Python.
* **State-centric**: The behavior model calculates the expected values in the current state of the system based on prior states.
* **Test-focused**: It serves as a foundation for generating expected results and validating the system’s behavior during testing.

### Formal model

A formal model provides a mathematical representation of a system, enabling precise verification of its properties. Formal models allow engineers to verify logical correctness, uncover inconsistencies, and prove properties such as safety (something bad never happens) and liveness (something good eventually happens).

One common formal model is a [Kripke structure](https://en.wikipedia.org/wiki/Kripke_structure_(model_checking)), which is defined as a tuple {% katex %} (S, S_0, R, L, AP) {% endkatex%}. Here:
- {% katex %}S{% endkatex %} is the set of states.
- {% katex %}S_0{% endkatex %} represents the initial state(s).
- {% katex %}R{% endkatex %} is the transition relation representing valid transitions between states.
- {% katex %}L{% endkatex %} is a labeling function that maps states to atomic propositions.
- {% katex %}AP{% endkatex %} is the set of atomic propositions.

The key component of this model is the transition relation ({% katex %}R{% endkatex %}), which describes how the system transitions from one state to another. This relation can be expressed as a predicate, mapping directly to the behavior model. A **predicate** is a statement or function that contains variables and becomes a **proposition** when specific values are assigned to those variables.

The transition relation ({% katex %}R{% endkatex %}) is simply a logical disjunction (logical `OR`) of different predicates:

* {%katex%}R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s'){%endkatex%}

If mathematical notation feels intimidating, you can think of the above definition as Python code. In this representation, each function `phi` takes the current state `s` and the next state `s_prime`, and when certain conditions are met, it either updates or preserves the values in the next state `s_prime`.

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

The key point is that the state transitions defined in the behavior model align with the predicates (logical conditions) in the transition relation {% katex %}R{% endkatex %}. This alignment creates a seamless link between the practical behavior model and the formal Kripke structure.

> For a deeper understanding of formal models, refer to [Decoding Formal Description of a Simple Train Control System](/blog/decoding-formal-description-simple-train-control-system/), which explores the process of decoding a simple formal model.

### How they complement each other

The behavior model, implemented in code, provides an intuitive and practical way to represent and calculate system behavior during testing of the actual software implementation. In contrast, the formal model, with its mathematical precision, offers a deeper level of verification by proving properties about an abstract system. As a result, the behavior model is used to test an actual implementation of the system, while the formal model is used to verify the abstract system. This highlights the classical distinction between testing and verification: testing checks the actual implementation by running specific executions, whereas verification proves the correctness of an abstract system model using mathematical methods.

> "Testing checks the actual implementation by running specific executions, while verification proves the correctness of an abstract system model through mathematical methods."

Since both models represent the same system, there is naturally significant overlap between them. In an ideal software development cycle, the formal model is defined first, and the correctness of the abstract system is verified before any implementation code is written. From the formal model, it is straightforward to define a corresponding behavior model. However, given that formal models are rare in real-world production software, extracting a formal model from a behavior model is a practical technique for obtaining a full or partial formal model.

## Demonstrating transformation using an example

As an example of transforming a testing behavior model into a formal model, we'll revisit the Ceiling Speed Monitoring Controller (CSMC) introduced in the previous articles: [Decoding Formal Description of a Simple Train Control System](/blog/decoding-formal-description-simple-train-control-system/) and [Testing Simple Train Control System Using Its Formal Description](/blog/testing-simple-train-control-system-using-formal-description/).

While this is a contrived example, given that we already know the formal model for the controller, it serves as a clear and practical demonstration of the procedure, highlighting the relationship between the two models.

The testing behavior model for this system was implemented in Python using the following `Model` class. While many engineers may find abstract mathematical definitions challenging, reading and understanding the code is relatively straightforward and intuitive.

Creating behavior models like this from scratch is also not particularly difficult. For an example of how to write such models, refer to the article [Combinatorial Testing: Writing Behavior Model](/blog/combinatorial-testing-behavior-model/).

Now, let's return to our train control model. Here it is:

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

To begin transforming the behavior model into a formal model, we must remember that the transition relation {% katex %}R{% endkatex %} in the Kripke structure {% katex %}(S, S_0, R, L, AP){% endkatex %} is expressed as a predicate and directly maps to the behavior model.

It is also important to understand that this predicate:

* {% katex %}R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s'){% endkatex %}

is essentially a logical statement combining multiple logical functions with a disjunction (logical `OR`).

This structure is highly convenient because it allows the model to be built piece by piece, using logical functions, making it inherently composable.

Let’s get started with a top-down transformation approach. We'll begin with the `expect` method and work our way down.

#### The `expect` method

Let’s formalize the `expect` method:

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

* {% katex %}R(s, s') \equiv {normal\_status} \lor {warning\_status} \lor {emergency\_brake\_status} {% endkatex %}

Where:

1. **`behavior`**: Contains the current state {% katex %}s{% endkatex %} and the next state {% katex %}s'{% endkatex %}.  
   It’s important to note that the behavior model can be thought of as lagging behind the formal model. What the behavior model considers the "current state" for calculating expected values corresponds to the "next state" in the formal model.

2. **`normal_status`, `warning_status`, and `emergency_brake_status`**: These are individual logical functions (predicates) that are combined using the logical `OR` operator to form the complete transition relation. Each predicate aligns with a corresponding method in the behavior model.

While this transition relation provides the overall structure, it lacks detailed definitions for each logical function. We’ll now examine each part in detail to complete the formal model.

#### The `expect_normal_status` method

The `expect_normal_status` method is defined as follows:

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

The formal definition of this function can be obtained as follows. For convenience, it is included as inline comments within the code, making it easier to align the mathematical expressions with the corresponding implementation.


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

Here, {% katex %}\ell{% endkatex %} represents the internal state variable, which can be {% katex %}\{NS, WS, EB\}{% endkatex %}, corresponding to `normal status` (NS), `warning status` (WS), or `emergency brake status` (EB) of the controller.

It is important to note that what the behavior model considers to be the "current state" is actually the "next state" in the context of the formal model. Similarly, what the behavior model refers to as the "previous state" corresponds to the "current state" in the formal model.

The values of the next state are encapsulated within the `expect_normal_status` action, which is defined by the test program as follows:


```python
@TestStep(Then)
def expect_normal_status(self, state, W, EB):
    """Expect normal status."""
    assert state == "NS", f"expected state NS but got {state}"
    assert W == 0, f"expected W=0 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"
```

Combining these three {% katex %}\varphi{% endkatex %} expressions, we can concretely define `normal_status` as follows:

* {% katex %}{normal\_status} \equiv \varphi_0 \lor \varphi_4 \lor \varphi_7 {% endkatex %}

Where:

* {% katex %}\varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) {% endkatex %}
* {% katex %}\varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {% endkatex %}
* {% katex %}\varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) {% endkatex %} 

Now, the definition of {% katex %}{normal\_status}{% endkatex %} is precise, as it is fully expressed in terms of:
- The internal variable {% katex %}\ell{% endkatex %},
- The input variable {% katex %}V_{\text{est}}{% endkatex %},
- The output variables {% katex %}W{% endkatex %} and {% katex %}EB{% endkatex %}, and
- The corresponding next-state variables {% katex %}\ell'{% endkatex %}, {% katex %}W'{% endkatex %}, and {% katex %}EB'{% endkatex %}.


#### The `expect_warning_status` method

Using a similar approach to the one applied for the `expect_normal_status` method, we can derive the formal definition of the `expect_warning_status` method, which is defined as follows:

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

Again, let’s include these definitions as inline comments to easily compare the mathematical expressions with the code.

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

The `expect_warning_status` action defines the values for the next state:

```python
@TestStep(Then)
def expect_warning_status(self, state, W, EB):
    """Expect warning status."""
    assert state == "WS", f"expected state WS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"
```

Combining the {% katex %}\varphi{% endkatex %} expressions, we can concretely define `warning_status` as follows:

* {% katex %}{warning\_status} \equiv \varphi_1 \lor \varphi_3 {% endkatex %}

Where:

* {% katex %}\varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){% endkatex %}
* {% katex %}\varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB){% endkatex %}

This precisely defines the {% katex %}{warning\_status}{% endkatex %} predicate. Now, we are left to define the {% katex %}{emergency\_brake\_status}{% endkatex %}.


#### The `expect_emergency_brake_status` method

By now, you likely have a sense of the process. The `expect_emergency_brake_status` method is defined as follows:

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

By carefully analyzing the code, we can extract the formal definitions:

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

The `expect_emergency_brake_status` action defines the values for the next state:

```python
@TestStep(Then)
def expect_emergency_brake_status(self, state, W, EB):
    """Expect emergency brake status."""
    assert state == "IS", f"expected state IS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 1, f"expected EB=1 but got {EB}"
```

Combining the {% katex %}\varphi{% endkatex %} expressions above, we define `emergency_brake_status` as follows:

* {% katex %}{emergency\_brake\_status} \equiv \varphi_2 \lor \varphi_5 \lor \varphi_6 {% endkatex %}

Where:

* {% katex %}\varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) {% endkatex %}
* {% katex %}\varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) {% endkatex %}
* {% katex %}\varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) {% endkatex %}

The {% katex %}{emergency\_brake\_status}{% endkatex %} predicate is now complete.

### Putting the transition relation together

We can now precisely define the transition relation obtained from the `expect` method:

* {% katex %}R(s, s') \equiv {normal\_status} \lor {warning\_status} \lor {emergency\_brake\_status} {% endkatex %}

By substituting the definitions for each status predicate, we arrive at the final formal definition of the transition relation as follows:

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

Where:

* {% katex %}s: (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){% endkatex %}
* {% katex %}s': (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB') {% endkatex %}

### Completing the formal model

With the transition relation {% katex %}R{% endkatex %} expressed as a predicate derived from the testing behavior model, we can now complete the rest of the Kripke structure {% katex %}(S, S_0, R, L, AP){% endkatex %}.

The most challenging aspect is deriving the set of atomic propositions. Fortunately, since we have worked with this formal model before, the full procedure is detailed in the article [Decoding Formal Description of a Simple Train Control System](/blog/decoding-formal-description-simple-train-control-system/#The-atomic-propositions).

From that procedure, the set of atomic propositions for this model is:

* {% katex %}
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{% endkatex %}

The set of states {% katex %}S{% endkatex %} is theoretically infinite since each state is represented by {% katex %}s: (V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB){% endkatex %}, where {% katex %}V_{\text{est}}{% endkatex %} is an input variable with an infinite domain. However, a finite set can be obtained by using equivalence classes.

Similarly, the set of initial states {% katex %}S_0{% endkatex %} is also infinite because the system could restart in the middle of the train's movement, leading to a dependency on {% katex %}V_{\text{est}}{% endkatex %}.

Finally, the labeling function ({% katex %}L{% endkatex %}) maps each state to the set of atomic propositions that are true for that state. While the set of states {% katex %}S{% endkatex %} is infinite, the labeling function can be defined piecewise using equivalence classes derived from the set of atomic propositions. For more details on deriving equivalence classes, refer to [Building test input sequences](/blog/testing-simple-train-control-system-using-formal-description/#Building-test-input-sequences), where this process is explained in depth.

### Conclusion

In this article, we explored the procedure for transforming a testing behavior model into a formal model. Specifically, we demonstrated how a behavior model implemented in code can be translated into a transition relation ({% katex %}R{% endkatex %}) represented as a predicate. To illustrate this process, we used the Ceiling Speed Monitoring Controller example, which allowed for a direct comparison between deriving a behavior model from a formal model and then reversing the process to transform the behavior model back into a formal model.

Obtaining formal models for real-world systems is a challenging task. This is largely because many engineers have limited experience with abstract mathematical concepts, and thinking about systems in an abstract way often feels unintuitive.

However, in this article, we showed that testing behavior models written in Python can be transformed into formal models. Furthermore, we demonstrated how code can be converted into mathematical formulas that can be utilized in tools like [TLA+](https://en.wikipedia.org/wiki/TLA%2B) to formally verify system properties.