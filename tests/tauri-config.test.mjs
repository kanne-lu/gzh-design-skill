import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Tauri builds the Vite frontend as an NSIS installer', () => {
  const config = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url)))

  assert.equal(config.productName, '墨排 · gzh-design')
  assert.equal(config.build.beforeDevCommand, 'npm run dev')
  assert.equal(config.build.devUrl, 'http://localhost:5173')
  assert.equal(config.build.beforeBuildCommand, 'pnpm exec vite build')
  assert.equal(config.build.frontendDist, '../dist')
  assert.deepEqual(config.bundle.targets, ['nsis'])
})

test('release workflow publishes the NSIS installer for version tags', () => {
  const workflow = readFileSync(new URL('../.github/workflows/release-desktop.yml', import.meta.url), 'utf8')

  assert.match(workflow, /tags:\s*\[\s*['"]v\*['"]\s*\]/)
  assert.match(workflow, /contents:\s*write/)
  assert.match(workflow, /pnpm run desktop:build/)
  assert.match(workflow, /src-tauri\/target\/release\/bundle\/nsis\/\*\.exe/)
})
