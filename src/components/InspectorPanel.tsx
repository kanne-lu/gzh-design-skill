import { Check, ChevronDown, ExternalLink, Layers3, ShieldCheck } from 'lucide-react'
import { articleTypes, moyuColorFamilies, themes } from '../data'
import type { ArticleType, EditorSettings, HtmlValidation, MoyuColorFamily, ParsedArticle, ThemeId } from '../types'
import { countDetectedBlocks } from '../markdown'

interface InspectorPanelProps {
  article: ParsedArticle
  settings: EditorSettings
  validation: HtmlValidation
  onChange: (settings: EditorSettings) => void
}

function Switch({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return <button className={`switch ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange}><span /></button>
}

export function InspectorPanel({ article, settings, validation, onChange }: InspectorPanelProps) {
  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => onChange({ ...settings, [key]: value })
  const theme = themes.find((item) => item.id === settings.themeId) ?? themes[0]
  const recipe = theme.recipes[settings.articleType]
  const detected = countDetectedBlocks(article)
  const tocAvailable = settings.themeId !== 'ticket' && settings.themeId !== 'olive'
  const componentGroups = theme.componentGroups ?? []
  const componentTotal = componentGroups.reduce((total, group) => total + group.items.length, 0)
  const selectedColorFamily = settings.moyuColorFamily ?? (settings.moyuAccent ? 'blue' : 'moyu')
  const colorFamily = moyuColorFamilies[selectedColorFamily]

  const chooseColorFamily = (familyId: MoyuColorFamily) => {
    const firstColor = moyuColorFamilies[familyId].presets[0].color
    onChange({ ...settings, moyuColorFamily: familyId, moyuAccent: firstColor })
  }

  return (
    <aside className="inspector-panel workspace-panel" aria-label="排版配置">
      <div className="panel-heading inspector-heading">
        <div><span className="panel-kicker">SKILL CONFIG</span><h2>排版配置</h2></div>
      </div>
      <div className="inspector-scroll">
        <section className="setting-section">
          <h3>主题组件库</h3>
          <div className="theme-list">
            {themes.map((item) => (
              <button key={item.id} className={`theme-option ${settings.themeId === item.id ? 'is-selected' : ''}`} onClick={() => update('themeId', item.id as ThemeId)}>
                <span className="theme-swatch" style={{ '--swatch-accent': item.accent, '--swatch-soft': item.accentSoft, '--swatch-paper': item.paper } as React.CSSProperties} />
                <span className="theme-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                {settings.themeId === item.id ? <Check size={14} /> : <span />}
              </button>
            ))}
          </div>
          <div className="config-source"><code>{theme.sourceFile}</code><span>{theme.componentCount}</span></div>
        </section>

        {settings.themeId === 'moyu-green' && (
          <section className="setting-section moyu-color-section">
            <div className="moyu-color-heading"><h3>整体配色</h3><span>仅影响摸鱼绿</span></div>
            <label className="moyu-color-family">
              <span>颜色大类</span>
              <select value={selectedColorFamily} onChange={(event) => chooseColorFamily(event.target.value as MoyuColorFamily)}>
                {(Object.keys(moyuColorFamilies) as MoyuColorFamily[]).map((familyId) => <option key={familyId} value={familyId}>{moyuColorFamilies[familyId].name}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="moyu-color-grid" aria-label={`传统中国${colorFamily.name}配色`}>
              {colorFamily.presets.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  title={`${preset.name} ${preset.color}`}
                  aria-label={`${preset.name} ${preset.color}`}
                  aria-pressed={settings.moyuAccent?.toUpperCase() === preset.color}
                  className={`moyu-color-swatch ${settings.moyuAccent?.toUpperCase() === preset.color ? 'is-selected' : ''}`}
                  style={{ '--moyu-color': preset.color } as React.CSSProperties}
                  onClick={() => update('moyuAccent', preset.color)}
                >
                  {settings.moyuAccent?.toUpperCase() === preset.color && <Check size={12} />}
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            <label className="moyu-custom-color">
              <input type="color" value={settings.moyuAccent ?? theme.accent} onChange={(event) => update('moyuAccent', event.target.value.toUpperCase())} />
              <span>自定义颜色</span>
              <code>{settings.moyuAccent ?? theme.accent}</code>
            </label>
          </section>
        )}

        <section className="setting-section">
          <h3>文章类型 → 组件配方</h3>
          <label className="select-field">
            <select aria-label="文章类型" value={settings.articleType} onChange={(event) => update('articleType', event.target.value as ArticleType)}>
              {articleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
            <ChevronDown size={14} />
          </label>
          <div className="recipe-card">
            <span>核心组件</span>
            <div>{recipe.core.map((item) => <b key={item}>{item}</b>)}</div>
            <span>点缀组件（≤ 3 类）</span>
            <div>{recipe.accents.map((item) => <em key={item}>{item}</em>)}</div>
          </div>
        </section>

        <section className="setting-section switch-settings">
          <h3>智能排版</h3>
          <div><span>章节自动编号</span><Switch label="章节自动编号" checked={settings.autoNumber} onChange={() => update('autoNumber', !settings.autoNumber)} /></div>
          <div><span>每段关键词标记</span><Switch label="每段关键词标记" checked={settings.keywordUnderline} onChange={() => update('keywordUnderline', !settings.keywordUnderline)} /></div>
          <div>
            <span>精选目录{!tocAvailable && <small>该主题骨架不使用</small>}</span>
            <Switch label="精选目录" checked={tocAvailable && settings.includeToc} disabled={!tocAvailable} onChange={() => update('includeToc', !settings.includeToc)} />
          </div>
          {componentTotal > 0 && (
            <details
              className="component-catalog"
              style={{ '--catalog-accent': theme.accent, '--catalog-soft': theme.accentSoft, '--catalog-border': theme.border } as React.CSSProperties}
            >
              <summary>
                <span className="component-catalog-label"><Layers3 size={14} /><span>本主题可用组件<small>展开查看完整清单</small></span></span>
                <span className="component-catalog-meta"><b>{componentTotal}</b><ChevronDown size={13} /></span>
              </summary>
              <section className="component-catalog-body">
                {theme.componentPreviewUrl && (
                  <a href={theme.componentPreviewUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} />打开完整组件预览
                  </a>
                )}
                {componentGroups.map((group) => (
                  <section className="component-catalog-group" key={group.name}>
                    <h4><span>{group.name}</span><b>{group.items.length}</b></h4>
                    <ul>
                      {group.items.map((item) => <li key={item}><span>{item}</span>{theme.componentTriggers?.[item] && <code>{theme.componentTriggers[item]}</code>}</li>)}
                    </ul>
                  </section>
                ))}
              </section>
            </details>
          )}
        </section>

        <section className="setting-section">
          <h3>已识别并装配</h3>
          <div className="detected-grid">
            <span><b>{detected.sections}</b>编号章节</span>
            <span><b>{detected.quotes}</b>引言 / 引用</span>
            <span><b>{detected.lists + detected.checklists}</b>列表 / 清单</span>
            <span><b>{detected.code}</b>代码块</span>
            <span><b>{detected.images}</b>图片 / 素材</span>
            <span><b>{detected.subheadings}</b>小节标题</span>
            <span><b>{detected.tables}</b>数据表格</span>
            <span><b>{detected.components}</b>高级组件</span>
          </div>
        </section>

        <section className="setting-section validation-section">
          <h3><ShieldCheck size={14} />公众号合规检查</h3>
          {validation.checks.map((check) => <p key={check.label} className={check.passed ? 'is-pass' : 'is-fail'}><Check size={12} />{check.label}</p>)}
        </section>
      </div>
    </aside>
  )
}
