# Root README Conventions

**Version:** 2.0.0
**Updated:** 2026-04-22
**Status:** Active
**AI Confidence:** Production-Ready
**Ambiguity:** None

---

## Overview

The repository's root `readme.md` is the first artifact every visitor (human or AI) sees on GitHub. It must be **center-aligned, icon-led, badge-rich (only with LIVE data), and brand-consistent**. This document defines the **mandatory** structure so any contributor (or AI agent) can produce a compliant root README from scratch — no guessing, no drift across versions.

These rules apply only to the **repository-root `readme.md`**. Module-level overviews remain governed by `03-required-files.md`.

> **2026-04-22 amendment:** All static `img.shields.io/badge/…` mockup badges, all "activate" placeholders (Codacy / Code Climate / Codecov / Snyk activation pages), and all badges that resolve to `no status` / `not found` / `404` on shields.io are **forbidden in the hero block**. Per-group minimums were lowered accordingly. See `mem://constraints/no-static-mockup-badges`.

---

## Mandatory Structure (Top-of-File, In This Order)

The first ~30 lines of `readme.md` MUST follow this exact skeleton:

```markdown
<div align="center">

<img src="docs/assets/<project-logo>.png" alt="<Project> Logo" width="128" height="128" />

# <Project Name>

> **<One-sentence value proposition>** — <stack/architecture qualifier>.

<!-- Build & Release -->
[live-data badges only…]

<!-- Repo activity -->
[live-data badges only…]

<!-- Community -->
[live-data badges only — group may be empty if none exist yet]

<!-- Code-quality -->
[live-data badges only…]

<!-- Stack & standards -->
[license badge + any further live-data stack badges…]

<img src="docs/assets/<hero-image>.png" alt="<Project> hero" width="820" />

</div>
```

### Hard Rules

1. **Wrap the entire hero block in `<div align="center">`** — title, logo, badges, and hero image must all be centered. Do **not** use the GitHub-only HTML `<h1 align="center">` shortcut; the `<div>` wrapper is portable across rendering surfaces.
2. **Logo first, title second.** The `<img>` for the logo precedes the `# Title` H1 heading. Logo lives at `docs/assets/<project>-logo.png` and is sized **128×128**.
3. **One H1 only.** The project name is the single H1 in the entire file (SEO + accessibility).
4. **Tagline blockquote** directly under the H1, one sentence, em-dash-qualified.
5. **All five group HTML comment markers must appear**, even when a group is empty. The five required markers are: **Build & Release**, **Repo activity**, **Community**, **Code-quality**, **Stack & standards**. An empty group is acceptable if no live-data badge exists for it; never insert placeholder badges to fill a group.
6. **Hero image** (UI screenshot or architecture diagram) is the last element inside the centering div, sized to **width=820**.
7. **Close the centering div** before the first prose section.

---

## Forbidden Badge Patterns

The following badge URLs and patterns **MUST NOT** appear in the hero block:

| Pattern | Why forbidden |
|---------|---------------|
| `img.shields.io/badge/<text>-<text>-<color>` | Static mockup badge — encodes hard-coded text, not live data. Lies about project state. |
| Any URL whose rendered shield text reads `activate`, `no status`, `not found`, `repo not found`, `no releases found`, `404`, `badge not found` | The badge resolved to a fail state on shields.io. Visually crossed out / broken. |
| `Codacy` / `Code Climate` / `Codecov` / `Snyk` activation-link badges with placeholder text | Require OAuth onboarding by the repo owner. Do not list until activated; once activated, swap in the real Grade/Coverage URL containing the project UUID. |
| Stack-version badges hand-encoded as `img.shields.io/badge/<lib>-<ver>-<color>` | Drifts the moment dependencies update. If a live alternative exists (e.g. `img.shields.io/github/package-json/dependency-version/...`), use it; otherwise omit. |
| `made-with-love` / `PRs-welcome` / "informational" decorative badges | Pure decoration with no live state. Omit. |

### Acceptable Live-Data Badge Sources

| Domain | Use for |
|--------|---------|
| `img.shields.io/github/actions/workflow/status/<owner>/<repo>/<workflow>.yml` | CI / Release / CodeQL workflow status |
| `img.shields.io/github/issues(-pr)?/<owner>/<repo>` | Open issues / PRs |
| `img.shields.io/github/repo-size/<owner>/<repo>` | Repo size |
| `img.shields.io/github/license/<owner>/<repo>` | License (auto-detected from repo) |
| `img.shields.io/github/v/release/<owner>/<repo>` | Latest release (only after first release exists) |
| `img.shields.io/github/stars\|forks\|watchers\|contributors/<owner>/<repo>` | Community metrics (only after the repo has non-trivial counts) |
| `img.shields.io/codecov/c/github/<owner>/<repo>` | Coverage (only after Codecov is activated and the project UUID is known) |
| `img.shields.io/codefactor/grade/github/<owner>/<repo>/main` | Code quality (CodeFactor — no signup required) |

---

## Mandatory Badge Inventory (post-amendment minimums)

| Group | HTML comment marker | Live-data badge floor | Notes |
|-------|---------------------|------------------------|-------|
| Build & Release | `<!-- Build & Release -->` | **≥1** | Typically the CI workflow status. Add release/version/downloads only AFTER the first release exists. |
| Repo activity | `<!-- Repo activity -->` | **≥1** | Open issues, open PRs, repo size, last commit — at least one. |
| Community | `<!-- Community -->` | **≥0** | May be empty until the repo has real stars/forks/contributors. Do NOT pad with `PRs-welcome` decoration. |
| Code-quality | `<!-- Code-quality -->` | **≥1** | E.g. CodeFactor, Dependabot/Renovate live PR counts, security-issue counts. No "activate" placeholders. |
| Stack & standards | `<!-- Stack & standards -->` | **≥1** | License badge from `img.shields.io/github/license/<owner>/<repo>` is the most reliable single entry. Add language/runtime ONLY when a live-data source exists. |
| **Aggregate total** | — | **≥5** badge images across the README | |

When a category genuinely has no live-data badge available, **leave the comment marker in place with an explanatory HTML comment underneath** so future contributors know the group was intentionally left empty:

```markdown
<!-- Community -->
<!-- (intentionally empty — see mem://constraints/no-static-mockup-badges) -->
```

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
- [ ] All five badge group HTML comment markers present (`<!-- Build & Release -->`, `<!-- Repo activity -->`, `<!-- Community -->`, `<!-- Code-quality -->`, `<!-- Stack & standards -->`).
- [ ] Each group meets the per-group floor in the inventory table above (≥1 / ≥1 / ≥0 / ≥1 / ≥1).
- [ ] At least 5 live-data badges total.
- [ ] **Zero** `img.shields.io/badge/...-...-<color>` static mockup badges.
- [ ] **Zero** badges showing `activate`, `no status`, `not found`, `404`, or `repo not found`.
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
| Read/write procedure for the root readme | [`./12-root-readme-read-write-spec.md`](./12-root-readme-read-write-spec.md) |
| Required Files (module-level) | [`./03-required-files.md`](./03-required-files.md) |
| Author identity (single source of truth) | `mem://branding/author-identity` |
| Static mockup badge ban | `mem://constraints/no-static-mockup-badges` |
| Documentation standards | `mem://workflow/documentation-standards` |
| Spec Authoring Guide overview | [`./00-overview.md`](./00-overview.md) |
