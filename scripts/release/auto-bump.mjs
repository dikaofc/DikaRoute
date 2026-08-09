#!/usr/bin/env node
/**
 * Auto-bump version + generate CHANGELOG entry for DikaRoute releases.
 *
 * Usage:
 *   node scripts/release/auto-bump.mjs --bump patch|minor|major|custom \
 *       [--version 3.9.0] [--since <git-ref>] [--dry-run]
 *
 * Behavior:
 *   - Reads the current version from package.json.
 *   - Computes the next version (patch / minor / major / custom).
 *   - Collects conventional commits since the last `vX.Y.Z` tag
 *     (or the `--since` ref — mainly for testing).
 *   - Prepends a Keep-a-Changelog entry to CHANGELOG.md.
 *   - Updates package.json and package-lock.json (root + packages[""] entries)
 *     with deterministic 2-space JSON output.
 *   - In --dry-run mode nothing is written; the plan is printed instead.
 *
 * The caller (CI workflow) commits and pushes the result, which then
 * triggers .github/workflows/publish.yml (npm publish + GitHub Release).
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const SECTION_ORDER = ["Added", "Fixed", "Performance", "Documentation", "Changed"];
const TYPE_MAP = {
  feat: "Added",
  fix: "Fixed",
  perf: "Performance",
  docs: "Documentation",
  chore: "Changed",
  refactor: "Changed",
  ci: "Changed",
  test: "Changed",
  build: "Changed",
  style: "Changed",
};
const CONVENTIONAL =
  /^(feat|fix|perf|docs|chore|refactor|ci|test|build|style)(\([\w./-]+\))?!?:\s+(.+)$/i;
const SEMVER = /^\d+\.\d+\.\d+$/;

function log(message) {
  console.log(`[auto-bump] ${message}`);
}

function run(command) {
  return execSync(command, { encoding: "utf8", cwd: ROOT }).trim();
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(ROOT, file), "utf8"));
}

function parseArgs(argv) {
  const args = { bump: "patch", version: "", since: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--bump":
        args.bump = argv[++i] ?? "patch";
        break;
      case "--version":
        args.version = argv[++i] ?? "";
        break;
      case "--since":
        args.since = argv[++i] ?? null;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      default:
        log(`Unknown argument: ${argv[i]}`);
        process.exit(2);
    }
  }
  if (!["patch", "minor", "major", "custom"].includes(args.bump)) {
    log(`Invalid --bump "${args.bump}". Expected patch|minor|major|custom.`);
    process.exit(2);
  }
  if (args.bump === "custom" && !SEMVER.test(args.version)) {
    log("--bump custom requires --version in X.Y.Z format (e.g. --version 3.9.0).");
    process.exit(2);
  }
  if (args.since && !/^[\w./^~-]+$/.test(args.since)) {
    log(`Invalid --since "${args.since}" — expected a git ref (letters, digits, ./^~-).`);
    process.exit(2);
  }
  return args;
}

function nextVersion(current, bump) {
  const [major, minor, patch] = current.split(".").map((n) => parseInt(n, 10));
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function lastTag() {
  try {
    return run('git describe --tags --abbrev=0 --match "v*"') || null;
  } catch {
    return null; // no tags yet
  }
}

// Prefer the tag matching the CURRENT package.json version (e.g. v3.8.55), so
// already-released commits are never folded into the new changelog entry.
function tagForVersion(version) {
  try {
    return run(`git tag --list "v${version}"`) || null;
  } catch {
    return null;
  }
}

function collectCommits(since) {
  const range = since ? `${since}..HEAD` : "HEAD";
  let shas;
  try {
    shas = run(`git rev-list ${range} --no-merges`).split("\n").filter(Boolean);
  } catch {
    return [];
  }
  return shas.map((sha) => {
    const raw = run(`git show -s --format=%s%x00%b ${sha}`);
    const [subject, ...bodyParts] = raw.split("\x00");
    const body = (bodyParts.join("\x00") || "").trim();
    return { sha: sha.slice(0, 7), subject: (subject ?? "").trim(), body };
  });
}

function classify(subject) {
  const match = subject.match(CONVENTIONAL);
  if (!match) return { section: "Changed", title: subject };
  return { section: TYPE_MAP[match[1].toLowerCase()] ?? "Changed", title: match[3] };
}

// Keep the changelog line tidy: drop list markers, collapse whitespace, cap length.
function cleanDetail(raw) {
  return raw
    .replace(/^[-*#\s]+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function buildEntry(version, commits) {
  const sections = {};
  for (const commit of commits) {
    const { section, title } = classify(commit.subject);
    const detail = cleanDetail(commit.body.split("\n")[0] ?? "");
    const suffix = detail ? ` — ${detail}` : "";
    (sections[section] ??= []).push(`- ${title}${suffix}`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [`## [${version}] - ${date}`, ""];
  for (const section of SECTION_ORDER) {
    if (!sections[section]) continue;
    lines.push(`### ${section}`, "");
    lines.push(...sections[section], "");
  }
  if (lines.length <= 3) lines.push("- Maintenance dan perbaikan stabilitas.", "");
  return lines.join("\n").trimEnd();
}

function prependChangelog(entry) {
  const file = path.join(ROOT, "CHANGELOG.md");
  const content = readFileSync(file, "utf8");
  const marker = content.indexOf("## [");
  const updated =
    marker === -1
      ? `${content.trimEnd()}\n\n${entry}\n`
      : `${content.slice(0, marker).trimEnd()}\n\n${entry}\n\n${content.slice(marker).trimStart()}`;
  writeFileSync(file, updated);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const pkg = readJson("package.json");
  const current = pkg.version;
  if (!SEMVER.test(current)) {
    log(`Unexpected current version "${current}" in package.json`);
    process.exit(2);
  }

  const next = args.bump === "custom" ? args.version : nextVersion(current, args.bump);
  const since = args.since ?? tagForVersion(current) ?? lastTag();
  const commits = collectCommits(since);

  if (commits.length === 0 && args.bump !== "custom" && !args.since) {
    log(`No commits since ${since ?? "the beginning of history"} — nothing to release.`);
    log("If you still want to release, use --bump custom --version X.Y.Z.");
    process.exit(args.dryRun ? 0 : 1);
  }

  const entry = buildEntry(next, commits);

  log(`Current version : ${current}`);
  log(`New version     : ${next}`);
  log(`Commits in scope: ${commits.length} (since ${since ?? "HEAD"})`);

  if (args.dryRun) {
    log("--- DRY RUN: planned CHANGELOG entry (no files modified) ---");
    console.log(entry);
    return;
  }

  // Update package.json + package-lock.json (root and packages[""] entries)
  pkg.version = next;
  writeJson("package.json", pkg);

  let lock = null;
  try {
    lock = readJson("package-lock.json");
  } catch {
    lock = null; // no lockfile present — nothing to update
  }
  if (lock) {
    lock.version = next;
    if (lock.packages?.[""]) lock.packages[""].version = next;
    writeJson("package-lock.json", lock);
  }

  prependChangelog(entry);

  log(`Done. Version bumped to ${next} and CHANGELOG updated.`);
  log("Commit the changes and push to trigger publish.yml:");
  log("  git add package.json package-lock.json CHANGELOG.md");
  log(`  git commit -m "chore: release v${next}"`);
  log("  git push origin main");
}

main();
