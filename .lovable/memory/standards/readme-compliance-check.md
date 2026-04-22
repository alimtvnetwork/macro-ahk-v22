---
name: README compliance check
description: Standalone validator scripts/check-readme-compliance.mjs enforces the root README structure mandated by spec/01-spec-authoring-guide/11-root-readme-conventions.md, with a companion repair script that auto-fixes the three most common violations.
type: standard
---

`scripts/check-readme-compliance.mjs` validates the repository-root `readme.md` against the rules in `spec/01-spec-authoring-guide/11-root-readme-conventions.md`. It enforces all 18 checks: single H1 (code-fence aware), centered hero `<div>` opened above the H1 with logo image, tagline blockquote under H1, hero `<div>` closed before the first `## section`, all five badge groups (Build & Release ≥5, Repo activity ≥5, Community ≥6, Code-quality ≥3, Stack & standards ≥8) detected by `<!-- comment -->` markers with per-group counts plus an aggregate ≥27 minimum, `## Author` section with centered `### [Name](url)` H3 + role line `**[Primary](url)** | [Secondary](url), [Company](url)` + biography mentioning years-of-experience and a reputation source + 2-column metadata table with empty header, `### <Company>` subsection, and `## License` section with body.

Code fences are stripped before heading detection so example markdown inside ` ```markdown ` blocks does not trigger false positives.

CLI:
- `pnpm run check:readme` — human output
- `pnpm run check:readme:json` — JSON envelope `{ version: 2, ok, file, summary, checks[] }` for CI consumption
- `pnpm run check:readme:report` — additionally writes a Markdown report to `.lovable/reports/readme-compliance.md`

Flags: `--file=<path>` overrides the README path; `--report=<path>` writes a Markdown compliance report (works alongside `--json`). Exit code 1 on any failure. The script intentionally has zero npm dependencies.

**Schema v2 (current):** each check carries `{ id, label, ok, detail, expected, found }`. The `expected` field states the rule in one line; `found` states the actual observed state. The Markdown report renders failed checks first as side-by-side tables, then a full status inventory, then a collapsible passed-checks section. v1 consumers reading only `id/label/ok/detail` remain compatible — the new fields are additive.

## Auto-repair companion

`scripts/repair-readme.mjs` fixes the three most common violations in-place:

1. **`centered-hero`** — wraps the hero block in `<div align="center"> … </div>`. The opening tag is inserted above the first logo `<img>` (or above the H1 if no logo is found); the closing tag is inserted immediately before the first `## ` H2. If only the closing `</div>` is missing (unbalanced opens), only that close is inserted.
2. **`license-section`** — appends a 7-line stub `## License` section pointing at `LICENSE.md` if the heading is missing.
3. **`author-misorder`** — when the Author section contains both an Author H3 (`### [Name](url)`, linked) and a Company H3 (plain text), and the Company appears first, swaps the two H3 sub-blocks back to the mandated order (Author first, Company second).

CLI:
- `pnpm run repair:readme` — dry-run; prints the intended changes and exits 0 without writing.
- `pnpm run repair:readme:apply` — applies repairs in place, writing a `readme.md.bak` backup first.
- `--json` emits `{ version: 1, file, applied, dryRun, changedBytes, repairs[] }` with each repair carrying `{ id, label, status, reason?, preview? }` where status ∈ `applied | would-apply | skipped | not-needed`.

All repairs are idempotent: re-running `--apply` on an already-compliant file produces zero changes. Repairs that cannot be performed safely (ambiguous structure, missing parent section) are reported with status `skipped` and a `reason` field — they are never silently skipped. The script never edits content inside existing badge blocks, code fences, or biography paragraphs.

**Recommended workflow:** run `check:readme` first to discover violations → run `repair:readme` (dry-run) to preview the auto-fixes → run `repair:readme:apply` to write them → re-run `check:readme` to confirm 18/18.
