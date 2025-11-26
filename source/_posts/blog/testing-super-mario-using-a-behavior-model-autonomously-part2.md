---
post: true
title: "Testing Super Mario Using a Behavior Model Autonomously (Part 2)"
description: An article about autonomous testing of Super Mario using behavior models and evolutionary state space exploration techniques.
date: 2025-10-10
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model-autonomously-part2.png
icon: fas fa-glasses pt-5 pb-5
---

In [Part 1](/blog/testing-super-mario-using-a-behavior-model-autonomously-part1/), we built an autonomous system that beat all four levels of *Super Mario Bros.* without any human guidance. We treated the exploration as a mutation-based Genetic Algorithm, and it worked: the system discovered winning paths by exploring, replaying, and mutating input sequences. It found shortcuts, navigated complex enemy patterns, and even uncovered unexpected behaviors like [the Level 4 collision bug](/blog/testing-super-mario-using-a-behavior-model-autonomously-part1/#Finding-a-path-to-complete-Level-4). However, the exploration only validated one dimension of correctness: **progress**. Our fitness function measured how far Mario advanced (x-position, level completion, and time), but the exploration couldn't tell us whether the game actually behaved correctly. Did Mario's velocity follow expected constraints? Were jumps causally justified? Did falling only occur when Mario lacked ground support? We had no way to know. This shows that autonomous testing by itself is not enough. To address this problem, we need a way to actually check state correctness. We need to plug in a behavior model.<!-- more -->

## Plugging the Behavior Model

We already had a behavior model from our earlier series ([Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/) and [Part 2](/blog/testing-super-mario-using-a-behavior-model-part2/))—a model with **causal**, **safety**, and **liveness** properties that enforce game correctness frame-by-frame. The original model is available in the v2.0 branch:

```bash
git clone --branch v2.0 --single-branch https://github.com/testflows/Examples.git && cd Examples/SuperMario
```

This [model](https://github.com/testflows/Examples/blob/v2.0/SuperMario/tests/models/game.py#L7) enforces that [Mario's movement](https://github.com/testflows/Examples/blob/v2.0/SuperMario/tests/models/mario/movement.py#L475) has a valid cause, that velocity never exceeds physical limits, that boundaries are respected, and that expected behaviors eventually occur.

The integration is simple. We pass the model to the same [play()](https://github.com/testflows/Examples/blob/v2.0/SuperMario/tests/autonomous_play.py#L71) function that advances the game. Every frame, the [play()](https://github.com/testflows/Examples/blob/v2.0/SuperMario/tests/actions/game.py#L267) method calls the model's [expect()](https://github.com/testflows/Examples/blob/v2.0/SuperMario/tests/actions/game.py#L275) method, which runs all the property checks. Here's the implementation:

```python
def play(game, seconds=1, frames=None, model=None):
    """Play the game for the specified number of seconds or frames."""
    if frames is None:
        frames = int(seconds * game.fps)

    for i in range(frames):
        next(game.play)
        if model:
            model.expect(game.behavior) # here we call the model
```

## Running autonomous exploration with the model

Now let's see what happens when we run autonomous exploration with the model enabled:

```bash
python3 tests/run.py --autonomous --play-seconds 300 --with-model
```

The system explores thousands of states, validating every frame. Properties pass, pass, pass... until they don't. Here's what a failure looks like:

```bash
           24s 151ms         ⟥    [debug] ✓ Mario Mario's vertical velocity 8 is less than the maximum
           24s 151ms         ⟥    [debug] ✓ Mario Mario is within left boundary x=711, boundary=0
           24s 151ms         ⟥    [debug] ✓ Mario Mario is within right boundary x=711, boundary=9056
           24s 168ms         ⟥    [debug] ✓ Mario moved left because velocity is -3
           24s 168ms         ⟥    Exception: AssertionError: Mario failed to: stopped falling because landed on support or stomped an enemy
```

The model caught something. But here's the catch: this failure could mean the game has a bug, or it could mean our model is wrong. We need to figure out which one.

## Bidirectional testing

When the model's assertion fails, we face a fundamental question: *Is the game wrong, or is the model wrong?*

This is where bidirectional testing comes in. Unlike traditional testing where only the system is validated, for any non-trivial properties or transition relations, both the model and the game test each other simultaneously:

- **The model tests the game**: Every frame, the model enforces that the game's behavior satisfies the specified properties. If Mario moves right, there must be a cause (velocity or key press). If Mario falls, he must lack ground support. These are the model's expectations.

- **The game tests the model**: The game acts as the ground truth—it's what actually runs and what players experience. When the model's expectations fail, it reveals that the model's understanding might be incomplete or incorrect.

This creates a self-correcting feedback loop:

<div class="text-center">
<img style="width: 55%" src="/images/testing-super-mario-using-a-behavior-model-autonomously-pic-3.png">
<div class="text-secondary text-bold"><br>Bidirectional testing</div>
</div>

1. If the game violates physics → game bug (model is correct)
2. If the model's expectations are wrong → model bug (game is correct)

Both components improve through their disagreements. Fix a game bug, and the model becomes more reliable. Fix a model bug, and game validation becomes more accurate. Each fix makes the other component more trustworthy. 

## Deciding if model or game has a bug

So how do we figure out which component has the bug? This is the classic *oracle problem*—how do you know what the correct behavior should be?

The theoretical answer is sobering: deciding if a non-trivial model matches software is undecidable in general. For Turing-complete systems, there's no algorithm that can always decide if the model and software agree for all possible inputs. Even for finite-state systems, you'd need to explore the entire state space, which is computationally infeasible for complex systems like our Mario game.

But here's the practical insight: autonomous testing is just as good at finding when the model's expectations don't match the game as it is at finding when the game doesn't match the model. We can't prove the model is correct in absolute terms, but autonomous testing excels at finding disagreements. When a failure occurs, we just use a pragmatic approach:

1. **Analyze the failure**: When a property fails, examine the saved path to understand what happened.
2. **Determine the cause**: Is the game violating a physical law? Or is the model missing context about a valid game mechanic?
3. **Fix what's wrong**: Update either the game or the model based on the analysis.
4. **Re-run and validate**: The bidirectional loop continues—both components get refined.