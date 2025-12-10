/*
 * Copyright 2025 Daytona Platforms Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import importSync from 'import-sync'
import { DaytonaError } from '../errors/DaytonaError'
import { RUNTIME } from './Runtime'

const importMap = {
  stream: () => import('stream'),
  tar: () => import('tar'),
  ObjectStorage: () => import('../ObjectStorage.js'),
  fs: (): Promise<typeof import('fs')> => import('fs'),
  'form-data': () => import('form-data'),
  'fast-glob': () => import('fast-glob'),
  '@iarna/toml': () => import('@iarna/toml'),
  'expand-tilde': () => import('expand-tilde'),
  dotenv: () => import('dotenv'),
}

const importSyncMap = Object.fromEntries(Object.keys(importMap).map((key) => [key, () => importSync(key)])) as Record<
  keyof typeof importMap,
  () => any
>

const validateMap: Record<string, (mod: any) => boolean> = {
  'fast-glob': (mod: any) => typeof mod === 'function' && typeof mod?.sync === 'function',
  '@iarna/toml': (mod: any) => typeof mod.parse === 'function' && typeof mod.stringify === 'function',
  stream: (mod: any) => typeof mod.Readable === 'function' && typeof mod.Writable === 'function',
  tar: (mod: any) => typeof mod.extract === 'function' && typeof mod.create === 'function',
  'expand-tilde': (mod: any) => typeof mod === 'function',
  fs: (mod: any) => typeof mod.createReadStream === 'function' && typeof mod.readFile === 'function',
  'form-data': (mod: any) => typeof mod === 'function',
  dotenv: (mod: any) => typeof mod.config === 'function',
}

type ImportMap = typeof importMap

export async function dynamicImport<K extends keyof ImportMap>(
  name: K,
  errorPrefix?: string,
): Promise<Awaited<ReturnType<ImportMap[K]>>> {
  const loader = importMap[name]
  if (!loader) {
    throw new DaytonaError(`${errorPrefix || ''} Unknown module "${name}"`)
  }

  try {
    const rawModule = await loader()
    return processModule(rawModule, name, errorPrefix)
  } catch (err) {
    handleLoadError(err, name, errorPrefix)
  }
}

type ImportSyncMap = typeof importSyncMap

export function dynamicImportSync<K extends keyof ImportSyncMap>(
  name: K,
  errorPrefix?: string,
): ReturnType<ImportSyncMap[K]> {
  const loader = importSyncMap[name]
  if (!loader) {
    throw new DaytonaError(`${errorPrefix || ''} Unknown module "${name}"`)
  }

  try {
    const rawModule = loader()
    return processModule(rawModule, name, errorPrefix)
  } catch (err) {
    handleLoadError(err, name, errorPrefix)
  }
}

function processModule(rawModule: any, moduleName: string, errorPrefix?: string): any {
  const mod = rawModule?.default ?? rawModule

  if (validateMap[moduleName] && !validateMap[moduleName](mod)) {
    throw new DaytonaError(
      `${errorPrefix || ''} Module "${moduleName}" didn't pass import validation in the "${RUNTIME}" runtime`,
    )
  }

  return mod
}

function handleLoadError(err: unknown, moduleName: string, errorPrefix?: string): never {
  const msg = err instanceof Error ? err.message : String(err)
  throw new DaytonaError(
    `${errorPrefix || ''} Module "${moduleName}" is not available in the "${RUNTIME}" runtime: ${msg}`,
  )
}
