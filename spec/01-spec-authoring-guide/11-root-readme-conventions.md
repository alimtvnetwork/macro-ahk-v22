# Root README Conventions

**Version:** 1.0.0
**Updated:** 2026-04-22
**Status:** Active
**AI Confidence:** Production-Ready
**Ambiguity:** None

---

## Overview

The repository's root `readme.md` is the first artifact every visitor (human or AI) sees on GitHub. It must be **center-aligned, icon-led, badge-rich, and brand-consistent**. This document defines the **mandatory** structure so any contributor (or AI agent) can produce a compliant root README from scratch — no guessing, no drift across versions.

These rules apply only to the **repository-root `readme.md`**. Module-level overviews remain governed by `03-required-files.md`.

---

## Mandatory Structure (Top-of-File, In This Order)

The first ~60 lines of `readme.md` MUST follow this exact skeleton:

```markdown
<div align="center">

<img src="docs/assets/<project-logo>.png" alt="<Project> Logo" width="128" height="128" />

# <Project Name>

> **<One-sentence value proposition>** — <stack/architecture qualifier>.

<!-- Build & Release -->
[badges...]

<!-- Repo activity -->
[badges...]

<!-- Community -->
[badges...]

<!-- Code-quality report cards -->
[badges...]

<!-- Stack & standards -->
[badges...]

<img src="docs/assets/<hero-image>.png" alt="<Project> hero" width="820" />

</div>
```

### Hard Rules

1. **Wrap the entire hero block in `<div align="center">`** — title, logo, badges, and hero image must all be centered. Do **not** use the GitHub-only HTML `<h1 align="center">` shortcut; the `<div>` wrapper is portable across rendering surfaces.
2. **Logo first, title second.** The `<img>` for the logo precedes the `# Title` H1 heading. Logo lives at `docs/assets/<project>-logo.png` and is sized **128×128**.
3. **One H1 only.** The project name is the single H1 in the entire file (SEO + accessibility).
4. **Tagline blockquote** directly under the H1, one sentence, em-dash-qualified.
5. **Badges grouped by purpose**, each group prefixed with an HTML comment label. The five required groups are: **Build & Release**, **Repo activity**, **Community**, **Code-quality report cards**, **Stack & standards**.
6. **Hero image** (UI screenshot or architecture diagram) is the last element inside the centering div, sized to **width=820**.
7. **Close the centering div** before the first prose section.

---

## Mandatory Badge Inventory

Every root README must include **at least these badges**, organised into the five groups above. Use `style=flat-square` for visual consistency.

### Build & Release (5 badges minimum)

| Badge | Source |
|-------|--------|
| CI workflow status | `img.shields.io/github/actions/workflow/status/<owner>/<repo>/ci.yml` |
| Release workflow status | `img.shields.io/github/actions/workflow/status/<owner>/<repo>/release.yml` |
| Latest release version | `img.shields.io/github/v/release/<owner>/<repo>` |
| Release date | `img.shields.io/github/release-date/<owner>/<repo>` |
| Total downloads | `img.shields.io/github/downloads/<owner>/<repo>/total` |

### Repo Activity (5 badges minimum)

| Badge | Source |
|-------|--------|
| Last commit | `img.shields.io/github/last-commit/<owner>/<repo>/main` |
| Commit activity (monthly) | `img.shields.io/github/commit-activity/m/<owner>/<repo>` |
| Open issues | `img.shields.io/github/issues/<owner>/<repo>` |
| Open pull requests | `img.shields.io/github/issues-pr/<owner>/<repo>` |
| Repo size | `img.shields.io/github/repo-size/<owner>/<repo>` |

### Community (6 badges minimum)

| Badge | Source |
|-------|--------|
| Stars | `img.shields.io/github/stars/<owner>/<repo>` (color: yellow) |
| Forks | `img.shields.io/github/forks/<owner>/<repo>` |
| Watchers | `img.shields.io/github/watchers/<owner>/<repo>` |
| Contributors | `img.shields.io/github/contributors/<owner>/<repo>` |
| PRs Welcome | `img.shields.io/badge/PRs-welcome-brightgreen` linking to `./contributing.md` |
| Made with Love | `img.shields.io/badge/made%20with-%E2%99%A5-ff69b4` linking to the company site |

Discussions badge is optional but recommended when GitHub Discussions is enabled.

### Code-Quality Report Cards (3 badges minimum)

CodeFactor, Codacy, Code Climate (or equivalent). Placeholder "activate" badges are acceptable until OAuth onboarding is complete; document the activation steps in a callout immediately under the badge block.

### Stack & Standards (8 badges minimum)

Cover language, runtime, package manager, build tool, primary framework, styling, lint, and test runner — one badge each, all with `flat-square` style. Always include a license badge as the final entry, linking to the `#license` anchor.

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
