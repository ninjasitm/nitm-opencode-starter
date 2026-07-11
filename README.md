# NITM Opencode Starter

This is an opinionated starter, not a general guide. It ships a working OpenCode setup tuned for mixed-skill teams: a curated 14-agent fleet, four presets (`default`, `balanced`, `high-cost`, `low-cost`), and a default model path that prefers **OpenCode Go with OpenCode models as the fallback**. You can be running in under ten minutes. Pick the path that fits:

- **LLM Setup**: copy-paste prompt for an AI assistant to do the work.
- **Quick Setup**: human-readable checklist, same steps.
- **Full Guide**: reference for every option and tradeoff.

# CLI

This starter ships an npm CLI so you can bootstrap any repo with one command. Run it from the root of the project you want to set up:

```bash
npx nitm-opencode-starter install   # copy config into this repo, then run the bootstrap patch flow
npx nitm-opencode-starter patch     # re-run the bootstrap patch flow (ensure config + plugins)
npx nitm-opencode-starter upgrade   # re-copy + merge latest config, then re-run plugin installs
npx nitm-opencode-starter doctor    # checklist: verify tools and config are installed
```

- `install`: copies `opencode.jsonc` and `oh-my-opencode-slim.jsonc` into the current repo (skips files that already exist unless `--force`), then runs `patch`.
- `patch`: ensures the config files are present and installs the two plugins (`bunx oh-my-opencode-slim@latest install` and `npm i -g @dietrichgebert/ponytail`; `bun` is installed first if missing).
- `upgrade`: merges the latest starter config into the current repo's config (your active `preset`, extra plugins, and custom presets/agents are preserved; originals are backed up as `*.bak`), then re-runs the plugin installs. Asks for confirmation before overwriting; pass `--yes` to skip the prompt in non-interactive use.
- `doctor`: prints a checklist of whether OpenCode, bun, ponytail, the oh-my-opencode-slim plugin, and the starter config files are present, with a fix line for anything missing. Exits non-zero if any check fails.

# LLM Setup

Copy-paste the block below into any LLM assistant (OpenCode itself, ChatGPT, Claude, etc.) to have it set up this starter for you. It assumes OpenCode Go as the default model provider and the [NITM AI-Assisted Development Toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/) as a prerequisite.

```plaintext
You are an AI assistant that helps developers set up OpenCode with the NITM Opencode Starter. Follow these steps in order. Stop and ask the user if anything fails.

Prerequisites: The NITM AI-Assisted Development Toolkit must be installed in the project (https://github.com/ninjasitm/ai-assisted-dev-toolkit/). It ships .opencode/agents/*.md files that give the 14 custom agents their full prompts. Without it, those agents only get one-liner descriptions.

1. Install OpenCode:
   macOS/Linux: `curl -fsSL https://opencode.ai/install | bash`
   Windows: WSL is recommended; native scoop/choco/npm also work.
   Verify: `opencode --version` (must be >= 1.x).

2. Install the two plugins:
   `bunx oh-my-opencode-slim@latest install`
   `npm i -g @dietrichgebert/ponytail`
   Install bun first with `npm i -g bun` if needed.

3. Copy the two config files (opencode.jsonc and oh-my-opencode-slim.jsonc) into the project root. They are the source of truth for plugins, presets, and the 14 custom agent prompts. Skip if the files already exist in this starter. If other config files exist, back them up first, then ask the user how to merge before overwriting.

4. Subscribe to OpenCode Go at https://opencode.ai/go?ref=8N581SYDM0 and get an API key.

5. Connect providers in the TUI:
   - Run `opencode`, then `/connect`, pick "OpenCode Go", paste the key.
   - Also run `/connect` and enable "OpenCode Zen" as a fallback.

6. Verify the setup:
   - Run `opencode` from the project directory.
   - Run `/plugins` to confirm all four plugins load.
   - Run `/preset` to confirm preset switching works.
   - Run `ping all agents` to confirm the 14 custom agents respond.
```

# Quick Setup

Five minutes to your first session, with OpenCode Go as the default model provider.

> **Prerequisite: set up the prompt-and-rules half first.** Install the [NITM AI-Assisted Development Toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/) in your project before continuing. It ships `.opencode/agents/*.md` thin wrappers (real OpenCode model IDs, full prompt bodies via `@.claude/agents-snippets/<name>.md`) for the 14 custom agents in this starter. OpenCode auto-discovers those files. The `.md` definitions provide the model + prompt body; the `oh-my-opencode-slim.jsonc` `orchestratorPrompt` routing hint layers on top. Without the toolkit, the 14 custom agents only get the one-liner descriptions from `oh-my-opencode-slim.jsonc`.

- [ ] **Install OpenCode**: macOS/Linux: `curl -fsSL https://opencode.ai/install | bash`. Windows: WSL is recommended; native scoop/choco/npm also work.
- [ ] **Install the two plugins**: `bunx oh-my-opencode-slim@latest install` and `npm i -g @dietrichgebert/ponytail`. Install `bun` first with `npm i -g bun` if you don't have it.
- [ ] **Copy the two config files** ([opencode.jsonc](./opencode.jsonc) and [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc)) into the root of your project. They are the source of truth for plugins, presets, and the 14 custom agent prompts. Skip this step if you are starting from this starter (the files are already there).
- [ ] **Subscribe to OpenCode Go**: $5 first month, then $10/month. Sign up at [opencode.ai/go?ref=8N581SYDM0](https://opencode.ai/go?ref=8N581SYDM0) and grab your API key.
- [ ] **Connect in the TUI**: `opencode`, then `/connect`, pick "OpenCode Go", paste your key. (Stored at `~/.local/share/opencode/auth.json`: never commit it.). You will also want to enabled `/connect` "OpenCode Zen" as well
- [ ] **Run from a project dir**: `cd` to your project, then `opencode`. The `default` preset routes most agents to `opencode-go/*` models, with broader Zen models as fallbacks.

# Full Guide

**This is an opinionated starter, not a general guide.** The recommended path for this repo:

1. **Primary: OpenCode Go.** The $5 first-month / $10/month subscription unlocks the `opencode-go/*` model family on Zen (curated open-coding models with generous limits: 5h rolling $12, weekly $30, monthly $60). Most of the agents in the `default` preset point at Go models first.
2. **Fallback: OpenCode models.** When Go is unavailable (rate limit, billing paused, model down), the agents fall through to the broader OpenCode model family: Zen pay-as-you-go and the free models on it.
3. You may switch to `balanced` (mid-cost Go-leaning mix), `high-cost` (frontier-only), or `low-cost` (free-only) presets as your workload changes. Switching requires restarting Opencode (see the `/preset` bug note below).

The `default` preset in [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) is wired this way: Go primaries, broader OpenCode fallbacks. If you want a different tradeoff, switch presets with `OH_MY_OPENCODE_SLIM_PRESET` (see the `/preset` bug note): `balanced` is a Go-leaning mid-cost mix, `high-cost` is frontier-only, `low-cost` is free-only.

If you would rather not subscribe to Go, the starter still works with Zen or BYO providers: the table below spells out the trade-offs. The opinionated defaults here are tuned for Go; the other paths get the same agent fleet with different billing.

## Pick your connection

**TL;DR**: this starter assumes **Go** (one bill, default model, broad coverage) with certain **Zen** models as fallbacks. Pick **Zen** if you will mix free and paid models and want to bypass Opencode Go. Pick **BYO** if you are privacy-first or air-gapped and willing to bring your own provider keys.

OpenCode is one tool; how you connect it to models is the real choice. Three paths:

| Connection         | What it is                                                                                                   | Model prefix                     | Best for                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------- |
| **OpenCode + Zen** | The curated pay-as-you-go gateway run by the OpenCode team. Free models included; recommended for new users. | `opencode/`                      | New users, mixed workloads, occasional frontier calls.                             |
| **OpenCode + Go**  | The $5 first-month / $10/month subscription on Zen. Curated open-coding models with generous limits.         | `opencode-go/`                   | Solo devs who want one bill and reliable model access. **This starter's default.** |
| **OpenCode + BYO** | Bring your own provider keys (Anthropic, OpenAI, Google, local models). OpenCode is provider-agnostic.       | (whatever your provider exposes) | Privacy-first teams, air-gapped work, specific provider needs.                     |

The Go model catalog is public: `https://opencode.ai/zen/go/v1/models`.

## Install OpenCode

| OS      | Recommended                                                        | Alternative                                                                                  |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| macOS   | `curl -fsSL https://opencode.ai/install \| bash`                   | `brew install anomalyco/tap/opencode` (always up to date)                                    |
| Linux   | `curl -fsSL https://opencode.ai/install \| bash`                   | `brew install anomalyco/tap/opencode` (works on Linux too) or `npm i -g opencode-ai@latest`  |
| Windows | **WSL is recommended.** Inside WSL, run the macOS/Linux curl line. | Native: `scoop install opencode`, `choco install opencode`, or `npm i -g opencode-ai@latest` |

> **Heads-up**: `curl | bash` is the official path. If you are cautious, run `curl -fsSL https://opencode.ai/install | less` first, then pipe it to `bash`.

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

Re-running `bunx oh-my-opencode-slim@latest install` is the upgrade path. If you do not have `bun` yet, install it with `npm i -g bun` first.

## Authenticate

OpenCode is provider-agnostic. The canonical way to authenticate is the `/connect` slash command in the TUI:

```bash
opencode
> /connect
# pick a provider, follow the prompts
```

For OpenCode Go: sign in at [opencode.ai](https://opencode.ai), subscribe to Go at [opencode.ai/go?ref=8N581SYDM0](https://opencode.ai/go?ref=8N581SYDM0), then `/connect` and pick "OpenCode". Your key is stored at `~/.local/share/opencode/auth.json`: never paste it into a chat or commit it.

### Configure your account

After subscribing to Go, configure your OpenCode account at [opencode.ai](https://opencode.ai) to avoid surprise charges:

1. **Use available balance**: in the Go config, enable "Use your available balance after reaching the usage limits". This lets you continue using Go models when you hit the rolling limits, drawing from your account balance instead of failing.
2. **Enable Billing**: in your OpenCode account Billing settings, turn on Billing. This is required for pay-as-you-go usage beyond the Go subscription.
3. **Auto Reload**: in Billing settings, enable Auto Reload so your balance tops up automatically when it runs low.
4. **Monthly Limit**: in Billing settings, set a Monthly Limit to cap your maximum spend. This is the hard stop that prevents runaway costs. Recommended $40 to start which brings you to $50 total with the Go subscription.

## Where your config lives

OpenCode looks for config in many places; the project file walks up to the nearest `.git`. For this starter, the two files that matter are the project-root [opencode.jsonc](./opencode.jsonc) and [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc).

OpenCode also auto-discovers agent definitions from any `.opencode/agent/*.md` or `.opencode/agents/*.md` file under a `.opencode/` directory in the project tree. The [NITM AI-Assisted Development Toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/) (see the Quick setup prerequisite) ships 14 such files: one per custom agent in this starter.

| OS      | Global config                                                                     | Auth                                            | Project file                         |
| ------- | --------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| macOS   | `~/.config/opencode/opencode.json`                                                | `~/.local/share/opencode/auth.json`             | [./opencode.jsonc](./opencode.jsonc) |
| Linux   | `~/.config/opencode/opencode.json` (or `$XDG_CONFIG_HOME/opencode/opencode.json`) | `~/.local/share/opencode/auth.json`             | [./opencode.jsonc](./opencode.jsonc) |
| Windows | `%USERPROFILE%\.config\opencode\opencode.json`                                    | `%USERPROFILE%\.local\share\opencode\auth.json` | [./opencode.jsonc](./opencode.jsonc) |

If you are inside a project with an `opencode.json` / `opencode.jsonc`, that takes precedence. Otherwise, OpenCode falls back to the global file. The full config-resolution order is in [opencode.ai/docs/config](https://opencode.ai/docs/config).

## Minimal config files

The repo ships two config files. If you are using this starter as a template, the full files are the source of truth and can be copied verbatim into your project root.

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

This disables OpenCode's built-in `build` and `general` agents so they do not fight with the slim fleet.

### `oh-my-opencode-slim.jsonc`

See [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) for the full contents: all four presets (`default`, `balanced`, `high-cost`, `low-cost`) with every agent's model array, temperature, and variant settings. The file is self-contained; copy it into your project root.

> **Note on `reasoningEffort`**: set it per-model inside the model array, not at the agent level. Setting it on the agent applies it to every model in the fallback chain, including free/flash models where "max" reasoning effort mostly just burns quota for no quality gain.

The `fallback` block is what slim uses when an agent has no model list of its own. 15 seconds is the timeout before it gives up and asks the user.

## Switch presets

Two ways:

**Environment variable** (recommended: the working path today):

```bash
OH_MY_OPENCODE_SLIM_PRESET=balanced opencode
```

Useful for CI or for testing a preset without changing the saved config. The env var takes precedence over the config file's `preset` field.

**Slash command** (inside the OpenCode TUI):

```
/preset <name>
```

Picks from `default`, `balanced`, `high-cost`, `low-cost`.

## Cost snapshot by preset

Rough monthly shape, assuming a single active developer. These are directional, not billed guarantees: actual spend depends on usage volume.

| Preset      | Shape                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | ~$10/mo flat (Go subscription) + occasional Zen pay-as-you-go overage when Go falls back.                                                                                   |
| `balanced`  | Go flat fee + a mid-cost mix of Zen models (some frontier calls for hard tasks, some free/flash for routine work). Expect ~$10–30/mo under steady use.                      |
| `high-cost` | Go flat fee **plus** metered frontier calls (Claude Opus/Sonnet, GPT-5.x, Gemini Pro) on Zen: expect this to be the most expensive preset by a wide margin under heavy use. |
| `low-cost`  | $0 beyond the Go subscription itself: every agent is pinned to a free model. Trade-off is slower iteration and weaker output on hard tasks.                                 |

# Meet the agent fleet

22 agents run per preset: 8 built-in (orchestrator, oracle, designer, fixer, explorer, librarian, observer, council) plus 14 custom. The 14 custom agents have static `orchestratorPrompt` routing hints in [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc). When the NITM AI-Assisted Development Toolkit is installed (see the Quick setup prerequisite), each custom agent's full prompt body and model come from the toolkit's `.opencode/agents/<name>.md` and override the JSON. The per-preset built-in agent rosters and model assignments are below; the custom agent roles are stable across presets.

Built-in agent rosters by preset:

| Preset      | Built-in roster                                                                   |
| ----------- | --------------------------------------------------------------------------------- |
| `default`   | orchestrator, oracle, designer, fixer, explorer, librarian (6)                    |
| `balanced`  | orchestrator, oracle, designer, fixer, explorer, librarian, observer, council (8) |
| `high-cost` | orchestrator, oracle, designer, fixer, explorer, librarian, observer (7)          |
| `low-cost`  | orchestrator, oracle, designer, fixer, explorer, librarian, observer, council (8) |

## The Presets

### `default` Preset

| Agent          | Primary                           | Fallback 1                        | Fallback 2                             |
| -------------- | --------------------------------- | --------------------------------- | -------------------------------------- |
| `orchestrator` | `opencode-go/minimax-m3`          | `opencode/deepseek-v4-pro`        | `opencode/mimo-v2.5-pro`               |
| `oracle`       | `opencode/mimo-v2.5-pro`          | `opencode/minimax-m3`             | `opencode/deepseek-v4-pro`             |
| `designer`     | `opencode/glm-5.2`                | `opencode/kimi-k2.7-code`         | `opencode/minimax-m3`                  |
| `fixer`        | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-pro`     | `opencode/qwen3.7-plus` (variant: max) |
| `explorer`     | `opencode/mimo-v2.5-free`         | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `librarian`    | `opencode/mimo-v2.5-free`         | `opencode-go/minimax-m3`          | `opencode/deepseek-v4-flash-free`      |

### `balanced` Preset

Mid-cost Go-leaning mix. All 8 built-in agents are active.

| Agent          | Primary                                      | Fallback 1                               | Fallback 2                                 |
| -------------- | -------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `orchestrator` | `opencode-go/minimax-m3` (variant: high)     | `opencode/claude-sonnet-5` (medium)      | `opencode-go/mimo-v2.5-pro` (variant: max) |
| `oracle`       | `opencode-go/glm-5.2` (variant: max)         | `opencode-go/mimo-v2.5-pro` (high)       | `opencode/gpt-5.5` (medium)                |
| `designer`     | `opencode/claude-sonnet-5` (medium)          | `opencode-go/glm-5.2` (medium)           | `opencode-go/minimax-m3` (high)            |
| `fixer`        | `opencode/deepseek-v4-flash-free` (high)     | `opencode-go/deepseek-v4-pro` (high)     | `opencode/qwen3.7-plus` (high)             |
| `explorer`     | `opencode/mimo-v2.5-free` (high)             | `opencode/deepseek-v4-flash-free` (high) | `opencode-go/deepseek-v4-flash` (high)     |
| `librarian`    | `opencode/mimo-v2.5-free` (high)             | `opencode/deepseek-v4-flash-free` (high) | `opencode-go/minimax-m3` (high)            |
| `observer`     | `opencode/mimo-v2.5-free` (high)             | `opencode/deepseek-v4-flash-free` (high) | `opencode-go/minimax-m3` (high)            |
| `council`      | `opencode-go/deepseek-v4-pro` (variant: max) | `opencode-go/kimi-k2.7-code` (max)       | `opencode-go/glm-5.2` (max)                |

### `high-cost` Preset

Frontier models: costs scale with usage; expect this preset to be materially more expensive than `default`, since every fallback is a metered frontier model with no free tier to land on.

| Agent          | Primary                             | Fallback 1                        | Fallback 2                             |
| -------------- | ----------------------------------- | --------------------------------- | -------------------------------------- |
| `orchestrator` | `opencode/claude-sonnet-5` (medium) | `opencode/gpt-5.4`                | `opencode-go/glm-5.2`                  |
| `oracle`       | `opencode/claude-opus-4-8` (high)   | `opencode/gpt-5.5` (high)         | `opencode-go/glm-5.2`                  |
| `designer`     | `opencode/claude-sonnet-5` (low)    | `opencode/gemini-3.1-pro`         | `opencode-go/kimi-k2.7-code`           |
| `fixer`        | `opencode/claude-sonnet-5`          | `opencode/gpt-5.4`                | `opencode/qwen3.7-plus` (variant: max) |
| `explorer`     | `opencode/gpt-5.4-mini`             | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `librarian`    | `opencode/gpt-5.4-mini`             | `opencode/deepseek-v4-flash-free` | `opencode-go/deepseek-v4-flash`        |
| `observer`     | `opencode/gpt-5.4-mini`             | `opencode/gemini-3.5-flash`       | `opencode-go/minimax-m3`               |

`observer` is the 7th agent unique to this preset: not part of the base 6.

### `low-cost` Preset

Every preset agent in `low-cost` is pinned to a single model, at zero marginal cost beyond the Go subscription.

| Agent(s)                                 | Model                             | Notes                                       |
| ---------------------------------------- | --------------------------------- | ------------------------------------------- |
| `orchestrator`, `designer`               | `opencode-go/minimax-m3`          |                                             |
| `oracle`, `council`, `fixer`, `observer` | `opencode/mimo-v2.5-free`         | `fixer` and `observer` run at variant `max` |
| `explorer`, `librarian`                  | `opencode/deepseek-v4-flash-free` | variant `high`                              |

`council` is unique to this preset: it stands in for a dedicated `oracle` when running fully free, and is not documented elsewhere in this README beyond this table. If you are relying on `council` for anything oracle-shaped, confirm its actual behavior against the tracked [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) rather than assuming parity with `oracle`.

## The Custom Agents

Grouped by lane. Lane assignments and one-liners are derived from the agent names in the tracked [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc). The full `orchestratorPrompt` for each (sourced from [ninjasitm/ai-assisted-dev-toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/)'s `src/repo/.claude/agents/<name>.agent.md`) is in the JSON under `agents.<name>.orchestratorPrompt`; the one-liners below are the scan-friendly summaries. **The full prompt body and model for each agent come from `.opencode/agents/<name>.md`** (which `@`-references the matching `.claude/agents-snippets/<name>.md`); OMO slim only adds the `orchestratorPrompt` routing hint on top.

### Codegen

| Agent                 | When to call it                                                               |
| --------------------- | ----------------------------------------------------------------------------- |
| `@green`              | Greenfield scaffolding. New repo, blank slate, want a working starting point. |
| `@frontend-developer` | Frontend implementation. React, Vue, CSS, accessibility.                      |
| `@backend-architect`  | Backend system design. Service boundaries, data flow, contracts.              |
| `@feature-builder`    | End-to-end feature factory. Cross-stack change with no special expertise.     |
| `@tdd`                | Red-green-refactor. Strict test-first.                                        |
| `@refactor`           | Tech-debt cleanup. Behavior-preserving.                                       |
| `@implementer`        | General-purpose fallback. When nothing else fits.                             |

### Review

| Agent       | When to call it                                   |
| ----------- | ------------------------------------------------- |
| `@red`      | Red-team / critique. Steelman, then attack.       |
| `@reviewer` | Code review. Style, correctness, security, tests. |

### Ops

| Agent           | When to call it                                      |
| --------------- | ---------------------------------------------------- |
| `@admin-portal` | Admin UIs and dashboards. Forms, tables, role gates. |

### Research / docs

| Agent             | When to call it                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| `@api-specialist` | API design and OpenAPI specs.                                                   |
| `@planner`        | Task decomposition. Turn a vague goal into a sequenced plan.                    |
| `@researcher`     | Tech research. Compare libraries, read docs, summarize.                         |
| `@documenter`     | Docs, READMEs, runbooks. The person you call to write the thing you just wrote. |

# Bonus Commands

## ponytail

`@dietrichgebert/ponytail` ships with these slash commands:

- `/ponytail [lite | full | ultra | off]`: set the intensity. Default is `full`.
- `/ponytail-review`: review the current diff for over-engineering.
- `/ponytail-audit`: audit the whole repo.
- `/ponytail-debt`: list deferred shortcuts.
- `/ponytail-gain`: show measured impact scoreboard.
- `/ponytail-help`: quick reference.

Set the default for every new session with the `PONYTAIL_DEFAULT_MODE` env var (or a `defaultMode` field in `~/.config/ponytail/config.json`). See [the ponytail README](https://github.com/DietrichGebert/ponytail) for the philosophy.

# Telemetry

`oh-my-opencode-slim` sends anonymous usage telemetry. Opt out with:

```bash
export OMO_SEND_ANONYMOUS_TELEMETRY=0
```

Or `OMO_DISABLE_POSTHOG=1`: both work. Drop one in your `~/.zshrc` / `~/.bashrc` / shell profile of choice.

# Edge cases

- **No Node?** The curl installer is the only path that does not need Node first. Install Node LTS, then come back.
- **Behind a corporate proxy?** OpenCode respects `HTTPS_PROXY` / `HTTP_PROXY`. Set them like any other CLI tool.
- **Running outside a project dir?** OpenCode walks up to the nearest `.git` looking for `opencode.json`, then falls back to `~/.config/opencode/opencode.json`. If neither is found, it uses the defaults.

# Validating

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
- **A preset-table cross-check** that reads [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) and asserts: (a) all four presets are present, (b) every preset defines the same 22-agent roster, (c) every `model` array is non-empty, (d) the `orchestratorPrompt` for each of the 14 custom agents is a non-empty string. The check should diff agent-by-agent, not just count rows. Cross-check against `.opencode/agents/*.md` when present in the same repo (i.e. if the NITM AI-Assisted Development Toolkit is vendored here): the 14 custom agents' `name`, `model`, `mode`, and `permission` keys should be consistent across both sources. [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) is the fallback when `.opencode/agents/` is absent.

# Related

- [OpenCode docs](https://opencode.ai/docs)
- [OpenCode Go subscription](https://opencode.ai/go?ref=8N581SYDM0)
- [OpenCode config reference](https://opencode.ai/docs/config)
- [Go model catalog (JSON)](https://opencode.ai/zen/go/v1/models)
- [oh-my-opencode-slim on GitHub](https://github.com/alvinunreal/oh-my-opencode-slim)
- [oh-my-opencode-slim schema](https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json)
- [ponytail on npm](https://www.npmjs.com/package/@dietrichgebert/ponytail)
- [ponytail on GitHub](https://github.com/DietrichGebert/ponytail)
- **[NITM AI-Assisted Development Toolkit](https://github.com/ninjasitm/ai-assisted-dev-toolkit/)**: Cursor rules, GitHub Copilot instructions, `AGENTS.md` templates, and bundled skills (TDD, debugging, etc.). Use it for the prompt-and-rules half of the stack; this repo is the OpenCode-runtime half.
- [opencode.jsonc](./opencode.jsonc) (in this repo): full project config
- [oh-my-opencode-slim.jsonc](./oh-my-opencode-slim.jsonc) (in this repo): full preset + agent config
