import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

const KEY = 'wenlan-openai-api-key'
const BASE_URL_KEY = 'wenlan-openai-base-url'
const MODEL_KEY = 'wenlan-openai-model'

export function AiOptimizeDialog({ markdown, themeContext, onApply }: { markdown: string; themeContext: string; onApply: (markdown: string) => void }) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY) ?? '')
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem(BASE_URL_KEY) ?? 'https://api.openai.com/v1')
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_KEY) ?? 'gpt-5-mini')
  const [goal, setGoal] = useState('润色文章表达')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const optimize = async () => {
    localStorage.setItem(KEY, apiKey.trim())
    localStorage.setItem(BASE_URL_KEY, baseUrl.trim())
    localStorage.setItem(MODEL_KEY, model.trim())
    setLoading(true); setError(''); setResult('')
    try {
      const tauriInvoke = (window as Window & { __TAURI__?: { core?: { invoke?: typeof invoke } } }).__TAURI__?.core?.invoke
      if (tauriInvoke) {
        const response = await tauriInvoke<{ markdown: string }>('optimize_article', { request: { apiKey, baseUrl, model, markdown, goal, themeContext } })
        setResult(response.markdown)
      } else {
        const endpoint = baseUrl.replace(/\/$/, '')
        const prompt = `你是中文公众号编辑。请按以下主题组件方案优化 Markdown：${themeContext}。优先使用这些已有组件对应的 Markdown 结构，不得生成 HTML 或发明组件。必须保留标题层级、列表、引用、代码块、图片链接和链接结构；只返回优化后的 Markdown，不要解释。\n\n优化目标：${goal}\n\n${markdown}`
        const response = await fetch(`${endpoint}/responses`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, input: prompt }) })
        const data = await response.json() as { output_text?: string; error?: { message?: string } }
        if (response.ok && data.output_text) setResult(data.output_text)
        else {
          const chat = await fetch(`${endpoint}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }) })
          const chatData = await chat.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
          const content = chatData.choices?.[0]?.message?.content
          if (!chat.ok || !content) throw new Error(chatData.error?.message || data.error?.message || 'AI 没有返回可用的优化稿。')
          setResult(content)
        }
      }
    } catch (reason) { setError(String(reason)) } finally { setLoading(false) }
  }

  if (!open) return <button className="export-button ai-button" onClick={() => setOpen(true)}>AI 优化</button>
  return <div className="update-dialog-backdrop"><section className="update-dialog ai-dialog" role="dialog" aria-modal="true"><h2>AI 自动优化文章</h2><label>接口地址<input value={baseUrl} placeholder="https://api.openai.com/v1" onChange={(event) => setBaseUrl(event.target.value)} /></label><label>模型名称<input value={model} placeholder="gpt-5-mini" onChange={(event) => setModel(event.target.value)} /></label><label>API Key<input type="password" value={apiKey} placeholder="仅保存在本机" onChange={(event) => setApiKey(event.target.value)} /></label><span className="ai-goal-label">优化目标</span><div className="ai-goals">{['润色文章表达', '增强文章标题', '优化公众号风格'].map((item) => <button key={item} type="button" className={goal === item ? 'is-active' : ''} onClick={() => setGoal(item)}>{item}</button>)}</div>{result ? <textarea value={result} readOnly rows={16} /> : <p>{error || '支持 OpenAI 兼容接口与中转地址。优化稿会在这里预览，确认后才会替换原文。'}</p>}<div className="ai-dialog-actions"><button className="export-button" onClick={() => setOpen(false)}>关闭</button>{result ? <button className="copy-button" onClick={() => { onApply(result); setOpen(false) }}>应用优化稿</button> : <button className="copy-button" disabled={loading} onClick={() => void optimize()}>{loading ? '优化中…' : '开始优化'}</button>}</div></section></div>
}
