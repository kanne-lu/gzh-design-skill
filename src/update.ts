import { getVersion } from '@tauri-apps/api/app'
import { invoke } from '@tauri-apps/api/core'

export interface Release {
  tagName: string
  body: string
  htmlUrl: string
}

export interface UpdateState {
  kind: 'available' | 'up-to-date'
  currentVersion: string
  release?: Release
}

function versionParts(version: string) {
  return version.replace(/^v/i, '').split('.').map((part) => Number.parseInt(part, 10) || 0)
}

function isNewerVersion(latestVersion: string, currentVersion: string) {
  const latestParts = versionParts(latestVersion)
  const currentParts = versionParts(currentVersion)
  const length = Math.max(latestParts.length, currentParts.length)

  for (let index = 0; index < length; index += 1) {
    const difference = (latestParts[index] ?? 0) - (currentParts[index] ?? 0)
    if (difference !== 0) return difference > 0
  }

  return false
}

export function resolveUpdate(currentVersion: string, release: Release): UpdateState {
  if (isNewerVersion(release.tagName, currentVersion)) {
    return { kind: 'available', currentVersion, release }
  }

  return { kind: 'up-to-date', currentVersion }
}

export async function checkForUpdate(): Promise<UpdateState> {
  const [currentVersion, release] = await Promise.all([
    getVersion(),
    invoke<Release>('latest_release'),
  ])

  return resolveUpdate(currentVersion, release)
}
