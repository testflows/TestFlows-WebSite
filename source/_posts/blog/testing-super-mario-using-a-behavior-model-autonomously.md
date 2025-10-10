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

