import { Minus, Plus } from 'lucide-react'

interface PreviewPanelProps {
  html: string
  zoom: number
  onZoom: (zoom: number) => void
}

export function PreviewPanel({ html, zoom, onZoom }: PreviewPanelProps) {
  const srcDoc = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:#fff}body{overflow-x:hidden}*{box-sizing:border-box}img{max-width:100%}</style></head><body>${html}</body></html>`

  return (
    <main className="preview-panel workspace-panel" aria-label="公众号文章预览">
      <div className="preview-toolbar">
        <div><span className="live-dot" />真实公众号 HTML</div>
        <span>375 px · 与复制结果一致</span>
      </div>
      <div className="preview-canvas">
        <div className="wechat-preview-frame" style={{ '--preview-scale': zoom / 100 } as React.CSSProperties}>
          <div className="wechat-preview-topbar">
            <span>‹</span><strong>公众号文章预览</strong><span>•••</span>
          </div>
          <iframe title="公众号排版实时预览" sandbox="" srcDoc={srcDoc} />
        </div>
      </div>
      <div className="zoom-control" aria-label="预览缩放">
        <button title="缩小" onClick={() => onZoom(Math.max(70, zoom - 10))} disabled={zoom <= 70}><Minus size={14} /></button>
        <span>{zoom}%</span>
        <button title="放大" onClick={() => onZoom(Math.min(110, zoom + 10))} disabled={zoom >= 110}><Plus size={14} /></button>
      </div>
    </main>
  )
}
