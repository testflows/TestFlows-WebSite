---
layout: index
---

{% html div class="container-fluid p-0" %}

{% html div class="banner in-view-watcher" %}
{% html div class="container banner-inner" %}
{% html div class="row align-items-center" %}

{% html div class="col-lg-6 banner-visual" %}
<div class="banner-sphere" aria-hidden="true"></div>
{% endhtml %}

{% html div class="col-lg-6 banner-text" %}
# Not a typical framework

A Python library for **testing as code**. Write full test programs with dynamic flow, parallel execution, and combinatorial coverage.

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

<!-- more -->

{% html div class="index-start" %}
{% html div class="container" %}

## Everything is code

{% html div class="index-block-lead" %}No scaffolding. Just Python.{% endhtml %}

{% html div class="index-start-art" %}
<img src="/images/everything-is-code.png" alt="Everything is code">
{% endhtml %}

{% html div class="row index-start-steps" %}

{% html div class="col-md-6 index-start-step" %}
### Write

{% html div class="index-start-step-story" %}A test is just a Python program. Open a file and define a scenario. No special runner config, no scaffolding.{% endhtml %}

{% html div class="index-start-step-file" %}test.py{% endhtml %}

{% codeblock lang:python line_number:false highlight:true %}
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
{% endcodeblock %}
{% endhtml %}

{% html div class="col-md-6 index-start-step" %}
### Run

{% html div class="index-start-step-story" %}Execute it like any other script. You get a clear pass, a scenario count, and a time. Then keep building.{% endhtml %}

{% html div class="index-start-step-file" %}terminal{% endhtml %}

{% codeblock lang:shell line_number:false highlight:true %}
$ python3 ./test.py
✔ [ OK ] /Hello TestFlows

1 scenario (1 ok)
Total time 2ms
{% endcodeblock %}
{% endhtml %}

{% endhtml %}
{% endhtml %}
{% endhtml %}
