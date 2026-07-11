import test from 'node:test'
import assert from 'node:assert/strict'
import { chatCompletionsUrl, normalizeUpstreamError, parseGenerationJson } from './layout.mjs'

test('builds a chat completions endpoint from an OpenAI base URL', () => {
  assert.equal(chatCompletionsUrl('https://example.com/v1/'), 'https://example.com/v1/chat/completions')
  assert.equal(chatCompletionsUrl('https://example.com/v1/chat/completions'), 'https://example.com/v1/chat/completions')
})

test('parses a complete article and layout decision', () => {
  const article = '# 一句话生成文章\n\n这是完整导语，用于说明文章讨论的问题和读者价值。\n\n## 第一章\n\n这里是充分展开的正文内容，包含明确观点和必要解释。\n\n## 第二章\n\n这里继续展开方法与案例，让文章结构完整且能够直接发布。\n\n## 第三章\n\n这里给出总结和行动建议，形成完整收束。'
  const value = parseGenerationJson(JSON.stringify({articleMarkdown:article,decision:{articleType:'opinion',themeId:'moyu-green',reasoning:['观点文'],autoNumber:true,keywordUnderline:true,includeToc:true,componentPlan:{core:['章节'],accents:['金句']}}}))
  assert.equal(value.decision.themeId, 'moyu-green')
  assert.match(value.articleMarkdown, /^# 一句话生成文章/)
})

test('rejects unknown model enums', () => {
  const article = '# 标题\n\n这是一段足够长的导语内容，用于满足文章完整性校验。\n\n## 第一章\n\n这里是完整正文内容，需要超过最小字符数量并包含有效标题和章节结构。\n\n## 第二章\n\n这里继续补充文章内容和结论，使模型返回的数据能够进入决策校验流程。'
  assert.throws(() => parseGenerationJson(JSON.stringify({articleMarkdown:article,decision:{articleType:'unknown',themeId:'blue',reasoning:['x'],autoNumber:true,keywordUnderline:true,includeToc:true,componentPlan:{core:[],accents:[]}}})), /INVALID_MODEL_SCHEMA/)
})

test('rejects a response without a complete article', () => {
  assert.throws(() => parseGenerationJson(JSON.stringify({articleMarkdown:'太短',decision:{}})), /INVALID_ARTICLE/)
})

test('normalizes auth and rate errors without secrets', () => {
  assert.equal(normalizeUpstreamError(401).code, 'AUTH_ERROR')
  assert.equal(normalizeUpstreamError(429).code, 'RATE_LIMIT')
})
