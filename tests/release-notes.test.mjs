import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildReleaseNotes } from '../scripts/generate-release-notes.mjs'

test('groups Conventional Commit subjects into Chinese release notes', () => {
  assert.equal(
    buildReleaseNotes([
      'feat: 添加在线检查更新',
      'fix: 修复下载链接',
      'perf: 加快启动速度',
      'refactor: 整理更新模块',
      'docs: 补充发布说明',
      'chore: 更新依赖',
      '调整发布流程',
    ]),
    '## 本次更新\n\n### 新增\n- 添加在线检查更新\n\n### 修复\n- 修复下载链接\n\n### 优化\n- 加快启动速度\n- 整理更新模块\n\n### 文档\n- 补充发布说明\n\n### 维护\n- 更新依赖\n- 调整发布流程\n',
  )
})

test('uses a Chinese maintenance fallback when no subject is supplied', () => {
  assert.equal(buildReleaseNotes([]), '## 本次更新\n\n- 本次发布包含维护更新。\n')
})

test('uses the preceding annotated tag when the CLI runs without GITHUB_REF_NAME', () => {
  const repo = mkdtempSync(join(tmpdir(), 'wenlan-release-notes-'))
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
  const environment = { ...process.env }
  delete environment.GITHUB_REF_NAME

  try {
    git('init')
    git('config', 'user.name', 'Wenlan Test')
    git('config', 'user.email', 'wenlan@example.test')
    writeFileSync(join(repo, 'release.txt'), 'first release')
    git('add', '.')
    git('commit', '-m', 'feat: 初始版本')
    git('tag', '-a', 'v0.0.1', '-m', 'v0.0.1')
    writeFileSync(join(repo, 'release.txt'), 'repair')
    git('commit', '-am', 'fix: 修复下载链接')
    git('tag', '-a', 'v0.0.2', '-m', 'v0.0.2')

    const output = execFileSync(
      process.execPath,
      [fileURLToPath(new URL('../scripts/generate-release-notes.mjs', import.meta.url))],
      { cwd: repo, encoding: 'utf8', env: environment },
    )

    assert.match(output, /### 修复\n- 修复下载链接/)
  } finally {
    rmSync(repo, { force: true, recursive: true })
  }
})
