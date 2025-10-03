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


## The theory behind behavior models

Before we start writing and using a behavior model to verify the correctness of *Super Mario* under test, we need to understand the underlying theory behind it.

At its core, a behavior model is a practical method of describing how a system should **behave** using a programming language.

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

 > Note that systems described as a predicate-based transition relation is the foundation of tools like [TLA+](https://lamport.azurewebsites.net/tla/tla.html).

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

Technically, most properties fall into **safety**. Why? Because **liveness** and 
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
  * "If the right key is pressed, then Mario should move right."

This forward approach requires you to predict and implement exactly what should happen—you must define how Mario accelerates, how inertia works, how collisions affect movement, and so on. This essentially requires reimplementing the game's logic in your model.

**Causal reverse logic:**
  * "If Mario moved right, then there must have been a valid cause (right key pressed OR rightward velocity from inertia)."

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

  * "The result of adding two positive numbers must be greater than or equal to each input."

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

## Composability and scalability of the behavior model

No matter if our behavior model implements a partial or full transition relation, or contains just properties or a mix of both, composability is what makes it practical and scalable. This is because both transition relations and properties are composable, which enables **incremental construction**. This means you can start with a single validation rule and grow the model piece by piece, without needing a complete specification upfront.

**Transition relations are composable** because each predicate {% katex %}\varphi_i{% endkatex %} is independent and self-contained, joined by logical **OR**:

* We can start with a single transition rule—Mario moving right—and have a working model. Add jumping behavior? Just another predicate joined with **OR**. Enemy interactions? Another predicate. Each addition makes the model more comprehensive without breaking existing parts.

**Properties are composable** because each property checks an independent aspect of behavior:

* Start with one causal property—rightward movement has a cause. Add a safety property—speed never exceeds maximum. Add a liveness property—Mario eventually starts moving. Each property validates its own concern without interfering with others.

This flexibility is what makes behavior models both powerful and practical for complex systems.

## Starting to build the behavior model

With the theory out of the way, now we're ready to start writing the *Super Mario* behavior model. Given the composability and scalability properties discussed above, getting started is straightforward. 

We'll start by defining a [**Game**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L8) class that takes a [**`game`**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L11) object (an instance of the [Control](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/actions/game.py#L101) class) and stores it as an attribute for quick access. For example, we'll need to access the [vision](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/actions/game.py#L107) system to get a list of visible objects.

The game model implements an [**expect**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L16) method that takes the current **`behavior`** of the game—the history of all game states up to and including the current state—and uses this history to assert whether the current state meets the model's expectations.

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

This structure provides the foundation to implement both the **transition relation** {% katex %}R{% endkatex %} (defining valid states and state transitions) and **properties** that must hold across states. The [**expect**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L16) method will contain our behavioral assertions, and we can add new predicates and properties incrementally as our model grows in sophistication. Again, for the purpose of this article we will only focus on properties to keep things simple.

## Model code structure

For the model, we use an object-oriented code structure that combines **inheritance** and **composition** to create a modular, scalable design. 

**Inheritance** provides shared functionality: each game object model inherits from a base [Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/base.py#L6) class that implements common operations like collision detection, position tracking, and key state queries.

**Composition** creates the model hierarchy: for example, the [Game](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L8) model [composes](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L13) both [Level](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/level.py#L8) and [Mario](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L12) models, while Mario further [composes](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L18) a [Movement](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/movement.py#L432) model. This provides natural separation of concerns where each game entity has its own specialized model.

Given that our model will focus on Mario's movement, the model hierarchy consists of:

1. **[Base Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/base.py#L6)** - Provides common functionality like collision detection, position tracking, and key state queries
2. **[Game Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L8)** - Top-level coordinator that composes Level and Mario models
3. **[Level Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/level.py#L8)** - Handles level-specific properties like boundaries
4. **[Mario Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L12)** - Delegates to specialized movement model
5. **[Movement Model](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/movement.py#L432)** - Implements Mario's movement behavior

Here's the [**Game**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L8) model that serves as the entry point:

```python
class Game(Model):
    """Game model."""

    def __init__(self, game):
        super().__init__(game)
        self.level = Level(game=game)
        self.mario = Mario(game=game, level=self.level)

    def expect(self, behavior):
        """Expect the game to behave correctly."""
        self.mario.expect(behavior)
```

The Game model creates a Level model and passes it to the Mario model, establishing the dependency relationship. When [**expect**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L16) is called with the behavior history, it [delegates](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/game.py#L19) to Mario's expect method.

The [**Mario**](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L12) model further [delegates](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L22) to a Movement model:

```python
class Mario(Model):
    """Mario's behavior model using modular architecture."""

    def __init__(self, game, level):
        super().__init__(game)
        self.level = level
        self.movement = Movement(game=game, level=level)

    def expect(self, behavior):
        """Expect Mario to behave correctly."""
        self.movement.expect(behavior)
```

This layered composition provides several advantages:
- **Modularity**: Each aspect (game coordination, level boundaries, character movement) has its own focused model
- **Reusability**: Common functionality is shared through the base Model class
- **Scalability**: New models can be added without modifying existing ones
- **Testability**: Each model can be tested independently or as part of the whole

## First attempt to model movement

Now let's build our first behavior model by implementing Mario's movement mechanics in the [Mario](https://github.com/testflows/Examples/blob/v1.0/SuperMario/tests/models/mario/model.py#L12) model class.

At first glance, modeling movement seems straightforward: if the right key is pressed, Mario's x-position should increase; if the left key is pressed, it should decrease. Let's start with the most naive approach and attempt to implement an `expect_move` method:

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

The `expect_move` model is simple and at first intuitive, but if we plug it into our tests then it immediately fails.
Why? The game's physics engine introduces numerous complexities that our naive model doesn't account for:

- **Startup delay**: When Mario starts from a standing position, there's a brief delay before movement begins
- **Inertia**: Mario continues moving briefly after keys are released
- **Acceleration**: Mario doesn't instantly reach full speed
- **Deceleration**: Mario doesn't stop immediately when keys are released
- **Turn-around physics**: Changing direction involves fighting the inertia from the previous direction
- **Obstacles**: Mario can't move through walls, blocks, bricks, pipes, or enemies

To handle even just a few of these complexities—startup delay, turn-around physics, and obstacles—we'd need to extend our model significantly:

```python
def expect_move(self, behavior, direction):
    """Expect Mario to move when movement keys are pressed."""

    # Check if Mario was standing still
    if self.was_standing_still(behavior):
        # Allow for startup delay - don't assert movement yet
        if not self.enough_time_elapsed_for_startup(behavior):
            return
    
    # Check if Mario is turning around
    if self.is_turning_around(behavior, direction):
        # Need to account for deceleration then acceleration
        if not self.has_completed_turnaround(behavior, direction):
            return
    
    # Check for obstacles
    if self.obstacle_in_direction(behavior, direction):
        # Don't expect movement
        return
    
    # Finally, check if key is pressed and assert movement
    if self.is_key_pressed(behavior, direction):
        # But wait, also need to check inertia, acceleration curves...
        # This is not simple after all!
```

The conditional logic adds rapidly increasing complexity. Each physics aspect requires checking multiple frames of history, tracking state transitions, and writing increasingly complex nested conditions. We'd need separate helpers for detecting standing states, measuring elapsed time, identifying direction changes, checking for obstacles, validating acceleration, and handling inertia decay. That's hard to maintain, difficult to understand, and brittle to changes in game physics.

## Modeling movement with properties

There's a more practical approach: instead of trying to fully implement all the complex transition relations and state tracking, we can express movement expectations as **properties**. When faced with complex transition relations, properties provide a pragmatic workaround—we avoid modeling intricate physics states by simply verifying key relationships hold.

It's not a complete model of the physics engine, but it's practical. Instead of tracking exact acceleration curves, inertia decay rates, and turn-around physics states, we express high-level properties: effects have valid causes, invariants are never violated, and expected behaviors eventually occur. This gives us useful validation without reverse-engineering the entire physics system.

Our [**movement model**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py) organizes properties into three categories: [**causal**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L220), [**safety**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L389), and [**liveness**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L340).

### Causal properties

Causal properties verify that observed effects have valid causes. Instead of predicting "if X then Y," we observe what happened and check "if Y occurred, then X must have been true."
```python
class CausalProperties(Propositions):
    """Causal properties for Mario's movement."""

    def check_right_movement(self, behavior):
        """Check if Mario's right movement had a valid cause."""
        actual_movement = behavior.actual_movement
        velocity = behavior.velocity
        right_pressed = self.right_pressed(behavior.keys)

        if self.moved_right(actual_movement):
            self.model.assert_with_success(
                self.has_right_movement_cause(velocity, right_pressed),
                f"moved right because {f'velocity is {velocity}' if velocity > 0 else 'right key is pressed'}",
            )
```

The [**check right movement**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L223) causal property says: "if Mario moved right, there must be a cause—either he had rightward velocity (inertia) or the right key was pressed." We don't need to model when movement starts, how fast acceleration happens, or the exact inertia decay curve. We just verify the cause-effect relationship. Similarly, [**check left movement**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L236) verifies leftward movement has a valid cause.

In addition to checking only right and left movement, we can also add a [**check stayed in place**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L249) property to check that Mario is just staying in place also has a valid cause:

```python
def check_stayed_in_place(self, behavior):
    """Check if Mario staying in place had a valid cause."""
    if self.stayed_in_place(actual_movement):
        self.model.assert_with_success(
            (
                # no left or right key pressed
                self.no_keys(right_pressed, left_pressed)
                # deaccelearted to full stop
                or self.tiny_velocity(velocity)
                # both keys pressed and deaccelarated to full stop
                or self.both_keys_tiny_velocity(
                    velocity, right_pressed, left_pressed
                )
                # had left velocity but ran into left obsticle
                or (
                    self.velocity_left(velocity)
                    and self.left_touching(mario_now, now, mario_before, before)
                )
                # had right velocity but ran into right obsticle
                or (
                    self.velocity_right(velocity)
                    and self.right_touching(mario_now, now, mario_before, before)
                )
                # had left velocity but ran into left game boundary
                or (
                    self.velocity_left(velocity)
                    and self.at_left_boundary(mario_now)
                )
                # had right velocity but ran into right game boundary
                or (
                    self.velocity_right(velocity)
                    and self.at_right_boundary(mario_now)
                )
            ),
            "stayed in place",
        )
```

If Mario didn't move, there must be a reason: no keys were pressed, velocity was too small to register movement, he hit an obstacle, or he reached a boundary.

Causal properties handle the physics complexity practically. For example, for a jump we can assert that upward movement had a valid cause using the [**check jump**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L322) property instead of precisely modeling the complex jump arc:

```python
def check_jump(self, behavior):
    """Check if Mario's upward movement (jump) has a valid cause."""
    if self.moved_up(behavior.actual_vertical_movement):
        self.model.assert_with_success(
            (
                # jump key pressed while on ground
                (jump_pressed and self.on_the_ground(mario_before, before))
                # bounced off enemy
                or self.stomped_enemy(mario_before, before)
                # had upward velocity from previous jump
                or self.velocity_up(vertical_velocity)
            ),
            "jumped because jump was pressed on ground or bounced off enemy or had upward velocity",
        )
```

### Safety properties

Safety properties verify that certain invariants are never violated—things that should never happen regardless of input or timing.

The [**check does not exceed max velocity**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L408) property ensures Mario never moves faster than physically possible. Because walking and running have different max speeds, we take that into account:

```python
class SafetyProperties(Propositions):
    """Safety properties for Mario's movement."""

    def check_does_not_exceed_max_velocity(self, behavior):
        """Check if Mario does not exceed the maximum speed."""
        if self.running_pressed_recently(behavior):
            self.model.assert_with_success(
                not self.exceeds_max_run_velocity(behavior.velocity_now),
                f"Mario's velocity {behavior.velocity_now} is within run maximum",
            )
        else:
            self.model.assert_with_success(
                not self.exceeds_max_walk_velocity(behavior.velocity_now),
                f"Mario's velocity {behavior.velocity_now} is within walk maximum",
            )
```

Similarly, the [**check does not move past left boundary**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L392) and [**check does not move past right boundary**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L400) properties ensure Mario stays within the level boundaries:

```python
def check_does_not_move_past_left_boundary(self, behavior):
    """Check if Mario does not move past the boundary."""
    self.model.assert_with_success(
        not self.past_left_boundary(behavior.mario_now),
        f"Mario is within left boundary x={behavior.mario_now.box.x}, boundary={self.model.level.start_x}",
    )

def check_does_not_move_past_right_boundary(self, behavior):
    """Check if Mario does not move past the boundary."""

    self.model.assert_with_success(
        not self.past_right_boundary(behavior.mario_now),
        f"Mario is within right boundary x={behavior.mario_now.box.x}, boundary={self.model.level.end_x - behavior.mario_now.box.w}",
    )
```

Together, these safety properties catch physics bugs and violations: if Mario suddenly moves faster than possible, clips through level boundaries, or breaks other physical constraints, the model immediately detects and reports the issue.

### Liveness properties

In addition to causal and safety properties, we can also implement a liveness property that verifies expected behaviors eventually occur. For example, we can implement the [**check starts moving**](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L343) property to verify that if the left or right key is pressed long enough, Mario eventually starts to move:

```python
class LivenessProperties(Propositions):
    """Liveness properties for Mario's movement."""

    def check_starts_moving(self, behavior):
        """Check if Mario eventually starts moving when keys are consistently pressed."""

        history = list(reversed(behavior.history[-(self.max_stayed_still + 2) :]))
        stayed_still = 0

        # set current direction
        direction = self.model.direction(
            behavior.now, self.in_the_air(behavior.mario_now, behavior.now)
        )

        if direction is None:
            # no keys pressed
            return

        for now, before in zip(history[:-1], history[1:]):
            pos_before = self.model.get_position(before)
            pos_now = self.model.get_position(now)
            actual_movement = pos_now - pos_before

            mario_now = self.model.get("player", now)
            mario_before = self.model.get("player", before)

            # Mario started moving
            if self.moved(actual_movement):
                break

            # check if direction was changed
            if self.model.direction(now, self.in_the_air(mario_now, now)) != direction:
                break

            # check if path was blocked
            if not self.path_is_clear(mario_now, now, mario_before, before, direction):
                break

            stayed_still += 1

        if stayed_still < 1:
            return

        self.model.assert_with_success(
            not self.stayed_still_too_long(stayed_still),
            f"Mario started moving after {stayed_still} frames",
        )
```

This liveness property is more complex than causal and safety properties as it needs to look back through recent history to count how long Mario stayed still despite holding a direction key with a clear path. If he stayed still too long (more than 45 frames), the property fails.

Liveness properties handle the "eventually" part of behavior that causal and safety properties don't cover. Causal properties say "if Mario moved, there was a cause." Safety properties say "Mario never violates constraints." Liveness properties say "if there's a cause and no obstacles, Mario should eventually move." 

Note that this is bounded liveness—we don't wait forever, but check that the expected behavior occurs within a reasonable time window (45 frames in this case).

### Composing properties

The [Movement model](https://github.com/testflows/Examples/blob/main/SuperMario/tests/models/mario/movement.py#L432) composes all properties from these three property categories. Together, they provide comprehensive validation:

- If Mario moved, there was a reason (causal)
- If Mario is moving, he's not violating limits (safety)
- If Mario should move, he eventually does (liveness)

This approach is practical because:
- **No complex state machines**: We don't track "accelerating," "decelerating," "turning around" states
- **No precise physics modeling**: We don't implement acceleration curves or friction coefficients  
- **Observable behavior only**: We check what we can see, not internal implementation
- **Tolerant of timing**: Properties naturally handle delays and gradual transitions
- **Composable**: Each property is independent and can be added incrementally

The tradeoff is incompleteness—we're not modeling every detail of the physics engine. But for testing purposes, this pragmatic workaround gives us strong validation without the complexity of a complete transition-relation model, which can be added later if needed. We catch physics bugs, responsiveness issues, and constraint violations without having to reverse-engineer Mario's exact physics implementation from the start.

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
Oct 03,2025 15:05:23       ⟥  Scenario move right
                                Check Mario can move right in the game.
Oct 03,2025 15:05:23         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               284us         ⟥⟤ OK setup and cleanup, /super mario/with model/move right/setup and cleanup
Oct 03,2025 15:05:23         ⟥  When press the right key for 1 second
                10ms         ⟥    [debug] ✓ Mario stayed in place
                11ms         ⟥    [debug] ✓ Mario Mario stayed still for 1 frames
                11ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                11ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                11ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                11ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                29ms         ⟥    [debug] ✓ Mario stayed in place
                29ms         ⟥    [debug] ✓ Mario Mario stayed still for 2 frames
                29ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                29ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                29ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                29ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                45ms         ⟥    [debug] ✓ Mario stayed in place
                46ms         ⟥    [debug] ✓ Mario Mario stayed still for 3 frames
                46ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                46ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                47ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                47ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                62ms         ⟥    [debug] ✓ Mario stayed in place
                63ms         ⟥    [debug] ✓ Mario Mario stayed still for 4 frames
                63ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                63ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                63ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                63ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                78ms         ⟥    [debug] ✓ Mario moved right because right key is pressed
                79ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=111, boundary=0
                79ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=111, boundary=9056
                79ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
                79ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                95ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
                95ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=112, boundary=0
                95ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=112, boundary=9056
                96ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
                96ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               112ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               112ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=113, boundary=0
               112ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=113, boundary=9056
               112ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               112ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               127ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               127ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=114, boundary=0
               127ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=114, boundary=9056
               128ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               128ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               144ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               144ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=115, boundary=0
               144ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=115, boundary=9056
               144ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               144ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               159ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               159ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=116, boundary=0
               159ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=116, boundary=9056
               159ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               159ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               175ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               176ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=117, boundary=0
               176ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=117, boundary=9056
               176ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               176ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               194ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               195ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=119, boundary=0
               195ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=119, boundary=9056
               195ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               195ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               207ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               207ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=121, boundary=0
               207ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=121, boundary=9056
               207ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               207ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               225ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               225ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=123, boundary=0
               225ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=123, boundary=9056
               225ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               225ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               240ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               241ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=125, boundary=0
               241ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=125, boundary=9056
               241ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               241ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               256ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               256ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=127, boundary=0
               256ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=127, boundary=9056
               257ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               257ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               271ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               271ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=129, boundary=0
               271ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=129, boundary=9056
               271ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               271ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               289ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               289ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=132, boundary=0
               289ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=132, boundary=9056
               290ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               290ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               310ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               310ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=135, boundary=0
               310ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=135, boundary=9056
               311ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               311ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               323ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               323ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=138, boundary=0
               323ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=138, boundary=9056
               323ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               323ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               340ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               340ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=141, boundary=0
               340ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=141, boundary=9056
               340ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               340ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               355ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               355ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=144, boundary=0
               355ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=144, boundary=9056
               355ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               355ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               369ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               369ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=147, boundary=0
               369ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=147, boundary=9056
               369ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               369ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               387ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               387ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=150, boundary=0
               387ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=150, boundary=9056
               387ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               387ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               399ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               400ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=154, boundary=0
               400ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=154, boundary=9056
               400ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               400ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               419ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               419ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=158, boundary=0
               419ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=158, boundary=9056
               419ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               419ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               439ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               439ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=162, boundary=0
               439ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=162, boundary=9056
               439ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               439ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               451ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               451ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=166, boundary=0
               451ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=166, boundary=9056
               451ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               451ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               468ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               468ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=170, boundary=0
               468ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=170, boundary=9056
               468ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               468ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               483ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               483ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=174, boundary=0
               483ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=174, boundary=9056
               484ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               484ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               500ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               500ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=178, boundary=0
               500ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=178, boundary=9056
               501ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               501ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               519ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               521ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=183, boundary=0
               521ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=183, boundary=9056
               522ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               522ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               533ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               533ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=188, boundary=0
               533ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=188, boundary=9056
               533ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               533ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               547ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               547ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=193, boundary=0
               547ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=193, boundary=9056
               547ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               547ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               561ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               561ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=198, boundary=0
               561ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=198, boundary=9056
               561ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               561ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               577ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               577ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=203, boundary=0
               577ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=203, boundary=9056
               577ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               577ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               601ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               601ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=208, boundary=0
               601ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=208, boundary=9056
               602ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
               602ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               614ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
               614ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=214, boundary=0
               614ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=214, boundary=9056
               614ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               614ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               630ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               630ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=220, boundary=0
               630ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=220, boundary=9056
               631ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               631ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               648ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               648ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=226, boundary=0
               648ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=226, boundary=9056
               649ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               649ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               665ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               666ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=232, boundary=0
               666ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=232, boundary=9056
               666ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               666ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               681ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               685ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=238, boundary=0
               685ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=238, boundary=9056
               686ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               686ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               696ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               696ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=244, boundary=0
               696ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=244, boundary=9056
               697ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               697ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               712ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               712ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=250, boundary=0
               712ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=250, boundary=9056
               712ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               712ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               728ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               728ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=256, boundary=0
               728ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=256, boundary=9056
               728ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               728ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               743ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               743ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=262, boundary=0
               743ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=262, boundary=9056
               744ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               744ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               758ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               758ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=268, boundary=0
               758ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=268, boundary=9056
               759ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               759ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               778ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               778ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=274, boundary=0
               778ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=274, boundary=9056
               778ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               778ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               792ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               792ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=280, boundary=0
               792ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=280, boundary=9056
               792ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               792ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               808ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               808ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=286, boundary=0
               808ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=286, boundary=9056
               808ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               808ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               823ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               824ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=292, boundary=0
               824ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=292, boundary=9056
               824ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               824ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               841ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               845ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=298, boundary=0
               845ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=298, boundary=9056
               845ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               845ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               855ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               855ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=304, boundary=0
               855ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=304, boundary=9056
               856ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               856ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               872ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               873ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=310, boundary=0
               873ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=310, boundary=9056
               873ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               873ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               887ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               887ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=316, boundary=0
               887ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=316, boundary=9056
               887ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               887ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               900ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               900ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=322, boundary=0
               900ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=322, boundary=9056
               900ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               900ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               919ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               919ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=328, boundary=0
               919ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=328, boundary=9056
               919ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               919ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               940ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               940ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=334, boundary=0
               940ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=334, boundary=9056
               940ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               940ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               952ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               952ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=340, boundary=0
               952ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=340, boundary=9056
               952ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               952ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               968ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
               968ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=346, boundary=0
               968ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=346, boundary=9056
               969ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
               969ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               969ms         ⟥⟤ OK press the right key for 1 second, /super mario/with model/move right/press the right key for 1 second
```

The debug messages show how all three property types validate Mario's movement every frame:

1. **Causal property validation**: Each frame shows why Mario moved—either "moved right because right key is pressed" (initial movement) or "moved right because velocity is X" (continued movement from inertia)
2. **Safety property validation**: Every frame verifies Mario stays within boundaries (left at 0, right at 9056) and doesn't exceed maximum velocity (walk maximum of 6)
3. **Gradual acceleration**: The velocity in the safety checks reveals Mario's acceleration: 1 → 2 → 3 → 4 → 5 → 6 pixels per frame
4. **Additional safety checks**: Vertical velocity is also monitored to ensure it stays within limits

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
                assert ... # this is actually very non-trivial!
```

But implementing those frame-by-frame assertions manually would be non-trivial. Instead, by keeping the same simple test procedure as before, the model automatically validates every frame against all our properties, transforming a simple "press right for 1 second" action into a test that checks Mario has a valid reason to move, doesn't exceed his maximum speed, stays within level bounds, and eventually starts moving when keys are pressed.

This is what we mean by property testing on steroids! The exact same test action checks an order of magnitude more. And as we add more properties to the model, every existing test automatically gains broader coverage without any code changes.

## Moving left with a model

With our model successfully handling rightward movement, let's test its limits by converting the [`move left`](https://github.com/testflows/Examples/blob/main/SuperMario/tests/move_left_with_model.py) test. This will reveal some interesting physics:

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

Let's run our new with model **move left** test first right after the **move right** test :

```bash
./tests/run.py --save-video --only "/super mario/with model/move right/*" "/super mario/with model/move left/*"
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-10.gif">
<div class="text-secondary text-bold"><br>Super Mario: Behavior Model-Driven Move Left After Move Right Test</div>
</div><br>

The test will produce the following messages:

```bash
Oct 03,2025 15:26:02       ⟥  Scenario move left
                                Check Mario can move left in the game.
Oct 03,2025 15:26:02         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               237us         ⟥⟤ OK setup and cleanup, /super mario/with model/move left/setup and cleanup
Oct 03,2025 15:26:02         ⟥  When press the left key for 1 second
                 4ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
                 4ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=352, boundary=0
                 4ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=352, boundary=9056
                 4ms         ⟥    [debug] ✓ Mario Mario's velocity 6 is within walk maximum
                 4ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                20ms         ⟥    [debug] ✓ Mario moved right because velocity is 6
                20ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=357, boundary=0
                20ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=357, boundary=9056
                21ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
                21ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                37ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
                37ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=362, boundary=0
                37ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=362, boundary=9056
                38ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
                38ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                54ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
                54ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=367, boundary=0
                54ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=367, boundary=9056
                54ms         ⟥    [debug] ✓ Mario Mario's velocity 5 is within walk maximum
                54ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                71ms         ⟥    [debug] ✓ Mario moved right because velocity is 5
                71ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=371, boundary=0
                71ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=371, boundary=9056
                71ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
                71ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                88ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
                88ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=375, boundary=0
                88ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=375, boundary=9056
                89ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
                89ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               104ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               104ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=379, boundary=0
               104ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=379, boundary=9056
               104ms         ⟥    [debug] ✓ Mario Mario's velocity 4 is within walk maximum
               104ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               121ms         ⟥    [debug] ✓ Mario moved right because velocity is 4
               121ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=382, boundary=0
               121ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=382, boundary=9056
               122ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               122ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               137ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               137ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=385, boundary=0
               137ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=385, boundary=9056
               137ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               138ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               153ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               153ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=388, boundary=0
               153ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=388, boundary=9056
               153ms         ⟥    [debug] ✓ Mario Mario's velocity 3 is within walk maximum
               153ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               169ms         ⟥    [debug] ✓ Mario moved right because velocity is 3
               169ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=390, boundary=0
               169ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=390, boundary=9056
               170ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               170ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               185ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               185ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=392, boundary=0
               185ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=392, boundary=9056
               185ms         ⟥    [debug] ✓ Mario Mario's velocity 2 is within walk maximum
               185ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               198ms         ⟥    [debug] ✓ Mario moved right because velocity is 2
               198ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=393, boundary=0
               198ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=393, boundary=9056
               198ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               198ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               213ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               214ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=394, boundary=0
               214ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=394, boundary=9056
               214ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               214ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               229ms         ⟥    [debug] ✓ Mario moved right because velocity is 1
               229ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=395, boundary=0
               229ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=395, boundary=9056
               229ms         ⟥    [debug] ✓ Mario Mario's velocity 1 is within walk maximum
               229ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               246ms         ⟥    [debug] ✓ Mario stayed in place
               246ms         ⟥    [debug] ✓ Mario Mario stayed still for 1 frames
               246ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=395, boundary=0
               246ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=395, boundary=9056
               246ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               246ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               262ms         ⟥    [debug] ✓ Mario stayed in place
               262ms         ⟥    [debug] ✓ Mario Mario stayed still for 2 frames
               262ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=395, boundary=0
               262ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=395, boundary=9056
               262ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               262ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               282ms         ⟥    [debug] ✓ Mario stayed in place
               283ms         ⟥    [debug] ✓ Mario Mario stayed still for 3 frames
               283ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=395, boundary=0
               283ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=395, boundary=9056
               283ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               283ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               299ms         ⟥    [debug] ✓ Mario stayed in place
               299ms         ⟥    [debug] ✓ Mario Mario stayed still for 4 frames
               299ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=395, boundary=0
               299ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=395, boundary=9056
               299ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               299ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               313ms         ⟥    [debug] ✓ Mario moved left because left key is pressed
               314ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=394, boundary=0
               314ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=394, boundary=9056
               314ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               314ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               330ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               330ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=393, boundary=0
               330ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=393, boundary=9056
               331ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               331ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               345ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               345ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=392, boundary=0
               345ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=392, boundary=9056
               345ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               345ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               361ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               362ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=391, boundary=0
               362ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=391, boundary=9056
               362ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               362ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               376ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               376ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=390, boundary=0
               376ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=390, boundary=9056
               377ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               377ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               394ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               395ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=389, boundary=0
               395ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=389, boundary=9056
               395ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               395ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               407ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               407ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=388, boundary=0
               407ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=388, boundary=9056
               407ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               407ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               429ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               429ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=386, boundary=0
               429ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=386, boundary=9056
               429ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               429ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               443ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               443ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=384, boundary=0
               443ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=384, boundary=9056
               444ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               444ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               461ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               461ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=382, boundary=0
               461ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=382, boundary=9056
               461ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               461ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               476ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               476ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=380, boundary=0
               476ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=380, boundary=9056
               477ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               477ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               492ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               492ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=378, boundary=0
               492ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=378, boundary=9056
               492ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               492ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               506ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               506ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=376, boundary=0
               506ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=376, boundary=9056
               507ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               507ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               526ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               528ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=373, boundary=0
               528ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=373, boundary=9056
               528ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               528ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               538ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               538ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=370, boundary=0
               538ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=370, boundary=9056
               538ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               538ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               555ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               555ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=367, boundary=0
               555ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=367, boundary=9056
               556ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               556ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               572ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               572ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=364, boundary=0
               572ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=364, boundary=9056
               573ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               573ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               589ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               589ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=361, boundary=0
               589ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=361, boundary=9056
               590ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               590ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               605ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               605ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=358, boundary=0
               605ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=358, boundary=9056
               605ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               605ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               622ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               622ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=355, boundary=0
               622ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=355, boundary=9056
               622ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               622ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               639ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               639ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=351, boundary=0
               639ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=351, boundary=9056
               640ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               640ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               653ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               653ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=347, boundary=0
               653ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=347, boundary=9056
               654ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               654ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               668ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               668ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=343, boundary=0
               668ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=343, boundary=9056
               668ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               668ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               691ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               693ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=339, boundary=0
               693ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=339, boundary=9056
               693ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               693ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               698ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               698ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=335, boundary=0
               698ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=335, boundary=9056
               698ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               698ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               717ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               717ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=331, boundary=0
               717ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=331, boundary=9056
               717ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               717ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               733ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               733ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=327, boundary=0
               734ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=327, boundary=9056
               734ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               734ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               751ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               751ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=322, boundary=0
               751ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=322, boundary=9056
               751ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               751ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               766ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               766ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=317, boundary=0
               766ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=317, boundary=9056
               767ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               767ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               781ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               781ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=312, boundary=0
               781ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=312, boundary=9056
               781ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               781ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               798ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               798ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=307, boundary=0
               798ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=307, boundary=9056
               799ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               799ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               814ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               814ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=302, boundary=0
               814ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=302, boundary=9056
               815ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               815ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               830ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               830ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=297, boundary=0
               830ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=297, boundary=9056
               831ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               831ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               846ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               846ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=291, boundary=0
               846ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=291, boundary=9056
               846ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               846ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               859ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               859ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=285, boundary=0
               859ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=285, boundary=9056
               860ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               860ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               875ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               875ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=279, boundary=0
               875ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=279, boundary=9056
               875ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               875ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               898ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               898ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=273, boundary=0
               898ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=273, boundary=9056
               898ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               898ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               910ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               910ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=267, boundary=0
               910ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=267, boundary=9056
               911ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               911ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               932ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               932ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=261, boundary=0
               932ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=261, boundary=9056
               933ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               933ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               942ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               942ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=255, boundary=0
               942ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=255, boundary=9056
               942ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               942ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               960ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               960ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=249, boundary=0
               961ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=249, boundary=9056
               961ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               961ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               961ms         ⟥⟤ OK press the left key for 1 second, /super mario/with model/move left/press the left key for 1 second
```

The debug messages reveal the physics of changing direction:

**Phase 1: Rightward inertia and deceleration**
Mario starts with maximum rightward velocity (6 pixels/frame) from previous movement. Even though we press left, he continues moving right while decelerating due to inertia! The velocity progression: 6 → 5 → 4 → 3 → 2 → 1 → 0.

**Phase 2: Coming to a stop**
Mario's velocity reaches 0 and he "stayed in place" for 4 frames. The liveness property tracks this: "Mario stayed still for 1 frames," then 2, 3, and finally 4 frames, validating he eventually starts moving.

**Phase 3: Leftward acceleration**
Mario begins moving left: "moved left because left key is pressed" initially, then "moved left because velocity is -1" as inertia takes over. He accelerates following the same pattern as rightward movement: -1 → -2 → -3 → -4 → -5 → -6 pixels per frame.

This demonstrates how all three property types work together: causal properties explain why Mario moved or stayed still, safety properties ensure velocity stays within limits, and liveness properties confirm Mario doesn't stay still too long when keys are pressed.

### Running move left with model test by itself

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
Oct 03,2025 15:33:30       ⟥  Scenario move left
                                Check Mario can move left in the game.
Oct 03,2025 15:33:30         ⟥  Given setup and cleanup, flags:MANDATORY|SETUP
               239us         ⟥⟤ OK setup and cleanup, /super mario/with model/move left/setup and cleanup
Oct 03,2025 15:33:30         ⟥  When press the left key for 1 second
                 7ms         ⟥    [debug] ✓ Mario stayed in place
                 7ms         ⟥    [debug] ✓ Mario Mario stayed still for 1 frames
                 7ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                 7ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                 7ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                 7ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                26ms         ⟥    [debug] ✓ Mario stayed in place
                26ms         ⟥    [debug] ✓ Mario Mario stayed still for 2 frames
                27ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                27ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                27ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                27ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                43ms         ⟥    [debug] ✓ Mario stayed in place
                44ms         ⟥    [debug] ✓ Mario Mario stayed still for 3 frames
                44ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                44ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                44ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                44ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                59ms         ⟥    [debug] ✓ Mario stayed in place
                59ms         ⟥    [debug] ✓ Mario Mario stayed still for 4 frames
                60ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=110, boundary=0
                60ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=110, boundary=9056
                60ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
                60ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                74ms         ⟥    [debug] ✓ Mario moved left because left key is pressed
                75ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=109, boundary=0
                75ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=109, boundary=9056
                75ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
                75ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
                91ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
                91ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=108, boundary=0
                91ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=108, boundary=9056
                92ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
                92ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               106ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               107ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=107, boundary=0
               107ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=107, boundary=9056
               107ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               107ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               123ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               123ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=106, boundary=0
               123ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=106, boundary=9056
               123ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               123ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               139ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               140ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=105, boundary=0
               140ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=105, boundary=9056
               140ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               140ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               157ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               157ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=104, boundary=0
               157ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=104, boundary=9056
               158ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               158ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               170ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               170ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=103, boundary=0
               170ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=103, boundary=9056
               170ms         ⟥    [debug] ✓ Mario Mario's velocity -1 is within walk maximum
               170ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               188ms         ⟥    [debug] ✓ Mario moved left because velocity is -1
               188ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=101, boundary=0
               188ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=101, boundary=9056
               188ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               188ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               204ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               205ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=99, boundary=0
               205ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=99, boundary=9056
               206ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               206ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               218ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               218ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=97, boundary=0
               218ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=97, boundary=9056
               218ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               218ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               234ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               234ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=95, boundary=0
               234ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=95, boundary=9056
               234ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               234ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               248ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               248ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=93, boundary=0
               248ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=93, boundary=9056
               249ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               249ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               267ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               267ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=91, boundary=0
               268ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=91, boundary=9056
               268ms         ⟥    [debug] ✓ Mario Mario's velocity -2 is within walk maximum
               268ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               288ms         ⟥    [debug] ✓ Mario moved left because velocity is -2
               288ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=88, boundary=0
               288ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=88, boundary=9056
               289ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               289ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               302ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               302ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=85, boundary=0
               302ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=85, boundary=9056
               303ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               303ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               319ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               319ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=82, boundary=0
               319ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=82, boundary=9056
               319ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               319ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               332ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               332ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=79, boundary=0
               332ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=79, boundary=9056
               332ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               332ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               348ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               348ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=76, boundary=0
               348ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=76, boundary=9056
               349ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               349ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               362ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               362ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=73, boundary=0
               362ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=73, boundary=9056
               363ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               363ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               378ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               378ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=70, boundary=0
               378ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=70, boundary=9056
               378ms         ⟥    [debug] ✓ Mario Mario's velocity -3 is within walk maximum
               378ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               400ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
               400ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=66, boundary=0
               400ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=66, boundary=9056
               400ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               400ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               415ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               415ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=62, boundary=0
               415ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=62, boundary=9056
               415ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               415ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               430ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               430ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=58, boundary=0
               430ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=58, boundary=9056
               430ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               430ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               447ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               447ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=54, boundary=0
               447ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=54, boundary=9056
               447ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               447ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               461ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               462ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=50, boundary=0
               462ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=50, boundary=9056
               462ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               462ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               478ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               479ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=46, boundary=0
               479ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=46, boundary=9056
               479ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               479ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               496ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               496ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=42, boundary=0
               496ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=42, boundary=9056
               496ms         ⟥    [debug] ✓ Mario Mario's velocity -4 is within walk maximum
               497ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               511ms         ⟥    [debug] ✓ Mario moved left because velocity is -4
               511ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=37, boundary=0
               511ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=37, boundary=9056
               512ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               512ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               526ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               527ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=32, boundary=0
               527ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=32, boundary=9056
               528ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               528ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               539ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               539ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=27, boundary=0
               539ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=27, boundary=9056
               540ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               540ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               555ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               555ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=22, boundary=0
               555ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=22, boundary=9056
               555ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               555ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               577ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               577ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=17, boundary=0
               577ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=17, boundary=9056
               578ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               578ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               590ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               590ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=12, boundary=0
               590ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=12, boundary=9056
               590ms         ⟥    [debug] ✓ Mario Mario's velocity -5 is within walk maximum
               590ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               606ms         ⟥    [debug] ✓ Mario moved left because velocity is -5
               606ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=6, boundary=0
               606ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=6, boundary=9056
               606ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               606ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               622ms         ⟥    [debug] ✓ Mario moved left because velocity is -6
               623ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               623ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               623ms         ⟥    [debug] ✓ Mario Mario's velocity -6 is within walk maximum
               623ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               643ms         ⟥    [debug] ✓ Mario stayed in place
               643ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               643ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               643ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               643ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               653ms         ⟥    [debug] ✓ Mario stayed in place
               653ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               653ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               653ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               653ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               671ms         ⟥    [debug] ✓ Mario stayed in place
               671ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               671ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               671ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               671ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               682ms         ⟥    [debug] ✓ Mario stayed in place
               682ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               682ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               682ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               682ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               698ms         ⟥    [debug] ✓ Mario stayed in place
               698ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               699ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               699ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               699ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               717ms         ⟥    [debug] ✓ Mario stayed in place
               717ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               717ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               717ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               717ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               735ms         ⟥    [debug] ✓ Mario stayed in place
               736ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               736ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               736ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               736ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               750ms         ⟥    [debug] ✓ Mario stayed in place
               750ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               750ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               750ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               750ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               767ms         ⟥    [debug] ✓ Mario stayed in place
               767ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               767ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               767ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               767ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               785ms         ⟥    [debug] ✓ Mario stayed in place
               785ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               785ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               785ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               785ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               801ms         ⟥    [debug] ✓ Mario stayed in place
               801ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               801ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               802ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               802ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               817ms         ⟥    [debug] ✓ Mario stayed in place
               817ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               817ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               817ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               817ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               834ms         ⟥    [debug] ✓ Mario stayed in place
               835ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               835ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               835ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               835ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               847ms         ⟥    [debug] ✓ Mario stayed in place
               847ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               847ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               848ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               848ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               864ms         ⟥    [debug] ✓ Mario stayed in place
               864ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               864ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               864ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               864ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               884ms         ⟥    [debug] ✓ Mario stayed in place
               884ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               884ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               884ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               884ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               900ms         ⟥    [debug] ✓ Mario stayed in place
               900ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               900ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               901ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               901ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               917ms         ⟥    [debug] ✓ Mario stayed in place
               917ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               917ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               917ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               917ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               933ms         ⟥    [debug] ✓ Mario stayed in place
               933ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               933ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               933ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               933ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               949ms         ⟥    [debug] ✓ Mario stayed in place
               949ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               949ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               950ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               950ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               962ms         ⟥    [debug] ✓ Mario stayed in place
               963ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=0, boundary=0
               963ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=0, boundary=9056
               963ms         ⟥    [debug] ✓ Mario Mario's velocity 0 is within walk maximum
               963ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 0 is less than the maximum
               963ms         ⟥⟤ OK press the left key for 1 second, /super mario/with model/move left/press the left key for 1 second
```

The test still passes, revealing interesting boundary behavior! Mario accelerates leftward (-1 to -6 pixels per frame), then reaches the left boundary (x=0) and stops with velocity 0 for the remainder of the test.
The model validates this correctly through two properties working together: the causal property confirms staying in place is valid when at a boundary, while the safety property verifies Mario never moves past x=0. 

This demonstrates the robustness of property-based modeling: the boundary collision was properly accounted for without any special code or model changes. The general properties we defined earlier naturally cover this edge case. The test just worked!

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

