---
title: Sign in
description: Sign in to TestFlows Machine
date: 2026-07-31 00:00:00
fullwidth: true
permalink: machine/portal/login/index.html
---

<section class="portal-page">
    <div class="container portal-page-inner">
        <header class="portal-page-header">
            <h1>Sign in</h1>
            <p>We'll email you a one-time code.</p>
        </header>
        <div class="portal-card">
            <div id="portal-login-status" class="portal-status" hidden></div>
            <div id="portal-login-email-step">
                <form id="portal-login-email-form" class="portal-form" novalidate>
                    <div class="portal-field">
                        <label for="portal-login-email">Your account email</label>
                        <input type="email" class="form-control" id="portal-login-email" required autocomplete="email" placeholder="you@company.com">
                    </div>
                    <div class="portal-actions">
                        <button type="submit" class="btn btn-primary">Send code</button>
                    </div>
                </form>
            </div>
            <div id="portal-login-code-step" hidden>
                <form id="portal-login-code-form" class="portal-form" novalidate>
                    <div class="portal-field">
                        <label for="portal-login-code">Sign-in code</label>
                        <input type="text" class="form-control" id="portal-login-code" required autocomplete="one-time-code" inputmode="numeric" placeholder="Enter code">
                    </div>
                    <div class="portal-actions">
                        <button type="submit" class="btn btn-primary">Sign in</button>
                        <button type="button" class="btn btn-ghost" id="portal-login-resend">Resend code</button>
                    </div>
                    <p class="portal-hint">
                        No email? You may not have an account yet.
                        <a id="portal-login-signup-link" href="/machine/portal/signup/">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
        <p class="portal-foot" id="portal-login-foot">
            New here? <a href="/machine/portal/signup/">Create an account</a>
        </p>
        <p class="portal-legal">
            Use is governed by the
            <a href="/machine/legal/terms-of-service/">Terms of Service</a>
            and
            <a href="/machine/legal/privacy-policy/">Privacy Policy</a>.
        </p>
    </div>
</section>
<script type="module" src="/js/portal/login.js"></script>
