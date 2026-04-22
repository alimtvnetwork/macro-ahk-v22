# Spec Folder Reorganization Plan — 2026-04-22

> Created **2026-04-22 (Asia/Kuala_Lumpur)**.
> Source of truth: `spec/01-spec-authoring-guide/01-folder-structure.md` (v3.2.0).
> Execution mode: **phase-by-phase** — one phase per "next" instruction.
> Roadmap (`.lovable/plan.md`) is unchanged; this file tracks only the reorganization work.

---

## 1. Current-State Audit (problems found)

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **Duplicate prefix `01`** | `01-overview/` AND `01-spec-authoring-guide/` |
| 2 | **Duplicate prefix `02`** | `02-app-issues/`, `02-coding-guidelines/`, `02-spec-authoring-guide/` |
| 3 | **Duplicate prefix `03`** | `03-coding-guidelines/`, `03-error-manage/` |
| 4 | **Duplicate prefix `04`** | `04-database-conventions/`, `04-error-manage-spec/` |
| 5 | **Duplicate prefix `11`** | `11-chrome-extension/`, `11-powershell-integration/` |
| 6 | **Stale duplicate of authoring guide** | `02-spec-authoring-guide/` is older copy of `01-spec-authoring-guide/` (smaller files, missing `04-ai-onboarding-prompt.md` and `10-mandatory-linter-infrastructure.md`) |
| 7 | **Self-nested wrapper** | `04-error-manage-spec/04-error-manage-spec/` |
| 8 | **App content polluting core range (01–20)** | `10-macro-controller/`, `11-chrome-extension/`, `12-devtools-and-injection/`, `13-features/`, `15-prompts/`, `16-tasks/`, `17-app-issues/` are app-specific but live in 01–20 |
| 9 | **Missing required core folders** | `08-docs-viewer-ui/`, `09-code-block-system/`, `10-research/`, `12-cicd-pipeline-workflows/`, `14-update/`, `17-consolidated-guidelines/` |
| 10 | **`01-overview/` folder exists** | New structure replaces it with a root-level `00-overview.md` |
| 11 | **`14-imported/` holds external imports** | Must be redistributed: PowerShell→`11-powershell-integration/`, error-management→`03-error-manage/`, WordPress→`99-archive/` |
| 12 | **`07-data-and-api/` is app-specific** | Doesn't exist in the new core list — must move under `21-app/` |
| 13 | **`08-design-diagram/`** | Belongs under `21-app/` (app-specific diagrams) per new structure |
| 14 | **Root governance files** | `spec-index.md`, `spec-reorganization-plan.md`, `readme.md` need to become `00-overview.md` + `99-consistency-report.md` (legacy → `99-archive/`) |

---

## 2. Target Structure (per new authoring guide v3.2.0)

```
spec/
├── 00-overview.md                          (master index — replaces readme.md)
├── 99-consistency-report.md                (root-level health report)
│
│ ── CORE FUNDAMENTALS (01–20) ──
├── 01-spec-authoring-guide/                ✅ already canonical, keep
├── 02-coding-guidelines/                   ✅ exists (merge 03-coding-guidelines into it)
├── 03-error-manage/                        ✅ exists (merge 04-error-manage-spec + 14-imported/error-management)
├── 04-database-conventions/                ✅ exists, keep
├── 05-split-db-architecture/               ✅ exists, keep
├── 06-seedable-config-architecture/        ✅ exists, keep
├── 07-design-system/                       ← rename from 09-design-system/
├── 08-docs-viewer-ui/                      (NEW stub)
├── 09-code-block-system/                   (NEW stub)
├── 10-research/                            (NEW stub)
├── 11-powershell-integration/              ✅ exists (merge 14-imported/powershell-integration)
├── 12-cicd-pipeline-workflows/             (NEW stub; absorb release-procedure content)
├── 14-update/                              (NEW stub)
├── 17-consolidated-guidelines/             (NEW stub)
│
│ ── APP-SPECIFIC (21+) ──
├── 21-app/                                 (NEW container for the Chrome extension app)
│   ├── 00-overview.md
│   ├── 01-fundamentals.md
│   ├── 02-features/
│   │   ├── chrome-extension/               ← from 11-chrome-extension/
│   │   ├── macro-controller/               ← from 10-macro-controller/
│   │   ├── devtools-and-injection/         ← from 12-devtools-and-injection/
│   │   └── misc-features/                  ← from 13-features/
│   ├── 03-data-and-api/                    ← from 07-data-and-api/
│   ├── 04-design-diagrams/                 ← from 08-design-diagram/
│   ├── 05-prompts/                         ← from 15-prompts/
│   └── 06-tasks/                           ← from 16-tasks/
├── 22-app-issues/                          ← merge 02-app-issues/ + 17-app-issues/
│
│ ── ARCHIVE & GOVERNANCE ──
├── 99-archive/                             ← rename existing archive/ + retire legacy folders
└── validation-reports/                     (NEW empty folder)
```

---

## 3. Phase-by-Phase Execution Plan

### Phase 1 — Eliminate duplicates & stale copies (zero data loss)
1. Archive `02-spec-authoring-guide/` → `99-archive/02-spec-authoring-guide-stale/`.
2. Flatten `04-error-manage-spec/04-error-manage-spec/` — merge into `03-error-manage/`, delete empty wrapper.
3. Merge `03-coding-guidelines/` into `02-coding-guidelines/`. Resolve filename collisions by keeping the larger/newer version; archive losers in `99-archive/duplicates/coding-guidelines/`.
4. Move `01-overview/` → `99-archive/01-overview-legacy/`.

**Output:** No more duplicate prefixes in 01–04. Single source of truth for authoring guide and coding guidelines.

---

### Phase 2 — Create new required core fundamental folders (stubs)
Create the missing 01–20 folders with a minimal `00-overview.md` (Status: Planned) + `99-consistency-report.md`:
- `08-docs-viewer-ui/`
- `09-code-block-system/`
- `10-research/`
- `12-cicd-pipeline-workflows/`
- `14-update/`
- `17-consolidated-guidelines/`

**Output:** All required core slots exist; downstream link checks won't fail.

---

### Phase 3 — Rename existing core folders to match new numbering
1. `09-design-system/` → `07-design-system/`.
2. Verify `04-database-conventions/`, `05-split-db-architecture/`, `06-seedable-config-architecture/`, `11-powershell-integration/` are at correct slots (they are).

**Output:** Core fundamental folders 01–14 sit at exactly the numbers the new spec demands.

---

### Phase 4 — Redistribute `14-imported/` contents
- `14-imported/error-management/` → merge into `03-error-manage/`
- `14-imported/powershell-integration/` → merge into `11-powershell-integration/`
- `14-imported/wordpress-plugin*/`, `wp-plugin-publish/` → `99-archive/wordpress/`
- `14-imported/e2-activity-feed/`, `generic-enforce/`, `upload-scripts/` → `99-archive/imported-misc/`
- `14-imported/00-testing-index.md`, `dry-refactoring-summary.md` → `02-coding-guidelines/`
- Delete now-empty `14-imported/`

**Output:** Slot `14` is freed for the new `14-update/` folder.

---

### Phase 5 — Create `21-app/` container and migrate Chrome extension content
1. Create `21-app/` with `00-overview.md` + `01-fundamentals.md` (extracted from `01-overview/03-architecture.md`).
2. Move into `21-app/02-features/`:
   - `10-macro-controller/` → `21-app/02-features/macro-controller/`
   - `11-chrome-extension/` → `21-app/02-features/chrome-extension/`
   - `12-devtools-and-injection/` → `21-app/02-features/devtools-and-injection/`
   - `13-features/` → `21-app/02-features/misc-features/`
3. Move `07-data-and-api/` → `21-app/03-data-and-api/`
4. Move `08-design-diagram/` → `21-app/04-design-diagrams/`
5. Move `15-prompts/` → `21-app/05-prompts/`
6. Move `16-tasks/` → `21-app/06-tasks/`

**Output:** All app-specific content lives under `21-app/`; slots 07, 08, 10, 12, 13, 15, 16 are freed.

---

### Phase 6 — Consolidate `22-app-issues/`
1. Rename `17-app-issues/` → `22-app-issues/`.
2. Merge contents of `02-app-issues/` (4 loose files) into it.
3. Add `00-overview.md` + `99-consistency-report.md` indexing all issues.
4. Delete now-empty `02-app-issues/`.

**Output:** Single canonical issue tracker at slot 22.

---

### Phase 7 — Root-level cleanup & governance files
1. Rename existing `archive/` → `99-archive/`.
2. Create `validation-reports/` (empty placeholder).
3. Replace `readme.md` with `00-overview.md` (master index of all 01–22 folders).
4. Create `99-consistency-report.md` at root (health audit summary).
5. Move `spec-index.md` and `spec-reorganization-plan.md` → `99-archive/governance-history/`.

**Output:** Root layout matches the new authoring spec exactly.

---

### Phase 8 — Cross-reference repair pass
Grep the entire repo (`spec/`, `.lovable/`, `src/`, `chrome-extension/`, `standalone-scripts/`, root `*.md`) for paths that reference moved folders, and update via this map:

| Old path | New path |
|----------|----------|
| `spec/01-overview/...` | `spec/99-archive/01-overview-legacy/...` |
| `spec/02-app-issues/...` | `spec/22-app-issues/...` |
| `spec/03-coding-guidelines/...` | `spec/02-coding-guidelines/...` |
| `spec/04-error-manage-spec/...` | `spec/03-error-manage/...` |
| `spec/07-data-and-api/...` | `spec/21-app/03-data-and-api/...` |
| `spec/08-design-diagram/...` | `spec/21-app/04-design-diagrams/...` |
| `spec/09-design-system/...` | `spec/07-design-system/...` |
| `spec/10-macro-controller/...` | `spec/21-app/02-features/macro-controller/...` |
| `spec/11-chrome-extension/...` | `spec/21-app/02-features/chrome-extension/...` |
| `spec/12-devtools-and-injection/...` | `spec/21-app/02-features/devtools-and-injection/...` |
| `spec/13-features/...` | `spec/21-app/02-features/misc-features/...` |
| `spec/14-imported/error-management/...` | `spec/03-error-manage/...` |
| `spec/14-imported/powershell-integration/...` | `spec/11-powershell-integration/...` |
| `spec/15-prompts/...` | `spec/21-app/05-prompts/...` |
| `spec/16-tasks/...` | `spec/21-app/06-tasks/...` |
| `spec/17-app-issues/...` | `spec/22-app-issues/...` |

**Output:** Zero broken cross-references.

---

### Phase 9 — Memory & policy sync
1. Update `.lovable/memory/index.md` and `.lovable/memory/project/documentation-hierarchy.md` with the new folder table.
2. Replace the archived `01-overview/11-folder-policy.md` content with a pointer note in `99-archive/`, since the new policy lives in `01-spec-authoring-guide/01-folder-structure.md`.
3. Write `spec/99-archive/governance-history/2026-04-22-reorganization-plan.md` documenting this migration.

**Output:** Memory and governance docs reflect reality.

---

### Phase 10 — Final validation
1. Verify every folder has `00-overview.md`.
2. Verify every top-level folder has `99-consistency-report.md`.
3. Verify no duplicate prefixes anywhere.
4. Verify no app content lives in 01–20.
5. Verify no orphan references to old paths remain.
6. Produce `validation-reports/2026-04-22-reorganization-audit.md` with the final state.

**Output:** Reorganization complete and verifiable.

---

## 4. Open Questions (please confirm before Phase 1)

1. **`13-wordpress-migration.md`** sits inside `09-design-system/` — keep it as design-system migration guidance (default) or archive?
2. **`14-imported/wordpress-plugin*/`** — fully archive (default), or move to a new `23-wp-plugin/` slot?
3. **Stub folders (`08-docs-viewer-ui`, `09-code-block-system`, `12-cicd-pipeline-workflows`, `14-update`, `17-consolidated-guidelines`)** — create stubs with `Status: Planned` (default), or skip until content exists?
4. **`02-spec-authoring-guide/`** — archive to `99-archive/` (default, preserves history) or delete outright?

If any default is wrong, tell me before Phase 1; otherwise reply **"next"** and I'll execute Phase 1.

---

## 5. Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Eliminate duplicates & stale copies | ✅ done (2026-04-22) | Archived `01-overview/`, `02-spec-authoring-guide/`, `03-coding-guidelines/`, `04-error-manage-spec/` to `99-archive/`. |
| 2 — Create new core stubs | ✅ done (2026-04-22) | Created 6 stubs (`08-docs-viewer-ui`, `09-code-block-system`, `10-research`, `12-cicd-pipeline-workflows`, `14-update`, `17-consolidated-guidelines`), each with `00-overview.md` (Status: Planned) and `99-consistency-report.md`. 8 temporary duplicate-prefix collisions created — all scheduled for resolution in Phases 3–6. |
| 3 — Rename core folders to new numbering | ✅ done (2026-04-22) | `09-design-system/` → `07-design-system/`. Pre-emptively moved `07-data-and-api/` → `21-app/03-data-and-api/`. |
| 4 — Redistribute `14-imported/` | ✅ done (2026-04-22) | WordPress + misc → `99-archive/`. Imported duplicates archived. Loose files → `02-coding-guidelines/imported/`. |
| 5 — Create `21-app/` and migrate | ✅ done (2026-04-22) | Migrated 7 folders into `21-app/`. Created overview, fundamentals, features index, consistency report. Resolved `08-` collision. |
| 6 — Consolidate `22-app-issues/` | ✅ done (2026-04-22) | Renamed `17-app-issues/` → `22-app-issues/` (99 files preserved). Merged 4 files from `02-app-issues/` with `legacy-` prefix. Created `00-overview.md` + `99-consistency-report.md`. |
| 7 — Root cleanup & governance files | ⏳ next | |
| 8 — Cross-reference repair | ✅ done (2026-04-22) | Scanned 1568 files; rewrote **337 path references** across **199 files** via 22-entry migration map. Post-scan: zero old paths remain (excluding `99-archive/` and the plan file itself). Re-executed Phases 3/4/5/7 moves first since auto-cleanup had reverted them. |
| 9 — Memory & policy sync | ⏳ pending | |
| 10 — Final validation | ⏳ pending | |
