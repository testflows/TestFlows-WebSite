<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

## Network faults

A distributed system fails at its links: one that is slow, one that loses
packets, one that stalls and then delivers everything at once, a node cut
off from one peer while it still reaches the others, a connection reset in
the middle of a transaction. [`machine net`](commands.md#machine-net) puts
those faults on the links between the containers of a run. A link connects
a container to a peer. A fault acts on the packets the container sends: to
every peer, or only the packets a match takes.

```bash
machine net app                                        # each link and its faults
machine net app delay db 100ms --jitter 20ms          # db's packets wait 80 to 120ms
machine net app loss db 10%                            # a tenth of them lost
machine net app duplicate db 5%                        # one in 20 sent twice
machine net app corrupt db 1%                          # one in 100 with a bit changed
machine net app reorder db 25%                         # a quarter sent ahead of the delayed ones
machine net app rate db 1mbit                          # db sends 1 megabit a second at most
machine net app partition db api                       # nothing between db and api
machine net app hold db --for 5s                       # db's packets held, then sent at once
machine net app reset api --to db                      # api's connections to db reset
machine net app heal                                   # every link as it was
```

### Use cases

| You want to know | Command |
|---|---|
| Does a client time out and retry when its server answers slowly? | `delay db 2s` |
| Does the protocol survive lost and duplicated packets? | `loss db 10%`, then `duplicate db 5%` |
| Does a leader election hold when one node is cut off? | `partition node1 node2`, then `partition node1 node3` |
| What happens when only one direction fails? | `partition db api --one-way` |
| Does replication keep up over a slow link? | `rate primary 1mbit --to replica` |
| Does the application notice a damaged message? | `corrupt db 1%` |
| Does the client reconnect, and retry safely, when its connection is reset mid-transaction? | `reset api --to db` |
| What happens when one request's response is lost, and nothing else? | `loss db 100% --to api --port 5432` |
| Do messages that arrive late, after a leader change or a timeout, do harm? | `hold node1 --for 10s` |
| Do established connections keep working while new ones cannot open? | `loss api 100% --to db --syn` |
| Does the cluster settle when a link keeps going down and coming back? | a loop of `partition --for`, below |

### One link or all of them

Without a match, a fault is on everything the container sends. With `--to`,
it is on what the container sends to that one peer, and its other links stay
as they are:

```bash
machine net app delay db 100ms --to api
machine net app
```

```text
SERVICE  CONTAINER       TO             MATCH  FAULTS       SEED
api      compose-api-1   -              -      -            -
db       compose-db-1    -              -      -            -
db       compose-db-1    compose-api-1  -      delay 100ms  3
nest     compose-nest-1  -              -      -            -
```

A ping from `api` to `db` now takes 103ms, because `db`'s replies to `api`
wait 100ms. A ping from `nest` to `db` still takes 0.04ms.

Packets a match takes get only the match's faults, not the whole link's:
after `loss db 10%` and then `delay db 100ms --to api`, what `db` sends to
`api` is delayed and none of it is lost. Each verb changes the fault it
names and keeps the others, so `delay` and then `loss` give a link that is
slow and lossy. A value of 0, or 0%, takes that fault away.

### Matching packets: protocol, port and SYN

`--proto tcp`, `--proto udp` or `--proto icmp` takes the packets of one
protocol. `--port 5432` takes the packets with 5432 as their source or
destination port, so on a server it takes its responses, and on a client its
requests. `--syn` takes the TCP SYNs that open a connection. Every match takes
`--to` as well, and every verb that sets a fault takes a match:

```bash
machine net app loss db 100% --to api --port 5432      # db's responses to api's queries, nothing else
machine net app delay db 1s --proto udp                 # db's UDP traffic, a second late
machine net app loss api 100% --to db --syn             # api opens no new connection to db
```

The last one leaves every connection api already has to db working: only
the packets that open a new one are lost. A container takes 15 matches
beside its whole link.

### Partitions

`partition` cuts two containers apart: everything each sends the other is
lost, and both still reach the rest of the cluster. `--one-way` cuts what the
first sends the second, and leaves the reverse. `--proto`, `--port` and
`--syn` cut those packets alone:

```bash
machine net app partition db nest
machine exec app run --container nest -- ping -c 3 -W 1 db      # 100% packet loss
machine exec app run --container api -- ping -c 3 -W 1 nest      # 0% packet loss
```

With `--for 10s`, both directions come back together after 10 seconds of
machine time.

A link that keeps failing and recovering is a loop of partitions, each
followed by a stretch of the run:

```bash
for i in 1 2 3 4 5; do
  machine net app partition node1 node2 --for 2s
  machine run app --within 7s
done
```

### Holding packets, then releasing them

`hold` keeps every packet the link sends, and `release` lets them all go at
once, in the order they were sent. Nothing is lost, so the peer receives
messages that were sent seconds ago: a stalled link that recovers, a
message that arrives after a leader change or after its sender timed out:

```bash
machine net app hold node1 --to node2                   # node1's messages to node2 wait
machine run app --within 10s
machine net app release node1                           # they all arrive now
```

`--for 10s` releases them after 10 seconds of machine time. A link holds 1000
full-size packets and drops the ones past them.

### Resetting connections

`reset` aborts TCP connections. The container's side of each connection is
closed, and the peer receives a reset, as from a middlebox that dropped the
connection or a server that restarted. Unlike a partition, nothing waits for
a timeout:

```bash
machine net app reset api --to db                       # api's connections to db
machine net app reset db --port 5432                    # every connection to db's port 5432
```

A listening socket stays open, so the server takes new connections at once.

### Seeds and replay

Loss, jitter, duplicate, corrupt and reorder decide each packet by chance,
from the link's seed. Give one with `--seed`, or the link draws one and shows
it. A link keeps its seed through later changes. The run records every change,
so a replay delays and drops exactly the same packets, and so does a branch
forked from a checkpoint before them.

A change to a link starts its draws again from the seed: `loss db 10%
--seed 7`, then `delay db 50ms`, loses packets from the start of seed 7's
sequence again. Which packet `corrupt` changes follows the seed, and which
bit it flips follows the guest kernel's own random numbers, which a replay
repeats.

A checkpoint keeps a link's faults: a rewind to it brings them back. A
container that docker starts again, after `containers kill --restart` or a
crash, gets its faults back, toward each peer at the address it has now.

`--for 30s` sets a link back after 30 seconds of machine time. A heal, and a
`--for` that ends, take the faults off new packets: a packet the link
already delays still leaves at its time.

```bash
machine net app loss api 100% --for 3s       # everything api sends lost for 3 seconds
```

### What a network fault misses

- **Traffic inside one container**, over its loopback, has no link to fault.
- **DNS** between containers is answered on each container's loopback, so no
  fault reaches it. Point the container's resolver at an address that does
  not answer, and its lookups time out; write the file back to restore them:

  ```bash
  machine exec app run --container api --user root -- sh -c 'cp /etc/resolv.conf /etc/resolv.keep; echo nameserver 192.0.2.1 > /etc/resolv.conf'
  machine exec app run --container api --user root -- sh -c 'cat /etc/resolv.keep > /etc/resolv.conf'
  ```

- **Address resolution follows the whole link's faults.** A match takes IP
  packets, so ARP is never in one. With `loss db 30%`, db's ARP requests
  are lost too, and right after a start, with nothing resolved yet, db can
  take seconds to reach a peer.
- **A fault is on what a container sends.** To fault what `db` receives, put
  the fault on each container that sends to it, with `--to db`. To slow both
  directions between two containers, put a fault on each, as `partition` does.
- **A process outside every container**, on the machine itself, sends on no
  container's link. What it sends to a container takes no fault, and only the
  container's replies do.
- **A rate is per sender.** Three containers each limited to 1mbit toward
  `db` give `db` 3 megabits a second, not one link of 1 megabit.
- **A corrupted packet has one bit changed** anywhere in its frame. A bit in
  the Ethernet addresses is not caught by a checksum, so fewer packets are
  dropped than are changed.
- **IPv4 alone.** Ports and SYNs are matched in packets without IP options,
  which Docker's networks send.
- **The path's MTU** stays as Docker sets it.
