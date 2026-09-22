import { constants, type BigIntStats } from 'node:fs'
import { lstat, open, readdir, realpath, stat } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'

import { RemoteClientError } from './errors.js'
import { assertRelativeWorkspacePath } from './path-boundary.js'
import type { WorkspaceOperationExecutor } from './types.js'

export interface LocalWorkspaceExecutor {
  readonly label: string
  readonly execute: WorkspaceOperationExecutor
  dispose(): void
}

interface LocalFileLimits {
  readonly maxBytes: number
  readonly maxEntries: number
}

type FileOperation =
  | { readonly action: 'list'; readonly path: string }
  | { readonly action: 'read'; readonly path: string }
  | { readonly action: 'write'; readonly path: string; readonly content: string; readonly version?: string }

/** Create a capability rooted at one directory explicitly selected by the
 * user. The absolute root remains private to this process and never enters a
 * remote request, session log, or UI snapshot. */
export async function createLocalWorkspaceExecutor(
  inputRoot: string,
  limits: LocalFileLimits = { maxBytes: 262_144, maxEntries: 500 },
): Promise<LocalWorkspaceExecutor> {
  if (typeof inputRoot !== 'string' || !isAbsolute(inputRoot)) {
    throw new RemoteClientError('WORKSPACE_PATH_NOT_ALLOWED')
  }
  const rootInfo = await lstat(inputRoot)
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) {
    throw new RemoteClientError('LOCAL_NOT_DIRECTORY')
  }
  const root = await realpath(inputRoot)
  const lifetime = new AbortController()

  const execute: WorkspaceOperationExecutor = async (input, callerSignal) => {
    const signal = AbortSignal.any([callerSignal, lifetime.signal])
    signal.throwIfAborted()
    const operation = parseOperation(input)
    const target = resolve(root, operation.path)
    assertInside(root, target)
    if (operation.action === 'list') return listDirectory(root, target, operation.path, limits, signal)
    if (operation.action === 'read') return readFile(root, target, operation.path, limits, signal)
    return writeFile(root, target, operation, limits, signal)
  }

  return {
    label: basename(root) || root,
    execute,
    dispose() {
      lifetime.abort(new RemoteClientError('LOCAL_WORKSPACE_DISCONNECTED'))
    },
  }
}

function parseOperation(input: unknown): FileOperation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new RemoteClientError('INVALID_FILE_OPERATION')
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !['action', 'path', 'content', 'version'].includes(key))) {
    throw new RemoteClientError('INVALID_FILE_OPERATION')
  }
  if ((value.action !== 'list' && value.action !== 'read' && value.action !== 'write') || typeof value.path !== 'string') {
    throw new RemoteClientError('INVALID_FILE_OPERATION')
  }
  const path = assertRelativeWorkspacePath(value.path)
  if (value.action !== 'write') {
    if (value.content !== undefined || value.version !== undefined) throw new RemoteClientError('INVALID_FILE_OPERATION')
    return { action: value.action, path }
  }
  if (typeof value.content !== 'string' || (value.version !== undefined && (typeof value.version !== 'string' || value.version === ''))) {
    throw new RemoteClientError('INVALID_FILE_OPERATION')
  }
  return { action: 'write', path, content: value.content, ...(typeof value.version === 'string' ? { version: value.version } : {}) }
}

async function listDirectory(
  root: string,
  target: string,
  displayPath: string,
  limits: LocalFileLimits,
  signal: AbortSignal,
): Promise<unknown> {
  await assertExistingInside(root, target, 'directory')
  signal.throwIfAborted()
  const entries = await readdir(target, { withFileTypes: true })
  if (entries.length > limits.maxEntries) throw new RemoteClientError('LOCAL_TOO_MANY_ENTRIES')
  const safeEntries: Array<{ name: string; type: 'file' | 'directory'; size?: number }> = []
  for (const entry of entries) {
    signal.throwIfAborted()
    if (entry.isSymbolicLink() || (!entry.isFile() && !entry.isDirectory())) continue
    const entryPath = resolve(target, entry.name)
    assertInside(root, entryPath)
    if (entry.isDirectory()) safeEntries.push({ name: entry.name, type: 'directory' })
    else safeEntries.push({ name: entry.name, type: 'file', size: (await stat(entryPath)).size })
  }
  return { location: 'desktop', path: displayPath, entries: safeEntries }
}

async function readFile(
  root: string,
  target: string,
  displayPath: string,
  limits: LocalFileLimits,
  signal: AbortSignal,
): Promise<unknown> {
  // O_NOFOLLOW only protects the final path component. Resolve and verify the
  // whole chain first so a symlinked parent cannot escape the authorized root.
  await assertExistingInside(root, target, 'file')
  signal.throwIfAborted()
  const handle = await open(target, constants.O_RDONLY | noFollowFlag())
  try {
    const before = await handle.stat({ bigint: true })
    if (!before.isFile() || before.size > BigInt(limits.maxBytes)) throw new RemoteClientError('LOCAL_FILE_TOO_LARGE')
    const content = await handle.readFile({ encoding: 'utf8', signal })
    if (Buffer.byteLength(content) > limits.maxBytes) throw new RemoteClientError('LOCAL_FILE_TOO_LARGE')
    const after = await handle.stat({ bigint: true })
    if (fileVersion(after) !== fileVersion(before)) throw new RemoteClientError('LOCAL_FILE_CHANGED')
    return { location: 'desktop', path: displayPath, content, version: fileVersion(before) }
  } finally {
    await handle.close()
  }
}

async function writeFile(
  root: string,
  target: string,
  operation: Extract<FileOperation, { action: 'write' }>,
  limits: LocalFileLimits,
  signal: AbortSignal,
): Promise<unknown> {
  if (Buffer.byteLength(operation.content) > limits.maxBytes) throw new RemoteClientError('LOCAL_FILE_TOO_LARGE')
  await assertExistingInside(root, dirname(target), 'directory')
  signal.throwIfAborted()
  if (operation.version === undefined) {
    const handle = await open(target, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | noFollowFlag(), 0o600)
    try {
      await handle.writeFile(operation.content, { encoding: 'utf8', signal })
      await handle.sync()
      const result = await handle.stat({ bigint: true })
      return { location: 'desktop', path: operation.path, operation: 'created', version: fileVersion(result) }
    } finally {
      await handle.close()
    }
  }
  const handle = await open(target, constants.O_RDWR | noFollowFlag())
  try {
    const before = await handle.stat({ bigint: true })
    if (!before.isFile() || before.size > BigInt(limits.maxBytes)) throw new RemoteClientError('LOCAL_FILE_TOO_LARGE')
    if (fileVersion(before) !== operation.version) throw new RemoteClientError('LOCAL_FILE_CHANGED')
    await handle.truncate(0)
    await handle.writeFile(operation.content, { encoding: 'utf8', signal })
    await handle.sync()
    const result = await handle.stat({ bigint: true })
    return { location: 'desktop', path: operation.path, operation: 'replaced', version: fileVersion(result) }
  } finally {
    await handle.close()
  }
}

async function assertExistingInside(root: string, target: string, expected: 'file' | 'directory'): Promise<void> {
  assertInside(root, target)
  const info = await lstat(target)
  if (info.isSymbolicLink()) throw new RemoteClientError('LOCAL_PATH_NOT_ALLOWED')
  const canonical = await realpath(target)
  assertInside(root, canonical)
  if ((expected === 'file' && !info.isFile()) || (expected === 'directory' && !info.isDirectory())) {
    throw new RemoteClientError(expected === 'file' ? 'LOCAL_NOT_FILE' : 'LOCAL_NOT_DIRECTORY')
  }
}

function assertInside(root: string, target: string): void {
  const path = relative(root, target)
  if (path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path))) return
  throw new RemoteClientError('LOCAL_PATH_NOT_ALLOWED')
}

function noFollowFlag(): number {
  return typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0
}

function fileVersion(value: BigIntStats): string {
  return `${value.dev.toString(36)}-${value.ino.toString(36)}-${value.size.toString(36)}-${value.mtimeNs.toString(36)}`
}
