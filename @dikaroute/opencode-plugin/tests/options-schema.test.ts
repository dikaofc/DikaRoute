/**
 * T-08 options-schema tests.
 *
 * Covers `parseDikaRoutePluginOptions(opts)` — the strict Zod gate that
 * validates the second-arg `PluginOptions` bag from opencode.json before
 * any hook is wired. Anti-pattern checklist mirrored here:
 *
 *  - `null` / `undefined` must collapse to `{}` (defaults apply downstream).
 *  - Unknown keys must THROW (`.strict()` catches opencode.json typos).
 *  - Validation runs at parse time, not import time (module loads cleanly).
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseDikaRoutePluginOptions } from "../src/index.js";

test("parseDikaRoutePluginOptions: undefined → {}", () => {
  assert.deepEqual(parseDikaRoutePluginOptions(undefined), {});
});

test("parseDikaRoutePluginOptions: null → {}", () => {
  assert.deepEqual(parseDikaRoutePluginOptions(null), {});
});

test("parseDikaRoutePluginOptions: empty object → {}", () => {
  assert.deepEqual(parseDikaRoutePluginOptions({}), {});
});

test("parseDikaRoutePluginOptions: valid providerId → returns it", () => {
  const r = parseDikaRoutePluginOptions({ providerId: "dikaroute-preprod" });
  assert.equal(r.providerId, "dikaroute-preprod");
});

test("parseDikaRoutePluginOptions: invalid providerId (special chars) → throws", () => {
  assert.throws(
    () => parseDikaRoutePluginOptions({ providerId: "dikaroute prod!" }),
    /providerId.*slug/i
  );
});

test("parseDikaRoutePluginOptions: empty providerId → throws", () => {
  assert.throws(() => parseDikaRoutePluginOptions({ providerId: "" }), /providerId/i);
});

test("parseDikaRoutePluginOptions: valid modelCacheTtl → returns it", () => {
  const r = parseDikaRoutePluginOptions({ modelCacheTtl: 60_000 });
  assert.equal(r.modelCacheTtl, 60_000);
});

test("parseDikaRoutePluginOptions: negative modelCacheTtl → throws", () => {
  assert.throws(() => parseDikaRoutePluginOptions({ modelCacheTtl: -1 }), /modelCacheTtl/i);
});

test("parseDikaRoutePluginOptions: zero modelCacheTtl → throws (positive required)", () => {
  assert.throws(() => parseDikaRoutePluginOptions({ modelCacheTtl: 0 }), /modelCacheTtl/i);
});

test("parseDikaRoutePluginOptions: invalid baseURL (not a URL) → throws", () => {
  assert.throws(() => parseDikaRoutePluginOptions({ baseURL: "not-a-url" }), /baseURL/i);
});

test("parseDikaRoutePluginOptions: unknown key → throws (strict mode catches typos)", () => {
  assert.throws(
    () =>
      parseDikaRoutePluginOptions({
        providerId: "dikaroute",
        provider_id: "typo-here",
      }),
    /provider_id|unrecognized/i
  );
});

test("parseDikaRoutePluginOptions: all four fields populated correctly → returns them", () => {
  const opts = {
    providerId: "dikaroute-prod",
    displayName: "DikaRoute Production",
    modelCacheTtl: 120_000,
    baseURL: "https://or.example.com/v1",
  };
  const r = parseDikaRoutePluginOptions(opts);
  assert.deepEqual(r, opts);
});

test("parseDikaRoutePluginOptions: error message lists every issue path", () => {
  // Two bad fields at once → error string should mention BOTH.
  try {
    parseDikaRoutePluginOptions({
      providerId: "",
      baseURL: "garbage",
    });
    assert.fail("expected throw");
  } catch (err) {
    const msg = (err as Error).message;
    assert.match(msg, /providerId/);
    assert.match(msg, /baseURL/);
  }
});

test("parseDikaRoutePluginOptions: module import alone does NOT throw", async () => {
  // Re-importing the entry must not trigger validation; validation only fires
  // on explicit parseDikaRoutePluginOptions / DikaRoutePlugin invocation.
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.parseDikaRoutePluginOptions, "function");
});
