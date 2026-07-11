import assert from 'node:assert/strict'
import test from 'node:test'
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
