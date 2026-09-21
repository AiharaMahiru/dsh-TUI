
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

| 命令 | 作用 |
| --- | --- |
| `dsh-tui` / `dst` | 启动 TUI（短别名是同一个程序） |
| `dsh-tui --resume [id]` · `dsh-tui update` · `dsh-tui doctor` | 恢复会话 · 更新 profile 并对齐启动器 · 环境体检 |
| `dsh-tui safe` | 只读诊断、插件清单与修复指引；`safe --rescue` 创建干净的救援 profile |
| `dsh-tui version` · `dsh-tui help` | 启动器与 profile 版本、用法——没装 dsh 时这两条也能用 |

其余参数原样转发给 `dsh --profile dsh-tui`。安全模式的完整边界与门禁清单见[安装与快速开始](docs/getting-started.md)。

**VS Code**：集成终端直接运行，或用 companion 扩展 `dsh-tui-vscode`（多会话、会话历史、指定会话恢复、IDE 选区通道）——见 [VS Code 使用指南](docs/vscode.md)。**Herdr**：在 [Herdr](https://herdr.dev) 窗格直接运行 `dsh-tui`，无需配置；它经 Herdr 本地集成 API 报告 `idle` / `working` / `blocked`（问卷与工具审批记为 `blocked`），Herdr 之外完全惰性。

## 快捷键与鼠标

`Enter` 发送 · `Tab` 补全 `/` 与 `@` · `Ctrl+Enter` 打断并发送 · `Alt+Up` 取回上一条消息 · `Esc` 逐层关闭（空输入双击 = 时间回溯）· `Ctrl+O` 展开详情 · `Ctrl+R` 搜历史 · `Ctrl+V` 粘贴（图片变 `[Image #N]` 附件）· `Ctrl+Shift+E` 全屏草稿编辑器 · `?` 全部快捷键 · 空输入按 `←` 转后台并打开会话管理界面。

模型工作时：`Enter` 加塞、`Tab` 排队、`Ctrl+Enter` 打断并立即发送。

鼠标（全屏为出厂默认）：拖选**松开即复制**、双击/三击选词选行、点工具卡折叠、点时间轴刻度跳回合、点 `[Image #N]` 开大图预览。

全部键位、鼠标与问卷表、大图弹窗、macOS `⌘` 支持与 `/settings → Shortcuts` 重映射：见[交互与命令](docs/interaction.md)。

## 内置命令

`/resume`（同 `/home`、`/agentview`、`/bg`，或输入框行首 `⌸`）打开唯一的会话管理界面：工作区栏、该工作区会话、实时状态、筛选、★ 固定。`/model` 切换 = fork 续聊。常用的还有 `/new` `/compact` `/export` `/btw` `/tree` `/fork` `/rewind` `/settings` `/status` `/cost` `/jobs` `/skills` `/mcp` `/login` `/update`。

**后台会话**：`/bg`（或空输入按 `←`）把当前会话移入后台——继续跑——并打开该界面；按 `Esc` 回到它。后台会话跑在本进程内（回合、工具、审批照常），TUI 退出即停止，日志保留。

完整命令表、参数与注册表命令见[交互与命令](docs/interaction.md)。

## 配置与扩展

Agent 预设（`standard` / `ptc` / `minimal` / `cordis`，外加自带的 `liangshen`）、主题（内置、`~/.dsh-tui/themes/*.json`、npm 插件主题）、MCP 服务器与全部环境变量：见[配置参考](docs/configuration.md)与[主题系统](docs/themes.md)。

## 工作原理

```text
dsh profile → dsh-base → dsh-TUI Cordis patch → agent preset + DSH services
  → session/event → Channel projection → React components → Ink/Yoga renderer → terminal
```

TUI 只负责交互与呈现：会话日志是唯一事实源，模型调用、工具执行、fork/恢复、压缩与持久化都归 DSH 服务。渲染由事件驱动并在布局层虚拟化，长会话单帧成本是 O（可见窗口）；调色板跟随终端背景（OSC 11）。

运行链路、模块边界、性能要点与持久化位置见[架构与限制](docs/architecture.md)。

## 已知限制

- 注入的插件上下文没有独立展示，计入上下文分段。
- `/model` 靠 fork 会话切换（DSH 无原地换模型 API）：历史保留，旧会话留在 `/resume`。
- `Ctrl+V` 依赖各平台剪贴板工具；不支持的位图格式带警告拒绝。
- 后台会话活在本进程内，TUI 退出即停止。
- `/thinking` 不持久化；`/compact` 在 `minimal` 预设下不可用；`/update` 需 `dsh --profile` 启动，回合运行中会被拒绝。

完整清单见[架构与限制](docs/architecture.md)。

## 开发

CI 使用 Node 24 与 pnpm 11，本包支持 Node `^22.19 || >=24`。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm smoke
```

`lib/types/` 是被忽略的生成物，`pnpm build` 从干净输出目录重编译并跑构建门禁。**不支持 Git URL 安装**（源码 manifest 把 `@dsh-std/*` 保留为 workspace 依赖、`vendor/dsh-std` 是子模块，且 pnpm ≥11 默认拒绝 git 托管的 `prepare` 脚本）；请安装 registry 包：`dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui`。渲染、问卷或工具卡改动还需对应的回归脚本。

## 插件生态

想做插件？先看[准入与开发指南](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md)（接缝、契约、验证清单）、[plugin-template](https://github.com/dsh-tui-ecosystem/plugin-template) 模板与 [dsh-tui-ecosystem](https://github.com/dsh-tui-ecosystem) 组织；参考实现是 `dsh-working-activity`。

接缝稳定性分级、纯类型入口 `@deepseek-harness-tui/dsh-tui/api` 与迁移说明见[插件开发](docs/plugins.md)。生态组织只维护收录与准入规则，不背书社区插件的功能与安全。

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

> **Windows 安全警告：** Windows profile 默认 `danger-full-access`、approval 默认 `never`，工具访问不受限制。在敏感凭证或不可信仓库旁启动前，先检查并收紧 profile。

`dsh-TUI` 不自带沙箱，用的是当前 DSH profile 的文件、Shell、sandbox 与 approval 策略。权限预设来自 DSH `permissionPresets` registry（服务缺失回退 legacy 三项名册；挂载但不可用则标 unavailable 并 fail closed），第三方预设自动进入补全、picker 与 `Shift+Tab` 循环。

详见[权限边界](docs/architecture.md#权限与安全边界)。

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
