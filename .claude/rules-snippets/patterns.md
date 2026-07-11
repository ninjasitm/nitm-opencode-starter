# Rules and conventions

## File naming

- `.md` files are rules, skills, commands, or documentation.
- Snippet files live in `*-snippets/` directories; thin wrappers reference them.

## Reuse-first principle

- **Before implementing new functionality, review existing patterns** in the codebase (skills, plugins, prompt snippets, rule snippets) for capabilities that already solve the problem.
- **Prefer extending existing utilities** over creating new ones or duplicating logic inline — a new solution is only warranted when the existing one genuinely cannot accommodate the use case.
- **Never duplicate state or behavior** that an existing utility already manages (e.g., loading flags, error state, async wrappers). Inline duplication violates SRP and makes behavior inconsistent across the codebase.
- When in doubt, extend the existing pattern and keep consumers thin.

## Snippet conventions

- Shared content lives in `.claude/rules-snippets/` or `.claude/prompt-snippets/`.
- Thin wrappers in `.claude/rules/`, `.opencode/rules/`, and `.agents/rules/` point to the shared snippets so multiple tools stay DRY.
- When editing a snippet, verify that all wrappers referencing it still resolve after the change.
