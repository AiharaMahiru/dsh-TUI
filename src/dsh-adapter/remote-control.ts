import WebSocket from 'ws'

import type {
  RemoteModelOption,
  RemotePermissionOption,
  RemotePresetOption,
  RemoteSessionOption,
  RemoteTuiControl,
  RemoteTuiSnapshot,
  RemoteWorkspaceOption,
} from '../adapter/ports/remote-control.js'
import {
  DshTuiRemoteClient,
  RemoteClientError,
  normalizeErrorCode,
  type ModelCatalog,
  type SessionSummary,
  type WebSocketLike,
} from './remote/index.js'
import { createLocalWorkspaceExecutor, type LocalWorkspaceExecutor } from './remote/local-files.js'

interface RemoteControlOptions {
  readonly endpoint?: string
}

/** Create the host-owned dsh Web client. UI code receives only the narrow,
 * secret-free port from `adapter/ports/remote-control.ts`. */
export function createRemoteTuiControl(options: RemoteControlOptions = {}): RemoteTuiControl {
  let endpoint = cleanEndpoint(options.endpoint)
  let client: DshTuiRemoteClient | undefined
  let capabilitiesModels: ModelCatalog | undefined
  let sessions: readonly SessionSummary[] = []
  let workspaces: readonly RemoteWorkspaceOption[] = []
  let selectedSessionId: string | undefined
  let selectedWorkspaceId: string | undefined
  let phase: RemoteTuiSnapshot['phase'] = 'disconnected'
  let user: RemoteTuiSnapshot['user']
  let quota: RemoteTuiSnapshot['quota']
  let modelCount = 0
  let errorCode: string | undefined
  let localExecutor: LocalWorkspaceExecutor | undefined
  let localAbort: AbortController | undefined
  let localSessionId: string | undefined
  let localConnected = false
  let version = 0
  const listeners = new Set<() => void>()
  let current = buildSnapshot()

  function buildSnapshot(): RemoteTuiSnapshot {
    const activeSession = sessions.find(item => item.id === selectedSessionId)
    const activeWorkspace = workspaces.find(item => item.id === selectedWorkspaceId)
    return Object.freeze({
      version,
      phase,
      ...(endpoint ? { endpoint } : {}),
      ...(user ? { user } : {}),
      ...(quota ? { quota } : {}),
      modelCount,
      sessionCount: sessions.length,
      workspaceCount: workspaces.length,
      ...(activeSession ? { activeSession: safeText(activeSession.title ?? activeSession.id, 96) } : {}),
      ...(activeWorkspace ? { activeWorkspace: activeWorkspace.title } : {}),
      ...(localExecutor ? { localWorkspace: { label: localExecutor.label, connected: localConnected } } : {}),
      ...(errorCode ? { errorCode } : {}),
    })
  }

  function publish(): RemoteTuiSnapshot {
    version += 1
    current = buildSnapshot()
    for (const listener of [...listeners]) listener()
    return current
  }

  function useEndpoint(candidate?: string): DshTuiRemoteClient {
    const next = cleanEndpoint(candidate) ?? endpoint
    if (!next) throw new RemoteClientError('INVALID_ENDPOINT')
    if (client !== undefined && endpoint === next) return client
    stopLocalWorkspace()
    const nextClient = new DshTuiRemoteClient({
      endpoint: next,
      websocketFactory: (url, factoryOptions) => {
        const headers: Record<string, string> = {}
        if (factoryOptions.headers.origin) headers.Origin = factoryOptions.headers.origin
        if (factoryOptions.headers.cookie) headers.Cookie = factoryOptions.headers.cookie
        const socket = new WebSocket(url, { headers })
        const abort = () => socket.close(1000, 'cancelled')
        if (factoryOptions.signal.aborted) abort()
        else factoryOptions.signal.addEventListener('abort', abort, { once: true })
        return socket as unknown as WebSocketLike
      },
    })
    endpoint = next
    client = nextClient
    capabilitiesModels = undefined
    sessions = []
    workspaces = []
    selectedSessionId = undefined
    selectedWorkspaceId = undefined
    user = undefined
    quota = undefined
    modelCount = 0
    return nextClient
  }

  function authenticatedClient(): DshTuiRemoteClient {
    if (client === undefined || phase !== 'authenticated') throw new RemoteClientError('AUTH_REQUIRED')
    return client
  }

  async function refresh(): Promise<RemoteTuiSnapshot> {
    const remote = client
    if (remote === undefined) throw new RemoteClientError('INVALID_ENDPOINT')
    try {
      const [capabilities, sessionResult, workspaceResult] = await Promise.all([
        remote.capabilities(),
        remote.listSessions(),
        remote.listWorkspaces(),
      ])
      capabilitiesModels = capabilities.models
      sessions = sessionResult.items
      workspaces = workspaceResult.items.map(item => ({
        id: item.workspaceId,
        title: safeText(item.title ?? item.path ?? item.workspaceId, 96),
        ...(item.path ? { path: item.path } : {}),
      }))
      if (!sessions.some(item => item.id === selectedSessionId)) selectedSessionId = sessions[0]?.id
      if (!workspaces.some(item => item.id === selectedWorkspaceId)) {
        selectedWorkspaceId = sessions.find(item => item.id === selectedSessionId)?.workspaceId ?? workspaces[0]?.id
      }
      phase = 'authenticated'
      user = { displayName: safeText(capabilities.user.displayName, 96), role: capabilities.user.role }
      quota = {
        ...(capabilities.quota.available === undefined ? {} : { available: capabilities.quota.available }),
        ...(capabilities.quota.remainingUsd === undefined ? {} : { remainingUsd: capabilities.quota.remainingUsd }),
        ...(capabilities.quota.currency ? { currency: safeText(capabilities.quota.currency, 12) } : {}),
      }
      modelCount = capabilities.models.profiles.reduce((sum, profile) => sum + profile.modelIds.length, 0)
        + capabilities.models.sharedModels.length
      errorCode = undefined
      return publish()
    } catch (error) {
      errorCode = safeErrorCode(error)
      if (errorCode === 'AUTH_REQUIRED') {
        phase = 'login-required'
        user = undefined
      }
      publish()
      throw error
    }
  }

  async function ensureSession(workspaceId?: string): Promise<string> {
    const remote = authenticatedClient()
    if (selectedSessionId && (workspaceId === undefined || sessions.find(item => item.id === selectedSessionId)?.workspaceId === workspaceId)) {
      return selectedSessionId
    }
    const before = new Set(sessions.map(item => item.id))
    const created = await remote.createSession({ request: workspaceId ? { workspaceId } : {} })
    const direct = sessionIdOf(created)
    await refresh()
    selectedSessionId = direct ?? sessions.find(item => !before.has(item.id))?.id
    if (!selectedSessionId) throw new RemoteClientError('INVALID_RESPONSE')
    publish()
    return selectedSessionId
  }

  function stopLocalWorkspace(): void {
    localAbort?.abort()
    localAbort = undefined
    localExecutor?.dispose()
    localExecutor = undefined
    localSessionId = undefined
    localConnected = false
  }

  const control: RemoteTuiControl = {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    snapshot() {
      return current
    },
    async connect(candidate) {
      const remote = useEndpoint(candidate)
      phase = 'connecting'
      errorCode = undefined
      publish()
      try {
        const restored = await remote.restore()
        if (restored === undefined) {
          phase = 'login-required'
          user = undefined
          return publish()
        }
        return await refresh()
      } catch (error) {
        phase = error instanceof RemoteClientError && error.code === 'AUTH_REQUIRED' ? 'login-required' : 'error'
        errorCode = safeErrorCode(error)
        publish()
        throw error
      }
    },
    async login(candidate, email, password) {
      const remote = useEndpoint(candidate)
      phase = 'connecting'
      errorCode = undefined
      publish()
      try {
        await remote.login(email, password)
        return await refresh()
      } catch (error) {
        phase = error instanceof RemoteClientError && error.code === 'INVALID_CREDENTIALS' ? 'login-required' : 'error'
        errorCode = safeErrorCode(error)
        publish()
        throw error
      }
    },
    refresh,
    async logout() {
      if (client !== undefined) {
        try { await control.unbindLocalWorkspace() } catch { stopLocalWorkspace() }
        await client.logout()
      }
      phase = 'disconnected'
      user = undefined
      quota = undefined
      sessions = []
      workspaces = []
      capabilitiesModels = undefined
      modelCount = 0
      selectedSessionId = undefined
      selectedWorkspaceId = undefined
      errorCode = undefined
      publish()
    },
    async listSessions() {
      await refresh()
      return sessions.map(item => ({
        id: item.id,
        title: safeText(item.title ?? '未命名会话', 96),
        ...(item.cwd ? { cwd: safeText(item.cwd, 512) } : {}),
        ...(item.model ? { model: safeText(item.model, 128) } : {}),
        ...(item.workspaceId ? { workspaceId: item.workspaceId } : {}),
      }))
    },
    async selectSession(id) {
      authenticatedClient()
      if (!sessions.some(item => item.id === id)) await refresh()
      if (!sessions.some(item => item.id === id)) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      selectedSessionId = id
      selectedWorkspaceId = sessions.find(item => item.id === id)?.workspaceId ?? selectedWorkspaceId
      errorCode = undefined
      return publish()
    },
    async createSession(workspaceId) {
      selectedSessionId = undefined
      await ensureSession(workspaceId ?? selectedWorkspaceId)
      return refresh()
    },
    async renameActiveSession(title) {
      const remote = authenticatedClient()
      const sessionId = selectedSessionId
      if (!sessionId) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      await remote.renameSession(sessionId, title)
      return refresh()
    },
    async cancelActiveSession() {
      const remote = authenticatedClient()
      const sessionId = selectedSessionId
      if (!sessionId) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      await remote.cancelSession(sessionId)
      selectedSessionId = undefined
      return refresh()
    },
    async listWorkspaces() {
      await refresh()
      return workspaces
    },
    async selectWorkspace(id) {
      authenticatedClient()
      if (!workspaces.some(item => item.id === id)) await refresh()
      if (!workspaces.some(item => item.id === id)) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      selectedWorkspaceId = id
      const attached = sessions.find(item => item.workspaceId === id)
      if (attached) selectedSessionId = attached.id
      errorCode = undefined
      return publish()
    },
    async createWorkspace(title) {
      const remote = authenticatedClient()
      const sessionId = await ensureSession()
      const session = sessions.find(item => item.id === sessionId)
      if (!session?.cwd) throw new RemoteClientError('WORKSPACE_PATH_NOT_ALLOWED')
      const created = await remote.createWorkspace({ request: { path: session.cwd } })
      const workspaceId = workspaceIdOf(created)
      if (workspaceId && title?.trim()) await remote.renameWorkspace(workspaceId, title.trim())
      await refresh()
      selectedWorkspaceId = workspaceId ?? workspaces.find(item => item.path === session.cwd)?.id
      publish()
      return current
    },
    async renameActiveWorkspace(title) {
      const remote = authenticatedClient()
      const workspaceId = selectedWorkspaceId
      if (!workspaceId) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      await remote.renameWorkspace(workspaceId, title)
      return refresh()
    },
    async deleteActiveWorkspace() {
      const remote = authenticatedClient()
      const workspaceId = selectedWorkspaceId
      if (!workspaceId) throw new RemoteClientError('RESOURCE_NOT_ALLOWED')
      await remote.deleteWorkspace(workspaceId)
      selectedWorkspaceId = undefined
      return refresh()
    },
    async listModels() {
      const remote = authenticatedClient()
      const sessionId = await ensureSession()
      const catalog = await remote.sessionModelCatalog(sessionId)
      return collectModels(capabilitiesModels, catalog)
    },
    async selectModel(provider, model) {
      const remote = authenticatedClient()
      const sessionId = await ensureSession()
      await remote.selectModel(sessionId, { provider, model })
      sessions = sessions.map(item => item.id === sessionId ? { ...item, model } : item)
      errorCode = undefined
      return publish()
    },
    async listAgentPresets() {
      const catalog = await authenticatedClient().agentPresets()
      return catalog.presets.map(item => ({
        id: item.id,
        label: safeText(item.name ?? item.id, 96),
        ...(item.description ? { description: safeText(item.description, 240) } : {}),
        ...(item.isDefault === undefined ? {} : { isDefault: item.isDefault }),
      }))
    },
    async selectAgentPreset(id) {
      const remote = authenticatedClient()
      await remote.selectAgentPreset(await ensureSession(), id)
      errorCode = undefined
      return publish()
    },
    async listPermissionPresets() {
      const catalog = await authenticatedClient().permissionPresets()
      return catalog.options.map(item => ({
        value: item.value,
        label: safeText(item.name, 96),
        ...(item.description ? { description: safeText(item.description, 240) } : {}),
      }))
    },
    async selectPermissionPreset(value) {
      const remote = authenticatedClient()
      await remote.selectMode(await ensureSession(), { kind: 'permission-preset', value })
      errorCode = undefined
      return publish()
    },
    async setPlan(active) {
      const remote = authenticatedClient()
      await remote.selectMode(await ensureSession(), { kind: 'plan', active })
      errorCode = undefined
      return publish()
    },
    async bindLocalWorkspace(root) {
      const remote = authenticatedClient()
      const sessionId = await ensureSession()
      stopLocalWorkspace()
      const executor = await createLocalWorkspaceExecutor(root)
      try {
        await remote.workspace.bind(sessionId)
      } catch (error) {
        executor.dispose()
        errorCode = safeErrorCode(error)
        publish()
        throw error
      }
      localExecutor = executor
      localSessionId = sessionId
      localAbort = new AbortController()
      localConnected = true
      errorCode = undefined
      publish()
      void remote.workspace.serve(sessionId, executor.execute, { signal: localAbort.signal }).catch(error => {
        if (localAbort?.signal.aborted) return
        localConnected = false
        errorCode = safeErrorCode(error)
        publish()
      })
      return current
    },
    async unbindLocalWorkspace() {
      const remote = client
      const sessionId = localSessionId
      localAbort?.abort()
      localAbort = undefined
      if (remote !== undefined && sessionId !== undefined) await remote.workspace.unbind(sessionId)
      localExecutor?.dispose()
      localExecutor = undefined
      localSessionId = undefined
      localConnected = false
      errorCode = undefined
      return publish()
    },
    async dispose() {
      try { await control.unbindLocalWorkspace() } catch { stopLocalWorkspace(); publish() }
      listeners.clear()
    },
  }
  return Object.freeze(control)
}

function cleanEndpoint(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function safeText(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, max)
}

function safeErrorCode(error: unknown): string {
  return error instanceof RemoteClientError ? error.code : normalizeErrorCode(undefined)
}

function sessionIdOf(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  return typeof record.id === 'string' ? record.id : typeof record.sessionId === 'string' ? record.sessionId : undefined
}

function workspaceIdOf(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  return typeof record.workspaceId === 'string' ? record.workspaceId : typeof record.id === 'string' ? record.id : undefined
}

function collectModels(models: ModelCatalog | undefined, catalog: unknown): readonly RemoteModelOption[] {
  const output: RemoteModelOption[] = []
  const seen = new Set<string>()
  const add = (provider: unknown, model: unknown, label?: unknown) => {
    if (typeof provider !== 'string' || typeof model !== 'string' || !provider.trim() || !model.trim()) return
    const key = `${provider}/${model}`
    if (seen.has(key)) return
    seen.add(key)
    output.push({ provider, model, label: safeText(typeof label === 'string' && label ? label : key, 160) })
  }
  const walk = (value: unknown, inheritedProvider?: string, depth = 0): void => {
    if (depth > 8 || !value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      for (const item of value.slice(0, 500)) walk(item, inheritedProvider, depth + 1)
      return
    }
    const record = value as Record<string, unknown>
    const provider = typeof record.provider === 'string'
      ? record.provider
      : typeof record.providerId === 'string'
        ? record.providerId
        : inheritedProvider
    const model = typeof record.model === 'string'
      ? record.model
      : typeof record.modelId === 'string'
        ? record.modelId
        : provider && typeof record.id === 'string'
          ? record.id
          : undefined
    add(provider, model, record.name ?? record.displayName)
    for (const key of ['items', 'models', 'profiles', 'sharedModels', 'options', 'value', 'result', 'providers']) {
      if (record[key] !== undefined) walk(record[key], provider, depth + 1)
    }
  }
  walk(catalog)
  for (const profile of models?.profiles ?? []) {
    for (const model of profile.modelIds) add(profile.id, model)
    if (profile.defaultModel) add(profile.id, profile.defaultModel)
  }
  walk(models?.sharedModels)
  return output
}
