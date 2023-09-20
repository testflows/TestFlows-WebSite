---
title: Working With Requirements Just Like With Code
description: Article about how TestFlows enables working with requirements just like with code using software requirements specifications written in Markdown
date: 2023-09-18
author: Vitaliy Zakaznikov
image:
   asset: images/requirements-as-code.png
icon: fas fa-glasses pt-5 pb-5
---

*"Requirements are the starting point of any design"*, this is a quote from the [presentation given by Nicholas D. Kefalas](https://www.youtube.com/watch?v=3afHlAwBudM),
who is a Senior Technical Officer at Sikorsky Aircraft - Lockheed Martin. Very innocent quote that most people
will agree with but somehow is not applied or scarcely applied to commercial software development process.
We are developing too fast and it seems like there is no time to think about the functionality that we are developing or
much less write it down <!-- more -->.

So do requirements apply to software development and testing? The answer is definitely "yes" as the requirements are the starting point
of **any design**. It is universal principle across any field of engineering. It does not matter if you are designing a building,
designing an aircraft, developing software for nuclear reactors, trains, or even a simple hello world program.
Whether we like it or not requirements have to be handled one way or another as the saying goes “you can run but you can’t hide from them”.
When we don’t work with requirements we do pay the price, as skipping them does not come with zero-cost but actually
creates a drag on the whole software development process irrespective of what the software’s functionality.

So, why work with requirements - because by definition of testing and quality it is all about the requirements!
Therefore, in this article we'll explore how {% testflows %} enables you to working with requirements just like with code.

{% blockquote Nicholas D. Kefalas, Senior Technical Officer at Sikorsky Aircraft/Lockheed Martin - https://www.youtube.com/watch?v=3afHlAwBudM System Engineering Requirements %}
 “Requirements are the starting point of any design.”
{% endblockquote %}

# Relationship between requirements and testers

Can we find a relationship between “testers” and “requirements”? Is there such a relationship?
Where do requirements come into play when we are testing software? I’ve taken some definitions from [ISTQB](https://www.istqb.org/) (International Software
Testing Qualifications Board) [glossary](https://glossary.istqb.org/en_US/search) to help us get started.

First, let’s see the term tester is defined. ISTQB defines a [tester](https://glossary.istqb.org/en_US/search?term=tester%20&exact_matches_first=true) as "a person who
performs testing". Where [testing](https://glossary.istqb.org/en_US/search?term=testing&exact_matches_first=true) is defined as "the process within the software development lifecycle that evaluates the quality of
a component or a system". The key part of the definition there that testing is related to evaluating “quality”, what is quality?
[Quality](https://glossary.istqb.org/en_US/term/quality-4) is defined as "a degree to which a work product satisfies
stated and implied needs of its stakeholders". No direct mention of
requirements so far, how is ISTQB define a requirement? Well, it says that [a requirement](https://glossary.istqb.org/en_US/term/requirement-4-2) is "a provision that contains criteria to be fulfilled".

Well, interesting, no straight path from tester to requirements here on the surface. This is maybe one of the problems, that requirements
are not highlighted enough and the connection to what you are doing to requirements might not be obvious as it should be given that
remember what Nicolas D. Kefalas said, “Requirements are the starting point of any design”, so if requirements are at the starting
point surely they should be given their place at the end of the design implementation process where testing is, as testers performs
testing but testing can only be performed after implementation and implementation follows after the design. Did we lose it somehow
in the process? We all know that in most cases requirements are lost and they are not clearly present or driving either design,
development or testing.

Let's take the liberty of redefining these terms close to how {% testflows %} uses them to fully implement enterprise level software quality assurance process.

First of all, a tester for me at the beginning of my career was not a person but a multi-million,
large, piece of advanced test equipment sitting on a factory production floor. So with this in mind a more general definition of a tester
is that a tester is anything that performs testing and a person would be a special case of that. Not a big deal. What about
testing that a tester performs? We can shorten it and simply define testing as an act of evaluating quality, where the key part is quality.
The definition of testing is similar to the ISTQB's definition if you remove the secondary information. Where the really difference is,
is in the definition of quality itself.
We define quality as satisfying requirements, definitely not some needs, especially needs that could be stated or implied. I surely don’t
want to guess what the implied needs are. Why guess? If there are implied needs, you might as well discuss and state them explicitly. So nothing
implicit is permitted. Only clearly stated requirements. We also usually think of quality as either
being there or not being there. Where quality is found when all requirements are satisfied. So definitely not the same. ISTQB uses the word
*need* in the definition of quality but *need* in their glossary is not defined. Do I need it or I don’t? How do I know? One could say
that “stated and implied needs of its stakeholders” means requirements, however the definition of what a requirement is is also not very clear.
Instead the definition that we use for a requirement is that a requirement is a description of a behavior.

{% blockquote TestFlows.com Open-Source Testing Framework %}
 "Requirement is a definition of a behavior."
{% endblockquote %}

We use these definitions in our implementing software quality assurance process and it allows us to
relate testing in general and tester activities specifically to requirements in a very straightforward path.
Where the key part is that testing is the act of evaluating if a product satisfies requirements. Simple and to the point.
We can take it further and come closer to mathematical formalism by looking closer at what a requirement actually is.

# Defining a requirement more precisely

Given that we've already defined a requirement as a description of a behavior, we can take a step futher and define
precisely what is a behavior. For this, we can leverage definitions provided by Leslie Lamport
in this book [Specifying Systems for TLA+](https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book) where he defines a behavior as "an infinite sequence of states” and a state as "an assignment of values to variables". For those of you who have never heard of TLA+ or Leslie Lamport
I encourage you to look him up, TLA stands for Temporal Logic of Actions which is a formal specification language designed by Leslie Lamport
for the specifying system behavior and he has an excellent introductory [TLA+ video course](https://www.youtube.com/@tlavideocourse8540/videos).


{% blockquote Leslie Lamport, TLA+ - https://lamport.azurewebsites.net/tla/book.html?back-link=learning.html#book Specifying Systems %}
"Behavior is an infinite sequence of states."<br>
"State is an assignment of value to variables."
{% endblockquote %}


We already tied requirements to behaviors and definition of a behavior and a state has taken us to formal
specifications. If you look back at our definitions, we wemt from defining what a tester is to formal specifications.
I find it elegant and powerful and that’s why we use these definitions over what ISTQB uses.

Tester performs testing, testing evaluates quality, quality is defined as satisfying requirements, requirements are descriptions of behaviors, behaviors are infinite sequences of states, where a state is an assignment of values to variables. It is beautiful and precise. We went from tester to state and
funny enough [Carnegie Mellon School of Computer Science](https://www.cs.cmu.edu/afs/cs/academic/class/15671-f95/www/handouts/sm-basics/node1.html) defines a software system as a "very very complicated state machine".



{% blockquote Norman Papernick https://www.cs.cmu.edu/afs/cs/academic/class/15671-f95/www/handouts/sm-basics/node1.html , Carnegie Mellon School of Computer Science  %}
"A software system is a very, very complicated state machine."
{% endblockquote %}


# Requirements for a requirement

Let’s now look at some main requirements for a requirement. There are six of them:

* requirement SHALL be unique
* requirement SHALL have a unique identifier
* requirement by convention SHALL use SHALL
* requirement SHALL be versioned
* requirement SHALL have traceable origin and modifications
* requirement SHALL be written to be testable or verifiable

I’ve introduced you to the SHALL notation and basic requirements. Remember that a requirement is a description of a behavior,
where a behavior is an infinite sequence of states and a state is an assignment of values to variables. So given that I claim that these six statements are requirements then you should be able to see the behavior, the infinite sequence of states and the assignment of values to variables. Do you? They are all there, you just
have to get used it to be able to see it. One way to see it is to use your object oriented skills and define a requirement as an object
where unique, unique identifier, has-SHALL, versioned, traceable, testable are boolean attributes of this object where each can either
be either *true* or *false*. State is assignment of values to variables. Don’t objects have a state?

The last part where requirement must be testable is critical, this establishes a connection between testing and requirements.
When you are writing requirements you should think about how they will be tested and when you writing a test you should
think about the requirements that you are testing. Next time you are writing a test, think about which requirement is being
tested and how that requirement is defined. Was is it a JIRA, developer told you, customer, was even written down?

Ideally, we want to have one-to-one relationship between requirements and tests. However, in general a requirement can be
verified by one or more tests and a test can verify one or more requirements. For example, some requirements are generic and
are verified by a suite of tests and some tests are written in such a way that it can verify more than one requirement.
In general, if you find that your test verifies more than one requirement it should serve as a hint that most likely those
requirements should be collapsed into one. Remember, ideally we want to have one-to-one relationship.

The critical part to understanding requirements is that they live **above** the implementation, above the code level.
It is hard to convince some developers that code is not documenting the behavior - it is implementing it.
This is evident from the standard Hello World program.
The requirements for the Hello World program can be implemented in many programming languages.
Therefore, requirements force you to think above the code level. This is very useful, senior software developers understand it as they’ve been bitten
by experience dealing with errors from trying to do something before thinking about it. Either measure seven times and cut one time or don’t measure and
cut seven times. Which one do you prefer?

# Why work with requirements?

One would generally find requirements being formalized in regulated industries where by law you are forced to structure your software
development process around them. There are good reasons for it, would you want the airplane fly with the software you have written or tested?
Is it good enough? Most likely not. So why we find that working with requirements is useful? Again, first by definition of
testing and quality. If you want to get rid of requirements you most likely have to live in a different universe. This one needs them for
any design. Remember, “requirements are the starting point of any design”.

First step to make them practical is to trim any “fat” that we don’t need, I have shown you an example when I provided alternative definitions
of key concepts which where short and precise. Given that we know that requirements are at the core of testing and quality, we have no other
choice but to deal with them. We found that funny enough having requirements for a given feature makes “context switch” between features
a much less painless process. I can bring a new engineer and throw them at task and requirements will provide a guide to them.
They organize the whole quality assurance process. What needs to be done is easy to know, simple, what is the next requirement that needs to be covered?
Requirements improve communication, as you can share requirements with developers, customers and management to precisely communicate expected functionality.
Quality assurance team can now actually provide meaningful reports. Most important report is not how many tests have passed or failed, or lines or code
that have been hit tests, or any other indirect metrics. The most important report is the **requirements coverage report** that tells us which
functionality works and which one doesn’t. I don’t care if it takes ten tests or one million tests. If ten tests pass or one million tests pass,
this is meaningless, what customers care about is what works and what does not. Knowing what was not tested is even more important than knowing
what was tested. You can only know what functionality was tested if you tie your tests to requirements.
So if you do the right thing and incorporate requirements into your workflow then you will make your life easier and you’ll move faster
and this is what we want - easier and faster.

# Working with requirements

How can we work with requirements that matches software development as close as possible? Simple, work with requirements as code.
Before we can work with requirements as code we need to understand two core concepts. First, requirements must be written down.
Sounds obvious but most of the requirements are not written down. Most of the requirements sit in someone’s head and are never written down.
Therefore, you constantly have to ask questions and you constantly forget part of the functionality. It is hard for us to keep all the details
of even simple programs in our head, so it is impossible to keep track of all of the functionality for any non trivial project.
Second, written down requirements are grouped into software requirements specification document. Have you seen a software requirements
specification on the project that you are working on? Have you written one? Most likely no. The key part here that as originally was done,
one of the best way to keep track of requirements are defining them in a DOCUMENT. Documents were used well before computers were invented
and they actually work really well. Even today most of the information that is shared is shared using documents.


# Writing the SRS

Now, the most important question, who writes the software requirements specification documents? Well, at the end QA team ends up writing
them given that it usually not done by other teams. Again remember, “requirements are the starting point of any design”, yeah, in most
projects this is not followed. However, a professional QA team that understands what needs to be done can’t function without requirements,
so if they are not given, we write them. At the end of the day, each one of us is responsible for keeping things organized, if the
functionality is not organized then we have to do it ourselves. Why? To make our life easier.


## How we write the SRS?

Now, how do we write these specifications that contain requirements? First stage is discovery, like a sponge, we need to suck in all the
information that is available for a given feature and put it all into the SRS. The SRS itself is written in Markdown and wait Markdown is
code! So working with requirements as code means that by defining requirements in a document written in Markdown we are working with
requirements just like with code, we use the same tools, like IDE and git repositories. We get full traceability of origin and modifications
and it naturally ties in with automated test development. Add or modify a requirement, then commit. Diff, blame, history, you get it all for free!


# Example - Google Calculator

Requirements are a fundamental concept so they apply to any software project. Really. Anything that you can think of.
Let’s look at a simple example. You know Google? You know if you type “calculator” in the search box you will get a calculator web application?
Funny enough it is actually not documented, at least I could not find any official documentation for it. Who needs it? I KNOW how to use a calculator,
I KNOW how it works, but do you really? Can you keep track of all the possible behaviors and corner cases?
Let’s see how an SRS for a Google calculator can look like. It took me about a day to write it but I already have more than average experience
documenting functionality. Actually, documenting functionality is very important skill that you should practice too.

Software requirements specification is a document, a book is also a very long document, so like any document it will have a title and a table
of contents to help us navigate it. Here is an example of the first part of the table of contents. Given that it is a document we can
add any information to it as we like. Introduction, references with links to relevant resources, pictures, and charts, anything that
is relevant to the functionality, we put it all here. It is more than a dry list of requirements, it is a document that after reading
should fully describe the functionality of the feature or product at hand. In this case, Google calculator. There is Introduction,
and sections that group different functionality together. There is a lot of similarity with user documentation but requirements are
usually much more detailed and meet their own requirements like being unique, having a unique identifier, version, use SHALL, being testable.
What we are looking at is the HTML rendering of the Markdown. We will look at the example Markdown source code but if you have used GitHub
or GitLab and written a README for your project then you know what Markdown source code looks like. Nothing special, just a markup language.
Markdown is not the only one, RestructuredText and LATEX would be other examples. However, Markdown is natively supported by GitHub and GitLab,
so while it has its own limitations most developers are familiar with it.

Here is an example of the first two requirements in this SRS. First thing to note is that each requirement has a unique identifier.
Identifier is specified by a heading starting with RQ. Each requirement has at least one attribute, which is its version.
Initial version of a requirement by convention is 1.0. Any material changes to a requirement would require us to increment
the version so that tests can be updated as needed. Also, note that we prefer not to use numbers as unique identifiers of our requirements.
Instead dot notation is used. The dot notation also defines hierarchy. Using dot notation instead of number facilitates moving requirements
around as needed. Also renaming requirement prefixes using search and replace is convenient when structure needs to be updated.
The first requirement talks about when calculator app should be displayed to the user. In this case it says if you search for the “calculator”
or similar terms. If you work with requirements you will straightaway notice that “similar terms” is not defined. This means this requirement
will have to be updated and “similar terms” will have to be defined as it will be needed for testing. We can add a table with example search terms.
The next requirement defines the UI. In this case Google calculator has two views, what I called a Normal View and an Inverse View. The Inverse view
is displayed when you click the “Inv” button. It is not shown here but you can try it yourself the next time you use the Google calculator.

The Markdown source code for the SRS look like this. Headings are defined with pound signs and pretty much nothing special if you are familiar with Markdown.
The only special thing to worry about is to remember to define a requirement as a heading that starts with RQ and give it a version.
Anything else becomes the description of the requirement. The description can contain anything you want but not another section.
Again, this Markdown source code is diffable and Markdown syntax is familiar to most developers.

Let’s now look at some functionality that one would initially find as trivial. The addition operation. Sounds easy, but is it?
Turns out not so simple. For example, handling Infinity is a special case, the behavior is not intuitive

Another corner case is what happens when you add something to an expression that results in an Error? What about incomplete expressions?
What about pressing addition operator + when it is not allowed like just after opening parenthesis?

What about the cases where you’ve pressed something like 2+ and then instead of a number or expression you have pressed a button for
another operation, in some cases the + operator will be overwritten. In some cases it will not. Do we really want to keep this only
in our head or is it easier to write this down once and then reference it when needed?

Once we have written the SRS in our structured Markdown, our tooling, TestFlows, can parse it and extract all the requirements
and create corresponding requirement objects that we can link against our tests.

Here is an example of auto generated requirements objects. When writing tests we can import them as needed, and the IDE will
actually provide auto-completion. Very easy! Once we have requirements.md and requirements.py the fun starts. Our  QA process
becomes professional and easy. Also, it is important to note that QA does not need all of the requirements at once, we just need one!
As long as we have a requirement we can work on verifying it using tests. Tests can be manual, semi-automated, or automated.
For us the process is exactly the same. As soon as we have requirements the fun starts. Requirements fundamentally are not a hindrance
to the speed of software development they are actually required to get it right!
