# Tauri Desktop Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows NSIS installer for the existing editor and automatically publish it to GitHub Releases when a `v*` tag is pushed.

**Architecture:** Keep the React/Vite application unchanged and host its development server or production `dist/` assets in a Tauri window. Tauri owns local packaging; a GitHub Actions workflow builds the installer on `windows-latest` and attaches it to the tag’s Release.

**Tech Stack:** React 18, Vite 6, TypeScript, Tauri 2, Rust, GitHub Actions, GitHub Releases.

---

## File structure

- Create: `tests/tauri-config.test.mjs` — verifies the desktop bundle contract without launching a GUI.
- Modify: `package.json` — adds Tauri packages and desktop scripts.
- Create: `src-tauri/Cargo.toml` — Rust package and Tauri dependencies.
- Create: `src-tauri/build.rs` — generates the Tauri build context.
- Create: `src-tauri/src/main.rs` — starts the native application window.
- Create: `src-tauri/capabilities/default.json` — grants the default desktop capability to the main window.
- Create: `src-tauri/tauri.conf.json` — connects Tauri to Vite and selects NSIS bundling.
- Create: `src-tauri/icons/app-icon.svg` — source icon derived from the current leaf favicon.
- Create: `src-tauri/icons/icon.ico` — Windows bundle icon generated from `app-icon.svg`.
- Create: `.github/workflows/release-desktop.yml` — publishes the NSIS executable for version tags.

### Task 1: Define and test the desktop bundle contract

**Files:**
- Create: `tests/tauri-config.test.mjs`
- Create: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Write the failing configuration test**

Create `tests/tauri-config.test.mjs` with:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Tauri builds the Vite frontend as an NSIS installer', () => {
  const config = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url)))

  assert.equal(config.productName, '墨排 · gzh-design')
  assert.equal(config.build.beforeDevCommand, 'npm run dev')
  assert.equal(config.build.devUrl, 'http://localhost:5173')
  assert.equal(config.build.beforeBuildCommand, 'npm run build')
  assert.equal(config.build.frontendDist, '../dist')
  assert.deepEqual(config.bundle.targets, ['nsis'])
})
```

- [ ] **Step 2: Run the test and verify it fails for the missing configuration**

Run: `node --test tests/tauri-config.test.mjs`

Expected: FAIL with `ENOENT` for `src-tauri/tauri.conf.json`.

- [ ] **Step 3: Add the minimal Tauri configuration**

Create `src-tauri/tauri.conf.json` with:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "墨排 · gzh-design",
  "version": "0.1.0",
  "identifier": "com.mopai.gzhdesign",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "墨排 · gzh-design",
        "width": 1440,
        "height": 900,
        "minWidth": 1024,
        "minHeight": 700
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "icon": ["icons/icon.ico"]
  }
}
```

- [ ] **Step 4: Run the configuration test and verify it passes**

Run: `node --test tests/tauri-config.test.mjs`

Expected: PASS with one passing subtest.

### Task 2: Add the native Tauri host and local commands

**Files:**
- Modify: `package.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/icons/app-icon.svg`
- Create: `src-tauri/icons/icon.ico`

- [ ] **Step 1: Add the desktop toolchain and scripts to `package.json`**

Add these development dependencies and scripts, leaving existing entries unchanged:

```json
{
  "scripts": {
    "desktop:dev": "tauri dev",
    "desktop:build": "tauri build"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.11.4"
  }
}
```

Run: `npm install -D @tauri-apps/api@^2.11.1 @tauri-apps/cli@^2.11.4`

Expected: `package.json` and `package-lock.json` include both packages.

- [ ] **Step 2: Add the Rust entry point and capability**

Create `src-tauri/Cargo.toml`:

```toml
[package]
name = "mopai-gzh-editor"
version = "0.1.0"
description = "Markdown visual layout editor"
authors = ["Mopai"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
```

Create `src-tauri/build.rs`:

```rust
fn main() {
    tauri_build::build()
}
```

Create `src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Tauri application")
}
```

Create `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Allows the main window to use Tauri core APIs.",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

- [ ] **Step 3: Generate the Windows icon from the source SVG**

Create `src-tauri/icons/app-icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#e7f1e8"/><path d="M45 14C28 17 18 27 17 45c13 0 24-9 28-31Z" fill="none" stroke="#355e42" stroke-width="4" stroke-linecap="round"/><path d="M17 49c5-10 12-17 23-24" fill="none" stroke="#355e42" stroke-width="4" stroke-linecap="round"/></svg>
```

Run: `npx tauri icon src-tauri/icons/app-icon.svg --output src-tauri/icons`

Expected: `src-tauri/icons/icon.ico` exists and is referenced by `tauri.conf.json`.

- [ ] **Step 4: Verify the local build completes**

Run: `npm run typecheck; npm run desktop:build`

Expected: TypeScript succeeds and an NSIS executable is created under `src-tauri/target/release/bundle/nsis/`.

### Task 3: Automatically publish tagged Windows installers

**Files:**
- Create: `.github/workflows/release-desktop.yml`
- Test: `tests/tauri-config.test.mjs`

- [ ] **Step 1: Extend the failing contract test for the release workflow**

Append this test to `tests/tauri-config.test.mjs`:

```js
test('release workflow publishes the NSIS installer for version tags', () => {
  const workflow = readFileSync(new URL('../.github/workflows/release-desktop.yml', import.meta.url), 'utf8')

  assert.match(workflow, /tags:\s*\[\s*['"]v\*['"]\s*\]/)
  assert.match(workflow, /contents:\s*write/)
  assert.match(workflow, /npm run desktop:build/)
  assert.match(workflow, /src-tauri\/target\/release\/bundle\/nsis\/\*\.exe/)
})
```

- [ ] **Step 2: Run the test and verify it fails for the missing workflow**

Run: `node --test tests/tauri-config.test.mjs`

Expected: FAIL with `ENOENT` for `.github/workflows/release-desktop.yml` while the Tauri configuration test remains passing.

- [ ] **Step 3: Add the GitHub Release workflow**

Create `.github/workflows/release-desktop.yml` with:

```yaml
name: Release desktop installer

on:
  push:
    tags: ["v*"]

permissions:
  contents: write

jobs:
  publish:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - uses: dtolnay/rust-toolchain@stable

      - run: npm ci
      - run: npm run desktop:build

      - uses: softprops/action-gh-release@v2
        with:
          files: src-tauri/target/release/bundle/nsis/*.exe
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 4: Run the contract tests and verify the workflow content**

Run: `node --test tests/tauri-config.test.mjs`

Expected: PASS with two passing subtests.

- [ ] **Step 5: Perform final local verification**

Run: `npm run typecheck; node --test tests/tauri-config.test.mjs; npm run desktop:build`

Expected: all commands exit with code `0`; the installer exists under `src-tauri/target/release/bundle/nsis/`.

### Task 4: Release the next version

**Files:**
- Modify: `package.json`
- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Keep both version declarations identical**

For every release, update both version values to the same semantic version before tagging. For example, set `package.json` and `src-tauri/tauri.conf.json` to `0.1.1`.

- [ ] **Step 2: Push the release tag**

Run:

```powershell
git tag v0.1.1
git push origin v0.1.1
```

Expected: the `Release desktop installer` workflow runs on GitHub and creates the `v0.1.1` Release with the NSIS `.exe` attached.
