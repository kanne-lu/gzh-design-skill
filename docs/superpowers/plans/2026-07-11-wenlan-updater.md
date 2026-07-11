# Wenlan Updater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the desktop application to Wenlan, let users check the latest GitHub Release, and publish automatic Chinese release summaries.

**Architecture:** A Tauri command retrieves the latest Release from GitHub’s REST API. A small frontend update module compares versions and drives a header dialog; the official opener plugin opens the selected Release in the system browser. The release workflow renders Chinese Markdown from Conventional Commit subjects before creating the Release.

**Tech Stack:** React 18, TypeScript, Vitest, Tauri 2, Rust, reqwest, semver, GitHub Actions.

---

### Task 1: Generate Chinese Release Notes

**Files:**
- Create: `scripts/generate-release-notes.mjs`
- Create: `tests/release-notes.test.mjs`
- Modify: `.github/workflows/release-desktop.yml`

- [ ] **Step 1: Write the failing release-notes test**

Create `tests/release-notes.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { buildReleaseNotes } from '../scripts/generate-release-notes.mjs'

test('groups Conventional Commit subjects into Chinese release notes', () => {
  assert.equal(buildReleaseNotes(['feat: 添加在线检查更新', 'fix: 修复下载链接']), '## 本次更新\n\n### 新增\n- 添加在线检查更新\n\n### 修复\n- 修复下载链接\n')
})

test('uses a Chinese maintenance fallback when no subject is supplied', () => {
  assert.equal(buildReleaseNotes([]), '## 本次更新\n\n- 本次发布包含维护更新。\n')
})
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test tests/release-notes.test.mjs`

Expected: FAIL because `scripts/generate-release-notes.mjs` does not exist.

- [ ] **Step 3: Implement the generator**

Create `scripts/generate-release-notes.mjs` exporting `buildReleaseNotes(subjects)`. It must map `feat`, `fix`, `perf`, `refactor`, `docs`, `chore` to Chinese group titles `新增`, `修复`, `优化`, `优化`, `文档`, `维护`; strip the prefix and place unknown subjects in `维护`. When invoked directly, read the previous `v*` tag with `git tag --merged HEAD --sort=-version:refname`, collect `git log --format=%s <previous>..HEAD`, and write the Markdown to stdout.

- [ ] **Step 4: Verify the generator**

Run: `node --test tests/release-notes.test.mjs`

Expected: PASS with two passing subtests.

- [ ] **Step 5: Wire the generated Markdown into releases**

Before `softprops/action-gh-release@v2` in `.github/workflows/release-desktop.yml`, add:

```yaml
      - name: 生成中文更新说明
        run: node scripts/generate-release-notes.mjs > release-notes.md
```

Add `body_path: release-notes.md` under the action’s `with` block. Run `node --test tests/release-notes.test.mjs` again; it must stay green.

### Task 2: Add the GitHub update client and native browser handoff

**Files:**
- Create: `src/update.ts`
- Create: `tests/update.test.ts`
- Create: `src-tauri/src/update.rs`
- Modify: `src-tauri/src/main.rs`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/capabilities/default.json`
- Modify: `package.json`

- [ ] **Step 1: Write the failing version-state test**

Create `tests/update.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveUpdate } from '../src/update'

describe('resolveUpdate', () => {
  it('offers a newer GitHub release', () => expect(resolveUpdate('0.0.1', { tagName: 'v0.0.2', body: '## 本次更新', htmlUrl: 'https://example.test/v0.0.2' }).kind).toBe('available'))
  it('keeps the current version when GitHub is not newer', () => expect(resolveUpdate('0.0.1', { tagName: 'v0.0.1', body: '', htmlUrl: 'https://example.test/v0.0.1' }).kind).toBe('up-to-date'))
})
```

- [ ] **Step 2: Verify the test fails**

Run: `pnpm exec vitest run tests/update.test.ts`

Expected: FAIL because `src/update.ts` does not exist.

- [ ] **Step 3: Add the minimal update client**

Create `src/update.ts` with a `Release` type (`tagName`, `body`, `htmlUrl`), `resolveUpdate(currentVersion, release)` using numeric dot-separated comparison, and `checkForUpdate()` that calls `getVersion()` from `@tauri-apps/api/app` plus `invoke<Release>('latest_release')` from `@tauri-apps/api/core`. Return `{ kind: 'available' | 'up-to-date', currentVersion, release? }`.

Add `@tauri-apps/api` and `@tauri-apps/plugin-opener` to `dependencies` and run:

```bash
pnpm add @tauri-apps/api@^2 @tauri-apps/plugin-opener@^2
```

- [ ] **Step 4: Add the Tauri command and external opener**

Create `src-tauri/src/update.rs` with a serde-deserializable GitHub response type containing `tag_name`, `body`, and `html_url`; implement async command `latest_release()` using `reqwest` with header `User-Agent: Wenlan`, endpoint `https://api.github.com/repos/kanne-lu/gzh-design-skill/releases/latest`, `error_for_status()`, and a mapped Chinese error string `暂时无法检查更新`.

In `src-tauri/Cargo.toml`, add `reqwest` with `json` and `rustls-tls`, `serde` with `derive`, and `tauri-plugin-opener = "2"`. In `main.rs`, add `mod update;`, `.plugin(tauri_plugin_opener::init())`, and `.invoke_handler(tauri::generate_handler![update::latest_release])`. Add `opener:default` to `src-tauri/capabilities/default.json`.

- [ ] **Step 5: Verify client behavior and Rust compilation**

Run:

```bash
pnpm exec vitest run tests/update.test.ts
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: both commands pass.

### Task 3: Present the update dialog and rename the product

**Files:**
- Create: `src/components/UpdateDialog.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `README.md`

- [ ] **Step 1: Write the failing dialog test**

Create `tests/update-dialog.test.tsx` using Vitest to render `UpdateDialog` with `{ kind: 'available', currentVersion: '0.0.1', release: { tagName: 'v0.0.2', body: '## 本次更新', htmlUrl: 'https://example.test' } }` and assert that `v0.0.2` and `前往下载` are visible.

- [ ] **Step 2: Verify the test fails**

Run: `pnpm exec vitest run tests/update-dialog.test.tsx`

Expected: FAIL because `UpdateDialog` does not exist.

- [ ] **Step 3: Implement the focused UI**

Add a `RefreshCw` “检查更新” button to `Header`, passing `onCheckUpdate` and `checkingUpdate` from `App`. Add `UpdateDialog` as a modal that renders loading, error, up-to-date, and available states. For an available release, render the Markdown body as plain pre-wrapped text and call `openUrl(release.htmlUrl)` from `@tauri-apps/plugin-opener` when “前往下载” is clicked. Keep the dialog dismissible with “关闭”.

Change all visible product-brand strings and `src-tauri/tauri.conf.json` `productName`/window title to `Wenlan · 公众号排版`; update the README title accordingly. Add only the CSS needed for the header update button and modal.

- [ ] **Step 4: Verify the complete desktop path**

Run:

```bash
node --test tests/release-notes.test.mjs
pnpm exec vitest run tests/update.test.ts tests/update-dialog.test.tsx
node --test tests/tauri-config.test.mjs
pnpm run desktop:build
```

Expected: all targeted tests pass and `src-tauri/target/release/bundle/nsis/` contains `Wenlan · 公众号排版_0.0.1_x64-setup.exe`.
