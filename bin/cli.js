#!/usr/bin/env node
"use strict";

// nitm-opencode-starter CLI
// Commands: install, patch, upgrade, doctor
// Ships the two starter config files and applies them to the repo you run it in.

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");
const os = require("os");

const CONFIG_FILES = ["opencode.jsonc", "oh-my-opencode-slim.jsonc"];
const PKG_DIR = path.join(__dirname, "..");

// Keys whose user value is always preserved during an upgrade merge.
const PRESERVE_KEYS = new Set(["preset"]);
// Array keys that are unioned (user extras kept) instead of replaced.
// Only `plugin` is unioned; all other arrays (e.g. model) and non-array leaf
// fields are replaced by the package value on upgrade.
const UNION_ARRAYS = new Set(["plugin"]);

function log(...a) {
  console.log("[nitm-opencode-starter]", ...a);
}
function warn(...a) {
  console.warn("[nitm-opencode-starter] WARN:", ...a);
}
function fail(...a) {
  console.error("[nitm-opencode-starter] ERROR:", ...a);
}

// --- JSONC handling (no deps) ---

function stripJsonc(text) {
  // Pass 1: drop comments (string-aware).
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const c2 = text[i + 1];
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const ch = text[i];
        out += ch;
        if (ch === "\\") { out += text[i + 1]; i += 2; continue; }
        if (ch === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === "/" && c2 === "/") { while (i < n && text[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*") { i += 2; while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i++; i += 2; continue; }
    out += c;
    i++;
  }
  // Pass 2: drop trailing commas, string-aware so values like ",]" are untouched.
  let res = "";
  let j = 0;
  let inStr = false;
  let q = "";
  while (j < out.length) {
    const ch = out[j];
    if (inStr) {
      res += ch;
      if (ch === "\\") { res += out[j + 1]; j += 2; continue; }
      if (ch === q) inStr = false;
      j++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = true; q = ch; res += ch; j++; continue; }
    if (ch === ",") {
      let k = j + 1;
      while (k < out.length && /\s/.test(out[k])) k++;
      if (out[k] === "}" || out[k] === "]") { j = k; continue; }
      res += ch; j++;
      continue;
    }
    res += ch; j++;
  }
  return res;
}

function parseJsonc(text) {
  return JSON.parse(stripJsonc(text));
}

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

// Merge package config over user config: user-only keys preserved, package wins
// on leaf conflicts, except PRESERVE_KEYS (kept from user) and UNION_ARRAYS (unioned).
function mergeConfig(pkg, user) {
  const out = user ? { ...user } : {};
  for (const [k, v] of Object.entries(pkg)) {
    if (PRESERVE_KEYS.has(k) && k in out) continue;
    if (Array.isArray(v) && UNION_ARRAYS.has(k) && Array.isArray(out[k])) {
      out[k] = [...new Set([...out[k], ...v])];
    } else if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = mergeConfig(v, out[k]);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// --- shell helpers ---

function tryRun(cmd) {
  try {
    execSync(cmd, { stdio: "ignore", timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit", timeout: 300000 });
  } catch {
    fail("Command failed:", cmd);
    process.exit(1);
  }
}

function ensureBun() {
  if (tryRun("bun --version")) return;
  log("bun not found, installing via npm...");
  run("npm i -g bun");
}

function installPlugins() {
  ensureBun();
  log("Installing oh-my-opencode-slim plugin...");
  run("bunx oh-my-opencode-slim@latest install");
  log("Installing @dietrichgebert/ponytail...");
  run("npm i -g @dietrichgebert/ponytail");
}

// --- file ops ---

function backup(p) {
  const bakDir = fs.mkdtempSync(path.join(os.tmpdir(), "nitm-opencode-starter-bak-"));
  fs.copyFileSync(p, path.join(bakDir, path.basename(p)));
  log("Backed up existing", path.basename(p), "to", path.join(bakDir, path.basename(p)));
}

function copyMissing() {
  for (const f of CONFIG_FILES) {
    const src = path.join(PKG_DIR, f);
    const dest = path.join(process.cwd(), f);
    if (fs.existsSync(dest)) {
      log(path.basename(dest), "already present, skipping (use --force to overwrite).");
      continue;
    }
    fs.copyFileSync(src, dest);
    log("Copied", f, "into", process.cwd());
  }
}

function copyForce() {
  for (const f of CONFIG_FILES) {
    const src = path.join(PKG_DIR, f);
    const dest = path.join(process.cwd(), f);
    if (fs.existsSync(dest)) backup(dest);
    fs.copyFileSync(src, dest);
    log("Wrote", f, "into", process.cwd());
  }
}

function mergeConfigFiles() {
  for (const f of CONFIG_FILES) {
    const src = path.join(PKG_DIR, f);
    const dest = path.join(process.cwd(), f);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      log("Copied", f, "(no existing file to merge).");
      continue;
    }
    backup(dest);
    const merged = mergeConfig(parseJsonc(fs.readFileSync(src, "utf8")), parseJsonc(fs.readFileSync(dest, "utf8")));
    fs.writeFileSync(dest, JSON.stringify(merged, null, 2) + "\n");
    log("Merged", f, "with latest starter config (comments stripped on upgrade).");
  }
}

// --- commands ---

function runBootstrapPatch() {
  copyMissing();
  installPlugins();
}

function cmdInstall(force) {
  log("Initializing OpenCode for", process.cwd());
  if (force) copyForce();
  else copyMissing();
  installPlugins();
  log("Install complete. Run `opencode` from this directory to start.");
}

function cmdPatch() {
  log("Patching current install (bootstrap flow)...");
  runBootstrapPatch();
  log("Patch complete.");
}

function confirm(message, yes, input = process.stdin) {
  if (yes) return Promise.resolve(true);
  if (input.isTTY === false) {
    warn("Non-interactive shell: refusing upgrade without --yes.");
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input });
    rl.question(message + " [y/N] ", (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase() === "y" || ans.trim().toLowerCase() === "yes");
    });
  });
}

async function cmdUpgrade(yes) {
  log("Upgrade will update your starter config to the latest version.");
  log("Versioned model assignments in opencode.jsonc / oh-my-opencode-slim.jsonc are overwritten with the latest starter values.");
  log("Your active `preset`, extra plugins, and any custom presets/agents you added are preserved.");
  log("A backup of each current config file is saved to a temp directory before writing.");
  if (!await confirm("Continue with upgrade?", yes)) {
    log("Aborted. No changes made.");
    return;
  }
  log("Upgrading to latest starter config (re-copy + merge)...");
  mergeConfigFiles();
  installPlugins();
  log("Upgrade complete.");
}

function findPluginDir(name) {
  const bases = [path.join(os.homedir(), ".local/share/opencode"), path.join(os.homedir(), ".config/opencode")];
  try {
    bases.push(execSync("npm root -g", { stdio: "ignore" }).toString().trim());
  } catch {}
  for (const base of bases) {
    if (!base || !fs.existsSync(base)) continue;
    // ponytail: best-effort shallow + depth-2 search for the plugin directory
    const stack = [base];
    let depth = 0;
    while (stack.length && depth < 3) {
      const level = stack.splice(0);
      depth++;
      for (const d of level) {
        let entries = [];
        try {
          entries = fs.readdirSync(d, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const e of entries) {
          if (!e.isDirectory()) continue;
          if (e.name === name) return path.join(d, e.name);
          if (depth < 3) stack.push(path.join(d, e.name));
        }
      }
    }
  }
  return null;
}

function collectDoctorChecks() {
  const opencodeOk = tryRun("opencode --version");
  const bunOk = tryRun("bun --version");
  const ponyOk = tryRun("npm ls -g @dietrichgebert/ponytail --depth=0");
  const pluginDir = findPluginDir("oh-my-opencode-slim");
  const cfgOk = CONFIG_FILES.every((f) => fs.existsSync(path.join(process.cwd(), f)));
  return [
    ["OpenCode installed", opencodeOk, opencodeOk ? "" : "Install: curl -fsSL https://opencode.ai/install | bash"],
    ["bun installed", bunOk, bunOk ? "" : "Install: npm i -g bun"],
    ["@dietrichgebert/ponytail installed (global)", ponyOk, ponyOk ? "" : "Install: npm i -g @dietrichgebert/ponytail"],
    ["oh-my-opencode-slim plugin present (best-effort)", !!pluginDir, pluginDir ? "" : "Install: bunx oh-my-opencode-slim@latest install"],
    ["Starter config files present in " + process.cwd(), cfgOk, cfgOk ? "" : "Run: npx nitm-opencode-starter install"],
  ];
}

function cmdDoctor() {
  const checks = collectDoctorChecks();
  let failed = 0;
  console.log("\nDoctor checklist:\n");
  for (const [label, ok, fix] of checks) {
    const mark = ok ? "PASS" : fix ? "FAIL" : "WARN";
    if (!ok && fix) failed++;
    console.log(`  [${mark}] ${label}${fix && !ok ? "\n         fix: " + fix : ""}`);
  }
  console.log("");
  if (failed) {
    fail(failed + " check(s) failed. Address the fix lines above.");
    process.exit(1);
  }
  log("All checks passed.");
}

// --- entry ---

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const force = args.includes("--force");
  const yes = args.includes("--yes") || args.includes("-y");
  switch (cmd) {
    case "install":
      await cmdInstall(force);
      break;
    case "patch":
      await cmdPatch();
      break;
    case "upgrade":
      await cmdUpgrade(yes);
      break;
    case "doctor":
      await cmdDoctor();
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      console.log(`nitm-opencode-starter - bootstrap OpenCode with the NITM starter config

Usage:
  npx nitm-opencode-starter install [--force]   Copy config into this repo, then run the bootstrap patch flow.
  npx nitm-opencode-starter patch               Re-run the bootstrap patch flow (ensure config + plugins).
  npx nitm-opencode-starter upgrade [--yes]     Re-copy + merge latest config, then re-run plugin installs.
  npx nitm-opencode-starter doctor              Checklist: verify tools and config are installed.
`);
      break;
    default:
      fail("Unknown command:", cmd);
      console.log("Run `npx nitm-opencode-starter help` for usage.");
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => { fail("Unexpected error:", (err && err.stack) || err); process.exit(1); });
}

module.exports = { stripJsonc, parseJsonc, mergeConfig, mergeConfigFiles, copyMissing, copyForce, findPluginDir, confirm, collectDoctorChecks };
