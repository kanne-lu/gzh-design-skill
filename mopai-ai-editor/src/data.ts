import type { ArticleType, LayoutDecision, ThemeDefinition } from './types'

export const themes: ThemeDefinition[] = [
  { id: 'moyu-green', name: '摸鱼绿', note: '绿色杂志 · 教程与清单', accent: '#08a678', soft: '#eaf8f2', ink: '#25352e', paper: '#ffffff', border: '#bfe4d6' },
  { id: 'red-white', name: '红白色系', note: '经典编辑风 · 观点与深度', accent: '#df4b4b', soft: '#fff0f0', ink: '#332a2a', paper: '#ffffff', border: '#f2c8c8' },
  { id: 'graphite', name: '石墨极简', note: '专业极简 · 科技评论', accent: '#52525b', soft: '#f2f2f3', ink: '#2d2d31', paper: '#ffffff', border: '#dadadd' },
  { id: 'zen', name: '留白禅意', note: '衬线留白 · 随笔与冥想', accent: '#53695d', soft: '#eef3f0', ink: '#3e4742', paper: '#fffefa', border: '#cbd7d0' },
  { id: 'ticket', name: '摸鱼票据', note: '票根硬阴影 · 测评与对比', accent: '#04a879', soft: '#e8faf4', ink: '#151b18', paper: '#fffef8', border: '#1d2c25' },
  { id: 'olive', name: '橄榄手记', note: '编辑部内刊 · 复盘与案例', accent: '#dd742f', soft: '#f1f1e9', ink: '#4d4f46', paper: '#fdfdf8', border: '#c9cabf' },
]

export const articleTypes: Array<{ id: ArticleType; name: string }> = [
  { id: 'tutorial', name: '教程 / 操作指南' },
  { id: 'list', name: '盘点 / 工具清单' },
  { id: 'opinion', name: '观点 / 深度分析' },
  { id: 'interview', name: '访谈 / 人物特写' },
  { id: 'data', name: '数据复盘 / 报告' },
  { id: 'essay', name: '生活 / 情感随笔' },
  { id: 'case', name: '案例实战' },
]

export const defaultDecision: LayoutDecision = {
  articleType: 'opinion',
  themeId: 'moyu-green',
  reasoning: ['模型会根据一句话需求判断文章类型', '生成文章时会同步选择合适的视觉主题'],
  autoNumber: true,
  keywordUnderline: true,
  includeToc: true,
  componentPlan: { core: ['主题引言', '编号章节', '金句引用'], accents: ['居中金句', '旁注'] },
}
