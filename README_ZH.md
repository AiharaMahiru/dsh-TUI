
<p align="center">
  <img src="docs/assets/logo.svg" alt="dsh-TUI - DeepSeek Harness terminal interface" width="560">
</p>
<p align="center">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@deepseek-harness-tui/dsh-tui"><img alt="npm" src="https://img.shields.io/npm/v/@deepseek-harness-tui/dsh-tui?style=flat-square&color=4b6fff"></a>
  <a href="https://github.com/ccch1mneyyy/dsh-TUI/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ccch1mneyyy/dsh-TUI/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img alt="Public beta" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
  <a href="https://github.com/ccch1mneyyy/dsh-TUI/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/ccch1mneyyy/dsh-TUI?style=flat-square&color=4b6fff"></a>
  <a href="https://www.npmjs.com/package/@deepseek-harness-tui/dsh-tui"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@deepseek-harness-tui/dsh-tui?style=flat-square&color=4b6fff"></a>
  <img alt="官方收录" src="https://img.shields.io/badge/DeepSeek%20Harness%20官方公众号-收录-brightgreen">
</p>

# dsh-TUI

> 面向 DeepSeek Harness 的交互式终端界面插件：像素鲸鱼顶栏、实时工作状态、流式思考展示、双击 Esc 时间回溯、上下文进度条与 TPS 仪表。
> 零核心改动，纯插件挂载——安装即启用，卸载不留核心补丁。

## 功能亮点

- **像素鲸鱼娘**：开屏随机三选一动画；欢迎期可**点击冒爱心、唤醒打盹的鲸鱼**，闲置摆鳍拍尾、入睡冒 Z（`/settings → whaleIdle` 可关）；开始第一个任务后永久定格静态帧，零持续开销。22 帧手绘原图移植自 [dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale)。
- **终端原生交互**：流式 Markdown、结构化工具卡（多行命令折叠为首行 + 计数，`Ctrl+O` 或点击展开）、`/` 命令与 `@` 文件补全、`@path#L12-14` 行区间引用、历史搜索、消息选择、`/lang` 中英界面切换。
- **终端图片**：Kitty/Sixel 内嵌缩略图，点击打开大图预览（缩放 / 平移 / 多图切换 / 打开原图）；粘贴图片先按 profile 限额自动适配再入附件库；无图形能力时保留同尺寸文字回退。`/settings → 终端图片预览` 可关。
- **Mermaid 图表**：回复中的 ```` ```mermaid ```` 代码块直接画成 Unicode 字符图（flowchart / sequence / state / class / ER / pie / mindmap / timeline / gitGraph），纯进程内布局，流式输出时逐步成形；`/settings → Mermaid 图表` 可关。
- **时间轴导航**：Grok 式回合轨道覆盖全部回合（含折叠的），点击即达；右侧栏 timeline / 滚动条 / 隐藏三种模式，滚动条轨道按住即连续滚动。
- **实时状态**：工作状态动画（默认 `moon8`）、上下文进度条（悬停整条出图例、读数按占用率变色）、TPS 仪表、缓存命中率、推理强度、输入/输出 token 与 Git/会话信息；悬停截断的工具卡或会话标题出完整浮层（拖选期间一律不弹）。
- **三合一会话管理**：`/resume`、`/home`、`/agentview`、`/bg` 与输入框行首 `⌸` 打开**同一个界面**——左侧工作区栏、右侧会话列表（实时状态、筛选、行内 ★ 固定）；被其他终端占用的会话拒绝进入，本终端停放的会话一键切回，切换不中断正在跑的回合。
- **完整会话工作流**：`/new` `/compact` `/export` `/btw`、模型热切换（fork 续聊、历史保留）、会话 fork、双击 Esc 时间回溯、`/vim` 编辑模式、鼠标选区编辑、全屏草稿编辑器（`Ctrl+Shift+E`）。`/resume` 只把完整读取且确认无用户消息的日志判为空会话，仅发图片、读取不完整或解析失败不会被误清。
- **IDE 选区通道**：搭配 VS Code 扩展，编辑器选中代码后 prompt 下方实时显示 `⧉ N lines selected` 徽标，提交自动附加选中行；手动启动（tmux/SSH）经 lock 自动发现本机 IDE，无 IDE 静默降级。详见 [vscode.md](docs/vscode.md)。
- **官方集成**：agent presets、技能、MCP、目标/待办、子代理、问卷全部走 DSH 既有服务与注册表；`/skills` 展示发现的技能，dsh-TUI 不预装通用技能。
- **扩展丰富**：原生浏览器交互、computer use 等大量附属功能性扩展。
- **为长会话设计**：事件驱动投影、增量渲染、消息虚拟化、零分配热路径与有界缓存；长会话恢复跳过开屏动画，直接落位到最新消息。

## 界面预览

<div align="center">
  <table>
    <tr>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/splash.png" alt="首屏：像素鲸鱼顶栏" width="480">
        <br>
        <strong>首屏：像素鲸鱼顶栏</strong>
      </td>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/ide-selection-badge.png" alt="IDE 选区徽标：编辑器选中代码后 prompt 下方实时显示行数" width="480">
        <br>
        <strong>IDE 选区实时徽标</strong>
      </td>
    </tr>
  </table>
</div>

## 官方收录

本插件被 **DeepSeek Harness 官方公众号**推文收录，也被 [dshfind](https://dshfind.com/ccch1mneyyy/dsh-TUI) 插件目录收录，并登上 [GitHub Trending](https://trendshift.io/repositories/146168) 日榜第七（TypeScript 口径）。

<div align="center">
  <table>
    <tr>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/wechat-official.png" alt="DeepSeek Harness 官方公众号推文收录 dsh-TUI" width="480">
        <br>
        <strong>DeepSeek Harness 官方公众号推文收录</strong>
      </td>
      <td align="center" valign="middle" width="50%">
        <a href="https://dshfind.com/ccch1mneyyy/dsh-TUI"><img src="https://dshfind.com/api/card/ccch1mneyyy/dsh-TUI?lang=zh" alt="dsh-TUI on dshfind" width="420"></a>
        <br>
        <strong>dshfind 插件目录收录</strong>
        <br><br>
        <a href="https://trendshift.io/repositories/146168" title="GitHub Trending 日榜 #7 · TypeScript 口径"><img alt="Trendshift" src="https://trendshift.io/api/badge/trendshift/repositories/146168/daily?language=TypeScript"></a>
         <br>
        <strong>GitHub Trending 日榜第七</strong>
      </td>
    </tr>
  </table>
</div>

## 快速开始

前置条件：安装 [Node.js](https://nodejs.org/zh-cn) 与 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，并配置 `DEEPSEEK_API_KEY`。

```sh
# 安装（全局，自带 dsh-tui 命令）
npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui

# 启动（首次运行自动初始化 profile，需要 pnpm）
dsh-tui
# 不想按七次键盘？用短别名
dst
```

手动安装可用仓库根目录的 `install.sh`（或 `dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui`），之后 `dsh-tui` 与 `dsh --profile dsh-tui` 等价。

> **新用户提示**：pnpm ≥11 默认拦截带安装脚本的依赖（报 `ERR_PNPM_IGNORED_BUILDS`），更新时还会忽略异平台的 `@img/sharp-*` 原生包（省约 200MB 下载）——`/update` 与 `dsh-tui update` 都会自动写好这两份配置，无需手工处理。细节见[安装与快速开始](docs/getting-started.md#pnpm-安装脚本拦截与异平台原生包)。

TUI 启动后会在后台检查新版本（不阻塞首帧）；有更新时输入 `/update` 一键升级、自动重启并恢复当前会话。零基础上手、profile 叠加机制、源码构建与常见问题见[安装与快速开始](docs/getting-started.md)。

### CLI 子命令

`dsh-tui help`（或 `dst help`）打印完整用法，`dst` 别名接受相同命令：

| 命令 | 作用 |
| --- | --- |
| `dsh-tui update` | 更新 profile 到最新版本并对齐启动器（与 TUI 内 `/update` 同一安装逻辑，不进入 TUI） |
| `dsh-tui doctor` | 环境体检：dsh/pnpm、profile 安装与版本对齐、API key 是否设置（只报状态不读值）、配置文件存在性；与 TUI 内 `/doctor` 会话诊断互补 |
| `dsh-tui safe` | 安全模式：只读诊断、插件清单与修复指引（`safe --rescue` 还会创建/校验干净的救援 profile） |
| `dsh-tui version` | 显示启动器与 profile 版本（`--version`/`-v` 等价） |
| `dsh-tui help` | 显示用法（`--help`/`-h` 等价） |

`help`/`version` 在 dsh 缺失或 profile 未初始化时也能用；其余参数原样转发给 `dsh --profile dsh-tui`。

### 安全模式（`dsh-tui safe`）

dsh 意外结束时，安全模式提供**只读**的环境诊断、profile 插件清单与修复指引：交互终端下 dsh 非零退出后会询问进入，也可手动 `dsh-tui safe`；救援 profile 的干净性逐条校验、证不出就拒绝启动（fail-closed），重建前按名字与形态核对条目，绝不静默删你的文件。完整边界与门禁清单见[安全模式](docs/getting-started.md#安全模式dsh-tui-safe)。

### 在 VS Code / Herdr 中运行

- **VS Code**：可在集成终端直接运行，或用已上架 Marketplace 的 companion 扩展 `dsh-tui-vscode`（真实终端会话、会话历史、指定会话恢复、IDE 选区通道）。见 [VS Code 使用指南](docs/vscode.md)。
- **Herdr**：直接在 [Herdr](https://herdr.dev) 窗格中运行 `dsh-tui`，无需额外配置；dsh-TUI 经 Herdr 本地集成 API 报告 `idle` / `working` / `blocked`（问卷与工具审批记为 `blocked`），Herdr 之外完全惰性。

## 快捷键与鼠标

| 按键 | 作用 |
| --- | --- |
| `Enter` | 空闲 = 发送（`Shift+Enter` 换行；终端报不出修饰 Enter 时用 `Ctrl+J`；macOS Terminal.app 用 `Option+Enter`，见 issue #110）；**模型工作时 = steer**（注入下一步边界，不打断）；命令菜单打开时执行选中项 |
| `Ctrl+Enter`（⌘Enter） | **打断当前回合并立即发送**（interrupt） |
| `Alt+Up` | 把最近一条未处理的消息拉回输入框编辑（不打断回合） |
| `PgUp` / `PgDn` | 全屏 transcript 翻页（一次一屏减一行；Help 与分页浮层翻自己的列表；问卷面板让给 transcript）；inline 模式留给终端原生滚动 |
| `Tab` | 补全 `/` 命令或 `@` 文件（可持续下钻目录）；**模型工作时 = follow-up**（排队到当前回合之后） |
| `Ctrl+C` | 打断当前回合；打断落定中再按强制退出；空闲连按两次退出；**输入框有鼠标选区时 = 复制选区并保留** |
| `Esc` | 关闭图片预览；关闭命令/文件菜单；**输入框有选区时仅清除选区**；空闲双击清空输入；**空输入双击 = 时间回溯** |
| `←`（空输入） | **把当前会话挂到后台并打开 agent view**（有文字时 ← 正常移动光标） |
| `Ctrl+O` | 展开/折叠详情（完整思考、工具参数与输出） |
| `Ctrl+Shift+E` | 展开全屏草稿编辑器（Enter 换行、`Ctrl+Enter` 发送、`Esc` 收起保留草稿；行号、滚轮、点击/拖选） |
| `Ctrl+R` | 历史搜索 |
| `/` | 会话内全文搜索（`n`/`N` 跳转） |
| `Ctrl+V` / `Alt+V` | 粘贴文本或文件管理器中的文件；图片显示为 `[Image #N]` 并作为持久附件发送。终端拦截 `Ctrl+V` 时用 `Alt+V` |
| `Ctrl+G` | 用 `$VISUAL`/`$EDITOR`（如 nvim）编辑当前输入，保存退出后回填 |
| `/vim` | 输入框 vim 模式开关（会话级）：`Esc` 进 NORMAL（`h/l/j/k`、`0/^/$`、`w/b`、`x/X`、`dd`/`d$`/`d0`/`dw`、`u` 撤销），`i/a/o` 回 INSERT |
| `?` | 快捷键菜单（仅输入为空时响应） |
| `Shift+↑` | 消息选择模式（`Enter` 展开单条消息） |
| `Ctrl+P` | 启动已加载上下文面板在屏时切换显隐（`/resume` 里的旧 pin 快捷键已移除，点会话行的 ★ 固定） |
| `Home` / `End`、`Ctrl+A` / `Ctrl+E` | `Ctrl+A` 打开子代理面板（编辑器内 `Mod+A` 仍是行首）；`Ctrl+E` 双用途：输入框行尾 / 转录中展开折叠的旧消息 |
| `Ctrl+←` / `Ctrl+→`（⌘←/→） | 按词跳转 |
| `←` / `→`（图片弹窗） | 上一张 / 下一张；光标 peek 不影响输入编辑 |
| `Ctrl+U` / `Ctrl+K` | 删到行首 / 删到行尾 |
| `Ctrl+W` | 删除前一个词 |

**模型工作时的三种投递**：`Enter` = steer（注入下一步边界，不打断）· `Tab` = follow-up（排队）· `Ctrl+Enter` = interrupt（打断并立即发送）。

**自定义快捷键**：上述动作的快捷键（粘贴、历史搜索、外部编辑器、transcript 展开、trajectory、子代理面板、已加载上下文面板、show-all、重绘、todo 折叠）可在 `/settings → dsh-tui → Shortcuts` 重映射：输入 `alt+v`、`ctrl+shift+v` 这样的组合，逗号分隔多个，留空恢复默认；保存即生效无需重启。与固定编辑键（`Ctrl+A/E/U/K/W`、`Ctrl+←/→`）或其他动作冲突的组合会被拒绝。部署方也可在 cordis.yml 用 `shortcuts.<action>` 静态钉死（settings 用户层优先）。

**macOS 修饰键**：上述 `Ctrl+<key>` 在 macOS 上也可用 `⌘<key>`（如 `⌘V` 粘贴、`⌘O` 展开详情、`⌘Enter` 立即发送）；只有 `Ctrl+C`/`Ctrl+D`（打断/退出）保持 Ctrl，避免与 macOS 系统级 `⌘C` 复制的肌肉记忆冲突。`⌘` 需要终端支持扩展键盘协议（iTerm2 / kitty / WezTerm / ghostty / tmux）；macOS 自带 Terminal.app 会自己吃掉 `⌘` 快捷键，继续用 `Ctrl` 即可。

**鼠标**（0.9.0 起全屏是出厂默认；`fullscreen: false` 恢复 inline 主屏；从旧版更新会清除一次已保存的 inline 选择——之后仍可再选 inline）：

| 操作 | 功能 |
| --- | --- |
| 拖选 | 应用内文本选择，**松开即复制**（OSC 52，原生 `wl-copy`/`xclip`/`xsel` 兜底；tmux 内 `load-buffer -w`）；复制后清除选区并弹出「已复制 N 字符」提示 |
| 双击 / 三击 | 选词 / 选行，同样选中即复制 |
| 输入框内拖选 | 建立输入内选区（高亮渲染）：`Backspace`/`Delete` 删除、输入替换、`←/→` 收拢到对应边缘、`Esc` 仅清除；折叠的粘贴块点击哪侧选区留在哪侧 |
| 输入框内 `Shift+click` | 从选区起始边（或光标）扩展到点击位置 |
| 输入框内双击词 | 选中整词（路径与标点串作为一体；组件内检测，500ms / 1 格） |
| 输入框有选区时 `Ctrl+C` | 复制选区到剪贴板（OSC 52 + 原生兜底）并保留以便编辑 |
| 滚轮 | 仅全屏鼠标跟踪下：Help 打开时滚 Help，否则滚消息（每格 ±3 行）；默认 inline 模式不把滚轮事件交给 TUI |
| 点击时间轴刻度 | 跳到该回合——轨道覆盖全部回合（含折叠的）；折叠刻度先展开该回合再滚到位 |
| `Esc` | 取消进行中的拖选（不复制） |
| 单击消息行 | 展开/折叠该行 |
| 点击 `[Image #N]` / transcript 缩略图 | 打开居中图片预览（无 Kitty/Sixel 时为元数据回退）；点击预览外部关闭 |
| 点击「加载更早消息」/「ctrl+e 显示前 N 条」 | 加载更早消息 / 全部展开 |
| 点击 StickyHeader /「↓ N 条新消息」 | 跳回钉住的消息 / 回到底部 |
| 点击超链接 | 在浏览器中打开 |
| 键盘扩展选区 | 有选区时 `Shift+←/→/↑/↓/Home/End` 扩展或收缩（跨行回绕） |

**问卷**（模型触发 `ask_user_question` 时）：

| 按键 | 作用 |
| --- | --- |
| `↑/↓` | 选择选项 |
| `Space` | 切换多选 |
| `Tab` | 切到自定义回答（不选选项直接输入） |
| `Enter` | 提交当前选择 |
| `Esc`（第 2 题起） | 返回上一题并保留当前草稿 |
| `Esc`（第 1 题）/ `Ctrl+C` | 取消整批问卷（模型收到 ASK_CANCELLED，可继续对话） |
| `Ctrl+K` | 折叠/展开问卷面板（ask 继续等待；折叠时 `Esc`/`Ctrl+C` 先展开） |

## 内置命令与 Agent View

**内置命令**（走官方 DSH 管线）：

| 分组 | 命令 |
| --- | --- |
| 会话 | `/new` 新会话 · `/resume`、`/home`、`/agentview` 打开同一个会话管理界面（工作区栏 + 该工作区会话、实时状态、筛选、行内 ★ 固定）· `/bg`（别名 `/background`）挂后台并打开该界面 · `/rename` 重命名 · `/recap` 会话回顾（一键采纳建议标题；`/settings` 可开会话打开时自动摘要——默认开：恢复时 transcript 底部出现分隔线 + `Recap:` 行，发新消息后退场）· `/workspace resume\|rename\|open` 管理工作区 · `/clear` 清屏 · `/compact` 压缩 · `/export` 导出 Markdown · `/trace` 轨迹时间线（或 `Ctrl+T`）· `/rewind` 回溯选择器（同空输入双击 `Esc`）· `/tree` 会话家族树（所有 fork 分支缝合；悬停预览节点，点击出回溯/从此 fork/收养分支菜单）· `/fork` 复制当前会话为可恢复的双胞胎（原会话不动）· `/btw <问题>` 旁路提问（绝不打断主回合、不写历史） |
| 状态 | `/context` 已加载上下文详情 · `/status` 会话信息 · `/cost` token 用量 · `/doctor` 环境自检 · `/config` 配置来源 · `/init` 创建 AGENTS.md · `/settings` 设置面板（命名空间读/改） |
| 模型 | `/model` 两级选择器（**最近使用**组钉在最前——最近 10 个切换过的模型，持久化到 `~/.dsh-tui/model-recents.json`——然后是 provider 分组；Enter 下钻组内模型；单 provider 且无最近记录时直接进列表；**切换 = fork 续聊，历史保留**）· `/effort` 推理强度（滑杆 / `status` / `<id>`；新会话默认档在 `/settings → 默认推理强度` 设置；请求的档位不可用时落到最近可用低档并明确提示）· `/preset` agent 预设（**会话开始后不可切换**——仅空白会话）· `/thinking` 思考展示 · `/tokens` token 详情 · `/activity` 工作动画（`frames <名称>` / `status`）· `/theme` 主题选择器 · `/color`（裸命令开调色板；`<名称>` 直接设；`status`/`reset`）会话强调色（输入框边框 + 右上角会话名 chip，按会话；chip 默认关，`/settings` 开）· `/lang` 中英界面切换（也可在 `/settings` 选） |
| 账户/策略 | `/provider` 管理模型 provider——新增或经菜单编辑（API key · 模型列表 · 删除；自定义端点另有 base URL · wire 协议；定向编辑只补丁该字段，profile 其余原样；模型列表预勾已启用的；仅用户层 provider 可编辑）（含捆绑 dsh-auth 的**订阅 OAuth 登录**分支——ChatGPT / Claude / Grok，无需 API key；与 `/auth status\|login\|logout` 同源）· `/login` 凭证与账户状态 · `/logout` 登出说明 · `/permission` 动态预设/状态说明 · `/add-dir` 文件策略范围 · `/hooks` · `/mcp` |
| 技能 | `/skills` 列出 DSH 发现的技能；用户可调用的技能以 `/name` 进入 `/` 菜单 |
| 其他 | `/agents` 子代理列表 · `/plugins check <路径>` 插件诊断 · `/update` 自动更新并重启 · `/vim` vim 模式开关 · `/terminal-setup` · `/connect` · `/help` · `/exit`（别名 `/quit` `/q`） |
| 注册表 | `/plan` `/goal` `/feedback` `/permission`（DSH 命令注册表插件，随插件自动并入 `/` 菜单） |

> 未知命令会作为普通消息发给模型（例如 `/permission` 未挂载的组合里）。

**Agent view**（`/agentview`）：

一个全屏界面列出本进程的所有会话：当前附加的对话、在此派发的后台会话、磁盘上已停止的 TUI 会话。头部显示 `模型 · 目录` 与状态计数（待输入 · 工作中 · 已完成）；行按状态分组（待输入 > 工作中 > 失败 > 已完成 > 空闲 > 已停止），工作中的行有动画字形。每行带一行活动摘要（来自会话自身输出，无额外模型调用）；等待输入的行显示它卡在的问题上。**只有本 TUI 派发、挂后台或从该界面附加的会话才会列出**——普通 `/resume` 历史与其他前门（如 web）创建的会话不会出现。

| 按键 | 作用 |
| --- | --- |
| `↑/↓`、`PgUp/PgDn` | 行间移动 |
| `Enter` / `→` | 附加到选中会话（有输入文字时：派发它） |
| `Shift+Enter` | 立即派发并附加 |
| `Space` | 切换 peek 面板（输入为空时）；在里面输入回复、`Enter` 发送 |
| `Ctrl+X` | 停止后台会话；2 秒内再按删除它（日志移除） |
| `Ctrl+R` | 重命名选中会话 |
| `Esc` | 关 peek → 清输入 → 退出；**经 ← `/bg` 打开时，最后一下 Esc 返回被挂起的会话** |
| `Ctrl+C` | 清输入；再按退出 |
| `?` | 显示全部快捷键 |

- 在底部输入框输入任务按 `Enter` 派发**后台会话**：它在本进程内独立运行（回合、工具、审批都可用），无需你盯着。
- **空输入按 `←`** 直接进入该界面：当前会话移入后台继续跑，终端落到新会话并打开界面（同 `/bg`），顶部有「你的对话已移入后台——Enter 打开 · Esc 返回 · Ctrl+C 两次退出」提示。有后台会话等你时，prompt 底栏常驻「← N agents」计数。
- 需要审批的后台会话显示为**待输入**；审批面板直接在界面里弹出并作答（标注所属会话）。
- `/bg`（别名 `/background`）把当前会话移入后台继续跑，切到新会话并打开界面；任意行 `Enter` 切回。
- peek 与回复对运行中的会话实时可用；已停止的会话需先 `Enter` 附加才能对话。
- **后台会话活在本进程内**：TUI 退出即停止（日志保留；`/resume` 或界面里 `Enter` 找回）。没有 supervisor 进程。

## 配置与扩展

- **Agent 预设**：四个官方模式（`standard` / `ptc` / `minimal` / `cordis`）加 TUI 自带的两神模式（`liangshen`），`/preset` 切换；已有对话的会话不可切换，空白会话立即生效。默认预设持久化在 `~/.dsh-tui/agent-preset.json`；`/model` 选择持久化在 `~/.dsh-tui/model.json`。`en` 界面语言下 `/preset` 选择器显示内置预设的英文名与描述。见[配置参考](docs/configuration.md#agent-preset)。
- **主题**：`/theme` 选择器（`auto` 跟随系统/终端背景，内置 `light` / `dark` / `dark-ansi`）接受 `~/.dsh-tui/themes/<名称>.json` 静态主题与 npm 插件经 `ctx.tuiThemes` 注册的运行时主题——选中即热切换并持久化；优先级 `DSH_TUI_THEME` 环境变量 > 持久化选择 > OSC 11 终端背景自动检测。见[主题系统](docs/themes.md)。
- **MCP**：经 `@deepseek-ai/dsh-mcp-client` 挂载服务器，工具注册为 `mcp__<服务器>__<工具>`；`/mcp` 显示连接状态。见[配置参考](docs/configuration.md#mcp)。

## 工作原理与技术要点

```text
dsh profile
  -> dsh-base
  -> dsh-TUI Cordis patch
  -> agent preset + DSH services
  -> session/event
  -> Channel projection
  -> React components
  -> Ink/Yoga renderer
  -> terminal
```

TUI 只拥有交互与呈现。会话日志仍是对话的唯一事实源，模型调用、工具执行、fork/恢复、压缩与持久化仍归 DSH 服务。模块边界与性能细节见[架构与限制](docs/architecture.md)。

```text
chat / tool base events ──> persisted Session log ──> TUI / Web
          └───────────────> ActivityTracker (memory) ──> TUI status only
```

- **雾蓝色调**：雾蓝只承载品牌、焦点、交互与高亮，正文保持中性灰；启动时查询终端背景色（OSC 11）自动选亮/暗调色板，无响应回退暗色。
- **事件驱动渲染**：`session/event` 流驱动增量差异渲染，滚动状态独立维护。
- **布局级虚拟化**：长会话单帧成本从 O（整个会话）降到 O（可见窗口）——屏外消息行只渲染高度占位，子树不参与布局。
- **零分配热路径**：visibleRows 管线按 rows 身份、长度与流式位指纹记忆化，每个滚动 tick 零数组/Map 分配；wrapText 与 markdown token 走全局 LRU 缓存跨挂载复用。
- **分帧回填与落位锚点**：主屏先挂尾部窗口再分帧回填历史；`/resume` 保证最新消息最后一行可见可达，长会话恢复跳过开屏动画直落内容。
- **上下文进度条**：基于 pi-nano-context 算法（最大余数分段着色 + 多级紧凑读数）。
- **TPS 仪表**：基于 pi-tps-meter——流式 1/8 块仪表、历史 min-max 火花线、按速度语义着色（≥50 绿 / ≥20 黄 / <20 红）。
- **working-activity 生态**：工作状态行复用 [dsh-working-activity](https://github.com/ccch1mneyyy/working-activity) 的纯状态机，进程内从基础会话事件推导，不把 UI 状态写进共享日志。
- **终端粘贴**：raw 模式下 `Ctrl+V` 由应用处理、按平台读系统剪贴板——Windows 走 PowerShell `Get-Clipboard`，macOS 走 `osascript`/`pbpaste`，Linux 自动探测 `wl-paste`/`xclip`/`xsel`；普通文件插入路径，图片文件与剪贴板位图写入附件库显示为 `[Image #N]`，纯文本插入光标处。

## 已知限制

- 注入的上下文（插件来源内容）无独立展示，与 system prompt 一起并入进度条统计。
- `/model` 热切换通过「会话 fork 续聊」实现（DSH 无原地换模型 API）：历史原样保留，新会话走新模型，旧会话留在 `/resume` 列表；选择写入 `~/.dsh-tui/model.json`，重启与 `/new` 后仍生效。
- `Ctrl+V` 剪贴板读取依赖各平台外部工具：Windows 用 PowerShell `Get-Clipboard`（剪贴板被短暂占用时自动重试，持续占用则静默放弃）；macOS 用 `osascript`/`pbpaste`（Finder 多文件复制无稳定 AppleScript 读取路径，回退文本/图片）；Linux 需要 `wl-paste`/`xclip`/`xsel` 之一且会话可连接（缺工具或会话不可达时提示「无可用剪贴板工具」）。不支持的剪贴板位图格式带警告拒绝并删除其私有临时导出；附件服务不可用时位图不进入草稿。复制的图片文件在直接暂存失败时仍可回退为 `@` 引用。
- 退出以进程退出收尾，不等待 agent 的异步落盘（持久化由持久化插件兜底）。
- **Agent view 后台会话活在本进程内**：TUI 退出全部停止（supervisor 进程与跨重启存活不在 v1 范围）；行摘要来自会话自身输出、无额外摘要模型调用；worktree 隔离、固定、目录分组与 shell 后台任务尚未提供。
- 工具级审批已实现：审批服务 + TUI 应答器（本地审批面板）消费审批流，提权命令弹审批条。`/permission` 预设切换来自 dsh-base 的 `permission-presets` 插件，默认在组合中可用；registry 服务缺失时用 legacy 三项兼容名册，挂载但不可用的服务标 unavailable 并 fail closed。外部 `/permission` 命令未注册时，输入保持既有默认/模型派发行为。
- `/connect` `/hooks` 是保留占位：对应能力在 DSH 侧没有等价机制，命令给出明确说明而非沉默。
- `/thinking` 展示开关**不持久化**；重启与新会话回到默认。
- `/compact` 在 `minimal` 预设下不可用（该预设不组合压缩）。
- `/update` 仅在经 `dsh --profile` 启动时可用，回合运行中会被拒绝。

完整清单与安全边界见[架构与限制](docs/architecture.md)。

## 开发

CI 使用 Node 24 与 pnpm 11，本包支持 Node `^22.19 || >=24`。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm smoke
```

`lib/types/` 是被忽略的生成物，`pnpm build` 从干净输出目录重编译并跑构建门禁。**不支持 Git URL 安装**（源码 manifest 把 `@dsh-std/*` 保留为 workspace 依赖、`vendor/dsh-std` 是子模块，且 pnpm ≥11 默认拒绝 git 托管的 `prepare` 脚本）；请安装 registry 包：`dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui`。渲染、问卷或工具卡改动还需对应的回归脚本。

## 插件生态与开发指南

想为 dsh-TUI 做插件/扩展？欢迎加入生态！

- **接口与兼容性协定 / 插件开发指南**：[终端交互生态插件准入与开发指南](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md)（准入规范、接缝、契约、验证清单）
- **生态组织**：[dsh-tui-ecosystem](https://github.com/dsh-tui-ecosystem)（社区插件与模板的家）
- **模板仓库**：[plugin-template](https://github.com/dsh-tui-ecosystem/plugin-template)（从模板起步，5 分钟出一个插件）
- **参考实现**：`dsh-working-activity`（实时工作状态行：TUI 槽位 + `activity/status` 会话事件双出口）

### 接缝稳定性参考

按当前实现成熟度给出的**非正式**分级，帮助插件作者评估投入；正式状态与兼容性协定以
[准入与开发指南](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md)为准：

| 分级 | 接缝 |
| --- | --- |
| 稳定候选（形态冻结；如有破坏性变更，先在次版本弃用告警再移除） | 六 设置区块 · 八 全屏场景 · 十 托管对话框 · 十一 状态行 · 十二 键盘快捷键 · 十三 条目渲染器 |
| 实验性（仍可能随 dsh-std / 准入规范演进调整） | 九 决策事件 · toast 通知（`ctx.tuiToast`，新增） |
| 跟随上游（稳定性由 cordis / dsh 官方机制决定） | 一 会话事件 · 二 官方 prompt 槽位 · 三 技能打包 · 四 主题 · 五 system prompt 段 · 七 profile 组合 |

另：`@deepseek-harness-tui/dsh-tui/api`（纯类型入口）为实验性公开面；
`@deepseek-harness-tui/dsh-tui/test-utils` 子路径与 `ctx.tuiPluginHost.grants.corrupt`
已随 adapter 分层重构（#705）移除，`grants` 收窄为 `HostGrantFacade`，迁移细节见该 PR。

## 文档索引

| 主题 | 内容 |
| --- | --- |
| [安装与快速开始](docs/getting-started.md) | 前置条件、安装、启动、安全模式、profile 生命周期、源码开发 |
| [配置参考](docs/configuration.md) | Cordis 覆盖、配置字段、Agent preset、MCP、环境变量 |
| [主题系统](docs/themes.md) | 内置主题、自动检测、静态 JSON 与 npm 插件主题、校验规则 |
| [交互与命令](docs/interaction.md) | 快捷键、鼠标、问卷、slash command 与会话工作流 |
| [架构与限制](docs/architecture.md) | 运行链路、渲染与持久化设计、安全边界、已知限制 |
| [社区管理框架](docs/community-management.md) | 社区入口、角色、提案流程、roadmap 规则与维护节奏 |
| [项目路线图](docs/roadmap.md) | 公开目标、阶段、任务状态、退出条件与 Future Work |
| [VS Code 使用指南](docs/vscode.md) | 在 VS Code 集成终端运行 dsh-tui；companion 扩展 `dsh-tui-vscode` 提供多会话、会话历史与指定会话恢复（已上架 Marketplace） |
| [贡献与开发约定](docs/contributing.md) | 贡献流程、仓库地图、构建产物、验证矩阵与修改规则 |
| [插件准入与开发指南](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md) | 接口与兼容性协定 / 插件准入规范 / 插件接缝 / 契约 / 验证清单（已并入 dsh-ecosystem-spec） |

完整的中英文索引见 [`docs/README.md`](docs/README.md)。

## 社区

- **生态组织**：[dsh-tui-ecosystem](https://github.com/dsh-tui-ecosystem) —— 社区插件、模板与收录列表的家。欢迎来发插件、提创意、互相取暖 🐋
- **社区交流群**：使用问题、插件创意、功能许愿，都欢迎进来聊。
- **行为准则**：参与前请读一遍[贡献者行为准则](CODE_OF_CONDUCT.md)。

| 微信群（dsh-TUI 社区交流 4 群） | QQ 群（群号 572549239） |
| :---: | :---: |
| <img src="screenshots/wechat-group.jpg" alt="dsh-TUI 社区交流 4 群微信群二维码" width="200"> | <img src="screenshots/qq-group.png" alt="dsh-TUI 社区交流群 QQ 群二维码" width="200"> |

> 微信群二维码约 7 天过期一次，如遇失效请走 QQ 群（572549239），或开个 issue 提醒我们更新。

## 权限与安全边界

> **Windows 安全警告：** Windows profile 默认使用 `danger-full-access`，且 approval 默认是 `never`。这会授予工具不受限制的访问权限；在敏感凭证或不可信仓库环境中启动前，务必先检查并收紧 profile 配置。

`dsh-TUI` 不实现独立沙箱，而是使用当前 DSH profile 的文件、Shell、sandbox 与 approval 策略。权限预设来自 DSH `permissionPresets` registry（服务缺失时用 legacy 三项兼容名册；挂载但不可用时标记 unavailable 并 fail closed，不伪造名册），第三方预设自动进入补全、picker 与 `Shift+Tab` 循环。`/permission` 常驻菜单：切换优先走官方 `/permission <preset>` 命令，未暴露时回退到 registry 服务自身的官方写路径（真实事件，绝不伪造），两条路都不可用时显式提示，绝不静默。退出计划模式先恢复进入前的 atom，再把权限身份还原到进入前的预设。

详见[权限边界与已知限制](docs/architecture.md#权限与安全边界)。

## 致谢

- 像素鲸鱼娘的 22 帧手绘原图（Excel 逐格绘制）与闲置动画行为（摆鱼鳍、拍尾巴、入睡冒 Z、点击冒爱心）移植自 **[dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale)**（DeepSeek Harness Web 端鲸鱼宠物插件，作者 [@lhh010](https://github.com/lhh010)，BSD-3-Clause），感谢作者与灵感 🐋💜

## 友情链接

朋友们开发的[社区、相关项目与周边工具](docs/links.md)

## Stars

<!-- star-history:start -->
[![Star History](https://raw.githubusercontent.com/ccch1mneyyy/dsh-TUI/bot-star-history/assets/star-history/star-history.png)](https://star-history.com/#ccch1mneyyy/dsh-TUI&Date)
<!-- star-history:end -->

## License

[MIT](LICENSE)
