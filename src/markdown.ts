import type { ParsedArticle, ParsedBlock, ParsedSection } from './types'

const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/
const placeholderPattern = /^(?:【插入[：:]?.+】|待补(?:录屏|图片|GIF|视频|截图|素材).*)$/i
const componentDirectivePattern = /^:::gzh(?:\s+(.+))?$/i
const checklistPattern = /^[-*+]\s+\[([ xX])\]\s+(.+)$/
const prefixPattern = /^(摘要导读|联系方式|延伸阅读|轻行动|导读|引导|金句|信息|提示|重点|警告|注意|完成|结果|旁注|行动|步骤|摘要|作者|联系|下载|标签|推荐)[：:]\s*(.*)$/

const prefixComponents: Record<string, string> = {
  导读: 'klein-lead-summary',
  摘要导读: 'klein-lead-summary',
  引导: 'klein-lead-paragraph',
  金句: 'klein-quote-centered',
  信息: 'klein-callout-info',
  提示: 'klein-callout-tip',
  重点: 'klein-callout-tip',
  警告: 'klein-callout-warning',
  注意: 'klein-callout-warning',
  完成: 'klein-callout-success',
  结果: 'klein-callout-success',
  旁注: 'klein-callout-note',
  行动: 'klein-cta-primary',
  轻行动: 'klein-cta-secondary',
  步骤: 'klein-step-card',
  摘要: 'klein-summary-card',
  作者: 'klein-author-card',
  联系: 'klein-contact-card',
  联系方式: 'klein-contact-card',
  下载: 'klein-download-guide',
  延伸阅读: 'klein-further-reading',
  标签: 'klein-tag-group',
  推荐: 'klein-article-card',
}

function normalizeCodeFence(info: string) {
  const normalized = info.trim()
  const light = normalized.match(/^light(?:(?::|-)\s*(\S+))?$/i)
  return {
    language: (light ? light[1] : normalized)?.trim().toLowerCase() || 'text',
    variant: light ? 'light' as const : 'dark' as const,
  }
}

function parseDirectiveAttributes(source = '') {
  const attrs: Record<string, string> = {}
  const attributePattern = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/g
  let match: RegExpExecArray | null
  while ((match = attributePattern.exec(source)) !== null) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attrs
}

function parsePrefixedComponent(line: string): Extract<ParsedBlock, { type: 'component' }> | null {
  const bold = line.match(/^\*\*(.+)\*\*$/)
  const match = (bold?.[1] ?? line).match(prefixPattern)
  if (!match) return null
  const title = match[1]
  const content = match[2].trim()
  const component = prefixComponents[title]
  const lines = component === 'klein-tag-group'
    ? content.split(/[、，,|]/).map((item) => item.trim()).filter(Boolean)
    : content ? [content] : []
  return { type: 'component', component, attrs: { fallback: line }, lines }
}

function splitTableRow(line: string) {
  let source = line.trim()
  if (source.startsWith('|')) source = source.slice(1)
  if (source.endsWith('|') && !source.endsWith('\\|')) source = source.slice(0, -1)

  const cells: string[] = []
  let cell = ''
  let escaped = false
  for (const character of source) {
    if (escaped) {
      cell += character
      escaped = false
    } else if (character === '\\') {
      escaped = true
    } else if (character === '|') {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += character
    }
  }
  if (escaped) cell += '\\'
  cells.push(cell.trim())
  return cells
}

function isTableDelimiter(line: string) {
  if (!line.includes('|')) return false
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseTable(lines: string[], startIndex: number) {
  const headerLine = lines[startIndex]?.trim() ?? ''
  const delimiterLine = lines[startIndex + 1]?.trim() ?? ''
  if (!headerLine.includes('|') || !isTableDelimiter(delimiterLine)) return null

  const headers = splitTableRow(headerLine)
  const rows: string[][] = []
  let endIndex = startIndex + 1
  for (let index = startIndex + 2; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line || !line.includes('|')) break
    const cells = splitTableRow(line).slice(0, headers.length)
    while (cells.length < headers.length) cells.push('')
    rows.push(cells)
    endIndex = index
  }
  return { block: { type: 'table', headers, rows } as const, endIndex }
}

function collectImageRun(lines: string[], startIndex: number) {
  const images: Array<{ alt: string; src: string }> = []
  let currentIndex = startIndex
  let endIndex = startIndex

  while (currentIndex < lines.length) {
    const match = lines[currentIndex].trim().match(imagePattern)
    if (!match) break
    images.push({ alt: match[1], src: match[2] })
    endIndex = currentIndex

    let nextIndex = currentIndex + 1
    while (nextIndex < lines.length && !lines[nextIndex].trim()) nextIndex += 1
    if (!lines[nextIndex]?.trim().match(imagePattern)) break
    currentIndex = nextIndex
  }

  return { images, endIndex }
}

function visibleLength(text: string) {
  return Array.from(text.replace(/[*_`~]/g, '').trim()).length
}

function isTimelineItem(text: string) {
  return /^(?:\d{4}(?:年(?:\d{1,2}月(?:\d{1,2}日)?)?|[-/.]\d{1,2}(?:[-/.]\d{1,2})?)|第[一二三四五六七八九十百\d]+阶段|阶段[一二三四五六七八九十百\d]+|(?:准备|启动|筹备|探索|成长|成熟|复盘|当前|未来|初期|中期|后期)阶段?)(?=[：:、.．\s-]|$)/.test(text)
}

function isLegacyEndingDivider(lines: string[], index: number) {
  if (lines.slice(index + 1).some((line) => line.trim() === '---')) return false
  const firstContent = lines
    .slice(index + 1)
    .map((line) => line.trim())
    .find((line) => line && !/^<!--.*-->$/.test(line))
  return Boolean(firstContent && /^(?:我是|作者[：:])/.test(firstContent))
}

export function parseMarkdown(markdown: string): ParsedArticle {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const article: ParsedArticle = { title: '未命名文章', intro: '', preface: [], sections: [], ending: '' }
  let target: ParsedBlock[] = article.preface
  let currentSection: ParsedSection | null = null
  let paragraph: string[] = []
  let listItems: string[] = []
  let listOrdered = false
  let checklistItems: Array<{ checked: boolean; text: string }> = []
  let inCode = false
  let codeLanguage = 'text'
  let codeVariant: 'dark' | 'light' = 'dark'
  let codeLines: string[] = []
  let inEnding = false

  const flushParagraph = () => {
    if (!paragraph.length) return
    const text = paragraph.join(' ').trim()
    if (text) target.push({ type: 'paragraph', text })
    paragraph = []
  }

  const flushList = () => {
    if (!listItems.length) return
    if (!listOrdered && listItems.length >= 3 && listItems.length <= 8 && listItems.every((item) => visibleLength(item) <= 8)) {
      target.push({ type: 'component', component: 'klein-tag-group', attrs: { fallback: 'unordered-list' }, lines: listItems })
    } else if (listOrdered && listItems.every(isTimelineItem)) {
      target.push({ type: 'component', component: 'klein-timeline', attrs: { fallback: 'ordered-list' }, lines: listItems })
    } else {
      target.push({ type: 'list', ordered: listOrdered, items: listItems })
    }
    listItems = []
  }

  const flushChecklist = () => {
    if (!checklistItems.length) return
    target.push({ type: 'checklist', items: checklistItems })
    checklistItems = []
  }

  const flushTextBlocks = () => {
    flushParagraph()
    flushList()
    flushChecklist()
  }

  const appendEnding = (line: string) => {
    article.ending = article.ending ? `${article.ending}\n${line}` : line
  }

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index]
    const line = raw.trim()

    if (inCode) {
      if (line.startsWith('```')) {
        target.push({ type: 'code', language: codeLanguage, code: codeLines.join('\n'), variant: codeVariant })
        inCode = false
        codeLanguage = 'text'
        codeVariant = 'dark'
        codeLines = []
      } else {
        codeLines.push(raw)
      }
      continue
    }

    if (/^<!--\s*interaction:\s*off\s*-->$/i.test(line)) {
      flushTextBlocks()
      article.footerInteraction = false
      continue
    }

    const cover = line.match(/^<!--\s*cover:\s*(manifesto|numbered)\s*-->$/i)
    if (cover) {
      flushTextBlocks()
      article.coverStyle = cover[1].toLowerCase() as NonNullable<ParsedArticle['coverStyle']>
      continue
    }

    if (/^<!--\s*cover:.*-->$/i.test(line)) {
      flushTextBlocks()
      continue
    }

    if (/^<!--\s*ending\s*-->$/i.test(line)) {
      flushTextBlocks()
      inEnding = true
      continue
    }

    if (inEnding) {
      if (line) appendEnding(raw)
      continue
    }

    if (line.startsWith('```')) {
      flushTextBlocks()
      const codeFence = normalizeCodeFence(line.slice(3))
      inCode = true
      codeLanguage = codeFence.language
      codeVariant = codeFence.variant
      continue
    }

    const directive = line.match(componentDirectivePattern)
    if (directive) {
      flushTextBlocks()
      const parsedAttrs = parseDirectiveAttributes(directive[1])
      const component = parsedAttrs.component || parsedAttrs.name || 'unknown'
      const attrs = { ...parsedAttrs }
      delete attrs.component
      delete attrs.name
      const componentLines: string[] = []
      let endIndex = index
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        endIndex = cursor
        if (lines[cursor].trim() === ':::') break
        if (lines[cursor].trim()) componentLines.push(lines[cursor])
      }
      target.push({ type: 'component', component, attrs, lines: componentLines })
      index = endIndex
      continue
    }

    if (!line) {
      flushTextBlocks()
      continue
    }

    if (line.startsWith('# ')) {
      flushTextBlocks()
      article.title = line.slice(2).trim()
      continue
    }

    if (line.startsWith('## ')) {
      flushTextBlocks()
      currentSection = { id: `section-${article.sections.length + 1}`, title: line.slice(3).trim(), blocks: [] }
      article.sections.push(currentSection)
      target = currentSection.blocks
      continue
    }

    if (line.startsWith('### ')) {
      flushTextBlocks()
      target.push({ type: 'subheading', text: line.slice(4).trim() })
      continue
    }

    if (line === '***') {
      flushTextBlocks()
      target.push({ type: 'divider', variant: 'star' })
      continue
    }

    if (line === '---') {
      flushTextBlocks()
      if (isLegacyEndingDivider(lines, index)) inEnding = true
      else target.push({ type: 'divider', variant: 'diamond' })
      continue
    }

    const table = parseTable(lines, index)
    if (table) {
      flushTextBlocks()
      target.push(table.block)
      index = table.endIndex
      continue
    }

    const image = line.match(imagePattern)
    if (image) {
      flushTextBlocks()
      const imageRun = collectImageRun(lines, index)
      if (imageRun.images.length === 2 || imageRun.images.length === 3) {
        target.push({
          type: 'imageGroup',
          variant: imageRun.images.length === 2 ? 'comparison' : 'gallery',
          images: imageRun.images,
        })
      } else {
        imageRun.images.forEach((item) => target.push({ type: 'image', ...item }))
      }
      index = imageRun.endIndex
      continue
    }

    if (placeholderPattern.test(line)) {
      flushTextBlocks()
      target.push({ type: 'placeholder', text: line.replace(/[【】]/g, '') })
      continue
    }

    if (line.startsWith('> ')) {
      flushTextBlocks()
      const text = line.slice(2).trim()
      if (!article.intro && article.sections.length === 0 && article.preface.length === 0) article.intro = text
      else target.push({ type: 'quote', text })
      continue
    }

    const checklist = line.match(checklistPattern)
    if (checklist) {
      flushParagraph()
      flushList()
      checklistItems.push({ checked: checklist[1].toLowerCase() === 'x', text: checklist[2].trim() })
      continue
    }

    const ordered = line.match(/^\d+[.、]\s+(.+)$/)
    const unordered = line.match(/^[-*+]\s+(.+)$/)
    if (ordered || unordered) {
      flushParagraph()
      flushChecklist()
      const nextOrdered = Boolean(ordered)
      if (listItems.length && nextOrdered !== listOrdered) flushList()
      listOrdered = nextOrdered
      listItems.push((ordered?.[1] ?? unordered?.[1] ?? '').trim())
      continue
    }

    const prefixedComponent = parsePrefixedComponent(line)
    if (prefixedComponent) {
      flushTextBlocks()
      target.push(prefixedComponent)
      continue
    }

    paragraph.push(line)
  }

  flushTextBlocks()
  if (inCode) target.push({ type: 'code', language: codeLanguage, code: codeLines.join('\n'), variant: codeVariant })
  if (!article.sections.length) article.sections.push({ id: 'section-1', title: '正文', blocks: article.preface.splice(0) })
  return article
}

export function countDetectedBlocks(article: ParsedArticle) {
  const blocks = [...article.preface, ...article.sections.flatMap((section) => section.blocks)]
  return {
    sections: article.sections.length,
    quotes: blocks.filter((block) => block.type === 'quote').length + (article.intro ? 1 : 0),
    code: blocks.filter((block) => block.type === 'code').length,
    images: blocks.reduce((total, block) => {
      if (block.type === 'image' || block.type === 'placeholder') return total + 1
      if (block.type === 'imageGroup') return total + block.images.length
      return total
    }, 0),
    lists: blocks.filter((block) => block.type === 'list').length,
    subheadings: blocks.filter((block) => block.type === 'subheading').length,
    tables: blocks.filter((block) => block.type === 'table').length,
    checklists: blocks.filter((block) => block.type === 'checklist').length,
    components: blocks.filter((block) => block.type === 'component').length,
  }
}
