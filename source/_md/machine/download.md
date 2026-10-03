<!-- agents: TestFlows Machine client download page. Index: https://testflows.com/docs/machine.md -->

# Download client

> The Machine client is one small program called `machine`. Pick your system.

TestFlows Machine is a deterministic execution machine in the cloud, provided as a self-serve service: you can sign up for free, and paid plans are available. It runs software built for Linux x86_64 and controls time, interrupts, random numbers and device input, so every run can be recorded, replayed exactly, and branched from any point to explore other outcomes.

## Install

Run this in a terminal.

```bash
curl https://testflows.com/machine/install -fsS | bash
```

It verifies the download and puts the client in `~/.local/bin`, with `machine-env` beside it. It never asks for root. Run the same command again to update.

| System | Status |
|---|---|
| Linux, x86_64 | Supported |
| Linux, ARM64 | Supported. See the note about disks below. |
| Mac, Apple Silicon (ARM64) | Supported. The installer installs under `~/.local/share/machine/` and links it from `~/.local/bin`, with `machine-env` beside the link. It never asks for your password. macOS already has a `machine` command, so use `machine-env` below. Macs with an Intel processor are not supported. |
| Windows | Use WSL, the Linux that comes with Windows. There is no native Windows build. |
| Other | Not supported. Tell us which one: https://testflows.com/contact.html?topic=machine |

### machine-env

The installer writes `machine-env` beside `machine` on every system. It starts a shell in which `machine` is this client, ahead of any other `machine` on your PATH. The prompt starts with `(machine)`, your usual shell setup is loaded, and `exit` leaves. It supports zsh and bash.

```bash
machine-env
machine-env -- machine --version
```

The second form runs one command in that environment and starts no shell, for scripts and CI.

**On macOS, use it.** macOS ships `/usr/bin/machine`, which prints the processor type, such as `arm64`. Typing `machine` runs that one unless this client comes first on your PATH, and putting it first hides the system one for every other program. `machine-env` avoids both. To see which `machine` you get, run `which machine`: `~/.local/bin/machine` is this client and `/usr/bin/machine` is the system's. If `machine --version` prints a processor type instead of a version, you are running the system command. If your shell cannot find `machine-env` either, run `~/.local/bin/machine-env`.

On Linux nothing else is called `machine` by default, so you rarely need it.

### Windows

The client runs inside WSL. If you do not have WSL yet, install it from PowerShell, then restart:

```powershell
wsl --install
```

Open your Linux distribution and follow the Linux steps. `uname -m` prints `x86_64` or `aarch64` there.

### Disks hold x86_64 programs

On ARM, whether a Mac with Apple Silicon or ARM64 Linux, a machine is still an x86_64 computer, so its disks hold `linux/amd64` programs. Docker on ARM builds `arm64` images by default, so ask for `linux/amd64`:

```bash
docker build --platform linux/amd64 -t myapp:latest .
docker pull --platform linux/amd64 myapp:latest
```

The docs cover Compose projects and binaries: https://testflows.com/docs/machine/disks.md

## Check the download

The installer already verifies every download. To check by hand, download the files without installing them, with your version in place of `YYYYMMDD-HHMM` (`machine --version` shows it):

```bash
mkdir machine-check && cd machine-check
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash -s -- --download
```

That fetches the client, its checksum, and two signatures of the checksum. The file names are `machine` on Linux x86_64, `machine-linux-arm64` on Linux ARM64 and `machine-darwin-arm64.tar.gz` on a Mac. We sign only the checksum, so verify the signature first, with either tool. The commands below use the Linux x86_64 names; use your system's file name in their place. A Mac ships with `openssl` but not `gpg`.

With GPG, the key's fingerprint must match the published fingerprint, https://testflows.com/machine/keys/machine-client-gpg.fingerprint. `gpg` then prints `Good signature`; its warning that the key is not certified is normal.

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-gpg.asc
gpg --show-keys --fingerprint machine-client-gpg.asc
gpg --import machine-client-gpg.asc
gpg --verify machine.sha256.asc machine.sha256
```

With openssl, a good signature prints `Verified OK`:

```bash
curl -fsSO https://testflows.com/machine/keys/machine-client-rsa.pub.pem
openssl dgst -sha256 -verify machine-client-rsa.pub.pem -signature machine.sha256.sig machine.sha256
```

Last, check the file against the checksum, and against the client you installed. If a check fails, delete the client and install again.

```bash
sha256sum -c machine.sha256
cmp machine "$(command -v machine)"
```

On a Mac, check the archive against the checksum. If it fails, delete it and install again.

```bash
shasum -a 256 -c machine-darwin-arm64.tar.gz.sha256
```

To read the installer before you run it, pipe it to `less` instead of `bash`.

## Release keys

Every release's checksum is signed with two keys: a GPG key, https://testflows.com/machine/keys/machine-client-gpg.asc, whose fingerprint is at https://testflows.com/machine/keys/machine-client-gpg.fingerprint, and an RSA key for openssl, https://testflows.com/machine/keys/machine-client-rsa.pub.pem. If the keys change, this page and the installer carry the new ones. A check that fails with an old key should pass once you download again.

## A specific version

The installer gets the latest release. To install a particular one, set `MACHINE_VERSION`:

```bash
curl https://testflows.com/machine/install -fsS | MACHINE_VERSION=YYYYMMDD-HHMM bash
```

Set `MACHINE_INSTALL_DIR` to install somewhere other than `~/.local/bin`. `--no-signature` and `--no-checksum` skip checks; a normal install needs neither.

## Uninstall

Sign out, then delete the client and what it stored.

```bash
machine logout
rm ~/.local/bin/machine ~/.local/bin/machine-env
rm -rf ~/.cache/machine ~/.testflows/machine
```

On a Mac the client is under `~/.local/share/machine`, not `~/.cache/machine`:

```bash
machine logout
rm ~/.local/bin/machine ~/.local/bin/machine-env
rm -rf ~/.local/share/machine ~/.testflows/machine
```

## Then

Create an account at https://testflows.com/machine/portal/signup/, then sign in with `machine login`. Then run `machine account provision` to set up account storage. The first session cannot be created until that is done. The docs walk through your first run: https://testflows.com/docs/machine/getting-started.md
