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
A complex application, several services together, is a [Compose project](disks.md#compose-projects).

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

## Compose projects

[Machine-Examples](https://github.com/testflows/Machine-Examples) has Compose
environments under `compose/`. Clone it, pull each image for `linux/amd64`
into the local Docker, then build the disk from the project directory.
[`machine disks build`](commands.md#machine-disks-build) `--compose` packs
those images and the project. The machine runs the project with
`--abort-on-container-exit`, so it ends when a service exits.

```bash
git clone https://github.com/testflows/Machine-Examples.git
cd Machine-Examples
```

The same project can be run on this computer first, from its own directory,
which is how to fix it without waiting for a boot. The build commands below
are from the repository root.

### Two services project

`compose/two-services` is a busybox server and a client that fetches a file
from it by the service name `server`. Services in a project reach each other
by name, on the network Compose gives the project.

`depends_on` only orders the start. The client retries, because nothing waits
for the server to accept connections. A service that takes time to become
ready should use a healthcheck, and `depends_on` with
`condition: service_healthy`.

```bash
docker pull --platform linux/amd64 busybox:1.36
machine disks build --compose compose/two-services two
```

To run it on this computer first:

```bash
cd compose/two-services
docker compose up --abort-on-container-exit
```

### ClickHouse project

`compose/clickhouse` is a ClickHouse server and a client that queries it.
Both services use one image, so the disk carries that image once. The client
waits until the server is healthy, prints its result, and exits, which ends
the project.

The server takes tens of seconds of machine time before it accepts a query,
so the project uses a healthcheck rather than a sleep. `config.xml` in the
project replaces the image's config. It listens on IPv4 only, because the
machine's kernel has no IPv6, and it caps the background pools, because the
image's defaults hang startup in a small machine. `CLICKHOUSE_SKIP_USER_SETUP`
stops the entrypoint from restricting the `default` user to loopback, which
would refuse the client.

The config is mounted from `./config.xml`, a path inside the project. A bind
mount from outside the project directory is refused. A named volume or a
tmpfs is created empty when the machine boots.

```bash
docker pull --platform linux/amd64 clickhouse/clickhouse-server:24.8.14.39-alpine
machine disks build --compose compose/clickhouse ch
```

### Carrying images

A service can start containers of its own, through the machine's Docker. The
images it starts are named by no service this project runs, and a machine
reaches no registry, so an image that is not named here is not on the disk.

`scale: 0` names an image and starts nothing. The build packs every image the
project names, including these, and Compose starts none of them.
`compose/clickhouse-regression` carries the images its suite starts this way.
Another image, such as ZooKeeper or MinIO, is another service.

```yaml
services:
  regression:
    image: regression-runner:local
    working_dir: /opt/compose
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./:/opt/compose
  carried_server:
    image: clickhouse/clickhouse-server:24.8.14.39-alpine
    scale: 0
```

The socket is `/var/run/docker.sock`. `/run/docker.sock` is not the machine's
socket, and the build refuses it.

`./` is mounted at `/opt/compose`, the path the machine runs the project from.
Compose resolves a bind on the machine's filesystem, not inside the container
that asked for it, so the two paths have to be the same. The images still have
to be in the local Docker, under those names, before the build.

### What a project must satisfy

Every service names an `image` with a tag or a digest. An image with no tag
is a different image tomorrow, and a service that only has `build` has nothing
to pack. Build the image, then set `image`.

The images have to be `linux/amd64` and already in the local Docker. A
logging driver, if the project sets one, is `json-file`, `local`, or `none`.

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
