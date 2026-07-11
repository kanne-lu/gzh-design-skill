import type { EditorSettings, ParsedBlock } from './types'

export interface KleinRenderContext {
  escape: (value: string) => string
  inline: (value: string, autoUnderline: boolean) => string
  leaf: (value: string) => string
}

type ComponentBlock = Extract<ParsedBlock, { type: 'component' }>
type ImageGroupBlock = Extract<ParsedBlock, { type: 'imageGroup' }>

const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/

function text(value: string, context: KleinRenderContext) {
  return context.leaf(context.escape(value))
}

function inline(value: string, context: KleinRenderContext) {
  return context.inline(value, false)
}

function cleanLine(value: string) {
  return value.trim().replace(/^[-*+]\s+/, '').replace(/^\d+[.、]\s+/, '').trim()
}

function contentLines(block: ComponentBlock) {
  return block.lines.map(cleanLine).filter(Boolean)
}

function parts(value: string) {
  const pipe = value.split('|').map((item) => item.trim()).filter(Boolean)
  if (pipe.length > 1) return pipe
  const colon = value.split(/[：:]/).map((item) => item.trim()).filter(Boolean)
  return colon.length > 1 ? colon : [value.trim()]
}

function componentName(value: string) {
  return value.trim().toLowerCase().replace(/^block-/, '').replaceAll('_', '-')
}

function componentText(block: ComponentBlock, index: number, fallback: string) {
  return contentLines(block)[index] || fallback
}

function componentTitle(block: ComponentBlock, fallback: string) {
  return block.attrs.title || componentText(block, 0, fallback)
}

function imageFromLine(value: string) {
  const match = value.trim().match(imagePattern)
  return match ? { alt: match[1], src: match[2] } : null
}

function renderLeadSummary(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const title = block.attrs.title || '专题摘要'
  const body = lines.join(' ') || '用一段克制的说明交代主题视角、阅读线索与结构重心。'
  return `<section style="margin:0 10px 32px;padding:20px 18px;background:#F3F6FF;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 8px;font-size:10px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('ABSTRACT · ' + title, context)}</p><p style="margin:0;font-size:14px;line-height:1.85;color:#434650;text-align:justify;">${inline(body, context)}</p></section>`
}

function renderLabelTitle(block: ComponentBlock, context: KleinRenderContext) {
  const title = componentTitle(block, '重点标题')
  return `<section style="margin:30px 10px 18px;padding:0;text-align:center;box-sizing:border-box;"><span style="display:inline-block;padding:5px 14px;background:#E8ECFF;border:1px solid #B8C8F5;border-radius:999px;font-size:13px;line-height:1.5;color:#002FA7;font-weight:700;">${inline(title, context)}</span></section>`
}

function renderLeadParagraph(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const label = block.attrs.label || block.attrs.title || '重点信息'
  const body = lines.join(' ') || '这里放置一段需要停下来阅读的关键判断。'
  return `<section style="margin:4px 10px 24px;padding:18px 20px;background:#F3F6FF;border-top:1px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 7px;font-size:11px;color:#002FA7;letter-spacing:1.5px;font-weight:600;">${text(label, context)}</p><p style="margin:0;font-size:16px;line-height:1.8;color:#111111;font-weight:600;">${inline(body, context)}</p></section>`
}

function renderQuoteVariant(block: ComponentBlock, context: KleinRenderContext, variant: 'solid' | 'rule' | 'centered') {
  const lines = contentLines(block)
  const quote = lines[0] || '让一段思考在章节之间停留片刻。'
  const source = block.attrs.source || lines[1] || ''
  if (variant === 'centered') return `<section style="margin:32px 10px;padding:22px 18px;border-top:1px solid #D8E1F6;border-bottom:1px solid #D8E1F6;text-align:center;box-sizing:border-box;"><p style="margin:0 0 12px;font-size:10px;color:#002FA7;letter-spacing:2px;">${text('✦ THOUGHT ✦', context)}</p><p style="margin:0;font-size:16px;line-height:1.9;font-weight:600;color:#002FA7;">${inline(quote, context)}</p></section>`
  if (variant === 'rule') return `<section style="margin:0 10px 28px;padding:14px 0 14px 20px;border-left:3px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 9px;font-size:10px;color:#7D86A5;letter-spacing:2px;">${text(source ? `REFERENCE · ${source}` : 'REFERENCE · 引用', context)}</p><p style="margin:0;font-size:15px;line-height:1.9;color:#434650;text-align:justify;">${inline(quote, context)}</p></section>`
  return `<section style="margin:8px 10px 28px;padding:22px 20px;background:linear-gradient(135deg,#002FA7 0%,#001E78 100%);border-radius:6px;box-shadow:0 8px 24px rgba(0,47,167,0.16);box-sizing:border-box;"><p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1;color:#E8ECFF;">${text('“', context)}</p><p style="margin:0${source ? ' 0 16px' : ''};font-size:16px;line-height:1.9;color:#FFFFFF;font-weight:600;">${inline(quote, context)}</p>${source ? `<p style="margin:0;text-align:right;font-size:11px;color:#E8ECFF;letter-spacing:1px;">${text(`—— ${source}`, context)}</p>` : ''}</section>`
}

function renderCallout(block: ComponentBlock, context: KleinRenderContext, variant: 'info' | 'tip' | 'warning' | 'success' | 'note') {
  const body = contentLines(block).join(' ') || '补充说明内容。'
  if (variant === 'note') return `<section style="margin:0 10px 24px;padding:12px 0 12px 18px;border-left:1px solid #B8C8F5;box-sizing:border-box;"><p style="margin:0;font-size:13px;line-height:1.8;color:#7D86A5;font-style:italic;">${inline(body, context)}</p></section>`
  const config = {
    info: { label: '◇ 信息说明', section: 'background:#F3F6FF;border:1px solid #D8E1F6;border-radius:6px;', body: 'color:#434650;' },
    tip: { label: '✦ 重点提示', section: 'padding:16px 0 16px 18px;border-left:4px solid #002FA7;border-top:1px solid #E8ECFF;border-bottom:1px solid #E8ECFF;', body: 'color:#111111;font-weight:600;' },
    warning: { label: '△ 风险提醒', section: 'background:#FFFFFF;border:1px solid #002FA7;border-radius:6px;', body: 'color:#434650;' },
    success: { label: '○ 完成确认', section: 'background:#E8ECFF;border-top:2px solid #002FA7;border-radius:0 0 6px 6px;', body: 'color:#111111;' },
  }[variant]
  const padding = variant === 'tip' ? '' : 'padding:18px 20px;'
  return `<section style="margin:0 10px 24px;${padding}${config.section}box-sizing:border-box;"><p style="margin:0 0 7px;font-size:11px;color:#002FA7;font-weight:700;letter-spacing:1px;">${text(block.attrs.title || config.label, context)}</p><p style="margin:0;font-size:14px;line-height:1.8;${config.body}">${inline(body, context)}</p></section>`
}

function renderCta(block: ComponentBlock, context: KleinRenderContext, primary: boolean) {
  const lines = contentLines(block)
  const title = block.attrs.title || lines[0] || (primary ? '继续完成下一步阅读' : '如果这部分与你有关，可以继续查看结构说明。')
  const description = block.attrs.description || lines[1] || ''
  const button = block.attrs.button || lines[2] || '查看延伸内容'
  const href = context.escape(block.attrs.url || '#')
  if (!primary) return `<section style="margin:0 10px 28px;padding:18px 0;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;text-align:center;box-sizing:border-box;"><p style="margin:0 0 12px;font-size:15px;line-height:1.7;font-weight:600;color:#111111;">${inline(title, context)}</p>${description ? `<p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:#434650;">${inline(description, context)}</p>` : ''}<a href="${href}" style="display:inline-block;padding:5px 14px;border:1px solid #B8C8F5;border-radius:999px;font-size:12px;color:#002FA7;font-weight:600;text-decoration:none;">${text(button, context)}</a></section>`
  return `<section style="margin:30px 10px;padding:26px 20px;background:#002FA7;border-radius:6px;text-align:center;box-shadow:0 8px 24px rgba(0,47,167,0.16);box-sizing:border-box;"><p style="margin:0 0 9px;font-size:18px;line-height:1.5;font-weight:600;color:#FFFFFF;">${inline(title, context)}</p>${description ? `<p style="margin:0 0 18px;font-size:13px;line-height:1.75;color:#E8ECFF;">${inline(description, context)}</p>` : ''}<a href="${href}" style="display:inline-block;padding:8px 18px;background:#FFFFFF;color:#002FA7;border-radius:999px;font-size:12px;font-weight:700;text-decoration:none;">${text(`${button} →`, context)}</a></section>`
}

function renderStep(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const title = block.attrs.title || lines[0] || '步骤说明'
  const body = lines.slice(block.attrs.title ? 0 : 1).join(' ') || '描述这一阶段需要完成的动作、判断条件和预期结果。'
  const step = String(block.attrs.step || '01').padStart(2, '0')
  return `<section style="margin:0 10px 24px;padding:20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:8px;box-shadow:0 6px 18px rgba(0,47,167,0.08);box-sizing:border-box;"><section style="display:flex;align-items:flex-start;margin:0 0 12px;"><span style="display:inline-block;flex:none;white-space:nowrap;margin:1px 10px 0 0;padding:3px 10px;background:#002FA7;color:#FFFFFF;border-radius:999px;font-family:Georgia,'Times New Roman',serif;font-size:11px;">${text(`STEP ${step}`, context)}</span><span style="font-size:15px;line-height:1.6;font-weight:700;color:#002FA7;">${inline(title, context)}</span></section><p style="margin:0;font-size:14px;line-height:1.8;color:#434650;text-align:justify;">${inline(body, context)}</p></section>`
}

function renderProcess(block: ComponentBlock, context: KleinRenderContext) {
  const entries = contentLines(block).map(parts).slice(0, 6)
  const rows = (entries.length ? entries : [['确认边界', '明确问题与输入条件'], ['组织结构', '整理材料并形成草案'], ['检查结果', '记录验证与复用方式']]).map((entry, index, all) => `<section style="${index === all.length - 1 ? 'margin:0;' : 'margin:0 0 14px;padding:0 0 14px;border-bottom:1px solid #D8E1F6;'}display:flex;align-items:flex-start;"><span style="width:26px;margin-right:12px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#002FA7;">${text(String(index + 1).padStart(2, '0'), context)}</span><span style="flex:1;font-size:14px;line-height:1.7;color:#434650;"><strong style="color:#111111;">${inline(entry[0], context)}</strong>${entry[1] ? text(`　${entry.slice(1).join('：')}`, context) : ''}</span></section>`).join('')
  return `<section style="margin:0 10px 30px;padding:22px 20px;background:#F3F6FF;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 16px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'PROCESS · 流程总览', context)}</p>${rows}</section>`
}

function renderTimeline(block: ComponentBlock, context: KleinRenderContext) {
  const entries = contentLines(block).map(parts).slice(0, 8)
  const fallback = [['阶段一', '起点', '记录起点与初始判断'], ['阶段二', '转折', '记录调整与关键变化'], ['阶段三', '结论', '记录结果与后续方向']]
  const rows = (entries.length ? entries : fallback).map((entry, index, all) => `<section style="display:flex;${index === all.length - 1 ? '' : 'margin:0 0 18px;'}"><section style="width:16px;margin-right:12px;text-align:center;"><span style="display:inline-block;width:8px;height:8px;background:#002FA7;border-radius:50%;font-size:0;line-height:0;">${context.leaf('<br>')}</span>${index === all.length - 1 ? '' : `<span style="display:block;width:1px;height:42px;margin:3px auto 0;background:#B8C8F5;font-size:0;line-height:0;">${context.leaf('<br>')}</span>`}</section><section style="flex:1;"><p style="margin:0 0 3px;font-size:10px;color:#002FA7;letter-spacing:1px;">${inline(entry[0] || `阶段 ${index + 1}`, context)}</p><p style="margin:0 0 4px;font-size:14px;color:#111111;font-weight:700;">${inline(entry[1] || entry[0], context)}</p>${entry[2] ? `<p style="margin:0;font-size:12px;line-height:1.65;color:#7D86A5;">${inline(entry.slice(2).join('：'), context)}</p>` : ''}</section></section>`).join('')
  return `<section style="margin:0 10px 30px;padding:20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 18px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'TIMELINE · 阶段脉络', context)}</p>${rows}</section>`
}

function renderImageGroup(block: ImageGroupBlock, context: KleinRenderContext) {
  const images = block.images.map((image) => ({ alt: context.escape(image.alt), src: context.escape(image.src) }))
  if (block.variant === 'comparison') return `<section style="margin:0 10px 30px;padding:20px;background:#FFFFFF;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 16px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('COMPARE · 双图对比', context)}</p>${images.map((image, index) => `<figure style="margin:0${index === images.length - 1 ? '' : ' 0 18px'};padding:0;"><p style="margin:0 0 7px;font-size:11px;color:#7D86A5;">${context.leaf(image.alt || `对比项 ${index ? 'B' : 'A'}`)}</p><span leaf=""><img src="${image.src}" alt="${image.alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;"></span></figure>`).join('')}</section>`
  return `<section style="margin:0 10px 30px;padding:18px;background:#F3F6FF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 14px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('GALLERY · 图像序列', context)}</p><section style="display:flex;align-items:stretch;">${images.map((image, index) => `<figure style="width:${Math.floor(100 / images.length) - 2}%;margin:0 ${index === images.length - 1 ? '0' : '2%'} 0 0;padding:0;"><span leaf=""><img src="${image.src}" alt="${image.alt}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></figure>`).join('')}</section><p style="margin:12px 0 0;text-align:center;font-size:10px;color:#7D86A5;letter-spacing:3px;">${text('●　○　○', context)}</p></section>`
}

function renderTable(block: Extract<ParsedBlock, { type: 'table' }>, context: KleinRenderContext) {
  const head = block.headers.map((cell) => `<th style="padding:9px 10px;background:#002FA7;color:#FFFFFF;text-align:left;font-weight:700;">${inline(cell, context)}</th>`).join('')
  const rows = block.rows.map((row, rowIndex) => `<tr>${block.headers.map((_, cellIndex) => `<td style="padding:9px 10px;border-bottom:1px solid #D8E1F6;${rowIndex % 2 ? 'background:#F3F6FF;' : ''}color:${cellIndex ? '#434650' : '#111111'};">${inline(row[cellIndex] || '', context)}</td>`).join('')}</tr>`).join('')
  return `<section style="margin:0 10px 28px;overflow-x:auto;box-sizing:border-box;"><p style="margin:0 0 12px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('DATA · 字段对照', context)}</p><table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.6;"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></section>`
}

function renderMetrics(block: ComponentBlock, context: KleinRenderContext, count: 2 | 3) {
  const entries = contentLines(block).map(parts).slice(0, count)
  while (entries.length < count) entries.push([count === 2 ? 'XX' : String.fromCharCode(65 + entries.length), '指标说明'])
  if (count === 2) return `<section style="margin:0 10px 28px;padding:20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><section style="display:flex;align-items:stretch;">${entries.map((entry, index) => `<section style="flex:1;${index ? '' : 'margin-right:8px;'}padding:18px 12px;background:${index ? '#F3F6FF' : '#002FA7'};${index ? 'border:1px solid #D8E1F6;' : ''}text-align:center;border-radius:4px;"><p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1;color:${index ? '#002FA7' : '#FFFFFF'};">${inline(entry[0], context)}</p><p style="margin:0;font-size:11px;color:${index ? '#7D86A5' : '#E8ECFF'};">${inline(entry.slice(1).join('：'), context)}</p></section>`).join('')}</section></section>`
  return `<section style="margin:0 10px 28px;padding:20px 18px;background:#F3F6FF;border-top:1px solid #002FA7;box-sizing:border-box;"><section style="display:flex;align-items:flex-start;">${entries.map((entry, index) => `<section style="flex:1;${index ? 'border-left:1px solid #D8E1F6;padding-left:12px;' : ''}${index < entries.length - 1 ? 'margin-right:8px;' : ''}"><p style="margin:0 0 5px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#002FA7;">${inline(entry[0], context)}</p><p style="margin:0;font-size:11px;color:#7D86A5;">${inline(entry.slice(1).join('：'), context)}</p></section>`).join('')}</section></section>`
}

function renderProgress(block: ComponentBlock, context: KleinRenderContext) {
  const entries = contentLines(block).map(parts).slice(0, 8)
  const safeEntries = entries.length ? entries : [['项目 A', '72'], ['项目 B', '48']]
  return `<section style="margin:0 10px 30px;padding:20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 16px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'PROGRESS · 比例示意', context)}</p>${safeEntries.map((entry, index) => { const percentage = Math.max(0, Math.min(100, Number.parseFloat(entry[1]) || 0)); return `<p style="margin:0 0 6px;font-size:12px;color:#434650;">${inline(entry[0], context)}</p><section style="height:6px;${index === safeEntries.length - 1 ? '' : 'margin:0 0 16px;'}background:#E8ECFF;border-radius:999px;overflow:hidden;"><span style="display:block;width:${percentage}%;height:6px;background:${index ? '#0648D8' : '#002FA7'};border-radius:999px;font-size:0;line-height:0;">${context.leaf('<br>')}</span></section>` }).join('')}</section>`
}

function renderChecklist(block: Extract<ParsedBlock, { type: 'checklist' }>, context: KleinRenderContext) {
  return `<section style="margin:0 10px 30px;padding:20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 14px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('CHECKLIST · 检查清单', context)}</p>${block.items.map((item, index) => `<p style="margin:0${index === block.items.length - 1 ? '' : ' 0 10px'};font-size:14px;line-height:1.7;color:${item.checked ? '#434650' : '#7D86A5'};"><span style="display:inline-block;width:18px;margin-right:8px;color:${item.checked ? '#002FA7' : '#B8C8F5'};font-weight:700;">${text(item.checked ? '✓' : '○', context)}</span>${inline(item.text, context)}</p>`).join('')}</section>`
}

function renderFaq(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const items: Array<{ question: string; answer: string }> = []
  for (const line of lines) {
    const question = line.match(/^(?:Q|问)[：:]?\s*(.+)$/i)
    const answer = line.match(/^(?:A|答)[：:]?\s*(.+)$/i)
    if (question) items.push({ question: question[1], answer: '' })
    else if (answer && items.length) items[items.length - 1].answer = answer[1]
    else if (items.length && !items[items.length - 1].answer) items[items.length - 1].answer = line
  }
  if (!items.length) items.push({ question: block.attrs.title || '这里适合回答什么？', answer: lines.join(' ') || '用简洁段落说明判断条件、适用范围与必要限制。' })
  return `<section style="margin:0 10px 30px;padding:20px 18px;background:#F3F6FF;border-top:1px solid #002FA7;box-sizing:border-box;"><p style="margin:0 0 16px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text('FAQ · 常见问答', context)}</p>${items.map((item, index) => `<section style="margin:0;${index === items.length - 1 ? '' : 'margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #D8E1F6;'}"><p style="margin:0 0 7px;font-size:14px;line-height:1.7;color:#111111;font-weight:700;">${text(`Q　${item.question}`, context)}</p><p style="margin:0;font-size:13px;line-height:1.75;color:#434650;">${text(`A　${item.answer}`, context)}</p></section>`).join('')}</section>`
}

function renderAuthor(block: ComponentBlock, context: KleinRenderContext) {
  const lineParts = parts(contentLines(block)[0] || '')
  const name = block.attrs.name || lineParts[0] || '作者'
  const role = block.attrs.role || lineParts[1] || '内容创作者'
  const bio = block.attrs.bio || contentLines(block).slice(1).join(' ') || lineParts.slice(2).join('：') || `长期关注${role}。`
  return `<section style="margin:0 10px 30px;padding:22px 20px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:8px;box-shadow:0 6px 18px rgba(0,47,167,0.08);box-sizing:border-box;"><section style="display:flex;align-items:center;margin:0 0 14px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin-right:13px;background:#002FA7;color:#FFFFFF;border-radius:50%;font-family:Georgia,'Times New Roman',serif;font-size:18px;">${text(name.slice(0, 1).toUpperCase(), context)}</span><section style="flex:1;"><p style="margin:0 0 3px;font-size:15px;color:#111111;font-weight:700;">${text(name, context)}</p><p style="margin:0;font-size:10px;color:#7D86A5;letter-spacing:1px;">${text(`AUTHOR · ${role}`, context)}</p></section></section><p style="margin:0;font-size:13px;line-height:1.75;color:#434650;text-align:justify;">${inline(bio, context)}</p></section>`
}

function renderContact(block: ComponentBlock, context: KleinRenderContext) {
  const entries = contentLines(block).map(parts)
  const safeEntries = entries.length ? entries : [['联系渠道', '请补充联系信息']]
  return `<section style="margin:0 10px 28px;padding:20px;background:#F3F6FF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 12px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'CONTACT · 联系信息', context)}</p>${safeEntries.map((entry, index) => `<p style="margin:0${index === safeEntries.length - 1 ? '' : ' 0 8px'};font-size:13px;line-height:1.7;color:#434650;"><span style="display:inline-block;min-width:62px;margin-right:8px;color:#7D86A5;">${inline(entry[0], context)}</span>${inline(entry.slice(1).join('：'), context)}</p>`).join('')}</section>`
}

function renderDownload(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const title = block.attrs.title || lines[0] || '扩展材料'
  const description = block.attrs.description || lines[1] || '获取静态补充文档或阅读清单。'
  const button = block.attrs.button || lines[2] || '查看获取方式'
  return `<section style="margin:0 10px 28px;padding:24px 20px;background:#002FA7;border-radius:6px;text-align:center;box-sizing:border-box;"><p style="margin:0 0 8px;font-size:17px;line-height:1.5;color:#FFFFFF;font-weight:600;">${inline(title, context)}</p><p style="margin:0 0 17px;font-size:12px;line-height:1.7;color:#E8ECFF;">${inline(description, context)}</p><span style="display:inline-block;padding:7px 16px;background:#FFFFFF;color:#002FA7;border-radius:999px;font-size:12px;font-weight:700;">${text(`${button} ↓`, context)}</span></section>`
}

function renderReading(block: ComponentBlock, context: KleinRenderContext) {
  const entries = contentLines(block).map(parts)
  const safeEntries = entries.length ? entries : [['延伸条目', '补充与正文相关的阅读方向']]
  return `<section style="margin:0 10px 30px;padding:0;box-sizing:border-box;"><p style="margin:0 0 14px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'FURTHER READING · 延伸阅读', context)}</p>${safeEntries.map((entry, index) => `<section style="margin:0${index === safeEntries.length - 1 ? '' : ' 0 12px'};padding:14px 16px;background:#FFFFFF;border:1px solid #D8E1F6;border-left:3px solid ${index ? '#B8C8F5' : '#002FA7'};"><p style="margin:0 0 4px;font-size:14px;color:#111111;font-weight:700;">${inline(entry[0], context)}</p>${entry[1] ? `<p style="margin:0;font-size:12px;line-height:1.65;color:#7D86A5;">${inline(entry.slice(1).join('：'), context)}</p>` : ''}</section>`).join('')}</section>`
}

function renderTags(block: ComponentBlock, context: KleinRenderContext) {
  const tags = contentLines(block).flatMap((line) => line.split(/[，,、/|]/)).map((item) => item.trim()).filter(Boolean).slice(0, 12)
  const safeTags = tags.length ? tags : ['克莱因蓝', '结构', '阅读']
  const styles = ['background:#E8ECFF;border:1px solid #E8ECFF;color:#002FA7;', 'background:#FFFFFF;border:1px solid #B8C8F5;color:#002FA7;', 'background:#002FA7;border:1px solid #002FA7;color:#FFFFFF;', 'background:#FFFFFF;border:1px solid #D8E1F6;color:#434650;']
  return `<section style="margin:0 10px 28px;padding:20px;background:#F3F6FF;border:1px solid #D8E1F6;border-radius:6px;box-sizing:border-box;"><p style="margin:0 0 14px;font-size:11px;color:#002FA7;letter-spacing:2px;font-weight:700;">${text(block.attrs.title || 'TAGS · 标签组合', context)}</p><p style="margin:0;line-height:2.2;">${safeTags.map((tag, index) => `<span style="display:inline-block;margin:0 8px 8px 0;padding:4px 12px;${styles[index % styles.length]}border-radius:999px;font-size:12px;line-height:1.4;">${inline(tag, context)}</span>`).join('')}</p></section>`
}

function renderArticleCard(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const imageLine = lines.map(imageFromLine).find(Boolean)
  const copy = lines.filter((line) => !imageFromLine(line))
  const title = block.attrs.title || copy[0] || '推荐内容'
  const description = block.attrs.description || copy[1] || '用于推荐相关内容、案例或进一步阅读材料。'
  const cta = block.attrs.button || copy[2] || '阅读详情'
  const src = block.attrs.image || imageLine?.src || ''
  const alt = block.attrs.alt || imageLine?.alt || title
  return `<section style="margin:0 10px 30px;background:#FFFFFF;border:1px solid #D8E1F6;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,47,167,0.08);box-sizing:border-box;">${src ? `<span leaf=""><img src="${context.escape(src)}" alt="${context.escape(alt)}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>` : ''}<section style="padding:18px 20px;"><section style="display:flex;align-items:center;margin:0 0 7px;"><span style="flex:1;font-size:15px;color:#002FA7;font-weight:700;">${inline(title, context)}</span><span style="font-size:15px;color:#002FA7;">${text('✦', context)}</span></section><p style="margin:0 0 12px;font-size:13px;line-height:1.75;color:#434650;">${inline(description, context)}</p><p style="margin:0;font-size:12px;color:#002FA7;font-weight:700;">${text(`→ ${cta}`, context)}</p></section></section>`
}

function renderSummary(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const title = block.attrs.title || lines[0] || '把复杂内容压缩成一条清晰判断'
  const body = block.attrs.description || lines.slice(block.attrs.title ? 0 : 1).join(' ') || '汇总本节最重要的逻辑、证据与边界，方便读者快速回看。'
  return `<section style="margin:0 10px 30px;padding:24px 20px;background:#FFFFFF;border-top:3px solid #002FA7;border-right:1px solid #D8E1F6;border-bottom:1px solid #D8E1F6;border-left:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 10px;font-size:10px;color:#7D86A5;letter-spacing:2px;">${text(block.attrs.label || 'SUMMARY · 重点摘要', context)}</p><p style="margin:0 0 10px;font-size:18px;line-height:1.5;color:#002FA7;font-weight:600;">${inline(title, context)}</p><p style="margin:0;font-size:14px;line-height:1.8;color:#434650;text-align:justify;">${inline(body, context)}</p></section>`
}

function renderCoverRecommendation(block: ComponentBlock, context: KleinRenderContext) {
  const lines = contentLines(block)
  const imageLine = lines.map(imageFromLine).find(Boolean)
  const copy = lines.filter((line) => !imageFromLine(line))
  const title = block.attrs.title || copy[0] || '克莱因蓝的阅读世界'
  const description = block.attrs.description || copy[1] || '用于公众号头图的简短结构说明。'
  const src = block.attrs.image || imageLine?.src || ''
  return `<section style="margin:0 10px 34px;padding:0;background:#002FA7;border-radius:6px;overflow:hidden;box-shadow:0 8px 24px rgba(0,47,167,0.16);box-sizing:border-box;"><section style="padding:28px 22px 24px;"><p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:9px;color:#E8ECFF;letter-spacing:2px;">${text('COVER RECOMMENDATION', context)}</p><p style="margin:0 0 12px;font-size:22px;line-height:1.4;color:#FFFFFF;font-weight:600;">${inline(title, context)}</p><p style="margin:0;font-size:12px;line-height:1.7;color:#E8ECFF;">${inline(description, context)}</p></section>${src ? `<span leaf=""><img src="${context.escape(src)}" alt="${context.escape(title)}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>` : ''}</section>`
}

function renderEndingVariant(block: ComponentBlock, context: KleinRenderContext, variant: 'summary' | 'interaction' | 'end') {
  const lines = contentLines(block)
  if (variant === 'summary') {
    const title = block.attrs.title || lines[0] || '把结论交还给读者'
    const body = lines.slice(block.attrs.title ? 0 : 1).join(' ') || '回收全文的核心问题，并给出一个可继续思考的方向。'
    return `<section style="margin:42px 10px 28px;padding:26px 20px;background:#F3F6FF;border-top:1px solid #002FA7;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 10px;font-size:10px;color:#002FA7;letter-spacing:2px;">${text('FINAL NOTE · 结尾总结', context)}</p><p style="margin:0 0 12px;font-size:20px;line-height:1.5;color:#002FA7;font-weight:600;">${inline(title, context)}</p><p style="margin:0;font-size:14px;line-height:1.85;color:#434650;text-align:justify;">${inline(body, context)}</p></section>`
  }
  if (variant === 'interaction') return `<section style="margin:0 10px 28px;padding:26px 20px;background:#002FA7;border-radius:6px;text-align:center;box-sizing:border-box;"><p style="margin:0 0 8px;font-size:18px;line-height:1.5;color:#FFFFFF;font-weight:600;">${inline(block.attrs.title || lines[0] || '感谢读到这里', context)}</p><p style="margin:0 0 18px;font-size:13px;line-height:1.75;color:#E8ECFF;">${inline(lines[1] || '如果这段内容带来启发，可以用点赞、在看或转发完成一次轻量回应。', context)}</p><p style="margin:0;"><span style="display:inline-block;margin:0 4px;padding:6px 13px;background:#FFFFFF;color:#002FA7;border-radius:999px;font-size:11px;font-weight:700;">${text('点赞', context)}</span><span style="display:inline-block;margin:0 4px;padding:6px 13px;background:#E8ECFF;color:#002FA7;border-radius:999px;font-size:11px;font-weight:700;">${text('在看', context)}</span><span style="display:inline-block;margin:0 4px;padding:6px 13px;border:1px solid #FFFFFF;color:#FFFFFF;border-radius:999px;font-size:11px;font-weight:700;">${text('转发', context)}</span></p></section>`
  return `<section style="margin:0 10px 30px;padding:28px 18px;text-align:center;border-top:1px solid #D8E1F6;border-bottom:1px solid #D8E1F6;box-sizing:border-box;"><p style="margin:0 0 9px;font-size:22px;line-height:1.4;color:#002FA7;font-weight:600;">${inline(block.attrs.title || lines[0] || '感谢你的阅读 ✦', context)}</p><p style="margin:0 0 18px;font-size:12px;line-height:1.7;color:#7D86A5;">${inline(lines[1] || '愿你在深邃的蓝色中，找到属于自己的自由。', context)}</p><p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#002FA7;letter-spacing:2px;">${text('— END —', context)}</p></section>`
}

function directiveImageGroup(block: ComponentBlock, context: KleinRenderContext, variant: 'comparison' | 'gallery') {
  const images = block.lines.map(imageFromLine).filter((image): image is NonNullable<typeof image> => Boolean(image))
  return renderImageGroup({ type: 'imageGroup', variant, images }, context)
}

function renderDirectiveCode(block: ComponentBlock, context: KleinRenderContext) {
  const rows = block.lines.map((row, index) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:${index ? '#002FA7' : '#111111'};">${text(row || ' ', context)}</p>`).join('')
  return `<section style="margin:0 10px 28px;background:#F3F6FF;border:1px solid #D8E1F6;border-left:3px solid #002FA7;border-radius:6px;overflow:hidden;box-sizing:border-box;"><section style="padding:8px 14px;border-bottom:1px solid #D8E1F6;"><span style="font-family:Consolas,Monaco,monospace;font-size:11px;color:#7D86A5;letter-spacing:1px;">${text(block.attrs.language || block.attrs.title || 'config', context)}</span></section><section style="padding:12px 14px;">${rows}</section></section>`
}

function renderDirectiveTable(block: ComponentBlock, context: KleinRenderContext) {
  const rows = contentLines(block).map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
  const headers = rows.shift() || ['字段', '说明']
  const body = rows.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)))
  return renderTable({ type: 'table', headers, rows: body }, context)
}

function renderDirectiveChecklist(block: ComponentBlock, context: KleinRenderContext) {
  const items = contentLines(block).map((line) => {
    const match = line.match(/^\[([ xX])\]\s*(.+)$/)
    return { checked: match ? match[1].toLowerCase() === 'x' : false, text: match?.[2] || line }
  })
  return renderChecklist({ type: 'checklist', items }, context)
}

function renderDirectiveDivider(context: KleinRenderContext, variant: 'star' | 'diamond') {
  if (variant === 'star') return `<section style="margin:34px 10px;display:flex;align-items:center;box-sizing:border-box;"><span style="font-size:12px;color:#002FA7;">${text('✦', context)}</span><span style="flex:1;height:1px;margin:0 12px;background:#B8C8F5;font-size:0;line-height:0;">${context.leaf('<br>')}</span><span style="font-size:10px;color:#002FA7;">${text('◆', context)}</span><span style="flex:1;height:1px;margin:0 12px;background:#B8C8F5;font-size:0;line-height:0;">${context.leaf('<br>')}</span><span style="font-size:12px;color:#002FA7;">${text('✦', context)}</span></section>`
  return `<section style="margin:34px 10px;display:flex;align-items:center;box-sizing:border-box;"><span style="flex:1;height:1px;background:#B8C8F5;font-size:0;line-height:0;">${context.leaf('<br>')}</span><span style="margin:0 12px;font-size:10px;color:#002FA7;">${text('◆', context)}</span><span style="flex:1;height:1px;background:#B8C8F5;font-size:0;line-height:0;">${context.leaf('<br>')}</span></section>`
}

function renderDirective(block: ComponentBlock, context: KleinRenderContext) {
  const name = componentName(block.component)
  if (name === 'klein-lead-summary') return renderLeadSummary(block, context)
  if (name === 'klein-label-title') return renderLabelTitle(block, context)
  if (name === 'klein-lead-paragraph') return renderLeadParagraph(block, context)
  if (name === 'klein-quote-solid') return renderQuoteVariant(block, context, 'solid')
  if (name === 'klein-quote-rule') return renderQuoteVariant(block, context, 'rule')
  if (name === 'klein-quote-centered') return renderQuoteVariant(block, context, 'centered')
  if (name === 'klein-callout-info') return renderCallout(block, context, 'info')
  if (name === 'klein-callout-tip') return renderCallout(block, context, 'tip')
  if (name === 'klein-callout-warning') return renderCallout(block, context, 'warning')
  if (name === 'klein-callout-success') return renderCallout(block, context, 'success')
  if (name === 'klein-callout-note') return renderCallout(block, context, 'note')
  if (name === 'klein-cta-primary') return renderCta(block, context, true)
  if (name === 'klein-cta-secondary') return renderCta(block, context, false)
  if (name === 'klein-step-card') return renderStep(block, context)
  if (name === 'klein-process-overview') return renderProcess(block, context)
  if (name === 'klein-timeline') return renderTimeline(block, context)
  if (name === 'klein-image-comparison') return directiveImageGroup(block, context, 'comparison')
  if (name === 'klein-image-gallery') return directiveImageGroup(block, context, 'gallery')
  if (name === 'klein-code-light') return renderDirectiveCode(block, context)
  if (name === 'klein-data-table') return renderDirectiveTable(block, context)
  if (name === 'klein-metric-pair') return renderMetrics(block, context, 2)
  if (name === 'klein-metric-triple') return renderMetrics(block, context, 3)
  if (name === 'klein-progress-bars') return renderProgress(block, context)
  if (name === 'klein-checklist') return renderDirectiveChecklist(block, context)
  if (name === 'klein-faq') return renderFaq(block, context)
  if (name === 'klein-author-card') return renderAuthor(block, context)
  if (name === 'klein-contact-card') return renderContact(block, context)
  if (name === 'klein-download-guide') return renderDownload(block, context)
  if (name === 'klein-further-reading') return renderReading(block, context)
  if (name === 'klein-tag-group') return renderTags(block, context)
  if (name === 'klein-article-card') return renderArticleCard(block, context)
  if (name === 'klein-summary-card') return renderSummary(block, context)
  if (name === 'klein-cover-recommendation') return renderCoverRecommendation(block, context)
  if (name === 'klein-divider-star') return renderDirectiveDivider(context, 'star')
  if (name === 'klein-divider-diamond') return renderDirectiveDivider(context, 'diamond')
  if (name === 'klein-ending-summary') return renderEndingVariant(block, context, 'summary')
  if (name === 'klein-ending-interaction') return renderEndingVariant(block, context, 'interaction')
  if (name === 'klein-end-mark') return renderEndingVariant(block, context, 'end')
  return null
}

export function renderKleinExtension(block: ParsedBlock, _settings: EditorSettings, context: KleinRenderContext) {
  if (block.type === 'table') return renderTable(block, context)
  if (block.type === 'checklist') return renderChecklist(block, context)
  if (block.type === 'imageGroup') return renderImageGroup(block, context)
  if (block.type === 'component') return renderDirective(block, context)
  return null
}
