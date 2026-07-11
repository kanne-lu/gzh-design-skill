import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMessages, chatCompletionsUrl, normalizeUpstreamError, parseGenerationJson } from './layout.mjs'
import { buildOriginalRenderMessages, validateWithOriginalScript } from './original-theme.mjs'

const app = express()
const port = Number(process.env.PORT || 4318)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

app.use(express.json({ limit: '3mb' }))
app.get('/api/health', (_request, response) => response.json({ ok: true, originalComponents: true }))

class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function callModel({ baseUrl, apiKey, model, messages, temperature, timeoutMs = 90000 }) {
  let url
  try { url = chatCompletionsUrl(baseUrl) } catch {
    throw new ApiError(400, 'INVALID_BASE_URL', 'Base URL 必须是以 http:// 或 https:// 开头的有效地址。')
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature }),
      signal: controller.signal,
    })
    const raw = await upstream.text()
    if (!upstream.ok) {
      const normalized = normalizeUpstreamError(upstream.status, raw)
      throw new ApiError(normalized.status, normalized.code, normalized.message)
    }
    let payload
    try { payload = JSON.parse(raw) } catch { throw new ApiError(502, 'INVALID_UPSTREAM_JSON', '模型接口没有返回有效 JSON。') }
    const content = payload?.choices?.[0]?.message?.content
    if (typeof content !== 'string') throw new ApiError(502, 'EMPTY_MODEL_RESPONSE', '模型没有返回可用内容。')
    return content
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof Error && error.name === 'AbortError') throw new ApiError(504, 'TIMEOUT', '模型接口响应超时，请重试。')
    throw new ApiError(502, 'NETWORK_ERROR', '无法连接模型接口，请检查 Base URL、网络和本地代理设置。')
  } finally { clearTimeout(timer) }
}

function requireStrings(body, names) {
  return names.every((name) => typeof body?.[name] === 'string' && body[name].trim())
}

async function renderWithOriginalComponents({ baseUrl, apiKey, model, articleMarkdown, themeId }) {
  const content = await callModel({
    baseUrl,
    apiKey,
    model,
    messages: buildOriginalRenderMessages(articleMarkdown, themeId),
    temperature: 0.1,
    timeoutMs: 120000,
  })
  const validation = validateWithOriginalScript(content)
  if (!validation.passed) throw new ApiError(422, 'INVALID_WECHAT_HTML', `模型未按原组件库输出合规 HTML：${validation.errors.join('；')}`)
  return validation.html
}

app.post('/api/generate-article', async (request, response) => {
  const { baseUrl, apiKey, model, prompt } = request.body || {}
  if (!requireStrings(request.body, ['baseUrl', 'apiKey', 'model', 'prompt'])) {
    return response.status(400).json({ code: 'MISSING_FIELDS', message: '请完整填写接口配置和一句话创作需求。' })
  }
  try {
    const writing = await callModel({ baseUrl, apiKey, model, messages: buildMessages(prompt), temperature: 0.7 })
    let generated
    try { generated = parseGenerationJson(writing) } catch (error) {
      const code = error instanceof Error ? error.message : 'INVALID_MODEL_SCHEMA'
      throw new ApiError(422, code, '模型返回的文章或排版格式不正确，请重试或更换模型。')
    }
    const articleHtml = await renderWithOriginalComponents({ baseUrl, apiKey, model, articleMarkdown: generated.articleMarkdown, themeId: generated.decision.themeId })
    return response.json({ ...generated, articleHtml, componentSource: `isjiamu/gzh-design-skill:${generated.decision.themeId}` })
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError(500, 'INTERNAL_ERROR', '生成文章时发生未知错误。')
    return response.status(apiError.status).json({ code: apiError.code, message: apiError.message })
  }
})

app.post('/api/render-article', async (request, response) => {
  const { baseUrl, apiKey, model, articleMarkdown, themeId } = request.body || {}
  if (!requireStrings(request.body, ['baseUrl', 'apiKey', 'model', 'articleMarkdown', 'themeId'])) {
    return response.status(400).json({ code: 'MISSING_FIELDS', message: '缺少文章、主题或接口配置。' })
  }
  try {
    const articleHtml = await renderWithOriginalComponents({ baseUrl, apiKey, model, articleMarkdown, themeId })
    return response.json({ articleHtml, componentSource: `isjiamu/gzh-design-skill:${themeId}` })
  } catch (error) {
    const apiError = error instanceof ApiError ? error : new ApiError(500, 'INTERNAL_ERROR', '应用原组件时发生未知错误。')
    return response.status(apiError.status).json({ code: apiError.code, message: apiError.message })
  }
})

app.use(express.static(path.join(root, 'dist')))
app.get('/{*splat}', (_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')))
app.listen(port, '127.0.0.1', () => console.log(`Mopai AI server: http://127.0.0.1:${port}`))
