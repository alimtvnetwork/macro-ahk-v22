# Roadmap — Marco / Macro Controller

> Single source of truth for the project roadmap. Suggestions live in `.lovable/suggestions.md`. Pending issues in `.lovable/pending-issues/`.

---

## 🔄 In Progress

_Nothing currently in progress — last session closed v2.169.0._

---

## ⏳ Pending — Next Up

| # | Item | Priority | Reference |
|---|---|---|---|
| 1 | ✅ ~~Vitest coverage for `assertBindable` + `BindError`~~ — completed 2026-04-22 (`src/test/regression/sqlite-bind-safety.test.ts`, 20 tests, full suite 293 tests passing) | — | — |
| 2 | Vitest regression suite for handler-guards (missing-field payloads → clean `{ isOk:false }`) | Medium | `.lovable/suggestions.md` |
| 3 | Surface latest sdkSelfTest + kv/files/gkv round-trip results in popup (✅/❌ + last-run timestamp) | Medium | `.lovable/suggestions.md` |

---

## ⏳ Pending — Carried Over

| # | Item | Reference | Priority | Blocker |
|---|---|---|---|---|
| C1 | E2E Verification — React UI (Step 10) | `.lovable/pending-issues/02-e2e-verification-react-ui.md` | High | Manual Chrome testing |
| C2 | Prompt Click E2E Verification (Issues 52/53) | `.lovable/pending-issues/05-future-pending-work.md` | Medium | Manual Chrome testing |
| C3 | React Component Tests (target 900+) | S-021 | Medium | None — ready |
| C4 | P Store Marketplace | `spec/05-chrome-extension/82-pstore-project-store/` | High | Owner spec pending |
| C5 | Cross-Project Sync & Shared Library | `spec/08-features/cross-project-sync.md` | Medium | After P Store |
| C6 | TS Migration V2 — Phase 02 Class Architecture | S-046 | High | After Phase 01 (done) |
| C7 | TS Migration V2 — Phase 03 React Feasibility | S-051 | Medium | After modularization |
| C8 | TS Migration V2 — Phase 04 Performance & Logging | S-047 | High | None |
| C9 | TS Migration V2 — Phase 05 JSON Config Pipeline | S-048 | Medium | None |

---

## ✅ Completed

### Session 2026-04-20 — v2.162.0 → v2.167.0

| Task | Result |
|---|---|
| SDK runtime self-test for `Projects.RiseupMacroSdk` (sync — namespace, meta, shape, kv.list Promise) | ✅ v2.161.0 / hardened later |
| Spec 11/63 + developer-guide updated for `RiseupMacroSdk` self-namespace | ✅ |
| Build-time check: scan `spec/**.md` for relative links, fail on missing targets | ✅ |
| Fix `MESSAGE-ROUTER_ERROR` "tried to bind a value of an unknown type (undefined)" | ✅ v2.162.0 (kv-handler) → v2.163.0 (logging handlers) |
| Audit all SQLite-backed handlers — adopt `handler-guards.ts` (`requireProjectId`/`requireKey`/`bindOpt`/`bindReq`) across kv, gkv, file-storage, project-api, logging, user-script-log, error | ✅ v2.164.0 |
| Global Proxy net `wrapDatabaseWithBindSafety` + typed `BindError` (param idx + column name + SQL preview) wired at `db-manager` and `project-db-manager` | ✅ v2.165.0 |
| Extend SDK self-test with KV round-trip (set → get → verify-equals → delete → verify-cleared) | ✅ v2.166.0 |
| Audit prompt/library/settings/project/project-config/script-config/updater/run-stats — adopt handler-guards (4 of 8 had no SQLite surface; 3 hardened: prompt-handler, library-handler, updater-handler; project-config already guarded) | ✅ v2.167.0 |
| Hook `BindError` into Errors panel reporter — message-router special-cases `BindError` and routes through `logBgError(SQLITE_BIND_ERROR)` with column + SQL preview as `context` | ✅ v2.168.0 |
| Extend SDK self-test round-trip to FILES (save→list-includes→read→delete→list-excludes) and GKV (set→get→delete→get-cleared) — three independent PASS/FAIL lines so a backend break on one surface never masks the others | ✅ v2.169.0 |

### Earlier Milestones (preserved)

#### Error Logging & Type Safety — ✅

**Spec**: `spec/21-app/02-features/macro-controller/ts-migration-v2/08-error-logging-and-type-safety.md`

| Task | Description | Status |
|------|-------------|--------|
| T1 | Create `NamespaceLogger` class in SDK | ✅ |
| T2 | Update `globals.d.ts` with full namespace + Logger types | ✅ |
| T3 | Fix all 16 swallowed errors (S1–S16) | ✅ |
| T4 | Eliminate all `any` types (5 files) | ✅ |
| T5 | Migrate controller `log(msg, 'error')` calls to `Logger.error()` | ✅ |
| T6 | Verify: `tsc --noEmit` passes, ESLint zero errors | ✅ |

#### Constants Enum Reorganization — ✅

Grouped 85+ constants into 8 string enums in `types/`: `DomId`, `DataAttr`, `StyleId`, `StorageKey`, `ApiPath`, `PromptCacheKey`, `Label`, `CssFragment`. 317 enum references across 56 files.

#### Rename Preset Persistence — ✅

**Spec**: `spec/21-app/02-features/macro-controller/ts-migration-v2/07-rename-persistence-indexeddb.md`

| Task | Description | Status |
|------|-------------|--------|
| 1 | Generic `ProjectKvStore` module (IndexedDB) | ✅ `project-kv-store.ts` |
| 2 | `RenamePresetStore` module | ✅ `rename-preset-store.ts` |
| 3 | `buildPresetRow()` UI helper | ✅ `bulk-rename-fields.ts` |
| 4 | Persistence integration in `bulk-rename.ts` | ✅ |
| 5 | Barrel exports updated | ✅ `workspace-rename.ts` |
| 6 | Version bump | ✅ Subsumed by ongoing version policy |
