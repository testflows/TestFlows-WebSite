---
title: BDD or not to BDD, or TDD, or even ATDD. How does it affect your QA team?
description: Article discussing how the choice of a software development process affects quality assurance team
date: 2023-10-03
author: Vitaliy Zakaznikov
image:
   asset: images/bdd-or-not-to-bdd.png
icon: fas fa-glasses pt-5 pb-5
---

How do software development processes such as behavior-driven development (BDD), test-driven development (TDD), or even acceptance-test-driven development (ATDD) affect quality assurance team? To answer this question, we need to first note that all these terms end with “development” and not with “quality assurance”. But could we define behavior-driven quality assurance (BDQA), test-driven quality assurance (TDQA), or even acceptance-test-driven quality assurance (ATDQA)? If so, what would be the difference between them? Well, it would depend on the definitions of a behavior, a test, and an acceptance test.<!-- more -->

A few days ago, I came across a thread on Reddit titled [How is BDD used in your team?](https://www.reddit.com/r/QualityAssurance/comments/16pis7x/how_is_bdd_used_in_your_team/?utm_campaign=Software%2BTesting%2BWeekly&utm_medium=web&utm_source=Software_Testing_Weekly_188) that mentioned BDD, TDD, and ATDD in the discussion. While quite a few people had negative comments regarding the BDD approach, I asked myself a single question. How can developers and testers make better decisions, and could there be less controversy around these different software development processes and how a quality assurance team participates in them?

Unfortunately, I concluded that most developers and testers lack precise definitions of the key concepts
that are related to software development and quality assurance. People pick trendy tools or processes instead of basing their decisions on a fundamental understanding of the underlying concepts.

The fundamental understanding of the underlying concepts lies in the precise definition of the following terms:

* **software system**
* **quality**
* **behavior**
* **test**

If you have read our recent blog on [Working With Requirements Just Like With Code](https://testflows.com/blog/working-with-requirements-just-like-with-code/), you already have the answers, but for those who did not, let’s quickly define these terms precisely and then see if we can talk about BDD, TDD, and ATDD in a more constructive manner.

#### Software system?

A good definition can be taken from Norman Papernick at the Carnegie Mellon School of Computer Science.

{% blockquote Norman Papernick https://www.cs.cmu.edu/afs/cs/academic/class/15671-f95/www/handouts/sm-basics/node1.html , Carnegie Mellon School of Computer Science  %}
"A software system is a very, very complicated state machine."
{% endblockquote %}

#### What is quality?

Here is the definition that I prefer.

> “Quality is satisfying requirements, and a requirement is a description of a behavior."

#### What is behavior?

A behavior can be precisely defined by using Leslie Laport's definition from his
[TLA+, Specifying Systems](https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book).

{% blockquote Leslie Lamport, TLA+ - https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book Specifying Systems %}
"Behavior is an infinite sequence of states."<br>
"State is an assignment of values to variables."
{% endblockquote %}

Note that in our definitions, we have come from defining what a software system is to what a state is.

#### What is a test?

> A test is a sequence of steps that attempts to verify one or more behaviors.

It should be noted that a sequence of steps in a test is usually referred to as a test procedure.

# What is the difference between BDD, TDD, and ATDD?

The answer is that if you use the definitions above, they are actually pretty much talking about tightly related things. Why? Because a test is a sequence of steps that verifies a behavior, BDD and TDD are related. However, the definition of a test depends on the behavior, and therefore, a test exists only because there is some behavior that needs to be verified. Therefore, by definition, BDD is actually using a higher concept than TDD. Again, because a behavior exists above a test. The other way to think about it is that a behavior does not really need a test, but a test needs a behavior.

> Tests exist only because there is some behavior that needs to be verified.

What about ATDD? What does “acceptance” mean? It refers to acceptance criteria that need to be tested. What are the acceptance criteria? Whatever definition you’ve seen, you should convince yourself that an acceptance criteria is nothing but a requirement, which is a description of behavior. Therefore, acceptance criteria are just behaviors.

Putting this together, we have that BDD and ATDD are at the same conceptual level, and TDD is using a lower-level concept but is related to BDD. Therefore, purely looking at the words used in these abbreviations, we can conclude that while BDD is more general than TDD, it is pretty close to ATDD. If I were to put them in order, I would have BDD, ATDD, and TDD.
Nonetheless, conceptually, they are highly related.

# How does it affect your QA team?

Irrespective of the software development process, the quality assurance team must ensure product quality.
Therefore, it really depends on how your QA team defines quality.

For me, quality is satisfying requirements, where requirements are a description of a behavior.
Thus, irrespective of the BDD, TDD, or ATDD, the quality assurance team needs descriptions of product behaviors, also known as requirements, in order to verify if a product meets them, has quality, or not, which means it does not have quality. Where and how these requirements are defined is secondary, as the most important part is that they are actually defined and written down!

It all makes sense if you use clear definitions and have a fundamental understanding of the underlying concepts.
Software system, quality, behavior, and test. Define them precisely, and you will discover the beauty and challenges that developers and testers face every day implementing and testing real-world software systems.
Indeed, if behavior is an infinite sequence of states, we do have a challenging problem to solve!

# So should your team use BDD?

Yes, and no. BDD gets many things right, starting with putting the concept of a behavior right up front of the development process as it should be. If the development team uses BDD, then the QA team inherits at least some form of formalization of the product behavior.
This is definitely better than not having product behavior clearly defined. It also supports explicit and clear test procedures. However, one needs to decouple BDD as a concept from its implementations that are tied to Gherkin, but this is a topic for another article.