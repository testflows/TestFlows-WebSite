---
post: true
title: "Testing Super Mario Using a Behavior Model (Part 2)"
description: An article about testing Super Mario game using a behavior model (Part 2). 
date: 2025-09-17
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model-part2.png
icon: fas fa-glasses pt-5 pb-5
---

When testing complex stateful systems like [*Super Mario*](https://en.wikipedia.org/wiki/Super_Mario_Bros/), behavior models can be your secret weapon. Think of them as property-based testing on steroids. The game world is vast, with countless combinations of player positions, velocities, physics states, and environmental conditions. This complexity makes it impractical to write classical test cases that cover any significant portion of the state space. At best, such tests can only form a sanity suite.

Imagine Mario sprinting through a level, collecting coins, and leaping over pits. Each action he takes depends on a myriad of factors: his speed, the timing of his jumps, his momentum and inertia, and even the layout of the level itself. Writing individual test cases for each scenario—like we showed in [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/)—would be like trying to count every grain of sand on a beach.

This is where behavior models shine. They decouple assertions about expected behavior from the test actions themselves, allowing us to focus on what the game should do rather than how to test it. This decoupling opens the door to applying various state space exploration techniques—whether through manual testing, automated scripts, or fully autonomous systems. The model becomes your universal correctness oracle, validating behavior across any path through Mario's world.<!-- more -->

Because behavior models are composable, we can build them incrementally—start with basic properties, then add complexity as needed. The [test oracle problem](https://en.wikipedia.org/wiki/Test_oracle) puts a fundamental boundary on any model, but behavior models acknowledge this reality and let us choose the right abstraction level. Crucially, they provide a practical way to approach correctness testing at scale across such vast state spaces.

So how do we actually build one? In this Part 2, we'll dive deep into the theory that makes behavior models so powerful, then build one step-by-step for our *Super Mario* implementation. Building on the testing framework we created in [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/), we'll show how to start constructing a game model using properties. While behavior models support defining both transition relations and properties, transition relations for complex systems like games would not be trivial to implement. Instead, we'll show how to implement causal properties (why Mario moved), safety properties (what should never happen), and liveness properties (what should eventually happen) for basic movement and jumping. This won't be a complete model of *Super Mario*—that would require covering power-ups, enemies, scoring, and much more—but it will demonstrate the incremental, composable approach to building behavior models. Because behavior models are executable specifications, or behavior-as-code as we call it, you'll see how the same model can be used for automated and manual testing.


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
  * Example: "If Mario is invincible, then a visible countdown timer must be greater than zero."

* **Transition Properties** (Properties relating two consecutive states; {% katex %} P(s, s'){% endkatex %}): These properties look at the relationship between a state {% katex %} s {% endkatex %} and the very next state {% katex %} s'{% endkatex %}.
  * Example: "The score in state {% katex %}s'{% endkatex %} must be greater than or equal to the score in state {% katex %}s{% endkatex %} (it can never decrease)."

* **Temporal Properties** (Properties over a sequence of states; {% katex %} P(...,s_{-2},s_{-1}, s){% endkatex %}): These are the most powerful properties, examining a whole sequence of states to enforce rules about causality, ordering, or future guarantees.
  * Example: 
    * "Mario can only enter the end-of-level castle after he has touched the flagpole."
    * "Mario must have collected a mushroom before transforming into Super Mario."
    * "If Mario has invincibility, it should last for exactly 10 seconds."
    * "Mario's jump height should be consistent based on how long the jump key is held."

In addition to the above, properties also fall into one of the following categories:

* **Safety Properties**: Something bad never happens.
* **Liveness Properties**: Something good eventually happens.
* **Fairness Properties**: If something is possible to do infinitely often, it must eventually be done.

In practice, technically, most properties will fall into **safety**. Why? Because **liveness** and 
**fairness** properties are unbounded and as soon as you bound them they fall into the 
**safety** category. For example, "After pressing the right key, if the path is clear, 
Mario should eventually start moving to the right" is a liveness property—there's no 
time limit. But the moment we add a bound: "Mario should start moving within 50 frames," 
it becomes a safety property because we're now saying "it should never take more than 
50 frames to start moving." The unbounded version can't be violated in finite time 
(Mario might just need one more frame!), but the bounded version can fail definitively.

### Causal properties

A special type of **safety** property is **causal properties**, and they deserve special attention because they offer a uniquely powerful and practical approach to validation. Causal properties flip the logic of traditional assertions by reasoning backwards from effects to causes.

**Traditional forward logic:**
> "If the right key is pressed, then Mario should move right."

This forward approach requires you to predict and implement exactly what should happen—you must define how Mario accelerates, how inertia works, how collisions affect movement, and so on. This essentially requires reimplementing the game's logic in your model.

**Causal reverse logic:**
> "If Mario moved right, then there must have been a valid cause (right key pressed OR rightward velocity from inertia)."

This causal approach only validates what actually happened. You observe Mario moved right, then check: was there a reason for this? This is fundamentally easier because:

1. **No prediction needed**: You don't specify what should happen, only validate that what did happen makes sense
2. **Enumerate causes, not effects**: Listing possible causes (key press, inertia, bounce) is simpler than computing exact effects
3. **Robust to implementation details**: The exact movement distance doesn't matter—only that movement had justification
4. **Catches unexpected behavior**: Any movement without a valid cause is instantly flagged

Causal properties are particularly powerful for complex systems like games where predicting exact behavior could be impractical, but validating that observed behavior has proper justification is straightforward.

## Why properties alone are not enough?

Even though we can start implementing our model by adding properties, it's crucial to understand that while properties are powerful, they are an incomplete description of correct behavior. They set boundaries and enforce laws, but they don't specify the complete picture. The detailed, moment-to-moment correctness is defined by the transition relation {%katex%}R{%endkatex%}.

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

This is why in general we need both parts: the transition relation {%katex%}R{%endkatex%} that describes the behavior, and properties that hold true for this behavior.

## Composability and scalability

No matter if our behavior model implements a partial or full transition relation, or contains just properties or a mix of both, composability is what makes it practical and scalable. This is because both transition relations and properties are composable, which enables **incremental construction**. This means you can start with a single validation rule and grow the model piece by piece, without needing a complete specification upfront.

**Transition relations are composable** because each predicate {% katex %}\varphi_i{% endkatex %} is independent and self-contained, joined by logical **OR**:

* We can start with a single transition rule—Mario moving right—and have a working model. Add jumping behavior? Just another predicate joined with **OR**. Enemy interactions? Another predicate. Each addition makes the model more comprehensive without breaking existing parts.

**Properties are composable** because each property checks an independent aspect of behavior:

* Start with one causal property—rightward movement has a cause. Add a safety property—speed never exceeds maximum. Add a liveness property—Mario eventually starts moving. Each property validates its own concern without interfering with others.

This flexibility is what makes behavior models both powerful and practical for complex systems.

## The behavior model

With the theory out of the way, now we're ready to start writing the *Super Mario* behavior model. Given the composability and scalability properties discussed above, getting started is straightforward. 

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
- **Modularity**: Each entity (Mario, level boundaries, objects) has its own specialized model
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

This approach gives us a robust model that captures the essential movement behavior without being brittle to internal physics changes.

### Modeling process

Let's start with the simplest possible movement expectation for our [`expect_move`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L213) method:

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

This basic model is too simplistic and would fail in many real scenarios. It doesn't account for startup delays, inertia, or cases where keys aren't pressed. Let's add the first layer of complexity—handling the case when keys aren't pressed:

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

But there's still more complexity: what happens when Mario starts moving from a standing position? In the real game, there's a brief delay before movement begins. Let's add this final layer of complexity:

```python
def expect_move(self, behavior, direction):
    """Expect Mario to move when movement keys are pressed."""
    if len(behavior) < 3:
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

This version introduces [`has_started_moving_after_standing`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L107), which checks if Mario has waited long enough to start moving from a stationary position, accounting for the natural startup delay in movement.

This incremental approach demonstrates how behavior models grow organically. We started with a simple rule, then added inertia handling, and finally incorporated startup delays. Each addition handles a new aspect of the observed behavior, building up a comprehensive model piece by piece.

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
    
    solid_objects = ["box", "collider"]
    now, before = behavior[-1], behavior[-2]
    mario_before = self.get("player", before)
    
    # Check preconditions for jumping
    if self.has_collision(mario_before, before, "bottom", objects=solid_objects):
        if not self.has_collision(mario_before, before, "top", objects=solid_objects):
            if self.is_key_pressed(now, "a"):
                # Mario can jump - assert that he does
                self.assert_jump(now, before)
```

This uses [`has_collision`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/base.py#L17) to check for ground contact and obstacles, [`is_key_pressed`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/base.py#L13) to detect input, and [`assert_jump`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L67) to validate that Mario's y-coordinate actually decreased (jumped).

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

## Moving right with a model

Now let's see the real power of behavior models in action by converting our first classical test. Remember the cluttered assertions and position tracking from [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/#Checking-basic-movements-using-classical-auto-tests)? Let's see how our behavior model transforms the experience.

### Before: Classical test with manual assertions

Here's what our original [move right test](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_right.py) looked like:

```python
@TestScenario
def scenario(self):
    """Check Mario can move right in the game."""
    game = self.context.game

    with Given("Mario's start position"): # Start position tracking
        mario_start = actions.get_element(game, "player")

    with When("press the right key for 1 second"): # Actual test action
        with actions.press_right():
            actions.play(game, seconds=1)

    with And("get Mario's end position"):# End position tracking
        mario_end = actions.get_element(game, "player")

    with Then("check Mario moves right"): # Explicit assertion
        assert mario_end.box.x > mario_start.box.x, error()
```

Notice that in addition to the actual test action (pressing the right key), the test also includes:

- **Explicit position tracking**: Capturing `mario_start` and `mario_end` positions
- **Explicit assertions**: Coordinate comparisons (`mario_end.box.x > mario_start.box.x`) that only validate the final result, not the journey

### After: Behavior model-driven test

Here's the same [`move right`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_right_with_model.py) test that uses our behavior model:

```python
@TestScenario
@Name("move right")
def scenario(self):
    """Check Mario can move right in the game."""
    game = self.context.game
    model = self.context.model

    with When("press the right key for 1 second"):
        with actions.press_right():
            actions.play(game, seconds=1, model=model) # We plug the behavior model
```

This test is way shorter, as the behaviour **[model](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_right_with_model.py#L11)** is being passed into the **[actions.play](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_right_with_model.py#L18)** giving us:

- No explicit position tracking
- No explicit assertions

More importantly, the test scenario is actually enhanced as the model is checking the behaviour continuously (frame by frame) instead of only making an assertion about the final position!
 
Let's run it:

```bash
./tests/run.py --save-video --only "/super mario/with model/move right/*"
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-9.gif">
<div class="text-secondary text-bold"><br>Super Mario: Behavior Model-Driven Move Right Test</div>
</div><br>

The model includes low-level debugging messages that will help us clearly understand what the model is expecting and what behavior we are observing:

```bash
Sep 23,2025 17:57:47       ⟥  Scenario move right
                                Check Mario can move right in the game.
Sep 23,2025 17:57:47         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               291us         ⟥⟤ OK setup and cleanup, /super mario/with model/move right/setup and cleanup
Sep 23,2025 17:57:47         ⟥  When press the right key for 1 second
                27ms         ⟥    [debug] Mario was standing and is preparing to move right
                47ms         ⟥    [debug] Mario was standing and is preparing to move right
                65ms         ⟥    [debug] Mario was standing and is preparing to move right
                76ms         ⟥    [debug] Mario should move right
                76ms         ⟥    [debug] Mario moved right by 1
                94ms         ⟥    [debug] Mario should move right
                94ms         ⟥    [debug] Mario moved right by 1
               108ms         ⟥    [debug] Mario should move right
               108ms         ⟥    [debug] Mario moved right by 1
               125ms         ⟥    [debug] Mario should move right
               125ms         ⟥    [debug] Mario moved right by 1
               141ms         ⟥    [debug] Mario should move right
               141ms         ⟥    [debug] Mario moved right by 1
               157ms         ⟥    [debug] Mario should move right
               157ms         ⟥    [debug] Mario moved right by 1
               173ms         ⟥    [debug] Mario should move right
               173ms         ⟥    [debug] Mario moved right by 1
               190ms         ⟥    [debug] Mario should move right
               190ms         ⟥    [debug] Mario moved right by 2
               207ms         ⟥    [debug] Mario should move right
               208ms         ⟥    [debug] Mario moved right by 2
               218ms         ⟥    [debug] Mario should move right
               218ms         ⟥    [debug] Mario moved right by 2
               235ms         ⟥    [debug] Mario should move right
               235ms         ⟥    [debug] Mario moved right by 2
               251ms         ⟥    [debug] Mario should move right
               251ms         ⟥    [debug] Mario moved right by 2
               271ms         ⟥    [debug] Mario should move right
               271ms         ⟥    [debug] Mario moved right by 2
               285ms         ⟥    [debug] Mario should move right
               285ms         ⟥    [debug] Mario moved right by 3
               304ms         ⟥    [debug] Mario should move right
               305ms         ⟥    [debug] Mario moved right by 3
               319ms         ⟥    [debug] Mario should move right
               319ms         ⟥    [debug] Mario moved right by 3
               334ms         ⟥    [debug] Mario should move right
               334ms         ⟥    [debug] Mario moved right by 3
               350ms         ⟥    [debug] Mario should move right
               350ms         ⟥    [debug] Mario moved right by 3
               368ms         ⟥    [debug] Mario should move right
               369ms         ⟥    [debug] Mario moved right by 3
               381ms         ⟥    [debug] Mario should move right
               381ms         ⟥    [debug] Mario moved right by 3
               397ms         ⟥    [debug] Mario should move right
               397ms         ⟥    [debug] Mario moved right by 4
               416ms         ⟥    [debug] Mario should move right
               416ms         ⟥    [debug] Mario moved right by 4
               441ms         ⟥    [debug] Mario should move right
               441ms         ⟥    [debug] Mario moved right by 4
               450ms         ⟥    [debug] Mario should move right
               450ms         ⟥    [debug] Mario moved right by 4
               466ms         ⟥    [debug] Mario should move right
               466ms         ⟥    [debug] Mario moved right by 4
               480ms         ⟥    [debug] Mario should move right
               480ms         ⟥    [debug] Mario moved right by 4
               499ms         ⟥    [debug] Mario should move right
               499ms         ⟥    [debug] Mario moved right by 4
               515ms         ⟥    [debug] Mario should move right
               515ms         ⟥    [debug] Mario moved right by 5
               531ms         ⟥    [debug] Mario should move right
               532ms         ⟥    [debug] Mario moved right by 5
               546ms         ⟥    [debug] Mario should move right
               546ms         ⟥    [debug] Mario moved right by 5
               565ms         ⟥    [debug] Mario should move right
               565ms         ⟥    [debug] Mario moved right by 5
               579ms         ⟥    [debug] Mario should move right
               579ms         ⟥    [debug] Mario moved right by 5
               596ms         ⟥    [debug] Mario should move right
               596ms         ⟥    [debug] Mario moved right by 5
               612ms         ⟥    [debug] Mario should move right
               612ms         ⟥    [debug] Mario moved right by 6
               629ms         ⟥    [debug] Mario should move right
               629ms         ⟥    [debug] Mario moved right by 6
               647ms         ⟥    [debug] Mario should move right
               647ms         ⟥    [debug] Mario moved right by 6
               662ms         ⟥    [debug] Mario should move right
               662ms         ⟥    [debug] Mario moved right by 6
               679ms         ⟥    [debug] Mario should move right
               679ms         ⟥    [debug] Mario moved right by 6
               694ms         ⟥    [debug] Mario should move right
               695ms         ⟥    [debug] Mario moved right by 6
               708ms         ⟥    [debug] Mario should move right
               708ms         ⟥    [debug] Mario moved right by 6
               727ms         ⟥    [debug] Mario should move right
               728ms         ⟥    [debug] Mario moved right by 6
               745ms         ⟥    [debug] Mario should move right
               745ms         ⟥    [debug] Mario moved right by 6
               760ms         ⟥    [debug] Mario should move right
               760ms         ⟥    [debug] Mario moved right by 6
               776ms         ⟥    [debug] Mario should move right
               776ms         ⟥    [debug] Mario moved right by 6
               792ms         ⟥    [debug] Mario should move right
               792ms         ⟥    [debug] Mario moved right by 6
               808ms         ⟥    [debug] Mario should move right
               808ms         ⟥    [debug] Mario moved right by 6
               823ms         ⟥    [debug] Mario should move right
               823ms         ⟥    [debug] Mario moved right by 6
               839ms         ⟥    [debug] Mario should move right
               839ms         ⟥    [debug] Mario moved right by 6
               853ms         ⟥    [debug] Mario should move right
               853ms         ⟥    [debug] Mario moved right by 6
               870ms         ⟥    [debug] Mario should move right
               870ms         ⟥    [debug] Mario moved right by 6
               891ms         ⟥    [debug] Mario should move right
               891ms         ⟥    [debug] Mario moved right by 6
               905ms         ⟥    [debug] Mario should move right
               905ms         ⟥    [debug] Mario moved right by 6
               920ms         ⟥    [debug] Mario should move right
               920ms         ⟥    [debug] Mario moved right by 6
               937ms         ⟥    [debug] Mario should move right
               937ms         ⟥    [debug] Mario moved right by 6
               953ms         ⟥    [debug] Mario should move right
               953ms         ⟥    [debug] Mario moved right by 6
               968ms         ⟥    [debug] Mario should move right
               968ms         ⟥    [debug] Mario moved right by 6
               969ms         ⟥⟤ OK press the right key for 1 second, /super mario/with model/move right/press the right key for 1 second
```

The debug messages show Mario's right movement behavior in detail:

1. **Startup delay**: Mario starts by "preparing to move" for the first 3 frames before actual movement begins
2. **Gradual acceleration**: Movement speed increases incrementally: 1 → 2 → 3 → 4 → 5 → 6 pixels per frame
3. **Maximum speed reached**: Mario reaches his maximum speed of 6 pixels per frame
4. **Floating-point math effects**: When accelerating, we see that it takes 6 to 7 frames to reach the next velocity—the variation is due to floating point math

This detailed frame-by-frame validation demonstrates the power of behavior models—they capture the nuanced physics of the game automatically, something that would be hard to verify with manual assertions.

What the behavior model gives us is effectively equivalent to writing a manual test that validates every single frame:

```python
@TestScenario
def scenario(self):
    """Check Mario can move right in the game."""
    game = self.context.game

    with When("press the right key for 1 second"): # Actual test action
        with actions.press_right():
            for i in range(60):
                actions.play(game, frames=1)
                assert ...? # this is actually very non-trivial!
```

But implementing those frame-by-frame assertions manually would be extremely complex—you'd need to account for startup delays, acceleration curves, maximum speeds, and floating-point precision effects. The behavior model handles all of this automatically and universally!

## Moving left with a model

With our model successfully handling rightward movement, let's test its limits by converting the [`move left`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_left_with_model.py) test. This will reveal some fascinating physics and uncover a limitation in our model:

```python
@TestScenario
@Name("move left")
def scenario(self):
    """Check Mario can move left in the game."""
    game = self.context.game
    model = self.context.model

    with When("press the left key for 1 second"):
        with actions.press_left():
            actions.play(game, seconds=1, model=model)
```

Let's run **move left** first right after the **move right** test :

```bash
./tests/run.py --save-video --only "/super mario/with model/move right/*" "/super mario/with model/move left/*"
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-10.gif">
<div class="text-secondary text-bold"><br>Super Mario: Behavior Model-Driven Move Left After Move Right Test</div>
</div><br>

The test will produce the following messages:

```bash
Sep 23,2025 19:37:58       ⟥  Scenario move left
                                Check Mario can move left in the game.
Sep 23,2025 19:37:58         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               243us         ⟥⟤ OK setup and cleanup, /super mario/with model/move left/setup and cleanup
Sep 23,2025 19:37:58         ⟥  When press the left key for 1 second
                 4ms         ⟥    [debug] Mario should move right
                 4ms         ⟥    [debug] Mario moved right by 6
                20ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 6
                20ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 6
                38ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 5
                38ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 5
                57ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 5
                57ms         ⟥    [debug] Mario has right inertia current speed 5, previous speed 5
                76ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 5
                76ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 5
                89ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 4
                89ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 4
               104ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 4
               104ms         ⟥    [debug] Mario has right inertia current speed 4, previous speed 4
               121ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 4
               122ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 4
               136ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 3
               136ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 3
               157ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 3
               157ms         ⟥    [debug] Mario has right inertia current speed 3, previous speed 3
               169ms         ⟥    [debug] Mario has right inertia current speed 2, previous speed 3
               169ms         ⟥    [debug] Mario has right inertia current speed 2, previous speed 3
               186ms         ⟥    [debug] Mario has right inertia current speed 2, previous speed 2
               186ms         ⟥    [debug] Mario has right inertia current speed 2, previous speed 2
               200ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 2
               200ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 2
               216ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 1
               216ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 1
               233ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 1
               233ms         ⟥    [debug] Mario has right inertia current speed 1, previous speed 1
               248ms         ⟥    [debug] Mario has right inertia current speed 0, previous speed 1
               248ms         ⟥    [debug] Mario has right inertia current speed 0, previous speed 1
               267ms         ⟥    [debug] Mario was standing and is preparing to move left
               281ms         ⟥    [debug] Mario was standing and is preparing to move left
               297ms         ⟥    [debug] Mario was standing and is preparing to move left
               313ms         ⟥    [debug] Mario should move left
               313ms         ⟥    [debug] Mario moved left by 1
               330ms         ⟥    [debug] Mario should move left
               330ms         ⟥    [debug] Mario moved left by 1
               346ms         ⟥    [debug] Mario should move left
               346ms         ⟥    [debug] Mario moved left by 1
               363ms         ⟥    [debug] Mario should move left
               363ms         ⟥    [debug] Mario moved left by 1
               377ms         ⟥    [debug] Mario should move left
               377ms         ⟥    [debug] Mario moved left by 1
               395ms         ⟥    [debug] Mario should move left
               395ms         ⟥    [debug] Mario moved left by 1
               410ms         ⟥    [debug] Mario should move left
               410ms         ⟥    [debug] Mario moved left by 1
               426ms         ⟥    [debug] Mario should move left
               426ms         ⟥    [debug] Mario moved left by 2
               440ms         ⟥    [debug] Mario should move left
               440ms         ⟥    [debug] Mario moved left by 2
               456ms         ⟥    [debug] Mario should move left
               457ms         ⟥    [debug] Mario moved left by 2
               474ms         ⟥    [debug] Mario should move left
               474ms         ⟥    [debug] Mario moved left by 2
               491ms         ⟥    [debug] Mario should move left
               491ms         ⟥    [debug] Mario moved left by 2
               507ms         ⟥    [debug] Mario should move left
               507ms         ⟥    [debug] Mario moved left by 2
               524ms         ⟥    [debug] Mario should move left
               524ms         ⟥    [debug] Mario moved left by 3
               540ms         ⟥    [debug] Mario should move left
               540ms         ⟥    [debug] Mario moved left by 3
               559ms         ⟥    [debug] Mario should move left
               559ms         ⟥    [debug] Mario moved left by 3
               576ms         ⟥    [debug] Mario should move left
               576ms         ⟥    [debug] Mario moved left by 3
               589ms         ⟥    [debug] Mario should move left
               589ms         ⟥    [debug] Mario moved left by 3
               603ms         ⟥    [debug] Mario should move left
               603ms         ⟥    [debug] Mario moved left by 3
               620ms         ⟥    [debug] Mario should move left
               620ms         ⟥    [debug] Mario moved left by 3
               637ms         ⟥    [debug] Mario should move left
               637ms         ⟥    [debug] Mario moved left by 4
               657ms         ⟥    [debug] Mario should move left
               657ms         ⟥    [debug] Mario moved left by 4
               673ms         ⟥    [debug] Mario should move left
               673ms         ⟥    [debug] Mario moved left by 4
               685ms         ⟥    [debug] Mario should move left
               685ms         ⟥    [debug] Mario moved left by 4
               703ms         ⟥    [debug] Mario should move left
               703ms         ⟥    [debug] Mario moved left by 4
               718ms         ⟥    [debug] Mario should move left
               718ms         ⟥    [debug] Mario moved left by 4
               736ms         ⟥    [debug] Mario should move left
               736ms         ⟥    [debug] Mario moved left by 4
               755ms         ⟥    [debug] Mario should move left
               755ms         ⟥    [debug] Mario moved left by 5
               766ms         ⟥    [debug] Mario should move left
               766ms         ⟥    [debug] Mario moved left by 5
               779ms         ⟥    [debug] Mario should move left
               779ms         ⟥    [debug] Mario moved left by 5
               802ms         ⟥    [debug] Mario should move left
               802ms         ⟥    [debug] Mario moved left by 5
               814ms         ⟥    [debug] Mario should move left
               815ms         ⟥    [debug] Mario moved left by 5
               831ms         ⟥    [debug] Mario should move left
               831ms         ⟥    [debug] Mario moved left by 5
               846ms         ⟥    [debug] Mario should move left
               846ms         ⟥    [debug] Mario moved left by 6
               863ms         ⟥    [debug] Mario should move left
               863ms         ⟥    [debug] Mario moved left by 6
               878ms         ⟥    [debug] Mario should move left
               878ms         ⟥    [debug] Mario moved left by 6
               897ms         ⟥    [debug] Mario should move left
               897ms         ⟥    [debug] Mario moved left by 6
               912ms         ⟥    [debug] Mario should move left
               912ms         ⟥    [debug] Mario moved left by 6
               928ms         ⟥    [debug] Mario should move left
               928ms         ⟥    [debug] Mario moved left by 6
               948ms         ⟥    [debug] Mario should move left
               949ms         ⟥    [debug] Mario moved left by 6
               959ms         ⟥    [debug] Mario should move left
               959ms         ⟥    [debug] Mario moved left by 6
               960ms         ⟥⟤ OK press the left key for 1 second, /super mario/with model/move left/press the left key for 1 second
```

The debug messages reveal the physics of how Mario changes direction:

**Phase 1: Right inertia**  
Mario starts with maximum rightward speed (6 pixels/frame) from the previous test. Even though we're pressing left, Mario continues moving right due to inertia! The model tracks his gradual deceleration: 6 → 5 → 4 → 3 → 2 → 1 → 0 pixels per frame over ~245ms.

**Phase 2: Getting started again**  
Once Mario's rightward momentum is exhausted, he enters the familiar "preparing to move" state for 3 frames before beginning leftward movement.

**Phase 3: Left acceleration**  
Mario accelerates leftward following the same pattern as rightward movement: 1 → 2 → 3 → 4 → 5 → 6 pixels per frame, reaching maximum speed by the end of the test.

This demonstrates the model's understanding of movement physics—it correctly validates not just movement in isolation, but the complex transition between opposing directions, including inertia effects that span multiple frames.

### Hitting model's limit

However, what happens when we just run the [`move left`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_left_with_model.py) just by itself?

```bash
./tests/run.py --save-video --only "/super mario/with model/move left/*"
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-11.gif">
<div class="text-secondary text-bold"><br>Super Mario: Behavior Model-Driven Move Left Test Fail</div>
</div><br>

The test output messages are:

```bash
Sep 23,2025 19:46:50       ⟥  Scenario move left
                                Check Mario can move left in the game.
Sep 23,2025 19:46:50         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               281us         ⟥⟤ OK setup and cleanup, /super mario/with model/move left/setup and cleanup
Sep 23,2025 19:46:50         ⟥  When press the left key for 1 second
                27ms         ⟥    [debug] Mario was standing and is preparing to move left
                39ms         ⟥    [debug] Mario was standing and is preparing to move left
                58ms         ⟥    [debug] Mario was standing and is preparing to move left
                75ms         ⟥    [debug] Mario should move left
                75ms         ⟥    [debug] Mario moved left by 1
                90ms         ⟥    [debug] Mario should move left
                91ms         ⟥    [debug] Mario moved left by 1
               106ms         ⟥    [debug] Mario should move left
               106ms         ⟥    [debug] Mario moved left by 1
               124ms         ⟥    [debug] Mario should move left
               124ms         ⟥    [debug] Mario moved left by 1
               140ms         ⟥    [debug] Mario should move left
               141ms         ⟥    [debug] Mario moved left by 1
               157ms         ⟥    [debug] Mario should move left
               157ms         ⟥    [debug] Mario moved left by 1
               172ms         ⟥    [debug] Mario should move left
               172ms         ⟥    [debug] Mario moved left by 1
               190ms         ⟥    [debug] Mario should move left
               190ms         ⟥    [debug] Mario moved left by 2
               205ms         ⟥    [debug] Mario should move left
               205ms         ⟥    [debug] Mario moved left by 2
               222ms         ⟥    [debug] Mario should move left
               223ms         ⟥    [debug] Mario moved left by 2
               237ms         ⟥    [debug] Mario should move left
               238ms         ⟥    [debug] Mario moved left by 2
               255ms         ⟥    [debug] Mario should move left
               256ms         ⟥    [debug] Mario moved left by 2
               271ms         ⟥    [debug] Mario should move left
               271ms         ⟥    [debug] Mario moved left by 2
               288ms         ⟥    [debug] Mario should move left
               288ms         ⟥    [debug] Mario moved left by 3
               302ms         ⟥    [debug] Mario should move left
               303ms         ⟥    [debug] Mario moved left by 3
               320ms         ⟥    [debug] Mario should move left
               320ms         ⟥    [debug] Mario moved left by 3
               337ms         ⟥    [debug] Mario should move left
               337ms         ⟥    [debug] Mario moved left by 3
               353ms         ⟥    [debug] Mario should move left
               353ms         ⟥    [debug] Mario moved left by 3
               368ms         ⟥    [debug] Mario should move left
               368ms         ⟥    [debug] Mario moved left by 3
               384ms         ⟥    [debug] Mario should move left
               384ms         ⟥    [debug] Mario moved left by 3
               402ms         ⟥    [debug] Mario should move left
               402ms         ⟥    [debug] Mario moved left by 4
               417ms         ⟥    [debug] Mario should move left
               417ms         ⟥    [debug] Mario moved left by 4
               433ms         ⟥    [debug] Mario should move left
               433ms         ⟥    [debug] Mario moved left by 4
               448ms         ⟥    [debug] Mario should move left
               448ms         ⟥    [debug] Mario moved left by 4
               465ms         ⟥    [debug] Mario should move left
               465ms         ⟥    [debug] Mario moved left by 4
               482ms         ⟥    [debug] Mario should move left
               482ms         ⟥    [debug] Mario moved left by 4
               499ms         ⟥    [debug] Mario should move left
               500ms         ⟥    [debug] Mario moved left by 4
               515ms         ⟥    [debug] Mario should move left
               515ms         ⟥    [debug] Mario moved left by 5
               531ms         ⟥    [debug] Mario should move left
               531ms         ⟥    [debug] Mario moved left by 5
               546ms         ⟥    [debug] Mario should move left
               546ms         ⟥    [debug] Mario moved left by 5
               564ms         ⟥    [debug] Mario should move left
               564ms         ⟥    [debug] Mario moved left by 5
               578ms         ⟥    [debug] Mario should move left
               578ms         ⟥    [debug] Mario moved left by 5
               596ms         ⟥    [debug] Mario should move left
               596ms         ⟥    [debug] Mario moved left by 5
               610ms         ⟥    [debug] Mario should move left
               610ms         ⟥    [debug] Mario moved left by 6
               627ms         ⟥    [debug] Mario should move left
               627ms         ⟥    [debug] Mario moved left by 6
               644ms         ⟥    [debug] Mario should move left
               645ms         ⟥    Exception: AssertionError: Mario did not move left
               645ms         ⟥⟤ Fail press the left key for 1 second, /super mario/with model/move left/press the left key for 1 second, AssertionError
```

The test fails with `AssertionError: Mario did not move left` because our model expected Mario to continue moving, but he hit the left edge of the level! This reveals that our movement model is incomplete—we need to add collision detection for level boundaries.

### Enhancing the model with boundary detection

This demonstrates a key advantage of behavior models: **tests help improve the model iteratively**. Let's enhance our [`assert_movement`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L78) method to handle level boundaries by creating a new [`Level`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/level.py) model:

```python
def assert_movement(self, now, before, direction="right"):
    """
    Assert that Mario moved to the right or left and did not exceed max walking speed or level boundaries.
    """
    pos_now = self.get_position(now)
    pos_before = self.get_position(before)
    
    # Check boundary conditions with Level model
    mario_before = self.get("player", before)
    
    if direction == "right":
        debug("Mario should move right")
        if self.level.should_stay_at_boundary(mario_before, direction):
            # Mario should stay at boundary, not move further
            assert pos_now == pos_before, f"Mario should not move right past boundary"
        else:
            assert pos_now > pos_before, "Mario did not move right"
    elif direction == "left":
        debug("Mario should move left")
        if self.level.should_stay_at_boundary(mario_before, direction):
            # Mario should stay at boundary, not move further
            assert pos_now == pos_before, f"Mario should not move left past boundary"
        else:
            assert pos_now < pos_before, "Mario did not move left"
```

The key insights are:
1. **Separation of concerns**: Level model handles boundary logic, Mario model handles movement assertions
2. **Clean interface**: [`self.level.should_stay_at_boundary`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/level.py#L33) returns True/False
3. **Mario-specific assertions**: "Mario did not move left/right" stays in Mario model where it belongs
4. **Boundary respect**: If Level says stay put, Mario asserts no movement; otherwise Mario asserts movement

Now when we run the move left test, it passes because the model correctly expects Mario to stop when he hits the left edge! The enhanced model demonstrates how behavior models evolve through iterative testing—each failure teaches us something new about the system and makes our model more robust.

```bash
Sep 23,2025 20:35:16       ⟥  Scenario move left
                                Check Mario can move left in the game.
Sep 23,2025 20:35:16         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               303us         ⟥⟤ OK setup and cleanup, /super mario/with model/move left/setup and cleanup
Sep 23,2025 20:35:16         ⟥  When press the left key for 1 second
                30ms         ⟥    [debug] Mario was standing and is preparing to move left
                41ms         ⟥    [debug] Mario was standing and is preparing to move left
                61ms         ⟥    [debug] Mario was standing and is preparing to move left
                72ms         ⟥    [debug] Mario should move left
                72ms         ⟥    [debug] Mario moved left by 1
                88ms         ⟥    [debug] Mario should move left
                88ms         ⟥    [debug] Mario moved left by 1
               105ms         ⟥    [debug] Mario should move left
               105ms         ⟥    [debug] Mario moved left by 1
               121ms         ⟥    [debug] Mario should move left
               121ms         ⟥    [debug] Mario moved left by 1
               137ms         ⟥    [debug] Mario should move left
               137ms         ⟥    [debug] Mario moved left by 1
               153ms         ⟥    [debug] Mario should move left
               153ms         ⟥    [debug] Mario moved left by 1
               170ms         ⟥    [debug] Mario should move left
               171ms         ⟥    [debug] Mario moved left by 1
               187ms         ⟥    [debug] Mario should move left
               187ms         ⟥    [debug] Mario moved left by 2
               201ms         ⟥    [debug] Mario should move left
               201ms         ⟥    [debug] Mario moved left by 2
               219ms         ⟥    [debug] Mario should move left
               219ms         ⟥    [debug] Mario moved left by 2
               236ms         ⟥    [debug] Mario should move left
               236ms         ⟥    [debug] Mario moved left by 2
               254ms         ⟥    [debug] Mario should move left
               254ms         ⟥    [debug] Mario moved left by 2
               269ms         ⟥    [debug] Mario should move left
               269ms         ⟥    [debug] Mario moved left by 2
               286ms         ⟥    [debug] Mario should move left
               286ms         ⟥    [debug] Mario moved left by 3
               304ms         ⟥    [debug] Mario should move left
               304ms         ⟥    [debug] Mario moved left by 3
               318ms         ⟥    [debug] Mario should move left
               318ms         ⟥    [debug] Mario moved left by 3
               334ms         ⟥    [debug] Mario should move left
               334ms         ⟥    [debug] Mario moved left by 3
               348ms         ⟥    [debug] Mario should move left
               349ms         ⟥    [debug] Mario moved left by 3
               372ms         ⟥    [debug] Mario should move left
               372ms         ⟥    [debug] Mario moved left by 3
               383ms         ⟥    [debug] Mario should move left
               383ms         ⟥    [debug] Mario moved left by 3
               399ms         ⟥    [debug] Mario should move left
               399ms         ⟥    [debug] Mario moved left by 4
               416ms         ⟥    [debug] Mario should move left
               416ms         ⟥    [debug] Mario moved left by 4
               432ms         ⟥    [debug] Mario should move left
               432ms         ⟥    [debug] Mario moved left by 4
               448ms         ⟥    [debug] Mario should move left
               448ms         ⟥    [debug] Mario moved left by 4
               465ms         ⟥    [debug] Mario should move left
               465ms         ⟥    [debug] Mario moved left by 4
               481ms         ⟥    [debug] Mario should move left
               481ms         ⟥    [debug] Mario moved left by 4
               496ms         ⟥    [debug] Mario should move left
               496ms         ⟥    [debug] Mario moved left by 4
               512ms         ⟥    [debug] Mario should move left
               512ms         ⟥    [debug] Mario moved left by 5
               529ms         ⟥    [debug] Mario should move left
               529ms         ⟥    [debug] Mario moved left by 5
               544ms         ⟥    [debug] Mario should move left
               544ms         ⟥    [debug] Mario moved left by 5
               562ms         ⟥    [debug] Mario should move left
               562ms         ⟥    [debug] Mario moved left by 5
               576ms         ⟥    [debug] Mario should move left
               576ms         ⟥    [debug] Mario moved left by 5
               594ms         ⟥    [debug] Mario should move left
               594ms         ⟥    [debug] Mario moved left by 5
               610ms         ⟥    [debug] Mario should move left
               610ms         ⟥    [debug] Mario moved left by 6
               626ms         ⟥    [debug] Mario should move left
               626ms         ⟥    [debug] Mario moved left by 6
               641ms         ⟥    [debug] Mario should move left
               641ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               654ms         ⟥    [debug] Mario was standing and is preparing to move left
               675ms         ⟥    [debug] Mario was standing and is preparing to move left
               690ms         ⟥    [debug] Mario was standing and is preparing to move left
               705ms         ⟥    [debug] Mario should move left
               705ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               722ms         ⟥    [debug] Mario should move left
               722ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               740ms         ⟥    [debug] Mario should move left
               740ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               757ms         ⟥    [debug] Mario should move left
               757ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               772ms         ⟥    [debug] Mario should move left
               772ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               787ms         ⟥    [debug] Mario should move left
               787ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               802ms         ⟥    [debug] Mario should move left
               802ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               817ms         ⟥    [debug] Mario should move left
               817ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               835ms         ⟥    [debug] Mario should move left
               835ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               852ms         ⟥    [debug] Mario should move left
               852ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               867ms         ⟥    [debug] Mario should move left
               867ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               884ms         ⟥    [debug] Mario should move left
               884ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               900ms         ⟥    [debug] Mario should move left
               900ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               915ms         ⟥    [debug] Mario should move left
               915ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               934ms         ⟥    [debug] Mario should move left
               934ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               947ms         ⟥    [debug] Mario should move left
               947ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               965ms         ⟥    [debug] Mario should move left
               965ms         ⟥    [debug] Player at left boundary at x=0, level start_x=0
               967ms         ⟥⟤ OK press the left key for 1 second, /super mario/with model/move left/press the left key for 1 second
```

## Jumping with a model

Fresh from our success with movement detection and boundary collision, let's now convert the classical [`move jump`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_jump.py) test to use our behavior model in [`move jump with model`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_jump_with_model.py):

```python
@TestScenario
@Name("move jump")
def scenario(self):
    """Check Mario can move and jump in the game."""
    game = self.context.game
    model = self.context.model

    with When("press right and jump keys for 0.2 seconds"):
        with actions.press_jump():
            actions.play(game, seconds=0.2, model=model)
```

What could go wrong? After all, jumping is just vertical movement, right? It turns out to be more complex than expected.

#### The tale of the missing frame

The first mystery appeared when we fixed the state peeking issue. Our model would correctly detect when the jump key was pressed, but Mario's y-position stubbornly refused to change. Had our collision detection broken? Was Mario stuck to the ground?

The answer lay in the game's update loop. When the jump key is pressed in frame N, Mario's internal state immediately changes to `JUMP` and his vertical velocity is set. But his actual y-position doesn't change until frame N+1, when the game's position update logic runs. This 1-frame delay is invisible during normal gameplay but crucial for accurate modeling.

We had to redesign our [`expect_jump`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L305) method to look across three frames instead of two:

```python
def expect_jump(self, behavior):
    # Need 3 states to handle 1-frame delay: now, before, right_before
    now, before, right_before = behavior[-1], behavior[-2], behavior[-3]
    
    # Check if jump key was just pressed (not held)
    jump_pressed_before = self.is_key_pressed(before, "a")
    jump_pressed_right_before = self.is_key_pressed(right_before, "a")
    
    if jump_pressed_before and not jump_pressed_right_before:
        # Jump initiated in 'before' frame, check for y-position change in 'now'
        self.assert_jump(now, before)
```

#### The persistent key problem

But even with the timing fix, our jump tests were still failing in mysterious ways. Sometimes Mario would jump, sometimes he wouldn't, seemingly at random. The pattern emerged when we realized that our test was holding the jump key down continuously, expecting Mario to keep jumping.

This revealed another authentic game mechanic: Mario can't jump again while the jump key is held down. The key must be released and pressed again for each jump. This prevents accidental double-jumps and gives players precise control over their jumps.

Our model now had to track not just whether the jump key was pressed, but whether it had been released since the last press. This added another layer of temporal complexity to our jump detection logic.

#### When air physics broke inertia

The plot thickened when we started testing combined movement and jumping. Remember our carefully crafted inertia logic that counted consecutive frames to determine when Mario should start decelerating? It was completely wrong for airborne Mario.

When Mario jumps while moving horizontally, he maintains his momentum in the air indefinitely. But our [`has_maintained_inertia`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario.py#L146) method was counting air frames toward the ground-based inertia threshold, causing it to incorrectly expect Mario to decelerate mid-jump.

The fix required recognizing that air physics and ground physics are fundamentally different domains:

```python
def has_maintained_inertia(self, behavior, previous_movement, direction="right"):
    for state in behavior[-4::-1]:
        # If Mario was in the air, break the inertia chain
        mario_current = self.get("player", current_state)
        if not self.has_collision(mario_current, current_state, "bottom"):
            debug("Mario is in the air, inertia is maintained")
            break
        # ... rest of logic ...
```

## Testing the model using manual play

As our behavior model grew more sophisticated, we faced a fundamental challenge: how do you test a model designed to predict human behavior? Automated tests are excellent for regression testing, but they follow predictable patterns. Real players are chaotic, unpredictable, and creative in ways that expose edge cases no automated test would ever discover.

The solution was to combine the best of both worlds: **manual play with real-time model validation**.

### The power of interactive validation

We created a [`manual_play.py`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/manual_play.py) test that lets you control Mario directly while the behavior model validates every single frame in real-time. It's like having a physics professor watching over your shoulder, instantly calling out any violation of the game's expected behavior.

The implementation is surprisingly simple:

```python
@TestScenario
def scenario(self, play_seconds=30):
    """Allow manual play with behavior model validation."""
    game = self.context.game
    model = self.context.model
    
    with Given("setup for manual play"):
        actions.setup(game=game, overlays=[])
    
    with When(f"playing manually for {play_seconds} seconds"):
        game.manual = True  # Enable manual keyboard input
        
        with By("starting manual play session", 
                description="Use arrow keys, A to jump, S for action"):
            # This single line does all the magic:
            actions.play(game, seconds=play_seconds, model=model)
```

Run it with:
```bash
python -m pytest tests/run.py::module -k "manual" -v --manual-play-seconds=60
```

The moment you start playing, something magical happens. Every movement, every jump, every collision is being analyzed by hundreds of assertions per second. The model is checking:

- Is Mario's movement speed within expected limits?
- Is his inertia behavior correct when you release keys?
- Are jump physics working properly?
- Do boundaries and collisions behave as expected?
- Is the startup delay for direction changes being respected?

### Discovering the undiscoverable

Within minutes of manual testing, we uncovered issues that months of automated testing had missed. The most revealing was what we call the "boundary switching problem" - when Mario hits the left edge of the level and you immediately switch from pressing left to right, the model would fail:

```
Exception: AssertionError: Mario did not move right
```

This revealed a subtle timing issue: Mario needs an extra frame to transition away from boundary positions, something our automated tests never encountered because they don't rapidly switch directions at boundaries like humans do.

Similarly, we discovered a critical bug in our boundary assertion logic where the model would correctly detect Mario hitting a boundary, assert he should stop, but then continue executing and fail on a contradictory movement assertion. This logic error was invisible in automated tests but immediately apparent during manual play.

### The human advantage

What makes manual testing so powerful is that humans naturally do things that break assumptions:

- **Rapid input changes**: Switching directions multiple times per second
- **Edge case exploration**: Running into walls, jumping at boundaries, trying impossible combinations
- **Persistence testing**: Holding keys down, mashing buttons, testing limits
- **Creative sequences**: Combining movements in ways automated tests never would

Each of these human behaviors stress-tests different aspects of the model, revealing gaps between our expectations and reality.

### Real-time feedback loop

The beauty of this approach is the immediate feedback. The moment your behavior violates the model's expectations, you get an assertion failure with detailed debug information. This creates a rapid learning cycle:

1. **Play naturally** - Use Mario as you would in any game
2. **Model fails** - An assertion catches unexpected behavior  
3. **Investigate** - Debug output shows exactly what went wrong
4. **Fix model** - Update the model to handle the edge case
5. **Repeat** - Continue playing to find the next issue

This process is far more efficient than trying to anticipate edge cases through pure reasoning or hoping automated tests will stumble upon them.

### Beyond bug finding

Manual testing with model validation does more than just find bugs - it validates that our understanding of the game's behavior is complete and accurate. When you can play for extended periods without any assertion failures, you know your model truly captures the game's physics and mechanics.

It's the difference between having a theoretical understanding of how Mario should behave versus having empirical proof that your model correctly predicts how Mario actually behaves under all conditions a human player might create.

This combination of human creativity and automated validation represents a new paradigm in testing: using human intuition to explore the space of possible behaviors while using formal models to ensure that exploration leads to accurate, verifiable understanding.

## Conclusion

