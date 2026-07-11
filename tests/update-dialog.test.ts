import { describe, expect, it } from 'vitest'
import { describeUpdateState } from '../src/components/UpdateDialog'

describe('describeUpdateState', () => {
  it('tells the user when a newer release is ready to download', () => {
    expect(describeUpdateState({
      kind: 'available',
      currentVersion: '0.0.1',
      release: {
        tagName: 'v0.0.2',
        body: '## 本次更新',
        htmlUrl: 'https://example.test/v0.0.2',
      },
    })).toMatchObject({
      title: '发现新版本 v0.0.2',
      actionLabel: '前往下载',
    })
  })

  it('confirms that the installed version is current', () => {
    expect(describeUpdateState({ kind: 'up-to-date', currentVersion: '0.0.1' })).toMatchObject({
      title: '已是最新版本',
      detail: '当前版本 v0.0.1 已是最新版本。',
    })
  })
})
