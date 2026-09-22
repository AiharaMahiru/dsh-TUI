/** 无密钥真实 HTTP/SSE + Cordis/官方 PiAiAdapter 回归。运行：node --import tsx/esm scripts/verify-remote-account-model.mjs */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { Context } from '@deepseek-ai/cordis'
import Llm, { createUserMessage } from '@deepseek-ai/dsh-llm'
import { RemoteAccountModel, ACCOUNT_PROVIDER, installAccountModel } from '../src/dsh-adapter/remote/account-model.js'
import { MemoryCredentialStore } from '../src/dsh-adapter/remote/credential-store.js'

const requests = []
let authorized = true
const server = createServer(async (req, res) => {
  requests.push(req.url)
  if (!authorized) { res.writeHead(401); res.end(JSON.stringify({ error: 'UNAUTHORIZED' })); return }
  assert.match(req.headers.cookie ?? '', /dsh_session=keyless-session/)
  if (req.url === '/auth/me') {
    res.end(JSON.stringify({ user: { id: 'test', email: 'test@example.invalid', displayName: '测试', role: 'user', defaultMode: 'full' } })); return
  }
  if (req.url === '/auth/models') {
    res.end(JSON.stringify({ profiles: [], defaultProfileId: null, sharedModels: [{ provider: 'shared-provider', model: 'test-model', name: '回放模型' }] })); return
  }
  assert.equal(req.url, '/auth/desktop-inference/chat/completions')
  assert.equal(req.headers['x-csrf-token'], 'keyless-csrf')
  assert.equal(req.headers.origin, endpoint)
  let body = ''; for await (const chunk of req) body += chunk
  const wire = JSON.parse(body)
  assert.equal(wire.model, 'shared/shared-provider/test-model')
  assert.equal(wire.store, undefined)
  assert.equal(wire.tools[0].function.name, 'write_file')
  assert.equal(wire.tools[0].function.parameters.type, 'object')
  res.writeHead(200, { 'content-type': 'text/event-stream' })
  const chunk = (delta, finish_reason = null) => res.write(`data: ${JSON.stringify({ id: 'keyless', object: 'chat.completion.chunk', model: wire.model, choices: [{ index: 0, delta, finish_reason }] })}\n\n`)
  chunk({ role: 'assistant', tool_calls: [{ index: 0, id: 'call-local', type: 'function', function: { name: 'write_file', arguments: JSON.stringify({ path: '中文 文件.txt', content: '本机读写回放' }) } }] })
  chunk({}, 'tool_calls')
  res.end('data: [DONE]\n\n')
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const endpoint = `http://127.0.0.1:${server.address().port}`
const saved = { endpoint, cookies: [
  { name: 'dsh_session', value: 'keyless-session', path: '/', secure: false },
  { name: 'dsh_csrf', value: 'keyless-csrf', path: '/', secure: false },
] }
const credentials = new MemoryCredentialStore(saved)
const options = { endpoint, credentials, timeoutMs: 3000, contextWindow: 8192, maxTokens: 1024 }
const ctx = new Context()
await ctx.plugin(Llm)
installAccountModel(ctx, options)
const adapter = new RemoteAccountModel(options)
try {
  assert.deepEqual((await adapter.listModels()).map(m => m.id), ['shared/shared-provider/test-model'])
  const chunks = []
  for await (const chunk of adapter.stream({ provider: ACCOUNT_PROVIDER, model: 'shared/shared-provider/test-model',
    messages: [createUserMessage({ content: [{ type: 'text', text: '在本机工作区写入文件' }], source: { kind: 'user' } })],
    tools: [{ name: 'write_file', description: '写本机文件', parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } }],
  })) chunks.push(chunk)
  const serialized = JSON.stringify(chunks)
  assert.match(serialized, /write_file/)
  assert.match(serialized, /本机读写回放/)
  assert.ok(!serialized.includes('keyless-session'))
  assert.ok(!requests.some(path => /workspace|session\//u.test(path)))
  const wrong = new RemoteAccountModel({ ...options, endpoint: 'https://different.example.invalid' })
  await assert.rejects(async () => { for await (const _ of wrong.stream({ provider: ACCOUNT_PROVIDER, model: 'shared/shared-provider/test-model', messages: [] })) {} }, /不匹配/)
  wrong.dispose()
  await credentials.clear()
  assert.equal((await adapter.listModels()).length, 0)
  assert.equal((await adapter.resolveModel(ACCOUNT_PROVIDER, 'shared/shared-provider/test-model')).id, 'shared/shared-provider/test-model')
  await assert.rejects(async () => { for await (const _ of adapter.stream({ provider: ACCOUNT_PROVIDER, model: 'shared/shared-provider/test-model', messages: [] })) {} }, /connect/)
  await credentials.save(saved); authorized = false
  await assert.rejects(async () => { for await (const _ of adapter.stream({ provider: ACCOUNT_PROVIDER, model: 'shared/shared-provider/test-model', messages: [] })) {} }, /失效/)
  assert.equal(await credentials.load(), undefined)
  assert.ok(ctx.llm.listProviders().some(p => p.id === ACCOUNT_PROVIDER))
  console.log('PASS 账号模型目录、真实 SSE 工具调用、Cookie/CSRF、离线恢复、登出与跨地址拒绝；未调用云端工作区')
} finally {
  adapter.dispose()
  await ctx.fiber.dispose()
  await new Promise(resolve => server.close(resolve))
}
