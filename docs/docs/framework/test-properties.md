<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Test Flags

You can set the [Test Flags](#Test-Flags) of any test either by setting the [flags] parameter of the inline test
or using the [Flags] decorator if the test is defined as a decorated function.
The flags of the test can be accessed using the `flags` attribute of the test.

## flags

The [flags] parameter of the test can be use used to set the [flags] of any inline test. The [flags] parameter
must be passed valid flag or multiple flags combined with binary `OR` opertor.

For example,

```python
with Test("My test", flags=TE) as test:
    note(test.flags)
```

## Flags

A [Flags] decorator can be used to set the [flags] of any test that is defined using a decorated function.

For example,

```python
@TestScenario
@Flags(TE)
def scenario(self):
    note(self.flags)
```

# Test Tags

You can add `tags` to any test either by setting [tags] parameter of the inline test
or using [Tags] decorator if the test is defined as a decorated function. The values of the tags can be accessed
using the `tags` attribute of the test.

## tags

The [tags] parameter of the test can be used to set [tags] of any inline test. The [tags] parameter
can be passed either a `list`, `tuple` or a `set` of tag values. For example,

```python
with Test("My test", tags=("tagA", "tagB")) as test:
    note(test.tags)
```
## Tags

A [Tags] decorator can be used to set [tags] of any test that is defined used a decorated function. For example,

```python
@TestScenario
@Tags("tagA", "tagB")
def scenario(self):
    note(self.tags)
```

# Test Attributes

You can add `attributes` to any test either by setting [attributes] parameter of the inline test
or by using [Attributes] decorator if the test is defined as a decorated function. The values of the attributes can be accessed
using the `attributes` attribute of the test.

## attributes

The [attributes] parameter of the test can be used to set [attributes] of any inline test. The [attributes] parameter
can be passed either a `list` of `(name, value)` tuples or `Attribute` class instances. For example,

```python
with Test("My test", attributes=[("attr0", "value"), Attribute("attr1", "value")] as test:
    note(test.attributes)
```

## Attributes

An [Attributes] decorator can be used to set [attributes] of any test that is defined used a decorated function. For example,

```python
@TestScenario
@Attributes(
    ("attr0", "value"),
    Attribute("attr1", "value")
)
def scenario(self):
    note(self.attributes)
```

# Test Requirements

You can add `requirements` to any test either by setting [requirements] parameter of the inline test
or by using [Requirements] decorator if the test is defined as a decorated function. The values of the requirements can be accessed
using the `requirements` attribute of the test.

> **{% attention %}** `Requirement` class instances must always be called with the version number the test is expected to verify.
> `RequirementError` exception will be raised if version does not match the version of the instance.

## requirements

The [requirements] parameter of the test can be used to set `requirements` of any inline test. The [requirements] parameter
must be passed a `list` of called `Requirement` instances. of the inline test
or using [Requirements] decorator if the test is defined as a decorated function. The values of the requirements can be accessed
using the `requirements` attribute of the test.

For example,

```python

RQ1 = Requirement("RQ1", version="1.0")

with Test("My test", requirements=[RQ1("1.0")] as test:
    note(test.requirements)
```

## Requirements

A [Requirements] decorator can be used to set `requirements` attribute of any test that is defined using a decorated function.
The decorator must be called with one or more called `Requirement` instances. For example,

```python
RQ1 = Requirement("RQ1", version="1.0")

@TestScenario
@Requirements(
    RQ1("1.0")
)
def scenario(self):
    note(self.requirements)
```

# Test Specifications

You can add `specifications` to higher level tests either by setting [specifications] parameter of the inline test
or using [Specifications] decorator if the test is defined as a decorated function. The values of the specifications can be accessed
using the `specifications` attribute of the test.

> **{% attention %}** [Specification class] instances may be called with the version number the test is expected to verify.
> `SpecificationError` exception will be raised if the version does not match the version of the instance.

## specifications

The [specifications] parameter of the test can be used to set `specifications` of any inline test. The [specifications] parameter
must be passed a `list` of [Specification class] object instances for the inline tests
or using [Specifications] decorator if the test is defined as a decorated function. The values of the specifications can be accessed
using the `specifications` attribute of the test.

For example,

```python
from requirements import SRS001

with Test("My test", specifications=[SRS001] as test:
    note(test.specifications)
```

## Specifications

A [Specifications] decorator can be used to set `specifications` attribute of a higher level test that is defined using a decorated function.
The decorator must be called with one or more [Specification class] object instances. For example,

```python
from requirements import SRS001

@TestFeature
@Specifications(
    SRS001
)
def feature(self):
    note(self.specifications)
```

# Test Examples

You can add `examples` to any test by setting [examples] parameter of the inline test
or using [Examples] decorator if the test is defined as a decorated function. The examples can be accessed
using the `examples` attribute of the test.

## examples

The [examples] parameter of the test can be used to set `examples` of any inline test. The [examples] parameter
must be passed a table of examples, which can be defined using `Examples` class for an inline test
or using the same [Examples] class as a decorator if the test is defined as a decorated function.
The rows of the examples table can be accessed
using the `examples` attribute of the test.

> **{% attention %}** Usually, examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
with Test("My test", examples=Examples("col0 col1", [("col0_row0", "col1_row0"), ("col0_row1", "col1_row1")])) as test:
    for example in test.examples:
        note(str(example))
```

## Examples

An [Examples] decorator can be used to set `examples` attribute of any test that is defined using a decorated function
or used as an argument of the `examples` parameter for the test.
The [Examples] class defines a table of examples and should be passed a `header` and a `list` for the `rows`.

> **{% attention %}** Usually, examples are used only with test outlines. Please see [Outline] for more details.

For example,

```python
@TestScenario
@Examples("col0 col1", rows=[
    ("col0_row0", "col1_row0"),
    ("col0_row1", "col1_row1")
])
def scenario(self):
    for example in self.examples:
        note(str(example))
```
