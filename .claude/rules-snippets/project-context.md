# Project context rules

## What this repo is

`nitm-opencode-starter` is an **npm CLI + OpenCode starter config**. The CLI (`bin/cli.js`) bootstraps, patches, upgrades, and diagnoses an OpenCode installation. The repo also ships the OpenCode agent fleet configuration and ponytail skills.

## Purpose

- Provide a one-command bootstrap (`npx nitm-opencode-starter`) for a curated OpenCode setup.
- Ship the 4-preset agent fleet config (`oh-my-opencode-slim.jsonc`) and OpenCode project config (`opencode.jsonc`).
- Bundle ponytail skills and a ponytail plugin under `.agents/skills/` and `.opencode/plugins/`.

## Repo layout

- `bin/cli.js` — npm CLI entry point.
- `package.json` — npm package metadata.
- `opencode.jsonc` — OpenCode project config (plugins, disabled built-ins).
- `oh-my-opencode-slim.jsonc` — OMO slim preset + agent fleet config.

### AI instruction layers

Rules, skills, and commands are shared across tools via a thin-wrapper pattern:

1. **Shared snippets** — `.claude/rules-snippets/` and `.claude/prompt-snippets/` hold the real content.
2. **Thin wrappers** — `.claude/rules/`, `.opencode/rules/`, and `.agents/rules/` contain short files that point to the shared snippets. Claude Code, OpenCode, and other tools each read their own rules directory; the snippets stay DRY.
3. **Skills** — `.agents/skills/` holds OpenCode skill definitions (ponytail-*, orient-to-recent-work, gh-cli).
4. **Commands** — `.opencode/commands/` and `.claude/commands/` hold tool-specific slash commands.
5. **Plugins** — `.opencode/plugins/` holds OpenCode server-side plugins (auto-discovered, no config needed).

### CI/CD

- `.github/workflows/` — GitHub Actions for release and npm publish.
