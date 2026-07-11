import { describe, expect, it } from 'vitest'
import { resolveUpdate } from '../src/update'

describe('resolveUpdate', () => {
  it('offers a newer GitHub release', () => {
    expect(resolveUpdate('0.0.1', {
      tagName: 'v0.0.2',
      body: '## 本次更新',
      htmlUrl: 'https://example.test/v0.0.2',
    }).kind).toBe('available')
  })

  it('keeps the current version when GitHub is not newer', () => {
    expect(resolveUpdate('0.0.1', {
      tagName: 'v0.0.1',
      body: '',
      htmlUrl: 'https://example.test/v0.0.1',
    }).kind).toBe('up-to-date')
  })

  it('compares each numeric version segment', () => {
    expect(resolveUpdate('0.0.2', {
      tagName: 'v0.0.10',
      body: '',
      htmlUrl: 'https://example.test/v0.0.10',
    }).kind).toBe('available')
  })
})
