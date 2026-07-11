import { FileUp, RotateCcw } from 'lucide-react'
import { useRef } from 'react'
import type { ParsedArticle } from '../types'

interface EditorPanelProps {
  markdown: string
  article: ParsedArticle
  onChange: (markdown: string) => void
  onReset: () => void
}

export function EditorPanel({ markdown, article, onChange, onReset }: EditorPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  const importMarkdown = async (file?: File) => {
    if (!file) return
    onChange(await file.text())
  }

  return (
    <aside className="editor-panel workspace-panel" aria-label="Markdown 编辑区">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">MARKDOWN</span>
          <h2>文章原稿</h2>
        </div>
        <div className="editor-head-actions">
          <button className="quiet-icon-button" title="恢复示例" onClick={onReset}><RotateCcw size={14} /></button>
          <button className="icon-text-button" onClick={() => fileInput.current?.click()}><FileUp size={15} />导入 .md</button>
          <input
            ref={fileInput}
            type="file"
            accept=".md,.txt,text/markdown,text/plain"
            hidden
            onChange={(event) => void importMarkdown(event.target.files?.[0])}
          />
        </div>
      </div>

      <div className="markdown-editor-wrap">
        <textarea
          className="markdown-editor"
          aria-label="Markdown 原稿"
          spellCheck={false}
          value={markdown}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="markdown-outline">
          <span>{article.sections.length} 个章节</span>
          <span>{markdown.split('\n').length} 行</span>
          <span>支持标题、引用、列表、代码与图片</span>
        </div>
      </div>
    </aside>
  )
}
