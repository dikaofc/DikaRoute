import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assertSqlJsWasmShipped } from "../assembleStandalone.mjs";

/**
 * Build-time gate tests: an incomplete sql.js WASM copy must fail assembly so a
 * broken tarball/Docker image never ships (Termux/Android rely on sql.js as the
 * ONLY SQLite driver — a missing wasm boots to HTTP 500).
 */

const tmpDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dikaroute-wasm-gate-"));
  tmpDirs.push(dir);
  return dir;
}

function writeSqlJsAt(root: string, relDist = "node_modules/sql.js/dist"): string {
  const dist = path.join(root, relDist);
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, "sql-wasm.wasm"), "fake-wasm");
  return root; // the project/bundle root the wasm was installed under
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

describe("assertSqlJsWasmShipped", () => {
  it("passes when the bundle carries the wasm", () => {
    const projectRoot = writeSqlJsAt(makeTempDir());
    const outDir = makeTempDir();
    writeSqlJsAt(outDir);
    expect(() => assertSqlJsWasmShipped(projectRoot, outDir)).not.toThrow();
  });

  it("throws a REQUIRED-asset error when source exists but the bundle copy is missing", () => {
    const projectRoot = writeSqlJsAt(makeTempDir());
    const outDir = makeTempDir(); // empty bundle
    expect(() => assertSqlJsWasmShipped(projectRoot, outDir)).toThrow(
      /REQUIRED runtime asset missing/
    );
    expect(() => assertSqlJsWasmShipped(projectRoot, outDir)).toThrow(/sql-wasm\.wasm/);
  });

  it("passes (with a warning) when the source package itself is absent", () => {
    const projectRoot = makeTempDir(); // no node_modules/sql.js at source
    const outDir = makeTempDir();
    // Must not throw — an absent source cannot be copied, so failing would be noise.
    expect(() => assertSqlJsWasmShipped(projectRoot, outDir)).not.toThrow();
  });
});
