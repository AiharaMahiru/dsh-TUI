/** 云端仅负责推理，本地 Agent、会话与工作区工具继续由官方 Harness 执行。 */
import type { Context } from '@deepseek-ai/cordis'
import { LlmAdapter, LlmError, type GenerateOptions, type LlmResolvedModelInfo, type StreamChunk } from '@deepseek-ai/dsh-llm'
import { FileCredentialStore } from './credential-store.js'
import { DshTuiRemoteClient } from './client.js'
import { RemoteClientError } from './errors.js'
import { normalizeEndpoint } from './transport.js'
import type { CredentialStore, ModelCatalog } from './types.js'
import { createAccountInference } from './account-inference.js'

export const ACCOUNT_PROVIDER = 'mewclaw-cloud'

export interface AccountModelOptions {
  readonly endpoint?: string
  readonly timeoutMs: number
  readonly contextWindow: number
  readonly maxTokens: number
  readonly credentials?: CredentialStore
}

interface Entry { id: string; name: string }

/** 读取 /connect 持久化登录态；不向 UI 暴露 Cookie，也不依赖远程工作区服务。 */
export class RemoteAccountModel extends LlmAdapter {
  private readonly credentials: CredentialStore
  private readonly lifetime = new AbortController()

  constructor(private readonly options: AccountModelOptions) {
    super()
    this.credentials = options.credentials ?? new FileCredentialStore()
    if (options.endpoint) normalizeEndpoint(options.endpoint, false)
  }

  override providerInfo() { return { id: ACCOUNT_PROVIDER, name: 'MewClaw 云端账号' } }

  override async listModels(): Promise<readonly LlmResolvedModelInfo[]> {
    try {
      const client = await this.client()
      return entries(await client.models()).map(entry => this.info(entry))
    } catch { return [] }
  }

  override async resolveModel(_provider: string, model: string): Promise<LlmResolvedModelInfo> {
    // 历史会话可离线打开；真实请求另行核对账号与服务端目录。
    if (!validSelector(model)) throw new LlmError('云端模型选择无效。', 'MODEL_NOT_FOUND')
    return this.info({ id: model, name: model })
  }

  override async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const client = await this.client()
    const entry = entries(await client.models()).find(item => item.id === options.model)
    if (!entry) throw new LlmError('所选云端模型已不可用，请在 /model 中重新选择。', 'MODEL_NOT_FOUND')
    const signal = AbortSignal.any([this.lifetime.signal, AbortSignal.timeout(this.options.timeoutMs), ...options.signal ? [options.signal] : []])
    const adapter = await createAccountInference(client, this.options, entry)
    try {
      for await (const chunk of adapter.stream({ ...options, provider: ACCOUNT_PROVIDER, signal })) {
        if (chunk.type === 'finish' && chunk.reason.kind === 'error') {
          // 上游错误正文可能包含账号数据；只向本地日志输出固定指引。
          yield { ...chunk, reason: { kind: 'error', failure: { code: chunk.reason.failure?.code ?? 'CLOUD_INFERENCE_FAILED', message: '云端推理失败，请检查 /connect 登录状态及账号模型。' } } }
        } else yield chunk
      }
    } catch (error) {
      if (signal.aborted) throw error
      throw new LlmError('云端推理连接失败，请检查网络与 /connect 登录状态。', 'CLOUD_INFERENCE_FAILED')
    }
  }

  dispose(): void { this.lifetime.abort() }

  private info(entry: Entry): LlmResolvedModelInfo {
    return { provider: ACCOUNT_PROVIDER, ...entry, inputModalities: ['text'],
      context: { contextWindow: this.options.contextWindow }, defaultMaxTokens: this.options.maxTokens }
  }

  private async client(): Promise<DshTuiRemoteClient> {
    if (this.lifetime.signal.aborted) throw new LlmError('云端账号模型已卸载。', 'CLOUD_LOGIN_REQUIRED')
    const stored = await this.credentials.load()
    if (!stored) throw new LlmError('请先使用 /connect 登录云端账号，再选择 /model。', 'CLOUD_LOGIN_REQUIRED')
    const endpoint = normalizeEndpoint(this.options.endpoint ?? stored.endpoint, false)
    if (`${endpoint.origin}${endpoint.basePath}` !== stored.endpoint.replace(/\/+$/u, '')) {
      throw new LlmError('云端地址与登录账号不匹配，请重新 /connect。', 'CLOUD_LOGIN_REQUIRED')
    }
    // 客户端从同一存储恢复，models() 的 401 会通过既有认证边界清除过期登录。
    const client = new DshTuiRemoteClient({ endpoint: stored.endpoint, credentialStore: this.credentials,
      requestTimeoutMs: this.options.timeoutMs })
    try { await client.me() } catch (error) {
      if (error instanceof RemoteClientError && error.code === 'AUTH_REQUIRED') {
        throw new LlmError('云端会话已失效，请重新 /connect。', 'CLOUD_LOGIN_REQUIRED')
      }
      throw new LlmError('云端账号暂不可用，请检查网络后重试。', 'CLOUD_INFERENCE_FAILED')
    }
    return client
  }
}

/** 注册与释放均由 TUI 的 Cordis fiber 持有。 */
export function installAccountModel(ctx: Context, options: AccountModelOptions): void {
  ctx.inject(['llm'], local => {
    const adapter = new RemoteAccountModel(options)
    local.effect(() => local.llm.registerAdapter([ACCOUNT_PROVIDER], adapter))
    local.effect(() => () => adapter.dispose())
  })
}

function validSelector(value: string): boolean {
  return value === 'cloud-default' || /^(?:account|shared)\/[^/\s]+\/.+$/u.test(value)
}

function entries(catalog: ModelCatalog): Entry[] {
  const result: Entry[] = []
  for (const profile of catalog.profiles) {
    if (!profile.keyConfigured) continue
    if (profile.id === catalog.defaultProfileId) result.push({ id: 'cloud-default', name: `账号默认 · ${profile.defaultModel}` })
    for (const model of profile.modelIds) result.push({ id: `account/${profile.id}/${model}`, name: `${profile.displayName} · ${model}` })
  }
  for (const model of catalog.sharedModels) {
    if (typeof model.provider === 'string' && !model.provider.includes('/') && typeof model.model === 'string' && typeof model.name === 'string') {
      result.push({ id: `shared/${model.provider}/${model.model}`, name: model.name })
    }
  }
  return result
}
