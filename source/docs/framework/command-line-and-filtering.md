<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Command Line Arguments

You can add command line arguments to the top level test either by setting [argparser] parameter of the inline test
or using [ArgumentParser] decorator if top test is defined as a decorated function.

## argparser

The [argparser] parameter can be used to set a custom command line argument parser by passing it a function that takes `parser` as the first
parameter. This function will be called with an instance of [argparse] parser instance as the argument for the `parser` parameter.
The values of the command line arguments can be accessed using the `attributes` attribute of the test.

> **{% attention %}** Note that all arguments of the top level test become its `attributes`.

For example,

```python
def argparser(parser):
    """Custom command line arguments.

    :param parser: an instance of argparse parser.
    """
    parser.add_argument("--arg0", action="store_true",
        help="argument 0")
    parser.add_argument("--arg1", action="store_true",
        help="argument 1")

with Module("regression", argparser=argparser) as module:
    note(module.attributes["arg0"].value)
    note(module.attributes["arg1"].value)
```

## ArgumentParser

If [Module] is defined using a decorated function then [ArgumentParser] decorator can be used to set custom command line argument parser.
The values of the custom command line arguments will be passed to the decorated function as test arguments and therefore
the decorated function must take the first parameters with the same name as command line arguments.

For example,

```python
def argparser(parser):
    """Custom command line arguments.

    :param parser: an instance of argparse parser.
    """
    parser.add_argument("--arg0", action="store_true",
        help="argument 0")
    parser.add_argument("--arg1", action="store_true",
        help="argument 1")

@TestModule
@ArgumentParser(argparser)
def regression(self, arg0, arg1):
    note(arg0)
    note(arg1)
```

When custom command line argument parser is defined then the help messages obtained using `-h` or `--help` option will include
the description of the custom arguments. For example,

```bash
python3 ./test.py --help
```
```bash
...
test arguments:
  --arg0                                          argument 0
  --arg1                                          argument 1

```

# Filtering Tests By Name

**{% testflows %}** allows you to control which tests to run during any
specific test program run using advanced test filtering [pattern]s.
Test filters can be either specified in the code or controlled using command line
options.

In both cases test filtering is performed by setting `skips`, `onlys`, `skip_tags`
and `only_tags` attributes of a test. These attributes are propagated down
to sub-tests as long as filtering [pattern] has a chance of matching
test name. Therefore, parent test filtering attributes, if specified,
always override the same attributes of any of its sub-tests if the parent test
filter is applicable to the sub-test and could match either the sub-test name
or any of the sub-test children names.

Test are filtered using a [pattern].
The [pattern] is used to match test names and **{% testflows %}** uses
[unix-like file path pattern]s that support wildcards where

* `/` is path level separator
* `*` matches anything (zero or more characters)
* `?` matches any single character
* `[seq]` matches any character in seq
* `[!seq]` matches any character not in seq
* `:` matches one or more characters only at the current path level

> **{% attention %}** Note that for a literal match, you must wrap the meta-characters in brackets
> where `[?]` matches the character `?`.

It is important to remember that execution of test program results in a [Tree] where
each test is node and test name being a unique path to this node in the [Tree].
The [unix-like file path pattern]s work well because test program
execution [Tree] is similar to the structure of a file system.

Filtering tests is then nothing but selecting which nodes in the tree should be
selected and which shall be skipped. Filtering is performed by matching the [pattern]
to the test name. See [Test Program Tree].

Skipping a test then means that the body of the test is skipped along with the sub-tree
that is below the corresponding test node.

When we want to include a test
it usually means that we also want to execute the test along with all the tests
that form the sub-tree below the coresponding test node and therefore
the [pattern] that indicates which tests should be included most of the time ends with `/*`.

For example,

> `/Top Test/Suite A/Test A/*` [pattern] will match `/Top Test/Suite A/Test A`
> and all its sub-tests which are `/Top Test/Suite A/Test A/Step A` and
> `/Top Test/Suite A/Test A/Step B` because they also match the specified [pattern] as
> it ends with `/*` where `*` matches any zero or more characters.

Internally **{% testflows %}** converts all [pattern]s into
regular expressions but these expressions become very complex and therefore
not practical to be specified explicitly.

Let's see how test filtering can be specified either using command line or inside the
test program code.

## [--only] option

You can specify which tests you want to include in your test run using [--only]
option. This option takes one or more test name [pattern]s that if not matched
will cause the test to be skipped.

```bash
   --only pattern [pattern ...]                    run only selected tests
```

If you pass a relative pattern, any pattern that does not start with `/`,
then the pattern will be anchored to the top level test.
For example, [pattern] `Suite A/*` for the example below will become
`/Top Test/Suite A/*`.

Let's practice. Given this example test program,

> `test.py`
>```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestSuite
def my_suite(self):
    Scenario("Test A", run=my_scenario)
    Scenario("Test B", run=my_scenario)

with Module("Top Test"):
    Suite("Suite A", run=my_suite)
    Suite("Suite B", run=my_suite)
```

the following command will run only `Suite A` and its sub-tests.

```bash
python3 test.py --only "Suite A/*"
```

To select only running `Test A` in `Suite A`.

```bash
python3 test.py --only "/Top Test/Suite A/Test A/*"
```

To select running any test at second level that ends with letter `B`.
This will select every test in `Suite B`.

```bash
python3 filtering.py --only "/Top Test/:B/*"
```

To run only `Test A` in `Suite A` and `Test B` in `Suite B`.

```bash
python3 test.py --only "/Top Test/Suite A/Test A/*" "/Top Test/Suite B/Test B/*"
```

If you forget to specify `/*` at the end your test [pattern] then
tests that are not mandatory will be skipped.

```bash
python3 test.py --only "/Top Test/Suite A/Test A"
```

From the output below you can see that steps inside `Test A` which
are `Step A` and `Step B` are skipped as these tests don't have
[MANDATORY] flag set.

>```bash
Sep 27,2021 14:19:46   ⟥  Module Top Test
Sep 27,2021 14:19:46     ⟥  Suite Suite A
Sep 27,2021 14:19:46       ⟥  Scenario Test A
                 3ms       ⟥⟤ OK Test A, /Top Test/Suite A/Test A
                 6ms     ⟥⟤ OK Suite A, /Top Test/Suite A
                18ms   ⟥⟤ OK Top Test, /Top Test
```

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and
> [Given] and [Finally] steps always have [MANDATORY] flag set.

If you want to see which tests where skipped you can specify [--show-skipped] option.

```bash
python3 test.py --only "/Top Test/Suite A/Test A" --show-skipped
```

## [--skip] option

You can specify which tests you want to skip in your test run using [--skip]
option. This option takes one of more test name [pattern]s that
if match will cause the test be skipped.

```bash
  --skip pattern [pattern ...]                    skip selected tests
```

Skipping test means that a [SKIP] flag will be added to the test, the body
of the test will not be executed and the result of the test will be set to [Skip].
By default, most output formats do not show [Skip]ped tests and thus you must
use [--show-skipped] option to see them.

Just like for [--only option], if you pass a relative pattern, any pattern that does not start with `/`,
then the [pattern] will be anchored to the top level test.
For example, the [pattern] `Suite A/*` for the example below will become
`/Top Test/Suite A/*`.

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and
> [Given] and [Finally] steps always have [MANDATORY] flag set.

Here are a couple of examples that are based on the same example test program
that is used in the [--only option] section above.

> **{% attention %}** Unlike for the [--only option] the [pattern]s for [--skip]
> do not have to end with `/*` as skipping a test automatically
> skips any sub-tests of the test being skipped.

To skip running `Test A` in `Suite A`.

```bash
python3 test.py --skip "/Top Test/Suite A/Test A"
```

To skip running any test at second level that ends with letter `B`.

```bash
python3 filtering.py --skip "/Top Test/:B"
```

Here is an example of combining [--only] option with [--show-skipped] option
to show [Skip]ped tests.

```bash
python3 test.py --skip "/Top Test/Suite A/Test A" --show-skipped
```

```bash
✔ [ Skip ] /Top Test/Suite A/Test A
```

Now let's skip `Test A` in either `Suite A` or `Suite B`.

```bash
python3 test.py --skip "/Top Test/:/Test A" --show-skipped
```

```bash
✔ [ Skip ] /Top Test/Suite A/Test A
✔ [ Skip ] /Top Test/Suite B/Test A
```

## [--only] and [--skip]

You can combine selecting and skipping tests by specifying both [--only] and
[--skip] options. See [--only option] and [--skip option] sections above.

When [--only] and [--skip] are specified at the same time the [--only] option
is applied first and selects a list of tests that will be run. If [--skip] option
is present then it can only filter down the selected tests.

> **{% attention %}** Remember that tests with [MANDATORY] flag cannot be skipped and
> [Given] and [Finally] steps always have [MANDATORY] flag set.

For example, using example test program found in [--only option] section
we can select to run `Test A` in either `Suite A` or `Suite B` but then
skip `Test A` in `Suite B` using [--skip option] as follows.

```bash
python3 test.py --only "/Top Test/:/Test A" --skip "Suite B/Test A"
```

```bash
Passing

✔ [ OK ] /Top Test/Suite A/Test A
✔ [ OK ] /Top Test/Suite A
✔ [ OK ] /Top Test/Suite B
✔ [ OK ] /Top Test
```

As you can see from the output above the `Suite B` gets started but all its tests are skipped
as `Test B` did not match the [pattern] specified to the [--only]
and `Test A` was skipped by the [--skip].

## Filtering Tests in Code

In your test program you can filter child tests to control what tests are included or skipped
by setting `only` and `skip` test attributes.

### `only` and `skip` Arguments

When test is defined inline you can explicitly set filtering using `only` and `skip`
arguments. These arguments either take a list of [pattern]s or you can use
[Onlys class] or [Skips class] respectively.

```python
Onlys(pattern, ...)
```

or

```python
Skips(pattern,...)
```

> **{% attention %}** [Onlys class] or [Skips class] can also act as decorators
> to set `only` and `skip` attributes of decorated tests.
> See [`Onlys` and `Skips` Decorators](#Onlys-and-Skips-Decorators).

```python
with Scenario("my tests", only=[pattern,...], skip=[pattern,...])
    pass
```

or

```python
with Scenario("my tests", only=Onlys(pattern,...), skip=Skips(pattern,...))
    pass
```

For example,

```python
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestSuite
def my_suite(self):
    with Scenario("Test A", only=["Step B"]): # run only "Step B"
        my_scenario()

    with Scenario("Test B", skip=Skips("Step B")): # run only "Step A"
        my_scenario()

if main():
    my_suite()
```

### `Onlys` and `Skips` Decorators

You can also specify `only` and `skip` attributes of decorated tests
using [Onlys class] and [Skips class] that can act as decorators to
set `only` and `skip` attributes of a decorated test respectively.

```python
@Onlys(pattern, ...)
```

or

```python
@Skips(pattern,...)
```

For example,

```python
@TestScenario
def my_scenario(self):
    with Step("Step A"):
        pass
    with Step("Step B"):
        pass

@TestScenario
@Onlys("Step B") # run only "Step B"
def test_A(self):
    my_scenario()

@TestScenario
@Skips("Step B") # run only "Step A
def test_B(self):
    my_scenario()
```

# Filtering Tests By Tags

In addition to filtering test by name you can also filter them by tags.
When you filter by tags, you must specify a `type` to indicate which test [Types]
should have the tag.

> **{% attention %}** Filtering test [Step]s by tags is not supported.

## Tags Filtering `type`

The `type` can be one of the following:
  * `test` will require all tests with [Test Type] to have the tag
    * `scenario` is just an alias for `test`
  * `suite` will require all tests with [Suite Type] to have the tag
    * `feature` is just an alias for `suite`
  * `module` will require all tests with [Module Type] to have the tag
  * `any` will require all test with either [Test Type], [Suite Type] or [Module Type] to have the tag

## `--only-tags` option

If you assign tags to your tests then [--only-tags] option can be used to select
only the tests that match a particular tag. This option takes values
of the form `type:tag1` where [type](#Tags-Filtering-type) is used to specify a test type
of the tests that must have the specified tag.

If you want to select tests that must have more than one tag use `type:tag1,tag2,...` form.

```bash
 --only-tags type:tag,... [type:tag,... ...]     run only tests with selected tags
```

For example, you can select all tests with [Suite Type] that have `tag A` tag
as follows.

```bash
python3 test.py --only-tags suite:"tag A"
```

You can select all tests with [Test Type] that either have `tag A` **OR** `tag B`.

```bash
python3 test.py --only-tags test:"tag A" test:"tag B"
```

You can select all tests with [Test Type] that have both `tag A` **AND** `tag B`.

```bash
python3 test.py --only-tags test:"tag A","tag B"
```

You can select all tests with [Test Type] that must have either `tag A` **OR** (`tag A` **AND** `tag B`).

```bash
python3 test.py --only-tags test:"tag A" test:"tag A","tag B"
```

## `--skip-tags` option

If you assign tags to your tests, then you can also use [--skip-tags] option to select
which tests should be skipped based on tests matching a particular tag.
Similar to [--only-tags] option, it also takes values
of the form `type:tag` where [type](#Tags-Filtering-type) is used to specify a test type
of the tests that must have the specified tags.

If you want to skip tests that must have more than one tag use `type:tag1,tag2,...` form.

```bash
  --skip-tags type:tag,... [type:tag,... ...]     skip tests with selected tags
```

For example, you can skip all tests with [Suite Type] that have `tag A` tag
as follows.

```bash
python3 test.py --skip-tags suite:"tag A"
```

You can skip all tests with [Test Type] that either have `tag A` **OR** `tag B`.

```bash
python3 test.py --skip-tags test:"tag A" test:"tag B"
```

You can skip all tests with [Test Type] that have both `tag A` **AND** `tag B`.

```bash
python3 test.py --skip-tags test:"tag A","tag B"
```

You can skip all tests with [Test Type] that must have either `tag A` **OR** (`tag A` **AND** `tag B`).

```bash
python3 test.py --skip-tags test:"tag A" test:"tag A","tag B"
```

## Filtering by Tags in Code

In your test program, you can filter child tests by tags to control which tests are included or skipped
by setting `only_tags` and `skip_tags` test attributes.

### `only_tags` and `skip_tags` Arguments

When test is defined inline you can explicitly set filtering by tags using `only_tags` and `skip_tags`
arguments. These arguments take [OnlyTags class] or [SkipTags class] object instances, respectively,
that provide a convenient way to set these filters.

For example,

```python
    OnlyTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

or similarly

```python
    SkipTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

> **{% attention %}** [OnlyTags class] or [SkipTags class] can also act as decorators
> to set `only_tags` and `skip_tags` attributes of decorated tests.
> See [`OnlyTags` and `SkipTags` Decorators](#OnlyTags-and-SkipTags-Decorators).

```python
with Scenario("my tests", only_tags=OnlyTags(test=["tag1",("tag1","tag2"),...]), skip_tags=SkipTags(suite=["tag2",...])
    pass
```

### `OnlyTags` and `SkipTags` Decorators

You can also specify `only_tags` and `skip_tags` attributes of the decorated tests
using [OnlyTags class] and [SkipTags class] that can act as decorators to
set `only_tags` and `skip_tags` attributes of a decorated test, respectively.

```python
    @OnlyTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

or similarly

```python
    @SkipTags(
       test=[tagA,(tagA,tagB),...],
       suite=[...],
       module=[...],
       any=[...]
    )
```

For example,

```python
@TestScenario
@Tags("Tag A")
def test_A(self):
    pass

@TestScenario
@Tags("Tag B")
def test_B(self):
    pass

@TestSuite
@OnlyTags(test=["tag A"])
def my_suite(self):
    for scenario in loads(current_module(), Scenario):
        scenario()

@TestSuite
@SkipTags(test=["tag A"])
def my_other_suite(self):
    for scenario in loads(current_module(), Scenario):
        scenario()
```

# Pausing Tests

When tests perform complex automated actions, it is often useful to pause a test either
right before it starts executing its body or right after its completion.
Pausing a test means that the test execution will be halted and input in the form
of pressing `Enter` will be requested from the user. This pause allows
time to manually examine the system under test as well as the test environment.

Pausing either before or after a test is controlled by setting either [PAUSE_BEFORE]
or [PAUSE_AFTER] flags, respectively. You can also conditionally pause
after test execution on passing or failing result using [PAUSE_ON_PASS] or [PAUSE_ON_FAIL].

> *{% attention %}* [PAUSE_BEFORE], [PAUSE_AFTER], [PAUSE_ON_PASS], and [PAUSE_ON_FAIL]
> flags can be applied to any test except the [Top Level Test] test.
> For [Top Level Test] test these flags are ignored.

## Pausing Using Command Line

Most of the time, the most convenient way to pause a test program is to specify at which
test, the program should pause using [--pause-before], [--pause-after],
[--pause-on-pass], and [--pause-on-fail] arguments.

These arguments accept one or more test names [pattern]s. Any test name
that matches the pattern except for the [Top Level Test] will be paused.

```bash
  --pause-before pattern [pattern ...]            pause before executing selected tests
  --pause-after pattern [pattern ...]             pause after executing selected tests
  --pause-on-fail pattern [pattern ...]           pause after selected tests on failing result
  --pause-on-pass pattern [pattern ...]           pause after selected tests on passing result
```


For example, if we have the following test program.

> `pause.py`

```python
from testflows.core import *

with Test("my test"):
    with Step("my step 1"):
        note("my step 1")

    with Step("my step 2"):
        note("my step 2")
```

Then, if we want to pause before executing the body of `my step 1` and right after
executing `my step 2` we can execute our test program as follows.

```bash
python3 pause.py --pause-before "/my test/my step 1" --pause-after "/my test/my step 2"
```

This will cause the test program to be halted twice, requesting `Enter` input
from the user to continue execution.

```bash
 Sep 25,2021 8:34:45   ⟥  Test my test
 Sep 25,2021 8:34:45     ⟥  Step my step 1, flags:PAUSE_BEFORE
✋ Paused, enter any key to continue...
               830ms     ⟥    [note] my step 1
               830ms     ⟥⟤ OK my step 1, /my test/my step 1
 Sep 25,2021 8:34:45     ⟥  Step my step 2, flags:PAUSE_AFTER
               609us     ⟥    [note] my step 2
               753us     ⟥⟤ OK my step 2, /my test/my step 2
✋ Paused, enter any key to continue...
            1s 490ms   ⟥⟤ OK my test, /my test
```

## Pausing In Code

You can explicitly specify [PAUSE_BEFORE], [PAUSE_AFTER], [PAUSE_ON_PASS] and
[PAUSE_ON_FAIL] flags inside your test program.

For example,

```python
with Test("my test"):
    with Step("my step 1", flags=PAUSE_BEFORE):
        note("my step 1")

    with Step("my step 2", flags=PAUSE_AFTER):
        note("my step 2")

    with Step("my step 2", flags=PAUSE_ON_PASS):
        note("my step 2")

    with Step("my step 2", flags=PAUSE_ON_FAIL):
        note("my step 2")
```

For decorated tests [Flags] decorator can be used to set these flags.

```python
@TestScenario
@Flags(PAUSE_BEFORE|PAUSE_AFTER) # pause before and after this test
def my_scenario(self):
    pass
```

### Using `pause()`

You can also use [pause() function] to explicitly pause the test during test program
execution.

```python
pause(test=None)
```

where

* `test` the test instance in which the test program will be paused, default: current test

For example,

```python
from testflows.core import *

with Scenario("my scenario"):
    pause()
```

when executed the test program is paused.

```bash
Nov 15,2021 17:31:58   ⟥  Scenario my scenario
✋ Paused, enter any key to continue...
             1s 55ms   ⟥⟤ OK my scenario, /my scenario
```
