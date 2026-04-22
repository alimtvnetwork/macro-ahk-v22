#!/usr/bin/env node
/**
 * check-readme-compliance.mjs
 *
 * Validates that the repository-root readme.md follows the mandatory
 * structure defined in:
 *   spec/01-spec-authoring-guide/11-root-readme-conventions.md
 *
 * Failing exit code (1) when any rule is violated, 0 otherwise.
 *
 * Flags:
 *   --json    Emit a machine-readable JSON envelope (version: 1) to stdout
 *             instead of human-formatted output.
 *   --file=<path>  Override the README path (default: ./readme.md at repo root).
 *
 * Schema (when --json):
 *   {
 *     "version": 1,
 *     "ok": boolean,
 *     "file": "<absolute-path>",
 *     "summary": { "passed": N, "failed": N, "total": N },
 *     "checks": [
 *       { "id": "...", "label": "...", "ok": true|false, "detail": "..." }
 *     ]
 *   }
 *
 * Spec authority: spec/01-spec-authoring-guide/11-root-readme-conventions.md
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// ─── CLI Args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const JSON_MODE = args.includes("--json");
const fileArg = args.find((a) => a.startsWith("--file="));
const README_PATH = fileArg
    ? resolve(REPO_ROOT, fileArg.slice("--file=".length))
    : resolve(REPO_ROOT, "readme.md");

// ─── Mandatory Inventory (from 11-root-readme-conventions.md) ────────────────
const BADGE_GROUPS = [
    { id: "build-release", label: "Build & Release",     comment: "Build & Release",     min: 5 },
    { id: "repo-activity", label: "Repo activity",       comment: "Repo activity",       min: 5 },
    { id: "community",     label: "Community",           comment: "Community",           min: 6 },
    { id: "code-quality",  label: "Code-quality",        comment: "Code-quality",        min: 3 },
    { id: "stack-stds",    label: "Stack & standards",   comment: "Stack & standards",   min: 8 },
];
const TOTAL_BADGE_MIN = BADGE_GROUPS.reduce((sum, g) => sum + g.min, 0); // 27

// ─── Load README ─────────────────────────────────────────────────────────────
if (!existsSync(README_PATH)) {
    fail(`readme.md not found at: ${README_PATH}`);
}
const raw = readFileSync(README_PATH, "utf8");
const lines = raw.split(/\r?\n/);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Find the H1 line index (first `# ` heading at column 0). */
function findH1Index() {
    for (let i = 0; i < lines.length; i++) {
        if (/^# (?!#)/.test(lines[i])) return i;
    }
    return -1;
}

/** Count all H1 headings — there must be exactly one. */
function countH1() {
    return lines.filter((l) => /^# (?!#)/.test(l)).length;
}

/**
 * Slice the document between two `<!-- comment -->` markers, returning the
 * lines that fall inside. Used to scope badge counts per group.
 */
function sectionBetween(commentLabel) {
    // Match `<!-- Build & Release -->` (case-insensitive, leading text in label OK).
    const startRe = new RegExp(`<!--\\s*${escapeRe(commentLabel)}[^>]*-->`, "i");
    const startIdx = lines.findIndex((l) => startRe.test(l));
    if (startIdx < 0) return null;
    // Find the next HTML comment after this one (any comment terminates the group).
    const nextCommentIdx = lines.findIndex(
        (l, i) => i > startIdx && /<!--[^]*?-->/.test(l),
    );
    const endIdx = nextCommentIdx > 0 ? nextCommentIdx : lines.length;
    return { startIdx, endIdx, body: lines.slice(startIdx + 1, endIdx).join("\n") };
}

function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count shields.io / badge-style markdown images: `[![alt](...)](...)` or `![alt](...)`. */
function countBadges(body) {
    if (!body) return 0;
    const re = /!\[[^\]]*\]\([^)]+\)/g;
    return (body.match(re) ?? []).length;
}

// ─── Checks ──────────────────────────────────────────────────────────────────
const checks = [];

function record(id, label, ok, detail) {
    checks.push({ id, label, ok, detail });
}

// 1. Single H1
{
    const count = countH1();
    record(
        "single-h1",
        "Exactly one H1 heading",
        count === 1,
        count === 1 ? "1 H1 found" : `Found ${count} H1 headings (expected exactly 1)`,
    );
}

// 2. Hero block opens with `<div align="center">` BEFORE the H1
{
    const h1Idx = findH1Index();
    const head = lines.slice(0, h1Idx >= 0 ? h1Idx : Math.min(20, lines.length)).join("\n");
    const ok = h1Idx >= 0 && /<div\s+align=["']center["']\s*>/i.test(head);
    record(
        "centered-hero",
        "Hero wrapped in <div align=\"center\"> before H1",
        ok,
        ok
            ? `<div align="center"> opens at top, H1 at line ${h1Idx + 1}`
            : "Top of file must open with <div align=\"center\"> and the H1 must come AFTER it",
    );
}

// 3. Logo image precedes H1 (anywhere in the head block before H1)
{
    const h1Idx = findH1Index();
    const head = h1Idx > 0 ? lines.slice(0, h1Idx).join("\n") : "";
    const imgRe = /<img\s+[^>]*src=["'][^"']*\b(logo|icon|brand)[^"']*["'][^>]*>/i;
    const mdImgRe = /!\[[^\]]*(logo|icon)[^\]]*\]\([^)]+\)/i;
    const ok = imgRe.test(head) || mdImgRe.test(head);
    record(
        "logo-above-title",
        "Logo image placed above the H1 title",
        ok,
        ok ? "Logo found in hero block above H1" : "No <img …logo…> or ![logo](…) found before the H1 heading",
    );
}

// 4. Tagline blockquote directly below H1
{
    const h1Idx = findH1Index();
    if (h1Idx < 0) {
        record("tagline-blockquote", "Tagline blockquote under H1", false, "No H1 found, cannot validate tagline");
    } else {
        // Look at the next 3 non-empty lines after the H1 for a `>` blockquote.
        let found = false;
        for (let i = h1Idx + 1; i < Math.min(h1Idx + 6, lines.length); i++) {
            const l = lines[i];
            if (l.trim() === "") continue;
            if (/^>\s+\S/.test(l)) { found = true; break; }
            // First non-blank non-blockquote line ends the search.
            break;
        }
        record(
            "tagline-blockquote",
            "Tagline blockquote (`> ...`) immediately under H1",
            found,
            found ? "Tagline blockquote present" : "Expected a `> tagline …` blockquote within 5 lines of the H1",
        );
    }
}

// 5. Each badge group present (HTML comment marker) AND meets minimum badge count
for (const grp of BADGE_GROUPS) {
    const section = sectionBetween(grp.comment);
    if (!section) {
        record(
            `group-${grp.id}`,
            `Badge group present: ${grp.label}`,
            false,
            `Missing <!-- ${grp.comment} --> comment marker before the badge block`,
        );
        continue;
    }
    const count = countBadges(section.body);
    record(
        `group-${grp.id}`,
        `${grp.label} group has ≥${grp.min} badges`,
        count >= grp.min,
        `Found ${count} badge(s) in "${grp.label}" group (minimum ${grp.min})`,
    );
}

// 6. Total badge count meets aggregate minimum
{
    const total = countBadges(raw);
    record(
        "badge-total",
        `Total badge count ≥ ${TOTAL_BADGE_MIN}`,
        total >= TOTAL_BADGE_MIN,
        `Found ${total} badge images across the whole README (minimum ${TOTAL_BADGE_MIN})`,
    );
}

// 7. Hero centering div is closed
{
    // Count opening vs closing align-center divs in the head section (before any "## " heading).
    const firstH2 = lines.findIndex((l) => /^## /.test(l));
    const head = lines.slice(0, firstH2 > 0 ? firstH2 : lines.length).join("\n");
    const opens = (head.match(/<div\s+align=["']center["']\s*>/gi) ?? []).length;
    const closes = (head.match(/<\/div>/gi) ?? []).length;
    const ok = opens >= 1 && closes >= opens;
    record(
        "hero-div-closed",
        "Centered hero <div> closed before first ## section",
        ok,
        ok
            ? `Hero head has ${opens} opening / ${closes} closing div(s)`
            : `Hero head has ${opens} opening but only ${closes} closing </div> (centering must be terminated before the first ## heading)`,
    );
}

// 8. ## Author section exists
const authorHeadingIdx = lines.findIndex((l) => /^##\s+Author\b/i.test(l));
{
    record(
        "author-section",
        "## Author section present",
        authorHeadingIdx >= 0,
        authorHeadingIdx >= 0
            ? `Found "## Author" at line ${authorHeadingIdx + 1}`
            : "Missing required `## Author` heading",
    );
}

// 9. Author block: centered name + role line
if (authorHeadingIdx >= 0) {
    const authorBlockEnd = (() => {
        for (let i = authorHeadingIdx + 1; i < lines.length; i++) {
            if (/^##\s+/.test(lines[i])) return i;
        }
        return lines.length;
    })();
    const authorBody = lines.slice(authorHeadingIdx + 1, authorBlockEnd).join("\n");

    // 9a. Centered div containing the H3 author name
    const nameDivRe = /<div\s+align=["']center["']\s*>[\s\S]*?###\s+\[[^\]]+\]\([^)]+\)[\s\S]*?<\/div>/i;
    record(
        "author-centered-name",
        "Author name centered as ### linked heading",
        nameDivRe.test(authorBody),
        nameDivRe.test(authorBody)
            ? "Centered ### [Name](url) found"
            : "Expected <div align=\"center\"> containing `### [Full Name](url)`",
    );

    // 9b. Role line: **[Primary](url)** | [Secondary](url), [Company](url)
    const roleLineRe = /\*\*\[[^\]]+\]\([^)]+\)\*\*\s*\|\s*\[[^\]]+\]\([^)]+\)\s*,\s*\[[^\]]+\]\([^)]+\)/;
    record(
        "author-role-line",
        "Author role line follows mandated format",
        roleLineRe.test(authorBody),
        roleLineRe.test(authorBody)
            ? "Role line matches `**[Primary](…)** | [Secondary](…), [Company](…)`"
            : "Role line must match: **[Primary Role](url)** | [Secondary Role](url), [Company](url)",
    );

    // 9c. Biography mentions years of experience and links a reputation profile
    const yearsRe = /\b\d{1,2}\+?\s*years?\b/i;
    const reputationRe = /\b(stack\s*overflow|linkedin|github|crossover)\b/i;
    const yearsOk = yearsRe.test(authorBody);
    const repOk = reputationRe.test(authorBody);
    record(
        "author-bio",
        "Biography mentions years of experience + reputation source",
        yearsOk && repOk,
        `years-of-experience: ${yearsOk ? "✓" : "✗"}, reputation-link: ${repOk ? "✓" : "✗"}`,
    );

    // 9d. Author metadata table (2-col with empty header)
    const authorTableRe = /\|\s*\|\s*\|\s*\n\|\s*-+\s*\|\s*-+\s*\|/;
    record(
        "author-metadata-table",
        "Author 2-column metadata table present",
        authorTableRe.test(authorBody),
        authorTableRe.test(authorBody)
            ? "2-column table with empty header found"
            : "Expected `|  |  |` header row + `|---|---|` separator",
    );

    // 9e. ### <Company> subsection
    const companyHeadingRe = /###\s+\S/;
    const subHeadings = (authorBody.match(/^###\s+.+$/gm) ?? []);
    // Need at least 2 H3s (Author Name + Company Name)
    record(
        "company-subsection",
        "### <Company> subsection within Author section",
        subHeadings.length >= 2 && companyHeadingRe.test(subHeadings[1] ?? ""),
        subHeadings.length >= 2
            ? `Found ${subHeadings.length} H3 headings in Author section`
            : `Expected at least 2 H3 headings in Author section, found ${subHeadings.length}`,
    );
} else {
    // Skipped checks — all fail because the parent section is missing.
    for (const id of [
        "author-centered-name",
        "author-role-line",
        "author-bio",
        "author-metadata-table",
        "company-subsection",
    ]) {
        record(id, `(skipped) ${id}`, false, "Author section missing — cannot validate sub-checks");
    }
}

// 10. ## License section present + non-empty body
{
    const licIdx = lines.findIndex((l) => /^##\s+License\b/i.test(l));
    if (licIdx < 0) {
        record("license-section", "## License section present", false, "Missing required `## License` heading at end of README");
    } else {
        const body = lines.slice(licIdx + 1).join("\n").trim();
        const ok = body.length > 10;
        record(
            "license-section",
            "## License section present with body",
            ok,
            ok ? `License section starts at line ${licIdx + 1}` : "License section is empty",
        );
    }
}

// ─── Output ──────────────────────────────────────────────────────────────────
const passed = checks.filter((c) => c.ok).length;
const failed = checks.length - passed;
const ok = failed === 0;

if (JSON_MODE) {
    process.stdout.write(JSON.stringify({
        version: 1,
        ok,
        file: README_PATH,
        summary: { passed, failed, total: checks.length },
        checks,
    }, null, 2) + "\n");
    process.exit(ok ? 0 : 1);
}

// Human output
const ICON = (b) => (b ? "✅" : "❌");
console.log("");
console.log(`README compliance — ${README_PATH.replace(REPO_ROOT + "/", "")}`);
console.log("─".repeat(72));
for (const c of checks) {
    console.log(`  ${ICON(c.ok)}  ${c.label}`);
    if (!c.ok || process.env.VERBOSE === "1") {
        console.log(`        ${c.detail}`);
    }
}
console.log("─".repeat(72));
console.log(`  ${passed}/${checks.length} checks passed${failed > 0 ? `, ${failed} failed` : ""}`);

if (!ok) {
    console.log("");
    console.log("Spec authority: spec/01-spec-authoring-guide/11-root-readme-conventions.md");
    process.exit(1);
}

console.log("");
process.exit(0);

// ─── Bottom helpers ─────────────────────────────────────────────────────────

function fail(msg) {
    if (JSON_MODE) {
        process.stdout.write(JSON.stringify({
            version: 1,
            ok: false,
            file: README_PATH,
            summary: { passed: 0, failed: 1, total: 1 },
            checks: [{ id: "load", label: "Load README", ok: false, detail: msg }],
        }, null, 2) + "\n");
    } else {
        console.error(`[check-readme-compliance] FAIL: ${msg}`);
    }
    process.exit(1);
}
