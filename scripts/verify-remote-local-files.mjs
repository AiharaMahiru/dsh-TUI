/**
 * 本地化工作区文件能力安全回归：路径边界、符号链接、大小限制和版本条件写。
 * 运行：node --import tsx/esm scripts/verify-remote-local-files.mjs
 */
import { mkdtemp, mkdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { RemoteClientError } from '../src/dsh-adapter/remote/errors.js'
import { createLocalWorkspaceExecutor } from '../src/dsh-adapter/remote/local-files.js'

let failures = 0
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}
async function rejectsCode(name, fn, code) {
  try {
    await fn()
    check(name, false)
  } catch (error) {
    check(name, error instanceof RemoteClientError && error.code === code)
  }
}
async function rejects(name, fn) {
  try {
    await fn()
    check(name, false)
  } catch {
    check(name, true)
  }
}

const fixture = await mkdtemp(join(tmpdir(), 'dsh-tui-local-files-'))
const root = join(fixture, 'root')
const outside = join(fixture, 'outside')
const signal = new AbortController().signal
let executor
try {
  await mkdir(join(root, 'nested'), { recursive: true })
  await mkdir(outside, { recursive: true })
  await writeFile(join(root, 'safe.txt'), 'safe-v1')
  await writeFile(join(outside, 'secret.txt'), 'outside-secret')
  await symlink(join(outside, 'secret.txt'), join(root, 'escape-file'))
  await symlink(outside, join(root, 'escape-dir'))

  executor = await createLocalWorkspaceExecutor(root, { maxBytes: 32, maxEntries: 20 })
  const listing = await executor.execute({ action: 'list', path: '.' }, signal)
  const names = listing.entries.map(entry => entry.name)
  check('目录列表保留普通条目', names.includes('safe.txt') && names.includes('nested'))
  check('目录列表忽略符号链接', !names.includes('escape-file') && !names.includes('escape-dir'))

  const first = await executor.execute({ action: 'read', path: 'safe.txt' }, signal)
  check('授权根内文件可读', first.content === 'safe-v1' && typeof first.version === 'string')
  await rejectsCode('拒绝路径穿越',
    () => executor.execute({ action: 'read', path: '../outside/secret.txt' }, signal),
    'WORKSPACE_PATH_NOT_ALLOWED')
  await rejectsCode('拒绝绝对路径',
    () => executor.execute({ action: 'read', path: '/etc/passwd' }, signal),
    'WORKSPACE_PATH_NOT_ALLOWED')
  await rejectsCode('拒绝末级文件符号链接',
    () => executor.execute({ action: 'read', path: 'escape-file' }, signal),
    'LOCAL_PATH_NOT_ALLOWED')
  await rejectsCode('拒绝中间目录符号链接读取',
    () => executor.execute({ action: 'read', path: 'escape-dir/secret.txt' }, signal),
    'LOCAL_PATH_NOT_ALLOWED')
  await rejectsCode('拒绝中间目录符号链接写入',
    () => executor.execute({ action: 'write', path: 'escape-dir/new.txt', content: 'blocked' }, signal),
    'LOCAL_PATH_NOT_ALLOWED')

  await rejectsCode('错误版本不得覆盖文件',
    () => executor.execute({ action: 'write', path: 'safe.txt', content: 'unsafe', version: 'stale' }, signal),
    'LOCAL_FILE_CHANGED')
  check('错误版本后原文件保持不变', await readFile(join(root, 'safe.txt'), 'utf8') === 'safe-v1')
  const replaced = await executor.execute({ action: 'write', path: 'safe.txt', content: 'safe-v2', version: first.version }, signal)
  check('正确版本允许条件覆盖', replaced.operation === 'replaced'
    && await readFile(join(root, 'safe.txt'), 'utf8') === 'safe-v2')

  const created = await executor.execute({ action: 'write', path: 'nested/new.txt', content: 'new' }, signal)
  const createdStat = await stat(join(root, 'nested/new.txt'))
  check('新文件以 0600 创建', created.operation === 'created' && (createdStat.mode & 0o777) === 0o600)
  await rejects('无版本写不得覆盖已有文件',
    () => executor.execute({ action: 'write', path: 'nested/new.txt', content: 'overwrite' }, signal))

  await writeFile(join(root, 'large.txt'), 'x'.repeat(33))
  await rejectsCode('读取大小上限生效',
    () => executor.execute({ action: 'read', path: 'large.txt' }, signal),
    'LOCAL_FILE_TOO_LARGE')

  executor.dispose()
  await rejectsCode('释放后能力立即失效',
    () => executor.execute({ action: 'read', path: 'safe.txt' }, signal),
    'LOCAL_WORKSPACE_DISCONNECTED')
} finally {
  executor?.dispose()
  await rm(fixture, { recursive: true, force: true })
}

console.log(failures === 0 ? '\nAll remote-local-files checks passed' : `\n${failures} check(s) FAILED`)
process.exit(failures === 0 ? 0 : 1)
