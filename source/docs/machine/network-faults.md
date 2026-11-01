<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

## Network faults

A distributed system fails at its links: one that is slow, one that loses
packets, one that stalls and then delivers everything at once, a node cut
off from one peer while it still reaches the others, a connection reset in
the middle of a transaction. [`machine net`](commands.md#machine-net) puts
those faults on the links between the containers of a run.

Each container has one link: everything it sends. A fault on the whole link
acts on every packet the container sends. A match narrows a fault to some of
those packets: the ones to one peer, of one protocol, of one port, or the
TCP SYNs that open a connection. Each match has faults, a seed and counts of
its own. Every `net` command runs the machine until the guest has made the
change, so the run moves forward.

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

Each command follows `machine net <run>`.

| You want to know | Command |
|---|---|
| Does a client time out and retry when its server answers slowly? | `delay db 2s` |
| Does the protocol survive lost and duplicated packets? | `loss db 10%`, then `duplicate db 5%` |
| Does a leader election hold when one node is cut off? | `partition node1 node2`, then `partition node1 node3` |
| What happens when only one direction fails? | `partition db api --one-way` |
| Does replication keep up over a slow link? | `rate primary 1mbit --to replica` |
| Does the protocol recover when the network damages packets? | `corrupt db 1%` |
| Does the client reconnect, and retry safely, when its connection is reset mid-transaction? | `reset api --to db` |
| What happens when a server's responses to one client are lost, and nothing else? | `loss db 100% --to api --port 5432` |
| Do messages that arrive late, after a leader change or a timeout, do harm? | `hold node1 --for 10s` |
| Does the cluster recover when the whole network stalls and comes back at once? | `hold`, `run --within 3s`, `release` |
| What happens if the network stalls at one exact point? | `run --until <point>`, then `hold` |
| Do established connections keep working while new ones cannot open? | `loss api 100% --to db --syn` |
| Does the cluster settle when a link keeps going down and coming back? | a loop of `partition --for`, below |
| What happens when a node cannot resolve a peer's address? | `loss db 100% --proto arp --to api`, then `arp flush api` and `arp flush db` |
| What happens when a node holds a wrong MAC for a peer? | `arp set api db 02:42:ac:12:00:99` |
| Did the fault drop the packets, or did the program never send them? | `machine net app`: each fault's `SENT` and `DROPPED`, below |
| Which exact packet did the fault drop, and why? | `loss db 30% --log`, then read the decision log, below |
| What exactly went between two containers, to open in Wireshark? | tcpdump in the machine, in Capturing the packets, below |

Other commands cover the failures around a network fault:

- **A refused connection**, rather than one that times out:
  `machine inject app add syscall connect ECONNREFUSED --in /usr/bin/app`,
  in [Fault injection](fault-injection.md).
- **A node that freezes** rather than one that is cut off:
  `machine containers app pause db --for 5s`, in
  [Container faults](container-faults.md).
- **Clocks that disagree between nodes**:
  `machine clock app jump +2s --container db`, in
  [Clock faults](clock-faults.md).
- **A cluster split into two groups**: one `partition` for each pair of
  containers across the split.

### One link or all of them

Without a match, a fault is on everything the container sends. With `--to`,
it is on what the container sends to that one peer, and its other links stay
as they are:

```bash
machine net app delay db 100ms --to api
machine net app
```

```text
SERVICE  CONTAINER       TO             MATCH  FAULTS       SEED  SENT  DROPPED  QUEUED
api      compose-api-1   -              -      -            -     -     -        -
db       compose-db-1    -              -      -            -     -     -        -
db       compose-db-1    compose-api-1  -      delay 100ms  -     0     0        0
nest     compose-nest-1  -              -      -            -     -     -        -
```

A ping from `api` to `db` now takes 103ms, because `db`'s replies to `api`
wait 100ms. A ping from `nest` to `db` still takes 0.04ms.

Packets a match takes get only the match's faults, not the whole link's:
after `loss db 10%` and then `delay db 100ms --to api`, what `db` sends to
`api` is delayed and none of it is lost. A packet two matches take gets the
faults of the one listed first. Each verb changes the fault it names and
keeps the others, so `delay` and then `loss` give a link that is slow and
lossy. A value of 0, or 0%, takes that fault away. A jitter also reorders
packets, since each one leaves at its own time.

### Matching packets: protocol, port and SYN

`--proto tcp`, `--proto udp` or `--proto icmp` takes the packets of one
protocol. `--port 5432` takes the packets with 5432 as their source or
destination port, so on a server it takes its responses, and on a client its
requests; without `--proto` it takes both TCP and UDP. `--syn` takes the
TCP SYNs that open a connection. The options combine with each other and
with `--to`, and a packet must satisfy all of them. Every verb that sets a
fault takes them:

```bash
machine net app loss db 100% --to api --port 5432      # every packet db sends api on port 5432
machine net app delay db 1s --proto udp                 # db's UDP traffic, a second late
machine net app loss api 100% --to db --syn             # api opens no new connection to db
```

The first loses db's responses to api on that port, and its SYN-ACKs too, so
api can open no new connection there either. The last leaves every
connection api already has to db working: only the packets that open a new
one are lost. A port belongs to TCP and UDP and a SYN to TCP, so
`--proto icmp --port 5432` and `--proto udp --syn` are refused. A container
holds at most 15 matches besides its whole link.

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

Without a container, `hold` holds every link at the instruction the
machine is stopped at, and all networking between the containers stops
there. `release` or `heal` without a container lets every packet go:

```bash
machine net app hold                                   # the whole cluster's network stops here
machine net app                                        # says every link is held
machine net app release                                # everything held leaves at once
```

The hold is part of the recording, so a replay holds at the same point, and
a checkpoint taken during a hold keeps it. Run the machine to an exact point
first, and the hold lands there:

```bash
machine run app --until 'console~ready'                # stop where the cluster is ready
machine net app hold                                   # hold every link at that point
machine net app loss db 100% --to api                  # change the faults while nothing moves
machine net app release                                # traffic resumes under the new faults
```

With api pinging db every 100 milliseconds, db received none of api's
requests while the links were held and the fault was set. After the
release, db received the 47 held and later requests, the new fault dropped
all 47 replies, and the listing's `DROPPED` read 47. No packet crossed a
link under the old faults after the hold.

The guest's programs and timers keep running during a hold. A
retransmission or an application timeout can expire while the links are
held. To hold for a time, run the machine for that time between the two
commands:

```bash
machine net app hold
machine run app --within 3s                            # 3 seconds of machine time, all held
machine net app release
```

With api pinging db every 250 milliseconds, the 3 replies sent before the
hold arrived, none arrived in 3 seconds of hold, and all 20 arrived after the
release. A container on another's network, the machine's or none has no
link of its own and is left out, and so is a process outside every
container. The listing names a container whose link could not be held.

### Resetting connections

`reset` aborts TCP connections. The container's side of each connection is
aborted, and the peer receives a TCP reset, as from a middlebox that dropped
the connection or a server that restarted. What a program sees depends on
the call it makes. On the aborted side, the first call after the data it
already received fails with `ECONNABORTED`; after that a read returns end of
file and a write fails with `EPIPE`. On the peer, the first call fails with
`ECONNRESET`, and the same follows.
Unlike a partition, nothing waits for a timeout:

```bash
machine net app reset api --to db                       # api's connections to db
machine net app reset db --port 5432                    # every connection to db's port 5432
```

A listening socket stays open, so the server takes new connections at once.

### Address resolution

A container finds a peer's MAC by ARP and keeps it in its neighbour table.
`--proto arp` puts a fault on the ARP frames a container sends, and with
`--to` on those about one peer: its requests for the peer's address and its
replies to the peer. A fault on ARP acts when a container resolves a peer
again, so flush the tables to see it at once. With db's replies lost, api
cannot resolve db, while nest still reaches it:

```bash
machine net app loss db 100% --proto arp --to api
machine net app arp flush api                          # api resolves db again
machine net app arp flush db
machine exec app run --container api -- ping -c 3 -W 1 db     # 100% packet loss
machine exec app run --container nest -- ping -c 3 -W 1 db    # 0% packet loss
```

`machine net app arp` shows and changes a container's neighbour table:

```bash
machine net app arp show api
```

```text
INTERFACE  ADDRESS     PEER          MAC                STATE
eth0       172.18.0.2  compose-db-1  02:42:ac:12:00:02  reachable
```

```bash
machine net app arp set api db 02:42:ac:12:00:99       # api sends db's frames to a MAC nobody has
machine net app arp stale api db                       # used, and checked again by ARP soon after
machine net app arp delete api db                      # resolved again at the next packet
machine net app arp flush api                          # every peer resolved again
machine net app arp reachable api 1s                   # entries go stale after about a second
```

An entry made by `arp set` is permanent, so ARP never corrects it: api
reaches db again only after `arp delete`. A stale entry is still used; at
the next packet the kernel checks it by ARP within seconds, unless the
connection's own traffic confirms the peer first. The table is part of the
machine, so a replay makes the same changes. A container that docker starts
again begins with an empty table, as a host that restarts does.

### The decision log

Run the machine for 10 milliseconds before reading a log just after a run
stops: the last millisecond's lines reach the run when the machine runs
again.

`--log` writes each decision a fault makes to a log: which packet it took,
and whether it dropped it, delayed it, duplicated it, corrupted it or sent it
ahead. It answers which exact packet a fault dropped, which the counts and a
capture do not. `--no-log` with the same fault stops it:

```bash
machine net app loss db 30% --to nest --seed 7 --log   # the link's decisions are logged
machine net app                                        # FAULTS: loss 30% log
machine net app loss db 30% --to nest --seed 7 --no-log  # the same fault, no longer logged
```

The guest kernel writes one line per decision, where the fault decides, to
`/output/drop/.machine/net/<container>.log`. The `.machine` folder holds the
files the machine itself writes, apart from a program's own, and it is under
`drop`, so a run stores the log only when it keeps that output. A run that
keeps it from the start is read at any time:

```bash
machine create app --disk app.img --keep-output /output/drop/.machine/net
machine net app loss db 30% --to nest --seed 7 --log
machine exec app run --container nest -- ping -c 20 -i 0.05 db
machine run app --within 10ms                          # the last batch of lines reaches the run
machine output app --source /output/drop/.machine/net/compose-db-1.log --plain -n :
```

`machine output` prints the last 25 lines unless `-n` says otherwise; `-n :`
prints every line. The guest kernel writes the lines in batches, at most 1
millisecond of machine time after the first line of a batch. Lines decided
in the last millisecond before the machine stops reach the run when the
machine runs again, and a checkpoint keeps them: run the machine for a
moment, as `machine run app --within 10ms`, before reading the last
packets' lines.

A run that does not keep the log still makes it, and replay brings it back.
Fork a branch from a checkpoint before the stretch, keeping that output, and
the branch replays the stretch and stores the same lines:

```bash
machine checkpoint app before
machine net app loss db 30% --to nest --seed 7 --log
machine exec app run --container nest -- ping -c 20 -i 0.05 db
machine fork app --from ^before --keep-output /output/drop/.machine/net --name logged
machine output app/logged --source /output/drop/.machine/net/compose-db-1.log --plain -n :
```

```text
2026-03-01T00:01:31.691986Z #8 to compose-nest-1 pass ICMP 172.18.0.4 > 172.18.0.3 echo reply id 25 seq 0 len 84
2026-03-01T00:01:31.742177Z #9 to compose-nest-1 drop ICMP 172.18.0.4 > 172.18.0.3 echo reply id 25 seq 1 len 84
2026-03-01T00:01:31.794040Z #10 to compose-nest-1 pass ICMP 172.18.0.4 > 172.18.0.3 echo reply id 25 seq 2 len 84
2026-03-01T00:01:31.846051Z #11 to compose-nest-1 drop ICMP 172.18.0.4 > 172.18.0.3 echo reply id 25 seq 3 len 84
```

Each line has the machine's date, the packet's number on its link, the
match, the decision and the packet with its IP length. The number counts
every packet the link carried since the container started, logged or not,
so a later stretch starts at a higher number: here the link had carried 7
packets before the ping. The 8 drops of the 20 lines
were the 8 pings the ping lost, and `DROPPED` in the listing read 8. The
parent's log and two branches replayed from the same checkpoint were the
same, byte for byte.

The decisions are `pass`, `drop`, `delay` with the time the fault drew,
`ahead` for a packet `reorder` sent before the delayed ones, and `duplicate`
and `corrupt` beside the first word. `drop limit` is a packet dropped
because the fault's queue already held 1000 delayed packets, and `drop hold`
one dropped because a hold already held 1000 full-size packets; `DROPPED`
counts both. Every packet the link carries has its line and its number,
and a packet a hold drops has a second line, `drop hold`, under the number
of its first. A duplicated packet has two lines: the
original says `duplicate`, and the copy, logged first, says `copy`. A delay
is what the fault drew; the packet can leave later by the machine's timer
slack, as a timer can. A container on two networks writes both links'
decisions to the one file.

Every decision is logged; none is dropped however fast the packets come. A
200MB TCP transfer under a logged fault decided 19,586 packets and the log
held 19,586 lines, the listing's `SENT` and `DROPPED` added up.

Each decision costs about 32 microseconds of machine time to write, and a
decision is a packet as the kernel hands the link, whatever its size. A
50MB TCP transfer under a logged fault took 0.66 seconds of machine time
on average, against 0.47 seconds under the same fault without the log: its
packets were large. Small packets cost the same each, so a stream of them
spends far more of its time on the log; 10,000 packets cost about 0.32
seconds. Log the stretch being examined, not a whole run. A decision is a
packet's, never a program message's: see the limits below on TCP units and
retransmission.

### Seeds, replay and --for

Loss, jitter, duplicate, corrupt and reorder decide each packet by chance,
from the link's seed. Give one with `--seed`, or the link draws one and shows
it. A delay or a rate alone draws nothing, and shows no seed. A link keeps
its seed through later changes. The run records every change, so a replay
delays and drops exactly the same packets, and so does a branch forked from a
checkpoint before them.

A change to a link starts its draws again from the seed: `loss db 10%
--seed 7`, then `delay db 50ms`, loses packets from the start of seed 7's
sequence again. Which packet `corrupt` changes, and which byte and bit
of it, follow the seed.

A checkpoint keeps a link's faults: a rewind to it brings them back. A
container that docker starts again, after `containers kill --restart` or a
crash, gets its faults back, toward each peer at the address it has now.

`--for 30s` sets back what its command set after 30 seconds of machine time,
and leaves the rest of the link as it is then:

```bash
machine net app loss api 100% --for 3s       # everything api sends lost for 3 seconds
machine net app delay api 50ms               # still there after the 3 seconds
```

A heal takes every fault off and releases what a hold keeps. A heal, and a
`--for` that ends, act on new packets: a packet the link already delays
still leaves at its time.

### What a fault did

`SENT`, `DROPPED` and `QUEUED` count what each fault did with the packets
it took. They count from when the match, or the whole link, first got a
fault, and a later change to it keeps counting. `SENT` is the packets it
passed on, a duplicate counting once more. `DROPPED` is the packets it lost,
by `loss`, or past what a `hold` has room for. `QUEUED` is the packets it
holds now, delayed or held: neither sent nor dropped yet. After 50 pings
from api to db with `loss db 30% --to api --seed 9`, the row of that match:

```text
SERVICE  CONTAINER       TO             MATCH  FAULTS    SEED  SENT  DROPPED  QUEUED
db       compose-db-1    compose-api-1  -      loss 30%  9     36    14       0
```

The ping printed `50 packets transmitted, 36 packets received`, so the 14
db dropped are the 14 api lost. A hold shows what it holds as `QUEUED` until
the release. The counts are what the fault processed, packet by packet, not
a measure of its probability: over many packets 30% loss drops close to 30%
of them, and over a few the count can be anything. A container that docker
starts again counts from 0, and so does one a network is disconnected from.
The counts are packets as the fault decides them, the unit of the log's
lines: a large TCP write that reaches the fault as one packet is one.

The counts are packets on the link, not sends by a program. A TCP write can
wait in the socket's buffer, and the kernel retransmits without a system
call. `machine catch add syscall sendto --in /usr/bin/app` shows what a
program sends, and a capture shows the packets.

### Capturing the packets

Every disk has tcpdump in the machine itself, at `/usr/sbin/tcpdump`, so a
capture needs nothing in the containers' images. Write the capture under
`/.machine/output/keep`, and the run keeps it as its output, named
`/output/keep/db.pcap`.

`machine containers` lists what a capture needs: each container's `ADDRESS`,
and its `LINK`, the machine's interface at the other end of the
container's own:

```bash
machine containers app
```

```text
SERVICE  CONTAINER       ID            STATE    IMAGE            ADDRESS     LINK
api      compose-api-1   2aaef0f5d567  running  clockprobe:test  172.18.0.4  veth60a586c
db       compose-db-1    41b6ae3b5fb0  running  clockprobe:test  172.18.0.2  veth45c3e2e
nest     compose-nest-1  3da165f7aa0f  running  clockprobe:test  172.18.0.3  veth80fa747
```

To capture one container's packets, capture on its `LINK`:

```bash
machine exec app start -- tcpdump --immediate-mode -U -i veth45c3e2e -w /.machine/output/keep/db.pcap
machine run app --within 1s                            # tcpdump starts listening
machine exec app run --container api -- ping -c 3 db
machine exec app run -- sh -c 'killall -INT tcpdump; while pidof tcpdump >/dev/null; do sleep 0.1; done'
machine output app bytes --source /output/keep/db.pcap > db.pcap
```

`--immediate-mode` and `-U` write each packet as it is captured: without
them, the packets tcpdump has not written yet when it stops are lost. The
stop waits for tcpdump to exit, so the file is whole before it is read.
Open `db.pcap` in Wireshark or read it with tcpdump on this computer.

On its link each packet db sends or receives appears once, as an Ethernet
frame, ARP included. Broadcasts from the other containers appear too, since
the bridge sends them to every link. A packet a fault on db dropped or still
holds is not there: the capture sees what db's faults let through, and what
reaches db. The `LINK` changes when docker starts the container again, and
so do addresses from run to run, so read them in the run you capture.

`--net db` runs tcpdump on db's own network instead, so its `eth0` is db's
link, and the name stays the same across restarts:

```bash
machine exec app start --net db -- tcpdump --immediate-mode -U -i eth0 -w /.machine/output/keep/db.pcap
```

It captures the same packets as a capture on the `LINK`: with db's ICMP
lost by `loss db 100% --proto icmp`, both showed the pings reaching db and
none of db's replies.

To capture every container at once, use `-i any` and filter by `ADDRESS`:

```bash
machine exec app start -- tcpdump --immediate-mode -U -i any -w /.machine/output/keep/all.pcap host 172.18.0.2
```

With `-i any`, each packet between two containers appears twice: as it
arrives from the sender's link, `P`, and as it leaves toward the receiver's,
`Out`. The file records each packet's interface by an index that means
nothing on this computer, so filter by address rather than by interface.

#### Finding the address and the link by hand

`machine containers` reads both from the machine; they can be read by hand
as well. Docker knows each container's address by the container's name:

```bash
machine exec app run -- docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' compose-db-1    # 172.18.0.2
```

A container's `eth0` is one end of a pair, and the container's `iflink` is
the number of the machine's interface at the other end:

```bash
machine exec app run --container db -- cat /sys/class/net/eth0/iflink    # 6
machine exec app run -- ip -o link | grep '^6:'                          # 6: veth45c3e2e@if5: ...
```

A replay writes the same capture, byte for byte, with loss, delay and clock
jumps in effect. The timestamps are the machine's date: `clock jump` of the
whole guest moves them, and a container's offset does not. A link between
containers carries TCP segments larger than its MTU, since the kernel
segments them only where a real interface needs it.

### What a network fault misses

- **Traffic inside one container**, over its loopback, has no link to fault.
- **DNS** between containers is answered on each container's loopback, so no
  fault reaches it. Point the container's resolver at an address that does
  not answer, and its lookups time out; write the file back to restore them:

  ```bash
  machine exec app run --container api --user root -- sh -c 'cp /etc/resolv.conf /etc/resolv.keep; echo nameserver 192.0.2.1 > /etc/resolv.conf'
  machine exec app run --container api --user root -- sh -c 'cat /etc/resolv.keep > /etc/resolv.conf'
  ```

- **Address resolution follows the whole link's faults** unless a match
  names `--proto arp`: a match of another protocol takes IP packets alone.
  With `loss db 30%`, db's ARP requests are lost too, and right after a
  start, with nothing resolved yet, db can take seconds to reach a peer.
- **A fault is on what a container sends.** To fault what `db` receives, put
  the fault on each container that sends to it, with `--to db`. To slow both
  directions between two containers, put a fault on each, as `partition` does.
- **A container on another's network**, with `network_mode: service:db`,
  `host` or `none`, has no link of its own, and a fault on it is refused.
  Put the fault on the container whose network it uses.
- **A process outside every container**, on the machine itself, sends on no
  container's link. What it sends to a container takes no fault, and only the
  container's replies do.
- **A rate is per sender.** Three containers each limited to 1mbit toward
  `db` give `db` 3 megabits a second, not one link of 1 megabit.
- **A damaged packet rarely reaches the program.** `corrupt` changes one bit
  anywhere in a packet's frame, and the IP, TCP and UDP checksums drop
  nearly every damaged packet; TCP then sends it again. A bit in the
  Ethernet addresses is not caught by a checksum. No fault hands a damaged
  payload to the program.
- **Losing exactly the Nth packet**, bursts of loss, and delays other than a
  uniform jitter: a fault decides each packet on its own, by its chance.
- **IPv4 alone.** Ports and SYNs are matched in packets without IP options,
  which Docker's networks send.
- **The path's MTU** stays as Docker sets it.
- **Loss of TCP is per unit the kernel hands the link, not per wire
  segment.** Between containers the kernel sends a large TCP write as one
  packet many times the MTU, segmented only where a real interface needs it:
  in one test most were 8244 bytes. `loss 1%` drops 1% of those units, each
  as many segments as it holds, and TCP sends the whole unit again. The
  log's `len` shows each unit's size.
