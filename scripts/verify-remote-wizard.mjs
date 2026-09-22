/**
 * `/connect` 远程向导的无网络回归。
 *
 * 覆盖登录凭据遮罩与摘要脱敏，以及会话、工作区、模型、Agent、权限、
 * plan、本地工作区、刷新、清理和完成的完整菜单编排。
 * 运行：node --import tsx/esm scripts/verify-remote-wizard.mjs
 */
import { runRemoteWizard } from '../src/dsh-adapter/remote-wizard.js'

let failures = 0
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}

const endpoint = 'https://chat.example.invalid'
const emailSentinel = 'mask-user@example.invalid'
const passwordSentinel = 'MASK_PASSWORD_SENTINEL_92741'
const calls = {
  login: [],
  operations: [],
  notifications: [],
  pushed: [],
  credentialRedacted: false,
  credentialMasked: false,
}

let version = 0
let snapshot = {
  version,
  phase: 'disconnected',
  endpoint,
  modelCount: 0,
  sessionCount: 0,
  workspaceCount: 0,
}
function update(patch) {
  snapshot = { ...snapshot, ...patch, version: ++version }
  return snapshot
}

const control = {
  subscribe: () => () => undefined,
  snapshot: () => snapshot,
  connect: async candidate => {
    calls.operations.push(['connect', candidate])
    return update({ phase: 'login-required', endpoint: candidate ?? endpoint })
  },
  login: async (candidate, email, password) => {
    calls.login.push([candidate, email, password])
    return update({
      phase: 'authenticated',
      user: { displayName: '验收用户', role: 'user' },
      quota: { available: true, remainingUsd: 10, currency: 'USD' },
      modelCount: 1,
    })
  },
  refresh: async () => {
    calls.operations.push(['refresh'])
    return update({})
  },
  logout: async () => { calls.operations.push(['logout']); update({ phase: 'disconnected' }) },
  listSessions: async () => [{ id: 'session-1', title: '已有会话' }],
  selectSession: async id => { calls.operations.push(['select-session', id]); return update({ activeSession: id }) },
  createSession: async () => { calls.operations.push(['create-session']); return update({ activeSession: '新会话', sessionCount: 1 }) },
  renameActiveSession: async title => { calls.operations.push(['rename-session', title]); return update({ activeSession: title }) },
  cancelActiveSession: async () => { calls.operations.push(['cancel-session']); return update({ activeSession: undefined }) },
  listWorkspaces: async () => [{ id: 'workspace-1', title: '已有工作区' }],
  selectWorkspace: async id => { calls.operations.push(['select-workspace', id]); return update({ activeWorkspace: id }) },
  createWorkspace: async title => { calls.operations.push(['create-workspace', title]); return update({ activeWorkspace: title, workspaceCount: 1 }) },
  renameActiveWorkspace: async title => { calls.operations.push(['rename-workspace', title]); return update({ activeWorkspace: title }) },
  deleteActiveWorkspace: async () => { calls.operations.push(['delete-workspace']); return update({ activeWorkspace: undefined, workspaceCount: 0 }) },
  listModels: async () => [{ provider: 'provider-a', model: 'model-a', label: '模型 A' }],
  selectModel: async (provider, model) => { calls.operations.push(['select-model', provider, model]); return update({}) },
  listAgentPresets: async () => [{ id: 'agent-a', label: 'Agent A' }],
  selectAgentPreset: async id => { calls.operations.push(['select-agent', id]); return update({}) },
  listPermissionPresets: async () => [{ value: 'permission-a', label: '权限 A' }],
  selectPermissionPreset: async value => { calls.operations.push(['select-permission', value]); return update({}) },
  setPlan: async active => { calls.operations.push(['set-plan', active]); return update({}) },
  bindLocalWorkspace: async root => { calls.operations.push(['bind-local', root]); return update({ localWorkspace: { label: 'project', connected: true } }) },
  unbindLocalWorkspace: async () => { calls.operations.push(['unbind-local']); return update({ localWorkspace: undefined }) },
  dispose: async () => undefined,
}

const actionIndexes = [1, 2, 3, 4, 4, 4, 4, 5, 5, 6, 2, 1, 8]
let actionIndex = 0
let sessionIndex = 0
let workspaceIndex = 0
let modeIndex = 0
let localIndex = 0

const outcome = await runRemoteWizard({
  control,
  endpoint,
  ask: async (request, options) => {
    if (request.questions.some(question => question.id === 'password')) {
      calls.credentialRedacted = options?.redact === true
      calls.credentialMasked = request.questions.every(question => question.maskInput === true)
    }
    return {
      answers: request.questions.map(question => {
        const labels = (question.options ?? []).map(option => option.label)
        if (question.id === 'email') return { id: question.id, selected: [], custom: emailSentinel }
        if (question.id === 'password') return { id: question.id, selected: [], custom: passwordSentinel }
        if (question.id === 'action') return { id: question.id, selected: [labels[actionIndexes[actionIndex++]]] }
        if (question.id === 'session') return { id: question.id, selected: [labels[sessionIndex++ === 0 ? 0 : 1]] }
        if (question.id === 'session-title') return { id: question.id, selected: [], custom: 'PTY 验收会话' }
        if (question.id === 'workspace') return { id: question.id, selected: [labels[workspaceIndex++ === 0 ? 0 : 1]] }
        if (question.id === 'title') return { id: question.id, selected: [], custom: 'PTY 验收工作区' }
        if (question.id === 'model' || question.id === 'preset' || question.id === 'permission') {
          return { id: question.id, selected: [labels[0]] }
        }
        if (question.id === 'mode') return { id: question.id, selected: [labels[modeIndex++]] }
        if (question.id === 'local-action') return { id: question.id, selected: [labels[localIndex++]] }
        if (question.id === 'root') return { id: question.id, selected: [], custom: '/tmp/project' }
        throw new Error(`unscripted question: ${question.id}`)
      }),
    }
  },
  notify: (text, options) => { calls.notifications.push({ text, color: options?.color }) },
  pushLocal: (title, lines) => { calls.pushed.push({ title, lines }) },
})

const operationNames = calls.operations.map(item => item[0])
const publicOutput = JSON.stringify({ notifications: calls.notifications, pushed: calls.pushed })
check('向导正常完成', outcome === 'done')
check('凭据批次启用摘要脱敏', calls.credentialRedacted)
check('邮箱与密码输入均启用终端遮罩', calls.credentialMasked)
check('登录仅向控制层传递原始凭据', calls.login.length === 1
  && calls.login[0][1] === emailSentinel && calls.login[0][2] === passwordSentinel)
check('公开输出不含邮箱', !publicOutput.includes(emailSentinel))
check('公开输出不含密码', !publicOutput.includes(passwordSentinel))
for (const name of [
  'create-session', 'rename-session', 'create-workspace', 'select-model',
  'select-agent', 'select-permission', 'bind-local', 'unbind-local',
  'delete-workspace', 'cancel-session', 'refresh',
]) check(`执行 ${name}`, operationNames.includes(name))
check('plan 完成开启与关闭', calls.operations.some(item => item[0] === 'set-plan' && item[1] === true)
  && calls.operations.some(item => item[0] === 'set-plan' && item[1] === false))

console.log(failures === 0 ? '\nAll remote-wizard checks passed' : `\n${failures} check(s) FAILED`)
process.exit(failures === 0 ? 0 : 1)
