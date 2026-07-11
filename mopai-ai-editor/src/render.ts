import type { LayoutDecision, ThemeDefinition } from './types'

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;')

function inline(value: string, decision: LayoutDecision) {
  let result = escapeHtml(value)
  result = result.replace(/\*\*(.+?)\*\*/g, decision.keywordUnderline
    ? `<strong style="font-weight:700;border-bottom:2px solid ${decision.themeId === 'red-white' ? '#f2b5b5' : '#a8dac8'}">$1</strong>`
    : '<strong style="font-weight:700">$1</strong>')
  result = result.replace(/==(.+?)==/g, `<strong style="padding:0 3px;background:#fff0a8">$1</strong>`)
  result = result.replace(/`([^`]+)`/g, '<code style="padding:2px 5px;background:#f2f4f2;border-radius:3px;font-size:13px">$1</code>')
  return result
}

export function extractTitle(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || '未命名文章'
}

export function getStats(markdown: string) {
  return {
    sections: (markdown.match(/^##\s+/gm) || []).length,
    lines: markdown.split('\n').length,
    characters: markdown.replace(/\s/g, '').length,
  }
}

export function buildWechatHtml(markdown: string, decision: LayoutDecision, theme: ThemeDefinition) {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const title = extractTitle(markdown)
  const body: string[] = []
  const headings: string[] = []
  let sectionIndex = 0
  let listItems: string[] = []

  const flushList = () => {
    if (!listItems.length) return
    body.push(`<ul style="margin:4px 0 24px;padding:14px 18px 14px 36px;background:${theme.soft};border-radius:6px;color:${theme.ink};font-size:15px;line-height:1.9">${listItems.map((item) => `<li style="margin:4px 0">${inline(item, decision)}</li>`).join('')}</ul>`)
    listItems = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('# ')) { flushList(); continue }
    if (line.startsWith('- ')) { listItems.push(line.slice(2)); continue }
    flushList()
    if (line.startsWith('## ')) {
      sectionIndex += 1
      const heading = line.slice(3).trim()
      headings.push(heading)
      const number = decision.autoNumber ? `<span style="flex:none;color:${theme.accent};font-family:Georgia,serif;font-size:34px;line-height:1">${String(sectionIndex).padStart(2, '0')}</span>` : ''
      body.push(`<section style="margin:38px 0 16px"><div style="display:flex;align-items:baseline;gap:12px;padding-bottom:9px;border-bottom:1px solid ${theme.border}">${number}<h2 style="margin:0;color:${theme.ink};font-family:'Songti SC',STSong,serif;font-size:19px;line-height:1.5">${inline(heading, decision)}</h2></div></section>`)
    } else if (line.startsWith('### ')) {
      body.push(`<h3 style="margin:25px 0 11px;color:${theme.accent};font-size:16px;line-height:1.5">${inline(line.slice(4), decision)}</h3>`)
    } else if (line.startsWith('> ')) {
      body.push(`<blockquote style="margin:22px 0 28px;padding:14px 16px;color:${theme.ink};background:${theme.soft};border-left:3px solid ${theme.accent};font-family:'Songti SC',STSong,serif;font-size:15px;line-height:1.9">${inline(line.slice(2), decision)}</blockquote>`)
    } else if (line === '---') {
      body.push(`<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:32px 0;color:${theme.accent}"><span style="width:40px;height:1px;background:${theme.border}"></span>◆<span style="width:40px;height:1px;background:${theme.border}"></span></div>`)
    } else {
      body.push(`<p style="margin:0 0 18px;color:${theme.ink};font-family:'Songti SC',STSong,serif;font-size:15px;line-height:1.95;letter-spacing:.02em;text-align:justify">${inline(line, decision)}</p>`)
    }
  }
  flushList()

  const toc = decision.includeToc && headings.length > 1
    ? `<section style="margin:28px 0;padding:15px;background:${theme.soft};border:1px solid ${theme.border};border-radius:7px"><div style="margin-bottom:10px;color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:.14em">CONTENTS · 导读</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${headings.slice(0, 6).map((item, index) => `<div style="padding:9px;background:${theme.paper};border:1px solid ${theme.border};border-radius:5px;color:${theme.ink};font-size:12px;line-height:1.45"><b style="margin-right:5px;color:${theme.accent}">${String(index + 1).padStart(2, '0')}</b>${escapeHtml(item)}</div>`).join('')}</div></section>`
    : ''

  return `<section style="box-sizing:border-box;width:100%;padding:31px 22px 42px;background:${theme.paper};font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif">
    <section style="margin-bottom:24px;padding:18px 16px 17px;background:${theme.soft};border:1px solid ${theme.border};border-radius:9px">
      <div style="margin-bottom:18px;color:${theme.accent};font-size:9px;font-weight:700;letter-spacing:.18em">DEEP DIVE · AI 观察</div>
      <h1 style="margin:0;color:${theme.ink};font-family:'Songti SC',STSong,serif;font-size:25px;line-height:1.35;letter-spacing:.02em">${escapeHtml(title)}</h1>
      <div style="width:38px;height:3px;margin-top:15px;background:${theme.accent}"></div>
    </section>
    ${toc}${body.join('')}
    <section style="margin-top:38px;padding-top:18px;border-top:1px solid ${theme.border};text-align:center">
      <strong style="display:block;color:${theme.ink};font-family:'Songti SC',STSong,serif;font-size:14px">— 墨排 AI —</strong>
      <span style="color:${theme.accent};font-size:9px;letter-spacing:.15em">目标 · 决策 · 成品</span>
    </section>
  </section>`
}

export function plainText(markdown: string) {
  return markdown.replace(/^#{1,6}\s+/gm, '').replace(/^>\s+/gm, '').replace(/^[-*]\s+/gm, '').replace(/[*=`~]/g, '')
}
