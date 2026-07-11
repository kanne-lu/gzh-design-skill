import { Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import type { ApiSettings } from './types'

interface Props {
  settings: ApiSettings
  onChange: (settings: ApiSettings) => void
  onClose: () => void
}

export function ApiModal({ settings, onChange, onClose }: Props) {
  const [draft, setDraft] = useState(settings)
  const [showKey, setShowKey] = useState(false)
  const valid = /^https?:\/\//i.test(draft.baseUrl) && draft.apiKey.trim() && draft.model.trim()
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="api-modal" role="dialog" aria-modal="true" aria-labelledby="api-title">
      <header><div><span>OPENAI COMPATIBLE</span><h2 id="api-title">模型接口设置</h2></div><button onClick={onClose} aria-label="关闭"><X size={18} /></button></header>
      <p className="modal-note">配置仅用于本机请求。API Key 只保存在当前页面内存中，刷新后自动清除。</p>
      <label><span>Base URL</span><input value={draft.baseUrl} placeholder="https://api.openai.com/v1" onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} /><small>请填写包含版本路径的地址，例如以 /v1 结尾。</small></label>
      <label><span>API Key</span><div className="secret-field"><input type={showKey ? 'text' : 'password'} value={draft.apiKey} placeholder="sk-…" autoComplete="off" onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })} /><button onClick={() => setShowKey(!showKey)} aria-label={showKey ? '隐藏密钥' : '显示密钥'}>{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
      <label><span>模型名</span><input value={draft.model} placeholder="gpt-4.1-mini" onChange={(e) => setDraft({ ...draft, model: e.target.value })} /></label>
      <footer><button className="button-quiet" onClick={onClose}>取消</button><button className="button-primary" disabled={!valid} onClick={() => { onChange(draft); onClose() }}>保存设置</button></footer>
    </section>
  </div>
}
