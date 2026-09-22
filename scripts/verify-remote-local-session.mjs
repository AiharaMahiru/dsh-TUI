/** 真实 Cordis Agent/Session/工具组合回放。
 * 先编译 TUI；runtime 是固定同版 DSH 核心依赖的隔离 npm 目录。
 * node scripts/verify-remote-local-session.mjs <runtime> [--live <0600账号文件>]
 * 默认仅请求 loopback；--live 明确启用真实账号推理，Cookie 只留内存。
 */
import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
const runtime = resolve(process.argv[2])
const live = process.argv[3] === '--live'
const require = createRequire(join(runtime, 'package.json'))
const load = name => import(pathToFileURL(require.resolve('@deepseek-ai/' + name)).href)
const [{ Context }, { default: Llm, createUserMessage }, { default: Sessions, SessionId }, { default: Agents }, { default: Loop },
  { default: Prompt }, { default: Tools }, { default: FileSystem }, fileTools, { default: Persistence }, { default: Projection }] = await Promise.all(
  ['cordis', 'dsh-llm', 'dsh-session', 'dsh-agent', 'dsh-agent-loop', 'dsh-system-prompt', 'dsh-tools', 'dsh-fs-local', 'dsh-tool-fs', 'dsh-session-persistence-jsonl', 'dsh-session-projection'].map(load))
await cp(new URL('../lib/types/dsh-adapter/remote', import.meta.url), join(runtime, 'tui-remote'), { recursive: true })
const { RemoteAccountModel, ACCOUNT_PROVIDER } = await import(pathToFileURL(join(runtime, 'tui-remote/account-model.js')).href)
const { DshTuiRemoteClient } = await import(pathToFileURL(join(runtime, 'tui-remote/client.js')).href)
const { MemoryCredentialStore } = await import(pathToFileURL(join(runtime, 'tui-remote/credential-store.js')).href)
await mkdir(runtime, { recursive: true })
const root = await mkdtemp(join(runtime, live ? '真实 本地工作区-' : '回放 本地工作区-'))
const expected = live ? '本地工作区验收 ' + Date.now() : '本地工作区验收'
await writeFile(join(root, '输入.txt'), expected)
const requests = []
let stage = 0
const server = live ? undefined : createServer(async (req, res) => {
  requests.push(req.url)
  if (req.url === '/auth/me') { res.end(JSON.stringify({ user: { id: 'test', email: 'test@example.invalid', displayName: '测试', role: 'user', defaultMode: 'full' } })); return }
  if (req.url === '/auth/models') { res.end(JSON.stringify({ profiles: [], sharedModels: [{ provider: 'test', model: 'replay', name: '回放' }] })); return }
  assert.equal(req.url, '/auth/desktop-inference/chat/completions')
  assert.equal(req.headers['x-csrf-token'], 'keyless-csrf')
  let body = ''; for await (const chunk of req) body += chunk
  const wire = JSON.parse(body)
  assert.equal(wire.model, 'shared/test/replay')
  const tools = wire.tools.map(t => t.function.name)
  assert.ok(tools.includes('read') && tools.includes('write'))
  const response = stage === 0 ? { role: 'assistant', tool_calls: [{ index: 0, id: 'local-read', type: 'function', function: { name: 'read', arguments: JSON.stringify({ file_path: join(root, '输入.txt') }) } }] }
    : stage === 1 ? { role: 'assistant', tool_calls: [{ index: 0, id: 'local-write', type: 'function', function: { name: 'write', arguments: JSON.stringify({ file_path: join(root, '输出.txt'), content: expected }) } }] }
      : { role: 'assistant', content: '本机验收完成' }
  const finish_reason = stage++ < 2 ? 'tool_calls' : 'stop'
  res.writeHead(200, { 'content-type': 'text/event-stream' })
  for (const [delta, finish] of [[response, null], [{}, finish_reason]]) res.write(`data: ${JSON.stringify({ id: 'replay', object: 'chat.completion.chunk', model: wire.model, choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`)
  res.end('data: [DONE]\n\n')
})
if (server) await new Promise(r => server.listen(0, '127.0.0.1', r))
const endpoint = live ? 'https://chat.rwr.ink' : `http://127.0.0.1:${server.address().port}`
const credentials = new MemoryCredentialStore(live ? undefined : { endpoint, cookies: [
  { name: 'dsh_session', value: 'keyless-session', path: '/', secure: false }, { name: 'dsh_csrf', value: 'keyless-csrf', path: '/', secure: false },
] })
const client = new DshTuiRemoteClient({ endpoint, credentialStore: credentials })
const ctx = new Context()
let handle, resumed, adapter, timeout
try {
  if (live) {
    const credentialPath = resolve(process.argv[4])
    assert.equal((await stat(credentialPath)).mode & 0o777, 0o600)
    const { email, password } = JSON.parse(await readFile(credentialPath, 'utf8'))
    await client.login(email, password)
  }
  adapter = new RemoteAccountModel({ endpoint, credentials, timeoutMs: 120000, contextWindow: 262144, maxTokens: 2048 })
  const models = await adapter.listModels()
  const model = live ? (models.find(m => /shared\/deepseek-official\/.*flash/u.test(m.id)) ?? models.find(m => m.id.startsWith('shared/')) ?? models[0])?.id : 'shared/test/replay'
  assert.ok(model, '账号必须有可用模型')
  for (const plugin of [Llm, Sessions, Agents, Prompt, Projection, Tools]) await ctx.plugin(plugin)
  await ctx.plugin(Persistence, { root: join(runtime, 'session-logs'), compression: 'none' })
  await ctx.plugin(FileSystem, { cwd: root })
  await ctx.plugin(fileTools)
  ctx.effect(() => ctx.llm.registerAdapter([ACCOUNT_PROVIDER], adapter))
  await ctx.plugin(Loop)
  const sessionId = SessionId(`local-workspace-${Date.now()}`)
  handle = await ctx.agents.create({ sessionId, meta: { cwd: root }, agentOptions: { provider: ACCOUNT_PROVIDER, model } })
  const agent = handle.agent
  timeout = setTimeout(() => agent.cancel({ kind: 'interrupted' }), 180000)
  agent.followup(createUserMessage({ content: [{ type: 'text', text: '本地工作区文件验收：先用 read 读取输入.txt，再用 write 将读取到的完整内容原样写入输出.txt。只处理这两个文件，完成后回复“本机验收完成”。' }], source: { kind: 'user' } }))
  await agent.whenIdle()
  clearTimeout(timeout)
  assert.equal(await readFile(join(root, '输出.txt'), 'utf8'), expected)
  const events = [...agent.session.snapshotEvents()]
  if (!live) {
    const visible = events.filter(event => ['user/message', 'assistant/message', 'tool/result'].includes(event.type))
      .map(event => ({ type: event.type, content: (event.data.message ?? event.data).content }))
    const normalize = value => typeof value === 'string' ? value.replaceAll(root, '<workspace>').replaceAll('<workspace>\\', '<workspace>/')
      : Array.isArray(value) ? value.map(normalize)
        : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'arguments' && typeof item === 'string' ? JSON.stringify(normalize(JSON.parse(item))) : normalize(item)])) : value
    const snapshot = normalize(visible)
    await writeFile(join(runtime, 'replay-visible.json'), JSON.stringify(snapshot, null, 2) + '\n')
    assert.deepEqual(snapshot, JSON.parse(await readFile(new URL('./fixtures/remote-local-session.snapshot.json', import.meta.url), 'utf8')))
  }
  const eventText = JSON.stringify(events)
  assert.ok(eventText.includes('read') && eventText.includes('write') && eventText.includes(expected))
  assert.ok(!eventText.includes('keyless-session'))
  assert.ok(!requests.some(p => /workspace|\/api\/session/u.test(p)))
  await ctx.sessions.flush(agent.session)
  await handle.dispose(); handle = undefined
  resumed = await ctx.agents.resume({ resumeSessionId: sessionId, agentOptions: { provider: ACCOUNT_PROVIDER, model } })
  assert.equal(resumed.agent.session.header.cwd, root)
  assert.deepEqual(resumed.agent.session.snapshotEvents().slice(0, events.length), events)
  const result = { mode: live ? 'live' : 'keyless', model, workspace: root, fileReadWrite: true, persistedAndResumed: true,
    eventTypes: [...new Set(events.map(e => e.type))], events: events.length }
  await writeFile(join(runtime, live ? 'live-result.json' : 'replay-result.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result))
} finally {
  clearTimeout(timeout)
  await resumed?.dispose(); await handle?.dispose()
  adapter?.dispose(); await ctx.fiber.dispose()
  if (live) await client.logout()
  if (server) await new Promise(r => server.close(r))
}
