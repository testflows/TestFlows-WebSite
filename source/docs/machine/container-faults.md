<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

## Container faults

A project run as containers is a small cluster, and each service is a node.
[`machine containers`](commands.md#machine-containers) puts a fault on one
container while the others keep running:

```bash
machine containers app stop db                   # SIGTERM, then SIGKILL after 10s
machine containers app stop db --grace 2s        # SIGKILL after 2s of machine time
machine containers app kill db                   # SIGKILL, no cleanup
machine containers app crash db                  # a power cut: its volumes lose what was not synced
machine containers app pause db --for 5s         # frozen for 5s, then thawed
machine containers app throttle db --cpus 0.1 --for 30s
machine containers app throttle db --cpus 0      # the limit lifted
machine containers app start db
```

| You want to know | Fault |
|---|---|
| Does the cluster keep serving while one node restarts cleanly? | `stop db --restart 10s` |
| Does a client retry when its server dies mid-request? | `kill db --restart 5s` |
| Does the database keep what it committed through a power cut? | `crash db --restart 0` |
| Do the other services notice a node that hangs without dying? | `pause db --for 30s` |
| Does the system cope with one slow node? | `throttle db --cpus 0.1 --for 1m` |
| Does the service keep state it never put in a volume? | `kill db --restart 0 --fresh` |

A container you stop, kill or crash stays down. `--restart 5s` brings it back
after 5 seconds of machine time, and `--restart 0` at once, so the other
containers keep running through the outage:

```bash
machine containers app kill db --restart 5s
machine containers app crash db --restart 0          # a power cycle
machine containers app kill db --restart 0 --fresh   # back from its image
```

```text
✔ Killed compose-db-1 (db)
  Starts again in 5s of the machine's time, process 28493p1
```

A restart is a reboot: the container comes back with every file it had.
`--fresh` replaces it instead, as a failed node is replaced by a new one from
the same image. The files it wrote outside its volumes are gone, and its
volumes are kept. Use it to find state a service keeps in its own files when it
should keep it in a volume.

Each fault is recorded with the run, so a replay faults the same container at
the same point. Put one where the run is stopped, at a breakpoint, a catchpoint
or a `run --until`, to fault a service at the moment that matters.

### A crash

`kill` loses nothing the program wrote: the kernel inside the machine keeps
running and writes it out later. `crash` is a power cut of the service's node.
Its volumes keep what was synced and lose the writes still in memory. When the
service starts again, each volume replays its journal and the service runs its
own recovery. That finds a commit acknowledged before its data was synced, a
`rename` whose directory was never synced, and a log record that survived while
the data it describes did not.

A crash cuts the volumes the project names in `x-machine`; see
[Volumes a crash cuts](disks.md#volumes-a-crash-cuts). The cut is when the
volumes stop writing to the disk, just after the container is frozen; a write
the kernel finishes in between is kept, as one a disk finished before the power
went. A volume another running container also mounts is refused, since cutting
it would cut that container too.

```bash
machine containers app crash db /var/lib/postgresql/data --restart 0   # that volume alone
```

```text
✔ Crashed compose-db-1 (db)
  Cut compose_db-data
  Started again
```

The volume is named as Docker names it, after the Compose project.

**A crash test, start to end.** Stop where the database syncs, keep the run
there, and crash a branch of it. The branch loses what the database had not
synced yet; the query tells you whether it had already told a client the data
was safe:

```bash
machine catch app add syscall fsync fdatasync --in comm=postgres   # where it syncs
machine run app                                                    # stops at the next sync
machine fork app --name cut                                        # the run keeps its place
machine catch app/cut delete 1                                     # the branch has its parent's
machine containers app/cut crash db --restart 0
machine exec app/cut run --container db -- psql -U postgres -c 'select count(*) from t'
```

The run is deterministic, so the branch crashes at exactly that sync every
time. Run on to the next sync and fork again to cut at another point.

From Python, `run.containers.crash("db", restart="0")` and the other verbs
take the same options as keywords. [The SDK's Container faults](python-sdk.md#container-faults)
has an example.
