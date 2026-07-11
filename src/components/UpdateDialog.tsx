import { openUrl } from '@tauri-apps/plugin-opener'
import { ExternalLink, LoaderCircle, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { checkForUpdate, type UpdateState } from '../update'

interface UpdateDialogProps {
  open: boolean
  onClose: () => void
}

type CheckStatus =
  | { kind: 'checking' }
  | { kind: 'result'; update: UpdateState }
  | { kind: 'error'; message: string }

export function describeUpdateState(update: UpdateState) {
  if (update.kind === 'available' && update.release) {
    return {
      title: `发现新版本 ${update.release.tagName}`,
      detail: `当前版本 v${update.currentVersion}，可前往 GitHub 下载最新版。`,
      actionLabel: '前往下载',
    }
  }

  return {
    title: '已是最新版本',
    detail: `当前版本 v${update.currentVersion} 已是最新版本。`,
  }
}

export function UpdateDialog({ open, onClose }: UpdateDialogProps) {
  const [status, setStatus] = useState<CheckStatus>({ kind: 'checking' })

  const check = async () => {
    setStatus({ kind: 'checking' })
    try {
      setStatus({ kind: 'result', update: await checkForUpdate() })
    } catch {
      setStatus({ kind: 'error', message: '暂时无法检查更新，请稍后再试。' })
    }
  }

  useEffect(() => {
    if (open) void check()
  }, [open])

  if (!open) return null

  const handleDownload = async (url: string) => {
    try {
      await openUrl(url)
    } catch {
      setStatus({ kind: 'error', message: '无法打开下载页面，请稍后再试。' })
    }
  }

  const result = status.kind === 'result' ? status.update : undefined
  const message = result ? describeUpdateState(result) : undefined

  return (
    <div className="update-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="update-dialog" role="dialog" aria-modal="true" aria-labelledby="update-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="update-dialog-close" type="button" aria-label="关闭更新检查" onClick={onClose}><X size={18} /></button>
        <p className="update-dialog-kicker">WENLAN</p>
        {status.kind === 'checking' && <>
          <LoaderCircle className="update-dialog-spinner" size={24} />
          <h2 id="update-dialog-title">正在检查更新</h2>
          <p>正在连接 GitHub Releases…</p>
        </>}
        {status.kind === 'error' && <>
          <h2 id="update-dialog-title">检查更新失败</h2>
          <p>{status.message}</p>
          <button className="update-dialog-button" type="button" onClick={check}><RefreshCw size={16} />重新检查</button>
        </>}
        {message && <>
          <h2 id="update-dialog-title">{message.title}</h2>
          <p>{message.detail}</p>
          {result?.kind === 'available' && result.release && <>
            {result.release.body && <pre className="update-dialog-notes">{result.release.body}</pre>}
            <button className="update-dialog-button" type="button" onClick={() => void handleDownload(result.release!.htmlUrl)}><ExternalLink size={16} />{message.actionLabel}</button>
          </>}
          {result?.kind === 'up-to-date' && <button className="update-dialog-button is-secondary" type="button" onClick={check}><RefreshCw size={16} />重新检查</button>}
        </>}
      </section>
    </div>
  )
}
