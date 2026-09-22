import { t } from '../i18n.js'
import type { RemoteTuiControl, RemoteTuiSnapshot } from '../adapter/ports/remote-control.js'
import {
  type AskUserQuestionAnswer,
  type AskUserQuestionItem,
  type AskUserQuestionRequest,
} from '@deepseek-ai/dsh-user-questions'

export interface RemoteWizardDeps {
  readonly control: RemoteTuiControl
  readonly endpoint?: string
  readonly ask: (
    request: AskUserQuestionRequest,
    options?: { redact?: boolean },
  ) => Promise<AskUserQuestionAnswer>
  readonly notify: (
    text: string,
    options?: { color?: 'error' | 'warning' | 'success'; timeoutMs?: number },
  ) => void
  readonly pushLocal: (title: string, lines: readonly string[]) => void
}

type WizardQuestion = AskUserQuestionItem & {
  hideCustomInput?: boolean
  maskInput?: boolean
}

const actionKeys = [
  'remote-action-overview',
  'remote-action-session',
  'remote-action-workspace',
  'remote-action-model',
  'remote-action-mode',
  'remote-action-local-workspace',
  'remote-action-refresh',
  'remote-action-logout',
  'remote-action-done',
] as const

export async function runRemoteWizard(deps: RemoteWizardDeps): Promise<'done' | 'logged-out' | 'failed'> {
  let endpoint = deps.endpoint?.trim() || deps.control.snapshot().endpoint
  try {
    if (!endpoint) {
      const endpointAnswer = await deps.ask({ questions: [textQuestion('endpoint', t('remote-endpoint-question'), t('remote-endpoint-detail'))] })
      endpoint = answerText(endpointAnswer, 'endpoint')
    }
    let snapshot = await deps.control.connect(endpoint)
    if (snapshot.phase === 'login-required') {
      const credentials = await deps.ask({
        questions: [
          textQuestion('email', t('remote-email-question'), undefined, true),
          textQuestion('password', t('remote-password-question'), undefined, true),
        ],
      }, { redact: true })
      const email = answerText(credentials, 'email')
      const password = answerText(credentials, 'password')
      if (!email || !password) {
        deps.notify(t('remote-login-invalid'), { color: 'error' })
        return 'failed'
      }
      snapshot = await deps.control.login(endpoint, email, password)
    }
    deps.notify(t('remote-connected'), { color: 'success' })
    showOverview(deps, snapshot)

    while (deps.control.snapshot().phase === 'authenticated') {
      const labels = actionKeys.map(key => t(key))
      const answer = await deps.ask({
        questions: [optionQuestion('action', t('remote-action-question'), labels)],
      })
      const selected = answerSelected(answer, 'action')
      const key = actionKeys[labels.indexOf(selected)]
      if (key === undefined || key === 'remote-action-done') return 'done'
      try {
        if (key === 'remote-action-overview') showOverview(deps, deps.control.snapshot())
        else if (key === 'remote-action-session') await manageSessions(deps)
        else if (key === 'remote-action-workspace') await manageWorkspaces(deps)
        else if (key === 'remote-action-model') await manageModels(deps)
        else if (key === 'remote-action-mode') await manageModes(deps)
        else if (key === 'remote-action-local-workspace') await manageLocalWorkspace(deps)
        else if (key === 'remote-action-refresh') showOverview(deps, await deps.control.refresh())
        else if (key === 'remote-action-logout') {
          await deps.control.logout()
          deps.notify(t('remote-logged-out'), { color: 'success' })
          return 'logged-out'
        }
      } catch (error) {
        deps.notify(t('remote-operation-failed', { code: errorCode(error) }), { color: 'error', timeoutMs: 8000 })
      }
    }
    return 'done'
  } catch (error) {
    deps.notify(t('remote-operation-failed', { code: errorCode(error) }), { color: 'error', timeoutMs: 8000 })
    return 'failed'
  }
}

async function manageSessions(deps: RemoteWizardDeps): Promise<void> {
  const sessions = await deps.control.listSessions()
  const create = t('remote-session-new')
  const cancel = t('remote-session-cancel')
  const labels = [create, cancel, ...sessions.map((item, index) => `${index + 1}. ${item.title}`)]
  const selected = answerSelected(await deps.ask({
    questions: [optionQuestion('session', t('remote-session-question'), labels)],
  }), 'session')
  if (selected === create) {
    await deps.control.createSession()
    const title = answerText(await deps.ask({
      questions: [textQuestion('session-title', t('remote-session-title-question'))],
    }), 'session-title')
    if (title) await deps.control.renameActiveSession(title)
  } else if (selected === cancel) await deps.control.cancelActiveSession()
  else {
    const item = sessions[labels.indexOf(selected) - 2]
    if (item) await deps.control.selectSession(item.id)
  }
  deps.notify(t('remote-session-selected', { name: deps.control.snapshot().activeSession ?? t('remote-none') }), { color: 'success' })
}

async function manageWorkspaces(deps: RemoteWizardDeps): Promise<void> {
  const workspaces = await deps.control.listWorkspaces()
  const create = t('remote-workspace-new')
  const remove = t('remote-workspace-delete')
  const labels = [create, remove, ...workspaces.map((item, index) => `${index + 1}. ${item.title}`)]
  const selected = answerSelected(await deps.ask({
    questions: [optionQuestion('workspace', t('remote-workspace-question'), labels)],
  }), 'workspace')
  if (selected === create) {
    const titleAnswer = await deps.ask({ questions: [textQuestion('title', t('remote-workspace-title-question'))] })
    await deps.control.createWorkspace(answerText(titleAnswer, 'title'))
  } else if (selected === remove) await deps.control.deleteActiveWorkspace()
  else {
    const item = workspaces[labels.indexOf(selected) - 2]
    if (item) await deps.control.selectWorkspace(item.id)
  }
  deps.notify(t('remote-workspace-selected', { name: deps.control.snapshot().activeWorkspace ?? t('remote-none') }), { color: 'success' })
}

async function manageModels(deps: RemoteWizardDeps): Promise<void> {
  const models = await deps.control.listModels()
  if (models.length === 0) throw new Error('MODEL_UNAVAILABLE')
  const labels = models.map((item, index) => `${index + 1}. ${item.label}`)
  const selected = answerSelected(await deps.ask({
    questions: [optionQuestion('model', t('remote-model-question'), labels)],
  }), 'model')
  const model = models[labels.indexOf(selected)]
  if (!model) return
  await deps.control.selectModel(model.provider, model.model)
  deps.notify(t('remote-model-selected', { name: `${model.provider}/${model.model}` }), { color: 'success' })
}

async function manageModes(deps: RemoteWizardDeps): Promise<void> {
  const choices = [t('remote-mode-agent'), t('remote-mode-permission'), t('remote-mode-plan-on'), t('remote-mode-plan-off')]
  const selected = answerSelected(await deps.ask({
    questions: [optionQuestion('mode', t('remote-mode-question'), choices)],
  }), 'mode')
  if (selected === choices[0]) {
    const presets = await deps.control.listAgentPresets()
    const labels = presets.map((item, index) => `${index + 1}. ${item.label}`)
    const picked = answerSelected(await deps.ask({ questions: [optionQuestion('preset', t('remote-mode-agent'), labels)] }), 'preset')
    const preset = presets[labels.indexOf(picked)]
    if (preset) await deps.control.selectAgentPreset(preset.id)
  } else if (selected === choices[1]) {
    const presets = await deps.control.listPermissionPresets()
    const labels = presets.map((item, index) => `${index + 1}. ${item.label}`)
    const picked = answerSelected(await deps.ask({ questions: [optionQuestion('permission', t('remote-mode-permission'), labels)] }), 'permission')
    const preset = presets[labels.indexOf(picked)]
    if (preset) await deps.control.selectPermissionPreset(preset.value)
  } else if (selected === choices[2]) await deps.control.setPlan(true)
  else if (selected === choices[3]) await deps.control.setPlan(false)
  deps.notify(t('remote-mode-selected', { name: selected || t('remote-none') }), { color: 'success' })
}

async function manageLocalWorkspace(deps: RemoteWizardDeps): Promise<void> {
  const choices = [t('remote-local-bind'), t('remote-local-unbind')]
  const selected = answerSelected(await deps.ask({
    questions: [optionQuestion('local-action', t('remote-local-question'), choices)],
  }), 'local-action')
  if (selected === choices[1]) {
    await deps.control.unbindLocalWorkspace()
    deps.notify(t('remote-local-unbound'), { color: 'success' })
    return
  }
  const rootAnswer = await deps.ask({
    questions: [textQuestion('root', t('remote-local-path-question'))],
  }, { redact: true })
  await deps.control.bindLocalWorkspace(answerText(rootAnswer, 'root'))
  deps.notify(t('remote-local-bound', { name: deps.control.snapshot().localWorkspace?.label ?? t('remote-none') }), { color: 'success' })
}

function showOverview(deps: RemoteWizardDeps, snapshot: RemoteTuiSnapshot): void {
  const amount = snapshot.quota?.remainingUsd === undefined
    ? t('remote-none')
    : `${snapshot.quota.remainingUsd} ${snapshot.quota.currency ?? 'USD'}`
  deps.pushLocal('/connect', [
    t('remote-overview-account', { name: snapshot.user?.displayName ?? t('remote-none'), role: snapshot.user?.role ?? '-' }),
    t('remote-overview-quota', { amount }),
    t('remote-overview-counts', { models: snapshot.modelCount, sessions: snapshot.sessionCount, workspaces: snapshot.workspaceCount }),
    t('remote-overview-active', { session: snapshot.activeSession ?? t('remote-none'), workspace: snapshot.activeWorkspace ?? t('remote-none') }),
  ])
}

function optionQuestion(id: string, question: string, labels: readonly string[]): AskUserQuestionItem {
  const item: WizardQuestion = {
    id,
    question,
    header: '/connect',
    options: labels.map(label => ({ label })),
    hideCustomInput: true,
  }
  return item
}

function textQuestion(id: string, question: string, detail?: string, maskInput = false): AskUserQuestionItem {
  const item: WizardQuestion = {
    id,
    question,
    header: '/connect',
    ...(detail ? { detail } : {}),
    ...(maskInput ? { maskInput: true } : {}),
  }
  return item
}

function answerText(answer: AskUserQuestionAnswer, id: string): string {
  return answer.answers.find(item => item.id === id)?.custom?.trim() ?? ''
}

function answerSelected(answer: AskUserQuestionAnswer, id: string): string {
  return answer.answers.find(item => item.id === id)?.selected[0] ?? ''
}

function errorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && typeof (error as { code?: unknown }).code === 'string') {
    return (error as { code: string }).code
  }
  return error instanceof Error && /^[A-Z][A-Z0-9_./-]{0,96}$/u.test(error.message)
    ? error.message
    : 'REMOTE_UNAVAILABLE'
}
