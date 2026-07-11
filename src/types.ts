export type ThemeId =
  | 'moyu-green'
  | 'red-white'
  | 'graphite'
  | 'zen'
  | 'ticket'
  | 'olive'
  | 'klein-blue'

export type ArticleType =
  | 'tutorial'
  | 'list'
  | 'opinion'
  | 'interview'
  | 'data'
  | 'essay'
  | 'case'

export type ParsedBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'code'; language: string; code: string; variant: 'dark' | 'light' }
  | { type: 'image'; alt: string; src: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'checklist'; items: { checked: boolean; text: string }[] }
  | { type: 'imageGroup'; variant: 'comparison' | 'gallery'; images: { alt: string; src: string }[] }
  | { type: 'component'; component: string; attrs: Record<string, string>; lines: string[] }
  | { type: 'placeholder'; text: string }
  | { type: 'divider'; variant: 'star' | 'diamond' }

export interface ParsedSection {
  id: string
  title: string
  blocks: ParsedBlock[]
}

export interface ParsedArticle {
  title: string
  intro: string
  coverStyle?: 'manifesto' | 'numbered'
  preface: ParsedBlock[]
  sections: ParsedSection[]
  ending: string
  footerInteraction?: boolean
}

export interface EditorSettings {
  themeId: ThemeId
  articleType: ArticleType
  autoNumber: boolean
  keywordUnderline: boolean
  includeToc: boolean
}

export interface RecipeDefinition {
  name: string
  core: string[]
  accents: string[]
}

export interface ThemeComponentGroup {
  name: string
  items: string[]
}

export interface ThemeDefinition {
  id: ThemeId
  name: string
  description: string
  sourceFile: string
  componentCount: string
  accent: string
  accentSoft: string
  paper: string
  ink: string
  muted: string
  border: string
  highlight: string
  recipes: Record<ArticleType, RecipeDefinition>
  componentGroups?: ThemeComponentGroup[]
  componentTriggers?: Record<string, string>
  componentPreviewUrl?: string
}

export interface HtmlValidation {
  errors: string[]
  checks: Array<{ label: string; passed: boolean }>
}
