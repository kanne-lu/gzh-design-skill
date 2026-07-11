import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, PanelRight, Smartphone } from 'lucide-react'
import { defaultSettings, sampleMarkdown, themes } from './data'
import { articleToPlainText, buildWechatHtml, validateWechatHtml } from './exportHtml'
import { parseMarkdown } from './markdown'
import { Header } from './components/Header'
import { EditorPanel } from './components/EditorPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { InspectorPanel } from './components/InspectorPanel'
import { UpdateDialog } from './components/UpdateDialog'
import type { EditorSettings } from './types'

type MobilePanel = 'edit' | 'preview' | 'style'
const STORAGE_KEY = 'mopai-gzh-skill-editor-v2'

function loadInitialState(): { markdown: string; settings: EditorSettings } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Invalid local data falls back to the repository sample article.
  }
  return { markdown: sampleMarkdown, settings: defaultSettings }
}

function App() {
  const initial = useRef(loadInitialState())
  const [markdown, setMarkdown] = useState(initial.current.markdown)
  const [settings, setSettings] = useState(initial.current.settings)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('preview')
  const [zoom, setZoom] = useState(90)
  const [saved, setSaved] = useState(true)
  const [copied, setCopied] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  const article = useMemo(() => parseMarkdown(markdown), [markdown])
  const theme = useMemo(() => themes.find((item) => item.id === settings.themeId) ?? themes[0], [settings.themeId])
  const html = useMemo(() => buildWechatHtml(article, settings, theme), [article, settings, theme])
  const validation = useMemo(() => validateWechatHtml(html), [html])
  const characterCount = useMemo(() => articleToPlainText(article).replace(/\s/g, '').length, [article])

  useEffect(() => {
    setSaved(false)
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ markdown, settings }))
      setSaved(true)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [markdown, settings])

  const handleCopy = async () => {
    const text = articleToPlainText(article)
    try {
      if ('ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        })])
      } else await navigator.clipboard.writeText(html)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = html
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const handleExport = () => {
    const safeTitle = article.title.replace(/[\\/:*?"<>|]/g, '-').slice(0, 42) || '公众号文章'
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${safeTitle}_排版_${theme.name}(${theme.id}).html`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <Header title={article.title} saved={saved} copied={copied} onCopy={handleCopy} onExport={handleExport} onCheckUpdate={() => setUpdateDialogOpen(true)} />
      <nav className="mobile-panel-nav" aria-label="工作区切换">
        <button className={mobilePanel === 'edit' ? 'is-active' : ''} onClick={() => setMobilePanel('edit')}><FileText size={16} />原稿</button>
        <button className={mobilePanel === 'preview' ? 'is-active' : ''} onClick={() => setMobilePanel('preview')}><Smartphone size={16} />成品</button>
        <button className={mobilePanel === 'style' ? 'is-active' : ''} onClick={() => setMobilePanel('style')}><PanelRight size={16} />配置</button>
      </nav>
      <div className="workspace" data-mobile-panel={mobilePanel}>
        <EditorPanel markdown={markdown} article={article} onChange={setMarkdown} onReset={() => setMarkdown(sampleMarkdown)} />
        <PreviewPanel html={html} zoom={zoom} onZoom={setZoom} />
        <InspectorPanel article={article} settings={settings} validation={validation} onChange={setSettings} />
      </div>
      <footer className="app-statusbar">
        <span className="status-local"><i className="status-dot" />本地自动保存</span>
        <span className="status-count">{characterCount.toLocaleString('zh-CN')} 字</span>
        <span className="status-theme">{theme.name} · {theme.sourceFile}</span>
        <span className="status-credit">
          <span className="credit-prefix">排版能力源自</span>
          <a href="https://github.com/isjiamu/gzh-design-skill" target="_blank" rel="noreferrer">isjiamu/gzh-design-skill</a>
          ·
          <a href="https://github.com/isjiamu/gzh-design-skill/blob/main/LICENSE" target="_blank" rel="noreferrer">AGPL-3.0</a>
          © 2026 甲木 × 摸鱼小李
        </span>
      </footer>
      <UpdateDialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} />
    </div>
  )
}

export default App
