import { Check, Clipboard, Download, Leaf, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  saved: boolean
  copied: boolean
  onCopy: () => void
  onExport: () => void
  onCheckUpdate: () => void
  aiAction?: ReactNode
}

export function Header({ title, saved, copied, onCopy, onExport, onCheckUpdate, aiAction }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand" aria-label="Wenlan · 公众号排版">
        <span className="brand-mark"><Leaf size={18} strokeWidth={1.8} /></span>
        <span>Wenlan</span>
      </div>
      <div className="document-meta">
        <strong>{title || '未命名文章'}</strong>
        <span><Check size={13} />{saved ? '已自动保存' : '正在保存…'}</span>
      </div>
      <div className="header-actions">
        {aiAction}
        <button className="update-button" type="button" onClick={onCheckUpdate}><RefreshCw size={15} /><span>检查更新</span></button>
        <button className="export-button" onClick={onExport}><Download size={16} /><span>导出 HTML</span></button>
        <button className={`copy-button ${copied ? 'is-copied' : ''}`} onClick={onCopy}>
          {copied ? <Check size={17} /> : <Clipboard size={17} />}
          {copied ? '已复制' : '复制到公众号'}
        </button>
      </div>
    </header>
  )
}
