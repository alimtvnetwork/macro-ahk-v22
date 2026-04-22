---
name: Root README Conventions
description: Root readme.md must be centered, icon-led, with five badge groups, and a structured Author + Company section
type: standard
---

The repository-root `readme.md` follows the mandatory structure defined in `spec/01-spec-authoring-guide/11-root-readme-conventions.md`:

- **Centered hero block:** entire top section wrapped in `<div align="center">` containing the 128×128 logo (`docs/assets/<project>-logo.png`), the H1 project title, the tagline blockquote, all badge groups, and the hero screenshot (width=820).
- **Five badge groups required**, each prefixed with an HTML comment label: Build & Release (≥5), Repo activity (≥5), Community (≥6), Code-quality report cards (≥3), Stack & standards (≥8). Minimum 27 badges total. Always `style=flat-square`.
- **Author section** (`## Author`): centered name (H3 linked to authoritative search URL) + role line `**[Primary Role](site)** | [Secondary Role](search), [Company](site)`, then a left-aligned biography paragraph (years of experience, stack with year counts, accolades, ≥2 reputation links), then a 2-column metadata table.
- **Company subsection** (`### <Company>`): tagline line first (verbatim from `mem://branding/author-identity`), then 2-column metadata table with Website + ≥2 social channels.
- **License section** (`## License`) closes the file, naming the owning legal entity.

Single H1 only. Logo + hero images live in `docs/assets/`. Company name spelling/casing must match `mem://branding/author-identity` exactly across README, About page, package.json, and license header.
