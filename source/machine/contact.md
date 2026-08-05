---
title: Contact
description: Contact the TestFlows Machine team for early access and product questions
date: 2026-08-04 00:00:00
fullwidth: true
permalink: machine/contact/index.html
---

<section class="contact-page">
    <div class="container contact-page-inner">
        <header class="contact-page-header">
            <h1>Talk to our team</h1>
            <p>TestFlows Machine is in private beta. Contact us for early access or product questions.</p>
            <div class="contact-visual-links">
                <a class="contact-visual-link" href="mailto:contact@testflows.com">
                    <span class="fas fa-envelope" aria-hidden="true"></span>
                    contact@testflows.com
                </a>
            </div>
        </header>
        <div class="contact-form-col">
            <form class="needs-validation contact-us" novalidate onsubmit="return submitContactUs(this);">
                <div class="form-fields">
                    <div class="contact-step contact-step-1">
                        <div class="contact-field">
                            <label for="email">Your email</label>
                            <input type="email" class="form-control" id="email" required autocomplete="email" placeholder="you@company.com">
                            <div class="invalid-feedback">Please enter a valid email</div>
                        </div>
                        <div class="contact-field">
                            <label for="subject">Topic</label>
                            <select class="form-control contact-topic" id="subject" required>
                                <option value="" selected disabled>What's on your mind?</option>
                                <option value="Early access">Early access</option>
                                <option value="Product question">Product question</option>
                                <option value="Partnership">Partnership</option>
                                <option value="Licensing or pricing">Licensing or pricing</option>
                                <option value="Something else">Something else</option>
                            </select>
                            <div class="invalid-feedback">Please choose a topic</div>
                        </div>
                        <button class="btn contact-submit contact-continue" id="contact-continue" type="button">
                            Continue <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="contact-step contact-step-2" id="contact-step-2" hidden>
                        <div class="contact-field">
                            <label for="company">Company</label>
                            <input type="text" class="form-control" id="company" autocomplete="organization" disabled>
                            <div class="invalid-feedback">Please enter your company</div>
                        </div>
                        <div class="contact-field">
                            <label for="usecase">How can we help?</label>
                            <textarea class="form-control" id="usecase" rows="6" disabled placeholder="A few details about your project or question…"></textarea>
                            <div class="invalid-feedback">Please tell us briefly how we can help</div>
                        </div>
                        <div class="contact-field d-none" aria-hidden="true">
                            <label for="title">Title</label>
                            <input type="text" class="form-control" id="title" tabindex="-1" autocomplete="off">
                        </div>
                        <input type="hidden" id="firstname" value="">
                        <input type="hidden" id="lastname" value="">
                        <p class="contact-privacy">By clicking Submit, you acknowledge that Katteli Inc. will process your personal information in accordance with our <a href="/machine/legal/privacy-policy/">privacy policy</a>.</p>
                        <p class="contact-error failed-submission d-none"><span role="error-message">Something went wrong while submitting.</span> Try again, or write us at <strong>contact@testflows.com</strong>.</p>
                        <button class="btn contact-submit" id="submit" type="submit" disabled>
                            <span role="submit">Submit <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                            <span role="processing" class="d-none"><span class="spinner-border text-light" style="width: 1.1em; height: 1.1em;" role="status"></span> Sending…</span>
                        </button>
                    </div>
                </div>
                <div class="contact-success successful-submission d-none">
                    <div class="contact-success-icon" aria-hidden="true"><span class="fas fa-check"></span></div>
                    <h3>Message sent</h3>
                    <p>Thanks — we received your note for <span role="contact-email"></span> and will be in touch shortly. You can also follow up at <strong>contact@testflows.com</strong>.</p>
                </div>
            </form>
        </div>
    </div>
</section>

<script src="/js/contact-form.js"></script>
