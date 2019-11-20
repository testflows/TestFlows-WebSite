---
layout: index
---

{% html div class="container-fluid text-center p-0" style="padding-bottom: 2em !important" %}

{% html div class="banner" %} 
<p>
<img src="/img/logo-white.png" alt="TestFlows Logo" style= "width: 70vw; max-width: 400px;">
</p>

### A Test Flow Oriented Test Framework
#### makes your testing flow
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

### Hello TestFlows!  

{% codeblock lang:python line_number:false highlight:true %}

from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
{% endcodeblock %}
