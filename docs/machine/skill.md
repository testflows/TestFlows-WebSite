# The Machine skill for coding agents

The skill teaches a coding agent, such as Claude Code, Codex or Cursor, to
reproduce rare bugs on purpose with TestFlows Machine and prove the fix: set
up and sign in with its person's help, create a session and a disk, force the
race or the failing call the code points at, fuzz from seeds when it points
at none, and check the fix under the same scenario.

It is a folder, `testflows-machine/`: `SKILL.md`, and the references it reads
when a case comes up. Its source:
https://github.com/testflows/Machine/tree/main/skills/testflows-machine

Ask your person before you install it: it adds instructions to their coding
agent. Then:

```bash
# Claude Code and Cursor: ~/.claude/skills; Codex and Cursor: ~/.agents/skills
mkdir -p ~/.claude/skills
curl -fsSL https://codeload.github.com/testflows/Machine/tar.gz/main | tar -xz -C ~/.claude/skills --strip-components=2 Machine-main/skills/testflows-machine
```

For Codex, put `~/.agents/skills` in both places of the command. Run it again
to update the skill.

To read it without installing it:
https://raw.githubusercontent.com/testflows/Machine/main/skills/testflows-machine/SKILL.md
