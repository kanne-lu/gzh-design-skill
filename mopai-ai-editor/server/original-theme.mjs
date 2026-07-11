import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vendorRoot = path.join(root, 'vendor', 'gzh-design-skill')

const themeFiles = {
  'moyu-green': 'theme-moyu-green.md',
  'red-white': 'theme-red-white.md',
  graphite: 'theme-graphite-minimal.md',
  zen: 'theme-zen-whitespace.md',
  ticket: 'theme-moyu-ticket.md',
  olive: 'theme-olive-journal.md',
}

const readUtf8 = (file) => fs.readFileSync(file, 'utf8')

export function getOriginalThemeSources(themeId) {
  const file = themeFiles[themeId]
  if (!file) throw new Error('UNKNOWN_THEME')
  return {
    skill: readUtf8(path.join(vendorRoot, 'SKILL.md')),
    theme: readUtf8(path.join(vendorRoot, 'references', file)),
    common: readUtf8(path.join(vendorRoot, 'references', 'common-components.md')),
    sourceFile: file,
  }
}

export function buildOriginalRenderMessages(articleMarkdown, themeId) {
  const sources = getOriginalThemeSources(themeId)
  return [
    {
      role: 'system',
      content: `你是 gzh-design-skill 的 HTML 装配阶段。必须严格遵守下面的原始 SKILL 与组件库：
1. 具体 HTML 必须从所选主题组件库或公共组件库中取用，不凭记忆手写，不发明近似组件。
2. 按主题文件中的“完整文章模板骨架”和“Markdown 映射规则”装配。
3. 一篇文章只用当前主题，不跨主题混用。
4. 输出必须是可粘贴到微信公众号的纯 <section> 正文片段，不得包含 Markdown 围栏、解释、DOCTYPE、html、head、body、style、script、div、class 或 id。
5. 所有样式内联，并遵守 <span leaf=""> 包装规则。
6. 保留文章事实与观点，不擅自增加数据来源。

以下是原始 SKILL.md：
---
${sources.skill}
---

以下是所选主题原始组件库 ${sources.sourceFile}：
---
${sources.theme}
---

以下是原始公共组件库 common-components.md：
---
${sources.common}
---`,
    },
    { role: 'user', content: `请用上述原始组件装配这篇 Markdown 文章，只输出最终 HTML：\n\n${articleMarkdown}` },
  ]
}

export function cleanGeneratedHtml(content) {
  return String(content || '').trim()
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function validateOriginalHtml(content) {
  const html = cleanGeneratedHtml(content)
  const errors = []
  if (!/^<section\b/i.test(html) || !/<\/section>\s*$/i.test(html)) errors.push('输出不是完整的 section 正文片段')
  if (/<\/?(?:html|head|body|style|script|div)\b/i.test(html)) errors.push('包含平台禁用标签')
  if (/\s(?:class|id)\s*=/i.test(html)) errors.push('包含平台禁用属性')
  if (/(?:position\s*:\s*(?:fixed|absolute|sticky)|display\s*:\s*grid|@media|@keyframes|var\s*\()/i.test(html)) errors.push('包含平台禁用样式')
  if (!/<span\s+leaf=(?:""|'')/i.test(html)) errors.push('缺少 span leaf 文本包装')
  return { html, errors, passed: errors.length === 0 }
}

export function validateWithOriginalScript(content) {
  const basic = validateOriginalHtml(content)
  if (!basic.passed) return { ...basic, method: 'built-in' }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mopai-gzh-'))
  const htmlPath = path.join(tempDir, 'article.html')
  const validator = path.join(vendorRoot, 'scripts', 'validate_gzh_html.py')
  fs.writeFileSync(htmlPath, basic.html, 'utf8')
  try {
    for (const command of ['python', 'python3']) {
      const result = spawnSync(command, [validator, htmlPath], {
        encoding: 'utf8',
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
      if (result.error?.code === 'ENOENT') continue
      const output = `${result.stdout || ''}${result.stderr || ''}`.trim()
      if (result.status === 0) return { ...basic, method: 'original-validator', output }
      return { html: basic.html, passed: false, errors: [output || '原仓库校验脚本未通过'], method: 'original-validator', output }
    }
    return { ...basic, method: 'built-in', output: 'Python 不可用，已使用内置等价检查。' }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}
