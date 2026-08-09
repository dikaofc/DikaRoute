#!/usr/bin/env node
/**
 * Post-install warm-up for DikaRoute native runtimes.
 *
 * Runs after the main `scripts/build/postinstall.mjs` binary-copy step.
 * Tries to pre-resolve better-sqlite3 into ~/.dikaroute/runtime/ so that
 * the first execution is fast and EBUSY-resilient on Windows.
 *
 * Non-fatal: any error is printed as a warning and install continues.
 */

if (
  process.env.DIKAROUTE_SKIP_POSTINSTALL === "1" ||
  process.env.CI === "true" ||
  process.env.CI === "1"
) {
  process.exit(0);
}

(async () => {
  try {
    const { warmUpRuntimes } = await import("../bin/cli/runtime/index.mjs");
    await warmUpRuntimes();
  } catch (err) {
    console.warn(`[dikaroute] postinstall warm-up skipped: ${err?.message ?? err}`);
  }
})();

