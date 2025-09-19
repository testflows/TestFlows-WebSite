---
post: true
title: "Testing Super Mario Using a Behavior Model (Part 2)"
description: An article about testing Super Mario game using a behavior model (Part 2). 
date: 2025-09-17
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model-part2.png
icon: fas fa-glasses pt-5 pb-5
---

When testing complex stateful systems like [*Super Mario*](https://en.wikipedia.org/wiki/Super_Mario_Bros/), behavior models are your secret weapon. Think of them as property-based testing on steroids. The game world is vast, with countless combinations of player positions, velocities, enemy states, and environmental conditions. This complexity makes it impractical to write classical test cases that cover any significant portion of the state space. At best, such tests can only form a sanity suite.

Imagine Mario sprinting through a level, dodging Goombas, collecting coins, and leaping over pits. Each action he takes depends on a myriad of factors: his speed, the timing of his jumps, the position of enemies, and even the layout of the level itself. Writing individual test cases for each scenario—like we showed in [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/)—would be like trying to count every grain of sand on a beach.

This is where behavior models shine. They decouple assertions about correct behavior from the test actions themselves, allowing us to focus on what the game should do rather than how to test it. This decoupling opens the door to applying various state space exploration techniques—whether through manual testing, automated scripts, or fully autonomous systems. The model becomes your universal correctness oracle, validating behavior across any path through Mario's world.<!-- more -->

Because behavior models are composable, we can build them incrementally—start with basic properties, then add complexity as needed. The [test oracle problem](https://en.wikipedia.org/wiki/Test_oracle) puts a fundamental boundary on how detailed any model can be, but behavior models acknowledge this reality and let us choose the right abstraction level. Crucially, they're the only practical way to approach correctness testing at scale across such vast state spaces.

So how do we actually build one? In this Part 2, we'll dive deep into the theory that makes behavior models so powerful, then build one step-by-step for our *Super Mario* implementation. Building on the testing framework we created, we'll start with modeling basic movement mechanics, then progressively add collision detection and enemy interactions. By the end, you'll see how the same model can be used for manual, automated, and even autonomous testing.


## The behavior model theory

Before we start writing and using a **behavior model** to verify the correctness of **Super Mario** under test, we need to understand the underlying theory behind it.

At its core, a **behavior model** is a practical method of describing how a system should **behave** using a programming language.

The **behavior** consists of the following fundamental parts:

1. Valid states and state transitions
2. Properties that hold over states and state transitions

### Valid states and state transitions

The first part defines the system's core behavior. It describes every valid state the system can be in and every valid way it can move from one state to the next.

This is formally captured by a transition relation {% katex %}R{% endkatex %}. This relation is simply a collection of predicates (functions that return true or false).

In mathematical terms, the transition relation is a logical **OR** of all individual transition rules:

> {%katex%} R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s') {%endkatex%}

where each transition rule

> {% katex %}\varphi_i(s, s'){% endkatex %}

is a predicate.

> A **predicate** is a logical statement that contains variables and **becomes a proposition** when specific values are assigned to those variables.

If mathematical notation feels intimidating, the translation relation can be understood in Python as a collection of independent transition rules:

```python
def R(s, s_prime):
    return phi_0(s, s_prime) or phi_1(s, s_prime) or ... or phi_n(s, s_prime)
```

Where each predicate, is just a function that accepts current and next state as input and returns true or false.

```python
# A state predicate: checks if Mario is on the ground.
def is_grounded(state):
    return state.get("velocity_y") == 0
```

This means a transition from a state {% katex %}s{% endkatex %} to the next state {% katex %}s'{% endkatex %} is valid if any of its defining predicate functions {% katex %}\varphi_i(s, s'){% endkatex %} returns true. Note this formalism allows to describe any system and the logical **OR** in this formal definition is what makes any description of the system's behavior composable. 

Note that systems described as a predicate-based transition relation is the foundation of tools like [TLA+](https://lamport.azurewebsites.net/tla/tla.html).

### Properties

The second part defines the properties that hold true about the system's behavior. Properties are the high-level rules that the system should follow. We can classify them into three main types based on the scope they examine:

* **State Properties** (Properties of a single state; {% katex %} P(s){% endkatex %}): These properties examine a single snapshot of the system at one moment in time. They must hold true for any state that meets their preconditions.
  > Example: "If Mario is invincible, then a visible countdown timer must be greater than zero."

* **Transition Properties** (Properties relating two consecutive states; {% katex %} P(s, s'){% endkatex %}): These properties look at the relationship between a state {% katex %} s {% endkatex %} and the very next state {% katex %} s'{% endkatex %}.
  > Example: "The score in state {% katex %}s'{% endkatex %} must be greater than or equal to the score in state {% katex %}s{% endkatex %} (it can never decrease). "

* **Temporal Properties** (Properties over a sequence of states; {% katex %} P(...,s_{-2},s_{-1}, s){% endkatex %}) ): These are the most powerful properties, examining a whole sequence of states to enforce rules about causality, ordering, or future guarantees.
  > Example: 
  >  * "Mario can only enter the end-of-level castle after he has touched the flagpole."
  >  * "Mario must have collected a mushroom before transforming into Super Mario."
  >  * "If Mario has invincibility, it should last for exactly 10 seconds."
  >  * "An enemy must first appear on-screen before it can interact with Mario."

In addition to the above, properties also fall into one of the following categories:

* **Safety Properties**: Something bad never happens.
* **Liveness Properties**: Something good eventually happens.
* **Fairness Properties**: If something is possible to do infinitely often, it must eventually be done.

## Why properties alone are not enough?

It's crucial to understand that while properties are powerful, they are an incomplete description of correct behavior. They set boundaries and enforce laws, but they don't specify the complete picture. The detailed, moment-to-moment correctness is defined by the transition relation {%katex%}R{%endkatex%}.

This is the fundamental limitation of traditional property-based testing and highlights why behavior models are more powerful and necessary.

Consider a simple example: testing an **add(a, b)** function.

We might write a property:

> "The result of adding two positive numbers must be greater than or equal to each input."

```python
def add(a, b):
    # This is our System Under Test (SUT) - with a bug!
    return max(a, b)

# The property: the result of adding two positive numbers must be greater than or equal to each input
def result_greater_than_inputs(a, b, result):
    return result >= a and result >= b

def test_property_result_is_large_enough():
    a, b = 3, 5
    result = add(a, b)
    # The property holds true...
    assert result_greater_than_inputs(a, b, result) # ✓ Passes!

    a, b = 7, 2
    result = add(a, b)
    # ...even for this incorrect implementation!
    assert result_greater_than_inputs(a, b, result) # ✓ Passes!
```

This property passes for the clearly incorrect *max()* implementation! The property is a necessary condition for addition, but **it is not sufficient**. It fails to distinguish correct addition from many other operations.

This is why we need both parts: the transition relation {%katex%}R{%endkatex%} that describe the behavior, and properties that hold true for this behavior.

## Composability and scalability

The theory we just covered is not just academic. It's what makes behavior models a powerful, necessary, and practical testing tool.

The key lies in one mathematical detail with huge real-world implications: each predicate {% katex %}\varphi_i{% endkatex %} in the transition relation is independent and self-contained. This unlocks the model's greatest strength: **incremental construction**, also known as *composability*.

We can start with a single rule—Mario moving right—and have a working model. Add jumping behavior? Just another predicate joined with **OR**. Enemy interactions? Another predicate. Each addition makes the model more comprehensive without breaking existing parts. This is the *scalability* part.

The same applies to temporal properties—start with one property, add others as needed. This again is composable and scalable as needed and makes behavior models both powerful and practical.

## The behavior model

## Modeling movement

## Plugging the model into our classic tests

## Testing the model using manual test

## Modeling collision detection

## Modeling enemy interaction

## Conclusion

