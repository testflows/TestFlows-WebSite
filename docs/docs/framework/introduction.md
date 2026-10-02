<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# What is it?

**{% testflows %}** is an open-source software testing framework that can be used for functional,
integration, acceptance and unit testing across various teams. It is designed to provide
complete control of how tests are written and executed by allowing you to write tests and
define test [flow](concepts-and-types.md#Flow-is) explicitly as [Python] code. It uses [everything is a test] approach
with the focus on giving test authors flexibility in writing and running their tests.
It's designed to meet the needs of small QA groups at software startup companies
while providing the tools to meet the formalities of the large enterprise QA groups
producing professional test process documentation that includes detailed test and
software requirements specifications as well as requirements coverage, official test
and metrics reports. Designed for large scale test analytics processing using
[ClickHouse] and [Grafana] and built on top of a messaging protocol to allow
writing advanced parallel tests that require test-to-test communication
and could be executed in a hive mode on multi-node clusters.

# Differentiating Features

**{% testflows %}** has the following differentiating features that make
it stand out from plenty of other open and closed source test frameworks.

<div class="heading-h2">Flexible</div>

The framework has many advanced features but it allows you to use only
the pieces that you need. For example, if you don't want to use requirements
you don't have to, or if you don't want to break your tests into steps or
use behavior driven step keywords, that is perfectly fine.
At the heart, it is just a collection of Python modules so you are always
in control and you are not forced to use anything that you don't need.

<div class="heading-h2">Requirements oriented</div>

An enterprise quality assurance process must always revolve around ***requirements***.
However, requirements are most often ignored in software development groups even at
large companies. The framework is designed to break that trend
and allows you to write and work with requirements just like you work with code.
However, if you are not ready to use requirements then you don't have to.

Whether you realize it or not the only **true purpose of writing any test is
to verify one or more requirements** and it does not really matter if you have
clearly identified these requirements or not. Tests verify requirements and
each requirement must be verified by either fully automated, semi-automated or
manual test. If you don't have any tests to verify some requirement
then you can't be sure that requirement is met or that the next version
of your software does not break it.

With **{% testflows %}**, you don't have to wait for your company's culture to change in relation
to handling and managing requirements. You are able
to write and manage requirements yourself, just like code. Requirements are simply
written in a [Markdown] document, where each requirement has a unique identifier and version.
These documents are the source of the requirements that you can convert to Python requirement objects,
which you can easily link with your tests. To match the complexities of real world requirement verification,
**{% testflows %}** allows one-to-one, one-to-many, many-to-one, or many-to-many test-to-requirement
relationships.

<div class="heading-h2">Programs and not just tests</div>

Write [Python] **test programs** and not just tests. A test program
can execute any number of tests. This provides the unrivalled flexibility to meet the needs of any project.
Tests are not decoupled from test flow where the flow defines a precise order of
how tests are executed. However, you can write many kinds of test runners
using the framework if you need them. For example, you can write test programs
that read test cases from databases, API endpoints, or file systems and trigger
your test cases based on any condition. By writing a test program you are in total control
of how you want to structure and approach the testing of a given project.

Through its flexibility, **{% testflows %}** helps to avoid test tool fragmentation
where each project in a company eventually starts to use their own test framework
and nobody knows how to run tests written by other groups and reporting across
groups becomes inconsistent and difficult to follow.

<div class="heading-h2">Self-documenting tests</div>

Provides tools for test authors to break tests into test [Step]s and
use behavior driven step keywords such as [Given], [When], [Then] and others to make
tests and test procedures pleasantly readable. Breaking tests into steps brings an advantage
of test code becoming self-documenting, it provides an easy way to auto-generate
formal documentation such as a test specification without doing any extra work,
produces detailed test logs and facilitates test failure debugging.

Test steps can also be made reusable, allowing test authors to create reusable
steps modules that greatly simplify writing new test scenarios. Just
like you write regular programs by using function calls you can
modularize tests by using reusable test steps. Using reusable steps
produces clean test code and greatly improves readability and maintainability
of tests.

<div class="heading-h2">Auto-generate test specifications</div>

If your test process or your manager requires you to produce formal test
specifications that must describe the procedure of each test, then you can easily
auto-generate them.

<div class="heading-h2">Asynchronous tests</div>

Writing asynchronous tests is as easy as writing regular tests.
The framework even allows you to run asynchronous and synchronous test code
in the same test program.

<div class="heading-h2">Semi-automated and manual tests</div>

Testing real-world applications is usually not done only with fully automated test scenarios.
Most often, verification requires a mix of automated, semi-automated, and manual tests.

The framework allows you to unify your testing and provides uniform test reporting
no matter what type of tests you need for your project by natively supporting the
authoring of automated, semi-automated, and manual tests.

<div class="heading-h2">Parallel tests and execution</div>

Native support for authoring parallel tests and
executing them in parallel, with fine-grain control over what and where runs in parallel.
Asynchronous tests are also supported and allow for thousands of concurrent
tests to be run at the same time. Mixing parallel and asynchronous tests is also supported.

<div class="heading-h2">Combinatorial tests and covering arrays</div>

Combinatorial tests are supported by allowing you to define tests and steps that can take arguments,
as well as allowing you to easily and naturally define tests that check different combinations using [TestSketch]es
without writing any nested for-loops or calculating combinations beforehand.

In addition, a convenient collection of tools used for combinatorial testing is provided
including calculation of [Covering Arrays] for pairwise and n-wise testing using the [IPOG] algorithm.

<div class="heading-h2">Everything-is-a-test</div>

It uses everything-is-a-test approach that allows unified treatment
of any code that is executed during testing. There is no second class test code.
If a test fails during setup, teardown or execution of one of its actions,
the failure is handled identically. This avoids mixing analysis of why the test failed
with test execution and results in a clean and uniform approach to testing.

<div class="heading-h2">Message-based protocol</div>

It is built on top of a messaging protocol. This brings
many benefits, including the ability to transform test output and logs into a variety of
different formats as well as enable advanced parallel testing.

<div class="heading-h2">Log storage and analytics</div>

Test logs were designed to be easily stored in [ClickHouse].
Given that testing produces huge amounts of data, this integration
brings test data analytics right to your fingertips.

<div class="heading-h2">Visualization</div>

Standard [Grafana] dashboards are available to visualize your test data
stored in [ClickHouse]. Additional dashboards can be easily created in [Grafana]
to highlight test results that are the most important for your project.

<div class="heading-h2">No unnecessary abstractions</div>

Avoids unnecessary abstraction layers, such
as when test runners are decoupled from tests or the usage of behavior driven
(BDD) keywords is always tied to Gherkin specifications. These abstractions,
while providing some benefit, in most cases lead to more problems than
solutions when applied to real-world projects.

# Using Handbook

This handbook is a one-page document that you can search using standard
browser search (`Ctrl-F`).

For ease of navigation, you can always click any heading to go back to the table of contents.

> **{% attention %}** Try clicking `Using Handbook` heading and you will see that the page
> will scroll up and the corresponding entry in the table of contents
> will be highlighted in red. This handy feature will make sure you are never lost!

There is also <span><a class="fas fa-chevron-up" style="color: orange" href="#Contents"></a><span>
icon on the bottom right of the page to allow you to quickly scroll to the top.

Also, feel free to click on any internal or external references, as you can
use your browser's &#8678; back button to return to where you were.

>  **{% attention %}** Try clicking [Using Handbook](#Using-Handbook) link and then
> use your browser's &#8678; back button to return to the same scroll position in the handbook.

If you find any errors or would like to add documentation for something that is
still not documented, then submit a pull request
with your changes to [handbook source file](https://github.com/testflows/TestFlows-WebSite/blob/master/source/handbook/index.md).

# Supported Environment

* [Ubuntu] 20.04
* [Python 3] >= 3.8

> **{% attention %}** Known to run on other systems such as MacOS.

# Installation

You can install the framework using [pip3]

```bash
pip3 install testflows
```

or from sources

```bash
git clone https://github.com/testflows/TestFlows.git
cd TestFlows
./build ; ./install
```

## Upgrading

If you already have {% testflows %} installed, you can upgrade it to the latest version
using the `--upgrade` option when executing `pip3 install` command.

```bash
pip3 install --upgrade testflows
```

# Hello World

You can write an inline test scenario in just three lines.

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    pass
```

and simply run it using `python3` command.

```bash
python3 ./test.py
```
```bash
Jun 28,2020 14:47:02   ⟥  Scenario Hello World!
                 2ms   ⟥⟤ OK Hello World!, /Hello World!

Passing

✔ [ OK ] /Hello World!

1 scenario (1 ok)
```
