---
title: Download
description: Download the Machine client for Linux and macOS.
fullwidth: true
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

<p>It verifies the download and puts the client in <code>~/.local/bin</code>, with <code>machine-env</code> beside it. It never asks for root. Run the same command again to update.</p>
<p>The client needs the OpenSSH client, <code>ssh</code>, which most Linux systems have. If yours does not, run <code>sudo apt install openssh-client</code> on Debian and Ubuntu.</p>
</div>

<!-- include: _download-next.md -->

<div class="download-section download-note">
<h2>machine-env</h2>
<p>The installer also writes <code>machine-env</code> beside <code>machine</code>. It starts a shell in which <code>machine</code> is this client, ahead of any other <code>machine</code> on your PATH. If another command on your system is also named <code>machine</code>, use <code>machine-env</code>. <code>which machine</code> shows which one you get. It is the same file on every system. The prompt starts with <code>(machine)</code>, your usual shell setup is loaded, and <code>exit</code> leaves. It supports zsh and bash.</p>

```bash
$ machine-env
(machine) $ machine login
(machine) $ machine --version
(machine) $ exit
$
```

<p>The <code>(machine)</code> at the start of the prompt says you are in it: there <code>machine</code> is this client. <code>exit</code> leaves it, back to the shell you were in. To run one command there without starting a shell:</p>

```bash
machine-env -- machine --version
```

<p>That form runs one command in that environment and starts no shell, for scripts.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already verifies every download. To check by hand, download the files without installing them, with your version in place of <code>YYYYMMDD-HHMM</code> (<code>machine --version</code> shows it):</p>

```bash
mkdir machine-check && cd machine-check
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --download
```

<p>That fetches <code>machine</code>, its checksum, and two signatures of the checksum. We sign only the checksum, so verify the signature first, with either tool.</p>

<p>With GPG, the key's fingerprint must match the <a href="/machine/keys/machine-client-gpg.fingerprint">GPG fingerprint</a>. gpg then prints <code>Good signature</code>; its warning that the key is not certified is normal.</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-gpg.asc
gpg --show-keys --fingerprint machine-client-gpg.asc
gpg --import machine-client-gpg.asc
gpg --verify machine.sha256.asc machine.sha256
```

<p>With openssl, a good signature prints <code>Verified OK</code>:</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-rsa.pub.pem
openssl dgst -sha256 -verify machine-client-rsa.pub.pem -signature machine.sha256.sig machine.sha256
```

<p>Last, check the file against the checksum, and against the client you installed. If a check fails, delete the client and install again.</p>

```bash
sha256sum -c machine.sha256
cmp machine "$(command -v machine)"
```

<p>To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, then delete the client and what it stored.</p>

```bash
machine logout
rm ~/.local/bin/machine ~/.local/bin/machine-env
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

<p>It verifies the download and puts the client in <code>~/.local/bin</code>, with <code>machine-env</code> beside it. It never asks for root. Run the same command again to update.</p>
<p>The client needs the OpenSSH client, <code>ssh</code>, which most Linux systems have. If yours does not, run <code>sudo apt install openssh-client</code> on Debian and Ubuntu.</p>
</div>

<!-- include: _download-next.md -->

<div class="download-section download-note">
<h2>machine-env</h2>
<p>The installer also writes <code>machine-env</code> beside <code>machine</code>. It starts a shell in which <code>machine</code> is this client, ahead of any other <code>machine</code> on your PATH. If another command on your system is also named <code>machine</code>, use <code>machine-env</code>. <code>which machine</code> shows which one you get. It is the same file on every system. The prompt starts with <code>(machine)</code>, your usual shell setup is loaded, and <code>exit</code> leaves. It supports zsh and bash.</p>

```bash
$ machine-env
(machine) $ machine login
(machine) $ machine --version
(machine) $ exit
$
```

<p>The <code>(machine)</code> at the start of the prompt says you are in it: there <code>machine</code> is this client. <code>exit</code> leaves it, back to the shell you were in. To run one command there without starting a shell:</p>

```bash
machine-env -- machine --version
```

<p>That form runs one command in that environment and starts no shell, for scripts.</p>
</div>

<div class="download-section download-note">
<h2>Disks hold x86_64 programs</h2>
<p>A machine is an x86_64 computer, so its disks hold <code>linux/amd64</code> programs. Docker on ARM builds <code>arm64</code> images by default, so ask for <code>linux/amd64</code>:</p>

```bash
docker build --platform linux/amd64 -t myapp:latest .
docker pull --platform linux/amd64 myapp:latest
```

<p>The <a href="/docs/machine/#Building-disks-on-an-ARM-machine">docs</a> cover Compose projects and binaries.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already verifies every download. To check by hand, download the files without installing them, with your version in place of <code>YYYYMMDD-HHMM</code> (<code>machine --version</code> shows it):</p>

```bash
mkdir machine-check && cd machine-check
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --download
```

<p>That fetches <code>machine-linux-arm64</code>, its checksum, and two signatures of the checksum. We sign only the checksum, so verify the signature first, with either tool.</p>

<p>With GPG, the key's fingerprint must match the <a href="/machine/keys/machine-client-gpg.fingerprint">GPG fingerprint</a>. gpg then prints <code>Good signature</code>; its warning that the key is not certified is normal.</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-gpg.asc
gpg --show-keys --fingerprint machine-client-gpg.asc
gpg --import machine-client-gpg.asc
gpg --verify machine-linux-arm64.sha256.asc machine-linux-arm64.sha256
```

<p>With openssl, a good signature prints <code>Verified OK</code>:</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-rsa.pub.pem
openssl dgst -sha256 -verify machine-client-rsa.pub.pem -signature machine-linux-arm64.sha256.sig machine-linux-arm64.sha256
```

<p>Last, check the file against the checksum, and against the client you installed. If a check fails, delete the client and install again.</p>

```bash
sha256sum -c machine-linux-arm64.sha256
cmp machine-linux-arm64 "$(command -v machine)"
```

<p>To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, then delete the client and what it stored.</p>

```bash
machine logout
rm ~/.local/bin/machine ~/.local/bin/machine-env
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

<p>It verifies the download, installs the client under <code>~/.local/share/machine/</code>, and links it from <code>~/.local/bin</code>, with <code>machine-env</code> beside the link. It never asks for your password. Run the same command again to update.</p>
<p>Macs with an Intel processor are not supported.</p>
<p><strong>macOS already has a <code>machine</code> command.</strong> Use <code>machine-env</code>, below, to run this one.</p>
</div>

<!-- include: _download-next.md -->

<div class="download-section download-note">
<h2>macOS has its own machine command</h2>
<p>macOS ships <code>/usr/bin/machine</code>, which prints the processor type, such as <code>arm64</code>. Typing <code>machine</code> runs that one unless this client comes first on your PATH, and putting it first hides the system one for every other program. <code>machine-env</code> avoids both. It starts a shell in which <code>machine</code> is this client and leaves the rest of your system alone. The prompt starts with <code>(machine)</code>, your usual shell setup is loaded, and <code>exit</code> leaves. It supports zsh and bash.</p>

```bash
$ machine-env
(machine) $ machine login
(machine) $ machine --version
(machine) $ exit
$
```

<p>The <code>(machine)</code> at the start of the prompt says you are in it: there <code>machine</code> is this client. <code>exit</code> leaves it, back to the shell you were in. To run one command there without starting a shell:</p>

```bash
machine-env -- machine --version
```

<p>That form runs one command in that environment and starts no shell, for scripts and CI. To see which <code>machine</code> you get, run <code>which machine</code>: <code>~/.local/bin/machine</code> is this client and <code>/usr/bin/machine</code> is the system's. If <code>machine --version</code> prints a processor type instead of a version, you are running the system command. If your shell cannot find <code>machine-env</code> either, run <code>~/.local/bin/machine-env</code>. Linux and every other system get the same file.</p>
</div>

<div class="download-section download-note">
<h2>Disks hold x86_64 programs</h2>
<p>A machine is an x86_64 computer, so its disks hold <code>linux/amd64</code> programs. Docker on ARM builds <code>arm64</code> images by default, so ask for <code>linux/amd64</code>:</p>

```bash
docker build --platform linux/amd64 -t myapp:latest .
docker pull --platform linux/amd64 myapp:latest
```

<p>The <a href="/docs/machine/#Building-disks-on-an-ARM-machine">docs</a> cover Compose projects and binaries.</p>
</div>

<div class="download-section">
<h2>Check the download</h2>
<p>The installer already verifies every download. To check by hand, download the files without installing them, with your version in place of <code>YYYYMMDD-HHMM</code> (<code>machine --version</code> shows it):</p>

```bash
mkdir machine-check && cd machine-check
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --download
```

<p>That fetches <code>machine-darwin-arm64.tar.gz</code>, its checksum, and two signatures of the checksum. We sign only the checksum, so verify the signature first, with either tool. Macs ship with openssl but not gpg.</p>

<p>With GPG, the key's fingerprint must match the <a href="/machine/keys/machine-client-gpg.fingerprint">GPG fingerprint</a>. gpg then prints <code>Good signature</code>; its warning that the key is not certified is normal.</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-gpg.asc
gpg --show-keys --fingerprint machine-client-gpg.asc
gpg --import machine-client-gpg.asc
gpg --verify machine-darwin-arm64.tar.gz.sha256.asc machine-darwin-arm64.tar.gz.sha256
```

<p>With openssl, a good signature prints <code>Verified OK</code>:</p>

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-rsa.pub.pem
openssl dgst -sha256 -verify machine-client-rsa.pub.pem -signature machine-darwin-arm64.tar.gz.sha256.sig machine-darwin-arm64.tar.gz.sha256
```

<p>Last, check the archive against the checksum. If it fails, delete it and install again.</p>

```bash
shasum -a 256 -c machine-darwin-arm64.tar.gz.sha256
```

<p>To read the installer before you run it, pipe it to <code>less</code> instead of <code>bash</code>.</p>
</div>

<div class="download-section">
<h2>Uninstall</h2>
<p>Sign out, then delete the client and what it stored.</p>

```bash
machine logout
rm ~/.local/bin/machine ~/.local/bin/machine-env
rm -rf ~/.local/share/machine ~/.testflows/machine
```

</div>
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-windows" aria-labelledby="tab-windows">

<div class="download-section">
<h2>Install</h2>
<p>The client runs inside WSL, the Linux that comes with Windows. If you don't have WSL yet, install it from PowerShell, then restart:</p>

```powershell
wsl --install
```

<p>Open your Linux distribution and follow the steps for <a href="#linux-x86_64">Linux (x64)</a>, or <a href="#linux-arm64">Linux (ARM64)</a> on Windows on ARM. Not sure which? <code>uname -m</code> prints <code>x86_64</code> or <code>aarch64</code>.</p>
</div>

<!-- include: _download-next.md -->
</div>

<div class="tab-pane fade" role="tabpanel" id="platform-others" aria-labelledby="tab-others">

<div class="download-section">
<h2>Other systems</h2>
<p>Linux (x64 and ARM64) and Macs with Apple Silicon are supported. On Windows, use <a href="#windows">WSL</a>.</p>
<p>Need another platform? <a href="/contact.html?topic=machine">Tell us which one</a>.</p>
</div>
</div>

</div>

<div class="download-section">
<h2>Release keys</h2>
<p>Every release's checksum is signed with two keys: a <a href="/machine/keys/machine-client-gpg.asc">GPG key</a>, whose fingerprint is published as the <a href="/machine/keys/machine-client-gpg.fingerprint">GPG fingerprint</a>, and an <a href="/machine/keys/machine-client-rsa.pub.pem">RSA key</a> for openssl.</p>
<p>If the keys change, this page and the installer carry the new ones. A check that fails with an old key should pass once you download again.</p>
</div>

<div class="download-section">
<h2>A specific version</h2>
<p>The installer gets the latest release. <code>--list</code> shows the versions there are, newest first, and <code>--version</code> installs one of them:</p>

```bash
curl https://testflows.com/machine/install -fsS | bash -s -- --list
curl https://testflows.com/machine/install -fsS | bash -s -- --version YYYYMMDD-HHMM
```

<p>Set <code>MACHINE_INSTALL_DIR</code> to install somewhere other than <code>~/.local/bin</code>. <code>--no-signature</code> and <code>--no-checksum</code> skip checks; a normal install needs neither.</p>
</div>

</div>
</section>
