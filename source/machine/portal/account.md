---
title: Account
description: Your TestFlows Machine account
date: 2026-07-31 00:00:00
fullwidth: true
hide_footer: true
portal_nav: true
permalink: machine/portal/account/index.html
---

<section class="portal-page portal-dash">
    <div class="portal-dash-inner">
        <aside class="portal-dash-sidebar" aria-label="Account navigation">
            <div class="portal-dash-brand">
                <span class="portal-dash-brand-title">Account</span>
            </div>
            <label class="portal-dash-mobile-nav" for="portal-dash-select">
                <span class="visually-hidden">Section</span>
                <select id="portal-dash-select" class="form-control portal-select">
                    <option value="overview" data-portal-nav="overview">Overview</option>
                    <option value="credits" data-portal-nav="credits">Credits</option>
                    <option value="activity" data-portal-nav="activity">Activity</option>
                    <option value="buy" data-portal-nav="buy">Buy</option>
                    <option value="billing" data-portal-nav="billing">Billing</option>
                    <option value="invoices" data-portal-nav="invoices">Invoices</option>
                    <option value="orders" data-portal-nav="orders">Orders</option>
                    <option value="keys" data-portal-nav="keys">API keys</option>
                    <option value="devices" data-portal-nav="devices">Devices</option>
                    <option value="storage" data-portal-nav="storage">Storage</option>
                    <option value="settings" data-portal-nav="settings">Settings</option>
                </select>
            </label>
            <nav class="portal-dash-nav">
                <a href="#overview" data-portal-nav="overview"><span class="fas fa-fw fa-house" aria-hidden="true"></span><span>Overview</span></a>
                <a href="#credits" data-portal-nav="credits"><span class="fas fa-fw fa-coins" aria-hidden="true"></span><span>Credits</span></a>
                <a href="#activity" data-portal-nav="activity"><span class="fas fa-fw fa-clock-rotate-left" aria-hidden="true"></span><span>Activity</span></a>
                <a href="#buy" data-portal-nav="buy"><span class="fas fa-fw fa-cart-shopping" aria-hidden="true"></span><span>Buy</span></a>
                <a href="#billing" data-portal-nav="billing"><span class="fas fa-fw fa-credit-card" aria-hidden="true"></span><span>Billing</span></a>
                <a href="#invoices" data-portal-nav="invoices"><span class="fas fa-fw fa-file-invoice" aria-hidden="true"></span><span>Invoices</span></a>
                <a href="#orders" data-portal-nav="orders"><span class="fas fa-fw fa-box" aria-hidden="true"></span><span>Orders</span></a>
                <a href="#keys" data-portal-nav="keys"><span class="fas fa-fw fa-key" aria-hidden="true"></span><span>API keys</span></a>
                <a href="#devices" data-portal-nav="devices"><span class="fas fa-fw fa-laptop" aria-hidden="true"></span><span>Devices</span></a>
                <a href="#storage" data-portal-nav="storage"><span class="fas fa-fw fa-hard-drive" aria-hidden="true"></span><span>Storage</span></a>
                <a href="#settings" data-portal-nav="settings"><span class="fas fa-fw fa-gear" aria-hidden="true"></span><span>Settings</span></a>
            </nav>
            <p class="portal-dash-mark">
                <span class="fas fa-umbrella" aria-hidden="true"></span>
                <span class="portal-dash-mark-title">Machine Dashboard</span>
                <time class="portal-dash-mark-date" id="portal-dash-mark-date" datetime=""></time>
            </p>
        </aside>
        <main class="portal-dash-main">
            <div class="portal-dash-toolbar">
                <div id="portal-account-status" class="portal-status portal-status--dock" hidden role="status" aria-live="polite"></div>
                <button type="button" class="btn btn-ghost portal-dash-refresh" id="portal-account-refresh">
                    <span class="fas fa-spinner" aria-hidden="true"></span>
                    Refresh
                </button>
            </div>
            <div class="portal-dash-panel" data-portal-panel="overview"></div>
            <div class="portal-dash-panel" data-portal-panel="credits" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="activity" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="buy" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="billing" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="invoices" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="orders" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="keys" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="devices" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="storage" hidden></div>
            <div class="portal-dash-panel" data-portal-panel="settings" hidden></div>
        </main>
    </div>
</section>

<div id="portal-stepup" class="portal-modal" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="portal-stepup-title">
    <div class="portal-modal-backdrop" data-portal-stepup-dismiss></div>
    <div class="portal-modal-card">
        <h2 id="portal-stepup-title">Confirm</h2>
        <p id="portal-stepup-hint" class="portal-muted">We'll email a one-time code to confirm.</p>
        <div id="portal-stepup-status" class="portal-status" hidden></div>
        <label class="portal-field">
            <span>Code</span>
            <input id="portal-stepup-code" class="form-control" type="text" inputmode="numeric" autocomplete="one-time-code" />
        </label>
        <div class="portal-actions">
            <button type="button" class="btn btn-ghost" id="portal-stepup-send">Resend code</button>
            <button type="button" class="btn btn-primary" id="portal-stepup-confirm">Confirm</button>
            <button type="button" class="btn btn-ghost" id="portal-stepup-cancel">Cancel</button>
        </div>
    </div>
</div>

<div id="portal-confirm" class="portal-modal" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="portal-confirm-title">
    <div class="portal-modal-backdrop" data-portal-confirm-dismiss></div>
    <div class="portal-modal-card">
        <h2 id="portal-confirm-title">Confirm</h2>
        <p id="portal-confirm-body" class="portal-muted"></p>
        <div class="portal-actions">
            <button type="button" class="btn btn-primary" id="portal-confirm-ok">Confirm</button>
            <button type="button" class="btn btn-ghost" id="portal-confirm-cancel">Cancel</button>
        </div>
    </div>
</div>

<div id="portal-billing-plan" class="portal-modal" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="portal-billing-plan-title">
    <div class="portal-modal-backdrop" data-portal-billing-plan-dismiss></div>
    <div class="portal-modal-card">
        <h2 id="portal-billing-plan-title">Choose plan</h2>
        <p id="portal-billing-plan-note" class="portal-muted" hidden></p>
        <fieldset id="portal-billing-plan-options" class="portal-plan-options"></fieldset>
        <div class="portal-actions">
            <button type="button" class="btn btn-primary" id="portal-billing-plan-ok">Continue</button>
            <button type="button" class="btn btn-ghost" id="portal-billing-plan-cancel">Cancel</button>
        </div>
    </div>
</div>

<script type="module" src="/js/portal/account.js"></script>
