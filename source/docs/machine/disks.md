<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Disks

A disk is what a machine boots, and `machine disks build` makes one. You give
it exactly one source.

| Source | What it takes |
|---|---|
| `--binary path` | a static x86_64 executable, wrapped in a small image |
| `--image ref` | a Docker image, as a save tar or a name in your local Docker |
| `--compose dir` | a Compose project directory and the images its services name |

A binary or an image runs as one container. A Compose project runs every
service in it.

```bash
machine disks build --image myapp:latest app
machine disks build --compose ./deploy stack
```

The name defaults to whatever the source is called. Use `--entrypoint` to
choose the executable the service runs. Flags go before the name, and the
service's own arguments go after a `--`. This one runs `data-race` with the
argument `3`:

```bash
machine disks build --binary ./data-race race -- 3
```

## Building disks on an ARM machine

A machine is an x86_64 computer, so a disk holds `linux/amd64` programs, whatever
machine you build it on. On a Mac with Apple Silicon or on arm64 Linux, Docker
builds and pulls `arm64` images by default, and those cannot run in a machine.
`machine disks build` checks every image and refuses one that is not
`linux/amd64` before uploading anything. Ask Docker for `linux/amd64`:

```bash
docker pull --platform linux/amd64 myapp:latest
docker build --platform linux/amd64 -t myapp:latest .
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f ./deploy/compose.yaml build
```

The last one builds a Compose project's images for `linux/amd64`; setting
`platform: linux/amd64` on each service does the same. Docker builds them under
emulation, which is slower than a native build but works. For `--binary`,
compile for x86_64 Linux, for example `GOOS=linux GOARCH=amd64 go build`.

## Disk size

By default Machine measures what the disk holds and adds a gigabyte. Use
`--size` to set the size you want. Not sure how big it will be? `--dry-run`
reports what the disk would hold without building it.

To manage your disks:

```bash
machine disks list
machine disks show app
machine disks rename app app-v2
machine disks delete app-v2
```

Deleting a disk is permanent. Machine refuses to delete one that a run still
boots, and `--force` deletes it anyway and takes those runs with it.
`machine disks transfers` shows the transfers in progress, and
`machine disks cancel` stops one.
