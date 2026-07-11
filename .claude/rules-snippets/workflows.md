# Workflow rules

## Editing rules or snippets

1. Edit the source of truth in `.claude/rules-snippets/` (or `.claude/prompt-snippets/`).
2. Verify every thin wrapper that references the snippet still resolves.
3. Run `node --test` to catch regressions.

## Adding a skill

1. Create a new directory under `.agents/skills/<skill-name>/`.
2. Add a `SKILL.md` frontmatter file with `name`, `description`, and body.
3. If the skill needs a thin wrapper in `.claude/rules/` or `.opencode/rules/`, add one.

## Adding a command

1. Create a `.md` file in `.opencode/commands/` (OpenCode) or `.claude/commands/` (Claude Code).
2. Include YAML frontmatter with `description`.
3. Keep the body concise; link to shared snippets for reusable content.

## Editing the CLI

1. `bin/cli.js` is the sole CLI entry point.
2. Run `node --test` (or `node test/cli.test.js`) to verify.
3. Keep the CLI self-contained; avoid adding runtime dependencies unless necessary.
