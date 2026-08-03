/* Copyright (C) 2026 Katteli Inc. All rights reserved.
 * TestFlows.com Open-Source Software Testing Framework (https://testflows.com)
 *
 * PROPRIETARY AND CONFIDENTIAL.
 *
 * Authors:
 *   Vitaliy Zakaznikov <vzakaznikov@testflows.com>
 */
/** Stripe return page for CLI/TUI buyers (no portal session in this browser).
 * Adapts the message to ?status: success (default), cancelled, or a bare return
 * (e.g. after managing billing). The Sign In button links to the portal. */

const status = (
  new URLSearchParams(window.location.search).get("status") || "success"
).toLowerCase();

const mark = document.getElementById("portal-purchase-mark");
const title = document.getElementById("portal-purchase-title");
const body = document.getElementById("portal-purchase-body");

if (status === "cancelled") {
  if (mark) {
    mark.textContent = "✕";
    mark.style.color = "var(--tf-text-muted)";
  }
  if (title) title.textContent = "Checkout cancelled";
  if (body) {
    body.textContent =
      "No charge was made. You can close this tab and return to your terminal.";
  }
} else if (status !== "success") {
  // A bare return (billing managed, nothing purchased) — keep it neutral.
  if (mark) {
    mark.textContent = "✓";
    mark.style.color = "var(--tf-text-muted)";
  }
  if (title) title.textContent = "All set";
  if (body) {
    body.textContent =
      "You can close this tab and return to your terminal.";
  }
}
