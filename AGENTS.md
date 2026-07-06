# AGENTS.md

Conventions for AI agents (and humans) working on this repo.

## Project layout

```
.
├── README.md                   # User-facing guide (information only; no design rationale)
├── opencode.jsonc              # Project config: plugins, disabled built-ins
├── oh-my-opencode-slim.jsonc   # Preset + agent fleet config
├── AGENTS.md                   # This file
├── CHANGELOG.md                # Design decision log
└── .gitignore
```

`interview/` (untracked) holds the design conversation that produced this repo. Do not commit it.

## Two sources for the 14 custom agents

The 14 custom agents are defined in two places, and OpenCode merges them. Order of precedence (highest first):

1. **`.opencode/agents/<name>.md`** is auto-discovered by OpenCode (`{agent,agents}/**/*.md` glob, recursive, symlink-aware). Shipped by the NITM AI-Assisted Development Toolkit, which is a project-level prerequisite. Each file is a thin wrapper: real OpenCode model IDs, `mode: subagent`, `permission` block, body that `@`-references `.claude/agents-snippets/<name>.md` for the full prompt.
2. **`oh-my-opencode-slim.jsonc` `agents.<name>.orchestratorPrompt` + `presets.<name>.<agent>.model`** is what OMO slim contributes. The `orchestratorPrompt` (one-sentence routing hint) is layered on top regardless. The `model` array is **overridden** by the `.md` file's `model` field due to OMO slim's `config()` hook doing `{ ...pluginAgent, ...existing }` (existing wins).

**Practical consequence**: the 14 custom agents use the `.md`'s static model regardless of which preset is active. The 4 presets then only meaningfully differ for the 8 built-in agents (orchestrator, oracle, council, designer, fixer, explorer, librarian, observer). The `oh-my-opencode-slim.jsonc` model arrays for the 14 custom agents still serve as a fallback for the rare case where the toolkit is not installed.

## Adding a preset

To add a new preset to `oh-my-opencode-slim.jsonc`:

1. Add the new key under `presets.<new-name>`. Match the existing shape: 8 built-in agents with `model` arrays.
2. Validate that every preset has the same 22-agent roster (8 built-in + 14 custom).
3. Run the validation checks listed below.
4. Update the README's "Cost snapshot by preset" and the per-preset tables in "Meet the agent fleet".

## Adding a custom agent

The 14 custom agents are coordinated across two repos. To add a new one:

1. Add the agent's `.md` definition to the NITM AI-Assisted Development Toolkit's `.opencode/agents/<name>.md` and `.claude/agents/<name>.agent.md` (the frontmatter `description` is the orchestratorPrompt source).
2. Add `agents.<new-name>.orchestratorPrompt` to `oh-my-opencode-slim.jsonc` (one-liner from the toolkit's frontmatter).
3. Add the new agent's `model` array to all 4 presets in `oh-my-opencode-slim.jsonc`.
4. Update the README's "Meet the agent fleet > The Custom Agents" lane tables.
5. Run validation.

## Validation

See the `Validating` section of `README.md` for the full smoke-test list. The two non-obvious checks:

- **JSON-parse snippet check**: extract every fenced ` ```jsonc ` block from the README, strip `//` comments, assert valid.
- **Preset-table cross-check**: read `oh-my-opencode-slim.jsonc` and assert (a) all four presets present, (b) same 22-agent roster per preset, (c) every `model` array non-empty, (d) every `orchestratorPrompt` non-empty string. Then diff agent-by-agent against `.opencode/agents/*.md` if vendored.

## What NOT to do

- **Do not** add `model` to top-level `agents.<custom>.model` in `oh-my-opencode-slim.jsonc`. Custom-agent model assignments live in `presets.<name>.<custom>.model` only. Adding it at top-level is silently ignored due to the merge order (the `.md` wins).
- **Do not** commit `~/.local/share/opencode/auth.json` or any secrets.
- **Do not** commit `interview/`. It is already in `.gitignore`.
- **Do not** split the 4 presets into separate files. The single-file pattern is intentional.
- **Do not** add emdashes to the README. The doc is information-only and emdashes tend to introduce opinionated framing.
- **Do not** add TL;DRs except at the top of the section they summarize.
- **Do not** put decision rationale in the README. Use `CHANGELOG.md` for "why we chose this" and this file for "how to work on this".
