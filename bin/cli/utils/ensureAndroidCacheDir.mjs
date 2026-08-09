/**
 * Next.js cache-dir prep for Android / Termux.
 *
 * Next.js `getCacheDirectory()` has no dedicated branch for
 * `process.platform === "android"`. On that path it only accepts a cache root
 * that *already* exists (`fs.existsSync` on `~/.cache` or a generic tmp dir).
 * If neither exists it prints `Unsupported platform: android` and exits — the
 * CLI can still look "running" while every request returns a bare HTTP 500
 * because the instrumentation hook never loads (and so neither does logging).
 *
 * Termux Node sometimes reports `platform === "android"` and sometimes
 * `"linux"` with Termux env signals (`TERMUX_VERSION` / `PREFIX`). Creating
 * `~/.cache` (and pointing `XDG_CACHE_HOME` at it when unset) makes the probe
 * succeed on both shapes.
 *
 * Call this *before* spawning or loading Next.js. Safe no-op on desktop
 * platforms that are not Termux.
 */

import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isTermux } from "../../../scripts/build/postinstallSupport.mjs";

/**
 * @param {string} [platform]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {boolean}
 */
export function needsAndroidCacheDirPrep(platform = process.platform, env = process.env) {
  return platform === "android" || isTermux(env);
}

/**
 * @param {() => string} [homedirFn]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function resolveAndroidCacheDir(homedirFn = homedir, env = process.env) {
  if (typeof env.XDG_CACHE_HOME === "string" && env.XDG_CACHE_HOME.trim()) {
    return env.XDG_CACHE_HOME;
  }
  return join(homedirFn(), ".cache");
}

/**
 * Ensure a writable cache directory exists for Next.js on Android/Termux.
 *
 * @param {object} [options]
 * @param {string} [options.platform]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {() => string} [options.homedirFn]
 * @param {typeof mkdirSync} [options.mkdirSyncFn]
 * @param {typeof existsSync} [options.existsSyncFn]
 * @param {boolean} [options.setEnv] When true (default), set `XDG_CACHE_HOME` on `env`
 *   if unset so child processes inherit a known-writable cache root.
 * @returns {{ prepared: boolean, cacheDir: string | null, created: boolean }}
 */
export function ensureAndroidCacheDir(options = {}) {
  const {
    platform = process.platform,
    env = process.env,
    homedirFn = homedir,
    mkdirSyncFn = mkdirSync,
    existsSyncFn = existsSync,
    setEnv = true,
  } = options;

  if (!needsAndroidCacheDirPrep(platform, env)) {
    return { prepared: false, cacheDir: null, created: false };
  }

  const cacheDir = resolveAndroidCacheDir(homedirFn, env);
  let created = false;
  if (!existsSyncFn(cacheDir)) {
    mkdirSyncFn(cacheDir, { recursive: true });
    created = true;
  }

  if (setEnv && !(typeof env.XDG_CACHE_HOME === "string" && env.XDG_CACHE_HOME.trim())) {
    env.XDG_CACHE_HOME = cacheDir;
  }

  return { prepared: true, cacheDir, created };
}

/**
 * Detect Next.js instrumentation-hook failures that leave the server looking
 * "up" while requests get silent HTTP 500s (typical when the Android cache
 * probe failed before logging started).
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isFatalInstrumentationHookFailure(text) {
  if (!text) return false;
  return (
    /Unsupported platform:\s*android/i.test(text) ||
    /error occurred while loading instrumentation hook/i.test(text)
  );
}

/**
 * Operator-facing hint when an instrumentation-hook failure shows up in child
 * output — defense in depth if prep was skipped or a future Next.js probe
 * regresses. The "missing cache dir" theory is only ONE possible cause: on
 * Termux/Android the same symptom (dashboard/API returning bare HTTP 500s while
 * the CLI looks "running") is also produced by a native module failing to load
 * (e.g. the SQLite driver cascade). When real child output is available it is
 * included verbatim so the operator sees the actual root cause, not a guess.
 *
 * @param {string} [cacheDir]
 * @param {string[]} [realErrorLines] Matching child output lines (the real error).
 * @returns {string}
 */
export function formatAndroidInstrumentationFailureHint(cacheDir, realErrorLines) {
  const dir = cacheDir || join(homedir(), ".cache");
  const lines = [
    `\n\x1b[31m✖ Next.js instrumentation failed on Android/Termux.\x1b[0m`,
    `  Cache dir: \x1b[36m${dir}\x1b[0m (created automatically when missing)`,
    `  This means every dashboard/API request will return a bare HTTP 500 while`,
    `  the CLI still looks "running" — the instrumentation hook never loaded.`,
  ];
  if (Array.isArray(realErrorLines) && realErrorLines.length > 0) {
    lines.push(``, `  ── Real error from the server (root cause) ──`);
    for (const line of realErrorLines) lines.push(`  \x1b[31m${line}\x1b[0m`);
    lines.push(`  ─────────────────────────────────────────────`);
  } else {
    lines.push(
      ``,
      `  The real error was hidden (child output buffered). See it with:`,
      `    \x1b[36mdikaroute serve --log\x1b[0m`
    );
  }
  lines.push(
    ``,
    `  Fixes to try (in order):`,
    `    1. Cache probe:      \x1b[36mmkdir -p ~/.cache && dikaroute serve\x1b[0m`,
    `    2. Native modules:   \x1b[36mdikaroute runtime repair\x1b[0m   (no C++ toolchain needed)`,
    `    3. Or rebuild:       \x1b[36mnpm rebuild better-sqlite3\x1b[0m`,
    `  See: docs/guides/TERMUX_GUIDE.md → Troubleshooting → Unsupported platform: android\n`
  );
  return lines.join("\n");
}
