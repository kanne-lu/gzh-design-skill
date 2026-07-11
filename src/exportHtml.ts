import type { EditorSettings, HtmlValidation, ParsedArticle, ParsedBlock, ThemeDefinition } from './types'
import { renderKleinExtension } from './kleinComponents'

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const plainLeaf = (value: string) => `<span leaf="">${value}</span>`
const styledLeaf = (value: string, style: string) => `<span style="${style}">${plainLeaf(value)}</span>`
const strongLeaf = (value: string, style = '') => `<strong${style ? ` style="${style}"` : ''}>${plainLeaf(value)}</strong>`
const isKleinBlue = (theme: ThemeDefinition) => String(theme.id) === 'klein-blue'
const knownKeywords = ['能力商品', '能力差距', '专家经验', '工作流', '产品化思维', '负面边界', '复利飞轮', '上下文工程', '真正稀缺', '慢下来', '选择的能力']
const chapterWords = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']

function candidateKeyword(text: string) {
  const known = knownKeywords.find((keyword) => text.includes(keyword))
  if (known) return known
  const clause = text
    .replace(/[*+=~`<>]/g, '')
    .split(/[，。！？；：,.!?;:]/)
    .map((item) => item.trim())
    .find((item) => item.length >= 4)
  if (!clause) return ''
  return clause.length > 15 ? clause.slice(0, 8) : clause
}

function underlineStyle(theme: ThemeDefinition) {
  if (isKleinBlue(theme)) return 'border-bottom:2px solid #002FA7;color:#111111;font-weight:600;'
  if (theme.id === 'red-white') return 'border-bottom:2px solid #FECACA;font-weight:600;'
  if (theme.id === 'graphite') return 'border-bottom:2px solid #52525B;font-weight:600;color:#27272A;'
  if (theme.id === 'zen') return 'border-bottom:1.5px solid #B5C8BC;font-weight:500;'
  if (theme.id === 'ticket') return 'border-bottom:2px solid #A7F3D0;font-weight:600;'
  if (theme.id === 'olive') return 'border-bottom:2px solid #ED7B2F;font-weight:600;color:#23251D;'
  return 'border-bottom:2px solid #A7F3D0;font-weight:600;'
}

function renderToken(part: string, theme: ThemeDefinition) {
  if (part.startsWith('**')) {
    const value = escapeHtml(part.slice(2, -2))
    if (isKleinBlue(theme)) return strongLeaf(value, 'color:#002FA7;')
    if (theme.id === 'red-white') return strongLeaf(value, 'color:#DC2626;')
    if (theme.id === 'graphite') return strongLeaf(value, 'color:#27272A;')
    if (theme.id === 'zen') return strongLeaf(value, 'color:#2B2B2B;')
    if (theme.id === 'ticket' || theme.id === 'moyu-green') return styledLeaf(value, 'color:#059669;font-weight:700;')
    return strongLeaf(value, 'color:#23251D;')
  }
  if (part.startsWith('==')) {
    const value = escapeHtml(part.slice(2, -2))
    if (isKleinBlue(theme)) return styledLeaf(value, 'background:#E8ECFF;color:#002FA7;padding:2px 6px;border-radius:4px;font-weight:700;')
    if (theme.id === 'red-white') return styledLeaf(value, 'background:#FEE2E2;color:#991B1B;padding:2px 6px;border-radius:3px;font-weight:700;')
    if (theme.id === 'graphite') return styledLeaf(value, 'background:#F4F4F5;color:#27272A;padding:2px 7px;border-radius:3px;font-weight:700;font-size:14px;')
    if (theme.id === 'zen') return styledLeaf(value, 'background:#EEF3F0;color:#3D5046;padding:2px 6px;border-radius:2px;font-weight:600;font-size:14px;')
    if (theme.id === 'ticket') return styledLeaf(value, 'background:linear-gradient(120deg,#A7F3D0 0%,rgba(167,243,208,0) 100%);padding:0 4px;font-weight:600;color:#111111;')
    if (theme.id === 'olive') return styledLeaf(value, 'background:#EEEFE9;padding:1px 5px;border-radius:4px;font-weight:600;color:#23251D;border:1px solid #BFC1B7;')
    return styledLeaf(value, 'background:#FDE68A;color:#111827;padding:1px 4px;border-radius:2px;font-weight:600;')
  }
  if (part.startsWith('++') || part.startsWith('<u>')) {
    const value = part.startsWith('++') ? part.slice(2, -2) : part.slice(3, -4)
    return styledLeaf(escapeHtml(value), underlineStyle(theme))
  }
  if (part.startsWith('~~')) {
    const value = escapeHtml(part.slice(2, -2))
    if (isKleinBlue(theme)) return styledLeaf(value, 'color:#434650;text-decoration:line-through;')
    if (theme.id === 'zen') return styledLeaf(value, 'background:linear-gradient(180deg,transparent 60%,#D6E4DC 60%);font-weight:600;color:#2B2B2B;')
    const color = theme.id === 'olive' ? '#9EA096' : '#9CA3AF'
    return styledLeaf(value, `color:${color};text-decoration:line-through;`)
  }
  if (part.startsWith('`')) {
    const value = escapeHtml(part.slice(1, -1))
    if (isKleinBlue(theme)) return styledLeaf(value, "margin:0 3px;padding:2px 6px;background:#F3F6FF;color:#002FA7;border:1px solid #D8E1F6;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;")
    if (theme.id === 'red-white') return styledLeaf(value, 'background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:14px;font-weight:600;')
    if (theme.id === 'graphite') return styledLeaf(value, "background:#F4F4F5;color:#27272A;padding:2px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;")
    if (theme.id === 'zen') return styledLeaf(value, "background:#EEF3F0;color:#3D5046;padding:2px 6px;border-radius:3px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;")
    if (theme.id === 'olive') return styledLeaf(value, 'background:#EEEFE9;color:#23251D;padding:2px 6px;border-radius:4px;font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;font-size:13px;border:1px solid #B6B7AF;')
    return styledLeaf(value, 'background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;')
  }
  return ''
}

function inlineHtml(text: string, theme: ThemeDefinition, autoUnderline: boolean) {
  const tokenPattern = /(\*\*[^*]+\*\*|==[^=]+==|\+\+[^+]+\+\+|<u>[^<]+<\/u>|~~[^~]+~~|`[^`]+`)/g
  const keyword = autoUnderline ? candidateKeyword(text) : ''
  let keywordUsed = false
  return text.split(tokenPattern).filter(Boolean).map((part) => {
    const token = renderToken(part, theme)
    if (token) return token
    if (keyword && !keywordUsed && part.includes(keyword)) {
      keywordUsed = true
      const position = part.indexOf(keyword)
      const before = part.slice(0, position)
      const after = part.slice(position + keyword.length)
      return `${before ? plainLeaf(escapeHtml(before)) : ''}${styledLeaf(escapeHtml(keyword), underlineStyle(theme))}${after ? plainLeaf(escapeHtml(after)) : ''}`
    }
    return plainLeaf(escapeHtml(part))
  }).join('')
}

function preserveCodeIndent(row: string) {
  const leading = row.match(/^[\t ]+/)?.[0] ?? ''
  const indent = leading.replaceAll('\t', '　　').replaceAll(' ', '　')
  return `${indent}${row.slice(leading.length)}`
}

function renderCode(block: Extract<ParsedBlock, { type: 'code' }>, theme: ThemeDefinition) {
  if (isKleinBlue(theme)) {
    if (block.variant === 'light') {
      const rows = block.code.split('\n').map((row, index) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:${index ? '#002FA7' : '#111111'};">${plainLeaf(escapeHtml(preserveCodeIndent(row || ' ')))}</p>`).join('')
      return `<section style="margin:0 10px 28px;background:#F3F6FF;border:1px solid #D8E1F6;border-left:3px solid #002FA7;border-radius:6px;overflow:hidden;box-sizing:border-box;"><section style="padding:8px 14px;border-bottom:1px solid #D8E1F6;"><span style="font-family:Consolas,Monaco,monospace;font-size:11px;color:#7D86A5;letter-spacing:1px;">${plainLeaf(escapeHtml(block.language || 'config'))}</span></section><section style="padding:12px 14px;">${rows}</section></section>`
    }
    const rows = block.code.split('\n').map((row, index) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:${index ? '#E8ECFF' : '#FFFFFF'};">${plainLeaf(escapeHtml(preserveCodeIndent(row || ' ')))}</p>`).join('')
    return `<section style="margin:0 10px 24px;background:#001E78;border-radius:6px;overflow:hidden;box-shadow:0 6px 18px rgba(0,47,167,0.12);box-sizing:border-box;"><section style="padding:9px 14px;background:#002FA7;display:flex;align-items:center;"><span style="width:8px;height:8px;margin-right:6px;background:#FFFFFF;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="width:8px;height:8px;margin-right:6px;background:#E8ECFF;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="width:8px;height:8px;margin-right:10px;background:#0648D8;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-family:Consolas,Monaco,monospace;font-size:11px;color:#E8ECFF;letter-spacing:1px;">${plainLeaf(escapeHtml(block.language || 'text'))}</span></section><section style="padding:12px 14px;">${rows}</section></section>`
  }
  const rows = block.code.split('\n').map((row) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;">${plainLeaf(escapeHtml(preserveCodeIndent(row || ' ')))}</p>`).join('')
  const code = `<section style="margin:0 0 20px;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);">
  <section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;">.</span><span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;">${plainLeaf(escapeHtml(block.language))}</span></section>
  <section style="padding:11px 14px;">${rows}</section>
</section>`
  if (theme.id === 'zen') return `<section style="padding:0 16px;">${code}</section>`
  if (theme.id === 'ticket') return `<section style="padding:0 20px;">${code}</section>`
  if (theme.id === 'olive') return `<section style="margin-top:24px;">${code}</section>`
  return code
}

function splitFeatureItem(item: string) {
  const [title, ...rest] = item.split(/[：:]/)
  return { title: title.trim(), description: rest.join('：').trim() }
}

function renderList(block: Extract<ParsedBlock, { type: 'list' }>, theme: ThemeDefinition, settings: EditorSettings) {
  if (isKleinBlue(theme)) {
    if (block.ordered) return `<section style="margin:0 10px 28px;padding:0;box-sizing:border-box;">${block.items.map((item, index) => {
      const active = index === 0
      const last = index === block.items.length - 1
      return `<section style="display:flex;align-items:flex-start;${last ? '' : 'margin:0 0 14px;padding:0 0 14px;border-bottom:1px solid #E8ECFF;'}"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;margin:1px 12px 0 0;background:${active ? '#002FA7' : '#FFFFFF'};color:${active ? '#FFFFFF' : '#002FA7'};border:1px solid #002FA7;border-radius:50%;font-family:Georgia,'Times New Roman',serif;font-size:12px;">${plainLeaf(String(index + 1))}</span><p style="flex:1;margin:0;font-size:14px;line-height:1.75;color:#434650;">${inlineHtml(item, theme, settings.keywordUnderline)}</p></section>`
    }).join('')}</section>`
    return `<section style="margin:0 10px 28px;padding:20px;background:#F3F6FF;border-left:3px solid #002FA7;box-sizing:border-box;">${block.items.map((item, index) => `<section style="display:flex;align-items:flex-start;${index === block.items.length - 1 ? '' : 'margin:0 0 12px;'}"><span style="width:7px;height:7px;margin:7px 11px 0 0;background:#002FA7;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><p style="flex:1;margin:0;font-size:14px;line-height:1.75;color:#434650;">${inlineHtml(item, theme, settings.keywordUnderline)}</p></section>`).join('')}</section>`
  }
  if (theme.id === 'red-white' || theme.id === 'graphite') {
    const dark = theme.id === 'red-white' ? '#DC2626' : '#27272A'
    const ink = theme.id === 'red-white' ? '#374151' : '#52525B'
    if (block.ordered) return `<section style="margin-bottom:24px;">${block.items.map((item, index) => `<section style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:${dark};color:#FFFFFF;font-size:12px;font-weight:700;border-radius:50%;flex-shrink:0;margin-top:2px;">${plainLeaf(String(index + 1))}</span><p style="font-size:15px;color:${ink};margin:0;line-height:1.8;flex:1;">${inlineHtml(item, theme, settings.keywordUnderline)}</p></section>`).join('')}</section>`
    const pillBackground = theme.id === 'red-white' ? '#FEE2E2' : '#F4F4F5'
    const pillInk = theme.id === 'red-white' ? '#991B1B' : '#27272A'
    const dot = theme.id === 'red-white' ? '#DC2626' : '#52525B'
    return `<section style="margin-bottom:14px;">${block.items.map((item) => `<p style="margin:0 0 8px;"><span style="display:inline-block;font-size:14px;font-weight:700;color:${pillInk};background:${pillBackground};padding:3px 10px;border-radius:999px;"><span style="display:inline-block;width:6px;height:6px;background:${dot};border-radius:50%;margin-right:5px;vertical-align:middle;">${plainLeaf('<br>')}</span>${plainLeaf(escapeHtml(item))}</span></p>`).join('')}</section>`
  }
  if (theme.id === 'zen') return `<section style="margin:0 16px 32px;border-top:1px solid #E8E8E8;">${block.items.map((item, index) => `<section style="display:flex;align-items:baseline;padding:16px 0;border-bottom:1px solid #E8E8E8;"><p style="font-size:11px;color:#4A5D52;font-weight:600;letter-spacing:1px;margin:0;min-width:28px;">${plainLeaf(String(index + 1).padStart(2, '0'))}</p><p style="font-size:14px;color:#2B2B2B;margin:0;line-height:1.7;padding-left:12px;">${inlineHtml(item, theme, settings.keywordUnderline)}</p></section>`).join('')}</section>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;">${block.items.map((item, index) => {
    const feature = splitFeatureItem(item)
    return `<section style="background:#FFFEF8;border:1px solid #EEEEEE;margin-bottom:12px;"><section style="display:flex;align-items:stretch;"><section style="width:36px;background:#059669;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:12px;font-weight:800;">${plainLeaf(String(index + 1).padStart(2, '0'))}</section><section style="flex:1;padding:12px 16px;font-size:13px;color:#555555;line-height:1.7;border-left:1px dashed #A7F3D0;"><span style="font-weight:600;color:#1A1A1A;">${plainLeaf(escapeHtml(feature.title))}</span>${feature.description ? `${plainLeaf(`：${escapeHtml(feature.description)}`)}` : ''}</section></section></section>`
  }).join('')}</section>`
  if (theme.id === 'olive') return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><ul style="margin:0;padding-left:22px;line-height:1.8;list-style-position:outside;">${block.items.map((item) => `<li style="margin-bottom:8px;font-size:15px;color:#4D4F46;list-style-type:disc;"><section>${inlineHtml(item, theme, settings.keywordUnderline)}</section></li>`).join('')}</ul></section></section>`
  return `<section style="margin:0 0 24px;">${block.items.map((item, index) => `<section style="display:flex;align-items:flex-start;margin:0 0 11px;"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;margin:2px 10px 0 0;background:${block.ordered ? '#059669' : '#ECFDF5'};color:${block.ordered ? '#FFFFFF' : '#059669'};font-size:11px;font-weight:700;border-radius:50%;">${plainLeaf(block.ordered ? String(index + 1) : '•')}</span><p style="margin:0;flex:1;font-size:14px;line-height:1.85;color:#374151;">${inlineHtml(item, theme, settings.keywordUnderline)}</p></section>`).join('')}</section>`
}

function renderParagraph(text: string, theme: ThemeDefinition, settings: EditorSettings) {
  const content = inlineHtml(text, theme, settings.keywordUnderline)
  if (isKleinBlue(theme)) return `<section style="margin:0;padding:0 10px;box-sizing:border-box;"><p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#434650;text-align:justify;letter-spacing:0.3px;">${content}</p></section>`
  if (theme.id === 'red-white') return `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;text-align:justify;">${content}</p>`
  if (theme.id === 'graphite') return `<p style="margin:0 0 22px;font-size:15px;line-height:1.8;text-align:justify;color:#52525B;letter-spacing:0.3px;">${content}</p>`
  if (theme.id === 'zen') return `<p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;color:#525252;padding:0 16px;">${content}</p>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><p style="font-size:14px;color:#555555;line-height:1.9;margin:0 0 16px;text-align:justify;">${content}</p></section>`
  if (theme.id === 'olive') return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><p style="margin:0;font-size:14px;line-height:1.9;text-align:justify;color:#4D4F46;">${content}</p></section></section>`
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.9;text-align:justify;color:#374151;">${content}</p>`
}

function renderSubheading(text: string, theme: ThemeDefinition, settings: EditorSettings) {
  if (isKleinBlue(theme)) {
    if (settings.articleType === 'tutorial' || settings.articleType === 'case') return `<section style="margin:28px 10px 14px;padding:0;box-sizing:border-box;"><p style="margin:0;"><span style="display:inline-block;margin-right:10px;padding:3px 10px;background:#002FA7;color:#FFFFFF;border-radius:999px;font-family:Georgia,'Times New Roman',serif;font-size:11px;">${plainLeaf('STEP')}</span><span style="font-size:15px;font-weight:700;color:#002FA7;">${plainLeaf(escapeHtml(text))}</span></p></section>`
    if (settings.articleType === 'data' || settings.articleType === 'list') return `<section style="margin:28px 10px 14px;padding:3px 0 3px 14px;border-left:3px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 3px;font-size:15px;line-height:1.5;font-weight:700;color:#111111;">${plainLeaf(escapeHtml(text))}</p><p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:9px;color:#434650;letter-spacing:1.5px;">${plainLeaf('SECTION · INSIGHT')}</p></section>`
    return `<section style="margin:28px 10px 14px;padding:0;display:flex;align-items:center;box-sizing:border-box;"><span style="width:8px;height:8px;margin-right:10px;background:#002FA7;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-size:15px;line-height:1.55;font-weight:700;color:#002FA7;">${plainLeaf(escapeHtml(text))}</span><span style="flex:1;height:1px;margin-left:12px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span></section>`
  }
  if (theme.id === 'moyu-green') return `<p style="margin:28px 0 16px;font-size:15px;font-weight:900;color:#111827;">${styledLeaf(escapeHtml(text), 'background:linear-gradient(180deg,transparent 65%,#FDE68A 65%);padding:0 4px;')}</p>`
  if (theme.id === 'red-white') return `<p style="font-size:15px;font-weight:800;color:#1C1917;margin:28px 0 14px;padding-left:10px;border-left:3px solid #DC2626;line-height:1.4;">${plainLeaf(escapeHtml(text))}</p>`
  if (theme.id === 'graphite') return `<p style="font-size:15px;font-weight:800;color:#27272A;margin:28px 0 14px;padding-left:12px;border-left:3px solid #52525B;line-height:1.4;">${plainLeaf(escapeHtml(text))}</p>`
  if (theme.id === 'zen') return `<p style="margin:28px 16px 14px;font-size:16px;font-weight:700;color:#2B2B2B;line-height:1.5;border-left:3px solid #4A5D52;padding-left:12px;">${plainLeaf(escapeHtml(text))}</p>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><section style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"><section style="width:4px;height:16px;background:#059669;">${plainLeaf('<br>')}</section><section style="font-size:15px;font-weight:700;color:#1A1A1A;">${plainLeaf(escapeHtml(text))}</section></section></section>`
  if (settings.articleType === 'tutorial' || settings.articleType === 'case') return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="display:flex;align-items:center;gap:10px;"><span style="background:#1E1F23;color:#FFFFFF;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:700;">${plainLeaf('STEP')}</span><span style="font-size:14px;font-weight:600;color:#4D4F46;">${plainLeaf(escapeHtml(text))}</span></section></section></section>`
  if (settings.articleType === 'data' || settings.articleType === 'list') return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:1px solid #BFC1B7;padding-bottom:10px;"><span style="font-size:10px;font-weight:800;letter-spacing:3px;color:#ED7B2F;text-transform:uppercase;">${plainLeaf('INSIGHT')}</span><span style="font-size:18px;font-weight:800;color:#23251D;line-height:1.2;">${plainLeaf(escapeHtml(text))}</span></section></section></section>`
  return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><h3 style="font-size:18px;font-weight:700;color:#23251D;margin:0;padding:0 2px;display:block;width:fit-content;box-shadow:inset 0 -0.5em 0 rgba(245,78,0,0.18);">${plainLeaf(escapeHtml(text))}</h3></section></section>`
}

function renderQuote(text: string, theme: ThemeDefinition, settings: EditorSettings) {
  if (isKleinBlue(theme)) {
    if (settings.articleType === 'opinion' || settings.articleType === 'interview' || settings.articleType === 'essay') return `<section style="margin:8px 10px 28px;padding:22px 20px;background:linear-gradient(135deg,#002FA7 0%,#001E78 100%);border-radius:6px;box-shadow:0 8px 24px rgba(0,47,167,0.16);box-sizing:border-box;"><p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1;color:#E8ECFF;">${plainLeaf('“')}</p><p style="margin:0;font-size:16px;line-height:1.9;color:#FFFFFF;font-weight:600;">${plainLeaf(escapeHtml(text.replaceAll('<u>', '').replaceAll('</u>', '').replace(/[*+=~`]/g, '')))}</p></section>`
    return `<section style="margin:0 10px 28px;padding:14px 0 14px 20px;border-left:3px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 9px;font-size:10px;color:#434650;letter-spacing:2px;">${plainLeaf('REFERENCE · 引用')}</p><p style="margin:0;font-size:15px;line-height:1.9;color:#434650;text-align:justify;">${inlineHtml(text, theme, false)}</p></section>`
  }
  if (theme.id === 'moyu-green') return `<section style="margin:0 0 24px;padding:14px 16px;background:#FFFFFF;border:1px dashed #BBF7D0;border-radius:8px;text-align:center;"><p style="margin:0;line-height:1.75;">${styledLeaf(escapeHtml(text), 'font-size:15px;color:#059669;font-weight:700;border-bottom:3px solid #FDE68A;padding-bottom:2px;')}</p></section>`
  if (theme.id === 'red-white') return `<section style="background:#FEF2F2;border-radius:0 10px 10px 0;border-left:4px solid #DC2626;padding:18px 22px;margin-bottom:24px;"><p style="font-size:16px;font-weight:800;color:#991B1B;margin:0;line-height:1.8;">${plainLeaf('「')}${inlineHtml(text, theme, false)}${plainLeaf('」')}</p></section>`
  if (theme.id === 'graphite') return `<section style="border-left:3px solid #52525B;padding:16px 0 16px 24px;margin:0 10px 28px;"><p style="font-size:16px;font-weight:700;color:#27272A;margin:0;line-height:1.7;letter-spacing:0.5px;">${plainLeaf('「')}${inlineHtml(text, theme, false)}${plainLeaf('」')}</p></section>`
  if (theme.id === 'zen') return `<section style="margin:40px 16px;padding:36px 20px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;"><p style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:17px;font-weight:600;color:#2B2B2B;margin:0;line-height:1.9;letter-spacing:0.8px;">${plainLeaf('「')}${inlineHtml(text, theme, false)}${plainLeaf('」')}</p></section>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><section style="background:#F0FDF4;border-left:4px solid #059669;padding:14px 16px;margin-bottom:0;"><p style="font-size:14px;color:#1A1A1A;font-weight:600;line-height:1.7;margin:0;">${plainLeaf('观点：')}${inlineHtml(text, theme, false)}</p></section></section>`
  return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="background:#FDFDF8;border-radius:6px;padding:16px 18px;border:1px solid #BFC1B7;"><p style="font-size:14px;color:#4D4F46;margin:0;line-height:1.8;text-align:justify;"><strong style="color:#23251D;border-bottom:3px solid #ED7B2F;">${plainLeaf(escapeHtml(text))}</strong></p></section></section></section>`
}

function renderDivider(theme: ThemeDefinition, settings: EditorSettings, variant?: 'star' | 'diamond') {
  if (isKleinBlue(theme)) {
    if (variant === 'star' || (!variant && (settings.articleType === 'essay' || settings.articleType === 'opinion'))) return `<section style="margin:34px 10px;display:flex;align-items:center;box-sizing:border-box;"><span style="font-size:12px;color:#002FA7;">${plainLeaf('✦')}</span><span style="flex:1;height:1px;margin:0 12px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-size:10px;color:#002FA7;">${plainLeaf('◆')}</span><span style="flex:1;height:1px;margin:0 12px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-size:12px;color:#002FA7;">${plainLeaf('✦')}</span></section>`
    return `<section style="margin:34px 10px;display:flex;align-items:center;box-sizing:border-box;"><span style="flex:1;height:1px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="margin:0 12px;font-size:10px;color:#002FA7;">${plainLeaf('◆')}</span><span style="flex:1;height:1px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span></section>`
  }
  if (theme.id === 'red-white') return `<section style="padding:0 10px;"><section style="height:1px;background:linear-gradient(to right,transparent,#FCA5A5,#DC2626,#FCA5A5,transparent);margin:0;">${plainLeaf('<br>')}</section></section>`
  if (theme.id === 'graphite') return `<section style="padding:0 10px;"><section style="height:1px;background:#E4E4E7;margin:0;">${plainLeaf('<br>')}</section></section>`
  if (theme.id === 'zen') return `<section style="padding:0 16px;"><section style="height:1px;background:#E8E8E8;margin:64px 0 0;">${plainLeaf('<br>')}</section></section>`
  if (theme.id === 'olive' && settings.articleType === 'essay') return `<section style="margin-top:24px;"><section style="display:flex;align-items:center;justify-content:center;gap:10px;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><span style="width:8px;height:8px;border-radius:50%;background:#4D4F46;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><span style="width:8px;height:8px;border-radius:50%;background:#BFC1B7;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><span style="width:8px;height:8px;border-radius:50%;background:#ED7B2F;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span></section></section>`
  if (theme.id === 'olive') return `<section style="margin-top:24px;"><hr style="border:none;height:2px;background:#BFC1B7;margin:0;"></section>`
  return `<section style="height:1px;margin:36px 0;background:${theme.border};overflow:hidden;">${plainLeaf('<br>')}</section>`
}

function renderPlaceholder(text: string, theme: ThemeDefinition) {
  if (isKleinBlue(theme)) {
    if (/录屏|视频|GIF/i.test(text)) return `<section style="margin:0 10px 30px;padding:38px 20px;background:linear-gradient(135deg,#002FA7,#001E78);border-radius:6px;text-align:center;box-sizing:border-box;"><p style="margin:0 0 12px;font-size:24px;color:#FFFFFF;line-height:1;">${plainLeaf('▷')}</p><p style="margin:0 0 7px;font-size:15px;color:#FFFFFF;font-weight:700;">${plainLeaf('视频内容待补')}</p><p style="margin:0;font-size:12px;line-height:1.65;color:#E8ECFF;">${plainLeaf(escapeHtml(text))}</p></section>`
    return `<section style="margin:0 10px 28px;padding:32px 20px;background:#F3F6FF;border:1px dashed #D8E1F6;border-radius:8px;text-align:center;box-sizing:border-box;"><p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#002FA7;">${plainLeaf('◇')}</p><p style="margin:0 0 6px;font-size:14px;color:#002FA7;font-weight:700;">${plainLeaf('图片素材待补')}</p><p style="margin:0;font-size:12px;line-height:1.65;color:#434650;">${plainLeaf(escapeHtml(text))}</p></section>`
  }
  if (theme.id === 'olive') return `<section style="margin-top:24px;"><section style="padding:18px;border-radius:6px;background:#FDFDF8;border:1px solid #BFC1B7;text-align:center;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><p style="margin:0 0 12px;font-size:12px;color:#65675E;font-weight:700;letter-spacing:1px;">${plainLeaf('CHART')}</p><section style="min-height:140px;border-radius:6px;background:#EEEFE9;display:flex;align-items:center;justify-content:center;border:1px dashed #BFC1B7;"><span style="font-size:14px;color:#4D4F46;">${plainLeaf(escapeHtml(text))}</span></section></section></section>`
  const icon = /录屏|视频|GIF/i.test(text) ? '🎬' : '🖼'
  const placeholder = `<section style="margin:0 0 24px;padding:30px 20px;border:1.5px dashed #DAD7D2;border-radius:14px;background:#FAFAF8;text-align:center;"><p style="margin:0 0 10px;font-size:26px;line-height:1;">${plainLeaf(icon)}</p><p style="margin:0;font-size:14px;font-weight:700;color:#9CA3AF;letter-spacing:1px;">${plainLeaf('待补素材')}</p><p style="margin:8px 0 0;font-size:13px;color:#B8B5B0;line-height:1.7;">${plainLeaf(escapeHtml(text))}</p></section>`
  if (theme.id === 'zen') return `<section style="padding:0 16px;">${placeholder}</section>`
  if (theme.id === 'ticket') return `<section style="padding:0 20px;">${placeholder}</section>`
  return placeholder
}

function renderImage(block: Extract<ParsedBlock, { type: 'image' }>, theme: ThemeDefinition) {
  const src = escapeHtml(block.src)
  const alt = escapeHtml(block.alt)
  const gif = block.src.toLowerCase().includes('.gif')
  if (isKleinBlue(theme)) {
    const caption = block.alt ? `<figcaption style="margin:8px 10px 0;text-align:center;font-size:12px;line-height:1.6;color:#434650;">${gif ? styledLeaf('GIF 动图', 'display:inline-block;margin-right:6px;padding:2px 8px;background:#E8ECFF;color:#002FA7;border-radius:999px;font-size:10px;font-weight:700;') : ''}${plainLeaf(`— ${alt}`)}</figcaption>` : ''
    return `<figure style="margin:0 10px 28px;padding:0;box-sizing:border-box;"><section style="padding:4px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:4px;overflow:hidden;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section>${caption}</figure>`
  }
  if (theme.id === 'graphite') {
    const caption = block.alt ? `<p style="font-size:12px;color:#A1A1AA;text-align:center;margin:0 10px 28px;letter-spacing:0.5px;">${gif ? styledLeaf('GIF 动图', 'display:inline-block;border:1px solid #52525B;color:#52525B;background:transparent;font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;') : ''}${plainLeaf(`— ${alt}`)}</p>` : ''
    return `<section style="border:1px solid #E4E4E7;padding:4px;margin:0 10px ${block.alt ? '8px' : '12px'};"><section style="margin:0;overflow:hidden;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>${caption}`
  }
  if (theme.id === 'zen') return `<section style="margin:0 16px ${block.alt ? '8px' : '10px'};border:1px solid #E8E8E8;"><section style="margin:0;overflow:hidden;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>${block.alt ? `<p style="font-size:12px;color:#A3A3A3;text-align:center;margin:8px 16px 32px;letter-spacing:0.5px;">${plainLeaf(`— ${alt}`)}</p>` : ''}`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><section style="background:#FFFEF8;border:1px solid #EEEEEE;padding:6px;margin-bottom:0;"><figure style="margin:0;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></figure></section></section>`
  if (theme.id === 'olive') {
    if (!block.alt) return `<section style="margin-top:24px;"><section style="padding:0 8px;margin:0 -8px;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="background:#FDFDF8;border-radius:6px;padding:6px;border:1px solid #BFC1B7;"><figure style="margin:0;border-radius:4px;overflow:hidden;"><span leaf=""><img src="${src}" alt="通栏图片" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></figure></section></section></section>`
    return `<section style="margin-top:24px;"><figure style="font-family:'IBM Plex Sans',-apple-system,sans-serif;margin:0;"><section style="border-radius:6px;overflow:hidden;border:1px solid #BFC1B7;display:block;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section><figcaption style="font-size:13px;line-height:1.7;color:#65675E;text-align:center;margin-top:10px;">${plainLeaf(alt)}</figcaption></figure></section>`
  }
  const caption = block.alt ? `<p style="text-align:center;margin:0 0 24px;">${gif ? styledLeaf('GIF 动图', `display:inline-block;background:${theme.accentSoft};color:${theme.accent};font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;`) : ''}${styledLeaf(`— ${alt}`, 'font-size:12px;color:#9CA3AF;')}</p>` : ''
  return `<section style="background:#FFFFFF;border-radius:12px;padding:6px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:${block.alt ? '8px' : '10px'};"><section style="margin:0;border-radius:8px;overflow:hidden;"><span leaf=""><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>${caption}`
}

function renderBlock(block: ParsedBlock, theme: ThemeDefinition, settings: EditorSettings) {
  if (isKleinBlue(theme)) {
    const extension = renderKleinExtension(block, settings, {
      escape: escapeHtml,
      inline: (value, autoUnderline) => inlineHtml(value, theme, autoUnderline),
      leaf: plainLeaf,
    })
    if (extension !== null) return extension
  }
  if (block.type === 'paragraph') return renderParagraph(block.text, theme, settings)
  if (block.type === 'subheading') return renderSubheading(block.text, theme, settings)
  if (block.type === 'quote') return renderQuote(block.text, theme, settings)
  if (block.type === 'code') return renderCode(block, theme)
  if (block.type === 'list') return renderList(block, theme, settings)
  if (block.type === 'divider') return renderDivider(theme, settings, block.variant)
  if (block.type === 'placeholder') return renderPlaceholder(block.text, theme)
  if (block.type === 'image') return renderImage(block, theme)
  if (block.type === 'table') {
    const rows = [block.headers, ...block.rows].map((row) => row.join(' ｜ '))
    return rows.map((row) => renderParagraph(row, theme, settings)).join('')
  }
  if (block.type === 'checklist') return renderList({ type: 'list', ordered: false, items: block.items.map((item) => `${item.checked ? '✓' : '○'} ${item.text}`) }, theme, settings)
  if (block.type === 'imageGroup') return block.images.map((image) => renderImage({ type: 'image', ...image }, theme)).join('')
  if (block.type === 'component') {
    if (block.attrs.fallback === 'unordered-list' || block.attrs.fallback === 'ordered-list') return renderList({ type: 'list', ordered: block.attrs.fallback === 'ordered-list', items: block.lines }, theme, settings)
    if (block.attrs.fallback) return renderParagraph(block.attrs.fallback, theme, settings)
    return block.lines.map((line) => renderParagraph(line, theme, settings)).join('')
  }
  return ''
}

function renderMoyuCover(article: ParsedArticle) {
  const titleParts = article.title.split(/[，：:]/)
  const first = titleParts[0] || article.title
  const second = titleParts.slice(1).join('，') || article.sections[0]?.title || '把经验变成可复用能力'
  return `<section style="margin:0 0 28px;background:#FFFFFF;border:1.5px solid rgba(5,150,105,0.16);border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;"><section style="padding:27px 24px 24px;"><section style="display:flex;align-items:center;margin-bottom:23px;"><span style="width:6px;height:6px;background:#059669;border-radius:50%;margin-right:8px;">${plainLeaf('<br>')}</span><span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#059669;">${plainLeaf('DEEP DIVE · AI 观察')}</span><span style="flex:1;height:1px;margin:0 8px;background:linear-gradient(to right,rgba(5,150,105,0.16),transparent);">${plainLeaf('<br>')}</span><span style="font-size:9px;color:#D1D5DB;">${plainLeaf('2026.07')}</span></section><p style="margin:0 0 6px;font-size:13px;color:#D1D5DB;text-decoration:line-through;">${plainLeaf('提示词只是写一段话？')}</p><p style="margin:0;font-size:23px;font-weight:900;line-height:1.15;color:#111827;letter-spacing:-1px;">${plainLeaf(escapeHtml(first))}</p><p style="margin:2px 0 14px;font-size:23px;font-weight:900;line-height:1.15;color:#059669;letter-spacing:-1px;">${plainLeaf(escapeHtml(second))}</p><section style="width:48px;height:3px;margin-bottom:12px;background:linear-gradient(to right,#059669,#34D399);border-radius:2px;">${plainLeaf('<br>')}</section><p style="margin:0;font-size:11px;line-height:1.7;color:#9CA3AF;">${plainLeaf('Prompt · Context · Skills · 能力资产')}</p></section><section style="display:flex;align-items:center;justify-content:space-between;padding:10px 24px;background:linear-gradient(135deg,#059669,#10B981);"><p style="margin:0;font-size:11px;color:#FFFFFF;font-weight:600;">${plainLeaf('Agent Skills 深度拆解')}</p><p style="margin:0;font-size:8px;color:rgba(255,255,255,.85);">${plainLeaf('深度分析 · 方法论')}</p></section></section>`
}

function renderTicketCover(article: ParsedArticle) {
  const tags = article.sections.slice(0, 3).map((section) => section.title)
  while (tags.length < 3) tags.push(['深度阅读', '方法拆解', '实践复盘'][tags.length])
  return `<section style="background:#FFFEF8;border:2px solid #1A1A1A;box-shadow:4px 4px 0 #1A1A1A;margin-bottom:32px;"><section style="background:#059669;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;"><section style="color:#FFFEF8;font-size:11px;letter-spacing:4px;font-weight:600;">${plainLeaf('MOPAI DEEP REVIEW')}</section><section style="color:#FFFEF8;font-size:11px;letter-spacing:2px;">${plainLeaf('★★★★★')}</section></section><section style="display:flex;"><section style="flex:1;padding:24px 20px;border-right:2px dashed #A7F3D0;"><section style="font-size:24px;font-weight:900;color:#1A1A1A;letter-spacing:0.5px;margin-bottom:4px;text-shadow:0.5px 0 0 #1A1A1A;">${plainLeaf(escapeHtml(article.title))}</section><section style="font-size:14px;color:#666666;letter-spacing:1px;margin-bottom:20px;">${plainLeaf(escapeHtml(article.sections[0]?.title || '深度观察与方法拆解'))}</section><section style="border-top:1px dashed #A7F3D0;margin-bottom:16px;">${plainLeaf('<br>')}</section><section style="font-size:13px;color:#555555;line-height:1.8;padding:12px;background:#F0FDF4;border:1px solid #A7F3D0;">${article.intro ? inlineHtml(article.intro, { ...themesafe(), id: 'ticket' }, false) : plainLeaf('一张票据，看清一个问题。')}</section><section style="display:flex;gap:8px;margin-top:16px;">${tags.map((tag) => `<section style="font-size:10px;color:#059669;border:1px solid #059669;padding:4px 10px;">${plainLeaf(`#${escapeHtml(tag.slice(0, 6))}`)}</section>`).join('')}</section></section><section style="width:48px;padding:14px 4px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:#F0FDF4;"><section style="text-align:center;"><section style="font-size:7px;color:#999999;letter-spacing:1px;">${plainLeaf('NO.')}</section><section style="font-size:18px;font-weight:900;color:#059669;">${plainLeaf('001')}</section></section><section style="writing-mode:vertical-rl;font-size:9px;color:#888888;letter-spacing:2px;">${plainLeaf('深度阅读')}</section><section style="text-align:center;"><section style="font-size:7px;color:#999999;letter-spacing:1px;">${plainLeaf('GRADE')}</section><section style="font-size:14px;font-weight:900;color:#059669;">${plainLeaf('A')}</section></section></section></section><section style="display:flex;justify-content:space-between;align-items:center;padding:0 8px;"><section style="flex:1;border-top:2px dashed #A7F3D0;">${plainLeaf('<br>')}</section><section style="padding:0 8px;font-size:10px;color:#A7F3D0;">${plainLeaf('✂')}</section><section style="flex:1;border-top:2px dashed #A7F3D0;">${plainLeaf('<br>')}</section></section><section style="padding:10px 20px;display:flex;justify-content:space-between;align-items:center;"><section style="font-size:10px;color:#999999;letter-spacing:1px;">${plainLeaf('VALID FOR ONE READ')}</section><section style="font-size:10px;color:#999999;letter-spacing:1px;">${plainLeaf('ADMIT ONE 🎫')}</section></section></section>`
}

function themesafe(): ThemeDefinition {
  return { id: 'ticket', name: '', description: '', sourceFile: '', componentCount: '', accent: '#059669', accentSoft: '#F0FDF4', paper: '#FFFFFF', ink: '#1A1A1A', muted: '#777777', border: '#A7F3D0', highlight: '#A7F3D0', recipes: {} as ThemeDefinition['recipes'] }
}

function renderOliveHero(article: ParsedArticle, theme: ThemeDefinition) {
  const titleParts = article.title.split(/[，：:]/)
  const main = titleParts[0] || article.title
  const emphasis = titleParts.slice(1).join('，') || article.sections[0]?.title || '深度观察'
  const intro = article.intro ? inlineHtml(article.intro, theme, false) : plainLeaf('把判断、流程与边界，沉淀成可复用的能力资产。')
  return `<section style="background:#FDFDF8;border:1px solid #BFC1B7;border-radius:6px;overflow:hidden;font-family:'IBM Plex Sans',-apple-system,system-ui,sans-serif;"><section style="padding:28px 24px 22px;"><section style="display:flex;align-items:center;gap:8px;margin-bottom:22px;"><span style="width:8px;height:8px;background:#1E1F23;border-radius:50%;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><span style="font-size:10px;font-weight:700;letter-spacing:3px;color:#65675E;">${plainLeaf('MOPAI JOURNAL')}</span><span style="flex:1;height:1px;background:#BFC1B7;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><span style="font-size:10px;color:#9EA096;font-weight:500;font-variant-numeric:tabular-nums;">${plainLeaf('2026.07')}</span></section><section style="display:flex;align-items:stretch;gap:18px;"><section style="flex:1;min-width:0;"><p style="font-size:24px;font-weight:800;color:#23251D;margin:0 0 10px;line-height:1.15;letter-spacing:-0.75px;">${plainLeaf(escapeHtml(main))}<span style="color:#4D4F46;">${plainLeaf('&nbsp;·&nbsp;')}</span><span style="border-bottom:3px solid #E5E7E0;">${plainLeaf(escapeHtml(emphasis))}</span></p><section style="display:flex;align-items:center;gap:4px;margin-bottom:12px;"><span style="width:22px;height:3px;background:#1E1F23;border-radius:2px;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><span style="width:8px;height:3px;background:#BFC1B7;border-radius:2px;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span></section><p style="font-size:13px;color:#65675E;margin:0;line-height:1.7;">${intro}</p></section><section style="flex-shrink:0;width:112px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#EEEFE9;border:1px dashed #BFC1B7;border-radius:6px;padding:8px;"><svg width="72" height="72" viewBox="0 0 64 64" aria-hidden="true" style="display:block;"><ellipse cx="32" cy="36" rx="22" ry="18" fill="none" stroke="#4D4F46" stroke-width="2"></ellipse><circle cx="26" cy="30" r="3" fill="#4D4F46"></circle><circle cx="38" cy="30" r="3" fill="#4D4F46"></circle><path d="M28 40 Q32 44 36 40" fill="none" stroke="#4D4F46" stroke-width="1.5"></path><path d="M12 34 L8 28 M52 34 L56 28" stroke="#BFC1B7" stroke-width="2" stroke-linecap="round"></path></svg><span style="font-size:8px;font-weight:700;color:#9EA096;letter-spacing:1px;margin-top:4px;">${plainLeaf('DOODLE')}</span></section></section></section><section style="background:#1E1F23;padding:11px 24px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;"><p style="font-size:12px;color:rgba(255,255,255,0.92);margin:0;font-weight:600;">${plainLeaf(escapeHtml(article.sections[0]?.title || '深度观察与方法拆解'))}</p><section style="display:flex;gap:6px;flex-wrap:wrap;"><span style="background:#E5E7E0;color:#23251D;padding:3px 8px;border-radius:4px;font-size:8px;font-weight:700;border:1px solid #BFC1B7;">${plainLeaf('FIELD NOTES')}</span><span style="background:#E5E7E0;color:#23251D;padding:3px 8px;border-radius:4px;font-size:8px;font-weight:700;border:1px solid #BFC1B7;">${plainLeaf('DEEP DIVE')}</span></section></section></section>`
}

function renderKleinCover(article: ParsedArticle, theme: ThemeDefinition) {
  const intro = article.intro ? inlineHtml(article.intro, theme, false) : plainLeaf('用克制的结构，建立深邃而清晰的阅读秩序。')
  if (article.coverStyle !== 'numbered') {
    return `<section style="margin:0;padding:24px 18px 18px;background:#FFFFFF;box-sizing:border-box;"><section style="display:flex;align-items:center;"><span style="display:inline-block;width:8px;height:8px;margin-right:9px;background:#002FA7;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="flex:1;height:1px;margin:0 10px 0 0;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-family:Georgia,'Times New Roman',serif;font-size:9px;color:#002FA7;letter-spacing:1px;">${plainLeaf('KLEIN BLUE · ✦')}</span></section></section><section style="margin:0 10px 36px;padding:34px 22px;background:linear-gradient(135deg,#002FA7 0%,#0648D8 52%,#001E78 100%);border-radius:6px;box-shadow:0 8px 24px rgba(0,47,167,0.16);box-sizing:border-box;"><p style="margin:0 0 26px;font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#E8ECFF;letter-spacing:2px;">${plainLeaf('BLUE MANIFESTO')}</p><p style="margin:0 0 18px;font-size:24px;line-height:1.4;font-weight:600;color:#FFFFFF;">${plainLeaf(escapeHtml(article.title))}</p><p style="margin:0;font-size:15px;line-height:1.9;color:#FFFFFF;">${intro}</p></section>`
  }
  if (article.coverStyle === 'numbered') {
    const indexItems = article.sections.slice(0, 3)
    return `<section style="margin:0;padding:24px 18px 18px;background:#FFFFFF;box-sizing:border-box;"><section style="display:flex;align-items:center;"><span style="display:inline-block;width:8px;height:8px;margin-right:9px;background:#002FA7;border-radius:50%;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="flex:1;height:1px;margin:0 10px 0 0;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><span style="font-family:Georgia,'Times New Roman',serif;font-size:9px;color:#002FA7;letter-spacing:1px;">${plainLeaf('KLEIN BLUE · ✦')}</span></section></section><section style="margin:0 10px 36px;padding:26px 22px 24px;background:#FFFFFF;border:1px solid #D8E1F6;border-right:8px solid #002FA7;box-shadow:0 6px 18px rgba(0,47,167,0.08);box-sizing:border-box;"><section style="display:flex;align-items:baseline;margin:0 0 18px;"><span style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1;color:#002FA7;margin-right:12px;">${plainLeaf('01')}</span><span style="font-size:10px;color:#7D86A5;letter-spacing:2px;">${plainLeaf('ISSUE · INDEX')}</span></section><p style="margin:0 0 14px;font-size:23px;line-height:1.4;font-weight:600;color:#002FA7;">${plainLeaf(escapeHtml(article.title))}</p><p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#434650;">${intro}</p><section style="display:flex;gap:8px;flex-wrap:wrap;">${indexItems.map((section, index) => `<span style="display:inline-block;padding:4px 10px;background:${index ? '#F3F6FF' : '#002FA7'};color:${index ? '#002FA7' : '#FFFFFF'};border:1px solid ${index ? '#D8E1F6' : '#002FA7'};border-radius:999px;font-size:10px;font-weight:700;">${plainLeaf(`${String(index + 1).padStart(2, '0')} · ${escapeHtml(section.title.slice(0, 8))}`)}</span>`).join('')}</section></section>`
  }
}

function extractAuthor(article: ParsedArticle) {
  const author = article.ending.split(/如果你觉得|欢迎点赞|欢迎\*\*/)[0].trim()
  return author || '我是 {{作者名}}，{{一句话简介}}。'
}

function extractAuthorName(article: ParsedArticle) {
  return extractAuthor(article).match(/^我是([^，,。]+)/)?.[1]?.trim() ?? ''
}

function introMarkup(article: ParsedArticle, theme: ThemeDefinition) {
  let text = article.intro
  if (theme.id === 'graphite' || theme.id === 'zen') text = text.replace(/==([^=]+)==/g, '++$1++')
  if (!/[=*+~`<]/.test(text)) {
    const keyword = candidateKeyword(text)
    if (keyword) text = text.replace(keyword, `${theme.id === 'red-white' ? '==' : '++'}${keyword}${theme.id === 'red-white' ? '==' : '++'}`)
  }
  return inlineHtml(text, theme, false)
}

function renderIntro(article: ParsedArticle, theme: ThemeDefinition) {
  if (!article.intro) return ''
  const authorName = extractAuthorName(article)
  if (theme.id === 'red-white') return `<section style="margin:10px 10px 32px;background:#FFFFFF;border-radius:12px;box-shadow:0 4px 24px -4px rgba(220,38,38,0.15);padding:28px 24px 22px;overflow:hidden;"><p style="font-size:42px;color:#DC2626;font-weight:900;margin:0;line-height:0.6;">${plainLeaf('"')}</p><p style="font-size:16px;font-weight:800;color:#1C1917;margin:12px 0 8px;line-height:1.75;padding-left:4px;">${introMarkup(article, theme)}</p>${authorName ? `<p style="text-align:right;font-size:12px;color:#9CA3AF;margin:8px 0 0;letter-spacing:1px;">${plainLeaf(`—— ${escapeHtml(authorName)}`)}</p>` : ''}</section>`
  if (theme.id === 'graphite') return `<section style="margin:10px 10px 40px;padding:32px 24px 24px;border-top:1px solid #E4E4E7;border-bottom:1px solid #E4E4E7;background:#FFFFFF;"><p style="font-size:11px;color:#A1A1AA;letter-spacing:2px;margin:0 0 18px;font-weight:400;">${plainLeaf('QUOTE')}</p><p style="font-size:18px;font-weight:700;color:#27272A;margin:0 0 8px;line-height:1.7;letter-spacing:0.5px;">${introMarkup(article, theme)}</p>${authorName ? `<p style="text-align:right;font-size:12px;color:#A1A1AA;margin:16px 0 0;letter-spacing:1px;">${plainLeaf(`—— ${escapeHtml(authorName)}`)}</p>` : ''}</section>`
  return `<section style="margin:32px 16px 48px;padding:40px 24px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;"><p style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:19px;font-weight:600;color:#2B2B2B;margin:0 0 28px;line-height:1.85;letter-spacing:0.8px;">${introMarkup(article, theme)}</p>${authorName ? `<p style="font-size:12px;color:#A3A3A3;margin:0;letter-spacing:1.5px;">${plainLeaf(`—— ${escapeHtml(authorName)}`)}</p>` : ''}</section>`
}

function renderToc(article: ParsedArticle, theme: ThemeDefinition, settings: EditorSettings) {
  if (!settings.includeToc || theme.id === 'ticket' || theme.id === 'olive') return ''
  if (isKleinBlue(theme) && article.sections.length < 3) return ''
  if ((theme.id === 'red-white' || theme.id === 'graphite') && article.sections.length < 3) return ''
  if (article.sections.length < 2) return ''
  const items = article.sections.slice(0, 3)
  if (isKleinBlue(theme)) return `<section style="margin:0 10px 36px;padding:22px 18px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 16px;font-size:11px;color:#434650;letter-spacing:2px;">${plainLeaf('本文看点 · CONTENTS')}</p>${items.map((section, index) => `<section style="${index === items.length - 1 ? 'margin:0;' : 'margin:0 0 14px;padding:0 0 14px;border-bottom:1px solid #E8ECFF;'}display:flex;align-items:baseline;"><span style="width:34px;margin-right:10px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#002FA7;">${plainLeaf(String(index + 1).padStart(2, '0'))}</span><span style="flex:1;font-size:14px;line-height:1.6;font-weight:600;color:#111111;">${plainLeaf(escapeHtml(section.title))}</span></section>`).join('')}</section>`
  if (theme.id === 'moyu-green') return `<section style="margin:0 0 30px;"><section style="display:flex;justify-content:space-between;margin:0 0 9px;"><span style="font-size:9px;color:#9CA3AF;letter-spacing:1.5px;font-weight:700;">${plainLeaf(`${article.sections.length} PARTS + CONCLUSION`)}</span><span style="font-size:9px;color:#9CA3AF;">${plainLeaf('导读')}</span></section><section style="display:flex;align-items:stretch;">${items.map((section, index) => `<section style="flex:1;margin-right:${index === items.length - 1 ? '0' : '6px'};padding:10px 8px;background:${index === 0 ? 'linear-gradient(135deg,#059669,#10B981)' : '#FFFFFF'};border:${index === 0 ? '0' : '1px solid #E5E7EB'};border-radius:9px;"><p style="margin:0 0 4px;font-size:8px;font-weight:700;color:${index === 0 ? 'rgba(255,255,255,.75)' : '#9CA3AF'};">${plainLeaf(`PART ${String(index + 1).padStart(2, '0')}`)}</p><p style="margin:0;font-size:11px;font-weight:800;line-height:1.35;color:${index === 0 ? '#FFFFFF' : '#111827'};">${plainLeaf(escapeHtml(section.title))}</p></section>`).join('')}</section></section>`
  if (theme.id === 'red-white') return `<section style="padding:0 10px 32px;"><p style="font-size:14px;color:#9CA3AF;margin:0 0 14px;letter-spacing:1px;">${plainLeaf('📌 本文看点')}</p><section style="display:flex;justify-content:space-between;">${items.map((section, index) => `<section style="flex:1;background:#FEF2F2;border-radius:10px;padding:16px 12px;margin-right:${index === items.length - 1 ? '0' : '8px'};text-align:center;border:1px solid #FEE2E2;"><p style="display:inline-block;background:#DC2626;color:#FFFFFF;font-size:12px;font-weight:800;padding:2px 10px;border-radius:4px;margin:0 0 8px;">${plainLeaf(String(index + 1).padStart(2, '0'))}</p><p style="font-size:13px;font-weight:700;color:#1C1917;margin:0;">${plainLeaf(escapeHtml(section.title))}</p></section>`).join('')}</section></section>`
  if (theme.id === 'graphite') return `<section style="padding:0 10px 40px;"><p style="font-size:11px;color:#A1A1AA;margin:0 0 16px;letter-spacing:2px;">${plainLeaf('本文看点')}</p><section style="display:flex;justify-content:space-between;">${items.map((section, index) => `<section style="flex:1;background:#FAFAFA;border-top:1px solid #E4E4E7;padding:18px 12px 16px;margin-right:${index === items.length - 1 ? '0' : '8px'};"><p style="font-size:11px;color:#A1A1AA;font-weight:500;margin:0 0 8px;letter-spacing:1px;">${plainLeaf(String(index + 1).padStart(2, '0'))}</p><p style="font-size:13px;font-weight:700;color:#27272A;margin:0;line-height:1.5;">${plainLeaf(escapeHtml(section.title))}</p></section>`).join('')}</section></section>`
  return `<section style="padding:0 16px 48px;"><p style="font-size:11px;color:#A3A3A3;margin:0 0 20px;letter-spacing:2px;text-transform:uppercase;">${plainLeaf('本文脉络')}</p><section style="border-top:1px solid #E8E8E8;"><section style="display:flex;">${items.map((section, index) => `<section style="flex:1;padding:18px ${index === items.length - 1 ? '0' : '12px'} 18px 0;border-bottom:1px solid #E8E8E8;${index === items.length - 1 ? '' : 'border-right:1px solid #E8E8E8;margin-right:16px;'}"><p style="font-size:11px;color:#4A5D52;font-weight:600;margin:0 0 6px;letter-spacing:1px;">${plainLeaf(String(index + 1).padStart(2, '0'))}</p><p style="font-size:13px;color:#2B2B2B;margin:0;font-weight:500;line-height:1.5;">${plainLeaf(escapeHtml(section.title))}</p></section>`).join('')}</section></section></section>`
}

function renderSectionTitle(title: string, index: number, total: number, theme: ThemeDefinition, settings: EditorSettings) {
  const number = settings.autoNumber ? String(index + 1).padStart(2, '0') : ''
  const isLast = index === total - 1 && /总结|结语|最后|复利|自由/.test(title)
  if (isKleinBlue(theme)) {
    if (isLast) return `<section style="margin:48px 10px 28px;padding:18px 0;border-top:1px solid #D8E1F6;border-bottom:1px solid #D8E1F6;text-align:center;box-sizing:border-box;"><p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#002FA7;line-height:1;">${plainLeaf('∞')}</p><p style="margin:0 0 5px;font-size:20px;line-height:1.45;font-weight:600;color:#002FA7;">${plainLeaf(escapeHtml(title))}</p><p style="margin:0;font-size:10px;color:#434650;letter-spacing:2px;">${plainLeaf('THE END · EPILOGUE')}</p></section>`
    if (!number) return `<section style="margin:${index ? '48px' : '20px'} 10px 28px;padding:0 0 18px;border-bottom:1px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#434650;letter-spacing:2px;">${plainLeaf('CHAPTER · INSIGHT')}</p><p style="margin:0;font-size:22px;line-height:1.45;font-weight:600;color:#002FA7;">${plainLeaf(escapeHtml(title))}</p></section>`
    return `<section style="margin:${index ? '48px' : '20px'} 10px 28px;padding:0;box-sizing:border-box;"><p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1;color:#002FA7;">${plainLeaf(number)}</p><span style="display:block;width:82px;height:1px;margin:0 0 16px;background:#D8E1F6;font-size:0;line-height:0;">${plainLeaf('<br>')}</span><p style="margin:0 0 5px;font-size:21px;line-height:1.45;font-weight:600;color:#002FA7;">${plainLeaf(escapeHtml(title))}</p><p style="margin:0;font-size:10px;color:#434650;letter-spacing:2px;">${plainLeaf('STRUCTURE · INSIGHT')}</p></section>`
  }
  if (theme.id === 'moyu-green') return `<section style="display:flex;align-items:center;margin:${index ? '46px' : '20px'} 0 24px;"><section style="margin-right:14px;text-align:center;"><p style="margin:0;font-size:27px;font-weight:900;line-height:1;color:#059669;">${plainLeaf(isLast ? '///' : number)}</p><p style="margin:2px 0 0;font-size:8px;color:#D1D5DB;letter-spacing:1.5px;font-weight:700;">${plainLeaf(isLast ? 'LAST' : 'PART')}</p></section><span style="width:1px;height:34px;margin-right:14px;background:#E5E7EB;">${plainLeaf('<br>')}</span><section><p style="margin:0 0 2px;font-size:17px;font-weight:900;color:#111827;">${plainLeaf(escapeHtml(title))}</p><p style="margin:0;font-size:9px;color:#9CA3AF;letter-spacing:1.2px;">${plainLeaf(isLast ? 'CONCLUSION' : 'INSIGHT · CHAPTER')}</p></section></section>`
  if (theme.id === 'red-white') return `<section style="margin-top:${index ? '48px' : '16px'};margin-bottom:28px;padding:0 10px;"><section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #DC2626;"><section style="display:flex;align-items:center;"><span style="display:inline-block;background:#DC2626;color:#FFFFFF;font-size:18px;font-weight:900;padding:4px 14px;border-radius:6px;margin-right:14px;line-height:1.3;">${plainLeaf(isLast ? '∞' : number)}</span><section><p style="font-size:10px;color:#DC2626;font-weight:700;letter-spacing:3px;margin:0 0 2px;text-transform:uppercase;">${plainLeaf(isLast ? 'THE END' : 'INSIGHT · CHAPTER')}</p><h3 style="font-size:18px;font-weight:800;color:#1C1917;margin:0;letter-spacing:0.5px;">${plainLeaf(escapeHtml(title))}</h3></section></section></section></section>`
  if (theme.id === 'graphite') return `<section style="margin-top:${index ? '56px' : '16px'};margin-bottom:32px;padding:0 10px;"><section style="position:relative;padding-bottom:20px;border-bottom:1px solid #E4E4E7;"><p style="font-size:48px;font-weight:900;color:#E4E4E7;margin:0;line-height:1;letter-spacing:-2px;">${plainLeaf(isLast ? '∞' : number)}</p><section style="margin-top:-8px;"><p style="font-size:10px;color:#A1A1AA;font-weight:500;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;">${plainLeaf(isLast ? 'THE END' : 'INSIGHT · CHAPTER')}</p><h3 style="font-size:20px;font-weight:800;color:#27272A;margin:0;letter-spacing:0.5px;line-height:1.4;">${plainLeaf(escapeHtml(title))}</h3></section></section></section>`
  if (theme.id === 'zen') return `<section style="margin-top:64px;margin-bottom:32px;padding:0 16px;"><p style="font-size:10px;color:#4A5D52;font-weight:600;letter-spacing:4px;margin:0 0 10px;text-transform:uppercase;">${plainLeaf(isLast ? '∞ · POSTSCRIPT' : `${number} · CHAPTER ${chapterWords[index] ?? ''}`.trim())}</p><h3 style="font-family:'Noto Serif SC',Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#2B2B2B;margin:0 0 16px;letter-spacing:0.5px;line-height:1.4;">${plainLeaf(escapeHtml(title))}</h3><section style="width:40px;height:2px;background:#4A5D52;">${plainLeaf('<br>')}</section></section>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><section style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #1A1A1A;"><section style="background:#059669;color:#FFFFFF;font-size:12px;font-weight:800;padding:6px 12px;letter-spacing:2px;">${plainLeaf(number)}</section><section style="font-size:18px;font-weight:800;color:#1A1A1A;letter-spacing:1px;">${plainLeaf(escapeHtml(title))}</section><section style="font-size:12px;color:#888888;">${plainLeaf(isLast ? '/ 结语' : '/ 深度拆解')}</section></section></section>`
  return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="display:flex;align-items:center;gap:14px;"><section style="text-align:center;flex-shrink:0;"><p style="margin:0;font-size:24px;font-weight:800;color:#23251D;line-height:1;letter-spacing:-2px;">${plainLeaf(isLast ? '///' : number)}</p><p style="margin:0;font-size:8px;font-weight:700;color:#9EA096;letter-spacing:2px;">${plainLeaf(isLast ? 'END' : 'PART')}</p></section><span style="width:1px;height:36px;background:#BFC1B7;flex-shrink:0;display:inline-block;overflow:hidden;vertical-align:middle;font-size:0;line-height:0;">${plainLeaf('&nbsp;')}</span><section><p style="margin:0 0 1px;font-size:17px;font-weight:800;color:#23251D;letter-spacing:0.2px;">${plainLeaf(escapeHtml(title))}</p><p style="margin:0;font-size:11px;font-weight:600;color:#65675E;letter-spacing:1.2px;">${plainLeaf(isLast ? 'CONCLUSION' : 'INSIGHT · CHAPTER')}</p></section></section></section></section>`
}

function lastParagraphIndex(blocks: ParsedBlock[]) {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (blocks[index].type === 'paragraph') return index
  }
  return -1
}

function closingText(article: ParsedArticle) {
  for (let sectionIndex = article.sections.length - 1; sectionIndex >= 0; sectionIndex -= 1) {
    const blocks = article.sections[sectionIndex].blocks
    const index = lastParagraphIndex(blocks)
    if (index >= 0 && blocks[index].type === 'paragraph') return blocks[index].text
  }
  return article.intro || article.title
}

function renderSections(article: ParsedArticle, theme: ThemeDefinition, settings: EditorSettings) {
  return article.sections.map((section, index) => {
    const divider = (theme.id === 'zen' || ((theme.id === 'red-white' || theme.id === 'graphite') && index > 0)) ? renderDivider(theme, settings) : ''
    const title = renderSectionTitle(section.title, index, article.sections.length, theme, settings)
    const conclusionIndex = index === article.sections.length - 1 ? lastParagraphIndex(section.blocks) : -1
    let blocks = section.blocks.map((block, blockIndex) => {
      if (blockIndex === conclusionIndex && block.type === 'paragraph') {
        if (theme.id === 'ticket' || theme.id === 'olive' || isKleinBlue(theme)) return ''
        if (theme.id === 'zen') return `<p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;font-weight:600;color:#2B2B2B;padding:0 16px;">${inlineHtml(block.text, theme, settings.keywordUnderline)}</p>`
      }
      return renderBlock(block, theme, settings)
    }).join('')
    if (theme.id === 'red-white' || theme.id === 'graphite') blocks = `<section style="padding:0 10px;">${blocks}</section>`
    return `${divider}${title}${blocks}`
  }).join('')
}

function renderRecipeClosing(article: ParsedArticle, theme: ThemeDefinition, settings: EditorSettings) {
  const text = closingText(article)
  if (isKleinBlue(theme)) {
    if (hasComponent(article, 'klein-ending-summary')) return ''
    const label = settings.articleType === 'tutorial' || settings.articleType === 'case' ? 'ACTION NOTE · 实践总结' : settings.articleType === 'data' ? 'DATA NOTE · 复盘总结' : 'FINAL NOTE · 结尾总结'
    return `<section style="margin:42px 10px 28px;padding:26px 20px;background:#F3F6FF;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 10px;font-size:10px;color:#002FA7;letter-spacing:2px;">${plainLeaf(label)}</p><p style="margin:0 0 12px;font-size:20px;line-height:1.5;color:#002FA7;font-weight:600;">${plainLeaf('把结论交还给读者')}</p><p style="margin:0;font-size:14px;line-height:1.85;color:#434650;text-align:justify;">${inlineHtml(text, theme, false)}</p></section>`
  }
  if (theme.id === 'ticket') {
    const tags = article.sections.slice(0, 4)
    return `<section style="margin-bottom:32px;padding:0 20px;"><section style="background:#FFFEF8;border:2px solid #1A1A1A;box-shadow:3px 3px 0 #1A1A1A;padding:20px;margin-bottom:0;"><p style="font-size:15px;color:#1A1A1A;font-weight:700;line-height:1.8;margin:0;text-align:center;">${inlineHtml(text, theme, false)}</p></section></section><section style="margin-bottom:32px;padding:0 20px;"><section style="display:flex;gap:8px;flex-wrap:wrap;">${tags.map((section) => `<section style="font-size:10px;color:#059669;border:1px solid #059669;padding:4px 10px;">${plainLeaf(`#${escapeHtml(section.title.slice(0, 8))}`)}</section>`).join('')}</section></section>`
  }
  if (theme.id !== 'olive') return ''
  if (settings.articleType === 'opinion' || settings.articleType === 'interview') return `<section style="margin-top:24px;"><section style="background:#1E1F23;border:1px solid #23251D;padding:8px;box-sizing:border-box;border-radius:6px;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="border:1px solid rgba(255,255,255,0.16);border-radius:4px;padding:20px 22px;"><p style="margin:0 0 8px;font-size:10px;line-height:1.6;color:#A3A3A3;letter-spacing:4px;font-weight:800;">${plainLeaf('CLOSING')}</p><p style="margin:0;font-size:16px;line-height:1.9;color:#FAFAFA;font-weight:700;">${inlineHtml(text, theme, false)}</p></section></section></section>`
  if (settings.articleType === 'data' || settings.articleType === 'case') return `<section style="margin-top:24px;"><section style="border-radius:6px;overflow:hidden;border:1px solid #23251D;background:#1E1F23;font-family:'IBM Plex Sans',-apple-system,sans-serif;display:flex;align-items:stretch;"><section style="flex:1;padding:18px 18px 20px;border-right:1px solid rgba(255,255,255,0.08);"><p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.55);font-weight:700;">${plainLeaf('SUMMARY')}</p><p style="margin:0;font-size:15px;line-height:1.9;color:rgba(255,255,255,0.92);">${inlineHtml(text, theme, false)}</p></section><section style="width:34%;min-width:120px;padding:18px;background:#23251D;display:flex;flex-direction:column;justify-content:center;gap:10px;"><span style="display:inline-block;padding:4px 8px;background:#EEEFE9;color:#23251D;border-radius:4px;font-size:10px;font-weight:800;align-self:flex-start;">${plainLeaf('NEXT')}</span><p style="margin:0;font-size:13px;line-height:1.8;color:rgba(255,255,255,0.76);">${plainLeaf('把结论继续沉淀为可复用资产。')}</p></section></section></section>`
  return `<section style="margin-top:24px;"><section style="background:#EEEFE9;border:1px solid #BFC1B7;border-radius:6px;overflow:hidden;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><section style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;"><p style="margin:0;font-size:13px;line-height:1.7;color:#23251D;font-weight:700;">${inlineHtml(text, theme, false)}</p><span style="font-size:10px;color:#65675E;font-weight:800;letter-spacing:2px;">${plainLeaf('SUMMARY')}</span></section></section></section>`
}

function hasComponent(article: ParsedArticle, component: string) {
  const blocks = [...article.preface, ...article.sections.flatMap((section) => section.blocks)]
  return blocks.some((block) => block.type === 'component' && block.component.replace(/^block-/, '') === component)
}

function renderFooter(article: ParsedArticle, theme: ThemeDefinition) {
  const author = escapeHtml(extractAuthor(article))
  const ctaStart = '如果你觉得今天这篇有收获，欢迎'
  const ctaEnd = '三连，我们下篇见。'
  if (isKleinBlue(theme)) {
    const interaction = article.footerInteraction === false || hasComponent(article, 'klein-ending-interaction') ? '' : `<section style="margin:0 10px 28px;padding:26px 20px;background:#002FA7;border-radius:6px;text-align:center;box-sizing:border-box;box-shadow:0 8px 24px rgba(0,47,167,0.16);"><p style="margin:0 0 8px;font-size:18px;line-height:1.5;color:#FFFFFF;font-weight:600;">${plainLeaf('感谢读到这里')}</p><p style="margin:0 0 18px;font-size:13px;line-height:1.75;color:#E8ECFF;">${plainLeaf('如果这篇内容带来启发，可以用点赞、在看或转发完成一次轻量回应。')}</p><p style="margin:0;"><span style="display:inline-block;margin:0 4px;padding:6px 13px;background:#FFFFFF;color:#002FA7;border-radius:999px;font-size:11px;font-weight:700;">${plainLeaf('点赞')}</span><span style="display:inline-block;margin:0 4px;padding:6px 13px;background:#E8ECFF;color:#002FA7;border-radius:999px;font-size:11px;font-weight:700;">${plainLeaf('在看')}</span><span style="display:inline-block;margin:0 4px;padding:6px 13px;border:1px solid #FFFFFF;color:#FFFFFF;border-radius:999px;font-size:11px;font-weight:700;">${plainLeaf('转发')}</span></p></section>`
    const endMark = hasComponent(article, 'klein-end-mark') ? '' : `<section style="margin:0 10px 30px;padding:28px 18px;text-align:center;border-top:1px solid #D8E1F6;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 9px;font-size:22px;line-height:1.4;color:#002FA7;font-weight:600;">${plainLeaf('感谢你的阅读 ✦')}</p><p style="margin:0 0 18px;font-size:12px;line-height:1.7;color:#7D86A5;">${plainLeaf('愿你在深邃的蓝色中，找到属于自己的自由。')}</p><p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#002FA7;letter-spacing:2px;">${plainLeaf('— END —')}</p></section>`
    return `${interaction}${endMark}`
  }
  if (theme.id === 'moyu-green') return `<p style="margin:0 0 24px;font-size:14px;line-height:1.9;text-align:justify;color:#374151;">${plainLeaf(author)}</p><section style="background:radial-gradient(circle at center,#F9FAFB 0%,#FFFFFF 100%);border:1px solid #E5E7EB;border-radius:16px;padding:32px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);margin:0 0 24px;"><p style="font-size:13px;font-weight:bold;color:#111827;margin:0 0 20px;line-height:1.6;">${plainLeaf('既然看到这里了，如果觉得有用，随手点个赞、在看、转发三连吧。')}</p><section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;"><section style="text-align:center;cursor:pointer;color:#4B5563;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#FFFFFF;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.05);border:1px solid #F3F4F6;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('点赞')}</span></section><section style="text-align:center;cursor:pointer;color:#4B5563;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#FFFFFF;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.05);border:1px solid #F3F4F6;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('在看')}</span></section><section style="text-align:center;cursor:pointer;color:#059669;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#ECFDF5;border-radius:12px;box-shadow:0 2px 4px rgba(5,150,105,0.15);border:1px solid #A7F3D0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('转发')}</span></section></section><p style="font-size:10px;color:#9CA3AF;letter-spacing:1px;margin:0;">${plainLeaf('THANKS FOR READING')}</p></section>`
  if (theme.id === 'red-white') return `<section style="padding:0 10px;"><section style="text-align:center;margin:0 0 32px;"><section style="display:flex;align-items:center;justify-content:center;"><span style="height:2px;width:60px;background:linear-gradient(to right,transparent,#DC2626);margin-right:12px;">${plainLeaf('<br>')}</span><span style="font-size:11px;color:#DC2626;letter-spacing:3px;font-weight:700;">${plainLeaf('END')}</span><span style="height:2px;width:60px;background:linear-gradient(to left,transparent,#DC2626);margin-left:12px;">${plainLeaf('<br>')}</span></section></section></section><section style="padding:0 10px;"><p style="margin:0 0 20px;font-size:15px;line-height:1.8;text-align:justify;">${plainLeaf(author)}</p><p style="margin:0 0 20px;font-size:15px;line-height:1.8;text-align:justify;">${plainLeaf(ctaStart)}${strongLeaf('点赞、在看、转发', 'color:#DC2626;')}${plainLeaf(ctaEnd)}</p></section>`
  if (theme.id === 'graphite') return `<section style="padding:0 10px;"><section style="text-align:center;margin:0 0 36px;"><section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:#E4E4E7;margin-right:16px;">${plainLeaf('<br>')}</span><span style="font-size:10px;color:#A1A1AA;letter-spacing:4px;font-weight:500;">${plainLeaf('END')}</span><span style="height:1px;width:48px;background:#E4E4E7;margin-left:16px;">${plainLeaf('<br>')}</span></section></section></section><section style="padding:0 10px 24px;"><section style="border-top:1px solid #E4E4E7;padding-top:28px;"><p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#52525B;text-align:justify;">${plainLeaf(author)}</p><p style="margin:0;font-size:15px;line-height:1.8;color:#52525B;text-align:justify;">${plainLeaf(ctaStart)}${strongLeaf('点赞、在看、转发', 'color:#27272A;')}${plainLeaf(ctaEnd)}</p></section></section>`
  if (theme.id === 'zen') return `<section style="padding:0 16px;"><section style="text-align:center;margin:48px 0 40px;"><section style="display:flex;align-items:center;justify-content:center;"><span style="height:1px;width:48px;background:#E8E8E8;margin-right:16px;"></span><span style="font-size:10px;color:#A3A3A3;letter-spacing:4px;font-weight:400;">${plainLeaf('END')}</span><span style="height:1px;width:48px;background:#E8E8E8;margin-left:16px;"></span></section></section></section><section style="padding:0 16px 40px;"><p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;color:#525252;">${plainLeaf(author)}</p><p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;color:#525252;">${plainLeaf(ctaStart)}${strongLeaf('点赞、在看、转发', 'color:#4A5D52;')}${plainLeaf(ctaEnd)}</p></section>`
  if (theme.id === 'ticket') return `<section style="margin-bottom:32px;padding:0 20px;"><p style="font-size:14px;color:#555555;line-height:1.9;margin:0 0 16px;text-align:justify;">${plainLeaf(author)}</p></section><section style="padding:0 0 32px;"><section style="background:#FFFEF8;border:2px solid #1A1A1A;box-shadow:4px 4px 0 #1A1A1A;padding:24px 20px;text-align:center;"><p style="font-size:13px;font-weight:700;color:#1A1A1A;margin:0 0 20px;line-height:1.6;">${plainLeaf('如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。')}</p><section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;"><section style="text-align:center;color:#555555;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#FFFFFF;border:1px solid #1A1A1A;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('点赞')}</span></section><section style="text-align:center;color:#555555;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#FFFFFF;border:1px solid #1A1A1A;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('在看')}</span></section><section style="text-align:center;color:#059669;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#F0FDF4;border:2px solid #059669;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></section><span style="font-size:10px;font-weight:600;">${plainLeaf('星标')}</span></section></section><section style="border-top:1px dashed #CCCCCC;padding-top:12px;"><p style="font-size:10px;color:#999999;letter-spacing:2px;margin:0;">${plainLeaf('THANKS FOR READING ✂')}</p></section></section></section><p style="text-align:center;color:#D1D5DB;font-size:14px;margin:24px 0 0 0;">${plainLeaf('/')}</p>`
  return `<section style="margin-top:24px;"><section style="font-family:'IBM Plex Sans',-apple-system,sans-serif;"><p style="margin:0;font-size:14px;line-height:1.9;text-align:justify;color:#4D4F46;">${plainLeaf(author)}</p></section></section><section style="margin-top:24px;"><section style="background:#FDFDF8;border:1px solid #BFC1B7;border-radius:6px;padding:22px 16px;text-align:center;font-family:'IBM Plex Sans',-apple-system,sans-serif;"><p style="font-size:13px;font-weight:700;color:#23251D;line-height:1.6;margin:0 0 14px;">${plainLeaf('如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。')}</p><section style="display:flex;justify-content:center;gap:18px;margin-bottom:14px;flex-wrap:wrap;"><section style="text-align:center;color:#4D4F46;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#EEEFE9;border-radius:6px;border:1px solid #BFC1B7;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></section><span style="font-size:11px;font-weight:600;">${plainLeaf('赞')}</span></section><section style="text-align:center;color:#4D4F46;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#EEEFE9;border-radius:6px;border:1px solid #BFC1B7;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path></svg></section><span style="font-size:11px;font-weight:600;">${plainLeaf('在看')}</span></section><section style="text-align:center;color:#23251D;"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:#D4C9B8;border-radius:6px;border:1px solid #B17816;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23251D" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></section><span style="font-size:11px;font-weight:700;">${plainLeaf('收藏')}</span></section></section><p style="line-height:1.6;font-size:10px;color:#9EA096;letter-spacing:2px;margin:0;font-weight:500;">${plainLeaf('THANKS FOR READING')}</p></section></section>`
}

function renderPreamble(article: ParsedArticle, theme: ThemeDefinition, settings: EditorSettings) {
  const preface = article.preface.map((block) => renderBlock(block, theme, settings)).join('')
  if (isKleinBlue(theme)) return `${renderKleinCover(article, theme)}${preface}${renderToc(article, theme, settings)}`
  if (theme.id === 'moyu-green') return `${renderMoyuCover(article)}${renderToc(article, theme, settings)}${preface}`
  if (theme.id === 'red-white' || theme.id === 'graphite') return `${renderIntro(article, theme)}<section style="padding:0 10px;">${preface}</section>${renderToc(article, theme, settings)}`
  if (theme.id === 'zen') return `${renderIntro(article, theme)}<section style="padding:0 0 20px;">${preface}</section>${renderToc(article, theme, settings)}`
  if (theme.id === 'ticket') return `${renderTicketCover(article)}${preface}`
  return `${renderOliveHero(article, theme)}${preface}`
}

function containerStyle(theme: ThemeDefinition) {
  if (isKleinBlue(theme)) return "max-width:677px;margin:0 auto;background:#FFFFFF;color:#111111;font-family:'HarmonyOS Sans SC','HarmonyOS Sans','PingFang SC','Microsoft YaHei','Noto Sans CJK SC',sans-serif;line-height:1.75;letter-spacing:0.3px;overflow-x:hidden;"
  if (theme.id === 'moyu-green') return "box-sizing:border-box;max-width:677px;margin:0 auto;padding:24px 20px 34px;background:#FFFFFF;color:#374151;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.75;letter-spacing:0.3px;overflow-x:hidden;"
  if (theme.id === 'red-white') return "max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#374151;line-height:1.75;letter-spacing:0.5px;overflow-x:hidden;"
  if (theme.id === 'graphite') return "max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#52525B;line-height:1.8;letter-spacing:0.3px;overflow-x:hidden;"
  if (theme.id === 'zen') return "max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#525252;line-height:1.9;letter-spacing:0.3px;overflow-x:hidden;"
  if (theme.id === 'ticket') return "max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#374151;line-height:1.75;letter-spacing:0.5px;"
  return "max-width:677px;margin:0 auto;padding:8px;box-sizing:border-box;background:#FDFDF8;color:#4D4F46;font-family:'IBM Plex Sans',-apple-system,system-ui,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;line-height:1.75;"
}

export function buildWechatHtml(article: ParsedArticle, settings: EditorSettings, theme: ThemeDefinition) {
  const html = `<section style="${containerStyle(theme)}">${renderPreamble(article, theme, settings)}${renderSections(article, theme, settings)}${renderRecipeClosing(article, theme, settings)}${renderFooter(article, theme)}</section>`
  const hiddenMark = theme.id === 'ticket' || theme.id === 'olive' ? `<p style="display:none;"><mp-style-type data-value="3"></mp-style-type></p>` : ''
  return `${html}${hiddenMark}`
}

export function articleToPlainText(article: ParsedArticle) {
  const blocks = [...article.preface, ...article.sections.flatMap((section) => section.blocks)]
  const blockText = blocks.flatMap((block) => {
    if (block.type === 'paragraph' || block.type === 'subheading' || block.type === 'quote' || block.type === 'placeholder') return [block.text]
    if (block.type === 'code') return [block.code]
    if (block.type === 'image') return [block.alt]
    if (block.type === 'list') return block.items
    if (block.type === 'table') return [block.headers.join(' / '), ...block.rows.map((row) => row.join(' / '))]
    if (block.type === 'checklist') return block.items.map((item) => `${item.checked ? '✓' : '○'} ${item.text}`)
    if (block.type === 'imageGroup') return block.images.map((image) => image.alt)
    if (block.type === 'component') return [block.attrs.title || '', ...block.lines].filter(Boolean)
    return []
  })
  return [article.title, article.intro, ...article.sections.map((section) => section.title), ...blockText, article.ending].filter(Boolean).join('\n\n')
}

export function validateWechatHtml(html: string): HtmlValidation {
  const trimmed = html.trim()
  const validEnding = trimmed.endsWith('</section>') || /<\/section>\s*<p style="display:none;">\s*<mp-style-type data-value="3"><\/mp-style-type>\s*<\/p>$/.test(trimmed)
  const checks = [
    { label: '纯 section 正文片段', passed: trimmed.startsWith('<section') && validEnding },
    { label: '样式全部内联', passed: !/<style[\s>]/i.test(html) && /style="/.test(html) },
    { label: '无 div / class / id', passed: !/<\/?div[\s>]/i.test(html) && !/\s(?:class|id)=/i.test(html) },
    { label: '无脚本与定位禁项', passed: !/<script[\s>]/i.test(html) && !/position\s*:\s*(?:fixed|absolute|sticky)|display\s*:\s*grid/i.test(html) },
    { label: '文字使用 span leaf', passed: (html.match(/<span leaf="">/g) ?? []).length >= 10 },
  ]
  return { checks, errors: checks.filter((check) => !check.passed).map((check) => check.label) }
}
