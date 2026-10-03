<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Disks

A disk is what a machine boots, and [`machine disks build`](commands.md#machine-disks-build) makes one. You give
it exactly one source.

| Source | What it takes |
|---|---|
| `--binary path` | a static x86_64 executable, wrapped in a small image |
| `--image ref` | a Docker image, as a save tar or a name in your local Docker |
| `--compose dir` | a Compose project directory and the images its services name |

A binary or an image runs as one container. A Compose project runs every
service in it.

## Docker and Compose

An image needs [Docker](https://www.docker.com/). A Compose project also needs
[Docker Compose](https://docs.docker.com/compose/). [`machine disks build`](commands.md#machine-disks-build)
`--binary` wraps a static executable and nothing else, so a program you compile
does not need either. The executable has to be self-contained. The image has
no loader and no libraries, so a dynamically linked program cannot run.

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

## When the program is not static

A program that is not a static executable needs an image that already contains
what it runs. The same approach works for anything that needs its own runtime.
A complex application, several services together, is a [Compose](disks.md#compose-project) project.

### Python program

Save this as `hello.py`.

```python
print("hello, world")
```

```dockerfile
FROM python:3.12
COPY hello.py /
CMD ["python3", "/hello.py"]
```

```bash
docker build --platform linux/amd64 -t hello-py:latest .
machine disks build --image hello-py:latest hello-py
```

### Node.js program

Save this as `hello.js`.

```javascript
console.log("hello, world")
```

```dockerfile
FROM node:22
COPY hello.js /
CMD ["node", "/hello.js"]
```

```bash
docker build --platform linux/amd64 -t hello-node:latest .
machine disks build --image hello-node:latest hello-node
```

### Compose project

A complex application is a Compose project. Each service names an image, with
a tag, that already contains what it runs. [`machine disks build`](commands.md#machine-disks-build)
`--compose` takes the project directory and runs every service in it. Save
this as `compose.yaml`.

```yaml
services:
  web:
    image: hello-py:latest
  db:
    image: postgres:16
```

```bash
machine disks build --compose . app
```

## Building disks on an ARM machine

A machine is an x86_64 computer, so a disk holds `linux/amd64` programs, whatever
machine you build it on. On a Mac with Apple Silicon or on arm64 Linux, Docker
builds and pulls `arm64` images by default, and those cannot run in a machine.
[`machine disks build`](commands.md#machine-disks-build) checks every image and refuses one that is not
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
[`machine disks transfers`](commands.md#machine-disks-transfers) shows the transfers in progress, and
[`machine disks cancel`](commands.md#machine-disks-cancel) stops one.
