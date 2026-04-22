---
name: README compliance check
description: Standalone validator scripts/check-readme-compliance.mjs enforces the root README structure mandated by spec/01-spec-authoring-guide/11-root-readme-conventions.md
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
