<!-- agents: TestFlows Framework docs, one part. Index: https://testflows.com/docs/framework.md . Names in [brackets] are links, defined in https://testflows.com/docs/framework/references.md -->

# Concepts

The framework was implemented with the following concepts and definitions in mind.
These definitions were used as a guideline to implement the test [Tree](#Tree-is) hierarchy.
While the implementation does not strictly enforce these concepts, users are encouraged
to apply these definitions during the design of their tests.

## Everything is a Test

The framework treats everything as a test, including setup and teardown.

## Definitions

### Test is

something that produces a result.

### Flow is

a specific order of execution of [Tests](#Test-is)

### Tree is

a rooted tree graph that results from the execution of a [Flow](#Flow-is)

### Step is

is a lowest level [Test](#Test-is)

### Case is

a [Test](#Test-is) that is made up of one or more [Steps](#Step-is)

### Suite is

is a [Test](#Test-is) that is made up of one or more [Cases](#Case-is)

### Module is

a [Test](#Test-is) that is made up of one or more [Suites](#Suite-is)

# Types

The framework divides tests into the following [Types] from highest to the lowest

* [Module]
* [Suite]
* [Test]
* [Step]

Children of each [Type] must be of the same [Type] or lower.

# Sub-Types

The framework uses the following [Sub-Types] in order to provide more flexibility and implement specialized keywords

* [Feature]
* [Scenario]
* [Example]
* [Check]
* [Critical]
* [Major]
* [Minor]
* [Background]
* [Given]
* [When]
* [Then]
* [And]
* [But]
* [By]
* [Finally]
* [Sketch] (special)
* [Combination] (special)
* [Outline] (special)
* [Iteration] (special)
* [RetryIteration] (special)

# Sub-Types Mapping

The [Sub-Types] have the following mapping to the core four [Types]

* [Module]
* [Suite]
  * [Feature]
* [Test]
  * [Scenario]
  * [Check]
  * [Critical]
  * [Major]
  * [Minor]
  * [Example]
* [Step]
  * [Given]
  * [When]
  * [Then]
  * [But]
  * [By]
  * [Finally]
  * [Background]

The following special types can be applied to any of the core four [Types]

* [Outline] (special)
* [Sketch] (special)
* [Combination] (special)
* [Iteration] (special)
* [RetryIteration] (special)
