import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Check, ChevronDown, Clipboard, Download, KeyRound, Leaf, Minus, Plus, Sparkles } from 'lucide-react'
import { ApiModal } from './ApiModal'
import { articleTypes, defaultDecision, themes } from './data'
import { extractTitle, getStats, plainText } from './render'
import type { ApiSettings, ArticleType, LayoutDecision, ThemeId } from './types'

const STORAGE_KEY = 'mopai-ai-editor-v3'
type MobilePanel = 'source' | 'preview' | 'decision'

interface StoredState {
  markdown: string
  goal: string
  decision: LayoutDecision
  articleHtml: string
  baseUrl: string
  model: string
}

function loadStored(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { markdown: '', goal: '', decision: defaultDecision, articleHtml: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4.1-mini', ...JSON.parse(raw) }
  } catch { /* Ignore invalid local drafts. */ }
  return {
    markdown: '',
    goal: '写一篇普通人如何用 Skills 提升工作效率的公众号文章，观点犀利，约 1500 字',
    decision: defaultDecision,
    articleHtml: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4.1-mini',
  }
}

function App() {
  const initial = useRef(loadStored())
  const [markdown, setMarkdown] = useState(initial.current.markdown)
  const [goal, setGoal] = useState(initial.current.goal)
  const [decision, setDecision] = useState(initial.current.decision)
  const [articleHtml, setArticleHtml] = useState(initial.current.articleHtml)
  const [api, setApi] = useState<ApiSettings>({ baseUrl: initial.current.baseUrl, model: initial.current.model, apiKey: '' })
  const [showApi, setShowApi] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [layoutDirty, setLayoutDirty] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('输入一句话，生成完整文章和排版成品')
  const [saved, setSaved] = useState(true)
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState(90)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('preview')

  const theme = themes.find((item) => item.id === decision.themeId) ?? themes[0]
  const title = useMemo(() => extractTitle(markdown), [markdown])
  const stats = useMemo(() => getStats(markdown), [markdown])
  const html = articleHtml
  const srcDoc = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#fff}*{box-sizing:border-box}img{max-width:100%}</style></head><body>${html}</body></html>`

  useEffect(() => {
    setSaved(false)
    const timer = window.setTimeout(() => {
      const stored: StoredState = { markdown, goal, decision, articleHtml, baseUrl: api.baseUrl, model: api.model }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      setSaved(true)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [markdown, goal, decision, articleHtml, api.baseUrl, api.model])

  const updateDecision = <K extends keyof LayoutDecision>(key: K, value: LayoutDecision[K]) => {
    setDecision((current) => ({ ...current, [key]: value }))
    setLayoutDirty(true)
    setMessage('排版设置已修改，请重新应用原组件')
    setStatus('idle')
  }

  const generate = async () => {
    if (!api.apiKey) { setShowApi(true); setMessage('请先填写 API Key'); setStatus('error'); return }
    if (!goal.trim()) { setMessage('请先用一句话描述想写的文章'); setStatus('error'); return }
    setGenerating(true); setStatus('idle'); setMessage('正在写作、组织结构并完成排版…')
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...api, prompt: goal }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '智能排版失败，请稍后重试。')
      setMarkdown(payload.articleMarkdown)
      setDecision(payload.decision)
      setArticleHtml(payload.articleHtml)
      setLayoutDirty(false)
      setStatus('success'); setMessage('完整文章已生成，可继续编辑正文或调整排版')
      setMobilePanel('preview')
    } catch (error) {
      setStatus('error'); setMessage(error instanceof Error ? error.message : '智能排版失败，请稍后重试。')
    } finally { setGenerating(false) }
  }

  const applyOriginalComponents = async () => {
    if (!api.apiKey) { setShowApi(true); setMessage('请先填写 API Key'); setStatus('error'); return }
    if (!markdown.trim()) { setMessage('请先生成文章'); setStatus('error'); return }
    setRendering(true); setStatus('idle'); setMessage(`正在读取 ${theme.name} 原组件并重新装配…`)
    try {
      const response = await fetch('/api/render-article', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...api, articleMarkdown: markdown, themeId: decision.themeId }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || '应用原组件失败，请稍后重试。')
      setArticleHtml(payload.articleHtml)
      setLayoutDirty(false); setStatus('success'); setMessage(`已按 ${theme.name} 原始组件库重新装配`)
      setMobilePanel('preview')
    } catch (error) {
      setStatus('error'); setMessage(error instanceof Error ? error.message : '应用原组件失败，请稍后重试。')
    } finally { setRendering(false) }
  }

  const copyRichText = async () => {
    if (!html) { setStatus('error'); setMessage('请先生成并应用原组件'); return }
    try {
      if ('ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText(markdown)], { type: 'text/plain' }),
        })])
      } else await navigator.clipboard.writeText(html)
      setCopied(true); window.setTimeout(() => setCopied(false), 1600)
    } catch { setStatus('error'); setMessage('复制失败，请允许浏览器访问剪贴板。') }
  }

  const exportHtml = () => {
    if (!html) { setStatus('error'); setMessage('请先生成并应用原组件'); return }
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[\\/:*?"<>|]/g, '-').slice(0, 40) || '公众号文章'}_墨排AI.html`
    link.click(); URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <header className="app-header">
      <div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>墨排 <i>AI</i></span></div>
      <div className="document-meta"><strong>{title}</strong><span><Check size={12} />{saved ? '已自动保存' : '正在保存…'}</span></div>
      <div className="header-actions">
        <button className="header-button" onClick={() => setShowApi(true)}><KeyRound size={15} /><span>接口设置</span></button>
        <button className="generate-button" onClick={() => void generate()} disabled={generating}><Sparkles size={16} /><span>{generating ? '创作中…' : '生成文章'}</span></button>
        <button className="header-button" onClick={exportHtml}><Download size={15} /><span>导出 HTML</span></button>
        <button className={`copy-button ${copied ? 'is-copied' : ''}`} onClick={() => void copyRichText()}>{copied ? <Check size={16} /> : <Clipboard size={16} />}<span>{copied ? '已复制' : '复制到公众号'}</span></button>
      </div>
    </header>

    <nav className="mobile-tabs">
      <button className={mobilePanel === 'source' ? 'active' : ''} onClick={() => setMobilePanel('source')}>创作</button>
      <button className={mobilePanel === 'preview' ? 'active' : ''} onClick={() => setMobilePanel('preview')}>成品</button>
      <button className={mobilePanel === 'decision' ? 'active' : ''} onClick={() => setMobilePanel('decision')}>AI 决策</button>
    </nav>

    <div className="workspace" data-mobile-panel={mobilePanel}>
      <aside className="source-panel panel">
        <div className="panel-heading">
          <div><span>ONE-LINE CREATION</span><h2>一句话生成文章</h2></div>
          <Sparkles size={19} />
        </div>
        <div className="source-content">
          <label className="goal-field"><span>你想写一篇什么文章？</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：写一篇普通人如何用 Skills 提升工作效率的公众号文章，观点犀利，约 1500 字" /><button className="creation-submit" disabled={generating} onClick={() => void generate()}><Sparkles size={15} />{generating ? '正在生成完整文章…' : '生成完整文章'}</button></label>
          <div className="editor-label"><span>生成后的文章</span><small>生成后仍可直接修改 Markdown 正文</small></div>
          <textarea className="markdown-editor" spellCheck={false} value={markdown} placeholder="文章生成后会出现在这里，你仍可以继续修改。" onChange={(event) => { setMarkdown(event.target.value); setLayoutDirty(true); setMessage('正文已修改，请重新应用原组件') }} />
        </div>
        <footer className="panel-status"><span>{stats.sections} 个章节</span><span>{stats.lines} 行</span><span>{stats.characters.toLocaleString('zh-CN')} 字</span></footer>
      </aside>

      <main className="preview-panel panel">
        <div className="preview-toolbar"><div><i />真实公众号 HTML</div><span>375 px · 与复制结果一致</span></div>
        <div className="preview-canvas">
          {!html ? <div className="empty-preview"><Sparkles size={24} /><strong>{markdown.trim() ? '等待应用原组件' : '等待生成文章'}</strong><span>{markdown.trim() ? '点击右侧“应用原组件”，生成与仓库一致的公众号 HTML。' : '输入一句话，AI 将完成标题、正文、结构与排版。'}</span></div> :
          <div className="wechat-frame" style={{ '--scale': zoom / 100 } as React.CSSProperties}>
            <div className="wechat-top"><span>‹</span><strong>公众号文章预览</strong><span>•••</span></div>
            <iframe title="公众号文章预览" sandbox="" srcDoc={srcDoc} />
          </div>}
        </div>
        <div className="zoom-control"><button disabled={zoom <= 70} onClick={() => setZoom(Math.max(70, zoom - 10))}><Minus size={14} /></button><span>{zoom}%</span><button disabled={zoom >= 110} onClick={() => setZoom(Math.min(110, zoom + 10))}><Plus size={14} /></button></div>
      </main>

      <aside className="decision-panel panel">
        <div className="panel-heading"><div><span>AI DECISION</span><h2>智能排版决策</h2></div><Bot size={19} /></div>
        <div className="decision-scroll">
          <section className={`run-state ${status}`}><div><i>{generating || rendering ? <Sparkles size={14} /> : status === 'success' ? <Check size={14} /> : <Bot size={14} />}</i><strong>{generating ? 'AI 正在创作' : rendering ? '正在装配原组件' : status === 'success' ? '文章与排版已生成' : status === 'error' ? '需要处理' : '等待创作'}</strong></div><p>{message}</p></section>
          <section className="component-source"><span>COMPONENT SOURCE</span><strong>isjiamu/gzh-design-skill</strong><small>{theme.id} · 原始主题组件库</small><button className={layoutDirty ? 'attention' : ''} disabled={rendering || !markdown.trim()} onClick={() => void applyOriginalComponents()}><Sparkles size={14} />{rendering ? '正在装配…' : layoutDirty ? '重新应用原组件' : '应用原组件'}</button></section>
          <section className="setting-section"><h3>AI 判断理由</h3><ol className="reason-list">{decision.reasoning.map((reason, index) => <li key={`${reason}-${index}`}><b>{index + 1}</b><span>{reason}</span></li>)}</ol></section>
          <section className="setting-section"><h3>主题组件库</h3><div className="theme-list">{themes.map((item) => <button key={item.id} className={decision.themeId === item.id ? 'selected' : ''} onClick={() => updateDecision('themeId', item.id as ThemeId)}><i style={{ '--accent': item.accent, '--soft': item.soft } as React.CSSProperties} /><span><strong>{item.name}</strong><small>{item.note}</small></span>{decision.themeId === item.id && <Check size={14} />}</button>)}</div></section>
          <section className="setting-section"><h3>文章类型 → 组件配方</h3><label className="select-field"><select value={decision.articleType} onChange={(event) => updateDecision('articleType', event.target.value as ArticleType)}>{articleTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={14} /></label><div className="component-plan"><span>核心组件</span><div>{decision.componentPlan.core.map((item) => <b key={item}>{item}</b>)}</div><span>点缀组件</span><div>{decision.componentPlan.accents.map((item) => <em key={item}>{item}</em>)}</div></div></section>
          <section className="setting-section"><h3>智能处理</h3><SwitchRow label="章节自动编号" checked={decision.autoNumber} onChange={() => updateDecision('autoNumber', !decision.autoNumber)} /><SwitchRow label="关键词强调" checked={decision.keywordUnderline} onChange={() => updateDecision('keywordUnderline', !decision.keywordUnderline)} /><SwitchRow label="精选目录" checked={decision.includeToc} onChange={() => updateDecision('includeToc', !decision.includeToc)} /></section>
        </div>
      </aside>
    </div>

    <footer className="app-footer"><span className="local-status"><i />本地自动保存</span><span>{stats.characters.toLocaleString('zh-CN')} 字</span><span>{theme.name} · {api.model}</span><span className="footer-right">原组件：isjiamu/gzh-design-skill · 密钥仅存在当前会话</span></footer>
    {showApi && <ApiModal settings={api} onChange={setApi} onClose={() => setShowApi(false)} />}
  </div>
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <div className="switch-row"><span>{label}</span><button className={`switch ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} onClick={onChange}><i /></button></div>
}

export default App
