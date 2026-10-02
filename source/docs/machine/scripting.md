<!-- agents: TestFlows Machine docs, one section. Index: https://testflows.com/docs/machine.md -->

# Scripting

Everything the client does can be done from a script.

* `-o json` prints machine-readable output. `-o raw` prints text without formatting values. Put the flag before the command, like `machine -o json runs`.
* `-q` turns off progress output and spinners.
* `--timeout s` gives up after that many seconds. It goes before the command too. The default is no limit, and `0` means check once.
* `--no-colors` turns off colors.
* Waiting commands exit with 3 on a timeout and 2 on an error.

```bash
machine -q --timeout 300 run app --until tasks || echo "boot did not finish"
```
