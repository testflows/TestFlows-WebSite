<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Logs

The framework produces [LZMA] compressed logs that contains [JSON] encoded messages. For example,
<br>
<br>

```json
{"message_keyword":"TEST","message_hash":"ccd1ad1f","message_object":1,"message_num":2,"message_stream":null,"message_level":1,"message_time":1593887847.045375,"message_rtime":0.001051,"test_type":"Test","test_subtype":null,"test_id":"/68b96288-be25-11ea-8e14-2477034de0ec","test_name":"/My test","test_flags":0,"test_cflags":0,"test_level":1,"test_uid":null,"test_description":null}
```

Each message is a [JSON] object. Object fields depend on the type of message that is specified by the `message_keyword`.

Logs can be decompressed using either the standard `xzcat` utility

```bash
xzcat test.log
```

or `tfs transform decompress` command

```bash
cat test.log | tfs transform decompress
```

## Saving Log File

Test log can be saved into a file by specifying `-l` or `--log` option when running the test. For example,

```bash
python3 test.py --log test.log
```

## Transforming Logs

Test logs can be transformed using `tfs transform` command. See `tfs transform --help`
for a detailed list of available transformations.

### nice

The `tfs transform nice` command can be used to transform test log into a `nice` output format which the default output
used for the `stdout`.

For example,

```bash
cat test.log | tfs transform nice
```
```bash
Jul 04,2020 19:20:21   ⟥  Module filters
Jul 04,2020 19:20:21     ⟥  Scenario test_0
Jul 04,2020 19:20:21       ⟥  Step first step
               596us       ⟥⟤ OK first step, /filters/test_0/first step
                 1ms     ⟥⟤ OK test_0, /filters/test_0
Jul 04,2020 19:20:21     ⟥  Suite suite 0
...
```

### short

The `tfs transform short` command can be used to transform test log into a `short` output format that contains test procedures
and test results.

For example,

```bash
cat test.log | tfs transform short
```
```bash
Module filters
  Scenario test_0
    Step first step
    OK
  OK
  Suite suite 0
...
```

### slick

The `tfs transform slick` command can be used to transform test log into a `slick` output format that contains only test names
with results provided as icons in front of the test name. This output format is very concise.

For example,

```bash
cat test.log | tfs transform slick
```
```bash
➤ Module filters
  ✔ Scenario test_0
  ➤ Suite suite 0
...
```
### dots

The `tfs transform dots` command can be used to transform test log into a `dots` output format, which outputs dots
for each executed test.

For example,

```bash
cat test.log | tfs transform dots
```
```bash
.........................
```

### raw

The `tfs transform raw` command can be used to transform a test log into a `raw` output format that contains raw [JSON]
messages.

For example,

```bash
cat test.log | tfs transform raw
```
```bash
{"message_keyword":"PROTOCOL","message_hash":"489eeba5","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1593904821.784232,"message_rtime":0.001027,"test_type":"Module","test_subtype":null,"test_id":"/ee772b86-be4c-11ea-8e14-2477034de0ec","test_name":"/filters","test_flags":0,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
...
```

### compact

The `tfs transform compact` command can be used to transform a test log into a `compact` format that only contains
raw [JSON] test definition and result messages while omitting all messages for the steps.
It is used to create compact test logs used for comparison reports.

### compress

The `tfs transform compress` command is used to compress a test log with [LZMA] compression algorithm.

### decompress

The `tfs transform decompress` command is used to decompress a test log compressed with [LZMA] compression algorithm.

# Creating Reports

Test logs can be used to create reports using `tfs report` command. See `tfs report --help` for a list of available reports.

## Results Report

A results report can be generated from a test log using `tfs report results` command.
The report can be generated in either [Markdown] format (default) or [JSON] format
by specifying `--format json` option.
The report in [Markdown] can be converted to [HTML] using `tfs document convert` command.

```bash
Generate results report.

positional arguments:
  input                      input log, default: stdin
  output                     output file, default: stdout

optional arguments:
  -h, --help                 show this help message and exit
  -a link, --artifacts link  link to the artifacts
  --format type              output format choices: 'md', 'json', default: md (Markdown)
  --copyright name           add copyright notice
  --confidential             mark as confidential
  --logo path                use logo image (.png)
  --title name               custom title
```

For example,

```bash
cat test.log | tfs report results | tfs document convert > report.html
```

## Coverage Report

Requirements coverage report can be generated from a test log using `tfs report coverage` command. The report is created in [Markdown]
and can be converted to [HTML] using `tfs document convert` command. For example,

```bash
Generate requirements coverage report.

positional arguments:
  requirements                requirements source file, default: '-' (from input log)
  input                       input log, default: stdin
  output                      output file, default: stdout

optional arguments:
  -h, --help                  show this help message and exit
  --show status [status ...]  verification status. Choices: 'satisfied', 'unsatisfied', 'untested'
  --input-link attribute      attribute that is used as a link to the input log, default: job.url
  --format type               output format, default: md (Markdown)
  --copyright name            add copyright notice
  --confidential              mark as confidential
  --logo path                 use logo image (.png)
  --title name                custom title
  --only name [name ...]      name of one or more specifications for which to generate coverage
                              report, default: include all specifications. Only a unique part of the
                              name can be specified.
```

For example,

```bash
cat test.log | tfs report coverage requirements.py | tfs document convert > coverage.html
```

## Metrics Report

You can generate metrics report using `tfs report metrics` command.

```bash
Generate metrics report.

positional arguments:
  input          input log, default: stdin
  output         output file, default: stdout

optional arguments:
  -h, --help     show this help message and exit
  --format type  output format choices: 'openmetrics', 'csv' default: openmetrics
```

## Comparison Reports

A comparison report can be generated using one of the `tfs report compare` commands.

```bash
Generate comparison report between runs.

optional arguments:
  -h, --help  show this help message and exit

commands:
  command
    results   results report
    metrics   metrics report
```

### Compare Results

A results comparison report can be generated using `tfs report compare results` command.

```bash
Generate results comparison report.

positional arguments:
  output                        output file, default: stdout

optional arguments:
  -h, --help                    show this help message and exit
  --log pattern [pattern ...]   log file pattern
  --log-link attribute          attribute that is used as a link for the log, default: job.url
  --only pattern [pattern ...]  compare only selected tests
  --order-by attribute          attribute that is used to order the logs
  --sort direction              sort direction. Either 'asc' or 'desc', default: asc
  --format type                 output format, default: md (Markdown)
  --copyright name              add copyright notice
  --confidential                mark as confidential
  --logo path                   use logo image (.png)
```

### Compare Metrics

A metrics comparison report can be generated using `tfs report compare metrics` command.

```bash
Generate metrics comparison report.

positional arguments:
  output                        output file, default: stdout

optional arguments:
  -h, --help                    show this help message and exit
  --log pattern [pattern ...]   log file pattern
  --log-link attribute          attribute that is used as a link for the log, default: job.url
  --only pattern [pattern ...]  compare only selected tests
  --order-by attribute          attribute that is used to order the logs
  --sort direction              sort direction. Either 'asc' or 'desc', default: asc
  --format type                 output format, default: md (Markdown)
  --copyright name              add copyright notice
  --confidential                mark as confidential
  --logo path                   use logo image (.png)
  --name name [name ...]        metrics name, default: test-time
```

## Specification Report

A test specification for the test run can be generated using `tfs report specification` command.

```bash
Generate specifiction report.

positional arguments:
  input             input log, default: stdin
  output            output file, default: stdout

optional arguments:
  -h, --help        show this help message and exit
  --copyright name  add copyright notice
  --confidential    mark as confidential
  --logo path       use logo image (.png)
  --title name      custom title
```

# Test Results

Any given test will have one of the following results.

## OK

Test has passed.

## Fail

Test has failed.

## Error

Test produced an error.

## Null

Test result was not set.

## Skip

Test was skipped.

## XOK

[OK] result was crossed out. Result is considered as passing.

## XFail

[Fail] result was crossed out. Result is considered as passing.

## XError

[Error] result was crossed out. Result is considered as passing.

## XNull

[Null] result was crossed out. Result is considred as passing.
