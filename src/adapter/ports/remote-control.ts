/** UI-safe view of the optional dsh Web connection. Secrets and cookie values
 * never cross this adapter port. */
export type RemoteConnectionPhase =
  | 'disconnected'
  | 'connecting'
  | 'login-required'
  | 'authenticated'
  | 'error'

export interface RemoteSessionOption {
  readonly id: string
  readonly title: string
  readonly cwd?: string
  readonly model?: string
  readonly workspaceId?: string
}

export interface RemoteWorkspaceOption {
  readonly id: string
  readonly title: string
  readonly path?: string
}

export interface RemoteModelOption {
  readonly provider: string
  readonly model: string
  readonly label: string
}

export interface RemotePresetOption {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly isDefault?: boolean
}

export interface RemotePermissionOption {
  readonly value: string
  readonly label: string
  readonly description?: string
}

export interface RemoteTuiSnapshot {
  readonly version: number
  readonly phase: RemoteConnectionPhase
  readonly endpoint?: string
  readonly user?: {
    readonly displayName: string
    readonly role: 'admin' | 'user'
  }
  readonly quota?: {
    readonly available?: boolean
    readonly remainingUsd?: number
    readonly currency?: string
  }
  readonly modelCount: number
  readonly sessionCount: number
  readonly workspaceCount: number
  readonly activeSession?: string
  readonly activeWorkspace?: string
  readonly localWorkspace?: {
    readonly label: string
    readonly connected: boolean
  }
  readonly errorCode?: string
}

/** Host-side remote service used by Chat. Passwords are accepted only by
 * `login()` and are never returned, logged, or persisted by this interface. */
export interface RemoteTuiControl {
  subscribe(listener: () => void): () => void
  snapshot(): RemoteTuiSnapshot
  connect(endpoint?: string): Promise<RemoteTuiSnapshot>
  login(endpoint: string | undefined, email: string, password: string): Promise<RemoteTuiSnapshot>
  refresh(): Promise<RemoteTuiSnapshot>
  logout(): Promise<void>
  listSessions(): Promise<readonly RemoteSessionOption[]>
  selectSession(id: string): Promise<RemoteTuiSnapshot>
  createSession(workspaceId?: string): Promise<RemoteTuiSnapshot>
  renameActiveSession(title: string): Promise<RemoteTuiSnapshot>
  cancelActiveSession(): Promise<RemoteTuiSnapshot>
  listWorkspaces(): Promise<readonly RemoteWorkspaceOption[]>
  selectWorkspace(id: string): Promise<RemoteTuiSnapshot>
  createWorkspace(title?: string): Promise<RemoteTuiSnapshot>
  renameActiveWorkspace(title: string): Promise<RemoteTuiSnapshot>
  deleteActiveWorkspace(): Promise<RemoteTuiSnapshot>
  listModels(): Promise<readonly RemoteModelOption[]>
  selectModel(provider: string, model: string): Promise<RemoteTuiSnapshot>
  listAgentPresets(): Promise<readonly RemotePresetOption[]>
  selectAgentPreset(id: string): Promise<RemoteTuiSnapshot>
  listPermissionPresets(): Promise<readonly RemotePermissionOption[]>
  selectPermissionPreset(value: string): Promise<RemoteTuiSnapshot>
  setPlan(active: boolean): Promise<RemoteTuiSnapshot>
  bindLocalWorkspace(root: string): Promise<RemoteTuiSnapshot>
  unbindLocalWorkspace(): Promise<RemoteTuiSnapshot>
  dispose(): Promise<void>
}
