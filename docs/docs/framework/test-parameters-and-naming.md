<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test Parameters

Test parameters can be used to set attributes of a test. Here is a list of most common
parameters for a test:

> **{% attention %}** Test parameters are used to set attributes of a test.
> Not to be confused with the [attributes] which is just one of the attributes of the test (object),
> that can be specified using the `attributes` parameter when calling or creating a test.

* [name]
* [flags]
* uid
* [tags]
* [attributes]
* [requirements]
* [examples]
* description
* [xargs]
* [xfails]
* [xflags]
* [ffails]
* [repeats]
* [retries]
* [timeouts]
* only
* skip
* start
* end
* only_tags
* skip_tags
* random
* limit
* [args](#Args-Parameter)

> **{% attention %}** Most parameter names match the names of the attributes of the test which they set.
> For example, [name] parameter sets the `name` attribute of the test.

> **{% attention %}** Note that the [Args] decorator can be used to set values of any parameter of the test. However,
> many parameters have corresponding dedicated decorators available to be used instead.

When test is defined inline then parameters can be set right when a test definition class is instantiated.
The first parameter is always `name` which sets the name of the test. The other parameters are usually
specified using keyword arguments.

For example,

```python
with Scenario("My test", description="This is a description of an inline test"):
    pass
```

# Test Arguments

## args

The `args` parameter is used to set the arguments of the test.

> **{% attention %}** Do not confuse the `args` parameter with the [Args] decorator. See the [Args] decorator for more details.

```python
@TestScenario
@Args(args={"arg0": 1, "arg1": 2})
def scenario(self, arg0, arg1):
    note(f"Hello from my test! You passed arg0={arg0}, arg1={arg1}")
```

If test arguments are passed during the test call, then they will overwrite the `args`.
For example,

```python
@TestScenario
@Args(args={"arg0": 1, "arg1": 2})
def scenario(self, arg0, arg1):
    note(f"Hello from my test! You passed arg0={arg0}, arg1={arg1}")

with Suite("my suite"):
    Scenario(test=scenario)(arg0="a", arg1="b")
```

## Args

The [Args class] can be used as a decorator to set any parameters of the test.
This is especially useful when there is no dedicated decorator available for the
parameter.

Each test parameter can be specified using a corresponding keyword argument.

```python
@Args(name=..., tags=..., flags=..., ...)
```

For example, the [Name] decorator can be used to set the [name] parameter of the test,
however, the same can be done using the [Args] decorator.

```python
@TestScenario
@Args(name="custom test name")
def scenario(self):
    note("Hello from my test!")
```

It can also be used to specify default values of test arguments by setting the `args` parameter
to a dictionary where the `key` is the argument name and the `value` is the argument's value.

```python
@TestScenario
@Args(args={"number": 2})
def scenario(self, number):
    note(f"Hello from my test! You passed me number {number}")
```

# Naming Tests

You can set the name of any test either by setting the [name] parameter of the inline test
or using the [Name] decorator if the test is defined as a decorated function.
The name of the test can be accessed using the `name` attribute of the test.

## Restricted Characters

> **{% attention %}** New behaviour starting with version >= `2.3.11`

{% testflows %}, by default, allows any character to be used in test names. However, some characters
are considered restricted. Specifically, the following ASCII characters `/"'$\[]*?:!.^+{}|()`
are restricted and, in general, are not recommended to be used in
test names as they cause conflicts when used in bash, regex, or name [pattern]s.

If the test program is launched with the `--strict-names` option, then the `NameError` exception is raised
for any test whose name contains one or more restricted character.

When test program is executed without the `--strict-names` option, {% testflows %} will
automatically convert restricted characters to their UTF-8 replacements according to the following table:

{% html div class="styled-table compact" %}

| Restricted Character | Replacement Code | Replacement Rendered | Replacement Description | Replacement Reason |
| :---: |:---: | :---: | :---: | :---: |
| `/` | U+2215   | `∕`  | DIVISION SLASH           | path separator |
| `"` | U+FF02   | `＂` | FULLWIDTH QUOTATION MARK | bash |
| `'` | U+FF07   | `＇`  | FULLWIDTH APOSTROPHE | bash |
| `$` | U+FE69   | `﹩` | SMALL DOLLAR SIGN | bash / regex
| `\` | U+FE68   | `﹨` | SMALL REVERSE SOLIDUS | bash |
| `[` | U+FF3B   | `［` | FULLWIDTH LEFT SQUARE BRACKET | pattern / regex |
| `]` | U+FF3D   | `］` | FULLWIDTH RIGHT SQUARE BRACKET | pattern / regex |
| `*` | U+FF0A   | `＊` | FULLWIDTH ASTERISK | pattern / regex |
| `?` | U+FE16   | `︖` | PRESENTATION FORM FOR VERTICAL QUESTION MARK | pattern / regex |
| `:` | U+FE55   | `﹕` | SMALL COLON | pattern |
| `!` | U+FE15   | `︕` | PRESENTATION FORM FOR VERTICAL EXCLAMATION MARK | bash |
| `.` | U+2024   | `․` | ONE DOT LEADER | regex |
| `^` | U+02C4   | `˄` | MODIFIED LETTER UP ARROWHEAD | regex |
| `+` | U+FF0B   | `＋` | FULLWIDTH PLUS SIGN | regex |
| `{` | U+FF5B   | `｛` | FULLWIDTH LEFT CURLY BRACKET | regex |
| `}` | U+FF5D   | `｝` | FULLWIDTH RIGHT CURLY BRACKET | regex |
| `\|` | U+2160   | `Ⅰ` | ROMAN NUMERAL ONE |regex |
| `(` | U+FF08   | `（` | FULLWIDTH LEFT PARENTHESIS | regex |
| `)` | U+FF09   | `）` | FULLWIDTH RIGHT PARENTHESIS | regex |

{% endhtml %}

For example,

```python
from testflows.core import *

with Test("/\"'$\[]*?:!.^+{}|()"):
     pass
```

```bash
$ python3 test.py
Jun 27,2024 17:38:31   ⟥  Test ∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（）
                 2ms   ⟥⟤ OK ∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（）, /∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（）

Passing

✔ [ OK ] '/∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（）' (2ms)

1 test (1 ok)
```

The test name `"/"'$\[]*?:!.^+{}|()"` will be converted to `∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（`.

Even though the original test name contained characters that were conflicting with [pattern]
special symbols, because of the replacements, you can easily copy-paste the name for the [--only] option without
worrying about any special character escaping and just adding the `/*` at the end.

```bash
$ python3 test.py --only '/∕＂＇﹩﹨［］＊︖﹕︕․˄＋｛｝Ⅰ（）/*'
```

Executing the same test program with the `--strict-names` option will result in an error.

```bash
$ python3 test.py --strict-names
NameError: test name '/"'$\[]*?:!.^+{}|()' has restricted characters '/"'$\[]*?:!.^+{}|()'
```

### Using clean()

The [clean() function], from the `testflows.core.name` module, can be used to convert restricted characters to their UTF-8 replacements.
This is needed, for example, when using test names that contain restricted characters in [xfails].

```python
from testflows.core import *
from testflows.core.name import clean

@TestFeature
@XFails({
   f"my{clean('.')}test": [(Fail, "expected fail")],
})
def feature(self):
    Scenario("my.test", run=my_test)
```

You can also skip the explicit `testflows.core.name` import and use the default `name.clean` reference.

```python
from testflows.core import *

@TestFeature
@XFails({
   f"my{name.clean('.')}test": [(Fail, "expected fail")],
})
def feature(self):
    Scenario("my.test", run=my_test)
```

### Using strict mode

Use the [--strict-names] test program option to force the strict names mode which disallows using any restricted characters
in the test names. Any test whose name contains one or more restricted characters will cause a `NameError` exception to be raised.

```python
from testflows.core import *

with Test("/\"'$\[]*?:!.^+{}|()"):
     pass
```

```bash
$ python3 test.py --strict-names
NameError: test name '/"'$\[]*?:!.^+{}|()' has restricted characters '/"'$\[]*?:!.^+{}|()'
```

## name

The [name] parameter of the test can be use used to set the [name] of any inline test. The [name] parameter
must be passed a `str` which will define the name of the test.

> **{% attention %}** For all test definition classes the first parameter is always the [name].

For example,

```python
with Test("My test") as test:
    note(test.name)
```

## Name

A [Name] decorator can be used to set the [name] of any test that is defined using a decorated function.

> **{% attention %}** The name of test defined using a decorated function
> is set to the name of the function if the [Name] decorator is not used.

For example,

```python
@TestScenario
@Name("The name of the scenario")
def scenario(self):
    note(self.name)
```

or if the [Name] decorator is not used

> **{% attention %}** Note that any underscores will be replaced with spaces in the name of the test.

```python
@TestScenario
def the_name_of_the_scenario(self):
    note(self.name)
```
