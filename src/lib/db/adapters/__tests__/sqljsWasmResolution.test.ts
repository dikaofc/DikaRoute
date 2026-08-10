import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildSqlJsWasmCandidatePaths,
  resolveSqlJsWasmPath,
} from "../sqljsAdapter";

/**
 * Installation-layout tests for the sql.js WASM resolver.
 *
 * Regression guard for the Termux/Android audit finding: sql-wasm.wasm used to
 * be resolved ONLY relative to process.cwd(), so a server spawned from a
 * different directory (e.g. a global npm install that spawns the child with
 * cwd=dist/) threw "sql-wasm.wasm was not found" even though the asset was
 * installed. The resolver must find the WASM from the executing module's own
 * location (walk-up), with cwd kept only as a fallback.
 */

const tmpDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dikaroute-sqljs-"));
  tmpDirs.push(dir);
  return dir;
}

/** Create <dir>/node_modules/sql.js/dist/sql-wasm.wasm and return the dir. */
function installSqlJsInto(dir: string): string {
  const dist = path.join(dir, "node_modules", "sql.js", "dist");
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, "sql-wasm.wasm"), "fake-wasm");
  return dir;
}

/** Simulate an executing module deep inside a tree (e.g. a compiled chunk). */
function moduleDirInside(dir: string, ...segments: string[]): string {
  const deep = path.join(dir, ...segments);
  fs.mkdirSync(deep, { recursive: true });
  return deep;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

describe("resolveSqlJsWasmPath — installation layouts", () => {
  it("resolves when launched from the package directory (cwd == package root)", () => {
    const root = installSqlJsInto(makeTempDir());
    // Anchor = a module inside the package; cwd = package root.
    const anchor = moduleDirInside(root, "src", "lib", "db", "adapters");
    const wasm = resolveSqlJsWasmPath(anchor, root);
    expect(wasm).toBe(path.join(root, "node_modules", "sql.js", "dist", "sql-wasm.wasm"));
    expect(fs.existsSync(wasm)).toBe(true);
  });

  it("resolves from an unrelated cwd (e.g. /tmp) via module-relative walk-up", () => {
    const root = installSqlJsInto(makeTempDir());
    const anchor = moduleDirInside(root, "dist", ".build", "next", "server", "chunks");
    const unrelatedCwd = makeTempDir(); // e.g. user launched dikaroute from /tmp
    const wasm = resolveSqlJsWasmPath(anchor, unrelatedCwd);
    expect(wasm).toBe(path.join(root, "node_modules", "sql.js", "dist", "sql-wasm.wasm"));
  });

  it("resolves from a global npm install layout (hoisted to <npmRoot>/node_modules)", () => {
    const npmRoot = installSqlJsInto(makeTempDir()); // <npmRoot>/node_modules/sql.js
    const pkgRoot = path.join(npmRoot, "dikaroute");
    const anchor = moduleDirInside(pkgRoot, "dist", ".build", "next", "server", "chunks");
    const wasm = resolveSqlJsWasmPath(anchor, path.join(pkgRoot, "dist"));
    // Walk-up from the chunk reaches <npmRoot>/node_modules/sql.js.
    expect(wasm).toBe(path.join(npmRoot, "node_modules", "sql.js", "dist", "sql-wasm.wasm"));
  });

  it("resolves from a dist/ bundle that carries its own node_modules", () => {
    const root = makeTempDir();
    const bundleRoot = installSqlJsInto(path.join(root, "dist"));
    const anchor = moduleDirInside(
      path.join(root, "dist"),
      ".build",
      "next",
      "server",
      "chunks"
    );
    const wasm = resolveSqlJsWasmPath(anchor, path.join(root, "dist"));
    expect(wasm).toBe(
      path.join(bundleRoot, "node_modules", "sql.js", "dist", "sql-wasm.wasm")
    );
  });

  it("falls back to cwd-relative standalone paths when no module-relative copy exists", () => {
    const root = makeTempDir();
    // Simulate the legacy launcher: no node_modules next to the chunk, but the
    // assembled standalone carries sql.js under <cwd>/.build/next/standalone.
    const standaloneNm = path.join(
      root,
      ".build",
      "next",
      "standalone",
      "node_modules",
      "sql.js",
      "dist"
    );
    fs.mkdirSync(standaloneNm, { recursive: true });
    fs.writeFileSync(path.join(standaloneNm, "sql-wasm.wasm"), "fake-wasm");

    const anchor = moduleDirInside(root, "dist", ".build", "next", "server", "chunks");
    const wasm = resolveSqlJsWasmPath(anchor, root);
    expect(wasm).toBe(
      path.join(
        root,
        ".build",
        "next",
        "standalone",
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      )
    );
  });

  it("throws a listing error when no copy exists anywhere", () => {
    const root = makeTempDir();
    const anchor = moduleDirInside(root, "dist", ".build", "next", "server", "chunks");
    expect(() => resolveSqlJsWasmPath(anchor, makeTempDir())).toThrow(
      /sql-wasm\.wasm was not found/
    );
  });
});

describe("buildSqlJsWasmCandidatePaths", () => {
  it("includes module-relative walk-up candidates before cwd candidates", () => {
    const anchor = "/opt/app/src/lib/db/adapters";
    const cwd = "/tmp";
    const candidates = buildSqlJsWasmCandidatePaths(anchor, cwd);
    expect(candidates[0]).toBe(
      "/opt/app/src/lib/db/adapters/node_modules/sql.js/dist/sql-wasm.wasm"
    );
    // Walk-up covers every ancestor, including the filesystem root.
    expect(candidates).toContain("/opt/app/node_modules/sql.js/dist/sql-wasm.wasm");
    expect(candidates).toContain("/node_modules/sql.js/dist/sql-wasm.wasm");
    // cwd fallbacks come after the walk-up block and cover both dist layouts.
    expect(candidates).toContain("/tmp/node_modules/sql.js/dist/sql-wasm.wasm");
    expect(candidates).toContain(
      "/tmp/.build/next/standalone/node_modules/sql.js/dist/sql-wasm.wasm"
    );
    expect(candidates).toContain(
      "/tmp/.next/standalone/node_modules/sql.js/dist/sql-wasm.wasm"
    );
  });
});
