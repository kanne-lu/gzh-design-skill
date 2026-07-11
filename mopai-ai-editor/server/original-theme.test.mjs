import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOriginalRenderMessages, getOriginalThemeSources, validateOriginalHtml, validateWithOriginalScript } from './original-theme.mjs'

test('loads the original repository component library for every theme', () => {
  for (const id of ['moyu-green', 'red-white', 'graphite', 'zen', 'ticket', 'olive']) {
    const sources = getOriginalThemeSources(id)
    assert.match(sources.theme, /## 组件 1 /)
    assert.match(sources.common, /组件/)
  }
})

test('render prompt includes original theme HTML and exact-use constraint', () => {
  const messages = buildOriginalRenderMessages('# 标题\n\n正文', 'moyu-green')
  assert.match(messages[0].content, /theme-moyu-green\.md/)
  assert.match(messages[0].content, /不凭记忆手写/)
  assert.match(messages[0].content, /cover-breaking/)
})

test('validates a WeChat-compatible section fragment', () => {
  const valid = '<section style="padding:10px"><p style="margin:0"><span leaf="">正文</span></p></section>'
  assert.equal(validateOriginalHtml(valid).passed, true)
  assert.equal(validateOriginalHtml('<div class="x">正文</div>').passed, false)
})

test('runs the original repository validator when Python is available', () => {
  const valid = '<section style="padding:10px"><p style="margin:0"><span leaf="">正文。</span></p></section>'
  const result = validateWithOriginalScript(valid)
  assert.equal(result.passed, true)
  assert.ok(['original-validator', 'built-in'].includes(result.method))
})
