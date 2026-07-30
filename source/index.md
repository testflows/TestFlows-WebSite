---
layout: index
---

{% html div class="container-fluid p-0" style="overflow-x: clip" %}

{% html div class="banner in-view-watcher" %}
{% html div class="container banner-inner" %}
{% html div class="row align-items-center" %}

{% html div class="col-lg-6 banner-visual" %}
<div class="banner-sphere" aria-hidden="true"></div>
{% endhtml %}

{% html div class="col-lg-6 banner-text" %}
# Not a typical framework

A Python library for **testing as code** — write full test programs with dynamic flow, parallel execution, and combinatorial coverage.

<a class="btn banner-cta" href="https://pypi.org/project/testflows/">pip3 install testflows</a>

{% html div class="banner-links" %}
<a href="https://pypi.org/project/testflows/" aria-label="PyPI"><span class="fab fa-python"></span></a>
<a href="https://www.linkedin.com/company/testflows-com-open-source-testing-framework/" aria-label="LinkedIn"><span class="fab fa-linkedin"></span></a>
<a href="https://x.com/TestFlowsOSTF" aria-label="X"><span class="fab fa-x-twitter"></span></a>
<a href="https://github.com/testflows" aria-label="GitHub"><span class="fab fa-github"></span></a>
{% endhtml %}
{% endhtml %}

{% endhtml %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="index-start" %}
{% html div class="container" %}

<h2>Write your first test program</h2>

{% html div class="row" %}

{% html div class="col-md-4 text-center index-start-aside" %}
<div class="index-start-icon" aria-hidden="true"><i class="fas fa-4x fa-pencil-alt"></i></div>
Write a simple test.
{% endhtml %}

{% html div class="col-md-8" %}
{% codeblock lang:python line_number:false highlight:true %}
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
{% endcodeblock %}
{% endhtml %}
{% endhtml %}

<h2>Then execute it</h2>

{% html div class="row" %}

{% html div class="col-md-4 text-center index-start-aside" %}
<div class="index-start-icon" aria-hidden="true"><i class="fas fa-5x fa-running"></i></div>
Then execute it.
{% endhtml %}

{% html div class="col-md-8" %}
{% codeblock lang:shell line_number:false highlight:true %}
$ python3 ./test.py
Nov 20,2019 16:42:00   ⟥  Scenario Hello TestFlows
                 2ms   ⟥⟤ OK Hello TestFlows, /Hello TestFlows

Passing

✔ [ OK ] /Hello TestFlows

1 scenario (1 ok)

Total time 2ms

Executed on Nov 20,2019 16:42
TestFlows.com Open-Source Software Testing Framework v1.3.191112.1234833
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **Test Programs Not Just Tests**
## write full test programs that
## combine tests with their flow
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}
{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Use `if`, `for`, or `while` statements for ultimate test flow flexibility
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
@TestSuite
def suite(self):
    if (condition):
        Test(run=test_1)
    for i in range(3):
        Test(f"test_2-{i}", run=test_2)
    while True:
        if Test(run=test_3) != OK:
            continue
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Self-Documenting Tests**
## break your tests into steps
## without leaving Python
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Use `Given`, `When`, `Then`, and more when and where you need it
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
@TestScenario
def scenario(self):
    with Given("I have something"):
        pass
    with When("I do something"):
        pass
    with Then("I expect something"):
        pass
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **Combinatorial Tests**
## exhaustive testing or get covered with covering arrays
## all-pairs, n-wise, and pairwise testing made easy
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}
{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Using a `CoveringArray` with `strength=2` or more
## for pairwise or greater coverage
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
from testflows.combinatorics import CoveringArray

@TestScenario
def check_basic_operations(self):
    for i, combination in enumerate(
        CoveringArray({
            "press_a": [0, 1, 2, -1, -2],
            "operation": ['+','-','*','/'],
            "press_b": [0, 1, 2, -1, -2],
        }, strength=2)
    ):
        with Combination(f"pattern #{i}"):
            check_basic_operation(combination=combination.values())
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Asynchronous Tests**
## take advantage of asynchronous programming
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Using `asyncio` with `async def` and `async with`
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
import asyncio
from testflows.core import *

@TestSuite
async def suite(self):
    async with Test("my async test"):
        async with Step("my async test step"):
            note("Hello from asyncio!")

with Module("regression"):
    Suite(run=suite)
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **Parallel Tests**
## author parallel tests or
## run your tests in parallel
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Specify `parallel` and sync with `join`
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
with Feature("my feature"):
    Scenario(run=my_test1, parallel=True)
    Scenario(run=my_test2, parallel=True)
    join()
    Scenario(run=my_test3, parallel=True)
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Semi-Automated and Manual Tests**
## seamlessly work with automated
## semi-automated and manual tests
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Mix and match different test types in the same test flow
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
with Scenario("semi-automated scenario"):
    with Given("automated setup"):
        pass
    with When("manual action", flags=MANUAL):
        pass

with Scenario("manual scenario", flags=MANUAL):
    with Given("manual setup"):
        pass
    with When("manual action"):
        pass
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **Testing Documentation**
## automate your documentation
## and keep it up to date
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Write executable documentation by mixing Markdown and Python code using `testflows.texts`
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
<div>
<pre># Welcome to TestFlows Texts<br>
```python:testflows
# any Python code
<span class="keyword">text</span>("Add this string to my Markdown document"
     "from this Python code block")
```</pre>
</div>
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Professional Reports**
## right at your fingertips
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-6" %}
## <br>
## Requirements Coverage Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report coverage requirements.py
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/coverage.png" alt="Requirements Coverage Report" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Requirements Traceability Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report traceability
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/traceability.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
## <br>
{% html div class="col-md-6" %}
## <br>
## Results Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report results
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/results.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Specification Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report specification
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/specification.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-6" %}
## <br>
## Results Comparison Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>tfs report compare results --log *.log
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/compare-results.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Metrics Comparison Report
<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>tfs report compare metrics --log *.log
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/compare-metrics.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **Write and Work with Requirements**
## in a straightforward and convenient way
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Write requirements in Markdown document
# <br>
{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:markdown line_number:true highlight:true first_line:1 %}
# SRS001 Software Requirements Specification

## Requirements

### Generic

### RQ.SRS001-CU.LS
version: 1.0

The [ls](#ls) utility SHALL list the contents of a directory.
{% endcodeblock %}

{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Convert & use in tests
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat requirements.md | tfs requirements generate > requirements.py
    </div>
</div>

{% endhtml %}
{% html div class="col-md-8 codeblock-image" %}
{% codeblock lang:python line_number:true highlight:true first_line:1 %}
from requirements import *

@TestScenario
@Requirements(RQ_SRS001_CU_LS_Default_Directory("1.0"))
def list_current_working_directory(self, shell):
    """Check that the `ls` utility, when run without
    any arguments, lists the contents of the
    current working directory.
    """
    with When("I execute `ls` command without arguments"):
        r = shell("ls")

    with Then("exitcode should be 0"):
        assert r.exitcode == 0, error()
{% endcodeblock %}

{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Track your test coverage
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report coverage requirements.py
    </div>
</div>

{% endhtml %}
{% html div class="col-md-8" %}
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/coverage.png" alt="Requirements" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Impress and share requirements with your team and customers
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat requirements.md | tfs document convert > requirements.html
    </div>
</div>

{% endhtml %}
{% html div class="col-md-8" %}
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/requirements.png" alt="Requirements" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Results Analytics**
## designed to provide analytics
## using ClickHouse and Grafana
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## On-the-fly loading of logs
## into ClickHouse
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>python3 test.py --database host=localhost
    </div>
</div>
{% endhtml %}

{% html div class="col-md-8 codeblock-image dark" %}
{% codeblock lang:bash line_number:true highlight:true first_line:1 %}
$ clickhouse-client
ClickHouse client version 20.7.1.4130.
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 20.7.1 revision 54437.

user-node :) select test_name from messages WHERE message_keyword = 'RESULT' LIMIT 5

SELECT test_name
FROM messages
WHERE message_keyword = 'RESULT'
LIMIT 5

┌─test_name───────────────────────────────────────────────────────────────────────────────────────┐
│ /ls                                                                                             │
│ /ls/list current working directory                                                              │
│ /ls/list current working directory/I execute `ls` command without arguments                     │
│ /ls/list current working directory/exitcode should be 0                                         │
│ /ls/list current working directory/it should list the contents of the current working directory │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.010 sec.

user-node :)
{% endcodeblock %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Dashboards
## available in Grafana
{% endhtml %}

{% html div class="col-md-8" %}
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/grafana-testruns.png" alt="Dashboards" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header" %}
# **More Than Just a Framework**
## build on top of a messaging protocol
## for robustness and advanced applications
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg" %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Messages
## use JSON objects
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs transform raw
    </div>
</div>
{% endhtml %}

{% html div class="col-md-8 codeblock-image dark" %}
{% codeblock lang:json line_number:true highlight:true first_line:1 %}
{"message_keyword":"PROTOCOL","message_hash":"6e6fca73","message_object":0,"message_num":0,"message_stream":null,"message_level":1,"message_time":1595181231.201574,"message_rtime":0.000875,"test_type":"Module","test_subtype":null,"test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec","test_name":"/ls","test_flags":0,"test_cflags":0,"test_level":1,"protocol_version":"TFSPv2.1"}
{"message_keyword":"VERSION","message_hash":"2fdb9078","message_object":0,"message_num":1,"message_stream":null,"message_level":1,"message_time":1595181231.201672,"message_rtime":0.000973,"test_type":"Module","test_subtype":null,"test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec","test_name":"/ls","test_flags":0,"test_cflags":0,"test_level":1,"framework_version":"1.6.200716.1214830"}
{"message_keyword":"TEST","message_hash":"b60b2b60","message_object":1,"message_num":2,"message_stream":null,"message_level":1,"message_time":1595181231.201716,"message_rtime":0.001018,"test_type":"Module","test_subtype":null,"test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec","test_name":"/ls","test_flags":0,"test_cflags":0,"test_level":1,"test_uid":null,"test_description":"The `ls` utility regression module.\n    "}
{"message_keyword":"REQUIREMENT","message_hash":"cb7abae2","message_object":1,"message_num":3,"message_stream":null,"message_level":2,"message_time":1595181231.201765,"message_rtime":0.001066,"test_type":"Module","test_subtype":null,"test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec","test_name":"/ls","test_flags":0,"test_cflags":0,"test_level":1,"requirement_name":"RQ.SRS001-CU.LS","requirement_version":"1.0","requirement_description":"The [ls] utility SHALL list the contents of a directory.\n","requirement_link":null,"requirement_priority":null,"requirement_type":null,"requirement_group":null,"requirement_uid":null}
{"message_keyword":"TEST","message_hash":"fa644d52","message_object":1,"message_num":0,"message_stream":null,"message_level":2,"message_time":1595181231.204069,"message_rtime":0.00099,"test_type":"Test","test_subtype":"Scenario","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0","test_name":"/ls/list current working directory","test_flags":0,"test_cflags":0,"test_level":2,"test_uid":null,"test_description":"Check that `ls` utility when run without\n    any arguments lists the contents of the \n    current working directory.\n    "}
{"message_keyword":"REQUIREMENT","message_hash":"4d7b28df","message_object":1,"message_num":1,"message_stream":null,"message_level":3,"message_time":1595181231.204191,"message_rtime":0.001112,"test_type":"Test","test_subtype":"Scenario","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0","test_name":"/ls/list current working directory","test_flags":0,"test_cflags":0,"test_level":2,"requirement_name":"RQ.SRS001-CU.LS.Default.Directory","requirement_version":"1.0","requirement_description":"The [ls] utility SHALL by default list information about the contents of the current directory.\n","requirement_link":null,"requirement_priority":null,"requirement_type":null,"requirement_group":null,"requirement_uid":null}
{"message_keyword":"TEST","message_hash":"50a6e014","message_object":1,"message_num":0,"message_stream":null,"message_level":3,"message_time":1595181231.218689,"message_rtime":0.014245,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"test_uid":null,"test_description":null}
{"message_keyword":"NONE","message_hash":"41598c19","message_object":0,"message_num":1,"message_stream":"bash","message_level":4,"message_time":1595181231.259461,"message_rtime":0.055018,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"message":"bash# ls"}
{"message_keyword":"NONE","message_hash":"40f3a41f","message_object":0,"message_num":2,"message_stream":"bash","message_level":4,"message_time":1595181231.260848,"message_rtime":0.056404,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"message":"coverage.html  regression.py  \u001b[0m\u001b[01;34mrequirements\u001b[0m  test1.log  test.log"}
{"message_keyword":"NONE","message_hash":"2e45138a","message_object":0,"message_num":3,"message_stream":"bash","message_level":4,"message_time":1595181231.271679,"message_rtime":0.067236,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"message":"bash# echo $?"}
{"message_keyword":"NONE","message_hash":"9ad51777","message_object":0,"message_num":4,"message_stream":"bash","message_level":4,"message_time":1595181231.27186,"message_rtime":0.067416,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"message":"0"}
{"message_keyword":"NONE","message_hash":"b060314c","message_object":0,"message_num":5,"message_stream":"bash","message_level":4,"message_time":1595181231.272425,"message_rtime":0.067981,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"message":"bash#"}
{"message_keyword":"RESULT","message_hash":"b89bbe47","message_object":1,"message_num":6,"message_stream":null,"message_level":3,"message_time":1595181231.272822,"message_rtime":0.068378,"test_type":"Step","test_subtype":"When","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/0","test_name":"/ls/list current working directory/I execute `ls` command without arguments","test_flags":0,"test_cflags":0,"test_level":3,"result_message":null,"result_reason":null,"result_type":"OK","result_test":"/ls/list current working directory/I execute `ls` command without arguments"}
{"message_keyword":"TEST","message_hash":"4b9b249c","message_object":1,"message_num":0,"message_stream":null,"message_level":3,"message_time":1595181231.274689,"message_rtime":0.001416,"test_type":"Step","test_subtype":"Then","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/1","test_name":"/ls/list current working directory/exitcode should be 0","test_flags":0,"test_cflags":0,"test_level":3,"test_uid":null,"test_description":null}
{"message_keyword":"RESULT","message_hash":"a9298fca","message_object":1,"message_num":1,"message_stream":null,"message_level":3,"message_time":1595181231.274933,"message_rtime":0.00166,"test_type":"Step","test_subtype":"Then","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/1","test_name":"/ls/list current working directory/exitcode should be 0","test_flags":0,"test_cflags":0,"test_level":3,"result_message":null,"result_reason":null,"result_type":"OK","result_test":"/ls/list current working directory/exitcode should be 0"}
{"message_keyword":"TEST","message_hash":"b86c0af8","message_object":1,"message_num":0,"message_stream":null,"message_level":3,"message_time":1595181231.276228,"message_rtime":0.000985,"test_type":"Step","test_subtype":"Then","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/2","test_name":"/ls/list current working directory/it should list the contents of the current working directory","test_flags":0,"test_cflags":0,"test_level":3,"test_uid":null,"test_description":null}
{"message_keyword":"RESULT","message_hash":"f890ca0e","message_object":1,"message_num":1,"message_stream":null,"message_level":3,"message_time":1595181231.276464,"message_rtime":0.001221,"test_type":"Step","test_subtype":"Then","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0/2","test_name":"/ls/list current working directory/it should list the contents of the current working directory","test_flags":0,"test_cflags":0,"test_level":3,"result_message":null,"result_reason":null,"result_type":"OK","result_test":"/ls/list current working directory/it should list the contents of the current working directory"}
{"message_keyword":"METRIC","message_hash":"18f22bec","message_object":1,"message_num":2,"message_stream":null,"message_level":3,"message_time":1595181231.276705,"message_rtime":0.073627,"test_type":"Test","test_subtype":"Scenario","test_id":"/cdc771be-c9e8-11ea-be5a-2477034de0ec/0","test_name":"/ls/list current working directory","test_flags":0,"test_cflags":0,"test_level":2,"metric_name":"metric","metric_value":0.4723491269298419,"metric_units":"ms","metric_type":null,"metric_group":null,"metric_uid":null}
{% endcodeblock %}
{% endhtml %}
{% endhtml %}
{% endhtml %}

{% html div class="container section-body row" %}
{% html div class="col-md-4 text-center" %}
## Compressed
## using LZMA compression
# <br>

<div style="text-align: center; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log
    </div>
</div>
{% endhtml %}

{% html div class="col-md-8 codeblock-image dark" %}
{% codeblock lang:bash %}
00000000  fd 37 7a 58 5a 00 00 04  e6 d6 b4 46 02 00 21 01  |.7zXZ......F..!.|
00000010  16 00 00 00 74 2f e5 a3  e0 29 89 05 03 5d 00 3d  |....t/...)...].=|
00000020  88 89 a6 94 60 d9 bd bf  72 0c 7c b5 f6 cd 99 04  |....`...r.|.....|
00000030  c8 be 8f 34 f6 48 3f f5  48 cd aa 7d 4b e4 05 14  |...4.H?.H..}K...|
00000040  fb 14 0e 7f ef 43 d8 77  43 bc d1 61 1c 7c a7 e9  |.....C.wC..a.|..|
00000050  12 15 52 86 28 10 be 4b  64 18 ed 7d 39 6d 66 80  |..R.(..Kd..}9mf.|
00000060  ce 5d 8d a3 5b f8 e6 15  78 33 eb d8 39 d4 a7 c7  |.]..[...x3..9...|
00000070  cf 66 70 29 c8 32 15 46  ab 5d 5d 79 01 fb a9 a3  |.fp).2.F.]]y....|
00000080  8d 44 a4 1a 7f fc 75 4b  b5 55 0c 37 e1 e2 3e d2  |.D....uK.U.7..>.|
00000090  2d 04 3c 37 e6 7c 48 a7  70 89 8e 32 c7 6c f3 5e  |-.<7.|H.p..2.l.^|
000000a0  3b e6 e3 1f d7 f2 15 06  f0 63 c0 bf 0e e5 04 3c  |;........c.....<|
000000b0  38 3d b6 f2 f4 5a 2a 5d  af e5 a5 b0 04 45 00 cc  |8=...Z*].....E..|
000000c0  0b de 48 56 3d 01 91 61  b8 23 3b 68 a5 72 ce bf  |..HV=..a.#;h.r..|
000000d0  3b 7a ef 83 dc 7a 58 ae  6d d3 3b 3b f9 e6 6d 7c  |;z...zX.m.;;..m||
000000e0  c7 60 d8 17 b1 6a 0e a5  68 a4 3a a1 4f de df 1c  |.`...j..h.:.O...|
000000f0  55 4b d2 ba 41 e7 b3 0b  cf f9 c8 f2 45 ee 62 88  |UK..A.......E.b.|
00000100  f6 48 e4 0b 65 9b 6c bd  91 5b 12 13 bf 02 23 1c  |.H..e.l..[....#.|
00000110  ef 98 d4 18 c1 c2 54 a4  9a e9 f8 b4 3a 37 bf fe  |......T.....:7..|
00000120  7d 4a 93 7a d1 27 df a1  1b 26 b4 71 d0 14 37 95  |}J.z.'...&.q..7.|
{% endcodeblock %}
{% endhtml %}
{% endhtml %}

{% html section %}
{% html div class="container-fluid section-header section-header-top" %}
{% html div class="section-bg-wrapper" %}
{% html div class="section-bg section-bg-top" %}
{% endhtml %}
{% endhtml %}
# **Actively Developed**
## become part of the team
## and join us on <a href="https://github.com/testflows">GitHub</a>
## or follow us to get the latest updates
{% endhtml %}
{% endhtml %}

