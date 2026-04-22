# Root README Conventions

**Version:** 1.1.0
**Updated:** 2026-04-22
**Status:** Active
**AI Confidence:** Production-Ready
**Ambiguity:** None
**Enforced by:** [`scripts/check-readme-compliance.mjs`](../../scripts/check-readme-compliance.mjs) — `pnpm run check:readme`

---

## Overview

The repository's root `readme.md` is the first artifact every visitor (human or AI) sees on GitHub. It must be **center-aligned, icon-led, badge-rich, and brand-consistent**. This document defines the **mandatory** structure so any contributor (or AI agent) can produce a compliant root README from scratch — no guessing, no drift across versions.

These rules apply only to the **repository-root `readme.md`**. Module-level overviews remain governed by `03-required-files.md`.

---

## Mandatory Structure (Top-of-File, In This Order)

## Mandatory Hero Layout

The first ~60 lines of `readme.md` MUST follow this **exact** skeleton, in this order. Any deviation is a compliance failure (the validator script reports `centered-hero`, `logo-above-title`, `tagline-blockquote`, or `hero-div-closed`):

```markdown
<div align="center">                                  ← rule HL-01

<img src="docs/assets/<project-logo>.png"             ← rule HL-02
     alt="<Project> Logo" width="128" height="128" />

# <Project Name>                                       ← rule HL-03 (single H1)

> **<One-sentence value proposition>** — <stack qualifier>.   ← rule HL-04

<!-- Build & Release -->                               ← rule HL-05 (group order #1)
[badges...]

<!-- Repo activity -->                                 ← rule HL-05 (group order #2)
[badges...]

<!-- Community -->                                     ← rule HL-05 (group order #3)
[badges...]

<!-- Code-quality report cards -->                     ← rule HL-05 (group order #4)
[badges...]

<!-- Stack & standards -->                             ← rule HL-05 (group order #5)
[badges...]

<img src="docs/assets/<hero-image>.png"                ← rule HL-06
     alt="<Project> hero" width="820" />

</div>                                                 ← rule HL-07
```

### Hero Layout Hard Rules (enforced)

| Rule  | Requirement                                                                                                       | Validator check ID    |
|-------|-------------------------------------------------------------------------------------------------------------------|-----------------------|
| HL-01 | First non-blank line of the file is `<div align="center">`. Do **not** use `<h1 align="center">` (non-portable). | `centered-hero`       |
| HL-02 | A `<img …logo…>` (or `![…logo…](…)`) appears above the H1, sized **128×128**, source ≥256×256 PNG.                | `logo-above-title`    |
| HL-03 | Exactly one `# H1` heading exists in the entire file. The H1 sits inside the centering `<div>`.                   | `single-h1`           |
| HL-04 | A `> blockquote` tagline appears within 5 lines of the H1, single sentence, em-dash-qualified.                    | `tagline-blockquote`  |
| HL-05 | Five `<!-- … -->` HTML comment markers appear in the **exact order**: Build & Release → Repo activity → Community → Code-quality → Stack & standards. Each marker introduces a contiguous badge block (badges separated only by whitespace). | `group-build-release`, `group-repo-activity`, `group-community`, `group-code-quality`, `group-stack-stds` |
| HL-06 | A hero `<img>` (UI screenshot or architecture diagram) is the **last** element inside the centering `<div>`, sized `width="820"`. | _(visual-only)_       |
| HL-07 | The centering `<div>` is closed (`</div>`) **before** the first `## section` heading. Opens must equal closes.    | `hero-div-closed`     |

> **Forbidden in the hero block:** `<table>`, `<details>`, raw HTML headings (`<h1>`–`<h6>`), inline `style="..."` attributes, or any element wider than 1920px. Keep the hero scannable in <2 seconds.

---

## Mandatory Badge Inventory

## Mandatory Badge Inventory

Every root README must include **at least the badges listed below**, organised into the five groups in the **exact order** they appear in §HL-05. Per-group minimums and the aggregate minimum are enforced by `check-readme-compliance.mjs`. Every badge MUST use `style=flat-square` for visual consistency.

> **Aggregate minimum:** **27 badges** (5 + 5 + 6 + 3 + 8). The validator reports `badge-total` if the file falls below this.

### Group 1 — Build & Release (minimum **5** badges)

HTML comment marker: `<!-- Build & Release -->`

| # | Badge                       | Source pattern                                                                              |
|---|-----------------------------|---------------------------------------------------------------------------------------------|
| 1 | CI workflow status          | `img.shields.io/github/actions/workflow/status/<owner>/<repo>/ci.yml?branch=main`           |
| 2 | Release workflow status     | `img.shields.io/github/actions/workflow/status/<owner>/<repo>/release.yml`                  |
| 3 | Latest release version      | `img.shields.io/github/v/release/<owner>/<repo>?include_prereleases&sort=semver`            |
| 4 | Release date                | `img.shields.io/github/release-date/<owner>/<repo>`                                         |
| 5 | Total downloads             | `img.shields.io/github/downloads/<owner>/<repo>/total`                                      |

### Group 2 — Repo Activity (minimum **5** badges)

HTML comment marker: `<!-- Repo activity -->`

| # | Badge                       | Source pattern                                                              |
|---|-----------------------------|-----------------------------------------------------------------------------|
| 1 | Last commit                 | `img.shields.io/github/last-commit/<owner>/<repo>/main`                     |
| 2 | Commit activity (monthly)   | `img.shields.io/github/commit-activity/m/<owner>/<repo>`                    |
| 3 | Open issues                 | `img.shields.io/github/issues/<owner>/<repo>`                               |
| 4 | Open pull requests          | `img.shields.io/github/issues-pr/<owner>/<repo>`                            |
| 5 | Repo size                   | `img.shields.io/github/repo-size/<owner>/<repo>`                            |

A **Discussions** badge (`img.shields.io/github/discussions/<owner>/<repo>`) is **recommended** when GitHub Discussions is enabled and counts toward the group total.

### Group 3 — Community (minimum **6** badges)

HTML comment marker: `<!-- Community -->`

| # | Badge                       | Source pattern                                                                          |
|---|-----------------------------|-----------------------------------------------------------------------------------------|
| 1 | Stars (yellow)              | `img.shields.io/github/stars/<owner>/<repo>?color=yellow`                              |
| 2 | Forks                       | `img.shields.io/github/forks/<owner>/<repo>`                                           |
| 3 | Watchers                    | `img.shields.io/github/watchers/<owner>/<repo>`                                        |
| 4 | Contributors                | `img.shields.io/github/contributors/<owner>/<repo>`                                    |
| 5 | PRs Welcome                 | `img.shields.io/badge/PRs-welcome-brightgreen` → links to `./contributing.md`          |
| 6 | Made with Love              | `img.shields.io/badge/made%20with-%E2%99%A5-ff69b4` → links to the company site        |

### Group 4 — Code-Quality Report Cards (minimum **3** badges; **12 recommended**)

HTML comment marker: `<!-- Code-quality report cards -->`

The minimum-viable set covers static analysis (CodeFactor / Codacy / Code Climate). Mature projects ship the full **12-tile** matrix below. Placeholder *"activate"* badges are acceptable for tiles that require OAuth onboarding — they MUST link to the activation page and MUST be documented in a callout immediately under the badge block (see §"Activation Callout" below).

| # | Tile                | Type           | Source pattern                                                                                | Status when unowned |
|---|---------------------|----------------|-----------------------------------------------------------------------------------------------|---------------------|
| 1 | CodeFactor          | static-analysis| `img.shields.io/codefactor/grade/github/<owner>/<repo>/main`                                  | live (no signup)    |
| 2 | Codacy              | static-analysis| `img.shields.io/badge/Codacy-activate-blue` → activation                                      | placeholder         |
| 3 | Code Climate        | maintainability| `img.shields.io/badge/Code%20Climate-activate-blue` → activation                              | placeholder         |
| 4 | CodeQL              | security       | `img.shields.io/github/actions/workflow/status/<owner>/<repo>/codeql.yml?label=CodeQL`        | live via CI         |
| 5 | Snyk Vulnerabilities| security       | `img.shields.io/snyk/vulnerabilities/github/<owner>/<repo>`                                   | live (auto-poll)    |
| 6 | npm audit           | dependency-sec | `img.shields.io/badge/dependencies-audited-success` → `…/security/dependabot`                 | live (CI gate)      |
| 7 | Dependabot          | dependency-mgt | `img.shields.io/badge/Dependabot-active-025E8C` → `…/network/updates`                         | live via config     |
| 8 | Renovate            | dependency-mgt | `img.shields.io/badge/Renovate-ready-1A1F6C` → docs                                           | placeholder         |
| 9 | Coverage (local)    | tests          | `img.shields.io/badge/coverage-tracked-success` → `./vitest.config.ts`                        | live                |
|10 | Codecov             | tests-uploaded | `img.shields.io/badge/Codecov-activate-F01F7A` → activation                                   | placeholder         |
|11 | TypeScript Strict   | language-mode  | `img.shields.io/badge/TypeScript-strict-blue` → `./tsconfig.json`                             | informational       |
|12 | Maintained          | meta           | `img.shields.io/badge/maintained-yes-brightgreen` → `…/commits/main`                          | informational       |

#### Activation Callout (mandatory under the hero)

When ANY tile in Group 4 ships as a placeholder, the README MUST include a `> Report cards — activation status` blockquote immediately under the closing `</div>` of the hero. Each placeholder line must specify: tile name, status icon (✅ live / ⏳ pending), the OAuth provider URL, and the **exact replacement badge URL pattern** for after activation.

### Group 5 — Stack & Standards (minimum **8** badges)

HTML comment marker: `<!-- Stack & standards -->`

Cover the full delivery stack — one badge each. Order: language → runtime → package manager → build tool → primary framework → styling → lint → test runner → license. The license badge MUST be the **final** entry and MUST link to `#license`.

| # | Badge                | Example source                                                                  |
|---|----------------------|---------------------------------------------------------------------------------|
| 1 | Language version     | `img.shields.io/badge/TypeScript-5-3178C6?logo=typescript`                      |
| 2 | Runtime version      | `img.shields.io/badge/Node-20%2B-339933?logo=node.js`                           |
| 3 | Package manager      | `img.shields.io/badge/pnpm-9-F69220?logo=pnpm`                                  |
| 4 | Build tool           | `img.shields.io/badge/Vite-5-646CFF?logo=vite`                                  |
| 5 | Primary framework    | `img.shields.io/badge/React-18-61DAFB?logo=react`                               |
| 6 | Styling              | `img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss`                       |
| 7 | Lint                 | `img.shields.io/badge/ESLint-…-4B32C3?logo=eslint`                              |
| 8 | Test runner          | `img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest`                  |
| 9 | E2E (recommended)    | `img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright`                    |
|10 | License (mandatory final) | `img.shields.io/badge/license-<Type>-red` → `#license`                     |

For Chrome-extension repos add a **Manifest V3** badge (`img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome`) as entry #1 to make the deployment target unambiguous.

> **Style invariant:** every badge URL MUST contain `style=flat-square`. The validator does not enforce this directly, but reviewers should reject PRs that mix styles within the hero.

---

## Author & Company Section

The root README must include a dedicated **`## Author`** section near the bottom (before the License section). It follows this exact structure:

```markdown
## Author

<div align="center">

### [<Full Legal Name>](<authoritative-search-url>)

**[<Primary Role>](<personal-site>)** | [<Secondary Role>](<authoritative-search-url>), [<Company Name>](<company-site>)

</div>

<1-paragraph biography emphasising years of experience, stack mastery, and notable recognition>

|  |  |
|---|---|
| **Website** | [<personal-domain>](<url>) |
| **LinkedIn** | [<handle>](<url>) |
| **Stack Overflow** | [<profile-url>](<url>) |
| **Google** | [<Search Term>](<google-search-url>) |
| **Role** | <Role>, [<Company>](<url>) |

### <Company Name>

[<Company tagline / accolade>](<company-site>)

|  |  |
|---|---|
| **Website** | [<company-domain>](<url>) |
| **Facebook** | [<handle>](<url>) |
| **LinkedIn** | [<company-page>](<url>) |
| **YouTube** | [<channel>](<url>) |
```

### Hard Rules — Author Section

1. **Center the name + role line** using `<div align="center">`. The biography paragraph that follows is left-aligned for readability.
2. **The full legal name is an H3** (`###`), wrapped in a link to the canonical search URL (Google by default — never link to a single profile URL that may change).
3. **Role line format:** `**[<Primary Role>](<personal-site>)** | [<Secondary Role>](<search-url>), [<Company>](<company-site>)`. The pipe and comma separators are mandatory.
4. **Biography paragraph** must mention: years of experience, primary tech stack with year counts, notable accolades, and at least two third-party reputation links (Stack Overflow, LinkedIn, etc.).
5. **Two-column metadata tables** — one for the author, one for the company. Empty header row (`|  |  |`) renders cleanly on GitHub. Always include Website, LinkedIn, and Role for the author; Website plus at least two social channels for the company.
6. **Company subsection** is `### <Company Name>` (H3) with the company's official tagline as the first line. If the company has any "top-leading", "award", or jurisdictional recognition (e.g. *"Top Leading Software Company in WY (2026)"*), it must appear here verbatim.
7. **Company name spelling and casing** must match the legal entity exactly across the entire repository (README, About page, package.json author field, license header). Project memory at `mem://branding/author-identity` is the single source of truth — never deviate.

---

## License Footer

The README must end with a `## License` section. One sentence is sufficient; it must name the owning legal entity and the license type:

```markdown
## License

This project is proprietary software owned by <Company Name>. All rights reserved.
```

---

## Assets Folder

- All images referenced from `readme.md` live in `docs/assets/`.
- File naming: lowercase kebab-case (`marco-logo.png`, `marco-extension-hero.png`).
- Logo: square PNG, transparent background, **at least 256×256** source resolution (rendered at 128×128).
- Hero: PNG or WebP, max width **1920px**, displayed at 820px.

---

## Validation Checklist

A root README passes review only if every item below is true:

- [ ] Logo image rendered above the H1 title, sized 128×128.
- [ ] H1 title is centered (inside `<div align="center">`).
- [ ] Tagline blockquote present directly under the H1.
- [ ] All five badge groups present, each labeled with an HTML comment.
- [ ] At least 27 badges total (5 + 5 + 6 + 3 + 8).
- [ ] Hero screenshot rendered inside the centered div at width=820.
- [ ] `## Author` section present with centered name, biography, and metadata table.
- [ ] `### <Company>` subsection present with tagline and metadata table.
- [ ] `## License` section present at the end.
- [ ] Single H1 in the entire document.
- [ ] Company name spelling matches `mem://branding/author-identity` exactly.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Required Files (module-level) | [`./03-required-files.md`](./03-required-files.md) |
| Author identity (single source of truth) | `mem://branding/author-identity` |
| Documentation standards | `mem://workflow/documentation-standards` |
| Spec Authoring Guide overview | [`./00-overview.md`](./00-overview.md) |
