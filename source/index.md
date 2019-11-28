---
layout: index
---

{% html div class="container-fluid text-center p-0" style="padding-bottom: 2em !important" %}

{% html div class="banner" %} 
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
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<div class="firefly"></div>
<p>
<img src="/img/logo-white.png" alt="TestFlows Logo" style= "width: 70vw; max-width: 400px;">
</p>

### A Test Flow Oriented Test Framework
#### where testing flows
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
TestFlows Test Framework v1.3.191112.1234833
{% endcodeblock %}
{% endhtml %}
{% endhtml %}

{% endhtml %}
