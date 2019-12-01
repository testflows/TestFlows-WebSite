---
layout: handbook
p: /handbook
title: Preface
heading: A Practical Guide To Testing with TestFlows
icon: fas fa-book pt-5 pb-5
---

# The Basics

## TestFlows in One Paragraph

[TestFlows] is a **flow** oriented test framework that can be used for functional,
integration, acceptance and unit testing. It uses **everything is a test** approach
with the focus on providing test authors flexibility in writing and running their tests.

## Supported Environment

* [Ubuntu] 18.04
* [Python 3] >= 3.6

> However, known to run on other systems including MacOS.

## Installation

You can install [TestFlows] using [pip3]

```bash
$ pip3 install testflows
```

or from sources

```bash
$ git clone https://github.com/testflows/TestFlows.git
$ cd TestFlows
$ ./build ; ./install
```

## Hello World

You can write a test scenario in just three lines

```python
from testflows.core import Scenario

with Scenario("Hello World!"):
    pass
```

and run it using `python3` command.

```bash
$ python3 ./test.py 
Oct 21,2019 18:44:06   ⟥  Scenario Hello World!
                 1ms   ⟥⟤ OK Hello World!, /Hello World!

1 scenario (1 ok)

Total time 1ms

Executed on Dec 31,1969 19:00
TestFlows Test Framework v1.3.191021.1223802
```

[TestFlows]: https://github.com/testflows/testflows
[pip3]: https://github.com/pypa/pip
[Python 3]: https://www.python.org/
[Ubuntu]: https://ubuntu.com/