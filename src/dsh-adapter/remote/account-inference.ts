/** 复用宿主 PiAiAdapter 及其同一份 pi-ai，避免 profile 中产生第二个框架实例。 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PiAiAdapter, type PiAiAdapterOptions, type ResolvedPiAiProviderProfile } from '@deepseek-ai/dsh-llm-pi-ai'
import { ACCOUNT_PROVIDER, type AccountModelOptions } from './account-model.js'
import type { DshTuiRemoteClient } from './client.js'

type Provider = NonNullable<ResolvedPiAiProviderProfile['piProvider']>
interface ProviderFactory {
  createProvider(input: { id: string; name: string; baseUrl: string; auth: Provider['auth']; models: ReturnType<Provider['getModels']>; api: unknown }): Provider
}

const auth: PiAiAdapterOptions['auth'] = {
  credentials: { async read() { return undefined }, async list() { return [] }, async modify(_id, fn) { return fn(undefined) }, async delete() {} },
  authContext: { async env() { return undefined }, async fileExists() { return false } },
}

/** 与 dsh-auth 相同，从官方适配器的依赖树解析公开 pi-ai 模块。 */
async function providerFactory(): Promise<{ factory: ProviderFactory; api: unknown }> {
  const require = createRequire(import.meta.resolve('@deepseek-ai/dsh-llm-pi-ai/package.json'))
  for (const root of require.resolve.paths('@earendil-works/pi-ai') ?? []) {
    const directory = join(root, '@earendil-works/pi-ai/dist')
    if (!existsSync(join(directory, 'index.js'))) continue
    const factory = await import(pathToFileURL(join(directory, 'index.js')).href) as ProviderFactory
    const protocol = await import(pathToFileURL(join(directory, 'api/openai-completions.lazy.js')).href) as { openAICompletionsApi(): unknown }
    return { factory, api: protocol.openAICompletionsApi() }
  }
  throw new Error('REMOTE_MODEL_ADAPTER_UNAVAILABLE')
}

/** 每次请求冻结登录态及推理地址；供应商 API Key 不进入本机。 */
export async function createAccountInference(client: DshTuiRemoteClient, options: AccountModelOptions, entry: { id: string; name: string }): Promise<PiAiAdapter> {
  const { factory, api } = await providerFactory()
  const baseURL = client.http.url('/auth/desktop-inference').href
  const csrf = client.http.cookies.csrf()
  const cookie = client.http.cookies.header(new URL(baseURL))
  if (!csrf || !cookie) throw new Error('CLOUD_LOGIN_REQUIRED')
  const profile: ResolvedPiAiProviderProfile = {
    provider: ACCOUNT_PROVIDER, displayName: 'MewClaw 云端账号', baseURL,
    headers: { cookie, origin: client.http.endpoint.origin, 'x-csrf-token': csrf },
    streamIdleTimeoutMs: options.timeoutMs,
    retryPolicy: { mode: 'normal', maxRetries: 0, retryableCodes: [], initialDelayMs: 500, maxDelayMs: 10000, jitterRatio: 0 },
    configuredMaxTokens: new Map(), modelErrors: new Map(),
    maxRequestImageBytes: 1, requestImagePixelBudget: 1, requestImageMaxBytes: 1,
    piProvider: factory.createProvider({ id: ACCOUNT_PROVIDER, name: 'MewClaw 云端账号', baseUrl: baseURL,
      // 兼容协议的固定占位值；认证只使用账号 Cookie/CSRF。
      auth: { apiKey: { name: '云端会话', resolve: async () => ({ auth: { apiKey: 'desktop-session' }, source: '云端会话' }) } },
      models: [{ id: entry.id, name: entry.name, api: 'openai-completions', provider: ACCOUNT_PROVIDER, baseUrl: baseURL,
        reasoning: false, input: ['text'], contextWindow: options.contextWindow, maxTokens: options.maxTokens,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, compat: { supportsStore: false } }], api }),
  }
  return new PiAiAdapter({ profiles: () => new Map([[ACCOUNT_PROVIDER, profile]]), resolveApiKey: async () => 'desktop-session', auth })
}
