---
title: Working With Requirements Just Like With Code
description: Article about how TestFlows enables working with requirements just like with code using software requirements specifications written in Markdown
date: 2023-09-25
author: Vitaliy Zakaznikov
image:
   asset: images/requirements-as-code.png
icon: fas fa-glasses pt-5 pb-5
---

"Requirements are the starting point of any design", this is a quote from the [presentation given by Nicholas D. Kefalas](https://www.youtube.com/watch?v=3afHlAwBudM), who is a senior technical officer at Sikorsky Aircraft/Lockheed Martin. In this article, we'll explore how you can work with requirements just like with code and look at a simple example of specifying [requirements for a Google Calculator web application](https://github.com/testflows/TestFlows-Core/blob/master/tests/examples/calculator/requirements/requirements.md). While most people
will agree with the quote above, somehow it is not applied or scarcely applied to the commercial software development process.
We are developing too fast, and it seems like there is no time to think about the functionality that we are developing,
much less write it down <!-- more -->.

Do requirements apply to software development and testing? The answer is definitely "yes", as requirements are the starting point of any design. It is a universal principle across any field of engineering. It does not matter if you are designing a building, designing an aircraft, developing software for nuclear reactors, trains, or even a simple hello world program.
Whether we like it or not, requirements have to be handled one way or another. As the saying goes “you can run, but you can’t hide" from them.
When we don’t work with requirements, we do pay the price, as skipping them does not come with zero-cost but actually
creates a drag on the whole software development process, irrespective of the software’s functionality.
So, why work with requirements? Because by definition of testing and quality, it is all about the requirements.

{% blockquote Nicholas D. Kefalas, Senior Technical Officer at Sikorsky Aircraft/Lockheed Martin - https://www.youtube.com/watch?v=3afHlAwBudM System Engineering Requirements %}
 “Requirements are the starting point of any design.”
{% endblockquote %}

# Relationship between requirements and testers

Can we find a relationship between testers and requirements? Is there such a relationship?
Where do requirements come into play when we are testing software? I’ve taken some definitions from [ISTQB](https://www.istqb.org/) (International Software
Testing Qualifications Board) [glossary](https://glossary.istqb.org/en_US/search) to help us get started.

First, let’s see how the term tester is defined. ISTQB defines a [tester](https://glossary.istqb.org/en_US/search?term=tester%20&exact_matches_first=true) as "a person who
performs testing". Where [testing](https://glossary.istqb.org/en_US/search?term=testing&exact_matches_first=true) is defined as "the process within the software development lifecycle that evaluates the quality of
a component or a system". The key part of the definition, is that testing is related to evaluating quality. What is quality?
[Quality](https://glossary.istqb.org/en_US/term/quality-4) is defined as "a degree to which a work product satisfies
stated and implied needs of its stakeholders". No direct mention of
requirements so far. So, how does ISTQB defines a requirement? Well, it says that [a requirement](https://glossary.istqb.org/en_US/term/requirement-4-2) is "a provision that contains criteria to be fulfilled".

Well, that's interesting, there is no straight path from tester to requirements here on the surface. This may be one of the problems. Requirements are not highlighted enough, and the connection between what you are doing and the requirements might not be as obvious as it should be, given that remember what Nicolas D. Kefalas said: “Requirements are the starting point of any design”. If requirements are at the starting
point, surely they should be given their place at the end of the design implementation process, where testing is performed, but testing can only be performed after implementation, and implementation follows after the design. Did we lose it somehow
in the process? We all know that in most cases, requirements are lost and are not clearly present or driving either design,
development, or testing.

Let's take the liberty of redefining these terms close to how {% testflows %} uses them to fully implement enterprise-level software quality assurance process. First of all, a tester for me at the beginning of my career was not a person but a multi-millionaire
large piece of advanced test equipment sitting on a factory production floor. So with this in mind, a more general definition of a tester
is anything that performs testing, and a person would be a special case of that. It's not a big deal. What about
testing that a tester performs? We can shorten it and simply define testing as an act of evaluating quality, where the key part is quality.
The definition of testing is similar to the ISTQB's definition if you remove the secondary information. Where the real difference is,
is in the definition of quality itself.

We define quality as satisfying requirements, definitely not some needs, especially needs that could be stated or implied. I surely don’t
want to guess what the implied needs are. Why guess? If there are implied needs, you might as well discuss and state them explicitly. So nothing
implicit is permitted. Only clearly stated requirements. We also usually think of quality as either
being there or not being there. Where quality is found when all requirements are satisfied. So definitely not the same. ISTQB uses the word
*need* in the definition of quality, but *need* in their glossary is not defined. Do I need it, or I don't? How do I know? One could say that "stated and implied needs of its stakeholders" means requirements; however, the definition of a requirement is also unclear. Instead, the definition that we use for a requirement is that a requirement is a description of a behavior.

{% blockquote %}
"Quality is satisfying requirements and <br>
requirement is a description of a behavior."
{% endblockquote %}

We use these definitions in our software quality assurance process, allowing us to relate testing in general and tester activities specifically to requirements in a very straightforward way.
The critical part is that testing is the act of evaluating if a product satisfies requirements. Simple and to the point. We can take it further and come closer to mathematical formalism by looking at what a requirement actually is.

# Defining a requirement more precisely

Given that we've already defined a requirement as a description of a behavior, we can take a step further and define
precisely what behavior is. For this, we can leverage definitions provided by Leslie Lamport
in his book [Specifying Systems for TLA+](https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book) where he defines a behavior as "an infinite sequence of states” and a state as "an assignment of values to variables". For those of you who have never heard of TLA+ or Leslie Lamport
I encourage you to look him up. TLA stands for Temporal Logic of Actions which, is a formal specification language designed by Leslie Lamport
for specifying system behavior. He has an excellent [video course](https://www.youtube.com/@tlavideocourse8540/videos)
that provides an introduction to TLA+.

{% blockquote Leslie Lamport, TLA+ - https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book Specifying Systems %}
"Behavior is an infinite sequence of states."<br>
"State is an assignment of values to variables."
{% endblockquote %}

We already tied requirements to behaviors, and definition of a behavior and a state has taken us to formal
specifications. If you look back at our definitions, we went from defining what a tester is to formal specifications.
I find it elegant and powerful, and that’s why we use these definitions instead of what ISTQB uses.

The tester performs testing; testing evaluates quality; quality is defined as satisfying requirements; requirements are descriptions of behaviors; behaviors are infinite sequences of states, where a state is an assignment of values to variables. It is beautiful, and precise. We went from tester to state, and
funny enough [Carnegie Mellon School of Computer Science](https://www.cs.cmu.edu/afs/cs/academic/class/15671-f95/www/handouts/sm-basics/node1.html) defines a software system as a "very, very complicated state machine".

{% blockquote Norman Papernick https://www.cs.cmu.edu/afs/cs/academic/class/15671-f95/www/handouts/sm-basics/node1.html , Carnegie Mellon School of Computer Science  %}
"A software system is a very, very complicated state machine."
{% endblockquote %}

## Looking closer at the definitions

{% blockquote Leslie Lamport, TLA+ - https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book Specifying Systems %}
"Behavior is an infinite sequence of states."<br>
"State is an assignment of values to variables."
{% endblockquote %}

Let's try to apply the definitions given above to a simple requirement for a web application. For example,

> The login button SHALL have a blue color.

Given that a requirement is a description of a behavior, and a behavior is an infinite sequence of states, we can precisely
define the requirement above as follows

> {%katex%}
\begin{bmatrix}
   login\_button\_color = "blue" \\
\end{bmatrix}
\to
\begin{bmatrix}
   login\_button\_color = "blue" \\
\end{bmatrix}
\to
\dots
{%endkatex%}

where each

> {%katex%}
\begin{bmatrix}
   login\_button\_color = "blue"
\end{bmatrix}
{%endkatex%}

defines a state. In this case, each state has one variable, the {%katex%}login\_button\_color{%endkatex%}, and that variable
can be assigned a value of any color. However, in our case, based on the requirement definition, each valid state
must have variable {%katex%}login\_button\_color{%endkatex%} be assigned the value {%katex%}"blue"{%endkatex%}.

It is also important to note that the requirement implies that the color of the login button stays blue.
That's the infinite part of the definition of the behavior. This
means that to verify this requirement using a test, the test will have to continuously
check the color property of the login button to make sure it is blue and stays blue. Of course, this is not
practical, nonetheless, if your users notice that your login button starts changing colors after a few seconds
once the login page is loaded, they will definitely consider that to be a bug in your web application.
Therefore, the definition of a behavior as an infinite sequence of states has very practical implications
and puts a limit on what a test can actually verify.

Another example could be a requirement about a function that should return a sum of the two arguments that it is passed.


> The function {%katex%}add(a,b){%endkatex%} SHALL return the value of {%katex%}a + b{%endkatex%}.

This requirement means that only the following states form part of a valid behavior

> {%katex%}
\begin{bmatrix}
   a = 2 \\
   b = 2 \\
   result = 4
\end{bmatrix}
,
\begin{bmatrix}
   a = -2 \\
   b = 2 \\
   result = 0
\end{bmatrix}
,
\begin{bmatrix}
   a = 3 \\
   b = 2 \\
   result = 5
\end{bmatrix}
,
\dots
{%endkatex%}

but states such as

> {%katex%}
\begin{bmatrix}
   a = 2 \\
   b = 2 \\
   result = 3
\end{bmatrix}
,
\begin{bmatrix}
   a = -2 \\
   b = 2 \\
   result = 2
\end{bmatrix}
,
\begin{bmatrix}
   a = 3 \\
   b = 2 \\
   result = 4
\end{bmatrix}
,
\dots
{%endkatex%}

are not allowed and would indicate that a requirement is not met and the function {%katex%}add(a,b){%endkatex%} has a bug.

Most software developers and testers do not think of a software system under test as a state machine; however,
as the two simple examples above show, thinking of requirements and the system as a whole in terms of infinite state sequences
helps understand what a requirement is and what the system actually must do at a deeper and much more precise level.

Here is the quote that Leslie Lamport gives in the [first video in his "Introduction to TLA+" video series](https://youtu.be/p54W-XOIEF8?list=PLWAv2Etpa7AOAwkreYImYt0gIpOdWQevD&t=491) that emphasizes the benefits of thinking about a software system as a state machine.

{% blockquote Eric Verhulst %}
We witnessed first hand the brain washing done by years of C programming.
{% endblockquote %}

Thinking about a software system as a state machine is not only useful at the design stage; it is critical
to understand what testing a software system actually means and implies.

# Requirements for a requirement

Let’s now look at some main requirements for a requirement. There are six of them:

> * requirement SHALL be **unique**
> * requirement SHALL have a **unique identifier**
> * requirement by convention SHALL use **SHALL**
> * requirement SHALL be **versioned**
> * requirement SHALL have **traceable origin and modifications**
> * requirement SHALL be written to be **testable**

I’ve introduced you to the SHALL notation and basic requirements. Again, remember that a requirement is a description of a behavior,
where a behavior is an infinite sequence of states, and a state is an assignment of values to variables. So given that I claim that these six statements are requirements, then you should now be able to see the behavior, the infinite sequence of states, and the assignment of values to variables. They are all there; you just have to get used to them to be able to see them. One way to see it is to use your object-oriented skills and define a requirement as an object,
where unique, unique identifier, has-SHALL, versioned, traceable, and testable are boolean attributes of this object, where each can either
be *true* or *false*.

The last part, where requirements must be testable, is critical; this establishes a connection between testing and requirements.
When you are writing requirements, you should think about how they will be tested, and when you are writing a test, you should
think about the requirements that you are testing. Next time you are writing a test, think about which requirement is being
tested and how that requirement is defined. Was it a JIRA, the developer told you, a customer, and was even written down?

Ideally, we want to have a one-to-one relationship between requirements and tests. However, in general, a requirement can be
verified by one or more tests, and a test can verify one or more requirements. For example, some requirements are generic and
are verified by a suite of tests, and some tests are written in such a way that they can verify more than one requirement.
In general, if you find that your test verifies more than one requirement, it should serve as a hint that most likely those
requirements should be collapsed into one. Remember, ideally, we want to have a one-to-one relationship.

The important part of understanding requirements is that they live above the implementation, above the code level.
It is hard to convince some developers that code is not documenting the behavior - it is implementing it.
This is evident from the standard Hello World program.
The requirements for the Hello World program can be implemented in many programming languages.
Therefore, requirements force you to think above the code level. This is very useful; senior software developers understand it beacuse they’ve been bitten
by experience dealing with errors from trying to do something before thinking about it. Either measure seven times and cut one time, or don’t measure and
cut seven times. Which one do you prefer?

# Why work with requirements?

One would generally find requirements being formalized in regulated industries where, by law, you are forced to structure your software
development process around them. There are good reasons for it, would you want the airplane to fly with the software you have written or tested?
Is it good enough? Most likely not. So why do we find that working with requirements is useful? Again, first by definition of
testing and quality. If you want to get rid of requirements, you most likely have to live in a different universe. This one needs them for
any design. Remember, *"requirements are the starting point of any design"*.

The first step to making them practical is to trim anything that we don’t need. I have shown you an example when I provided alternative definitions
of key concepts that were short and precise. Given that we know that requirements are at the core of testing and quality, we have no
choice but to deal with them. We found that, funny enough, having requirements for a given feature makes “context switching” between features
a much less painlful process. I can bring a new engineer and throw them at the task and the requirements will provide a guide for them.
They organize the whole quality assurance process. What needs to be done is easy to know and simple, what is the next requirement that needs to be covered?
Requirements improve communication, as you can share requirements with developers, customers, and management to precisely communicate expected functionality.

Quality assurance team can now actually provide meaningful reports. The most important report is not how many tests have passed or failed, or lines of code
that have been hit by tests, or any other indirect metrics. The most important report is the **requirements coverage report** which tells us which
functionality works and which doesn’t. I don’t care if it takes ten tests or one million tests. If ten tests pass or one million tests pass,
this is meaningless; what customers care about is what works and what does not. Knowing what was not tested is even more important than knowing
what was tested. You can only know what functionality was tested if you tie your tests to requirements.
So if you do the right thing and incorporate requirements into your workflow, then you will make your life easier and you’ll move faster,
and this is what we want: easier and faster.

# Working with requirements

How can we work with requirements that match software development as closely as possible? Simple, work with requirements just like with code.
Before we can work with requirements just like with code, we need to understand two core concepts.

First, the requirements must be written down. It sounds obvious, but most of the software requirements are not written down. Most of the requirements sit in someone’s head and are never written down. Therefore, you constantly have to ask questions, and you constantly forget part of the functionality. It is hard for us to keep all the details of even simple programs in our heads, so it is impossible to keep track of all of the functionality for any non-trivial project.

Second, written-down requirements are grouped into a software requirements specification (SRS) document. Have you seen a software requirements
specification for the project that you are working on? Have you written one? Most likely, no. The key part here is that, as originally done,
one of the best ways to keep track of requirements is by defining them in a document. Documents were used well before computers were invented,
and they actually work really well! Even today, most of the information that is shared is shared using documents.

# Writing software requirements specification documents

Now, the most important question is: who writes the software requirements specification documents? Well, at the end, the quality assurance team ends up writing them, given that it is usually not done by other teams. Again, remember, *"requirements are the starting point of any design"*, yes, but in most
projects, this is not followed. However, a professional quality assurance team that understands what needs to be done can’t function without requirements,
so if they are not given, we need to write them. At the end of the day, each one of us is responsible for keeping things organized; if the
functionality is not organized then we have to do it ourselves. Why? To make our lives easier.

Now, how do we write these specifications that contain requirements? The first stage is discovery, like a sponge, we need to suck in all the
information that is available for a given feature and put it all into the SRS. The SRS itself is written in [Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) and wait Markdown is
code! So working with requirements just like with code means that by defining requirements in a document written in Markdown, we are working with
requirements just like with code. We use the same tools, like our favorite integrated development environment (IDE) and git repositories
on GitHub or GitLab. We get full traceability of origin and modifications, and it naturally ties in with automated test development. Add or modify a requirement, then commit. Diff, blame, history, you get it all for free!

# Example - Google Calculator

Requirements are a fundamental concept, so they apply to any software project. Really. Anything that you can think of.
Let’s look at a simple example. You know Google, and you know that if you type "calculator" in the search box, you will get a calculator web application? Funny enough, it is actually not documented; at least I could not find any official documentation for it. Who needs it?
I *know* how to use a calculator; I *know* how it works, but do you really? Can you keep track of all the possible behaviors and corner cases?

Let’s see what a software requirement specification for a Google calculator can look like.
It took me about a day to write it, but I already have more than average experience
documenting functionality. Actually, documenting functionality is a very important skill that you should practice too.
Software requirements specification is a document; a book is also a very long document, so like any document, it will have a title and a table
of contents to help us navigate it. Here is an example of the first part of the table of contents.

```markdown
# SRS001 Google.com Calculator
# Software Requirements Specification

## Table of Contents

* 1 [Introduction](#introduction)
* 2 [Opening The Calculator](#opening-the-calculator)
    * 2.1 [RQ.Google.Calculator.Open](#rqgooglecalculatoropen)
* 3 [User Interface](#user-interface)
    * 3.1 [Normal View](#normal-view)
        * 3.1.1 [RQ.Google.Calculator.UI.NormalView](#rqgooglecalculatoruinormalview)
    * 3.2 [Inverse View](#inverse-view)
        * 3.2.1 [RQ.Google.Calculator.UI.InverseView](#rqgooglecalculatoruiinverseview)
    * 3.3 [Keyboard Input](#keyboard-input)
        * 3.3.1 [RQ.Google.Calculator.UI.KeyboardInput](#rqgooglecalculatoruikeyboardinput)
    * 3.4 [Mixed Input](#mixed-input)
        * 3.4.1 [RQ.Google.Calculator.UI.MixedInput](#rqgooglecalculatoruimixedinput)
...
```

Given that it is a document, we can add any information to it as we like.
Introduction, references with links to relevant resources, pictures, and charts, anything that
is relevant to the functionality; we put it all here. It is more than a dry list of requirements; it is a document that, after reading
should fully describe the functionality of the feature or product at hand. In this case, Google Calculator. There is *Introduction*,
and sections that group different functionality together, such *Opening The Calculator*, and *User Interface*, as well as many others.
There is a lot of similarity with user documentation, but the requirements are
usually much more detailed and meet their own requirements, like being unique, having a unique identifier and a version, using SHALL, and being testable.

Markdown source code should be familiar to most developers and testers. If you have used GitHub
or GitLab and written a README for your project, then you know what Markdown source code looks like. Nothing special, just a markup language.
Markdown is not the only one; reStructuredText and LaTeX would be other examples. However, Markdown is natively supported by GitHub and GitLab,
so while it has its own limitations, most developers are familiar with it.

Here is an example of the first two requirements in this SRS.

```markdown
## Introduction

This software requirements specification covers requirements related to the functionality of the Google.com Calculator.

## Opening The Calculator

### RQ.Google.Calculator.Open
version: 1.0

The calculator SHALL open when the user searches for `calculator` or similar terms in the search box.

## User Interface

### Normal View

#### RQ.Google.Calculator.UI.NormalView
version: 1.0

The calculator SHALL have the following graphical user interface.

![Calculator](calculator.png)
```

The first thing to note is that each requirement has a unique identifier.
The identifier is specified by a heading starting with **RQ**. Each requirement has at least one attribute, which is its version.
The initial version of a requirement by convention is "1.0". Any material changes to a requirement would require us to increase
the version so that tests can be updated as needed. Also, note that we prefer not to use numbers as unique identifiers for our requirements.
Instead, the dot notation is used. The dot notation also defines hierarchy. Using dot notation instead of numbers facilitates moving requirements
around as needed. Also, renaming requirement prefixes using search and replace is convenient when the structure needs to be updated.

The first requirement talks about when calculator application should be displayed to the user. In this case, it says if you search for the "calculator"
or similar terms. If you work with requirements, you will  immediately notice that “similar terms” is not defined. This means this requirement
will have to be updated, and “similar terms” will have to be defined as it will be needed for testing. We can add a table with example search terms.

The next requirement defines the user interface. In this case, Google Calculator has two views, what I called a normal view and an inverse view.
The inverse view is displayed when you click the “Inv” button. It is not shown here, but you can try it yourself the next time you use the Google calculator.

Headings are defined with pound signs and pretty much nothing special if you are familiar with Markdown.
The only special thing to worry about is remembering that to define a requirement, you must define a heading that starts with **RQ** and give it a version.
Anything else becomes the description of the requirement. The description can contain anything you want, but not another section.
Again, this Markdown source code is diffable, and Markdown syntax is familiar to most developers.

Let’s now look at some functionality that one would initially find trivial - the addition operation. It sounds easy, but is it?
It turns out not to be so simple.

> ### Addition
>
> #### RQ.Google.Calculator.Addition
> version: 1.0
>
> The calculator SHALL support adding integers and decimal numbers using the `+` button, which SHALL add the addition operator to the display.
>
> For example,
>
> ```
> 2 + 2
> -9 + 4
> 2.3 + 1.33
> ```

For example, handling `Infinity` is a special case, the behavior is not intuitive!

> The `+` operator SHALL handle `Infinity` as one of its arguments as follows:
>
> | Operation | Result |
> | --- | ---|
> | `Infinity` + X | `Infinity`  |
> | `-Infinity` + X | `-Infinity` |
> | `Infinity` + `Infinity` | `Infinity` |
> | `Infinity` - `Infinity` | `Error` |

Another corner case is what happens when you add something to an expression that results in an `Error`? What about incomplete expressions?
What about pressing the addition operator `+` when it is not allowed, like just after opening parenthesis?

> The result of the addition operation when either argument is an `Error` SHALL be `Error`.
>
> | Operation | Result |
> | --- | --- |
> | 1 + . | `Error` |
> | . + . | `Error` |
>
> An incomplete expression SHALL not be evaluated.
> ```
> 1 + = 1 +
> ```
>
> Clicking `+` button SHALL be ignored when the expression does not contain a left argument.
> ```
> (+
> ```

What about the cases where you’ve pressed something like `2+` and then instead of a number or expression you have pressed a button for
another operation. In some cases, the `+` operator will be overwritten. In some cases it will not.


> Incomplete `+` operation SHALL be overwritable by the following operators:
>
> | Operator | Description |
> | --- | --- |
> | `*` | multiplication |
> | `-` | subtraction |
> | `/` | division |
> | `!` | factorial |
> | <code>x<sup>2</sup></code> | X squared |
> | <code>x<sup>y</sup></code> | X to the power of Y |
> | `y√x` | nth root |

Do we really want to keep this only in our heads, or is it easier to write this down once and then reference it when needed?

# Converting requirements in Markdown to Python objects

Once we have written the requirements in our structured Markdown, {% testflows %} can parse it, extract all the requirements,
and create corresponding requirement objects that we can link against our tests.

```bash
cat requirements.md | tfs requirements generate > requirements.py
```

Here is an example of auto-generated requirements objects in `requirements.py`.

```python
# These requirements were auto generated
# from software requirements specification (SRS)
# document by TestFlows v1.9.230815.1123444.
# Do not edit by hand but re-generate instead
# using 'tfs requirements generate' command.
from testflows.core import Specification
from testflows.core import Requirement

Heading = Specification.Heading

RQ_Google_Calculator_Open = Requirement(
    name="RQ.Google.Calculator.Open",
    version="1.0",
    priority=None,
    group=None,
    type=None,
    uid=None,
    description=(
        "The calculator SHALL open when the user searches for `calculator` or similar terms in the search box.\n"
        "\n"
    ),
    link=None,
    level=2,
    num="2.1",
)
```

When writing tests, we can import requirements objects as needed, and the IDE will
actually provide auto-completion. Very easy!

You can find a complete software requirements specification document [here](https://github.com/testflows/TestFlows-Core/blob/master/tests/examples/calculator/requirements/requirements.md) and corresponding Python objects [here](https://github.com/testflows/TestFlows-Core/blob/master/tests/examples/calculator/requirements/requirements.py).

If you would like to see more examples of real-world software requirement specifications, go to https://github.com/altinity/clickhouse-regression
and browse different features that we've tested for [ClickHouse](https://clickhouse.com/docs/en/intro) such as [window functions](https://github.com/Altinity/clickhouse-regression/blob/main/window_functions/requirements/requirements.md), [AES encryption functions](https://github.com/Altinity/clickhouse-regression/blob/main/aes_encryption/requirements/requirements.md), and many others.

{% blockquote %}
"Tester performs testing; testing evaluates quality; quality is defined as satisfying requirements; requirements are descriptions of behaviors; behaviors are infinite sequences of states, where a state is an assignment of values to variables. It is beautiful and precise."
{% endblockquote %}

# Conclusion

Once we have written down all the requirements in our structured Markdown document, the fun starts. Our quality assurance process
becomes professional and easy. Also, it is important to note that the quality assurance team does not need all of the requirements at once; we just need one!
As long as we have a requirement, we can work on verifying it using tests. Tests can be manual, semi-automated, or automated.
For us, the process is exactly the same. As soon as we have requirements, the fun starts. Requirements fundamentally are not a hindrance
to the speed of software development, they are actually required to get it right!

I'll end by again providing my favorite quotes by Leslie Lamport from his book on Specifying Systems, as requirements in software requirements specification documents are just a less formal way of specifying the behavior of software systems.

{% blockquote Leslie Lamport, TLA+ - https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book Specifying Systems %}
"Behavior is an infinite sequence of states."<br>
"State is an assignment of value to variables."
{% endblockquote %}

And remember,

{% blockquote %}
"Quality is satisfying requirements and requirement is a description of a behavior."
{% endblockquote %}