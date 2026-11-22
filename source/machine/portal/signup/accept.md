---
title: Finish signing up
description: Accept the Terms and create your Machine account
fullwidth: true
noindex: true
permalink: machine/portal/signup/accept/index.html
---

<section class="portal-page">
    <div class="container portal-page-inner">
        <header class="portal-page-header">
            <h1>Finish signing up</h1>
            <p>Accept the Terms to create your TestFlows Machine account.</p>
        </header>
        <div class="portal-card">
            <div id="portal-accept-status" class="portal-status" hidden></div>
            <form id="portal-accept-form" class="portal-form" novalidate>
                <div class="portal-field portal-check">
                    <input type="checkbox" id="portal-accept-terms" required>
                    <label for="portal-accept-terms">I have read and accept the <a href="/machine/legal/terms-of-service/" target="_blank" rel="noopener">Terms of Service</a> and the <a href="/machine/legal/client-eula/" target="_blank" rel="noopener">Client EULA</a>, which licenses the Machine client and the SDK Core.</label>
                </div>
                <div class="portal-actions">
                    <button type="submit" class="btn btn-primary" id="portal-accept-submit">Create account</button>
                </div>
            </form>
            <div id="portal-accept-code" class="portal-secret" hidden>
                <p class="portal-secret-title">Your sign-in code</p>
                <pre class="portal-secret-value portal-secret-value--code" id="portal-accept-code-value"></pre>
                <p class="portal-hint">Give this code to the agent or the program that asked you to sign up. It works once, for 10 minutes, from the computer that asked.</p>
            </div>
            <div id="portal-accept-no-code" hidden>
                <p class="portal-hint">No sign-in code could be sent from here. Ask the agent to sign in again with <code>machine login --email</code> and your email address.</p>
            </div>
        </div>
        <p class="portal-legal">
            The <a href="/machine/legal/privacy-policy/">Privacy Policy</a>
            says how your data is handled.
        </p>
    </div>
</section>
<script type="module" src="/js/portal/signup-accept.js"></script>
