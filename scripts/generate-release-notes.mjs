import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const categoryTitles = {
  feat: '新增',
  fix: '修复',
  perf: '优化',
  refactor: '优化',
  docs: '文档',
  chore: '维护',
}

const categoryOrder = ['新增', '修复', '优化', '文档', '维护']
const fallback = '## 本次更新\n\n- 本次发布包含维护更新。\n'

export function buildReleaseNotes(subjects) {
  const groups = new Map(categoryOrder.map((title) => [title, []]))

  for (const rawSubject of subjects) {
    const subject = rawSubject.trim()
    if (!subject) continue

    const match = subject.match(/^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/i)
    const type = match?.[1].toLowerCase()
    const title = categoryTitles[type] ?? '维护'
    groups.get(title).push(match?.[2] ?? subject)
  }

  const sections = categoryOrder
    .filter((title) => groups.get(title).length > 0)
    .map((title) => `### ${title}\n${groups.get(title).map((subject) => `- ${subject}`).join('\n')}`)

  return sections.length > 0 ? `## 本次更新\n\n${sections.join('\n\n')}\n` : fallback
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function previousTag() {
  const tags = git('tag', '--merged', 'HEAD', '--sort=-version:refname')
    .split('\n')
    .filter((tag) => /^v/.test(tag))
  const currentTag = process.env.GITHUB_REF_NAME ?? tags.find((tag) => git('rev-parse', tag) === git('rev-parse', 'HEAD'))

  return tags.find((tag) => tag !== currentTag)
}

function subjectsSincePreviousTag() {
  const previous = previousTag()
  const range = previous ? `${previous}..HEAD` : 'HEAD'
  const output = git('log', '--format=%s', range)

  return output ? output.split('\n') : []
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.stdout.write(buildReleaseNotes(subjectsSincePreviousTag()))
}
