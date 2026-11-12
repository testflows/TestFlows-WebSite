---
title: Sign up
description: Create a Machine account
date: 2026-07-31 00:00:00
fullwidth: true
permalink: machine/portal/signup/index.html
---

<section class="portal-page">
    <div class="container portal-page-inner portal-page-inner--split">
        <header class="portal-page-header">
            <h1>Sign up</h1>
            <p>We'll email you an activation link.</p>
        </header>
        <div class="portal-split">
        <aside class="portal-split-aside">
        <p class="portal-banner portal-banner--warn" role="note"><strong>TestFlows Machine is in public beta.</strong> We're improving it quickly with feedback from users like you, shared on <a href="https://github.com/testflows/Machine">GitHub</a> or through our <a href="/contact.html?topic=Machine%20feedback">contact form</a>. Backward compatibility isn't guaranteed yet, and you may need to update the client and the SDK Core often.</p>
        </aside>
        <div class="portal-split-main">
        <div class="portal-card">
            <div id="portal-signup-status" class="portal-status" hidden></div>
            <form id="portal-signup-form" class="portal-form" novalidate>
                <div class="portal-field">
                    <label for="portal-signup-email">Your account email</label>
                    <input type="email" class="form-control" id="portal-signup-email" required autocomplete="email" placeholder="you@company.com">
                </div>
                <div class="portal-field portal-check">
                    <input type="checkbox" id="portal-signup-terms" required>
                    <label for="portal-signup-terms">I have read and accept the <a href="/machine/legal/terms-of-service/" target="_blank" rel="noopener">Terms of Service</a> and the <a href="/machine/legal/client-eula/" target="_blank" rel="noopener">Client EULA</a>, which licenses the Machine client and the SDK Core.</label>
                </div>
                <div class="portal-actions">
                    <button type="submit" class="btn btn-primary" id="portal-signup-submit">Send link</button>
                </div>
            </form>
            <div id="portal-signup-done" hidden>
                <p class="portal-hint">No email? You may already have an account.</p>
                <div class="portal-actions">
                    <a class="btn btn-primary" href="/machine/portal/login/">Sign in</a>
                </div>
            </div>
        </div>
        <p class="portal-foot">
            Next, <a href="/machine/download/">download the client</a>.
            <span id="portal-signup-foot">Already have an account? <a id="portal-signup-login-link" href="/machine/portal/login/">Sign in</a></span>
        </p>
        <p class="portal-legal">
            The <a href="/machine/legal/privacy-policy/">Privacy Policy</a>
            says how your data is handled.
        </p>
        </div>
        </div>
    </div>
</section>
<script type="module" src="/js/portal/signup.js"></script>
