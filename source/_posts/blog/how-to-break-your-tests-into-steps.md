---
post: true
title: Making Your Tests Better or How to Break Your Tests Into Steps
description: An article about how tests can be broken up into steps using TestFlows.
date: 2019-11-24 08:26:26
author: Vitaliy Zakaznikov
image: images/test-steps.png
icon: fas fa-glasses pt-5 pb-5
---

Writing tests is not as easy task as it may seem at first glance.
In many cases, writing a good test can be as hard as writing
good application code.
While readability and maintainability are both desirable features in application code, they are not always required.
For tests, on the other hand, readability and maintainability are a must.<!-- more -->
This article will explore a simple approach to making your tests better
and show how you can improve your tests by breaking them into steps.
Because there are different types of tests, we will specifically focus
on the writing of a functional test.

# Something to test

To explore a manner in which we can make a test better, we need to write one. For this
we need something to test. What could it be? After much thought and for no
obvious reason a simple `ls` utility found on all Unix-like systems comes to mind.

```bash
ls foo
```
```bash
ls: cannot access 'foo': No such file or directory
```

# What will we test?

Any good test that is worth the memory in which it is stored needs to verify one or more requirements. Having picked
the `ls` utility, we need to come up with a simple requirement
that we can verify. Let's pick the following requirement:

> When a file or a directory does not exist, then an error message should
> be printed in `stderr`, and the exit code should be `2`.

With the requirement ready, we can proceed to write a test.

# First step

There are plenty of test frameworks that we can use to write a test but
of course, we will use {% testflows %} for this purpose as it
has a convenient **Connect** module that provides a **Shell** class
that will allow us to test `ls` utility in an intuitive way.

Let's throw a few lines together into `test.py` to get us going.

```python
from testflows.core import Test
from testflows.connect import Shell

with Test("Check 'ls' behaviour when file or directory does not exist"):
     with Shell() as bash:
        bash('ls foo')
```

And run it.

```bash
python3 ./test.py
```
```bash
Nov 25,2019 18:42:19   ⟥  Test Check 'ls' behaviour when file or directory does not exist
               215ms        [bash] bash# ls foo
               216ms        [bash] ls: cannot access 'foo': No such file or directory
               217ms        [bash] bash# echo $?
               217ms        [bash] 2
               217ms        [bash] bash#
               232ms        [bash]
               233ms   ⟥⟤ OK Check 'ls' behaviour when file or directory does not exist, /Check 'ls' behaviour when file or directory does not exist

Passing

✔ [ OK ] /Check 'ls' behaviour when file or directory does not exist

1 test (1 ok)

Total time 233ms
```

The output is very much the same as you would see in a terminal window.
The result of the test is `OK`, as no exception has been raised. However,
we have not asserted anything in the test. Now is the time to add two
assertions to verify the requirement.
One to check the error message, and another to check the exit code.

```python
from testflows.core import Test
from testflows.connect import Shell
from testflows.asserts import error

with Test("Check 'ls' behaviour when file or directory does not exist"):
     with Shell() as bash:
        cmd = bash('ls foo')
        assert "ls: cannot access 'foo': No such file or directory" in cmd.output, error()
        assert cmd.exitcode == 2, error()
```

The code is short and sweet. We have added two assertions, and used Python's default **assert**
statement, and did not need to use any special assertion libraries. However, we did use the [testflows.asserts](https://github.com/testflows/TestFlows-Asserts)
module to provide us with a useful **error()** function. This function prints detailed debugging
information when the assertion fails. The assertion did not fail for me, and hopefully,
it did not fail for you either. If it did, then the **error()** function should have provided you with
details about what went wrong. Hey, make it fail and see what happens!

# Taking the next step

Are we done with the test? We could be, but we also could think about what would happen if our
test was much more complex. Have we covered all the important cases? No, only one.
What else can be tested? In truth, many more cases exist that we could and should check.
For example, we could also check what happens if a path that we pass to the `ls` differs only
by one last character from a valid one. Maybe there is a bug, and then it will fail?

We will leave the test as it is to keep it simple. But we'll start thinking about
a test as nothing but an implementation of a test procedure. For a simple test,
the procedure is simple, and for a complex test, the procedure helps
understand what the test is doing. The test procedure should be
formally defined in a test specification, but who has time to write one?
Unless you work on a project where it is required, you probably don't have the time.

Nevertheless, whether or not we identify the test procedure beforehand in the form of a formal
test specification or just throw a test together on the go, the procedure
is always there. Therefore, we can identify it.
So let's revisit the test and add some comments to identify the procedure.

```python
with Test("Check 'ls' behaviour when file or directory does not exist"):
     with Shell() as bash:
        #  execute 'ls' with an invalid path"
        cmd = bash('ls foo')
        #  check error message and exit code"
        assert "ls: cannot access 'foo': No such file or directory" in cmd.output, error()
        assert cmd.exitcode == 2, error()
```

The test has a simple procedure that is made up of at least two steps.
Step one: execute `ls` with an invalid path. Step two: check the error message and exit code.
Right, now we have a test procedure added to the test as comments, but could we do better?
Yes, we can. We can add explicit steps to the test by using a **Step**.

```python
from testflows.core import Test, Step
from testflows.connect import Shell
from testflows.asserts import error

with Test("Check 'ls' behaviour when file or directory does not exist"):
     with Shell() as bash:
        with Step("execute 'ls' with an invalid path"):
            cmd = bash('ls foo')
        with Step("check error message and exit code"):
            assert "ls: cannot access 'foo': No such file or directory" in cmd.output, error()
            assert cmd.exitcode == 2, error()
```

When executed with {% testflows %}, the test above produces the output that includes
the test steps.

```bash
Nov 26,2019 17:57:25   ⟥  Test Check 'ls' behaviour when file or directory does not exist
Nov 26,2019 17:57:25     ⟥  Step execute 'ls' with an invalid path
               174ms          [bash] bash# ls foo
               178ms          [bash] ls: cannot access 'foo': No such file or directory
               179ms          [bash] bash# echo $?
               179ms          [bash] 2
               179ms          [bash] bash#
               179ms     ⟥⟤ OK execute 'ls' with an invalid path, /Check 'ls' behaviour when file or directory does not exist/execute 'ls' with an invalid path
Nov 26,2019 17:57:25     ⟥  Step check error message and exit code
                 2ms     ⟥⟤ OK check error message and exit code, /Check 'ls' behaviour when file or directory does not exist/check error message and exit code
               193ms          [bash]
               196ms   ⟥⟤ OK Check 'ls' behaviour when file or directory does not exist, /Check 'ls' behaviour when file or directory does not exist
```

The test steps are even more apparent if we use the **short** output format.

```bash
python3 ./test.py -o short
```
```bash
Test Check 'ls' behaviour when file or directory does not exist
  Step execute 'ls' with an invalid path
  OK
  Step check error message and exit code
  OK
OK

Passing

✔ [ OK ] /Check 'ls' behaviour when file or directory does not exist

1 test (1 ok)
2 steps (2 ok)

Total time 206ms
```

Read through the output and the code. By adding steps, we have added documentation to our test code
and the test output at the same time. Did we just kill two birds with one stone?
Figuratively speaking, yes, we did.
This is no small feat. For non-trivial tests, having a test procedure explicitly
documented in the code and present in the output is a big advantage.
It not only helps to analyze test results by looking at the output but also
helps to understand the test code itself.

# Taking a step in the right direction

Take a look at your tests and see how the simple idea of breaking tests into steps
can help make your tests more readable and easier to debug.
The cost of test maintenance far outweighs a few additional lines
that can be added to make your tests better. Unfortunately, there are a plethora
of test frameworks out there that do not provide any support for defining steps
 inside a test. They simply ignore the importance of explicitly identifying
a test procedure. Well, that's a mistake as breaking tests into steps
is literally a step in the right direction.


> Any good test that is worth the memory in which it is stored needs to verify one or more requirements.






