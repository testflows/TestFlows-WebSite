---
layout: index
fullwidth: true
---

<div class="container-fluid p-0">
<div class="banner home-banner">
<div class="container banner-inner">
<div class="banner-text">
<h1>Write test programs.<br>Explore in a deterministic machine.</h1>
<p>Built for humans and <a href="/agents.md" title="Guide for AI agents">AI agents</a>.</p>
</div>
</div>
</div>
</div>

<section class="home-products">
<div class="container">
<div class="home-product-grid">

<div class="home-product-col">
<article class="home-product">
<p class="home-product-eyebrow">Open-source</p>
<h2><a class="stretched-link" href="/framework/">Framework</a></h2>
<p class="home-product-lead">Python library for writing test programs.<br>Using everything is code approach.</p>
<div class="index-start home-demo">
<div class="index-start-steps">
<div class="index-start-step index-code-animate">
<div class="index-start-step-file"><p>test.py</p></div>

{% codeblock lang:python line_number:true highlight:true %}
from testflows.core import Scenario

with Scenario("Hello TestFlows"):
    pass
{% endcodeblock %}
</div>
<div class="index-start-step">
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
<div class="home-product-actions">
<a class="section-cta" href="/framework/">Explore Framework</a>
<a class="section-cta section-cta-ghost" href="/docs/framework/">Docs</a>
</div>
</article>
</div>

<div class="home-product-col">
<article class="home-product">
<p class="home-product-eyebrow">Deterministic</p>
<h2><a class="stretched-link" href="/machine/">Machine</a></h2>
<p class="home-product-lead">Run your programs deterministically: record a run, replay it exactly, and branch from any point.</p>
<div class="home-machine-demo">
<div class="banner-sphere-frame machine-hero-frame">
<img class="banner-sphere machine-hero-image" src="/images/machine-hero.jpg" alt="" aria-hidden="true" width="1400" height="698">
<div class="machine-hero-term" id="machine-hero-term" aria-label="Machine console" data-boot-log="RGVjb21wcmVzc2luZyBMaW51eC4uLiBQYXJzaW5nIEVMRi4uLiBObyByZWxvY2F0aW9uIG5lZWRlZC4uLiBkb25lLgpCb290aW5nIHRoZSBrZXJuZWwuCkxpbnV4IHZlcnNpb24gdGVzdGZsb3dzLW9zLXYxLjAgIzEgU01QIFBSRUVNUFRfRFlOQU1JQyAoVGVzdEZsb3dzIE9TIHYxLjApCkNvbW1hbmQgbGluZTogY29uc29sZT10dHlTMCByb290PS9kZXYvdmRhIHJ3IHJlY2xhaW1fcm5nX3NlZWQ9MApOWCAoRXhlY3V0ZSBEaXNhYmxlKSBwcm90ZWN0aW9uOiBhY3RpdmUKdHNjOiBEZXRlY3RlZCAxMDAwLjAwMCBNSHogcHJvY2Vzc29yClVzaW5nIEdCIHBhZ2VzIGZvciBkaXJlY3QgbWFwcGluZwpab25lIHJhbmdlczoKICBETUEgICAgICBbbWVtIDB4MDAwMDAwMDAwMDAwMTAwMC0weDAwMDAwMDAwMDBmZmZmZmZdCiAgRE1BMzIgICAgW21lbSAweDAwMDAwMDAwMDEwMDAwMDAtMHgwMDAwMDAwMDBmZmZmZmZmXQogIE5vcm1hbCAgIGVtcHR5Cm1lbSBhdXRvLWluaXQ6IHN0YWNrOmFsbCh6ZXJvKSwgaGVhcCBhbGxvYzpvZmYsIGhlYXAgZnJlZTpvZmYKZGV0ZXJtaW5pc3RpY19yZWNsYWltOiBzZWVkPTAsIDEgY3B1cyBpbml0aWFsaXplZApQb2tpbmcgS0FTTFIgdXNpbmcgUkRUU0MuLi4KRHluYW1pYyBQcmVlbXB0OiBub25lCnJjdTogUHJlZW1wdGlibGUgaGllcmFyY2hpY2FsIFJDVSBpbXBsZW1lbnRhdGlvbi4KQ29uc29sZTogY29sb3VyIENHQSA4MHgyNQpwcmludGs6IGxlZ2FjeSBjb25zb2xlIFt0dHlTMF0gZW5hYmxlZAp4ODYvY3B1OiBVc2VyIE1vZGUgSW5zdHJ1Y3Rpb24gUHJldmVudGlvbiAoVU1JUCkgYWN0aXZhdGVkCng4Ni9mcHU6IFN1cHBvcnRpbmcgWFNBVkUgZmVhdHVyZSAweDAwMTogJ3g4NyBmbG9hdGluZyBwb2ludCByZWdpc3RlcnMnCng4Ni9mcHU6IFN1cHBvcnRpbmcgWFNBVkUgZmVhdHVyZSAweDAwMjogJ1NTRSByZWdpc3RlcnMnCng4Ni9mcHU6IFN1cHBvcnRpbmcgWFNBVkUgZmVhdHVyZSAweDAwNDogJ0FWWCByZWdpc3RlcnMnCng4Ni9mcHU6IEVuYWJsZWQgeHN0YXRlIGZlYXR1cmVzIDB4NywgY29udGV4dCBzaXplIGlzIDgzMiBieXRlcywgdXNpbmcgJ2NvbXBhY3RlZCcgZm9ybWF0LgpzbXBib290OiBDUFUwOiBUZXN0Rmxvd3MgTWFjaGluZSB2MQpQZXJmb3JtYW5jZSBFdmVudHM6IFRlc3RGbG93cyBQTVUgZHJpdmVyLgpzbXA6IEJyaW5naW5nIHVwIHNlY29uZGFyeSBDUFVzIC4uLgpzbXA6IEJyb3VnaHQgdXAgMSBub2RlLCAxIENQVQpkZXZ0bXBmczogaW5pdGlhbGl6ZWQKY2xvY2tzb3VyY2U6IGppZmZpZXM6IG1hc2s6IDB4ZmZmZmZmZmYgbWF4X2lkbGVfbnM6IDc2NDUwNDE3ODUxMDAwMDAgbnMKTkVUOiBSZWdpc3RlcmVkIFBGX05FVExJTksvUEZfUk9VVEUgcHJvdG9jb2wgZmFtaWx5CmNwdWlkbGU6IHVzaW5nIGdvdmVybm9yIGxhZGRlcgpQQ0k6IFByb2JpbmcgUENJIGhhcmR3YXJlCk5FVDogUmVnaXN0ZXJlZCBQRl9JTkVUIHByb3RvY29sIGZhbWlseQpUQ1A6IEhhc2ggdGFibGVzIGNvbmZpZ3VyZWQgKGVzdGFibGlzaGVkIDIwNDggYmluZCAyMDQ4KQpORVQ6IFJlZ2lzdGVyZWQgUEZfVU5JWC9QRl9MT0NBTCBwcm90b2NvbCBmYW1pbHkKaW8gc2NoZWR1bGVyIG1xLWRlYWRsaW5lIHJlZ2lzdGVyZWQKaW8gc2NoZWR1bGVyIGt5YmVyIHJlZ2lzdGVyZWQKU2VyaWFsOiA4MjUwLzE2NTUwIGRyaXZlciwgNCBwb3J0cywgSVJRIHNoYXJpbmcgZGlzYWJsZWQKc2VyaWFsODI1MDogdHR5UzAgYXQgSS9PIDB4M2Y4IChpcnEgPSA0LCBiYXNlX2JhdWQgPSAxMTUyMDApIGlzIGEgMTY1NTBBCnZpcnRpb19ibGsgdmlydGlvMDogW3ZkYV0gMTMxMDcyIDUxMi1ieXRlIGxvZ2ljYWwgYmxvY2tzICg2Ny4xIE1CLzY0LjAgTWlCKQppbnB1dDogQVQgUmF3IFNldCAyIGtleWJvYXJkIGFzIC9kZXZpY2VzL3BsYXRmb3JtL2k4MDQyL3NlcmlvMC9pbnB1dC9pbnB1dDAKTkVUOiBSZWdpc3RlcmVkIFBGX0lORVQ2IHByb3RvY29sIGZhbWlseQpjbG9ja3NvdXJjZTogU3dpdGNoZWQgdG8gY2xvY2tzb3VyY2UgdHNjCkVYVDQtZnMgKHZkYSk6IG1vdW50ZWQgZmlsZXN5c3RlbSByL3cuIFF1b3RhIG1vZGU6IGRpc2FibGVkLgpWRlM6IE1vdW50ZWQgcm9vdCAoZXh0MiBmaWxlc3lzdGVtKSBvbiBkZXZpY2UgMjU0OjAuCmRldnRtcGZzOiBtb3VudGVkCkZyZWVpbmcgdW51c2VkIGtlcm5lbCBpbWFnZSAoaW5pdG1lbSkgbWVtb3J5OiAxMDcySwpXcml0ZSBwcm90ZWN0aW5nIHRoZSBrZXJuZWwgcmVhZC1vbmx5IGRhdGE6IDEyMjg4awpSdW4gL3NiaW4vaW5pdCBhcyBpbml0IHByb2Nlc3MKCiAgLS0tLSBvIG8gbyAtLS0tCiB8ICAgbyAgICAgICBvICAgfAogfCAxIG8gMTAwMTAgbyAwIHwKIHwgICBvICAgICAgIG8gICB8ICDwn5u4IFRlc3RGbG93cyBNYWNoaW5lIHYxLjAKICAtLS0gIG8gbyBveHggLS0KIC8gICAgICAgICAgIHh4ICAgXAovICBeXl4gICAgICAgIHh4ICAgXAogLS0tLS0tLS0tLS0tLS0tLS0tCgpTdGFydCBleHBsb3JpbmcuLi4K">
<div class="index-start-step-file"><p>ttyS0</p></div>
<div class="machine-hero-term-body">
<pre class="machine-hero-term-pre"></pre>
</div>
</div>
</div>
</div>
<div class="home-product-actions">
<a class="section-cta" href="/machine/">Explore Machine</a>
<a class="section-cta section-cta-ghost" href="/machine/portal/signup/">Create account</a>
</div>
</article>
</div>

</div>
</div>
</section>

<section class="index-journal home-journal">
    <div class="container">
        <div class="index-journal-heading">
            <h2 class="index-block-title">From the blog</h2>
        </div>
        {% index_latest_post %}
        <div class="index-journal-cta-card">
            <h3>Read the blog</h3>
            <p>Test programs, steps, combinatorial coverage, behavior models, and more.</p>
            <a class="section-cta" href="/blog/">Read all posts</a>
        </div>
    </div>
</section>

<section class="index-close home-close">
    <div class="container section-close">
        <h1>Talk to our team</h1>
        <div class="section-close-actions">
            <a class="section-cta section-cta-lg" href="/contact.html">Contact</a>
        </div>
    </div>
</section>
