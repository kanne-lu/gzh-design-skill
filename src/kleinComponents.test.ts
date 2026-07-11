import { describe, expect, it } from 'vitest'
import { themes } from './data'
import { buildWechatHtml, validateWechatHtml } from './exportHtml'
import { parseMarkdown } from './markdown'
import type { EditorSettings } from './types'

const kleinTheme = themes.find((theme) => theme.id === 'klein-blue')!
const redTheme = themes.find((theme) => theme.id === 'red-white')!

const settings: EditorSettings = {
  themeId: 'klein-blue',
  articleType: 'opinion',
  autoNumber: true,
  keywordUnderline: true,
  includeToc: true,
}

function render(markdown: string, overrides: Partial<EditorSettings> = {}) {
  return buildWechatHtml(parseMarkdown(markdown), { ...settings, ...overrides }, kleinTheme)
}

const comprehensiveMarkdown = 

<!-- ending -->
我是甲木，长期关注智能工具与内容表达。`

describe('Klein blue component rendering', () => {
  it('keeps the 56 preview blocks, catalog entries, and trigger hints in one-to-one sync', async () => {
    // @ts-expect-error Vite resolves HTML source imports during the Vitest transform.
    const { default: preview } = await import('../assets/theme-previews/theme-klein-blue.html?raw') as { default: string }
    const previewNames = [...preview.matchAll(/<!-- Block:\s*([^<]+?)\s*-->/g)].map((match) => match[1].trim()).sort()
    const catalogNames = (kleinTheme.componentGroups ?? []).flatMap((group) => group.items).sort()
    expect(previewNames).toHaveLength(56)
    expect(catalogNames).toEqual(previewNames)
    expect(catalogNames.every((name) => Boolean(kleinTheme.componentTriggers?.[name]))).toBe(true)
  })

  it('renders every newly supported semantic component and keeps WeChat constraints valid', () => {
    const html = render(comprehensiveMarkdown)
    const expectedMarkers = [
      'ABSTRACT ·',
      '✦ THOUGHT ✦',
      '◇ 信息说明',
      '✦ 重点提示',
      '△ 风险提醒',
      '○ 完成确认',
      'STEP 01',
      'PROCESS · 流程总览',
      'TIMELINE · 阶段脉络',
      'COMPARE · 双图对比',
      'GALLERY · 图像序列',
      'DATA · 字段对照',
      'CHECKLIST · 检查清单',
      'FAQ · 常见问答',
      'AUTHOR · AI 内容创作者',
      'CONTACT · 联系信息',
      'FURTHER READING · 延伸阅读',
      'TAGS · 标签组合',
      'COVER RECOMMENDATION',
      'FINAL NOTE · 结尾总结',
      '感谢读到这里',
      '— END —',
    ]
    expectedMarkers.forEach((marker) => expect(html).toContain(marker))
    expect(html).toContain('background:#001E78')
    expect(html).toContain('border-left:3px solid #002FA7;border-radius:6px')
    expect(html).toContain('本文看点 · CONTENTS')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('NaN')
    expect(validateWechatHtml(html).errors).toEqual([])
  })

  it('renders the default manifesto and numbered cover variants', () => {
    expect(render(`# 默认封面\n\n## 一\n内容`)).toContain('BLUE MANIFESTO')
    expect(render(`<!-- cover: manifesto -->\n# 宣言封面\n\n## 一\n内容`)).toContain('BLUE MANIFESTO')
    expect(render(`<!-- cover: numbered -->\n# 编号封面\n\n## 一\n内容`)).toContain('ISSUE · INDEX')
  })

  it('allows explicit quote, divider, code, table, checklist, and ending variants', () => {
    const html = render(`# 显式组件\n\n:::gzh component=klein-quote-solid source="甲木"\n明确判断。\n:::\n\n:::gzh component=klein-quote-rule source="资料"\n完整背景。\n:::\n\n:::gzh component=klein-code-light language="config"\ntheme: klein-blue\n:::\n\n:::gzh component=klein-data-table\n字段 | 说明\ntheme | klein-blue\n:::\n\n:::gzh component=klein-checklist\n- [x] 已完成\n- [ ] 待完成\n:::\n\n:::gzh component=klein-divider-star\n:::\n\n:::gzh component=klein-divider-diamond\n:::\n\n:::gzh component=klein-ending-summary\n自定义总结\n:::\n\n:::gzh component=klein-ending-interaction\n自定义互动\n:::\n\n:::gzh component=klein-end-mark\n自定义 END\n:::`)
    ;['—— 甲木', 'REFERENCE · 资料', 'config', 'DATA · 字段对照', 'CHECKLIST · 检查清单', '自定义总结', '自定义互动', '自定义 END'].forEach((marker) => expect(html).toContain(marker))
  })

  it('keeps automatic Klein semantics readable in other themes', () => {
    const article = parseMarkdown(`# 回退\n\n信息：上下文说明\n\n- 标签一\n- 标签二\n- 标签三\n\n1. 2024年：起点\n2. 2025年：转折`)
    const html = buildWechatHtml(article, { ...settings, themeId: 'red-white' }, redTheme)
    ;['信息：', '上下文说明', '标签一', '标签二', '标签三', '2024年', '起点', '2025年', '转折'].forEach((marker) => expect(html).toContain(marker))
  })

  it('can disable the automatic interaction block without removing END', () => {
    const html = render(`<!-- interaction: off -->\n# 安静收尾\n\n## 结语\n最后一句。\n\n<!-- ending -->\n我是甲木。`)
    expect(html).not.toContain('感谢读到这里')
    expect(html).toContain('— END —')
    expect(html).not.toContain('我是甲木。')
  })
})
