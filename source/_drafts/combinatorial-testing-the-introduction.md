---
title: Combinatorial Testing. The Introduction
description: Introduction to combinatorial testing using TestFlows
date: 2023-10-10
author: Vitaliy Zakaznikov
image:
   asset: images/combinatorial-tests-intro.png
icon: fas fa-glasses pt-5 pb-5
---

According to the US National Institute of Standards and Technology's (NIST) page on [Combinatorial Testing](https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software), combinatorial testing can reduce costs for software testing,
and its applications in software engineering can be significant.
This is not surprising, as combinatorial testing is the cornerstone of any type of software testing.
In its simplest form, one can think of it as finding the correct combination for a padlock.
But instead of looking for a combination that opens the lock, the quality assurance team looks for combinations that lead to a violation of one or more requirements—the bugs. The technique is simple and universal, and in theory, it provides the most sought-out feature in testing, which is complete test coverage. <!-- more -->

{% blockquote US National Institute of Standards and Technology (NIST), https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software Combinatorial Testing %}
Combinatorial methods can reduce costs for software testing, and have significant applications in software engineering.
{% endblockquote %}

# What is Combinatorial Testing?

Combinatorial testing is a technique that checks all, the exhaustive case, or just some combinations of system inputs.
The most common applications of combinatorial testing is to check combinations of input parameters or
configuration options. Checking combinations of system's input parameters is the simplest form of application.
A system can either be complex or be as simple as just a simple function.

# Applying Combinatorial Testing

For example, here is a function that defines a pressure switch. This function has bugs for some specific
combinations of values for the pressure and volume input parameters.
Combinatorial testing would check the pressure switch functions against all possible combinations of
pressure and volume.

```python
def pressure_switch(pressure, volume):
    """Pressure switch."""
    if (pressure < 10 or pressure > 30):
       if (volume > 250):
           assert False, "boom!"
       else:
           note("ok, no problem")
    else:
        note("ok")
```

Let's assume that the `pressure` parameter could take values `{0, 10, 20, 30, 40}`,
and the `volume` parameter could have values `{0, 50, 100, 150, 200, 250, 300}`.
Given that the `pressure` has `5` possible values, and the `volume`
has `7` possible values, the total number of all combinations is `35`.

{% blockquote %}
{% katex %}
pressures * volumes = 5 * 7 = 35
{% endkatex %}
{% endblockquote %}

We can write a simple test scenario to check all of these combinations using a simple for-loop.

```python
@TestScenario
def check_pressure_switch(self):
    """Check all combinations of pressure and volume.
    """
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 50, 100, 150, 200, 250, 300]

    for pressure in pressures:
        for volume in volumes:
            with Check(f"pressure={pressure},volume={volume}", flags=TE):
                pressure_switch(pressure=pressure, volume=volume)
```

In general, the total number of combinations, {%katex%}N{%endkatex%}, is simply the product of number of values
for each parameter.

{% blockquote %}
{% katex %}
N = v_0 * v_1 *...* v_n
{% endkatex %}
{% endblockquote %}

The complete {% testflows %} test program would be the following:

```python
from testflows.core import *

def pressure_switch(pressure, volume):
    """Pressure switch."""
    if (pressure < 10 or pressure > 30):
       if (volume > 250):
           assert False, "boom!"
       else:
           note("ok, no problem")
    else:
        note("ok")

@TestScenario
def check_pressure_switch(self):
    """Check all combinations of pressure and volume.
    """
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 50, 100, 150, 200, 250, 300]

    for pressure in pressures:
        for volume in volumes:
            with Check(f"pressure={pressure},volume={volume}", flags=TE):
                pressure_switch(pressure=pressure, volume=volume)

if main():
    check_pressure_switch()
```

Executing the program above would produce the following output:

```python
Oct 10,2023 16:38:44   ⟥  Scenario check pressure switch
                            Check all combinations of pressure and volume.
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=0, flags:TE
               262us     ⟥    [note] ok, no problem
               328us     ⟥⟤ OK pressure=0,volume=0, /check pressure switch/pressure=0,volume=0
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=50, flags:TE
               474us     ⟥    [note] ok, no problem
               578us     ⟥⟤ OK pressure=0,volume=50, /check pressure switch/pressure=0,volume=50
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=100, flags:TE
               357us     ⟥    [note] ok, no problem
               450us     ⟥⟤ OK pressure=0,volume=100, /check pressure switch/pressure=0,volume=100
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=150, flags:TE
               161us     ⟥    [note] ok, no problem
               203us     ⟥⟤ OK pressure=0,volume=150, /check pressure switch/pressure=0,volume=150
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=200, flags:TE
               161us     ⟥    [note] ok, no problem
               204us     ⟥⟤ OK pressure=0,volume=200, /check pressure switch/pressure=0,volume=200
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=250, flags:TE
               156us     ⟥    [note] ok, no problem
               197us     ⟥⟤ OK pressure=0,volume=250, /check pressure switch/pressure=0,volume=250
Oct 10,2023 16:38:44     ⟥  Check pressure=0,volume=300, flags:TE
               665us     ⟥    Exception: Traceback (most recent call last):
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 26, in <module>
                                    check_pressure_switch()
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 23, in check_pressure_switch
                                    pressure_switch(pressure=pressure, volume=volume)
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 7, in pressure_switch
                                    assert False, "boom!"
                                AssertionError: boom!
               776us     ⟥⟤ Fail pressure=0,volume=300, /check pressure switch/pressure=0,volume=300, AssertionError
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=0, flags:TE
               196us     ⟥    [note] ok
               247us     ⟥⟤ OK pressure=10,volume=0, /check pressure switch/pressure=10,volume=0
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=50, flags:TE
               167us     ⟥    [note] ok
               215us     ⟥⟤ OK pressure=10,volume=50, /check pressure switch/pressure=10,volume=50
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=100, flags:TE
               161us     ⟥    [note] ok
               204us     ⟥⟤ OK pressure=10,volume=100, /check pressure switch/pressure=10,volume=100
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=150, flags:TE
               162us     ⟥    [note] ok
               205us     ⟥⟤ OK pressure=10,volume=150, /check pressure switch/pressure=10,volume=150
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=200, flags:TE
               161us     ⟥    [note] ok
               208us     ⟥⟤ OK pressure=10,volume=200, /check pressure switch/pressure=10,volume=200
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=250, flags:TE
               161us     ⟥    [note] ok
               203us     ⟥⟤ OK pressure=10,volume=250, /check pressure switch/pressure=10,volume=250
Oct 10,2023 16:38:44     ⟥  Check pressure=10,volume=300, flags:TE
               229us     ⟥    [note] ok
               270us     ⟥⟤ OK pressure=10,volume=300, /check pressure switch/pressure=10,volume=300
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=0, flags:TE
               149us     ⟥    [note] ok
               190us     ⟥⟤ OK pressure=20,volume=0, /check pressure switch/pressure=20,volume=0
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=50, flags:TE
               146us     ⟥    [note] ok
               187us     ⟥⟤ OK pressure=20,volume=50, /check pressure switch/pressure=20,volume=50
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=100, flags:TE
               155us     ⟥    [note] ok
               196us     ⟥⟤ OK pressure=20,volume=100, /check pressure switch/pressure=20,volume=100
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=150, flags:TE
               147us     ⟥    [note] ok
               193us     ⟥⟤ OK pressure=20,volume=150, /check pressure switch/pressure=20,volume=150
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=200, flags:TE
               154us     ⟥    [note] ok
               196us     ⟥⟤ OK pressure=20,volume=200, /check pressure switch/pressure=20,volume=200
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=250, flags:TE
               155us     ⟥    [note] ok
               197us     ⟥⟤ OK pressure=20,volume=250, /check pressure switch/pressure=20,volume=250
Oct 10,2023 16:38:44     ⟥  Check pressure=20,volume=300, flags:TE
               219us     ⟥    [note] ok
               263us     ⟥⟤ OK pressure=20,volume=300, /check pressure switch/pressure=20,volume=300
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=0, flags:TE
               147us     ⟥    [note] ok
               189us     ⟥⟤ OK pressure=30,volume=0, /check pressure switch/pressure=30,volume=0
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=50, flags:TE
               145us     ⟥    [note] ok
               187us     ⟥⟤ OK pressure=30,volume=50, /check pressure switch/pressure=30,volume=50
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=100, flags:TE
               145us     ⟥    [note] ok
               187us     ⟥⟤ OK pressure=30,volume=100, /check pressure switch/pressure=30,volume=100
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=150, flags:TE
               150us     ⟥    [note] ok
               193us     ⟥⟤ OK pressure=30,volume=150, /check pressure switch/pressure=30,volume=150
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=200, flags:TE
               146us     ⟥    [note] ok
               188us     ⟥⟤ OK pressure=30,volume=200, /check pressure switch/pressure=30,volume=200
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=250, flags:TE
               156us     ⟥    [note] ok
               201us     ⟥⟤ OK pressure=30,volume=250, /check pressure switch/pressure=30,volume=250
Oct 10,2023 16:38:44     ⟥  Check pressure=30,volume=300, flags:TE
               154us     ⟥    [note] ok
               196us     ⟥⟤ OK pressure=30,volume=300, /check pressure switch/pressure=30,volume=300
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=0, flags:TE
               216us     ⟥    [note] ok, no problem
               257us     ⟥⟤ OK pressure=40,volume=0, /check pressure switch/pressure=40,volume=0
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=50, flags:TE
               177us     ⟥    [note] ok, no problem
               220us     ⟥⟤ OK pressure=40,volume=50, /check pressure switch/pressure=40,volume=50
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=100, flags:TE
               149us     ⟥    [note] ok, no problem
               190us     ⟥⟤ OK pressure=40,volume=100, /check pressure switch/pressure=40,volume=100
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=150, flags:TE
               156us     ⟥    [note] ok, no problem
               201us     ⟥⟤ OK pressure=40,volume=150, /check pressure switch/pressure=40,volume=150
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=200, flags:TE
               147us     ⟥    [note] ok, no problem
               189us     ⟥⟤ OK pressure=40,volume=200, /check pressure switch/pressure=40,volume=200
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=250, flags:TE
               146us     ⟥    [note] ok, no problem
               187us     ⟥⟤ OK pressure=40,volume=250, /check pressure switch/pressure=40,volume=250
Oct 10,2023 16:38:44     ⟥  Check pressure=40,volume=300, flags:TE
               317us     ⟥    Exception: Traceback (most recent call last):
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 26, in <module>
                                    check_pressure_switch()
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 23, in check_pressure_switch
                                    pressure_switch(pressure=pressure, volume=volume)
                                  File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 7, in pressure_switch
                                    assert False, "boom!"
                                AssertionError: boom!
               393us     ⟥⟤ Fail pressure=40,volume=300, /check pressure switch/pressure=40,volume=300, AssertionError
                14ms   ⟥⟤ Fail check pressure switch, /check pressure switch, AssertionError
                         Traceback (most recent call last):
                           File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 26, in <module>
                             check_pressure_switch()
                           File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 23, in check_pressure_switch
                             pressure_switch(pressure=pressure, volume=volume)
                           File "/home/user/Projects/TestFlows/WebSite/py/cintro.py", line 7, in pressure_switch
                             assert False, "boom!"
                         AssertionError: boom!

Failing

✘ [ Fail ] /check pressure switch/pressure=0,volume=300 (776us)
✘ [ Fail ] /check pressure switch/pressure=40,volume=300 (393us)
✘ [ Fail ] /check pressure switch (14ms)

1 scenario (1 failed)
35 checks (33 ok, 2 failed)

Total time 14ms

Executed on Oct 10,2023 16:38
TestFlows.com Open-Source Software Testing Framework v2.0.231001.1175523
```

# Computing combinations using Cartesian product

A simple for-loop solution only works well when the number of combination variables is small.
However, it does not scale if the number of parameters is large. In this case using a Cartesian product
function comes handy.

Python standard library provides [itertools.product](https://docs.python.org/3/library/itertools.html#itertools.product)
function that calculates Cartesian product of iterables and we can use it to remove nested for-loops
and {% testflows %} coveniently provides it from the [testflows.combinatorics](https://github.com/testflows/TestFlows-Combinatorics) module.

> `itertools.product(*iterables, repeat=1)`<br>
>   Cartesian product of input iterables.

Using the `product` function we can rewrite the scenario to check all input parameter combinations
of the pressure switch function as follows:

```python
from testflows.combinatorics import product

@TestScenario
def check_pressure_switch(self):
    """Check all combinations of pressure and volume
    using cartesian product."""
    pressures = [0, 10, 20, 30, 40]
    volumes = [0, 50, 100, 150, 200, 250, 300]

    for combination in product(pressures, volumes):
        pressure, volume = combination
        with Check(f"pressure={pressure},volume={volume}", flags=TE):
            pressure_switch(pressure=pressure, volume=volume)
```

As we can see, now we have only one for-loop instead of two, and if the number of combination variables
was greater than two, then we would not need add any more nested loops but instead would just pass
more variables into the Cartesian `product` function.

# Exhaustive testing and the combinatorial explosion problem

Even though we could pass as many iterables as we want into the Cartesian `product` function,
one for each of our input parameters, the number of combinations will quickly grow
and exhaustive testing would become infeasible due to the combinatorial explosion problem.

The combinatorial explosion arises from the fact that the total number of combinations, {%katex%}N{%endkatex%},
grows very rapidly as either the number of values for each parameter or the number of parameters
increases.

{% blockquote %}
{% katex %}
N = v_0 * v_1 *...* v_n
{% endkatex %}
{% endblockquote %}

For example, if we have `10` parameters (`n = 10`) that each have `10` possible values (`v = 10`), the
number of all combinations is {% katex %}v^k=10^{10} = {10}_{billion}{% endkatex %}, thus requiring 10 billion
test combinations for complete coverage.

If we take the case where each parameter has the same number of values then we will get
the {%katex%} N = v^n {%endkatex%} case.

If we graph this formula for the {%katex%}v=2{%endkatex%} case, with the x-axis being the
number of parameters, {%katex%}n{%endkatex%}, and the y-axis being the number of combinations, {%katex%}N{%endkatex%},
then it will look as follows:

<img src="/images/combinatorial-explosion.png" width="100%" height="400">

To make it even worse, the line gets even steeper as we increase the value of {%katex%}v{%endkatex%}!

So, can we conclude that combinatorial testing is a lost cause? Actually, not really and far from it!
However, this is a topic for another blog article. So please stay tuned.

> If we take the case where each parameter has the same number of values then we will get
> the {%katex%} N = v^n {%endkatex%} case.

# Conclusion

This was a brief introduction to combinatorial testing. We've seen a simple example of applying
combinatorial testing technique to a simple pressure switch function and explored two solutions
that checked all possible combinations of its input parameters. The first naive solution using
the nested for-loop suffered from scalability issues if number of combination variables increases.
The second solution using the Cartesian product function solved the scalability issue
but still ran into problems with combinatorial explosion when the number of input parameters of the system increased and
exhaustive testing of all possible combinations became infeasible. Nonetheless,
the principles of combinatorial testing were applied successfully. The solution
to combinatorial explosion problem is not trivial but techniques such as using
covering arrays can help us make combinatorial testing practical.

If want to know more, read our introductory article on covering arrays titled [Get Your Software Covered Using Covering Arrays](http://localhost:4000/blog/get-your-software-covered-using-covering-arrays/).
For more in-depth overview of combinatorial testing, please checkout an excellent article provided by NIST titled [Practical Combinatorial Testing](https://csrc.nist.gov/pubs/sp/800/142/final).

Also, check out the [Combinatorial Tests](http://localhost:4000/handbook/#Combinatorial-Tests) section in the handbook
to find out more about how {% testflows %} supports combinatorial tests.
