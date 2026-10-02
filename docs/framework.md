<!-- agents: TestFlows Framework page. Index: https://testflows.com/docs/framework.md -->

# Framework

> Not a typical framework. A Python library for testing as code. Written for humans, loved by AI agents.

TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage.

Write full test programs with dynamic control, structured steps, parallel execution, properties, behavior models, combinatorial and autonomous exploration, and more.

```bash
pip3 install testflows
```

It needs Python 3.8 or later, and is known to run on Ubuntu 20.04 and on other systems such as macOS.

## What sets it apart

- **Test programs.** Control is yours: branch, loop and compose scenarios in Python, with no plugin maze for basic dynamics. Your tests read like the program you meant to write.
- **Steps.** Break behavior into named steps with clear results, so runs are readable, debugging is easier and building blocks are reusable. Failures point to the step that broke.
- **Combinatorial.** Cover combinations systematically, pairwise and beyond, driven from the same test program model.
- **Parallel and async.** Scale out across processes, or go concurrent with `async` and `await`, in the same scenario style.
- **Requirements.** Treat requirements like code: author them in Markdown, link them to tests, and produce coverage reports from the same workflow.
- **Covering arrays.** Cut huge combination spaces down to pairwise or n-wise sets, for strong coverage with far fewer cases than exhaustive enumeration.
- **And more.** Manual testing, documentation as code, professional reports, analytics, protocol modules, and the rest of the toolkit.

## Everything is code

A test is just a Python program. Open a file and define a scenario, with no special runner configuration.

```python
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
```

Run it like any other script:

```bash
python3 ./test.py
```

You get a clear pass, a scenario count and a time.

## Using test steps

Break the procedure into steps. Each step is a named result.

```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Given("I setup something"):
        pass
    with When("I do something"):
        pass
    with Then("I expect something"):
        pass
```

The test output shows each step executing and its result.

## Write tests

- Use the specialized keywords: `Module`, `Feature` and `Scenario`, and the steps `Given`, `When`, `Then`, `And`, `By` and `Finally`.
- Define a test inline, as `with Scenario("name"):`, or with a decorator such as `@TestScenario` and run it by passing it to the keyword: `Scenario(run=my_test)`.
- A decorated function's underscores show as spaces in its test name: `my_feature` is `my feature`.
- Set a result explicitly with `fail("reason")`, and add a message with `note("text")`.

## Run them

- Put options after the program: `--only` and `--skip` select tests by name pattern, `--only-tags` and `--skip-tags` by tag, `-o` picks the output format, `-l` writes a log file, `-c` reads a YML config, and `--no-colors` turns off color. `python3 ./test.py --help` lists them all.
- The program exits with `0` when every test passes and `1` when a test fails.
- A failing run prints the `--only` pattern that reruns the first failure, and the `tfs show messages` command that shows its messages from a log written with `-l`. Test names in a pattern use spaces, as printed.

## Mistakes to avoid

- A program has one top-level test. It exits when that test completes, and code after it never runs, with no error. Put everything under a single `Module`.
- Do not write more than one `with Scenario(...)` at the top of a file and expect both to run.

## Next

- The handbook, by part: https://testflows.com/docs/framework.md
- Writing tests: https://testflows.com/docs/framework/writing-tests.md
- Test definition classes: https://testflows.com/docs/framework/test-definition-classes.md
- The top level test: https://testflows.com/docs/framework/test-structure.md
- Command line and filtering: https://testflows.com/docs/framework/command-line-and-filtering.md
- Code on GitHub: https://github.com/testflows
