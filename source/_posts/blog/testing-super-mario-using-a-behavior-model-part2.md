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

So how do we actually build one? In this Part 2, we'll dive deep into the theory that makes behavior models so powerful, then build one step-by-step for our *Super Mario* implementation. Building on the testing framework we created in [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/), we'll start with modeling basic movement mechanics, then progressively add collision detection and enemy interactions. By the end, you'll see how the same model can be used for manual, automated, and even autonomous testing.


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

If mathematical notation feels intimidating, the transition relation can be understood in Python as a collection of independent transition rules:

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
  > Example: "The score in state {% katex %}s'{% endkatex %} must be greater than or equal to the score in state {% katex %}s{% endkatex %} (it can never decrease)."

* **Temporal Properties** (Properties over a sequence of states; {% katex %} P(...,s_{-2},s_{-1}, s){% endkatex %}): These are the most powerful properties, examining a whole sequence of states to enforce rules about causality, ordering, or future guarantees.
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

Now we're ready to start writing the *Super Mario* behavior model. Given the composability and scalability properties discussed above, getting started is straightforward. 

We'll start by defining a **`Game`** class that takes a **`game`** object (an instance of the [Control](https://github.com/testflows/Examples/blob/main/SuperMario/tests/actions/game.py#L68) class) and stores it as an attribute for quick access. For example, we'll need to access the [vision](https://github.com/testflows/Examples/blob/main/SuperMario/tests/actions/game.py#L74) system to get a list of visible objects.

The game model implements an **`expect`** method that takes the current **`behavior`** of the game—the history of all game states up to and including the current state—and uses this history to assert whether the current state meets the model's expectations.

```python
class Game(Model):
    """Game model."""

    def __init__(self, game):
        super().__init__(game)

    def expect(self, behavior):
        """Expect the game to behave correctly."""
        pass
```

The **`behavior`** parameter is an ordered list of states, with the current state at the end. For convenience, we can use the following aliases to access the three most recent states: 

```python
    now = behavior[-1]          # Current state
    before = behavior[-2]       # Previous state  
    right_before = behavior[-3] # State before the previous
```

For many simple assertions, having access to just the *before* and *right_before* states is sufficient to validate the *now* state. However, for more complex state transitions and properties, we may need to traverse the complete history or analyze a larger recent window.

> Given that the game is executed frame by frame, each state represents the state of the game at a particular frame.

This structure provides the foundation to implement both the **transition relation** {% katex %}R{% endkatex %} (defining valid states and state transitions) and **properties** that must hold across states. The `expect` method will contain our behavioral assertions, and we can add new predicates incrementally as our model grows in sophistication.

### Object-oriented modeling approach

We use object-oriented programming because it provides a natural way to model stateful systems like games. OOP excels at representing entities with state and behavior, making it ideal for behavior models.

> However, OOP is not absolutely necessary—you can choose the programming style that best matches your needs.

Our approach combines **inheritance** and **composition**:

**Inheritance** allows us to define a base [Model](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/base.py) class that provides common functionality for all models:

```python
class Model:
    """Base model class."""
    
    def __init__(self, game):
        self.game = game
    
    def get(self, name, state):
        """Find element in the specified state."""
        elements = state.boxes.get(name, [])
        element = elements[0] if elements else None
        return element
    
    # ... other common methods
```

**Composition** allows us to create specialized models for each game entity. We'll create a specialized [Mario](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py) model:

```python
class Mario(Model):
    """Mario's behavior model."""

    def __init__(self, game):
        super().__init__(game)


    def expect(self, behavior):
        """Expect Mario to behave correctly."""
        pass
```

We start with a simple Mario model that inherits from the base Model class. The `expect` method is where we'll build up our movement rules incrementally in the following sections.

Now we can use composition to integrate this Mario model into our main [Game](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/game.py) model:

```python
class Game(Model):
    """Game model."""
    
    def __init__(self, game):
        super().__init__(game)  # Call base class constructor
        self.mario = Mario(game=game)  # Composition: Game contains Mario model
    
    def expect(self, behavior):
        """Expect the game to behave correctly."""
        self.mario.expect(behavior)    # Delegate to specialized model
```

This design provides several key advantages:
- **Modularity**: Each entity (Mario, enemies, bricks) has its own specialized model
- **Reusability**: Common functionality is shared through the base Model class
- **Scalability**: We can add new entity models without modifying existing ones
- **Natural mapping**: Object models directly correspond to game entities

## Modeling movement

Now let's build our first behavior model by implementing Mario's movement mechanics in the [Mario](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py) model class. We'll start simple and incrementally add complexity, demonstrating the composable nature of behavior models.

### Understanding the complexity

*Super Mario* has surprisingly sophisticated movement physics. Mario doesn't just instantly start or stop moving—there's acceleration, deceleration, and inertia. When you press the right key, Mario gradually builds up speed. When you release it, he doesn't stop immediately but slides to a halt due to friction. Change directions mid-run, and Mario's inertia carries him forward briefly before he can reverse course.

We could model these physics in precise detail, tracking acceleration curves, friction coefficients, and inertia vectors. However, this would require us to reverse-engineer the game's internal physics engine—essentially contaminating our model by looking at the system's internal state.

> A fundamental rule of behavior modeling: we observe only external, visible behavior, never internal implementation.

Instead, we'll model the *general properties* of movement that any observer would notice:
- Mario moves when movement keys are pressed
- He doesn't move instantly—there's a brief startup delay
- He continues moving briefly after keys are released (inertia)
- He has a maximum movement speed
- Direction changes involve inertia from the previous direction

This approach gives us a robust model that captures the essential movement behavior without being too brittle to internal physics changes.

### Building expectation to move step by step

Let's start with the simplest possible movement expectation:

```python
def expect_move(self, behavior, direction):
    """Expect Mario to move when movement keys are pressed."""
    if len(behavior) < 2:
        return
    
    now, before = behavior[-1], behavior[-2]
    
    # Simple rule: if key is pressed, Mario should move
    if self.is_key_pressed(before, direction):
        pos_now, pos_before = self.get_positions(now, before)
        if direction == "right":
            assert pos_now > pos_before, "Mario should move right when right key is pressed"
        elif direction == "left":
            assert pos_now < pos_before, "Mario should move left when left key is pressed"
```

This basic model is too simplistic and would fail in many real scenarios. It doesn't account for startup delays, inertia, or cases where keys aren't pressed. Real movement has nuances that this model doesn't capture. Let's add the first layer of complexity—handling the case when keys aren't pressed:

```python
def expect_move(self, behavior, direction):
    """Expect Mario to move when movement keys are pressed."""
    if len(behavior) < 3:  # Need more history for complex behavior
        return
    
    now, before, right_before = behavior[-1], behavior[-2], behavior[-3]
    
    if not self.is_key_pressed(before, direction):
        # Key not pressed - Mario should either stand still or continue due to inertia
        if self.is_moving(before, right_before, direction=direction):
            # Mario was moving - expect inertia behavior
            self.assert_inertia_movement(behavior, direction=direction)
        else:
            # Mario wasn't moving - he should remain stationary
            self.assert_no_unintended_movement(now, before, direction=direction)
        return
    
    # Key is pressed - expect movement
    self.assert_movement(now, before, direction=direction)
```

Now we're handling both key-pressed and key-not-pressed cases. We use helper methods like [`assert_movement`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L76) to check that Mario actually moved, [`assert_inertia_movement`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L161) to validate inertia behavior, and [`assert_no_unintended_movement`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L54) to ensure Mario doesn't move when he shouldn't.

But there's still more complexity: what happens when Mario starts moving from a standing position? In the real game, there's a brief delay before movement begins. Let's add that:

```python
def expect_move(self, behavior, direction):
    """Expect Mario to move when movement keys are pressed."""
    if len(behavior) < 3:
        return
    
    now, before, right_before = behavior[-1], behavior[-2], behavior[-3]
    
    if not self.is_key_pressed(before, direction):
        # Handle inertia and stationary cases...
        return
    
    # Key is pressed - but movement depends on Mario's previous state
    if self.is_moving(before, right_before, direction=direction):
        # Already moving - should continue
        self.assert_movement(now, before, direction=direction)

    elif self.is_standing(before, right_before):
        # Was standing - allow startup delay
        if not self.has_started_moving_after_standing(behavior, direction=direction):
            return  # Still in startup delay
        self.assert_movement(now, before, direction=direction)
    
    else:
        # Handle direction changes and other edge cases
        self.assert_movement(now, before, direction=direction)
```

This version introduces [`has_started_moving_after_standing`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L107), which checks if Mario has waited long enough to start moving from a stationary position.

This incremental approach demonstrates how behavior models grow organically. Each addition handles a new aspect of the observed behavior, building up a comprehensive model piece by piece.

### Modeling jump behavior

Jump behavior follows the same incremental pattern. Let's start simple:

```python
def expect_jump(self, behavior):
    """Expect Mario to jump when jump key is pressed."""
    if len(behavior) < 2:
        return
    
    now, before = behavior[-1], behavior[-2]
    
    if self.is_key_pressed(now, "a"):  # 'a' is the jump key
        pos_now, pos_before = self.get_positions(now, before, axis="y")
        assert pos_now < pos_before, "Mario should jump when jump key is pressed"
```

But jumping has constraints—Mario can only jump when he's on solid ground and has room above him:

```python
def expect_jump(self, behavior):
    """Expect Mario to jump when jump key is pressed."""
    if len(behavior) < 2:
        return
    
    now, before = behavior[-1], behavior[-2]
    mario_before = self.get("player", before)
    
    # Check preconditions for jumping
    if self.has_collision(mario_before, before, "bottom", objects=["box", "collider"]):
        if not self.has_collision(mario_before, before, "top", objects=["box", "collider"]):
            if self.is_key_pressed(now, "a"):
                # Mario can jump - assert that he does
                self.assert_jump(now, before)
```

This uses [`has_collision`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/base.py#L17) to check for ground contact and obstacles, [`is_key_pressed`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/base.py#L13) to detect input, and [`assert_jump`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L67) to validate that Mario actually jumped.

Notice how we check external, observable conditions: collision with ground below, no obstacles above, and key press.

> We don't peek into Mario's internal state to see if he's "in jumping mode" or check internal physics variables.

### The power of incremental modeling

This step-by-step approach gives us several advantages:

1. **Start simple, add complexity**: Each iteration handles more nuanced behavior
2. **Testable at every step**: We can validate the model as we build it
3. **Composable**: New rules don't break existing ones—they extend them
4. **Observable behavior only**: We never depend on internal game state
5. **Robust to changes**: General properties survive implementation changes

The final [`expect_move`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L213) and [`expect_jump`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L261) methods in our [Mario model](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py) demonstrate this incremental construction, handling the complexity of movement while remaining focused on externally observable behavior.

## Plugging the model into our classic tests

## Testing the model using manual test

## Modeling collision detection

## Modeling enemy interaction

## Conclusion

