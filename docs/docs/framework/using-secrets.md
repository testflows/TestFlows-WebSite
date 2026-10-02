<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Using Secrets

Secrets are values that you would like to hide in your test logs, for example, passwords,
authentication keys, or even usernames, etc.
In **{% testflows %}**, a secret can be defined using [Secret class].

```python
Secret(name, type=None, group=None, uid=None)
```

where

* `name` is a unique name of the secret
* `type` secret type (optional)
* `group` secret group (optional)
* `uid` secret unique identifier (optional)

When creating a secret, only the `name` is required, the other arguments `type`,
`group`, `uid`, are optional.

The name must be a valid regex group name as defined by Python's [re] module.
For example, no spaces or dashes are allowed in the name, you must use underscores instead.

```python
# secret = Secret("my secret")("my secret value") # invalid, empty spaces not allowed
secret = Secret("my_secret")("my secret value") # valid
```

If a name is invalid, you will see an exception as follows,

```bash
16ms   ⟥    Exception: Traceback (most recent call last):
              File "/using_secrets.py", line 4, in <module>
                secret = Secret("my secret")("my secret value")
              ValueError: invalid secret name, bad character in 'my secret' at position 4
```

Here is an example of how to create and use secrets,

```python
from testflows.core import *

with Scenario("using secrets"):
    secret = Secret("mysecret")("my secret value")
    note(f"my secret is: {secret}")
    note(f"my secret value is: {secret.value}")
```

```bash
Mar 03,2022 11:22:01   ⟥  Scenario using secrets
                 3ms   ⟥    [note] my secret is: Secret(name='mysecret')
                 3ms   ⟥    [note] [masked]:Secret(name='mysecret') is: [masked]:Secret(name='mysecret')
                 3ms   ⟥⟤ OK using secrets, /using secrets
```

Secret values are only filtered by **{% testflows %}** in messages added to the test by [message() function],
[note() function], [debug() function], [trace() function] and messages in results.

If you need to create multiple secrets, the names of each secret must be unique
otherwise, you will get an error.

```bash
Mar 24,2022 9:54:46    ⟥  Scenario using secrets
                4ms    ⟥    Exception: Traceback (most recent call last):
                                File "/Using_Secrets.py", line 11, in <module>
                                  secret2 = Secret("mysecret")("[masked]:Secret(name='mysecret')")
                              ValueError: secret 'mysecret' already registered
```

Here is an example of creating multiple secrets,

```python
with Scenario("using secrets"):
    secret1 = Secret("mysecret1")("my secret value 1")
    secret2 = Secret("mysecret2")("my secret value 2")
```

Note, that multiple secrets can have the same secret value. For example,

```python
with Scenario("using secrets"):
    secret1 = Secret("mysecret1")("the same secret value")
    secret2 = Secret("mysecret2")("the same secret value")
```

## Secrets in Argument Parser

You can easily use secrets in the Argument Parser by setting `type` of
the argument to the [Secret class] object.

For example,

```python
def argparser(parser):
    parser.add_argument("--arg0",
        type=Secret("arg0"), help="argument0")
    parser.add_argument("--arg1",
        type=Secret("arg1"), help="argument1")

@TestModule
@ArgumentParser(argparser)
def regression(self, arg0, arg1):
    note(f"{arg0} {arg1}")
```
