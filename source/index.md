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
                    <h3>Test programs</h3>
                    <p>Control is yours. Branch, loop, and compose scenarios in Python. No plugin maze for basic dynamics. Your tests read like the program you meant to write.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <h3>Steps</h3>
                    <p>Break behavior into named steps with clear results. Readable runs, easier debugging, reusable building blocks. Failures point to the step that broke, not a wall of assert noise.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <h3>Combinatorial</h3>
                    <p>Cover combinations systematically. Explore parameter space without hand-writing every case. Pairwise and beyond, driven from the same test program model.</p>
                </div>
            </div>
        </div>
        <div class="row index-why-grid index-why-grid-more">
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <h3>Parallel &amp; Async</h3>
                    <p>Scale out across processes for throughput, or go concurrent with async and await. Same scenario style either way. Keep the test program model when the suite grows.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <h3>Requirements</h3>
                    <p>Treat requirements like code. Author them in Markdown, link them to tests, and produce coverage reports from the same workflow you already run.</p>
                </div>
            </div>
            <div class="col-md-4 index-why-col">
                <div class="index-why-card">
                    <h3>Covering Arrays</h3>
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

{% codeblock lang:shell line_number:true highlight:true %}
$ python3 ./test.py
✔ [ OK ] /Hello TestFlows

1 scenario (1 ok)
Total time 2ms
{% endcodeblock %}
</div>
</div>
</div>
</div>

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
