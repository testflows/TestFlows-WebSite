<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

## Network faults

A distributed system fails at its links: one that is slow, one that loses
packets, one that delivers them out of order, a node cut off from one peer
while it still reaches the others. [`machine net`](commands.md#machine-net)
puts those faults on the links between the containers of a run. A link is
what a container sends: its whole link to every peer, or its link toward one
peer alone.

```bash
machine net app                                        # each link and its faults
machine net app delay db 100ms --jitter 20ms          # db's packets wait 80 to 120ms
machine net app loss db 10%                            # a tenth of them lost
machine net app duplicate db 5%                        # one in 20 sent twice
machine net app corrupt db 1%                          # one in 100 with a bit changed
machine net app reorder db 25%                         # a quarter sent ahead of the delayed ones
machine net app rate db 1mbit                          # db sends 1 megabit a second at most
machine net app partition db api                       # nothing between db and api
machine net app heal                                   # every link as it was
```

| You want to know | Fault |
|---|---|
| Does a client time out and retry when its server answers slowly? | `delay db 2s` |
| Does the protocol survive lost and duplicated packets? | `loss db 10%`, then `duplicate db 5%` |
| Does a leader election hold when one node is cut off? | `partition node1 node2`, then `partition node1 node3` |
| What happens when only one direction fails? | `partition db api --one-way` |
| Does replication keep up over a slow link? | `rate replica 1mbit` |
| Does the application notice a damaged message? | `corrupt db 1%` |

### One link or all of them

Without `--to`, a fault is on everything the container sends. With `--to`, it
is on what the container sends to that one peer, and its other links stay as
they are:

```bash
machine net app delay db 100ms --to api
machine net app
```

```text
SERVICE  CONTAINER       TO             FAULTS       SEED
nest     compose-nest-1  -              -            -
api      compose-api-1   -              -            -
db       compose-db-1    -              -            -
db       compose-db-1    compose-api-1  delay 100ms  3
```

Pings from `api` to `db` now take 103ms, while pings from `nest` to `db` still
take 0.04ms. A link toward a peer with a fault of its own takes that fault, not
the whole link's. Each verb changes the fault it names and keeps the others,
so `delay` and then `loss` give a link that is slow and lossy. A value of 0,
or 0%, takes that fault away.

### Partitions

`partition` cuts two containers apart: everything each sends the other is
lost, and both still reach the rest of the cluster. `--one-way` cuts what the
first sends the second, and leaves the reverse:

```bash
machine net app partition db nest
machine exec app run --container nest -- ping -c 3 -W 1 172.18.0.4     # 100% packet loss
machine exec app run --container api -- ping -c 3 -W 1 172.18.0.2      # 0% packet loss
```

`heal db --to nest` heals one link, `heal db` every link of `db`, and `heal`
every link of every container.

### Seeds and replay

A fault that draws, a loss, a jitter, a duplicate, decides each packet by
chance from a seed. Give one with `--seed`, or the link draws one and shows
it. A link keeps its seed through later changes. Every change is recorded with
the run, so a replay delays and drops exactly the same packets, and so does a
branch forked from a checkpoint before them. Forked at the same checkpoint, a
ping lost the same packets, 8, 12, 13 and 19, with the same round trips to the
microsecond.

A checkpoint keeps a link's faults: a rewind to it brings them back.

`--for 30s` sets a link back after 30 seconds of machine time, as `pause --for`
thaws a container:

```bash
machine net app loss api 100% --for 3s       # api cut off for 3 seconds
```

### What a network fault misses

- **Traffic inside one container**, over its loopback, has no link to fault.
- **A fault is on what a container sends.** To slow both directions between
  two containers, put a fault on each, as `partition` does.
- **A corrupted packet has one bit changed** anywhere in its frame. A bit in
  the Ethernet addresses is not caught by a checksum, so fewer packets are
  dropped than are changed.
- **A container on several networks** is reached at its first address.
- **Fifteen peers** a link can have faults of its own toward, at once.
