---
layout: index
---

{% html div class="container-fluid text-center p-0" style="padding-bottom: 2em !important" %}

{% html div class="banner in-view-watcher" %}
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<p>
<img src="/img/logo-white.png" alt="Logo" style= "width: 70vw; max-width: 400px;">
</p>

### enterprise quality open-source test framework
#### that makes testing flow
<div class="row justify-content-center no-gutters" style="padding-top: 3vh">
    <div class="command">
        <span class="prompt">$</span>pip3 install testflows
    </div>
</div>
<div class="row justify-content-center no-gutters">
    <div class="links">
        <div class="btn-group" role="group" aria-label="Basic example">
            <button type="button" class="btn btn-secondary">
                <a href="https://pypi.org/project/testflows/">
                    <span class="fab fa-3x fa-python"></span>
                </a>
            </button>
            <button type="button" class="btn btn-secondary">
                <a href="https://twitter.com/TestFlowsTF">
                    <span class="fab fa-3x fa-twitter"></span>
                </a>
            </button>
            <button type="button" class="btn btn-secondary">
                <a href="https://t.me/testflows">
                    <span class="fab fa-3x fa-telegram-plane"></span>
                </a>
            </button>
            <button type="button" class="btn btn-secondary">
                <a href="https://github.com/testflows">
                    <span class="fab fa-3x fa-github"></span>
                </a>
            </button>
        </div>
    </div>
</div>
{% endhtml %}
{% endhtml %}

{% html div class="container" style="padding-bottom: 2em !important" %}

## Write

{% html div class=row" %}

{% html div class="col-md-4 text-center" %}
<div style="padding-bottom: 1em"><i class="fas fa-4x fa-pencil-alt"></i></div>
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

## Execute

{% html div class=row" %}

{% html div class="col-md-4 text-center" %}
<div style="padding-bottom: 1em"><i class="fas fa-5x fa-running"></i></div>
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

# <br>

---

# <br>
# **Professional & Beautiful Reports**
## right at your fingertips

## <br>
---
{% html div class=row" %}
{% html div class="col-md-6" %}
## <br>
## Requirements Coverage Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report coverage requirements.py
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/coverage.png" alt="Requirements Coverage Report" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Requirements Traceability Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report traceability
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/traceability.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

<br>
<br>
{% html div class=row" %}
## <br>
{% html div class="col-md-6" %}
## <br>
## Results Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report results
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/results.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Specification Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report specification
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/specification.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

<br>
<br>
{% html div class=row" %}
{% html div class="col-md-6" %}
## <br>
## Results Comparison Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>tfs report compare results *.log
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/compare-results.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}

{% html div class="col-md-6" %}
## <br>
## Metrics Comparison Report
<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>tfs report compare metrics *.log
    </div>
</div>
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/compare-metrics.png" alt="ScreenShot" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

# <br>

---

# <br>
# **Write & Work with Requirements**
## straightforward and convenient

## <br>
---

<br>
<br>
{% html div class=row" %}
{% html div class="col-md-4 text-center" %}
## Write requirements in Markdown document
# <br>
{% endhtml %}
{% html div class="col-md-8" %}

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

<br>
<br>

{% html div class=row" %}
{% html div class="col-md-4 text-center" %}
## Convert & use in tests
# <br>

<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat requirements.md | tfs requirements generate > requirements.py
    </div>
</div>


{% endhtml %}
{% html div class="col-md-8" %}

{% codeblock lang:python line_number:true highlight:true first_line:1 %}
from requirements import *

@TestScenario
@Requirements(RQ_SRS001_CU_LS_Default_Directory("1.0"))
def list_current_working_directory(self, shell):
    """Check that `ls` utility when run without
    any arguments lists the contents of the
    current working directory.
    """
    with When("I execute `ls` command without arguments"):
        r = shell("ls")

    with Then("exitcode should be 0"):
        assert r.exitcode == 0, error()
{% endcodeblock %}

{% endhtml %}
{% endhtml %}

<br>
<br>
{% html div class=row" %}
{% html div class="col-md-4 text-center" %}
## Track your test coverage
# <br>

<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat test.log | tfs report coverage requirements.py
    </div>
</div>

{% endhtml %}
{% html div class="col-md-8" %}
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/coverage.png" alt="Requirements" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

<br>
<br>
{% html div class=row" %}
{% html div class="col-md-4 text-center" %}
## Impress and share requirements with your team and customers
# <br>

<div style="width: fit-content; margin: auto; padding-bottom: 1em;">
    <div class="command">
        <span class="prompt">$</span>cat requirements.md | tfs document convert > requirements.html
    </div>
</div>

{% endhtml %}
{% html div class="col-md-8" %}
<div style="margin: auto; box-shadow: 10px 10px 20px #192f38; max-height: 540px; overflow: hidden;"><img src="/assets/requirements.png" alt="Requirements" style="width: 100%;"></div>
{% endhtml %}
{% endhtml %}

<br>
<br>

{% endhtml %}
