<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Reading the disk

You can read files from a run's disk without touching the run. Reads are
pinned to a checkpoint, so they never change how the machine executes.

```bash
machine artifacts ls app /var/log
machine artifacts cat app /var/log/app.log
machine artifacts cp -r app /results ./results
```

Add `@ref` to the run to read the disk as it was at a checkpoint or an entry.

```bash
machine artifacts cat app@booted /etc/hostname
machine artifacts ls app@4200 /tmp
```
