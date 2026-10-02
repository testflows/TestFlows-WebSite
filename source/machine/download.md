---
title: Download
description: Download the Machine client for Linux.
fullwidth: true
sitemap: false
permalink: machine/download/index.html
---

<section class="download-page">
<div class="container">

<header class="download-header">
<h1>Download client</h1>
<p>The Machine client is one small program called <code>machine</code>. It runs on Linux (x86_64).</p>
</header>

<div class="download-section">
<h2>Install</h2>
<p>Run this in a terminal.</p>

```bash
curl https://testflows.com/machine/install -fsS | bash
```

<p>It downloads the client over HTTPS, checks it against its published SHA-256 checksum, and puts it in <code>~/.local/bin</code>. It never asks for root. If that folder isn't on your <code>PATH</code> yet, it shows the line to add for your shell. Run the same command again to update.</p>
<p>On its first run the client unpacks itself into <code>~/.cache/machine/</code>, about 80 MB. An update removes what older versions unpacked there.</p>
</div>

<div class="download-section">
<h2>Supported systems</h2>
<table class="download-table">
<thead><tr><th>System</th><th>Status</th></tr></thead>
<tbody>
<tr><td>Linux, x86_64</td><td class="is-yes">Supported</td></tr>
<tr><td>Windows</td><td>Use it inside WSL, which is Linux. No native build yet.</td></tr>
<tr><td>macOS</td><td>Not available yet</td></tr>
<tr><td>Linux, ARM64</td><td>Not available yet</td></tr>
</tbody>
</table>
<p>Need another platform? <a href="/contact.html?topic=machine">Tell us which one</a>.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already checks what it downloads. The checksum catches a corrupt or cut-short download; HTTPS is what protects the download itself. To check a file yourself, compare its checksum with the one published for its version.</p>
<p>First, find your version. It is on the banner line, a date and time like <code>YYYYMMDD-HHMM</code>.</p>

```bash
machine --version
```

<p>Then print the checksum published for that version, and the checksum of your file. Put your version in place of <code>YYYYMMDD-HHMM</code>.</p>

```bash
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --checksum
sha256sum "$(command -v machine)"
```

<p>Both lines should start with the same 64 characters. If they don't, delete the file and install again. To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>A specific version</h2>
<p>The installer gets the latest release. To install a particular one, set <code>MACHINE_VERSION</code> to it, in place of <code>YYYYMMDD-HHMM</code>:</p>

```bash
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash
```

<p><code>MACHINE_INSTALL_DIR</code> installs somewhere other than <code>~/.local/bin</code>. <code>machine --version</code> tells you which version you have.</p>
</div>

<div class="download-section">
<h2 id="Uninstall">Uninstall</h2>
<p>Sign out, so the session ends on the server too, then delete the client, what it unpacked, and its sign-in and keys:</p>

```bash
machine logout
rm ~/.local/bin/machine
rm -rf ~/.cache/machine ~/.testflows/machine
```

<p>Nothing else on your system is changed.</p>
</div>

<div class="download-section download-next">
<h2>Then</h2>
<p>Sign in with <code>machine login</code>, or create an account first. The docs walk through your first run.</p>
<div class="download-actions">
<a class="section-cta" href="/machine/portal/signup/">Create account</a>
<a class="section-cta section-cta-ghost" href="/docs/machine/#Your-first-run">Your first run</a>
</div>
</div>

</div>
</section>
