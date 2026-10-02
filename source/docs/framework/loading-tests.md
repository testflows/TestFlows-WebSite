<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Loading Tests

## Using `load()`

You can use [load() function] to load a test or any object from another
module.

For example, given a [Scenario] defined in `tests/another_module.py`

```python
from testflows.core import *

@TestScenario
def my_test_in_another_module(self):
    pass

```

then, using [load() function] you can load this test in another module
and use it as a base test for an inline defined [Scenario] as follows.

```python
with Module("my module"):
     Scenario("my test", run=load("tests.another_module", test="my_test_in_another_module"))
```

## Using `loads()`

You can use [loads() function] to load one or more tests of a given
test class.

```python
loads(name, *types, package=None, frame=None, filter=None)
```
where

* `name` module name or module
* `*types` test types ([Step], [Test], [Scenario], [Suite], [Feature], or [Module]), default: all
* `package` package name if module name is relative (optional)
* `frame` caller frame if module name is not specified (optional)
* `filter` filter function (optional)

and **returns** list of tests.

For example, given multiple [Scenario]s defined in the same file, one can
use `loads() function` to execute all the [Scenario]s as follows

```python
@TestScenario
def test1(self):
    pass

@TestScenario
def test2(self):
    pass

@TestFeature
def feature(self):
    for scenario in loads(current_module(), Scenario):
        scenario()
```

If a file contains multiple test types, then you can just
specify them as needed. For example,

```python
@TestSuite
def test1(self):
    pass

@TestScenario
def test2(self):
    pass

@TestFeature
def feature(self):
    for test in loads(current_module(), Scenario, Suite):
        test()
```

See also [using current_module()].

## Using `ordered()`

By default, [loads() function] returns tests in random order. If you want
a deterministic order, then use [ordered() function] to sort
a list of tests loaded with [loads() function] by test function name.

For example,

```python
@TestFeature
def feature(self):
    for scenario in ordered(loads(current_module(), Scenario)):
        scenario()
```

# Loading Modules

## Using `current_module()`

Using [current_module() function] allows you to conveniently reference
the current module. For example,

```python
@TestFeature
def feature(self):
    for test in loads(current_module(), Scenario, Suite):
        test()
```

## Using `load_module()`

The [load_module() function] allows you to load any module by specifying the module name.

For example,

```python
@TestFeature
def feature(self):
    for scenario in loads(load_module("tests.another_module"), Scenario):
        scenario()
```
