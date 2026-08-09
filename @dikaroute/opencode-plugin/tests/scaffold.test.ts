import test from "node:test";
import assert from "node:assert/strict";
import {
  DikaRoutePlugin,
  DIKAROUTE_PROVIDER_KEY,
  DEFAULT_MODEL_CACHE_TTL_MS,
  resolveDikaRoutePluginOptions,
} from "../src/index.js";

test("scaffold: exports public surface", () => {
  assert.equal(
    typeof DikaRoutePlugin,
    "function",
    "DikaRoutePlugin must be a function (Plugin factory)"
  );
  assert.equal(DIKAROUTE_PROVIDER_KEY, "dikaroute");
  assert.equal(DEFAULT_MODEL_CACHE_TTL_MS, 300_000);
});

test("scaffold: default export is v1 plugin shape { id, server: DikaRoutePlugin }", async () => {
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.default, "object");
  assert.equal(mod.default.id, "@dikaroute/opencode-plugin");
  assert.equal(mod.default.server, mod.DikaRoutePlugin);
});

test("resolveDikaRoutePluginOptions: defaults", () => {
  const r = resolveDikaRoutePluginOptions();
  assert.equal(r.providerId, "opencode-dikaroute");
  assert.equal(r.displayName, "DikaRoute");
  assert.equal(r.modelCacheTtl, 300_000);
  assert.equal(r.baseURL, undefined);
});

test("resolveDikaRoutePluginOptions: custom providerId derives displayName", () => {
  const r = resolveDikaRoutePluginOptions({ providerId: "dikaroute-preprod" });
  assert.equal(r.providerId, "opencode-dikaroute-preprod");
  assert.equal(r.displayName, "DikaRoute (opencode-dikaroute-preprod)");
});

test("resolveDikaRoutePluginOptions: explicit displayName wins", () => {
  const r = resolveDikaRoutePluginOptions({
    providerId: "dikaroute-x",
    displayName: "Custom Label",
  });
  assert.equal(r.displayName, "Custom Label");
});

test("resolveDikaRoutePluginOptions: invalid TTL falls back to default", () => {
  assert.equal(resolveDikaRoutePluginOptions({ modelCacheTtl: 0 }).modelCacheTtl, 300_000);
  assert.equal(resolveDikaRoutePluginOptions({ modelCacheTtl: -1 }).modelCacheTtl, 300_000);
});

test("resolveDikaRoutePluginOptions: positive TTL respected", () => {
  assert.equal(resolveDikaRoutePluginOptions({ modelCacheTtl: 60_000 }).modelCacheTtl, 60_000);
});

test("DikaRoutePlugin: returns an empty hooks object (scaffold)", async () => {
  const fakeCtx = {} as Parameters<typeof DikaRoutePlugin>[0];
  const hooks = await DikaRoutePlugin(fakeCtx);
  assert.equal(typeof hooks, "object");
  assert.notEqual(hooks, null);
});

test("scaffold: built ESM default export resolves with the v1 plugin shape", async () => {
  // The plugin is ESM-only now — the CJS bundle was dropped to fix the OpenCode
  // loader (#3883), so there is no more ../dist/index.cjs. Validate that the built
  // distributable's default export still carries the OpenCode v1 { id, server } shape.
  const mod = await import("../dist/index.js");
  assert.strictEqual(typeof mod.default, "object");
  assert.strictEqual(mod.default.id, "@dikaroute/opencode-plugin");
  assert.strictEqual(typeof mod.default.server, "function");
});
