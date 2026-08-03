---
title: Sign up
description: Create a TestFlows Machine account
date: 2026-07-31 00:00:00
fullwidth: true
permalink: machine/portal/signup/index.html
---

<section class="portal-page">
    <div class="container portal-page-inner">
        <header class="portal-page-header">
            <h1>Sign up</h1>
            <p>We'll email you an activation link.</p>
        </header>
        <div class="portal-card">
            <div id="portal-signup-status" class="portal-status" hidden></div>
            <form id="portal-signup-form" class="portal-form" novalidate>
                <div class="portal-field">
                    <label for="portal-signup-email">Your account email</label>
                    <input type="email" class="form-control" id="portal-signup-email" required autocomplete="email" placeholder="you@company.com">
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
        <p class="portal-foot" id="portal-signup-foot">
            Already have an account? <a id="portal-signup-login-link" href="/machine/portal/login/">Sign in</a>
        </p>
        <p class="portal-legal">
            By creating an account you agree to the
            <a href="/machine/legal/terms-of-service/">Terms of Service</a>
            and
            <a href="/machine/legal/privacy-policy/">Privacy Policy</a>.
        </p>
    </div>
</section>
<script type="module" src="/js/portal/signup.js"></script>
