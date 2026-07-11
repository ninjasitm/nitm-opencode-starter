"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Readable } = require("node:stream");

const ROOT = path.join(__dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "nitm-test-"));
process.chdir(TMP);

const cli = require("../bin/cli.js");

test("stripJsonc removes line + block comments and trailing commas", () => {
  const src = `{
    // line comment
    "a": 1, /* block */ "b": 2,
    "arr": [1, 2, 3,],
    "nested": { "x": 1, }
  }`;
  const obj = cli.parseJsonc(src);
  assert.strictEqual(obj.a, 1);
  assert.strictEqual(obj.b, 2);
  assert.deepStrictEqual(obj.arr, [1, 2, 3]);
  assert.deepStrictEqual(obj.nested, { x: 1 });
});

test("parseJsonc parses the shipped config files", () => {
  const oc = cli.parseJsonc(fs.readFileSync(path.join(ROOT, "opencode.jsonc"), "utf8"));
  assert.ok(Array.isArray(oc.plugin));
  assert.strictEqual(oc.plugin.includes("oh-my-opencode-slim"), true);
  const slim = cli.parseJsonc(fs.readFileSync(path.join(ROOT, "oh-my-opencode-slim.jsonc"), "utf8"));
  assert.ok(slim.presets.default);
  assert.strictEqual(typeof slim.agents.reviewer.orchestratorPrompt, "string");
});

test("mergeConfig preserves user preset, unions plugins, keeps custom keys, package wins on models", () => {
  const pkg = {
    preset: "default",
    plugin: ["a", "b"],
    presets: { default: { orchestrator: { model: ["pkg-model"] } } },
  };
  const user = {
    preset: "balanced",
    plugin: ["a", "user-extra"],
    presets: { default: { orchestrator: { model: ["user-model"] } }, "my-preset": { x: 1 } },
    myAgent: { orchestratorPrompt: "hi" },
  };
  const m = cli.mergeConfig(pkg, user);
  assert.strictEqual(m.preset, "balanced", "user preset preserved");
  assert.deepStrictEqual(m.plugin.sort(), ["a", "b", "user-extra"], "plugins unioned");
  assert.ok(m.presets["my-preset"], "user custom preset kept");
  assert.ok(m.myAgent, "user custom agent kept");
  assert.deepStrictEqual(m.presets.default.orchestrator.model, ["pkg-model"], "package model array wins");
});

test("copyMissing copies both config files into the target dir", () => {
  cli.copyMissing();
  assert.ok(fs.existsSync(path.join(TMP, "opencode.jsonc")));
  assert.ok(fs.existsSync(path.join(TMP, "oh-my-opencode-slim.jsonc")));
  // second run should be a no-op (no throw)
  cli.copyMissing();
});

test("mergeConfigFiles backs up and merges, preserving customizations", () => {
  const sub = fs.mkdtempSync(path.join(TMP, "upg-"));
  process.chdir(sub);
  fs.writeFileSync(
    "opencode.jsonc",
    JSON.stringify({
      preset: "balanced",
      plugin: ["a", "user-extra"],
      customKey: "keep",
    })
  );
  cli.mergeConfigFiles();
  const merged = JSON.parse(fs.readFileSync("opencode.jsonc", "utf8"));
  assert.strictEqual(merged.preset, "balanced");
  assert.ok(merged.customKey === "keep");
  assert.ok(merged.plugin.includes("user-extra"));
  assert.ok(!fs.existsSync("opencode.jsonc.bak"), "backup goes to temp dir, not cwd");
});

test("confirm resolves true when user types y", async () => {
  const result = await cli.confirm("msg", false, Readable.from("y\n"));
  assert.strictEqual(result, true);
});

test("confirm resolves false when user types n", async () => {
  const result = await cli.confirm("msg", false, Readable.from("n\n"));
  assert.strictEqual(result, false);
});

test("confirm returns false for non-interactive input", async () => {
  const result = await cli.confirm("msg", false, { isTTY: false });
  assert.strictEqual(result, false);
});

test("parseJsonc preserves comment-like content inside strings and strips block comments", () => {
  const src = `{
    // line comment
    "a": 1, /* block */ "b": 2,
    "arr": [1, 2, 3,],
    "nested": { "x": 1, },
    "url": "https://example.com/path?query=1",
    "text": "/* not a comment */",
    "escaped": "Line1\\nLine2\\\\/* still not a comment */"
    /*
      multi-line block comment that should be stripped
    */
  }`;
  const obj = cli.parseJsonc(src);
  assert.strictEqual(obj.a, 1);
  assert.strictEqual(obj.b, 2);
  assert.deepStrictEqual(obj.arr, [1, 2, 3]);
  assert.deepStrictEqual(obj.nested, { x: 1 });
  assert.strictEqual(obj.url, "https://example.com/path?query=1");
  assert.strictEqual(obj.text, "/* not a comment */");
  // JSON.parse interprets \n as newline and \\ as single backslash
  assert.strictEqual(obj.escaped, "Line1\nLine2\\/* still not a comment */");
});

test("stripJsonc does not corrupt string values containing ,} or ,]", () => {
  const src = `{
    "msg": "hello,}",
    "msg2": "hello,]",
    "arr": [1, 2,],
    "obj": { "x": 1, }
  }`;
  const obj = cli.parseJsonc(src);
  assert.strictEqual(obj.msg, "hello,}");
  assert.strictEqual(obj.msg2, "hello,]");
  assert.deepStrictEqual(obj.arr, [1, 2]);
  assert.deepStrictEqual(obj.obj, { x: 1 });
});

test("collectDoctorChecks returns 5 well-formed checks", () => {
  const checks = cli.collectDoctorChecks();
  assert.ok(Array.isArray(checks));
  assert.strictEqual(checks.length, 5);
  for (const c of checks) {
    assert.strictEqual(c.length, 3);
    assert.strictEqual(typeof c[0], "string");
    assert.strictEqual(typeof c[1], "boolean");
  }
});

test("findPluginDir returns string or null without throwing", () => {
  const r = cli.findPluginDir("this-plugin-does-not-exist-xyz");
  assert.ok(r === null || typeof r === "string");
});

test("confirm refuses in non-TTY without --yes", async () => {
  const orig = process.stdin.isTTY;
  Object.defineProperty(process.stdin, "isTTY", { value: false, configurable: true });
  const ok = await cli.confirm("Continue?", false);
  assert.strictEqual(ok, false);
  Object.defineProperty(process.stdin, "isTTY", { value: orig, configurable: true });
});
