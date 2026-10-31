<!-- agents: TestFlows™ Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

## Clock faults

Software reads two kinds of time. Elapsed time, `CLOCK_MONOTONIC` and the TSC,
is the machine's own, and [Machine time](steering-programs.md#machine-time)
controls it. The date, `CLOCK_REALTIME`, is what `date`, `time()` and
`gettimeofday` return, and on a real fleet it jumps, drifts and disagrees
between hosts. [`machine clock`](commands.md#machine-clock) changes the date
inside the machine, for the whole guest or for one container, and leaves
elapsed time alone.

| Command | What the date does |
|---|---|
| `jump +5s` | steps forward or back, as an NTP step or `date -s` does |
| `set 2027-03-28T00:59:50Z` | goes to that date |
| `drift +200ppm --container db` | gains 200 parts per million of machine time, 0.72 seconds an hour |
| `jump +4s --slew 30s --container db` | moves 4 seconds over 30 seconds of machine time, with no step |
| `jitter -200ms:200ms --every 10m` | is set to a drawn offset every 10 minutes of machine time |
| `leap insert` | repeats a second, 23:59:60, at the next UTC midnight |
| `reset` | returns to machine time, for the guest and every container |

The guest kernel makes each change, so a change takes effect when the run next
executes. The run records every change: a replay makes it at the same
instruction, a checkpoint keeps the date, and a branch starts with its
parent's date.

### The guest's date

`jump`, `set` and `reset` change the date every process in the guest reads,
in every container. The step is a real step of the guest kernel's clock: a
timer armed for an absolute date sees it, and a timerfd with
`TFD_TIMER_CANCEL_ON_SET` is woken, which is how systemd and cron notice a
step.

```bash
machine clock app jump +59m50s
machine run app --within 30s --until 'console~token refresh'
```

The answer shows the date as it stands and the change waiting for the run:

```text
date:    2026-03-01T00:01:29.614903749Z
offset:  +0s from machine time
waiting: 1 change, taken when the run executes
```

Steps add up: `jump +5s` and then `jump -2s` leave the date 3 seconds ahead.
`set` puts the date at a value, whatever steps came before it. Machine refuses
a date before 1970, or one on or after 2232-04-18T23:47:16Z, because the
kernel cannot set either.

### A container's date

With `--container`, a change moves one container's date alone, as an offset
from the guest's date. Every process of the container reads it, including
those `docker exec` and `machine exec --container` start. The other
containers keep the guest's date.

```bash
machine clock app jump -6m --container client
machine exec app run --container client -- curl -sS https://api:8443/health
```

The client now reads a date 6 minutes behind the server, so a certificate the
server issued a minute ago is not valid yet for the client.

The offset reaches every way a program reads the date. `clock_gettime` stays
as fast as it is outside the machine, because the container's processes still
read the date in the vDSO, without a system call. System calls, POSIX timers,
timerfd and `clock_nanosleep` agree with the container's date, and so do the
futex waits behind `pthread_cond_timedwait` and `sem_timedwait` and message
queue timeouts. A restarted container keeps its offset, while a container
created again starts on the guest's date.

`--container` takes a container's id, its name or its Compose service. Machine
finds the container without running the machine, so a clock change made at a
breakpoint leaves the run at that breakpoint. Prefer the id: Machine knows it
as soon as Docker creates the container, and learns the name shortly after the
container starts. `machine containers app` lists both.

A stopped container that has an offset keeps it, and takes it again when it
starts. `machine clock app reset --container db` returns it to the guest's
date, stopped or running.

### Drift and slew

A clock that runs fast or slow is the fault a jump cannot fake: nodes do not
jump apart, they wander apart until an assumption breaks. `drift` makes one
container's date gain or lose time at a rate of machine time:

```bash
machine clock app drift +5000ppm --container node2      # 0.5% fast: 3s in 10 minutes
machine run app --within 10m --until 'console~two leaders'
machine clock app drift 0 --container node2              # stopped; the offset reached stays
```

No read sees a jump, and a timer armed in the container agrees with its
drifting date: it fires when the container's own date reaches the deadline,
never before. At +100000ppm, a timerfd armed for 2 seconds ahead by the
container's date fired after 1.821 seconds of machine time, which is 2
seconds of a clock running 10% fast.

`--slew` moves a container's date to a new value over a time instead of in one
step, as NTP slews a small correction:

```bash
machine clock app jump +4s --for 2m --container db               # off and back, two steps
machine clock app jump +4s --for 2m --slew 30s --container db    # drifts off and back, 30s each
```

A slew runs until it arrives. A later change to the same container, a drift
included, stops it where it has got to, so set a drift before you start a
slew. A slew moves the date at most half a second for each second of machine
time, so `jump +4s --slew 8s` is the fastest slew of 4 seconds. Machine
refuses a shorter one:

```text
✗ A slew of +4s takes 8s at the least.
```

The guest's date has no drift. To make the whole machine's time run fast or
slow, use the [clock rate](steering-programs.md#clock-rate).

### Jitter

An NTP-disciplined fleet is never exactly in sync: each host's offset wobbles
within a bound. `jitter` sets the date to a value drawn around it each period:

```bash
machine clock app jitter -200ms:200ms --every 10m --container api
machine clock app jitter -50ms:50ms --every 1m --container worker
machine run app --within 2h
```

Every 10 minutes of machine time, api's offset is set to a value from -200ms
to 200ms around the date without the jitter. The first step is taken when the
guest takes the command. A weight in brackets draws a choice more often:
`-1s[1],0[8],1s[1]` is in sync most of the time and a second off now and then.
A jitter takes 4 choices at most, each a whole number of microseconds.

The draws come from `--seed`, or from a seed drawn at random and shown, so
typing the same command again steps the date the same way. A replay steps by
the same amounts at the same points, and a branch draws on from where its
parent was. A jump or a set moves the date under the jitter, which goes on
around the new date. `machine clock app jitter off` stops the jitter and
returns the date to where it would be without it.

### Leap seconds

In 2012 a leap second livelocked Linux futexes, and services across the
industry went down with it. `leap insert` makes the guest kernel repeat a
second, 23:59:60, at the next UTC midnight of the guest's date, and
`leap delete` makes it skip 23:59:59:

```bash
machine clock app set 2026-12-31T23:59:50Z
machine clock app leap insert
machine run app --within 20s
```

After the 20 seconds the date is a second behind where it would have been
without the leap. A leap second moves the guest's date and every container
with it, so `leap` takes no `--container`. `leap off` cancels a leap still
pending, and so does `reset`.

### Undoing a change after a time

`--for 2m` takes a change back after 2 minutes of machine time, at the same
instruction in every replay. `jump +4s --for 2m` is a step forward and, 2
minutes later, a step back: the NTP correction that follows a host running
with a bad clock. `jump`, `set`, `drift` and `jitter` take `--for`.

The undo takes back the command's own change. What else moved the date
meanwhile stays: a drift's accrual, a leap second, or another program's step.
A later change cancels an undo still pending.

### Reading the date

`machine clock app` reads the date without running the machine. It shows the
guest's date and its offset from machine time, then each container whose date
is off the guest's, with its offset, drift, slew and jitter:

```text
date:    2026-12-31T23:59:54.977514123Z
offset:  +305d23h58m18.362410928s from machine time
jitter:  -200ms:200ms every 10m, seed 42, at -0.022376s after 1 draw
leap:    23:59:60 inserted before 2027-01-01T00:00:00Z
container: compose-db-1
  date:    2026-12-31T23:59:57.645176188Z
  offset:  +2.667662065s from the guest's date
  drift:   +200ppm
  slew:    to +6.00600183s at 122.130465170s of machine time
```

`--container db` shows one container, and `machine -o json clock app` gives
every field. When the guest kernel refuses a change, the next reading says
why:

```text
refused: the date, the guest's or a container's, would leave the range the kernel takes, 1970 to 2232-04-18T23:47:16Z
```

### Clock fault use cases

Each block below is a question a clock fault answers, and the commands that
ask it. Run the machine afterwards, with `machine run app --within 2m` or with
an `--until` the program prints, and read what it did.

```bash
# Does the program refresh a token before it expires?
machine clock app jump +59m50s
machine run app --within 30s --until 'console~token refresh'

# Does a client accept a certificate issued in its future?
machine clock app jump -6m --container client

# Do two nodes both lead when one clock runs fast?
machine clock app drift +5000ppm --container node2

# Does last-write-wins lose the write from the slow data center?
machine clock app jump +3s --container dc2

# Does the program survive the clock going backwards?
machine clock app jump -2s

# Does the system cope with the NTP correction that follows a bad clock?
machine clock app jump +4s --for 2m --slew 30s --container db

# Does a node shut itself down on skew, and come back?
machine clock app drift +1000ppm --container roach3

# Does the program survive 23:59:60?
machine clock app set 2026-12-31T23:59:50Z
machine clock app leap insert

# Does a scheduled job run twice or not at all across a time zone change?
# Set TZ in the container first.
machine clock app set 2027-03-28T00:59:50Z

# Does the program handle 2038 and February 29?
machine clock app set 2038-01-19T03:13:30Z
machine clock app set 2028-02-28T23:59:55Z

# Do services that compare timestamps agree when clocks wobble?
machine clock app jitter -200ms:200ms --every 10m --container api

# Does a cache or session expire when its day is over?
machine clock app jump +1d --container redis
```

#### How much skew the system tolerates

Fork the same checkpoint into branches, one skew each, and run each to the same point. Every branch starts
from the identical machine, so the skew is the only difference:

```bash
machine checkpoint app steady
for skew in 50ms 100ms 200ms 400ms 800ms; do
  machine fork app --at ^steady --name skew-$skew
  machine clock app/skew-$skew jump +$skew --container node2
  machine run app/skew-$skew --within 2m --until 'console~two leaders'
done
```

#### A jump inside one request

Most time bugs are check-then-use: the process
checks a token's expiry, the clock steps, and it uses what it checked. Stop the
run where the check is done, jump, and go on:

```bash
machine containers app                       # auth is 3f2a91c0d4e7
machine break app add 412 check_expiry
machine run app --until 'tid=412:at=check_expiry'
machine clock app jump +1h --container 3f2a91c0d4e7
machine run app --within 30s
```

The jump finds the container by its id without running the machine, so it
lands while the run is stopped at `check_expiry`.

Because every clock change is part of the run's recording, a failure found
under skew comes back when you replay the recording; there is no timing to
reconstruct. Investigate it as any other failure, with
[`rewind`](checkpoints-and-branches.md), [`diff`](replay.md) and the debugger.

### What a clock change misses

- **File timestamps.** The kernel stamps files with its own clock, so `make`
  in a container behind the guest reports clock skew.
- **Socket timestamps.** `SO_TIMESTAMP` and `SIOCGSTAMP` carry the guest's
  date, so `ping` in a skewed container reports the offset as round trip time.
- **Timers already armed.** A container's change does not move a deadline
  armed before it; a timerfd with `TFD_TIMER_CANCEL_ON_SET` is woken so the
  program can re-arm.
- **A container that sets the date.** A container given `CAP_SYS_TIME` that
  calls `settimeofday` sets the guest's date, as it would set a host's; its
  own offset stays.
