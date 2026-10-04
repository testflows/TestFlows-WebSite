<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Disks

A disk is what a machine boots, and [`machine disks build`](commands.md#machine-disks-build) makes one. You give
it exactly one source.

| Source | What it takes |
|---|---|
| `--binary path` | a static x86_64 executable, wrapped in a `scratch` image |
| `--from ref` | a public image, by name, with the files you add to it |
| `--image ref` | a Docker image of your own, as a save tar or a name in your local Docker |
| `--compose dir` | a Compose project directory and the images its services name |

Everything a machine runs runs in Docker Compose, inside the machine. A
Compose project is one container for each of its services. An image or a binary
is a project of one service, and `--entrypoint` and the arguments after `--` are
that service's entrypoint and command. A binary is no exception: `--binary`
wraps the executable in a `scratch` image, one layer holding that file and
nothing else, with no base image, no loader and no libraries, and the machine
runs that image as its one service. `machine` writes this image itself, so
`--binary` needs no Docker on your computer.

## Docker and Compose

An image of your own needs [Docker](https://www.docker.com/). A Compose project
also needs [Docker Compose](https://docs.docker.com/compose/). Two sources need
neither. [`machine disks build`](commands.md#machine-disks-build) `--binary`
wraps a static executable and nothing else, so a program you compile needs no
Docker. The executable has to be self-contained. The image has no loader and no
libraries, so a dynamically linked program cannot run. `--from` names a public
image, and the build pulls it for you.

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
what it runs: an interpreter, a runtime, its libraries. Public images have
those, so name one with `--from` and put your files in it with `--add`. It
reads like a Dockerfile, `FROM` then `ADD` then the command, and you need no
Docker for it. The build pulls the image itself, so only your files are
uploaded.

A complex application, several services together, is a [Compose project](disks.md#compose-projects).

### Python program

Save this as `hello.py`.

```python
print("hello, world")
```

```bash
machine disks build --from python:3.12 --add hello.py hello-py -- python hello.py
```

### Node.js program

Save this as `hello.js`.

```javascript
console.log("hello, world")
```

```bash
machine disks build --from node:22 --add hello.js hello-node -- node hello.js
```

### ClickHouse queries

The ClickHouse image has `clickhouse local`, which runs SQL with no server.
Save this as `queries.sql`.

```sql
CREATE TABLE orders (id UInt32, customer String, amount UInt32) ENGINE = Memory;
INSERT INTO orders VALUES (1, 'ada', 30), (2, 'grace', 45), (3, 'ada', 25);
SELECT customer, sum(amount) AS total FROM orders GROUP BY customer ORDER BY customer;
```

```bash
machine disks build --from clickhouse/clickhouse-server:24.8 --add queries.sql \
  --entrypoint clickhouse ch-sql -- local --queries-file queries.sql
```

The machine's console shows the result, and the machine ends when the queries
do.

```
app-1  | ada	55
app-1  | grace	45
app-1 exited with code 0
```

### PostgreSQL queries

The PostgreSQL image starts a server, and it needs a password before it will.
`--env` sets a variable in the service's environment. The image runs every
`.sql` file in `/docker-entrypoint-initdb.d` when the server first starts, so
add the queries there. Save them as `queries.sql`.

```sql
CREATE TABLE orders (id int, customer text, amount numeric);
INSERT INTO orders VALUES (1, 'ada', 30), (2, 'grace', 45), (3, 'ada', 25);
SELECT customer, sum(amount) AS total FROM orders GROUP BY customer ORDER BY customer;
```

```bash
machine disks build --from postgres:17 --env POSTGRES_PASSWORD=secret \
  --add queries.sql:/docker-entrypoint-initdb.d/ pg
```

```
app-1  | /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/queries.sql
app-1  | CREATE TABLE
app-1  | INSERT 0 3
app-1  |  customer | total
app-1  | ----------+-------
app-1  |  ada      |    55
app-1  |  grace    |    45
app-1  | (2 rows)
app-1  | 2026-03-01 00:00:50.435 UTC [1] LOG:  database system is ready to accept connections
```

The server keeps running after the queries, so this machine does not end by
itself. To run queries and have the machine end, use the
[PostgreSQL project](disks.md#postgresql-project). The disk holds each `--env`
value as written, and a value is not changed on the way: a `$` in it arrives
as a `$`.

Both ran in a machine with 1024MB of memory. A server that other services
connect to is a [Compose project](disks.md#compose-projects).

### Where added files go

`--add` puts a file or a directory in the image, as one more layer on top of
the public one. You can repeat it.

| You write | It lands at |
|---|---|
| `--add hello.py` | the image's working directory, as `hello.py` |
| `--add conf` | the working directory, as the directory `conf` |
| `--add hello.py:/app/` | `/app/hello.py` |
| `--add hello.py:/app/main.py` | `/app/main.py` |
| `--add conf:/etc/app/` | `/etc/app/conf`, the directory inside `/etc/app` |
| `--add conf:/etc/app` | `/etc/app`, the directory's contents |

The rule is the one `cp -r` follows: a destination that ends in `/` is a
directory the path goes into, and any other destination is what the path
becomes. A Dockerfile `ADD` of a directory copies its contents; the last row is
how you write that here.

A script that was executable still is. `--add` works with `--binary` too, for
a program that reads a file beside it.

The image is the one the name pointed at when you ran the build. The build
records its digest and pulls exactly that, so a tag that moves later does not
change your disk. You can name a digest yourself, as `python@sha256:…` or the
`python:3.12@sha256:…` that `docker pull` prints.

The disk's size defaults to what the image needs plus a gigabyte. Use
`--dry-run` to see the numbers, and `--size` for more room.

`--from` takes public images of up to 5GB as they download. For a private
image, a larger one, or one you build yourself, use `--image`:

```bash
docker build --platform linux/amd64 -t myapp:latest .
machine disks build --image myapp:latest app
```

An image that needs more than one service, such as a database server with a
client, is a [Compose project](disks.md#compose-projects).

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

### PostgreSQL project

`compose/postgres` is a PostgreSQL server and a client that runs
`queries.sql` against it. Both services use one image. The client prints the
results and exits, which ends the project, so this is how to run queries
against PostgreSQL and have the machine end.

The client waits until the server is healthy. The healthcheck asks over TCP,
because the image first starts a temporary server on its Unix socket alone to
set the database up, and a check on the socket would pass before the real
server is listening. `ON_ERROR_STOP` makes a failed query the client's exit
code. `queries.sql` is mounted from the project directory.

```bash
docker pull --platform linux/amd64 postgres:17
machine disks build --compose compose/postgres pg
```

```
client-1    | CREATE TABLE
client-1    | INSERT 0 3
client-1    |  customer | total
client-1    | ----------+-------
client-1    |  ada      |    55
client-1    |  grace    |    45
client-1    | (2 rows)
client-1 exited with code 0
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
