# CHANGELOG

Design decision log for the NITM Opencode Starter. Entries are not dated; they document why decisions were made.

## Default model path is OpenCode Go with Zen fallback

OpenCode Go is a $5/mo (first month) / $10/mo subscription that unlocks the `opencode-go/*` model family on Zen with generous limits (5h rolling $12, weekly $30, monthly $60). It is the recommended primary because:

- Single predictable bill (subscription, not metered).
- Curated for open-coding workloads.
- Generous limits compared to Zen pay-as-you-go.

The `default` preset wires agents to Go primaries and broader Zen fallbacks. The `balanced` preset is a Go-leaning mid-cost mix. The `high-cost` preset is frontier-only and pays metered rates on top of the Go flat fee. The `low-cost` preset pins every agent to free models.

The OpenCode Zen pay-as-you-go path is supported but not the default: new users with mixed free/paid workloads may prefer it. BYO providers (Anthropic, OpenAI, Google, local) are also supported and use the same agent fleet.

## 4 presets, not 1 or 3

The 4 presets span the cost/performance trade-off:

- `default`: Go primaries, Zen fallbacks.
- `balanced`: Go-leaning mix with some frontier calls.
- `high-cost`: all frontier (Claude Opus/Sonnet, GPT-5.x, Gemini Pro).
- `low-cost`: all free.

One preset (just `default`) would force every team to a single cost profile. Three presets (default, high, low) would conflate "mid-cost balanced" with "default". Four gives a balanced midpoint without making it the default.

## Single `oh-my-opencode-slim.jsonc`, not one file per preset

A single file is the only way to get the dual-source merge order to work: OMO slim reads the active preset's `model` array once at startup, and the per-preset switch via `OH_MY_OPENCODE_SLIM_PRESET` env var is the working path. Splitting into 4 files (one per preset) would require either switching the config file pointer at runtime (fragile) or duplicating the 14 custom agents 4 times (drift risk). The single-file pattern is intentional; see upstream issue alvinunreal/oh-my-opencode-slim#438 for the `/preset` slash command bug history that confirmed this is the right call.

## Custom agents are dual-source

The 14 custom agents are defined in two places: this repo's `oh-my-opencode-slim.jsonc` (routing hint + per-preset model arrays) and the NITM AI-Assisted Development Toolkit's `.opencode/agents/<name>.md` (real model + full prompt body). The toolkit wins for model and prompt body due to OMO slim's `config()` hook. The JSON adds the `orchestratorPrompt` routing hint on top.

This split is deliberate: the toolkit is the source of truth for agent prompts (long-lived, slow-moving), and this repo is the runtime config (presets, billing, plugins). They evolve at different cadences.

## `.jsonc` extension for config files

OMO slim's loader supports `.jsonc` natively (`stripJsonComments` handles `//` and `/* */`). The `.jsonc` extension lets us add inline comments to the config without breaking parsing. The full file has ~1,500 lines with extensive comments explaining each preset's rationale.

## NITM AI-Assisted Development Toolkit is a prerequisite

Without the toolkit, the 14 custom agents only get the one-liner `orchestratorPrompt` from `oh-my-opencode-slim.jsonc`. They have no full prompt body and use the per-preset model arrays from the JSON. This is acceptable for some workflows but limits the agents to routing hints.

The toolkit ships the actual `.md` definitions with full prompts, real OpenCode model IDs, and mode/permission metadata. It is a prerequisite because the alternative (vendoring the 14 `.md` files in this repo) would duplicate ~50KB of content and drift over time.

## OpenCode's built-in `build` and `general` agents are disabled

These two built-in agents overlap heavily with the slim fleet (especially `general` vs `orchestrator` + `implementer`, and `build` vs `feature-builder` + `tdd`). Disabling them in `opencode.jsonc` avoids duplicate task routing and conflicting model assignments.
