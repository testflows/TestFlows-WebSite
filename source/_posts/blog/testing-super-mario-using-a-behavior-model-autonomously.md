---
post: true
title: "Testing Super Mario Using a Behavior Model Autonomously"
description: An article about autonomous testing of Super Mario using behavior models and evolutionary state space exploration techniques. 
date: 2025-10-10
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model-autonomously.png
icon: fas fa-glasses pt-5 pb-5
---

Autonomous testing is one of the most powerful approaches for exploring vast state spaces in complex systems. Rather than manually writing test cases for every scenario, autonomous systems can systematically explore millions of states, discovering edge cases that human testers would never think to check.
In this article, we'll continue the *Super Mario Bros.* testing series by implementing the autonomous testing approach presented by [Antithesis](https://antithesis.com/blog/sdtalk/), where they autonomously play and beat the game in about 45 minutes.<!-- more --> We'll also plug in the **behavior model** we developed in [Part 1](/blog/testing-super-mario-using-a-behavior-model-part1/) and [Part 2](/blog/testing-super-mario-using-a-behavior-model-part2/) to validate correctness in real-time during autonomous exploration. In the process, we demonstrate the true power of behavior models: write your validation once, then plug it into any testing driver—including autonomous systems that discover new paths while validating behavior at every step.

## The proposed approach

Antithesis's article presents a surprisingly simple yet powerful algorithm for autonomous exploration of *Super Mario*. At its core is a mutation-based input generator that randomly flips input bits to create variations:

```python
import mario
import random

def generate_input(starting_byte, flip_probability, input_length):
    input = []
    next_byte = starting_byte
    
    for _ in range(input_length):
        for j in range(8):
            if random.random() < flip_probability:
                next_byte ^= (1 << j)
        input.append(next_byte)
    
    return input
```

This random mutation approach treats game inputs (right, left, jump, action, down, enter) as bytes, where each bit represents whether a given key is pressed (1) or not (0). The algorithm randomly flips individual bits with a small probability (typically around 10%) by XORing the current input with a random mask—flipping bits where the mask is 1 while preserving bits where the mask is 0. By flipping bits, the algorithm generates variations of input sequences, exploring different paths through the game.

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-autonomously-pic-1.png">
<div class="text-secondary text-bold"><br>Input: Random input generation</div>
</div><br>

The reason behind choosing this input generation algorithm is that it better mimics how the game is meant to be played: the currently pressed key is likely to remain pressed in the next frame while another key can be added at the same time. For example, you hold down the right key while also pressing the jump or action buttons.

However, the algorithm itself is not enough. The reason is that Mario moving randomly will inevitably cause it to die by running into enemies or falling into pits.
Therefore, the exploration itself can never be one-shot. Instead, you have to store traveled paths (input sequences) and have a strategy to pick a sequence for the next iteration. These travel paths effectively define Mario's state because the game is **deterministic**.

> The system is said to be **deterministic** only if given the same input you will always get the same output.

Therefore, starting from the same position and applying the same input sequence will always lead to the same Mario position in the game. This means when we pick a traveled path, we can replay it and then try to continue it with new mutations.

The path selection requires a fitness function. For *Super Mario*, a simple criterion is to favor paths with the highest x-axis position, since winning the game requires advancing to the right. However, always picking the path with the highest fitness score doesn't work—there will be many cases where the path ends in a state from which no further exploration is possible. For example, right before touching a Goomba, or being in the air right before falling into a pit. Such states are not recoverable and lead to dead ends.

To overcome this problem, it's not enough to keep just the best path we've found so far. Instead, we need to maintain a collection of paths with different fitness scores and use a probability distribution function to pick the next path to explore. This way, we're more likely to pick paths with higher scores while still giving paths with lower scores a chance to be explored.

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-autonomously-pic-2.png">
<div class="text-secondary text-bold"><br>Paths: Selecting path</div>
</div><br>

The beauty of this state space exploration approach lies in its simplicity. You don't need to understand the game's mechanics or hand-craft complex strategies. The mutation process naturally discovers interesting behaviors through random exploration, guided by fitness scoring that rewards progress through the game world.

## Characteristics of the proposed approach

Let's step back and examine how the proposed exploration system works:

- We **generate random input** by flipping bits with small probability (typically ~10%), producing a sequence of button presses
- We **build a path** by recording the input sequence along with a **score** quantifying how far Mario progresses (for *Super Mario*, based on x-axis position)
- We **store these paths** in a collection, maintaining a population of different trajectories through the game
- We **select a path** using a probability distribution function that favors higher-scoring paths while still giving lower-scoring paths a chance
- **Determinism enables resuming** in exactly the same state: because the game always produces identical results for the same input sequence, we can replay any stored path to reach that specific game state, then continue exploring from there with new mutations
- This cycle of **select→replay→mutate→evaluate** repeats continuously, systematically exploring the state space by building on previously discovered paths

## Comparing the approach to Genetic Algorithm

Let's see how these characteristics map to a canonical Genetic Algorithm:

| Our System | GA Concept | 
|------------|------------|
| Collection of stored paths | **Population** of individuals |
| Input sequence (button presses) | **Genotype** encoding behavior |
| Game state (Mario position, score) | **Phenotype** (observable result) |
| Progress scoring function | **Fitness function** |
| Path probability distribution selection function | **Selection** with elite bias |
| Bit-flip input generation | **Mutation** operator |
| — | **Crossover** (recombination) |
| Each exploration iteration | **Generation** cycle |
<br>

Applying the broad understanding of these concepts, without nit-picking, the proposed approach is essentially a Genetic Algorithm—maintaining a population, scoring fitness, selecting promising candidates, and mutating them to explore variations.

However, a skeptic might raise two concerns: the absence of **crossover**, and whether an input sequence truly qualifies as a **genotype**.

### Genotype mapping

Let's address the genotype question first. In traditional GAs, genotypes often encode multiple behavioral strategies that apply broadly: "jump more often," "play aggressively," "avoid edges." In our system, the input sequence encodes something more specific: *the ability to reach a particular state*. But this **is** a form of behavioral encoding! Consider an analogy: if a gene encoded "how to live exactly to 90 years and 1 day" in a deterministic world, that would be incredibly useful—a genotype containing just one gene is a valid genotype that produces a specific, valuable outcome.

> The key insight: our input sequence represents **one gene**—a single behavioral instruction that takes Mario to a specific position. Our single-gene approach is a valid specialization of the general multi-gene GA framework.

### Absence of crossover

As for the absence of crossover, it's important to understand what crossover actually is: an evolutionary optimization technique that progresses the population by recombining currently present genetic material. Crossover combines beneficial traits from different individuals to potentially create better offspring without requiring new mutations. However, crossover is not strictly required—it's an evolutionary optimization, not a fundamental requirement. Mutation alone can effectively explore the state space, particularly when paths build incrementally as in our case. Therefore, the proposed approach remains a valid GA, just one that currently relies solely on mutation for variation rather than using both mutation and crossover for evolution.

### The Natural Evolution Parallel

This reveals something profound: GA in nature **is** state space exploration. Biological evolution optimizes organisms for survival by exploring the state space of possible behaviors and traits. The parallels are exact:

- **Organisms** navigate environmental state space (their ecological niche)
- **Genes** encode behavioral strategies (how to respond to stimuli)
- **Fitness** = reaching states where reproduction is possible (survival)
- **Selection** is ruthless—higher fitness individuals reproduce more (~70% seems biologically plausible in competitive environments)
- **Mutation** provides variation to explore new strategies
- **Death** prunes unfit paths from the gene pool

The only difference is substrate and timescale: nature operates on DNA over millions of years, we operate on input sequences over minutes. The fundamental mechanism—**fitness-guided search through state space to find optimal survival strategies**—is identical.

### Why Determinism Matters

Operating on a deterministic system transforms genetic search. Unlike nature's noisy environments or traditional GAs with stochastic fitness, we get:

- **Reproducibility**: Every input sequence produces identical results
- **Stable fitness landscape**: Scores don't fluctuate between evaluations  
- **Causal precision**: We can measure exactly which mutations improve fitness
- **Valid recombination**: Splicing input sequences is safe because causality is preserved

Determinism gives us the substrate to do controlled evolution—all the power of natural selection without the noise.

### The Engineering Leverage

Recognizing this as GA unlocks decades of evolutionary computation research. We can tune **selection pressure** (our 70% rate) to balance exploitation vs exploration, adjust **mutation rate** to control variation intensity, or implement advanced GA techniques like adaptive mutation, speciation, or fitness sharing. The algorithm is a **deterministic, branch-based Genetic Algorithm over executable state space**—the right abstraction for exploring game worlds and, as nature demonstrates, for optimizing survival in any complex state space.


# Bugs found

* y_vel calculaltion not being capped in all places 

* Level number being incremeted before Mario fully completes it (animation frames)
  are still present so Mario position is incorrectly captured at as end x of one level with another level num

* Mario invisible issue.
  There are times when Mario becomes invisible and viewport moves. Can you check how that can happen. Looks like the transition animation when Mario converts from big to small or vice versa that have frame where he is invisible can glitch and Mario could remain invisible. Fix -> animation() moved up

# Lessons 

* Dev and QA teams must work together. It is really hard to come up with a model
  for system has a lot of corner cases which are quickly revealed by autonomous testing. Design for testability principle applies. 