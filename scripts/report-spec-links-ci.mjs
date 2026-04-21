#!/usr/bin/env node
/**
 * report-spec-links-ci.mjs
 *
 * CI-friendly wrapper around `scripts/check-spec-links.mjs --strict`.
 *
 * What it adds on top of the strict checker:
 *  - Aggregates broken links per source file and prints a "Top N failing
 *    files" leaderboard so reviewers can spot hot-spots immediately.
 *  - Emits GitHub Actions annotations (`::error file=...,line=...::...`)
 *    so each broken link shows up inline on the PR diff view.
 *  - Writes a Markdown summary to `$GITHUB_STEP_SUMMARY` (if present)
 *    with the top failing files and the first 50 broken links.
 *  - Exits 1 on ANY broken link (strict — never consults baseline).
 *  - Exits 0 only when every relative link resolves on disk.
 *
 * Why a separate script and not just CLI flags on check-spec-links.mjs:
 *  - check-spec-links.mjs is the canonical local tool with baseline
 *    semantics (allows pre-existing rot during a migration). CI must NOT
 *    inherit that escape hatch — broken links fail the build, period.
 *  - This wrapper imports the same parser primitives (re-implemented
 *    here to avoid coupling) so the rules stay in lock-step.
 *
 * Usage (CI):
 *    node scripts/report-spec-links-ci.mjs
 *
 * Usage (local repro of the CI run):
 *    node scripts/report-spec-links-ci.mjs --no-annotations
 *
 * Output follows project Code Red logging: exact path, missing item, reason.
 */

import { readdirSync, readFileSync, statSync, existsSync, appendFileSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const SPEC_ROOT = join(REPO_ROOT, "spec");

const SCRIPT_TAG = "[report-spec-links-ci]";

const argv = new Set(process.argv.slice(2));
const NO_ANNOTATIONS = argv.has("--no-annotations");
const TOP_N = 10; // top failing files to surface
const MAX_DETAIL_LINKS = 50; // cap for full-detail Markdown summary

/** Recursively collect all .md files under a directory. */
function collectMarkdownFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectMarkdownFiles(full, out);
    } else if (st.isFile() && entry.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

/** Strip fenced code blocks so we don't lint code samples. */
function stripFencedBlocks(source) {
  const lines = source.split(/\r?\n/);
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push("");
      continue;
    }
    out.push(inFence ? "" : line);
  }
  return out.join("\n");
}

/** Same skip rules as check-spec-links.mjs. */
function isSkippableTarget(target) {
  if (!target) return true;
  if (target.startsWith("#")) return true;
  if (target.startsWith("/")) return true;
  if (target.startsWith("mem://")) return true;
  if (target.startsWith("knowledge://")) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return true;
  if (!/[/.#]/.test(target)) return true;
  if (target === "..." || target.endsWith("(") || target.includes("(")) return true;
  return false;
}

/** Extract markdown links with line numbers. */
function extractLinks(source) {
  const stripped = stripFencedBlocks(source);
  const links = [];
  const linkRegex = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const lines = stripped.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(line)) !== null) {
      links.push({ text: match[1], target: match[2], lineNumber: i + 1 });
    }
  }
  return links;
}

/** Escape a string for safe use inside a GitHub Actions annotation message. */
function escapeAnnotation(s) {
  return String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

/** Append a chunk of markdown to $GITHUB_STEP_SUMMARY if defined. */
function appendStepSummary(markdown) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (!target) return;
  try {
    appendFileSync(target, markdown + "\n", "utf8");
  } catch (err) {
    console.warn(
      `${SCRIPT_TAG} could not write to GITHUB_STEP_SUMMARY.\n` +
        `  path:   ${target}\n` +
        `  reason: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function main() {
  if (!existsSync(SPEC_ROOT)) {
    console.error(
      `${SCRIPT_TAG} HARD ERROR — spec root not found.\n` +
        `  path:    ${SPEC_ROOT}\n` +
        `  missing: directory 'spec/'\n` +
        `  reason:  this script must be run from repo root and 'spec/' must exist.`
    );
    process.exit(2);
  }

  const files = collectMarkdownFiles(SPEC_ROOT);
  let totalLinks = 0;
  let checkedLinks = 0;
  const broken = [];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const links = extractLinks(source);
    totalLinks += links.length;

    for (const link of links) {
      if (isSkippableTarget(link.target)) continue;
      checkedLinks++;

      const cleanTarget = link.target.split("#")[0].split("?")[0];
      if (!cleanTarget) continue;

      const resolved = resolve(dirname(file), cleanTarget);
      if (!existsSync(resolved)) {
        broken.push({
          source: relative(REPO_ROOT, file),
          line: link.lineNumber,
          text: link.text,
          target: link.target,
          resolved: relative(REPO_ROOT, resolved),
        });
      }
    }
  }

  const headline = `${SCRIPT_TAG} scanned ${files.length} markdown files, ${totalLinks} total links, ${checkedLinks} relative links checked.`;

  if (broken.length === 0) {
    console.log(`${headline} OK — all relative links resolve.`);
    appendStepSummary(`## ✅ Spec links\n\n- Files scanned: **${files.length}**\n- Relative links checked: **${checkedLinks}**\n- Broken links: **0**\n`);
    process.exit(0);
  }

  // Aggregate broken links per source file for the leaderboard.
  const perFile = new Map();
  for (const b of broken) {
    perFile.set(b.source, (perFile.get(b.source) ?? 0) + 1);
  }
  const ranked = [...perFile.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);

  // ── Console output (Code Red format) ──────────────────────────────
  console.error(
    `${SCRIPT_TAG} HARD ERROR — ${broken.length} broken relative link(s) detected across ${perFile.size} file(s).\n`
  );
  console.error(`Top ${ranked.length} failing files:`);
  for (const [src, count] of ranked) {
    console.error(`  ${count.toString().padStart(4)}  ${src}`);
  }
  console.error("");

  for (const b of broken) {
    console.error(
      `  source:   ${b.source}:${b.line}\n` +
        `  link:     [${b.text}](${b.target})\n` +
        `  missing:  ${b.resolved}\n` +
        `  reason:   target file does not exist on disk; rename or update the link.\n`
    );
    if (!NO_ANNOTATIONS && process.env.GITHUB_ACTIONS === "true") {
      const msg = escapeAnnotation(
        `Broken spec link: [${b.text}](${b.target}) — missing target ${b.resolved}`
      );
      console.log(`::error file=${b.source},line=${b.line},title=Broken spec link::${msg}`);
    }
  }

  console.error(headline);

  // ── GitHub Step Summary (Markdown) ────────────────────────────────
  const summaryParts = [];
  summaryParts.push(`## ❌ Spec links — ${broken.length} broken`);
  summaryParts.push("");
  summaryParts.push(`- Files scanned: **${files.length}**`);
  summaryParts.push(`- Relative links checked: **${checkedLinks}**`);
  summaryParts.push(`- Broken links: **${broken.length}** across **${perFile.size}** file(s)`);
  summaryParts.push("");
  summaryParts.push(`### Top ${ranked.length} failing files`);
  summaryParts.push("");
  summaryParts.push("| Broken | File |");
  summaryParts.push("|-------:|------|");
  for (const [src, count] of ranked) {
    summaryParts.push(`| ${count} | \`${src}\` |`);
  }
  summaryParts.push("");
  summaryParts.push(`### First ${Math.min(broken.length, MAX_DETAIL_LINKS)} broken link(s)`);
  summaryParts.push("");
  summaryParts.push("| Source | Line | Link | Missing target |");
  summaryParts.push("|--------|-----:|------|----------------|");
  for (const b of broken.slice(0, MAX_DETAIL_LINKS)) {
    const safeText = b.text.replace(/\|/g, "\\|");
    const safeTarget = b.target.replace(/\|/g, "\\|");
    summaryParts.push(`| \`${b.source}\` | ${b.line} | \`[${safeText}](${safeTarget})\` | \`${b.resolved}\` |`);
  }
  if (broken.length > MAX_DETAIL_LINKS) {
    summaryParts.push("");
    summaryParts.push(`_…and ${broken.length - MAX_DETAIL_LINKS} more — see the job log for the full list._`);
  }
  summaryParts.push("");
  summaryParts.push("**How to fix:**");
  summaryParts.push("");
  summaryParts.push("```bash");
  summaryParts.push("# Auto-rewrite confidently-resolvable links:");
  summaryParts.push("pnpm check:spec-links:rewrite:apply");
  summaryParts.push("");
  summaryParts.push("# Re-verify locally:");
  summaryParts.push("pnpm check:spec-links:strict");
  summaryParts.push("```");
  appendStepSummary(summaryParts.join("\n"));

  process.exit(1);
}

main();
