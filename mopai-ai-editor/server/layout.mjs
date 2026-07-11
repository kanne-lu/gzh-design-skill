export const THEME_IDS = ['moyu-green', 'red-white', 'graphite', 'zen', 'ticket', 'olive']
export const ARTICLE_TYPES = ['tutorial', 'list', 'opinion', 'interview', 'data', 'essay', 'case']

export function chatCompletionsUrl(baseUrl) {
  const clean = String(baseUrl || '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(clean)) throw new Error('INVALID_BASE_URL')
  return clean.endsWith('/chat/completions') ? clean : `${clean}/chat/completions`
}

export function parseGenerationJson(content) {
  const source = String(content || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let value
  try { value = JSON.parse(source) } catch { throw new Error('INVALID_MODEL_JSON') }
  if (typeof value.articleMarkdown !== 'string' || value.articleMarkdown.trim().length < 100) throw new Error('INVALID_ARTICLE')
  const articleMarkdown = value.articleMarkdown.trim()
  if (!/^#\s+.+/m.test(articleMarkdown)) throw new Error('INVALID_ARTICLE')
  return { articleMarkdown, decision: validateDecision(value.decision) }
}

export function validateDecision(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_MODEL_SCHEMA')
  if (!THEME_IDS.includes(value.themeId) || !ARTICLE_TYPES.includes(value.articleType)) throw new Error('INVALID_MODEL_SCHEMA')
  const booleans = ['autoNumber', 'keywordUnderline', 'includeToc']
  if (booleans.some((key) => typeof value[key] !== 'boolean')) throw new Error('INVALID_MODEL_SCHEMA')
  if (!Array.isArray(value.reasoning) || value.reasoning.length < 1 || value.reasoning.length > 3) throw new Error('INVALID_MODEL_SCHEMA')
  if (!value.componentPlan || !Array.isArray(value.componentPlan.core) || !Array.isArray(value.componentPlan.accents)) throw new Error('INVALID_MODEL_SCHEMA')
  return {
    articleType: value.articleType,
    themeId: value.themeId,
    reasoning: value.reasoning.slice(0, 3).map((item) => String(item).slice(0, 80)),
    autoNumber: value.autoNumber,
    keywordUnderline: value.keywordUnderline,
    includeToc: value.includeToc,
    componentPlan: {
      core: value.componentPlan.core.slice(0, 4).map((item) => String(item).slice(0, 20)),
      accents: value.componentPlan.accents.slice(0, 3).map((item) => String(item).slice(0, 20)),
    },
  }
}

export function normalizeUpstreamError(status, body = '') {
  if (status === 401 || status === 403) return { status, code: 'AUTH_ERROR', message: 'API Key 无效或没有访问权限。' }
  if (status === 404) return { status, code: 'NOT_FOUND', message: '接口路径或模型不存在，请检查 Base URL 和模型名。' }
  if (status === 429) return { status, code: 'RATE_LIMIT', message: '接口额度不足或请求过于频繁，请稍后重试。' }
  return { status: 502, code: 'UPSTREAM_ERROR', message: `模型接口返回错误（${status}）。${String(body).slice(0, 120)}` }
}

export function buildMessages(prompt) {
  return [
    {
      role: 'system',
      content: `你是资深中文公众号作者与排版编辑。根据用户的一句话需求，直接创作一篇完整、可发布的公众号文章，并给出排版决策。
只返回一个 JSON 对象，禁止 JSON 代码块和任何额外文字。
可用 themeId: ${THEME_IDS.join(', ')}。
可用 articleType: ${ARTICLE_TYPES.join(', ')}。
顶层字段必须且只能是 articleMarkdown 和 decision。
articleMarkdown 必须是完整 Markdown 正文：包含一个 # 标题、导语、至少三个 ## 章节、充分展开的正文和有收束力的结尾。除非用户指定长度，默认写 1200-1800 个中文字符。不要写创作说明，不要虚构数据来源。
decision 必须包含且只能包含：articleType, themeId, reasoning, autoNumber, keywordUnderline, includeToc, componentPlan。
reasoning 是 1-3 条短理由；componentPlan 为 {"core": string[], "accents": string[]}。`,
    },
    { role: 'user', content: `创作需求：${String(prompt).slice(0, 4000)}` },
  ]
}
