<!-- agents: TestFlows Framework docs index. Index: https://testflows.com/llms.txt -->

# TestFlows Framework

> TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage.

Install it with `pip3 install testflows`. It needs Python 3.8 or later and is known to run on Ubuntu 20.04 and on other systems such as macOS. Each page below is one part of the Framework docs, in Markdown. The text uses [bracketed] names as links, and their targets are listed in references.md.

In the Markdown files, `{% testflows %}` stands for TestFlows, `{% attention %}` starts a note, `{% katex %}` and `{% endkatex %}` wrap math, and `{% html %}` and `{% endhtml %}` wrap HTML.

## Start here

- [Introduction](https://testflows.com/docs/framework/introduction.md): What Framework is and what sets it apart, how to use the docs, the supported environment, installation and a Hello World test.
- [Defining tests](https://testflows.com/docs/framework/defining-tests.md): Define a test inline or with a decorator, and run a test program.
- [Writing tests](https://testflows.com/docs/framework/writing-tests.md): Write tests with the flexibility Framework gives you, and use test steps.

## The rest of the docs, in page order

- [Test flow control](https://testflows.com/docs/framework/test-flow-control.md): Control the order in which tests run, and set a test's result explicitly.
- [Requirements](https://testflows.com/docs/framework/requirements.md): Requirement documents, generating requirement objects, and linking requirements and specifications.
- [Test structure](https://testflows.com/docs/framework/test-structure.md): The attributes of decorated tests, the top level test and the test program tree.
- [Logs and reports](https://testflows.com/docs/framework/logs-and-reports.md): The log file and how to transform it, the results, coverage, metrics, comparison and specification reports, and the test results.
- [Test parameters and naming](https://testflows.com/docs/framework/test-parameters-and-naming.md): Test parameters and arguments, and how tests are named.
- [Test properties](https://testflows.com/docs/framework/test-properties.md): Set a test's flags, tags, attributes, requirements, specifications and examples.
- [Expected failures](https://testflows.com/docs/framework/expected-failures.md): Mark results that are expected to fail with xfails, xflags, xargs and ffails.
- [Timeouts and conditions](https://testflows.com/docs/framework/timeouts-and-conditions.md): Test timeouts, the `when` condition and the specialized keywords.
- [Manual tests](https://testflows.com/docs/framework/manual-tests.md): Semi-automated and manual tests.
- [Test definition classes](https://testflows.com/docs/framework/test-definition-classes.md): Module, Suite, Feature, Test, Scenario, Check, Example, Outline, Combination, Sketch and Iteration, and the step classes Step, Given, Background, When, And, By, Then, But and Finally.
- [Concepts and types](https://testflows.com/docs/framework/concepts-and-types.md): The concepts and definitions Framework is built on, and the test types and sub-types.
- [Command line and filtering](https://testflows.com/docs/framework/command-line-and-filtering.md): Command line arguments, filtering tests by name and by tags, and pausing tests.
- [Contexts, setups and teardowns](https://testflows.com/docs/framework/contexts-and-setups.md): Pass state between tests with contexts, write setups and teardowns, and return values.
- [Loading tests](https://testflows.com/docs/framework/loading-tests.md): Load tests and modules from other files.
- [Combinatorial tests](https://testflows.com/docs/framework/combinatorial-tests.md): Generate combinations with nested loops, Cartesian products, sketches, combination outlines and covering arrays for pairwise and n-wise testing.
- [Async and parallel tests](https://testflows.com/docs/framework/async-and-parallel-tests.md): Async tests, parallel tests and parallel executors.
- [Crossing out and forcing results](https://testflows.com/docs/framework/crossing-out-and-forcing-results.md): Cross out results, set or clear flags, and force results.
- [Repeating and retrying](https://testflows.com/docs/framework/repeating-and-retrying.md): Repeat or retry tests, and repeat or retry code and function calls.
- [Timing out](https://testflows.com/docs/framework/timing-out.md): Time out tests, and time or time out code.
- [YML config files](https://testflows.com/docs/framework/yml-config-files.md): Pass options to a test program with YML configuration files.
- [Messages, metrics and input](https://testflows.com/docs/framework/messages-metrics-and-input.md): Add messages and metrics to a test, and read input.
- [Test program options](https://testflows.com/docs/framework/test-program-options.md): The options every test program accepts, and the test flags.
- [Controlling output](https://testflows.com/docs/framework/controlling-output.md): Output formats such as nice, brisk, short, classic and quiet, colors, aborting or continuing on fail, debug mode and test time.
- [Using secrets](https://testflows.com/docs/framework/using-secrets.md): Hide values such as passwords and keys in test logs.
- [Testing documentation](https://testflows.com/docs/framework/testing-documentation.md): Write auto-verified docs with `testflows.texts` and run them with `tfs document run`.

## Optional

- [References](https://testflows.com/docs/framework/references.md): The link definitions for the [bracketed] names used throughout the docs.
