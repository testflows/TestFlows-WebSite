<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test Program Options

## Options

### -h, --help

The `-h`, `--help` option can be used to obtain a help message that describes all the command line
options a test can accept. For example,

```bash
python3 test.py --help
```

### -l, --log

The `-l`, `--log` option can be used to specify the path of the file where the test log will be saved.
For example,

```bash
python3 test.py --log ./test.log
```

### --name

The `--name` option can be used to specify the name of the top level test.
For example,

```bash
python3 test.py --name "My custom top level test name"
```

### --tag

The `--tag` option can be used to specify one or more tags for the top level test.
For example,

```bash
python3 test.py --tag "tag0" "tag1"
```

### --attr

The `--attr` option can be used to specify one or more attributes for the top level test.
For example,

```bash
python3 test.py --attr attr0=value0 attr1=value1
```

### --debug

Enable debugging mode. Turned off by default.

### --output

The `--output` option can be used to control the output format of messages printed to `stdout`.

### --no-colors

The `--no-colors` option can be used to turn off terminal color highlighting.

### --id

The `--id` option can be used to specify a custom [Top Level Test] id.

### --show-skipped

Show skipped tests.

### --show-retries

Show retried tests.

### --test-to-end

Force all tests to be completed and continue the run even if one of the tests fails.

### --first-fail

Force all tests to fail and stop the run on the first failing test.

### Filtering

#### pattern

Options such as [--only], [--skip], [--start], [--end] as well as
[--pause-before] and [--pause-after] take a [pattern] to specify the exact test
which the option will be applied.

The [pattern] is used to match test names using a [unix-like file path pattern] that supports wildcards

* `/` path level separator
* `*` matches everything
* `?` matches any single character
* `[seq]` matches any character in seq
* `[!seq]` matches any character not in seq
* `:` matches anything at the current path level

> **{% attention %}** Note that for a literal match, you must wrap the meta-characters in brackets
> where `[?]` matches the character `?`.

#### --only

The `--only` option can be used to filter the test flow so that only the specified tests
are executed.

> **{% attention %}** Note that mandatory tests will still be run.

> **{% attention %}** Note that most of the time the [pattern] should end with `/*` so that
> any steps or sub-tests are executed inside the selected test.

For example,

```bash
python3 test.py --only "/my test/*"
```

#### --skip

The `--skip` option can be used to filter the test flow so that the specified tests
are skipped.

> **{% attention %}** Note that mandatory tests will still be run.

#### --start

The `--start` option can be used to filter the test flow so that the test flow starts at
the specified test.

> **{% attention %}** Note that mandatory tests will still be run.

#### --only-tags

The `--only-tags` option can be used to filter the test flow so that only
tests with a particular tag are selected to run and others are skipped.

> **{% attention %}** Note that mandatory tests will still be run.

#### --skip-tags

The `--skip-tags` option can be used to filter the test flow so that only
tests with a particular tag are skipped.

> **{% attention %}** Note that mandatory tests will still be run.

#### --end

The `--end` option can be used to filter the test flow so that the test flow ends at
the specified tests.

> **{% attention %}** Note that mandatory tests will still be run.

#### --pause-before

The `--pause-before` option can be used to specify the tests before which the test flow
will be paused.

#### --pause-after

The `--pause-after` option can be used to specify the tests after which the test flow
will be paused.

#### --pause-on-pass

The `--pause-on-pass` option can be used to specify the tests after which the test flow
will be paused if the test has a passing result.

#### --pause-on-fail

The `--pause-on-fail` option can be used to specify the tests after which the test flow
will be paused if the test has a failing result.

#### --repeat

The `--repeat` option can be used to specify the tests to be repeated.

#### --retry

The `--retry` option can be used to specify the tests to be retried.

#### --strict-names

The `--strict-names` option can be used to force strict test names by disallowing using any restricted characters.

# Test Flags

**{% testflows %}** supports the following test flags.

## TE

Test to end flag. Continues executing tests even if this test fails.

## UT

Utility test flags. Marks test as utility for reporting.

## SKIP

Skip test flag. Skips the test during execution.

## EOK

Expected [OK] flag. Test result will be set to [Fail] if the test result is not [OK] otherwise [OK].

## EFAIL

Expected [Fail] flag. Test result will be set to [Fail] if the test result is not [Fail] otherwise [OK].

## EERROR

Expected [Error] flag. Test result will be set to [Fail] if the test result is not [Error] otherwise [OK].

## ESKIP

Expected [Skip] flag. Test result will be set to [Fail] if the test result is not [Skip] otherwise [OK].

## XOK

Cross out [OK] flag. Test result will be set to [XOK] if the test result is [OK].

## XFAIL

Cross out [Fail] flag. Test result will be set to [XFail] if the test result is [Fail].

## XERROR

Cross out [Error] flag. Test result will be set to [XError] if the test result is [Error].

## XNULL

Cross out [Null] flag. Test result will be set to [XNull] if the test result is [Null].

## FAIL_NOT_COUNTED

[Fail] not counted. [Fail] result will not be counted.

## ERROR_NOT_COUNTED

[Error] not counted. [Error] result will not be counted.

## NULL_NOT_COUNTED

[Null] not counted. [Null] result will not be counted.

## PAUSE_BEFORE

Pause before test execution.

## PAUSE

Pause before test execution short form. See [PAUSE_BEFORE].

## PAUSE_AFTER

Pause after test execution.

## PAUSE_ON_PASS

Pause after test execution on passing result.

## PAUSE_ON_FAIL

Pause after test execution on failing result.

## REPORT

Report flag. Mark test to be included for reporting.

## DOCUMENT

Document flag. Mark test to be included in the documentation.

## MANDATORY

Mandatory flag. Mark test as mandatory such that it can't be skipped.

## ASYNC

Asynchronous test flag. This flag is set for all asynchronous tests.

## PARALLEL

Parallel test flag. This flag is set if test is running in parallel.

## MANUAL

Manual test flag. This flag indicates that test is manual.

## AUTO

Automated test flag. This flag indicates that the test is automated
when parent test has [MANUAL] flag set.

## LAST_RETRY

Last retry flag. This flag is auto-set for the last retry iteration.
