---
layout: index
---

<div class="container-fluid p-0">
<div class="banner in-view-watcher">
<div class="container banner-inner">

<div class="banner-text">
<h1>Not a typical framework</h1>
<p>A Python library for <strong>testing as code</strong>. Write full test programs with dynamic control, parallel execution, and combinatorial coverage.</p>
<a class="btn banner-cta" href="https://pypi.org/project/testflows/">pip3 install testflows</a>
</div>

<div class="banner-visual">
<div class="banner-sphere-frame">
<img class="banner-sphere" src="/images/hello-world.gif" alt="" aria-hidden="true">
</div>
</div>

<div class="banner-links">
<a href="https://pypi.org/project/testflows/" aria-label="PyPI"><span class="fab fa-python"></span></a>
<a href="https://www.linkedin.com/company/testflows-com-open-source-testing-framework/" aria-label="LinkedIn"><span class="fab fa-linkedin"></span></a>
<a href="https://x.com/TestFlowsOSTF" aria-label="X"><span class="fab fa-x-twitter"></span></a>
<a href="https://github.com/testflows" aria-label="GitHub"><span class="fab fa-github"></span></a>
</div>

</div>
</div>
</div>

<section class="index-why">
    <div class="container">
        <h2 class="index-block-title">Why TestFlows</h2>
        <p class="index-block-lead">One library for writing test programs. Not just collecting tests for a runner.</p>
        <div class="row index-why-grid">
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--document" aria-hidden="true"></span>
                        <h3>Test programs</h3>
                    </div>
                    <p>Control is yours. Branch, loop, and compose scenarios in Python. No plugin maze for basic dynamics. Your tests read like the program you meant to write.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--shoe" aria-hidden="true"></span>
                        <h3>Steps</h3>
                    </div>
                    <p>Break behavior into named steps with clear results. Readable runs, easier debugging, reusable building blocks. Failures point to the step that broke, not a wall of assert noise.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--puzzle" aria-hidden="true"></span>
                        <h3>Combinatorial</h3>
                    </div>
                    <p>Cover combinations systematically. Explore parameter space without hand-writing every case. Pairwise and beyond, driven from the same test program model.</p>
                </div>
            </div>
        </div>
        <div class="row index-why-grid index-why-grid-more">
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--gears" aria-hidden="true"></span>
                        <h3>Parallel &amp; Async</h3>
                    </div>
                    <p>Scale out across processes for throughput, or go concurrent with async and await. Same scenario style either way. Keep the test program model when the suite grows.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--checklist" aria-hidden="true"></span>
                        <h3>Requirements</h3>
                    </div>
                    <p>Treat requirements like code. Author them in Markdown, link them to tests, and produce coverage reports from the same workflow you already run.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <div class="index-why-card-title">
                        <span class="index-why-icon index-why-icon--grid" aria-hidden="true"></span>
                        <h3>Covering Arrays</h3>
                    </div>
                    <p>Cut huge combination spaces down to pairwise or n-wise sets. Get strong coverage with far fewer cases than exhaustive enumeration.</p>
                </div>
            </div>
        </div>
        <div class="row index-why-grid index-why-grid-more">
            <div class="col-md-12 index-why-col">
                <div class="index-why-card index-why-card-more">
                    <h3>And More...</h3>
                    <p>Manual testing, documentation as code, professional reports, analytics, protocol modules, and the rest of the toolkit. Built for teams that outgrow checklist frameworks.</p>
                    <div class="index-why-card-cta">
                        <a class="section-cta" href="/handbook/">Read the Handbook</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<div class="index-start">
<div class="container">
<h2 class="index-block-title">Everything is code</h2>
<div class="index-block-lead"><p>No scaffolding. Just Python.</p></div>
<div class="row index-start-steps">
<div class="col-md-6 index-start-step">
<h3>Write</h3>
<div class="index-start-step-story"><p>A test is just a Python program. Open a file and define a scenario. No special runner config, no scaffolding.</p></div>
<div class="index-start-step-file"><p>test.py</p></div>

{% codeblock lang:python line_number:true highlight:true %}
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
{% endcodeblock %}
</div>
<div class="col-md-6 index-start-step">
<h3>Run</h3>
<div class="index-start-step-story"><p>Execute it like any other script. You get a clear pass, a scenario count, and a time. Then keep building.</p></div>
<div class="index-start-step-file"><p>terminal</p></div>

{% codeblock lang:shell line_number:false highlight:true %}
$ python3 ./test.py
✔ [ OK ] /Hello TestFlows

1 scenario (1 ok)
Total time 2ms
{% endcodeblock %}
</div>
</div>
</div>
</div>

<section class="index-steps">
<div class="container">
<h2 class="index-block-title">Using test steps</h2>
<p class="index-block-lead">Break the procedure into steps. Each step is a named result — easier to read, debug, and reuse.</p>
<div class="index-steps-cascade">
<div class="index-start-step index-steps-panel index-steps-panel--code">
<div class="index-panel-chrome">
<div class="index-start-step-file"><p>test.py</p></div>

{% codeblock lang:python line_number:true highlight:true %}
from testflows.core import *

@TestScenario
def my_scenario(self):
    with Given("I setup something"):
        pass

    with When("I do something"):
        pass

    with Then("I expect something"):
        pass
{% endcodeblock %}
</div>
</div>
<div class="index-start-step index-steps-panel index-steps-panel--run">
<div class="index-start-step-story"><p>Test output will show each step executing and its result.</p></div>
<div class="index-panel-chrome">
<div class="index-start-step-file"><p>terminal</p></div>
<div class="index-steps-result" aria-hidden="true">
<pre class="index-steps-result-pre"><span class="index-steps-line index-steps-line--cmd" style="--i:0"><span class="index-term-dollar">$</span> python3 ./test.py</span><span class="index-steps-line" style="--i:1">Nov 12,2021 10:56:17   ⟥  Scenario my scenario</span><span class="index-steps-line" style="--i:2">Nov 12,2021 10:56:17     ⟥  Given I setup something, flags:MANDATORY</span><span class="index-steps-line index-steps-line--ok" style="--i:3">               305us     ⟥⟤ OK I setup something, /my scenario/I setup something</span><span class="index-steps-line" style="--i:4">Nov 12,2021 10:56:17     ⟥  When I do something</span><span class="index-steps-line index-steps-line--ok" style="--i:5">               165us     ⟥⟤ OK I do something, /my scenario/I do something</span><span class="index-steps-line" style="--i:6">Nov 12,2021 10:56:17     ⟥  Then I expect something</span><span class="index-steps-line index-steps-line--ok" style="--i:7">               225us     ⟥⟤ OK I expect something, /my scenario/I expect something</span><span class="index-steps-line index-steps-line--ok" style="--i:8">                 7ms   ⟥⟤ OK my scenario, /my scenario</span></pre>
</div>
</div>
<p class="visually-hidden">Example output: Scenario my scenario with Given, When, and Then steps each reporting OK.</p>
</div>
</div>
<div class="row index-steps-points">
<div class="col-12 col-md-4 index-steps-point">
<h3>Structure</h3>
<p>Improves how the procedure is written</p>
</div>
<div class="col-12 col-md-4 index-steps-point">
<h3>Debug</h3>
<p>Failures show which step broke</p>
</div>
<div class="col-12 col-md-4 index-steps-point">
<h3>Document</h3>
<p>Step names become the specification</p>
</div>
</div>
<div class="index-steps-cta">
<a class="section-cta" href="/handbook/#Using-Test-Steps">How to use test steps</a>
<a class="section-cta section-cta-ghost" href="/blog/how-to-break-your-tests-into-steps/"><span class="fas fa-file-lines" aria-hidden="true"></span> Making Your Tests Better or How to Break Your Tests Into Steps</a>
</div>
</div>
</section>

<section class="index-journal">
    <div class="container">
        <div class="index-journal-heading">
            <h2 class="index-block-title">Always learning</h2>
            <p class="index-block-lead">From the TestFlows blog.</p>
        </div>
        {% index_latest_post %}
        <div class="index-journal-cta-card">
            <h3>Read the blog</h3>
            <p>Deep dives on test programs, steps, combinatorial coverage, behavior models, and more. Written for developers who ship tests for complex systems.</p>
            <a class="section-cta" href="/blog/">Read all posts</a>
        </div>
    </div>
</section>

<section class="index-close">
    <div class="container section-close">
        <h1>Ready to build better tests?</h1>
        <a class="section-cta section-cta-ghost section-cta-lg" href="https://github.com/testflows">Join us on GitHub</a>
    </div>
</section>
