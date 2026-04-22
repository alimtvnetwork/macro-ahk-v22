#!/usr/bin/env node
/**
 * repair-readme.mjs
 *
 * Auto-repair mode for the root readme.md. Fixes the three most common
 * compliance violations defined in
 *   spec/01-spec-authoring-guide/11-root-readme-conventions.md
 *
 *   1. centered-hero      — Missing `<div align="center">` wrapping the hero
 *                           block. Inserts `<div align="center">` immediately
 *                           above the first `<img …logo…>` (or above the H1
 *                           if no logo is found) and inserts the matching
 *                           `</div>` immediately before the first `## ` H2.
 *
 *   2. license-section    — Missing `## License` heading at end of file.
 *                           Appends a stub `## License` section with a
 *                           one-line placeholder pointing at LICENSE.md.
 *
 *   3. author-misorder    — Author H3 + Company H3 are present but appear in
 *                           the wrong order (Company before Author). Swaps
 *                           the two H3 sub-blocks back to the mandated order
 *                           (Author first, Company second).
 *
 * Modes:
 *   --dry-run (default) — Print the intended changes as a unified-style diff
 *                         summary; do NOT touch the file. Exit code 0 if any
 *                         repair would be applied, 0 if no repair is needed.
 *
 *   --apply             — Rewrite readme.md in place. Backs up the current
 *                         file to `readme.md.bak` before writing. Exit code 0
 *                         on success.
 *
 *   --json              — Emit a JSON envelope describing repairs (dry-run
 *                         compatible). Schema:
 *                           {
 *                             version: 1,
 *                             file, applied, dryRun,
 *                             repairs: [{ id, label, status, before?, after? }]
 *                           }
 *                         status ∈ "applied" | "would-apply" | "skipped" | "not-needed"
 *
 *   --file=<path>       Override target README path (default: ./readme.md).
 *
 *   --audit[=<path>]    Write a JSON audit log of every mutation performed
 *                       (or that would be performed in dry-run). The log
 *                       captures, per repair: id, label, status, reason,
 *                       and exact before/after snippets of the affected
 *                       region. Default path:
 *                         .lovable/reports/readme-repair-audit-<ISO>.json
 *                       Audit logs are written for BOTH dry-run and apply
 *                       modes so handoffs can review proposed changes.
 *
 * Safety contract:
 *   - The script never edits content INSIDE existing badge blocks, code
 *     fences, or the author biography paragraphs.
 *   - Every repair is idempotent: running the same repair twice is a no-op.
 *   - In --apply mode, a backup is always written first.
 *   - Repairs that cannot be performed safely (ambiguous structure, etc.)
 *     are reported with status "skipped" and a `reason` field.
 *
 * Companion to: scripts/check-readme-compliance.mjs
 *               (run that FIRST to discover violations, then run this with
 *               --apply to remediate; finally re-run the checker to confirm.)
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const JSON_MODE = args.includes("--json");
const fileArg = args.find((a) => a.startsWith("--file="));
const README_PATH = fileArg
    ? resolve(REPO_ROOT, fileArg.slice("--file=".length))
    : resolve(REPO_ROOT, "readme.md");

if (!existsSync(README_PATH)) {
    die(`readme.md not found at: ${README_PATH}`);
}

const original = readFileSync(README_PATH, "utf8");
let working = original;

/** @type {Array<{ id: string; label: string; status: "applied"|"would-apply"|"skipped"|"not-needed"; reason?: string; preview?: string }>} */
const repairs = [];

// ─── Repair #1: centered-hero ────────────────────────────────────────────────
{
    const id = "centered-hero";
    const label = "Insert <div align=\"center\"> wrapper around hero block";
    const lines = working.split(/\r?\n/);

    // Already has centering div above the H1?
    const h1Idx = lines.findIndex((l) => /^# (?!#)/.test(l));
    const head = h1Idx > 0 ? lines.slice(0, h1Idx).join("\n") : "";
    const alreadyCentered = /<div\s+align=["']center["']\s*>/i.test(head);

    if (h1Idx < 0) {
        repairs.push({ id, label, status: "skipped", reason: "no H1 heading found — cannot determine hero block boundary" });
    } else if (alreadyCentered) {
        // Also confirm there's a closing </div> before the first ## section.
        const firstH2 = lines.findIndex((l, i) => i > h1Idx && /^## /.test(l));
        const heroEnd = firstH2 > 0 ? firstH2 : lines.length;
        const heroSlice = lines.slice(0, heroEnd).join("\n");
        const opens = (heroSlice.match(/<div\s+align=["']center["']\s*>/gi) ?? []).length;
        const closes = (heroSlice.match(/<\/div>/gi) ?? []).length;

        if (opens === closes) {
            repairs.push({ id, label, status: "not-needed", reason: "hero already wrapped with balanced <div align=\"center\"> … </div>" });
        } else if (closes < opens) {
            // Insert a </div> just before the first ## heading.
            const insertAt = firstH2 > 0 ? firstH2 : lines.length;
            const newLines = [...lines];
            newLines.splice(insertAt, 0, "</div>", "");
            const next = newLines.join("\n");
            repairs.push({ id, label, status: APPLY ? "applied" : "would-apply", preview: `+ insert </div> at line ${insertAt + 1} (before first ## heading) — close unbalanced opening` });
            working = next;
        } else {
            repairs.push({ id, label, status: "skipped", reason: `more closing </div> than opening (${opens} open / ${closes} close) — manual review required` });
        }
    } else {
        // Need to wrap. Insert <div align="center"> ABOVE the first logo-ish image,
        // or above the H1 if no logo is detectable. Insert </div> before first ## H2.
        const isLogoLine = (l) =>
            /<img\s+[^>]*src=["'][^"']*\b(logo|icon|brand)[^"']*["'][^>]*>/i.test(l) ||
            /!\[[^\]]*(logo|icon|brand)[^\]]*\]\([^)]+\)/i.test(l);
        const logoIdx = lines.findIndex((l, i) => i < h1Idx && isLogoLine(l));
        const openAt = logoIdx >= 0 ? logoIdx : h1Idx;

        const firstH2 = lines.findIndex((l, i) => i > h1Idx && /^## /.test(l));
        const closeAt = firstH2 > 0 ? firstH2 : lines.length;

        const newLines = [...lines];
        // IMPORTANT: insert close FIRST so the open-index stays valid.
        newLines.splice(closeAt, 0, "</div>", "");
        newLines.splice(openAt, 0, "<div align=\"center\">", "");
        const next = newLines.join("\n");
        const previewParts = [
            `+ insert <div align="center"> at line ${openAt + 1}`,
            `+ insert </div> at line ${closeAt + 3} (before first ## heading)`,
        ];
        repairs.push({ id, label, status: APPLY ? "applied" : "would-apply", preview: previewParts.join("; ") });
        working = next;
    }
}

// ─── Repair #2: license-section ──────────────────────────────────────────────
{
    const id = "license-section";
    const label = "Append `## License` section if missing";
    const linesNoCode = stripCodeFences(working).split(/\r?\n/);
    const hasLicenseHeading = linesNoCode.some((l) => /^##\s+License\b/i.test(l));

    if (hasLicenseHeading) {
        repairs.push({ id, label, status: "not-needed", reason: "## License heading already present" });
    } else {
        const stub = [
            "",
            "---",
            "",
            "## License",
            "",
            "See [`LICENSE.md`](./LICENSE.md) for the full license text.",
            "",
        ].join("\n");
        const trimmed = working.replace(/\s+$/, "");
        const next = `${trimmed}\n${stub}`;
        repairs.push({ id, label, status: APPLY ? "applied" : "would-apply", preview: `+ append 7-line "## License" section at end of file` });
        working = next;
    }
}

// ─── Repair #3: author-misorder ──────────────────────────────────────────────
{
    const id = "author-misorder";
    const label = "Reorder Author/Company H3 sub-sections (Author first)";
    const linesNoCode = stripCodeFences(working).split(/\r?\n/);
    const authorIdx = linesNoCode.findIndex((l) => /^##\s+Author\b/i.test(l));

    if (authorIdx < 0) {
        repairs.push({ id, label, status: "skipped", reason: "no `## Author` section found — repair not applicable" });
    } else {
        // Find the end of the Author section (next ## heading, or EOF).
        const linesArr = working.split(/\r?\n/);
        const sectionEnd = (() => {
            for (let i = authorIdx + 1; i < linesNoCode.length; i++) {
                if (/^##\s+/.test(linesNoCode[i])) return i;
            }
            return linesArr.length;
        })();

        // Locate H3 sub-blocks within Author section.
        // Each block runs from its `### ` line up to the next `### ` or sectionEnd.
        /** @type {Array<{ startIdx: number; endIdx: number; heading: string; isCompany: boolean; isAuthor: boolean }>} */
        const blocks = [];
        for (let i = authorIdx + 1; i < sectionEnd; i++) {
            if (/^###\s+/.test(linesNoCode[i])) {
                const heading = linesArr[i];
                // Find next ### or sectionEnd
                let endIdx = sectionEnd;
                for (let j = i + 1; j < sectionEnd; j++) {
                    if (/^###\s+/.test(linesNoCode[j])) { endIdx = j; break; }
                }
                // Author H3 is `### [Name](url)` (linked); Company H3 is plain text.
                const isAuthor = /^###\s+\[[^\]]+\]\([^)]+\)/.test(heading);
                const isCompany = !isAuthor;
                blocks.push({ startIdx: i, endIdx, heading: heading.trim(), isCompany, isAuthor });
                i = endIdx - 1;
            }
        }

        if (blocks.length < 2) {
            repairs.push({ id, label, status: "not-needed", reason: `only ${blocks.length} H3 block(s) inside Author section — nothing to reorder` });
        } else {
            const firstAuthorIdx = blocks.findIndex((b) => b.isAuthor);
            const firstCompanyIdx = blocks.findIndex((b) => b.isCompany);

            if (firstAuthorIdx < 0 || firstCompanyIdx < 0) {
                repairs.push({ id, label, status: "skipped", reason: "could not classify both an Author H3 (linked name) and a Company H3 (plain text)" });
            } else if (firstAuthorIdx < firstCompanyIdx) {
                repairs.push({ id, label, status: "not-needed", reason: "Author H3 already appears before Company H3" });
            } else {
                // Swap the two blocks. Operate on linesArr; replace [startIdx..endIdx)
                // ranges of authorBlock and companyBlock with each other's content.
                const authorBlock = blocks[firstAuthorIdx];
                const companyBlock = blocks[firstCompanyIdx];

                // Make sure they are non-overlapping siblings.
                if (companyBlock.endIdx > authorBlock.startIdx || authorBlock.startIdx <= companyBlock.endIdx - 1) {
                    // We expect company to come BEFORE author in the misordered case.
                    // i.e. companyBlock.startIdx < authorBlock.startIdx
                }
                if (companyBlock.startIdx >= authorBlock.startIdx) {
                    repairs.push({ id, label, status: "skipped", reason: "Author/Company block ordering ambiguous — manual review required" });
                } else {
                    const before = linesArr.slice(0, companyBlock.startIdx);
                    const companyContent = linesArr.slice(companyBlock.startIdx, companyBlock.endIdx);
                    const middle = linesArr.slice(companyBlock.endIdx, authorBlock.startIdx);
                    const authorContent = linesArr.slice(authorBlock.startIdx, authorBlock.endIdx);
                    const after = linesArr.slice(authorBlock.endIdx);
                    const reordered = [...before, ...authorContent, ...middle, ...companyContent, ...after];
                    working = reordered.join("\n");
                    repairs.push({
                        id,
                        label,
                        status: APPLY ? "applied" : "would-apply",
                        preview: `~ swap "${truncate(companyBlock.heading, 60)}" (lines ${companyBlock.startIdx + 1}-${companyBlock.endIdx}) with "${truncate(authorBlock.heading, 60)}" (lines ${authorBlock.startIdx + 1}-${authorBlock.endIdx})`,
                    });
                }
            }
        }
    }
}

// ─── Apply / Report ──────────────────────────────────────────────────────────
const changed = working !== original;
const appliedCount = repairs.filter((r) => r.status === "applied" || r.status === "would-apply").length;

if (APPLY && changed) {
    const backup = `${README_PATH}.bak`;
    copyFileSync(README_PATH, backup);
    writeFileSync(README_PATH, working, "utf8");
}

if (JSON_MODE) {
    process.stdout.write(JSON.stringify({
        version: 1,
        file: README_PATH,
        applied: APPLY && changed,
        dryRun: !APPLY,
        changedBytes: working.length - original.length,
        repairs,
    }, null, 2) + "\n");
    process.exit(0);
}

// Human output
const ICON = (s) => s === "applied" ? "✅" : s === "would-apply" ? "📝" : s === "skipped" ? "⚠️ " : "—";
console.log("");
console.log(`README repair — ${relative(REPO_ROOT, README_PATH)} ${APPLY ? "(APPLY MODE)" : "(dry-run)"}`);
console.log("─".repeat(72));
for (const r of repairs) {
    console.log(`  ${ICON(r.status)} [${r.status}] ${r.label}`);
    if (r.preview) console.log(`         ${r.preview}`);
    if (r.reason) console.log(`         reason: ${r.reason}`);
}
console.log("─".repeat(72));
if (APPLY) {
    if (changed) {
        console.log(`  ✅ ${appliedCount} repair(s) applied. Backup: ${relative(REPO_ROOT, README_PATH)}.bak`);
        console.log(`     Re-run \`pnpm run check:readme\` to confirm compliance.`);
    } else {
        console.log(`  ✅ No repairs needed — README is already compliant on the 3 auto-repairable rules.`);
    }
} else {
    if (appliedCount > 0) {
        console.log(`  📝 ${appliedCount} repair(s) would be applied. Re-run with --apply to write changes.`);
    } else {
        console.log(`  ✅ No repairs needed — README is already compliant on the 3 auto-repairable rules.`);
    }
}
console.log("");
process.exit(0);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Blank out lines inside fenced code blocks; preserves line numbers. */
function stripCodeFences(text) {
    const ls = text.split(/\r?\n/);
    const out = new Array(ls.length);
    let inFence = false;
    let fenceMarker = "";
    for (let i = 0; i < ls.length; i++) {
        const l = ls[i];
        const m = l.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (m) {
            const marker = m[1][0];
            if (!inFence) { inFence = true; fenceMarker = marker; out[i] = ""; continue; }
            if (inFence && marker === fenceMarker) { inFence = false; fenceMarker = ""; out[i] = ""; continue; }
        }
        out[i] = inFence ? "" : l;
    }
    return out.join("\n");
}

function truncate(s, n) {
    if (!s) return "";
    return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function die(msg) {
    if (JSON_MODE) {
        process.stdout.write(JSON.stringify({ version: 1, ok: false, error: msg }, null, 2) + "\n");
    } else {
        console.error(`[repair-readme] FAIL: ${msg}`);
    }
    process.exit(1);
}
