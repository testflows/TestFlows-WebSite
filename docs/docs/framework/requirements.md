<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Working With Requirements

Requirements must be at the core of any enterprise QA process. There exist numerous proprietary and complex
systems for handling requirements. This complexity is usually not necessary,
and **{% testflows %}** provides a way to work with requirements just like with code
and leverage the same development tools to enable easy linking of requirements to your tests.

In general, when writing requirements, you should think about how they will be tested.
Requirements can either be high level or low level. High level
requirements are usually verified by [Feature]s or [Module]s and low level requirements
by individual [Test]s or [Scenario]s.

Writing untestable requirements is not very useful. Keep this in mind during
your software testing process.

> _When writing requirements, you should be thinking about tests or test suites that would verify them, and
> when writing tests or test suites, you should think about which requirements they will verify._

The ideal requirement to test a relationship is one-to-one. Where one requirement
is verified by one test. However, in practice, the relationship can be
one-to-many, many-to-one, and many-to-many, and **{% testflows %}** supports
all of these cases.

In many cases, don't be afraid to modify and restructure your requirements once you
start writing tests. It is natural to refactor requirements during test development
process that helps better align requirements to tests and vice versa.

> _Writing requirements is hard, but developing enterprise software without requirements
> is even harder._

## Requirement Documents

Working with requirements just like with code is very convenient, but it does not necessarily mean
that we need to write requirements as [Python] code.

Requirements form documents such as SRS (Software Requirements Specification)
where, in addition to the requirements, you might find additional sections
such as introductions, diagrams, references, etc. Therefore, the most
convenient way to define requirements is inside a document.

**{% testflows %}** allows you to write requirements as a [Markdown]
document that serves as the source of all the requirements. The document is the source
and is stored just like code in the source control repository such as [Git](https://git-scm.com/).
This allows the same process to be applied to requirements as to the code.
For example, you can use the same review process and the same tools. You also receive full
traceability of when and who defined the requirement and keep track of any changes
just like for your other source files.

For example, a simple requirements document in [Markdown] can be defined as follows.

> requirements.md
>
> ```markdown
# SRS001 `ls` Unix Command Utility
# Software Requirements Specification

## Introduction

This software requirements specification covers the behavior of the standard
Unix `ls` utility.

## Requirements

### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.
```

The above document serves as the source of all the requirements and can be
used to generate corresponding [Requirement class] objects that can be linked with tests
using `tfs requirements generate` command. See [Generating Requirements Objects](#Generating-Requirements-Objects).

Each requirement is defined as a heading that starts with `RQ.` prefix and contains
attributes such as `version`, `priority`, `group`, `type` and `uid` defined
on the following line, which must be followed by an empty line.

```markdown
### RQ.SRS001-CU.LS
version: 1.0
```

Only the `version` attribute is always required, and the others are optional.
The `version` attribute allows for tracking material changes to the requirement over
lifetime of the product and makes sure the tests get updated when a requirement has been
updated to a new version.

Any text found before the next section is considered to be the description of the requirement.

```markdown
### RQ.SRS001-CU.LS
version: 1.0

This is the first paragraph of the requirement description.

This is the second paragraph.
```

Here is an example where multiple requirements are defined.

```markdown
### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.

### RQ.SRS001-CU.LS.ListHiddenEntries
version: 1.0

The [ls](#ls) utility SHALL accept `-a, --all` option that SHALL cause the output
to list entries starting with `.` that SHALL be considered to be hidden.
```

> **{% attention %}** Except for the basic format to define the requirements described above,
> you can structure and organize the document in any way that is the most appropriate for
> your case.

Each requirement must be given a unique name. The most common convention
is to start with the SRS number as a prefix, followed by a dot separated
name. The `.` separator serves to implicitly group the requirements.
It is usually best to align these groups with the corresponding document sections.

For example, we can create `Options` section where we would add requirements
for the supported options. Then all the requirements in this section would have
`RQ.SRS001-CU.LS.Options.` prefix.


```markdown
### Options

#### RQ.SRS001-CU.LS.Options.ListHiddenEntries
version: 1.0
```

> **{% attention %}** Names are usually preferred over numbers to facilitate the movement of requirements between
> different parts of the document.

## Generating Requirement Objects

[Requirement class] objects can be auto generated from the [Markdown] requirements source files
using `tfs requirements generate` command.

```bash
tfs requirements generate -h
```
```bash
usage: tfs requirements generate [-h] [input] [output]

Generate requirements from an SRS document.

positional arguments:
  input       input file, default: stdin
  output      output file, default: stdout
```

For example, given `requirements.md` file having the following content.

> requirements.md
>
> ```markdown
# SRS001 `ls` Unix Command Utility
# Software Requirements Specification

## Introduction

This software requirements specification covers the behavior of the standard
Unix `ls` utility.

## Requirements

### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.
```

You can generate `requirements.py` file from it using the following command.

```bash
cat srs.md | tfs requirements generate > requirements.py
```

The `requirements.py` will have the following content.

```python
# These requirements were auto generated
# from software requirements specification (SRS)
# document by TestFlows v1.7.211105.1001849.
# Do not edit by hand but re-generate instead
# using 'tfs requirements generate' command.
from testflows.core import Specification
from testflows.core import Requirement

Heading = Specification.Heading

RQ_SRS001_CU_LS = Requirement(
    name='RQ.SRS001-CU.LS',
    version='1.0',
    priority=None,
    group=None,
    type=None,
    uid=None,
    description=(
        'The [ls](#ls) utility SHALL list the contents of a directory.\n'
        ),
    link=None,
    level=2,
    num='2.1')
...
```

For each requirement, a corresponding [Requirement class] object will be
defined in addition to the [Specification class] object that describes the
full requirements specification document.

```python
SRS001_ls_Unix_Command_Utility = Specification(
    name='SRS001 `ls` Unix Command Utility',
    description=None,
    ...
```

The objects defined in the `requirements.py` can now be imported into test
source files and used to link with tests.

## Linking Requirements

Once you have written your requirements in a [Markdown] document as described in [Requirements As Code](#Requirements-As-Code)
and have generated [Requirement class] objects from the requirements source file using `tfs requirements generate`
command as described in [Generating Requirements Objects](#Generating-Requirements-Objects)
you can link the requirements to any of the tests by either setting
[requirements](test-properties.md#requirements) attribute of the inline test or using [Requirements](test-properties.md#Requirements)
decorator for decorated tests.

For example,

```python
from requirements import RQ_SRS001_CU_LS

with Test("My test", requirements=[RQ_SRS001_CU_LS("1.0")] as test:
    note(test.requirements)
```

The `requirements` argument takes a list of requirements, so you can link
any number of requirements to a single test.

Instead of passing a list, you can also pass [Requirements] object directly as follows,

```python
from requirements import RQ_SRS001_CU_LS

with Test("My test", requirements=Requirements(RQ_SRS001_CU_LS("1.0")) as test:
    note(test.requirements)
```

where [Requirements] can be passed one or more requirements.

> **{% attention %}** Note that when linking requirements to test you should
> **always** call the requirement
> with the version that the test is verifying. If the version does not match
> the actual requirement version `RequirementError` exception will be raised.
> See [Test Requirements](test-properties.md#Test-Requirements).

For decorated tests, [Requirements] class can also act as a decorator.

For example,

```python
from requirements import RQ_SRS001_CU_LS

@TestScenario
@Requirements(
  RQ_SRS001_CU_LS("1.0")
)
def my_test(self):
    note(self.requirements)
```

## Linking Specifications

When generating requirements, in addition to the [Requirement class] objects created
for each requirement, a [Specification class] object is also generated that describes
the whole requirements specification document. This object can be
linked to higher level tests so that a coverage report can be easily calculated
for a specific test program run.

To link [Specification class] object to a test, either use
[specifications] parameter for inline tests or [Specifications] decorator
for decorated tests.

> **{% attention %}** Specifications are usually linked to higher level tests such as
> [Feature], [Suite], or [Module].

For example,

```python
from requirements import SRS001_ls_Unix_Command_Utility

with Module("regression", specifications=[SRS001_ls_Unix_Command_Utility]) as test:
   note(test.specifications)
```

One or more specifications can be linked.

Instead of passing a list, you can also pass [Specifications] object directly as follows,

```python
from requirements import SRS001_ls_Unix_Command_Utility

with Module("regression", specifications=Specifications(SRS001_ls_Unix_Command_Utility)) as test:
   note(test.specifications)
```

> **{% attention %}** Note that [Specification class] object call also be
> called with a specific version, just like [Requirement class] objects.

If a higher level test is defined using a decorated function, then you can use [Specifications]
decorator.

For example,

```python
from requirements import SRS001_ls_Unix_Command_Utility

@TestModule
@Specifications(
  SRS001_ls_Unix_Command_Utility
)
def regression(self):
    note(self.specifications)
```
