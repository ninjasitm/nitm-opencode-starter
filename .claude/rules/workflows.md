---
applyTo: "**/*"
description: "Workflows for editing rules, skills, commands, and the CLI."
---

# Workflows

Follow the workflows defined in [.claude/rules-snippets/workflows.md](../rules-snippets/workflows.md).

Key workflows:
- Edit snippet source in `.claude/rules-snippets/`, verify wrappers resolve.
- Add skills under `.agents/skills/`, commands under `.opencode/commands/`.
- Run `node --test` after changes to `bin/cli.js`.
