---
post: true
title: "Stop Bashing Bugs – It's All Your Fault!"
description: A light and philosophical look at bugs as just states in your system. Inspired by BugBash 2025 test conference.
date: 2025-04-07
author: Vitaliy Zakaznikov
image: images/stop-bashing-bugs-its-all-your-fault.png
icon: fas fa-bug pt-5 pb-5
---


You're running your tests, and there it is again — a red light, a failing check, you've found another bug. You sigh, roll your eyes, and maybe if you are a tester you mutter something about "the devs" or if you are a dev, well there is nobody to blame but yourself. But what if I told you... the bug isn't the problem?

In fact, that little bug might be your system's most honest state. And the truth is, it's not the bug's fault that you don't want it — it's yours!

Inspired by the first [BugBash 2025](https://bugbash.antithesis.com/) software reliability conference organized by [Antithesis](https://bugbash.antithesis.com/), this post is a lighthearted, and (hopefully) helpful take on why bugs deserve a little more love — or at least, a little less blame.

<!-- more -->

# The universe of software states

Every software system — no matter how simple or complex — can be described as a collection (set) of possible **states**. A state is just a snapshot of your system at a given moment.

More precisely,

> A **state** is defined as **an assignment of values to variables** and this means that any state is defined by its variables and the values that those variables can have.

Also, to make our life interesting,

> No matter what you think the state variables are for a given problem, **you can always add more**. In fact, there are infinitely many variables you could list to represent any given state. 

Here's the kicker: the system doesn't "know" which states are good or bad. It just *is*. The universe allows every combination of all possible values for each variable in the state of your system, and it's up to *you*, the designer, to say which ones are valid, desirable, and expected.

Let's take a ridiculously simple example, the function to add two numbers:

```python
def add(a, b):
    return a + b
```

Now imagine these two states:

1. One of the desirable states

  ✅ {% katex %}
\begin{bmatrix} 
a = 1 \\
b = 1 \\
\text{result} = 2
\end{bmatrix} 
{% endkatex %}

2. The unwanted state

  ❌ {% katex %}
\begin{bmatrix} 
a = 1 \\
b = 1 \\
\text{result} = 3
\end{bmatrix} 
{% endkatex %}

Both are perfectly valid *from the universe's perspective* — but only one matches our *definition* of what addition means. The second state is a "bug" only because **we** decided that `1 + 1` must equal `2`.
And that's the whole point. A "bug" is just an **undesirable state**. It's not evil. It's not malicious. It's just a possibility.


# "Bug or feature?" – Perspective matters

Every tester or developer has faced the eternal question:  
> _"Is this a bug... or a feature?"_

And the truth is, the difference often lies in **perspective**.

Sometimes, a "bug" gets discovered and users actually *like* it. Or your team realizes that the "unexpected" behavior solves a real-world problem — and suddenly it's promoted to "undocumented feature" status.
That's because there's nothing inherently wrong with a bug state. It's just not aligned with someone's expectations — which may themselves be shifting or incomplete.
In other words, bugs are just **states we didn't plan for** — and sometimes, not planning for something is the **real bug**.

# Why bugs happen: the problem of state explosion

As systems grow in complexity, the number of possible states grows **exponentially**. This is the well-known problem of **state explosion**.
You may only think in terms of a few inputs or edge cases, but your system doesn't care — there always could be more values for inputs or more inputs than you expected.
Since we can't test every possible state, undesirable ones sneak in — and surprise! They often get labeled as bugs.

But the truth is, the system is just exploring the space you built for it.
You gave it the keys, and it took a wrong turn... because **you** forgot to build a roadblock.


# What can we do? — Design with state space in mind

We can't eliminate bugs entirely, but we *can* improve how we deal with them — and even reduce how often they show up — by designing with possible **state space** in mind.

## ✅ Tip #1: Limit the state space

Be ruthless. Avoid adding options, flags, or configurations unless they're truly needed. Every additional branch or case increases the number of possible states exponentially.

## ✅ Tip #2: Define what "valid" means

Don't just rely on intuition. If you can, **formally define** the valid state space. Whether it's contracts, assertions, or state models — write it down.

## ✅ Tip #3: Test behaviors, not just results

Focus on how the system behaves in response to events and inputs over time. A snapshot might pass, but the **path** to get to it could still be wrong.

## ✅ Tip #4: Use model-based or property-based testing

These testing approaches are great at **exploring unexpected states** and helping you find issues in places your brain forgot to look.

## ✅ Tip #5: Treat bugs as insights

Every bug is a clue about your system's structure. Ask: "What path led here?" and "How can we prevent it — or learn from it?"

# A new attitude towards bugs

So let's stop bashing bugs. Let's stop treating them like invaders or villains.
Bugs are **natural consequences** of systems we build. They're not lies — they're inconvenient truths.
A bug is your system telling you, "Hey, I can do this too — did you think about that?"
Instead of blame, let's bring **curiosity**. Instead of punishment, let's pursue **understanding**. And instead of fear, let's aim for **better design**.

# Conclusion: Embrace your bugs

Next time you find a bug, don't reach for your hammer — reach for your model.  
Try asking:

> "What state did I forget to consider?"  
> "Is this really a mistake, or just a path I didn't anticipate?"  
> "What can I learn from this bug?"

And remember — bugs don't happen **to** you. They happen **because** of you. And that means... you're in control!

# Bonus: Explore behaviors with TestFlows

If you're interested in testing using behavior models or exploring equivalence classes, check out [TestFlows](/handbook) and other articles on this [blog](../) such as [Combinatorial Testing: Writing Behavior Model](../combinatorial-testing-behavior-model/). [TestFlows](/handbook) is a Python testing library designed to help you write better tests, define, and explore complex systems in a structured way including behavior models (extension of property-based testing) — so you can prevent bugs by understanding your system better. With [TestFlows](/handbook), you'll write test programs instead of just tests and the sky will be the limit of what testing you can do to find the *undesirable states* — the **bugs**.
