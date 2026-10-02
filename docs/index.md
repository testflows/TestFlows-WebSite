<!-- agents: TestFlows home page. Index: https://testflows.com/llms.txt -->

# TestFlows

> Write test programs. Explore in a deterministic machine. Built for humans and AI agents.

TestFlows makes tools for testing software.

## Framework

TestFlows Framework is an open-source Python library for writing test programs. You write tests and define the test flow explicitly as Python code, with everything treated as a test, for functional, integration, acceptance and unit testing. It produces test reports and ties tests to requirements for coverage.

A test is a Python program:

```python
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
```

Run it like any other script:

```bash
python3 ./test.py
```

- Install it with `pip3 install testflows`.
- The handbook, by part: https://testflows.com/docs/framework.md
- The Framework page: https://testflows.com/framework.md

## Machine

TestFlows Machine is a deterministic execution machine in the cloud, provided as a self-serve service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

Run your programs deterministically: record a run, replay it exactly, and branch from any point.

- Create an account: https://testflows.com/machine/portal/signup/
- Download the client: https://testflows.com/machine/download.md
- The docs, by part: https://testflows.com/docs/machine.md
- The Machine page: https://testflows.com/machine.md

## Blog

Articles on test programs, steps, combinatorial coverage, behavior models and more: https://testflows.com/blog.md

## Contact

Questions, support, early access or partnerships: https://testflows.com/contact.md. Code is on GitHub: https://github.com/testflows
