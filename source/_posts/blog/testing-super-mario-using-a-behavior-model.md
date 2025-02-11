---
post: true
title: "Testing Super Mario Using a Behavior Model"
description: An article about testing Super Mario game using a behavior model. 
date: 2025-02-07
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model.png
icon: fas fa-glasses pt-5 pb-5
---

The classic game [*Super Mario Bros.*](https://en.wikipedia.org/wiki/Super_Mario_Bros.) has long been a favorite among players, providing not only fun gameplay but also serving as a reference system for testing and analysis. In a recent blog post, [Antithesis](https://antithesis.com/blog/sdtalk/) demonstrated how, with the help of their deterministic hypervisor, their system can autonomously play *Super Mario Bros.* to explore its vast state space. While this approach is powerful for uncovering unexpected states, it does not address the challenge of testing correctness of the game’s complex behavior.  

In this article, we'll tackle this challenge and present a solution that complements any state space exploration techniques. We will define and apply a **behavior model** to systematically test whether *Super Mario Bros.* behaves as expected in all explored states. Our behavior model will capture the game’s intended mechanics—such as movement, collision detection, and enemy interactions—and serve as a framework for testing the correctness of its implementation. By applying a behavior model, we can ensure that *Super Mario Bros.* not only runs and allows players to reach the winning state, but also behaves **as it should** in all states.<!-- more -->  

A key advantage of this approach is that the model itself can be built incrementally, allowing it to be as simple or as comprehensive as needed. Once constructed, the model is **universal**—while its most advanced applications involve integration with autonomous state space exploration techniques, it can also be effectively used for manual and semi-automated test implementations.  

Let’s dive in and see how a behavior model provides a structured, rigorous approach to testing the behavior of *Super Mario Bros.*!

## Setting up the Super Mario test project

To write a behavior model, we need a reference implementation of the game. Fortunately, there is an open-source Python implementation of *Super Mario Bros.* available on GitHub: [PythonSuperMario](https://github.com/marblexu/PythonSuperMario). This project includes two playable levels. For our test project, we'll use a specific version of the repository, checking out commit [f34087e4cc47f6cc70b46ced758b1070e64c4dc2](https://github.com/marblexu/PythonSuperMario/commit/f34087e4cc47f6cc70b46ced758b1070e64c4dc2).

Clone the repository and checkout the commit using:

```bash
git clone https://github.com/marblexu/PythonSuperMario && cd PythonSuperMario && git checkout f34087e4cc47f6cc70b46ced758b1070e64c4dc2
```

### Environment setup

We’ll run and test the game in the following environment:

- **Operating System:** Ubuntu 22.04.5 LTS
- **Python Version:** 3.10.12

Additionally, we'll use the following Python dependencies, which we’ll define in `requirements.txt`:

```text
testflows==2.4.19
pygame==2.6.1
```

To install the dependencies, run:

```bash
pip3 install -r requirements.txt
```

### Playing the game manually

At this point, the project folder should look like this:

```bash
main.py  README.md  requirements.txt  resources  source
```

The `main.py` file serves as the entry point for the game. Before diving into testing, let's have fun and take a moment to **play the game manually** to get familiar with its mechanics.

#### **Game Controls:**
- **Arrow Keys (`←`/`→`/`↓`)** – Move the player  
- **`a` key** – Jump  
- **`s` key** – Shoot fireballs or run  

Run the game with:

```bash
python3 main.py
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-1.gif">
<div class="text-secondary text-bold"><br>Super Mario: Playing the game manually</div>
</div><br>
