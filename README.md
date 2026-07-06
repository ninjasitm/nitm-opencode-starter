# NITM Opencode Starter

This is an opinionated starter, not a general guide. It ships a working OpenCode setup tuned for mixed-skill teams: a curated 14-agent fleet, four presets (`default`, `balanced`, `high-cost`, `low-cost`), and a default model path that prefers **OpenCode Go with OpenCode models as the fallback**. You can be running in under ten minutes. **Start with the quick setup below**; everything else is reference.

## Quick setup (OpenCode Go + Zen fallback path)

Five minutes to your first session, with OpenCode Go as the default model provider:

- **Install OpenCode**: macOS/Linux: `curl -fsSL https://opencode.ai/install | bash`. Windows: WSL is recommended; native scoop/choco/npm also work.
- **Install the two plugins**: `bunx oh-my-opencode-slim@latest install` and `npm i -g @dietrichgebert/ponytail`. Install `bun` first with `npm i -g bun` if you don't have it.
- **Subscribe to OpenCode Go**: $5 first month, then $10/month. Sign up at [opencode.ai/go](https://opencode.ai/go) and grab your API key.
- **Connect in the TUI**: `opencode`, then `/connect`, pick "OpenCode", paste your key. (Stored at `~/.local/share/opencode/auth.json`: never commit it.)
- **Run from a project dir**: `cd` to your project, then `opencode`. The `default` preset routes most agents to `opencode-go/*` models, with broader Zen models as fallbacks.

That's the whole path. The callout below is a heads-up for reading the rest; the section after that explains why this starter is opinionated.

> **Model prefix convention**: `opencode-go/` = billed through your Go subscription. `opencode/` = billed pay-as-you-go on Zen. **No prefix = also Zen** (this starter is not fully consistent about including the prefix in every table below: treat any bare model name like `glm-5.2` or `minimax-m3` as `opencode/glm-5.2` unless stated otherwise). If you're auditing spend, grep for the prefix before assuming a model is free.

## Start here: this is an opinionated starter

**This is an opinionated starter, not a general guide.** The recommended path for this repo:

1. **Primary: OpenCode Go.** The $5 first-month / $10/month subscription unlocks the `opencode-go/*` model family on Zen (curated open-coding models with generous limits: 5h rolling $12, weekly $30, monthly $60). Most of the agents in the `default` preset point at Go models first.
2. **Fallback: OpenCode models.** When Go is unavailable (rate limit, billing paused, model down), the agents fall through to the broader OpenCode model family: Zen pay-as-you-go and the free models on it.
3. You may switch to `balanced` (mid-cost Go-leaning mix), `high-cost` (frontier-only), or `low-cost` (free-only) presets as your workload changes. Switching requires restarting Opencode (see the `/preset` bug note below).

The `default` preset in `oh-my-opencode-slim.json` is wired this way: Go primaries, broader OpenCode fallbacks. If you want a different tradeoff, switch presets with `OH_MY_OPENCODE_SLIM_PRESET` (see the `/preset` bug note): `balanced` is a Go-leaning mid-cost mix, `high-cost` is frontier-only, `low-cost` is free-only.

If you'd rather not subscribe to Go, the starter still works with Zen or BYO providers: the table below spells out the trade-offs. The opinionated defaults here are tuned for Go; the other paths get the same agent fleet with different billing.

## Pick your connection

OpenCode is one tool; how you connect it to models is the real choice. Three paths:

| Connection         | What it is                                                                                                   | Model prefix                     | Best for                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------- |
| **OpenCode + Zen** | The curated pay-as-you-go gateway run by the OpenCode team. Free models included; recommended for new users. | `opencode/`                      | New users, mixed workloads, occasional frontier calls.                             |
| **OpenCode + Go**  | The $5 first-month / $10/month subscription on Zen. Curated open-coding models with generous limits.         | `opencode-go/`                   | Solo devs who want one bill and reliable model access. **This starter's default.** |
| **OpenCode + BYO** | Bring your own provider keys (Anthropic, OpenAI, Google, local models). OpenCode is provider-agnostic.       | (whatever your provider exposes) | Privacy-first teams, air-gapped work, specific provider needs.                     |

The Go model catalog is public: `https://opencode.ai/zen/go/v1/models`.

**TL;DR**: this starter assumes **Go** (one bill, default model, broad coverage) with certain **Zen** models as fallbacks. Pick **Zen** if you'll mix free and paid models and want to bypass Opencode Go. Pick **BYO** if you're privacy-first or air-gapped and willing to bring your own provider keys.

## Install OpenCode

| OS      | Recommended                                                        | Alternative                                                                                  |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| macOS   | `curl -fsSL https://opencode.ai/install \| bash`                   | `brew install anomalyco/tap/opencode` (always up to date)                                    |
| Linux   | `curl -fsSL https://opencode.ai/install \| bash`                   | `brew install anomalyco/tap/opencode` (works on Linux too) or `npm i -g opencode-ai@latest`  |
| Windows | **WSL is recommended.** Inside WSL, run the macOS/Linux curl line. | Native: `scoop install opencode`, `choco install opencode`, or `npm i -g opencode-ai@latest` |

> **Heads-up**: `curl | bash` is the official path. If you're cautious, run `curl -fsSL https://opencode.ai/install | less` first, then pipe it to `bash`.

Verify:

```bash
opencode --version
```

Anything ≥ `1.x` is supported.

## Install the plugins

Two plugins need to be installed before OpenCode will read the repo's config.

```bash
# oh-my-opencode-slim: the preset / agent layer
bunx oh-my-opencode-slim@latest install

# @dietrichgebert/ponytail: lazy-senior-dev mode (npm package, not vendored)
npm i -g @dietrichgebert/ponytail
```

Re-running `bunx oh-my-opencode-slim@latest install` is the upgrade path. If you don't have `bun` yet, install it with `npm i -g bun` first.

## Authenticate

OpenCode is provider-agnostic. The canonical way to authenticate is the `/connect` slash command in the TUI:

```bash
opencode
> /connect
# pick a provider, follow the prompts
```

For OpenCode Go: sign in at [opencode.ai](https://opencode.ai), subscribe to Go, then `/connect` and pick "OpenCode". Your key is stored at `~/.local/share/opencode/auth.json`: never paste it into a chat or commit it.

## Where your config lives

OpenCode looks for config in many places; the project file walks up to the nearest `.git`. For this starter, the two files that matter are the project-root `opencode.jsonc` and `oh-my-opencode-slim.json`.

| OS      | Global config                                                                     | Auth                                            | Project file      |
| ------- | --------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------- |
| macOS   | `~/.config/opencode/opencode.json`                                                | `~/.local/share/opencode/auth.json`             | `./opencode.json` |
| Linux   | `~/.config/opencode/opencode.json` (or `$XDG_CONFIG_HOME/opencode/opencode.json`) | `~/.local/share/opencode/auth.json`             | `./opencode.json` |
| Windows | `%USERPROFILE%\.config\opencode\opencode.json`                                    | `%USERPROFILE%\.local\share\opencode\auth.json` | `./opencode.json` |

If you're inside a project with an `opencode.json` / `opencode.jsonc`, that takes precedence. Otherwise, OpenCode falls back to the global file. The full config-resolution order is in [opencode.ai/docs/config](https://opencode.ai/docs/config).

## Minimal config files

The repo ships two config files. You don't have to read the full versions: these minimal snippets are enough to start.

### `opencode.jsonc`

```jsonc
{
	"$schema": "https://opencode.ai/config.json",
	"lsp": true,
	"share": "disabled",
	"plugin": [
		"@tarquinen/opencode-dcp@latest",
		"opencode-mem",
		"@dietrichgebert/ponytail",
		"oh-my-opencode-slim",
	],
	"agent": {
		"build": { "disable": true },
		"general": { "disable": true },
	},
}
```

This disables OpenCode's built-in `build` and `general` agents so they don't fight with the slim fleet.

### `oh-my-opencode-slim.json`

```jsonc
{
	"$schema": "https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json",
	"preset": "default",
	"presets": {
		"default": {
			"orchestrator": {
				"model": ["opencode-go/minimax-m3", "opencode/deepseek-v4-pro", "opencode/mimo-v2.5-pro"],
			},
			"fixer": {
				"model": [
					{ "model": "opencode/deepseek-v4-flash-free" },
					{ "model": "opencode-go/deepseek-v4-pro" },
					{ "model": "opencode/qwen3.7-plus", "reasoningEffort": "max" },
				],
			},
			// 6 more built-in agents (oracle, designer, explorer, librarian, council, observer).
			// 14 custom agents (admin-portal, api-specialist, backend-architect,
			// frontend-developer, implementer, green, red, refactor, feature-builder,
			// tdd, planner, reviewer, researcher, documenter) with their own model arrays:
			// see the tracked file. The "balanced", "high-cost", and "low-cost" presets
			// follow the same shape with different model assignments per agent.
		},
		"balanced": { /* same agent roster, mid-cost model assignments */ },
		"high-cost": { /* same agent roster, frontier-only model assignments */ },
		"low-cost": { /* same agent roster, free-only model assignments */ },
	},
	"agents": {
		"admin-portal": {
			"orchestratorPrompt": "Build administrator portals with RBAC, system dashboards, reporting, analytics, and operational tooling. Specializes in admin frameworks and monitoring ecosystem tools.",
		},
		"api-specialist": {
			"orchestratorPrompt": "Design and implement API architecture, documentation, and developer experience. Use for REST design, GraphQL, OpenAPI specs, SDK generation, API versioning, and integration patterns.",
		},
		// 12 more custom agents, each with an orchestratorPrompt sourced from
		// ninjasitm/ai-assisted-dev-toolkit's src/repo/.claude/agents/<name>.agent.md.
		// The prompt is what the orchestrator reads to know when/how to delegate
		// to this agent; the model assignment lives in presets.<name>.<agent>, not here.
	},
	"fallback": { "enabled": true, "timeoutMs": 15000 },
}
```

> **Note on `reasoningEffort`**: set it per-model inside the model array (as above), not at the agent level. Setting it on the agent applies it to every model in the fallback chain: including free/flash models where "max" reasoning effort mostly just burns quota for no quality gain. Confirm this object-array shape against the current schema version before relying on it; if unsupported, split the agent into two rather than over-applying effort to the whole chain.

> **Why prompts and models are split**: the top-level `agents.<name>.orchestratorPrompt` defines the agent's role (read once at startup, doesn't change between presets). The `presets.<name>.<agent>.model` array defines which models the agent runs on for that preset. This separation is what makes it possible to ship all four presets in a single file. See the deprecation note in `Switch presets` for the caveat.

The `fallback` block is what slim uses when an agent has no model list of its own. 15 seconds is the timeout before it gives up and asks the user.

### Reference: full config

The full `opencode.jsonc` is 19 lines; the full `oh-my-opencode-slim.json` is ~1,500 lines (it consolidates all four presets and all 22 agents in one file). Both are tracked in this repo and are the source of truth:

- `opencode.jsonc`: the complete project config.
- `oh-my-opencode-slim.json`: the complete agent roster, all four presets, and the fallback block.

Don't paste the full files into your project if you're starting from scratch; just point your `opencode.jsonc` at the same plugins and copy `oh-my-opencode-slim.json` verbatim. If you change either, the README's tables need a re-check (see Validating).

## Switch presets

Two ways:

**Environment variable** (recommended: the working path today):

```bash
OH_MY_OPENCODE_SLIM_PRESET=balanced opencode
```

Useful for CI or for testing a preset without changing the saved config. The env var takes precedence over the config file's `preset` field.

**Slash command** (inside the OpenCode TUI):

```
/preset
```

Picks from `default`, `balanced`, `high-cost`, `low-cost`.

> **Known bug**: as of v2.1.0, the `/preset` slash command has a runtime issue ([alvinunreal/oh-my-opencode-slim#438](https://github.com/alvinunreal/oh-my-opencode-slim/issues/438)) where switching presets can orphan the plugin-registered agents (`Orchestrator`, `Oracle`, etc.). Use the env var, or restart OpenCode after switching.
>
> **Deprecation note**: the plugin's own docs flag the top-level `agents.<name>.model` field as deprecated in favor of `presets.<name>.<agent>.model`. This starter uses the top-level `agents` key for the static `orchestratorPrompt` only (no model assignment), and the per-preset `model` arrays live entirely under `presets.*.<agent>`. When the plugin removes the top-level key, only the `orchestratorPrompt` entries will need to move (a search-and-replace, not a redesign). Track [#488](https://github.com/alvinunreal/oh-my-opencode-slim/issues/488) and [#512](https://github.com/alvinunreal/oh-my-opencode-slim/issues/512) for the timing.

## Cost snapshot by preset

Rough monthly shape, assuming a single active developer. These are directional, not billed guarantees: actual spend depends on usage volume:

| Preset      | Shape                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | ~$10/mo flat (Go subscription) + occasional Zen pay-as-you-go overage when Go falls back.                                                                                   |
| `balanced`  | Go flat fee + a mid-cost mix of Zen models (some frontier calls for hard tasks, some free/flash for routine work). Expect ~$10–30/mo under steady use.                       |
| `high-cost` | Go flat fee **plus** metered frontier calls (Claude Opus/Sonnet, GPT-5.x, Gemini Pro) on Zen: expect this to be the most expensive preset by a wide margin under heavy use. |
| `low-cost`  | $0 beyond the Go subscription itself: every agent is pinned to a free model. Trade-off is slower iteration and weaker output on hard tasks.                                 |

## Meet the agent fleet

This repo ships **22 agents per preset**: **8 built-in agents** (the orchestrator / oracle / designer / fixer / explorer / librarian / council / observer backbone that the plugin provides) plus **14 custom agents** that are the project's specialization layer. The 14 custom agent names and roles are fixed across presets; only their model assignments change. The 8 built-in agents also vary by preset (`default` ships 6, `high-cost` adds `observer`, `low-cost` adds `council` and pins the others to single free models). The per-preset tables below show the exact roster and the default-preset model assignments; the other three presets are in the tracked `oh-my-opencode-slim.json` under `presets.<name>.<agent>`.

### The preset agents (roster and assignments vary by preset)

#### `default` preset

| Agent          | Primary                           | Fallback 1                        | Fallback 2                             |
| -------------- | --------------------------------- | --------------------------------- | -------------------------------------- |
| `orchestrator` | `opencode-go/minimax-m3`          | `opencode/deepseek-v4-pro`        | `opencode/mimo-v2.5-pro`               |
| `oracle`       | `opencode/mimo-v2.5-pro`          | `opencode/minimax-m3`             | `opencode/deepseek-v4-pro`             |
| `designer`     | `opencode/glm-5.2`                | `opencode/kimi-k2.7-code`         | `opencode/minimax-m3`                  |
| `fixer`        | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-pro`     | `opencode/qwen3.7-plus` (variant: max) |
| `explorer`     | `opencode/mimo-v2.5-free`         | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `librarian`    | `opencode/mimo-v2.5-free`         | `opencode-go/minimax-m3`          | `opencode/deepseek-v4-flash-free`      |

> **Changed from the original defaults** (see model-evidence notes below): `orchestrator` and `oracle` no longer fall back to `glm-5.2` (confirmed steerability regression: bad fit for NL-heavy roles). `deepseek-v4-pro`, the strongest independently-verified model in the pool, is now reachable one hop sooner on `orchestrator`. `designer` now leads with `glm-5.2` (its #1 Design Arena ranking is exactly designer's job, and designer isn't steerability-sensitive); `kimi-k2.7-code` moved to fallback and is flagged **unverified**: its benchmarks are vendor-reported only, no independent numbers yet. `librarian`'s fallback 2 previously duplicated its primary (`mimo-v2.5-free` twice): that's fixed to an actual third option.
>
> Evidence for `explorer`, `librarian`, and `orchestrator`-specific routing (as opposed to general model quality) is thin: no external benchmark targets these roles directly. Treat those three as best-effort until you've run your own A/B tests on real workload.

#### `high-cost` preset (frontier models: costs scale with usage; expect this preset to be materially more expensive than `default`, since every fallback is a metered frontier model with no free tier to land on)

| Agent          | Primary                             | Fallback 1                        | Fallback 2                             |
| -------------- | ----------------------------------- | --------------------------------- | -------------------------------------- |
| `orchestrator` | `opencode/claude-sonnet-5` (medium) | `opencode/gpt-5.4`                | `opencode-go/glm-5.2`                  |
| `oracle`       | `opencode/claude-opus-4-8` (high)   | `opencode/gpt-5.5` (high)         | `opencode-go/glm-5.2`                  |
| `designer`     | `opencode/claude-sonnet-5` (low)    | `opencode/gemini-3.1-pro`         | `opencode-go/kimi-k2.7-code`           |
| `fixer`        | `opencode/claude-sonnet-5`          | `opencode/gpt-5.4`                | `opencode/qwen3.7-plus` (variant: max) |
| `explorer`     | `opencode/gpt-5.4-mini`             | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `librarian`    | `opencode/gpt-5.4-mini`             | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `observer`     | `opencode/gpt-5.4-mini`             | `opencode/gemini-3.5-flash`       | `opencode-go/minimax-m3`               |

`observer` is a 7th agent unique to this preset: not part of the base 6.

#### `low-cost` preset (free models pinned to one provider each)

Every preset agent in `low-cost` is pinned to a single model, at zero marginal cost beyond the Go subscription:

| Agent(s)                                 | Model                             | Notes                                       |
| ---------------------------------------- | --------------------------------- | ------------------------------------------- |
| `orchestrator`, `designer`               | `opencode-go/minimax-m3`          | :                                           |
| `oracle`, `council`, `fixer`, `observer` | `opencode/mimo-v2.5-free`         | `fixer` and `observer` run at variant `max` |
| `explorer`, `librarian`                  | `opencode/deepseek-v4-flash-free` | variant `high`                              |

`council` is unique to this preset: it stands in for a dedicated `oracle` when running fully free, and isn't documented elsewhere in this README beyond this table. If you're relying on `council` for anything oracle-shaped, confirm its actual behavior against the tracked `oh-my-opencode-slim.json` rather than assuming parity with `oracle`.

### The 14 custom agents (names + roles are fixed; model assignments vary by preset)

Grouped by lane. Lane assignments and one-liners are derived from the agent names in the tracked `oh-my-opencode-slim.json`. The full `orchestratorPrompt` for each (sourced from [ninjasitm/ai-assisted-dev-toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/)'s `src/repo/.claude/agents/<name>.agent.md`) is in the JSON under `agents.<name>.orchestratorPrompt`; the one-liners below are the scan-friendly summaries.

#### Codegen

| Agent                 | When to call it                                                               |
| --------------------- | ----------------------------------------------------------------------------- |
| `@green`              | Greenfield scaffolding. New repo, blank slate, want a working starting point. |
| `@frontend-developer` | Frontend implementation. React, Vue, CSS, accessibility.                      |
| `@backend-architect`  | Backend system design. Service boundaries, data flow, contracts.              |
| `@feature-builder`    | End-to-end feature factory. Cross-stack change with no special expertise.     |
| `@tdd`                | Red-green-refactor. Strict test-first.                                        |
| `@refactor`           | Tech-debt cleanup. Behavior-preserving.                                       |
| `@implementer`        | General-purpose fallback. When nothing else fits.                             |

#### Review

| Agent       | When to call it                                   |
| ----------- | ------------------------------------------------- |
| `@red`      | Red-team / critique. Steelman, then attack.       |
| `@reviewer` | Code review. Style, correctness, security, tests. |

#### Ops

| Agent           | When to call it                                      |
| --------------- | ---------------------------------------------------- |
| `@admin-portal` | Admin UIs and dashboards. Forms, tables, role gates. |

#### Research / docs

| Agent             | When to call it                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| `@api-specialist` | API design and OpenAPI specs.                                                   |
| `@planner`        | Task decomposition. Turn a vague goal into a sequenced plan.                    |
| `@researcher`     | Tech research. Compare libraries, read docs, summarize.                         |
| `@documenter`     | Docs, READMEs, runbooks. The person you call to write the thing you just wrote. |

## Bonus commands

### ponytail

`@dietrichgebert/ponytail` ships with these slash commands:

- `/ponytail [lite | full | ultra | off]`: set the intensity. Default is `full`.
- `/ponytail-review`: review the current diff for over-engineering.
- `/ponytail-audit`: audit the whole repo.
- `/ponytail-debt`: list deferred shortcuts.
- `/ponytail-gain`: show measured impact scoreboard.
- `/ponytail-help`: quick reference.

Set the default for every new session with the `PONYTAIL_DEFAULT_MODE` env var (or a `defaultMode` field in `~/.config/ponytail/config.json`). See [the ponytail README](https://github.com/DietrichGebert/ponytail) for the philosophy.

### Telemetry

`oh-my-opencode-slim` sends anonymous usage telemetry. Opt out with:

```bash
export OMO_SEND_ANONYMOUS_TELEMETRY=0
```

Or `OMO_DISABLE_POSTHOG=1`: both work. Drop one in your `~/.zshrc` / `~/.bashrc` / shell profile of choice.

### Edge cases

- **No Node?** The curl installer is the only path that doesn't need Node first. Install Node LTS, then come back.
- **Behind a corporate proxy?** OpenCode respects `HTTPS_PROXY` / `HTTP_PROXY`. Set them like any other CLI tool.
- **Running outside a project dir?** OpenCode walks up to the nearest `.git` looking for `opencode.json`, then falls back to `~/.config/opencode/opencode.json`. If neither is found, it uses the defaults.

## Validating

A quick smoke test:

```bash
# 1. Confirm OpenCode runs
opencode --version

# 2. Confirm the four plugins load
opencode
> /plugins   # should list all four
> exit

# 3. Confirm preset switching works (env-var path, since /preset has a bug)
OH_MY_OPENCODE_SLIM_PRESET=low-cost opencode
> /preset   # may show "low-cost" as active, or fail: see the known bug
> exit
```

For ongoing maintenance, this README is checked by:

- **`markdownlint`** with a custom config (100-col soft wrap, allow `<details>`).
- **`lychee`** for external link checks.
- **A JSON-parse snippet check** that extracts every fenced ` ```jsonc ` block, strips `//` comments, and asserts the result is valid.
- **A preset-table cross-check** that reads `oh-my-opencode-slim.json` and asserts: (a) all four presets are present, (b) every preset defines the same 22-agent roster, (c) every `model` array is non-empty, (d) the `orchestratorPrompt` for each of the 14 custom agents is a non-empty string. The check should diff agent-by-agent, not just count rows.

## Related

- [OpenCode docs](https://opencode.ai/docs)
- [OpenCode Go subscription](https://opencode.ai/go)
- [OpenCode config reference](https://opencode.ai/docs/config)
- [Go model catalog (JSON)](https://opencode.ai/zen/go/v1/models)
- [oh-my-opencode-slim on GitHub](https://github.com/alvinunreal/oh-my-opencode-slim)
- [oh-my-opencode-slim schema](https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json)
- [ponytail on npm](https://www.npmjs.com/package/@dietrichgebert/ponytail)
- [ponytail on GitHub](https://github.com/DietrichGebert/ponytail)
- **[NITM AI-Assisted Development Toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/)**: Cursor rules, GitHub Copilot instructions, `AGENTS.md` templates, and bundled skills (TDD, debugging, etc.). Use it for the prompt-and-rules half of the stack; this repo is the OpenCode-runtime half.
- `opencode.jsonc` (in this repo): full project config
- `oh-my-opencode-slim.json` (in this repo): full preset + agent config
