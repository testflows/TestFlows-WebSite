<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Using YML Config Files

All the test programs have a common optional `--config` argument that allows you to
specify one or more configuration files in [YML](https://yaml.org/) format.
The configuration files can be used to specify either common test program arguments
such as [--no-colors], [--output], etc. as well as custom
[Command Line Arguments](command-line-and-filtering.md#Command-Line-Arguments) that were added using
[argparser](command-line-and-filtering.md#argparser) parameter.

> *{% attention %}* Technically [YML] files should always start with `---`
> to indicate the start of a new document. However, in *{% testflows %}* configuration
> files, you can omit them.

## Test Run Arguments

Common test run arguments such as [--no-colors], [--output], etc. must be specified
in the `test run:` section of the [YML] configuration file.

For example,

> `test.py`
>
> ```python
from testflows.core import *

with Scenario("my test"):
    pass
```

can be called with the following [YML] config file to set [--output] and [--no-colors]
options for the test program to run.

> `config.yml`
>
> ```yml
test run:
  no-colors: true
  output: progress
```

> {% attention %} Names of the common test run arguments have the same names as the corresponding
> command line option, without the `--` prefix.
>
> For example,
>  *  `--no-colors` is `no-colors:`
>  *  `--output` is `output:`
>  *  `--show-skipped` is `show-skipped:`

If you run `test.py` and apply the above `config.yml` you will see that the output format
for the test run will be set to `progress` and no terminal color highlighting will be applied
to the output.

```bash
python3 test.py --config config.yml
```
```bash
Executed 1 test (1 ok)

Passing

✔ [ OK ] /my test

1 scenario (1 ok)
```

## Custom Arguments

Test program custom [Command Line Arguments](command-line-and-filtering.md#Command-Line-Arguments) that are added using
[argparser](command-line-and-filtering.md#argparser) parameter can be specified at the top level of [YML] configuration file.

> {% attention %} Names of the custom options have the same names as the corresponding
> command line option without the `--` prefix.
>
> For example,
> *  `--custom-arg` is `custom-colors:`
> *  `--build` is `build:`

For example,

> `test.py`
>
> ```python
from testflows.core import *

def argparser(parser):
    parser.add_argument("--custom-arg", type=str, help="my custom test program argument")

with Scenario("my test", argparser=argparser):
    pass
```

and if you have the following configuration file

> `config.yml`
>
> ```yml
custom-arg: hello there
```

and apply it when running `test.py` then you will see that `custom-arg` value
will be set to the one you've specified in the `config.yml`.

```bash
python3 test.py -c config.yml
```
```bash
Sep 24,2021 21:40:52   ⟥  Scenario my test
                            Attributes
                              custom-arg
                                hello there
                 3ms   ⟥⟤ OK my test, /my test
```

## Applying Multiple YML Files

If more than one [YML] configuration file is specified on the command line,
the configuration files are then applied in the order specified, from left to right
as specified on the command line, with the right most file having the highest precedence.

For example,

> `config1.yml`
>
> ```yml
custom-arg: hello here
```

> `config2.yml`
>
> ```yml
custom-arg: hello there
```

```bash
python3 test.py -c config1.yml -c config2.yml
```
```bash
Sep 24,2021 21:48:47   ⟥  Scenario my test
                            Attributes
                              custom-arg
                                hello there
                 4ms   ⟥⟤ OK my test, /my test
```
