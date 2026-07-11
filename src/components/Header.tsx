import { Check, Clipboard, Download, Leaf } from 'lucide-react'

interface HeaderProps {
  title: string
  saved: boolean
  copied: boolean
  onCopy: () => void
  onExport: () => void
}

export function Header({ title, saved, copied, onCopy, onExport }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand" aria-label="墨排">
        <span className="brand-mark"><Leaf size={18} strokeWidth={1.8} /></span>
        <span>墨排</span>
      </div>
      <div className="document-meta">
        <strong>{title || '未命名文章'}</strong>
        <span><Check size={13} />{saved ? '已自动保存' : '正在保存…'}</span>
      </div>
      <div className="header-actions">
        <button className="export-button" onClick={onExport}><Download size={16} /><span>导出 HTML</span></button>
        <button className={`copy-button ${copied ? 'is-copied' : ''}`} onClick={onCopy}>
          {copied ? <Check size={17} /> : <Clipboard size={17} />}
          {copied ? '已复制' : '复制到公众号'}
        </button>
      </div>
    </header>
  )
}
