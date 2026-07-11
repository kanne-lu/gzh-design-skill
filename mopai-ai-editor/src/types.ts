export type ThemeId = 'moyu-green' | 'red-white' | 'graphite' | 'zen' | 'ticket' | 'olive'
export type ArticleType = 'tutorial' | 'list' | 'opinion' | 'interview' | 'data' | 'essay' | 'case'

export interface LayoutDecision {
  articleType: ArticleType
  themeId: ThemeId
  reasoning: string[]
  autoNumber: boolean
  keywordUnderline: boolean
  includeToc: boolean
  componentPlan: { core: string[]; accents: string[] }
}

export interface ApiSettings {
  baseUrl: string
  apiKey: string
  model: string
}

export interface ThemeDefinition {
  id: ThemeId
  name: string
  note: string
  accent: string
  soft: string
  ink: string
  paper: string
  border: string
}
