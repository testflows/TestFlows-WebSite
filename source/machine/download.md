---
title: Download
description: Download the Machine client for Linux and macOS.
fullwidth: true
sitemap: false
permalink: machine/download/index.html
---

<section class="download-page">
<div class="container">

<header class="download-header">
<h1>Download client</h1>
<p>The Machine client is one small program called <code>machine</code>. Pick your system.</p>
</header>

<ul class="nav nav-tabs platform-tabs" role="tablist" aria-label="Your system">
<li class="nav-item"><a class="nav-link active" id="tab-linux-x86_64" data-toggle="tab" href="#platform-linux-x86_64" role="tab" aria-controls="platform-linux-x86_64" aria-selected="true"><i class="fab fa-linux" aria-hidden="true"></i> Linux (x64)</a></li>
<li class="nav-item"><a class="nav-link" id="tab-linux-arm64" data-toggle="tab" href="#platform-linux-arm64" role="tab" aria-controls="platform-linux-arm64" aria-selected="false"><i class="fab fa-linux" aria-hidden="true"></i> Linux (ARM64)</a></li>
<li class="nav-item"><a class="nav-link" id="tab-macos" data-toggle="tab" href="#platform-macos" role="tab" aria-controls="platform-macos" aria-selected="false"><i class="fab fa-apple" aria-hidden="true"></i> Mac (ARM64)</a></li>
<li class="nav-item"><a class="nav-link" id="tab-windows" data-toggle="tab" href="#platform-windows" role="tab" aria-controls="platform-windows" aria-selected="false"><i class="fab fa-windows" aria-hidden="true"></i> Windows (WSL)</a></li>
<li class="nav-item"><a class="nav-link" id="tab-others" data-toggle="tab" href="#platform-others" role="tab" aria-controls="platform-others" aria-selected="false">Others</a></li>
</ul>

<div class="tab-content platform-content">

<div class="tab-pane fade show active" role="tabpanel" id="platform-linux-x86_64" aria-labelledby="tab-linux-x86_64">

<div class="download-section">
<h2>Install</h2>
<p>Run this in a terminal.</p>

```bash
curl https://testflows.com/machine/install -fsS | bash
```

<p>It downloads the client over HTTPS, checks it against its published SHA-256 checksum, and puts it in <code>~/.local/bin</code>. It never asks for root, and needs <code>curl</code> or <code>wget</code>. If that folder isn't on your <code>PATH</code> yet, it shows the line to add for your shell. Run the same command again to update.</p>
<p>The client unpacks itself into <code>~/.cache/machine/</code> on its first run. An update removes what older versions left there.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already checks what it downloads. The checksum catches a corrupt or cut-short download; HTTPS is what protects the download itself. To check the installed client yourself, compare its checksum with the one published for its version. Find your version on the banner line, a date and time like <code>YYYYMMDD-HHMM</code>, then put it in place of <code>YYYYMMDD-HHMM</code> below.</p>

```bash
machine --version
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --checksum
sha256sum "$(command -v machine)"
```

<p>The last two lines should start with the same 64 characters. If they don't, delete the file and install again. To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, so the session ends on the server too, then delete the client, what it unpacked, and its sign-in and keys. Nothing else on your system is changed.</p>

```bash
machine logout
rm ~/.local/bin/machine
rm -rf ~/.cache/machine ~/.testflows/machine
```

</div>
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-linux-arm64" aria-labelledby="tab-linux-arm64">

<div class="download-section">
<h2>Install</h2>
<p>Run this in a terminal.</p>

```bash
curl https://testflows.com/machine/install -fsS | bash
```

<p>It downloads the client over HTTPS, checks it against its published SHA-256 checksum, and puts it in <code>~/.local/bin</code>. It never asks for root, and needs <code>curl</code> or <code>wget</code>. If that folder isn't on your <code>PATH</code> yet, it shows the line to add for your shell. Run the same command again to update.</p>
<p>The client unpacks itself into <code>~/.cache/machine/</code> on its first run. An update removes what older versions left there.</p>
</div>

<div class="download-section download-note">
<h2>Disks hold x86_64 programs</h2>
<p>A machine is an x86_64 computer, so the disks you build hold <code>linux/amd64</code> programs. Docker on arm64 builds and pulls <code>arm64</code> images by default; ask it for <code>linux/amd64</code>:</p>

```bash
docker build --platform linux/amd64 -t myapp:latest .
docker pull --platform linux/amd64 myapp:latest
```

<p>The <a href="/docs/machine/#Building-disks-on-an-ARM-machine">docs</a> cover Compose projects and binaries.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already checks what it downloads. The checksum catches a corrupt or cut-short download; HTTPS is what protects the download itself. To check the installed client yourself, compare its checksum with the one published for its version. Find your version on the banner line, a date and time like <code>YYYYMMDD-HHMM</code>, then put it in place of <code>YYYYMMDD-HHMM</code> below.</p>

```bash
machine --version
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --checksum
sha256sum "$(command -v machine)"
```

<p>The last two lines should start with the same 64 characters. If they don't, delete the file and install again. To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, so the session ends on the server too, then delete the client, what it unpacked, and its sign-in and keys. Nothing else on your system is changed.</p>

```bash
machine logout
rm ~/.local/bin/machine
rm -rf ~/.cache/machine ~/.testflows/machine
```

</div>
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-macos" aria-labelledby="tab-macos">

<div class="download-section">
<h2>Install</h2>
<p>Run this in Terminal.</p>

```bash
curl https://testflows.com/machine/install -fsS | bash
```

<p>It downloads the client over HTTPS, checks it against its published SHA-256 checksum, unpacks it into <code>~/.local/share/machine/</code>, and links <code>~/.local/bin/machine</code> to it. It never asks for your password. If <code>~/.local/bin</code> isn't on your <code>PATH</code> yet, it shows the line to add for your shell. Run the same command again to update; an update removes the older version.</p>
<p>Macs with an Intel processor are not supported.</p>
</div>

<div class="download-section download-note">
<h2>Disks hold x86_64 programs</h2>
<p>A machine is an x86_64 computer, so the disks you build hold <code>linux/amd64</code> programs. Docker on Apple Silicon builds and pulls <code>arm64</code> images by default; ask it for <code>linux/amd64</code>:</p>

```bash
docker build --platform linux/amd64 -t myapp:latest .
docker pull --platform linux/amd64 myapp:latest
```

<p>The <a href="/docs/machine/#Building-disks-on-an-ARM-machine">docs</a> cover Compose projects and binaries.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer checks the archive it downloads against its published SHA-256 checksum before it unpacks it. The checksum catches a corrupt or cut-short download; HTTPS is what protects the download itself. To check it yourself, download the archive and its checksum for your version and compare them. Find your version on the banner line, a date and time like <code>YYYYMMDD-HHMM</code>, then put it in place of <code>YYYYMMDD-HHMM</code> below.</p>

```bash
machine --version
curl -fsSO https://testflows-machine-client.fsn1.your-objectstorage.com/YYYYMMDD-HHMM/machine-darwin-arm64.tar.gz
curl -fsSO https://testflows-machine-client.fsn1.your-objectstorage.com/YYYYMMDD-HHMM/machine-darwin-arm64.tar.gz.sha256
shasum -a 256 -c machine-darwin-arm64.tar.gz.sha256
```

<p>The last line should print <code>machine-darwin-arm64.tar.gz: OK</code>. If it doesn't, install again. To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, so the session ends on the server too, then delete the client and its sign-in and keys. Nothing else on your Mac is changed.</p>

```bash
machine logout
rm ~/.local/bin/machine
rm -rf ~/.local/share/machine ~/.testflows/machine
```

</div>
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-windows" aria-labelledby="tab-windows">

<div class="download-section">
<h2>Install</h2>
<p>The client runs inside WSL, the Linux that comes with Windows; there is no native Windows build. If you don't have WSL yet, install it from PowerShell, then restart:</p>

```powershell
wsl --install
```

<p>Open your Linux distribution, Ubuntu by default, and install the client there with the Linux steps: <a href="#linux-x86_64">Linux (x64)</a> on most PCs, or <a href="#linux-arm64">Linux (ARM64)</a> on Windows on ARM. Not sure which? Run <code>uname -m</code> in WSL: <code>x86_64</code> or <code>aarch64</code>.</p>
</div>
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-others" aria-labelledby="tab-others">

<div class="download-section">
<h2>Other systems</h2>
<p>The client runs on Linux (x64 and ARM64) and on Macs with Apple Silicon. Macs with an Intel processor are not supported, and there is no native Windows build; on Windows, use <a href="#windows">WSL</a>.</p>
<p>Need another platform? <a href="/contact.html?topic=machine">Tell us which one</a>.</p>
</div>
</div>

</div>

<div class="download-section">
<h2>A specific version</h2>
<p>The installer gets the latest release. To install a particular one, set <code>MACHINE_VERSION</code> to it, in place of <code>YYYYMMDD-HHMM</code>:</p>

```bash
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash
```

<p><code>MACHINE_INSTALL_DIR</code> installs somewhere other than <code>~/.local/bin</code>. <code>machine --version</code> tells you which version you have.</p>
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
