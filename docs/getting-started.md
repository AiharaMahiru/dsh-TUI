# 安装与快速开始

[文档索引](README.md) · [English](getting-started.en.md)

## 前置条件

- Node.js `^22.19 || >=24`。CI 使用 Node 24。
- 官方 DeepSeek Harness CLI：`@deepseek-ai/dsh`。
- `pnpm` **10 或更高**（CI 使用 11）。`dsh plugin` 会把 profile 内的包安装
  交给 pnpm；pnpm 9 对传递依赖的提升行为不同，profile 里会解析不到
  `dsh-working-activity`，表现为启动后立刻退出且几乎无报错（见 issue #60
  与下方常见问题）。
- 支持交互输入的终端 TTY。`dsh-tui` 不支持把 stdout 重定向后启动。
- `DEEPSEEK_API_KEY`。使用自定义兼容端点时还可设置
  `DEEPSEEK_BASE_URL`。

macOS/Linux：

```sh
export DEEPSEEK_API_KEY='your-key'
```

PowerShell：

```powershell
$env:DEEPSEEK_API_KEY = 'your-key'
```

不要把真实密钥提交到仓库。正常的 profile 启动直接读取环境变量。

## 安装

最快路径（全局安装后自带 `dsh-tui` 直达命令）：

```sh
# 官方 CLI + 本插件
npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui

# pnpm 未安装时任选一种方式（首次启动自动初始化 profile 时需要）
npm install -g pnpm
# 或：corepack enable pnpm

# 启动：首次运行自动执行 dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui@<版本>
dsh-tui
```

手工分步（等价）：

```sh
npm install -g @deepseek-ai/dsh

# pnpm 未安装时任选一种方式
npm install -g pnpm
# 或：corepack enable pnpm

dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui
dsh --profile dsh-tui   # 或 dsh-tui
```

从仓库检出运行时，也可以执行：

```sh
sh install.sh
```

`install.sh` 只封装 profile 插件命令并检查 `dsh`、`pnpm` 是否可用；它不会
复制源码，也不需要本地构建。

## 从旧包迁移

早期版本使用无 scope 包 `dsh-cc-tui` 和 `cc-tui` profile，环境变量前缀为
`CC_TUI_*`/`DSH_CC_*`、数据目录为 `~/.dsh-cc`。新版本统一为组织包
`@deepseek-harness-tui/dsh-tui` 与 `dsh-tui` profile；执行以下命令创建新 profile：

```sh
dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui
dsh --profile dsh-tui
```

新版本只使用 `DSH_TUI_*` 环境变量与 `~/.dsh-tui` 数据目录，旧名不再被读取，
也不自动迁移数据。首次启动后，请把旧数据目录（`~/.dsh-cc` 等）中的主题、
配置与历史文件自行复制到 `~/.dsh-tui`。确认新 profile 正常后，旧的
`$DSH_HOME/profiles/cc-tui` 与旧数据目录残留可按需删除；不要把旧包和新包
同时添加到同一个 profile。

## 安装命令做了什么

首次执行 `dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui` 时，官方 CLI 会：

1. 在 `$DSH_HOME/profiles/dsh-tui/` 初始化 profile。未设置 `DSH_HOME` 时，
   默认根目录通常是 `~/.dsh`。
2. 让 profile 的第一层 bundle 使用 `@deepseek-ai/dsh-base`。
3. 在 profile 内通过 pnpm 安装 `@deepseek-harness-tui/dsh-tui`。
4. 读取包内 `dsh.bundle.patch` 元数据，将 `cordis.patch.yml` 追加为组合层。

启动时的主要顺序是：

```text
dsh-base -> 其他 bundle -> @deepseek-harness-tui/dsh-tui patch -> 用户 profile patch
```

base 提供 Agent、模型、会话、文件、Shell、策略和注册表等服务；本插件的 patch
覆盖或插入 TUI、Agent preset 名册、SQLite 会话持久化与工作状态行。

`dsh-working-activity` 已经是本包依赖，并由 `dsh-tui` 的 patch 自动插入。
不要对同一个 profile 再单独执行 `add dsh-working-activity`，否则可能出现重复行。

## 启动

```sh
dsh --profile dsh-tui
```

命令从当前目录启动，因此 Agent 的默认工作区也是当前目录。进入目标项目目录后再
启动即可。

Windows 仓库检出还提供：

```bat
dsh-tui.cmd
dsh-tui.cmd --resume
```

`--resume` 会读取 `%USERPROFILE%\.dsh-tui\resume.txt`，恢复 TUI 最近选择的
会话。设置 `DSH_TUI_WORKSPACE` 可以覆盖批处理启动器采用的工作目录。

## 安全模式（`dsh-tui safe`）

dsh 意外结束时，安全模式提供只读的环境诊断、profile 插件清单与修复指引。

- **双入口**：手动运行 `dsh-tui safe`；或在 dsh 以非零退出码结束后按提示进入。该询问仅出现在交互终端——脚本/管道等非交互环境只追加一行提示，且退出码保真；询问只覆盖最终 dsh 子进程的非零退出码，不含启动挂起（dsh 启动失败等同退出码 1 处理）。
- **只读边界**：安全模式控制面只读（诊断/清单/指引均不改动状态），例外有二："重试正常启动"与"创建/复用空白救援 profile"——后者是显式救援动作，它自己的安装只写进 `$DSH_HOME/profiles/dsh-tui-safe/`。另有两件要如实说明（都不是安全模式引入的新写行为）：① **任何一次 dsh 启动**都会维护共享的 `$DSH_HOME/profiles/node_modules` 模块回退链接（上游 dsh 的 `healProfilesModuleFallback`，没有开关），救援启动同样如此；② 安装由 pnpm 执行，pnpm 自己的全局 store（`pnpm store path`，默认在 `$DSH_HOME` **之外**）也会被写入或复用。
- **救援 profile 的干净性必须先被证明，证不出就拒绝**：进入救援前逐条校验，任一不成立即拒绝启动并打印原因与处置办法（门禁本身只读）：① 候选目录已存在但不是可识别的 profile（拒绝往未知目录安装）；② 既有 profile 的根 manifest 声明了第三方插件（启动它就不是干净环境）；③ `$DSH_HOME/cordis.patch.yml`（home 层）**存在即拒绝**——上游 dsh 把它叠加到**每个** profile 之上（排在 bundle 层与 profile 层之后）；④ profile 自带的 `dsh-tui-safe/cordis.patch.yml`（profile 层）**有条目即拒绝**——dsh 同样把它组合进 profile（bundle 层之后）。后两层启动器既不解析 YAML 也拿不到组合结果，故一律 fail-closed；dsh 默认生成的「注释 + `[]`」不算条目，不影响复用。校验通过后：创建 `dsh-tui-safe`（仅 base + TUI，钉当前版本，走官方 `dsh plugin add`）并以显式构造的环境（剥离宿主遗留的会话控制变量）启动——主 profile 装炸时用 dsh 修 dsh 的通道；救援会话结束回到菜单。已存在且干净时按现状复用，绝不重复安装；半装或「安装报成功但包不可读」的救援 profile 会被清掉重建——删除前按**名字与形态**核对顶层条目（`package.json`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`/`cordis.patch.yml`/`cordis.yml` 必须是文件，`node_modules`/`.dsh-module-fallback` 必须是目录，后者是 dsh 每次 profile 启动都会建的），发现别的名字或形态不符就拒绝并列出名字，绝不静默删你的文件；注意这些生成目录**内部**的内容会随目录一起被删掉。手动等价命令见指引（选项 4）。
- **非交互环境**：`dsh-tui safe --rescue` 在脚本/管道下执行同一套门禁与创建/复用，只报告结论（就绪退出 0，被拒绝退出 1）；在交互终端里等价于菜单选项 5。
- **旧全局启动器**：profile 副本不可读或过旧时，先升级启动器：`npm install -g --legacy-peer-deps @deepseek-harness-tui/dsh-tui@<版本>`。
- **修复命令示例**（安全模式只列出，需自行执行）：`dsh plugin --profile dsh-tui remove <第三方插件>` 逐个移除可疑插件；`dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui@<版本>` 重装对齐；`dsh-tui doctor` 环境诊断。

## 更新到最新版本

项目迭代很快，更新复用安装命令，显式指定 `@latest`：

```sh
# 更新 Profile runtime（TUI 内 /update 做的就是这件事）
dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui@latest
```

如果你通过全局 `dsh-tui` 命令启动，还需要让 Launcher 对齐（TUI 内的
`/update` 只更新 profile，不会动全局安装）：

```sh
npm install -g @deepseek-harness-tui/dsh-tui@latest
# 或（原本用 pnpm 全局安装时）
pnpm add -g @deepseek-harness-tui/dsh-tui@latest
```

- 不带 `@latest` 时 pnpm 会按 profile `package.json` 里已记录的版本范围
  （如 `^0.1.4`）就地解析，可能停留在旧的主线上——这是"重复执行安装命令
  但版本没变"的常见原因。
- 修复"版本不一致"时，优先使用启动器打印的"精确版本"命令（例如
  `npm install -g @deepseek-harness-tui/dsh-tui@0.8.3`）；日常主动升级才
  使用 `@latest`。
- 确认生效：启动横幅右上角显示当前版本（`✦ dsh-TUI vX.Y.Z`）。
- 用户覆盖层 `cordis.patch.yml` 在更新中原样保留；会话数据的存放位置
  可能随版本变化（如 0.3.7 起 `/resume` 改用与 dsh web 共享的 JSONL
  会话库），跨大版本更新后旧会话不在列表属预期，原数据不会被删除。

### pnpm 安装脚本拦截与异平台原生包

若 `dsh plugin` 安装时报 `ERR_PNPM_IGNORED_BUILDS`（pnpm ≥11 默认阻止带安装脚本的依赖，如 `@google/genai`、`protobufjs`——这些脚本运行时不需要，忽略即可），在 profile 的 `pnpm-workspace.yaml` 里加入：

```yaml
allowBuilds:
  '@google/genai': false
  protobufjs: false
```

`/update` 与 `dsh-tui update` 会自动写入这份配置，无需手工处理。

更新时还会维护 `ignoredOptionalDependencies`（忽略异平台的 `@img/sharp-*` 原生包）——sharp 以全平台可选依赖分发，不处理时 `pnpm update` 会把各平台二进制一起下载（实测约 200MB）。名单每次更新按当前平台重算，异平台原生包不再下载（当前平台原生包与无平台归属的 wasm 回退包保留）；把 profile 搬到别的平台或 musl 容器后，在那台机器上跑一次更新即可刷新。老 profile 的 lockfile 里仍写着全平台条目，第一次更新会照旧下载一遍，之后才被忽略。块内不属于这两张平台表的条目（`fsevents`、自己写的 `@img/sharp-wasm32` 豁免）原样保留；需要 pnpm 支持该键，不认识的版本不会因此报错，只失去这项收益。

## Profile 配置

用户覆盖文件位于：

```text
$DSH_HOME/profiles/dsh-tui/cordis.patch.yml
```

配置一个节点时，`config` 块是整段替换，不是逐字段深合并。复制示例时需要保留
仍然有效的字段。完整说明见[配置参考](configuration.md)。

仓库根目录的 `cordis.yml` 是裸组合示例；正常的 npm/profile 安装以
`cordis.patch.yml` 为准，不需要把根配置复制到 profile。

## 从源码开发

```sh
git clone --recurse-submodules https://github.com/ccch1mneyyy/dsh-TUI.git
cd dsh-TUI
pnpm install --frozen-lockfile
pnpm build
pnpm smoke
```

本仓库有三个子模块，其中 `vendor/dsh-std` 与 `dsh-auth` 是安装必需
（`pnpm-workspace.yaml` 把 `vendor/dsh-std/packages/*` 列为 workspace 包，
`dsh-auth` 经 `link:` 引入）。漏掉 `--recurse-submodules` 会让这两个目录为空，
`pnpm install --frozen-lockfile` 直接失败。已经克隆过的检出补一条：

```sh
git submodule update --init --recursive
```

`pnpm build` 会清理忽略入库的 `lib/`，把 `src/` 编译到 `lib/types/`，再运行
构建门禁。**Git URL 安装不受支持**（workspace 依赖/子模块/pnpm ≥11 prepare 白名单三重阻断）；发布 workflow
也会在打包前显式执行干净编译和包面验证。

真实测试当前源码时，首次使用或正式模型/密钥配置变化后运行：

```sh
pnpm dev:copy-config
```

以后每次修改源码后，一条命令构建、打包、隔离安装并启动：

```sh
pnpm dev
```

`pnpm dev:copy-config` 只复制 `~/.dsh/settings.yaml` 与
`~/.dsh/.credentials.yaml`。Unix 上文件权限设为 `0600`；Windows 使用系统管理的
文件 ACL。`pnpm dev` 使用独立的 `HOME`、`DSH_HOME` 和会话目录，不覆盖正式
`~/.dsh/profiles/dsh-tui`、`~/.dsh-tui` 或正式会话。默认测试目录在 Unix 的
`$XDG_CACHE_HOME/dsh-tui-dev`（未设置时为 `~/.cache/dsh-tui-dev`），Windows
则为 `%LOCALAPPDATA%\dsh-tui-dev`；可通过 `DSH_TUI_DEV_ROOT` 覆盖。

不启动 TUI、只验证构建、打包和安装链路时运行：

```sh
pnpm dev:test
```

CI 还会运行三条渲染回归：

```sh
node --import tsx/esm scripts/repro-askpanel.tsx
node --import tsx/esm scripts/verify-askpanel-layout.tsx
node --import tsx/esm scripts/repro-toolcards.tsx
```

`pnpm tui` 调用的 `scripts/run.ts` 直接组合 DeepSeek Harness 源码 patch，默认假设
包位于 Harness monorepo 的 `packages/*` 布局中；独立 checkout 需要另外设置
`DSH_TUI_DEV_WORKSPACE` 指向 Harness 根目录。只测试本仓库当前源码时，优先使用
上述 `pnpm dev`，它会走与用户安装一致的 profile 路径。


## 常见问题

### Git URL 安装报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` / `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`

Git URL（如 `https://github.com/ccch1mneyyy/dsh-TUI`）安装不受支持，三重阻断：
源 manifest 的 `@dsh-std/*` 是 workspace 依赖（git tarball 原样保留，profile
内无法解析）；`vendor/dsh-std` 是 git 子模块（依赖抓取不带子模块内容，编译必
败）；pnpm ≥11 默认拒绝 git 依赖执行 `prepare` 构建脚本。请安装 registry 包：

```sh
dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui
```

### `dsh-tui requires an interactive terminal`

stdout 不是 TTY。请直接在终端中启动，不要把主进程输出管道到文件或其他命令。

如果 dsh-tui 只是装在某个 profile 里、而实际由 Web / Tauri / GUI 等非终端宿主
启动 DSH，dsh-tui 会检测到 stdout 不是 TTY 且并非由 `dsh-tui` launcher 启动，
自动跳过 TUI 前端（不报错、不影响宿主启动）；只有显式执行 `dsh-tui`（含
standalone 便携版）却没有 TTY 时才会报上面的错误。

### 找不到 `dsh` 或 `pnpm`

确认全局 npm bin 目录在 `PATH` 中，并重新打开终端。`install.sh` 会在安装前检查
这两个命令。

### 启动后立刻退回 shell，几乎没有报错（pnpm 9）

pnpm 9 安装的 profile 里，传递依赖 `dsh-working-activity` 不会被提升到
loader 可解析的位置，模块解析失败导致整棵插件树被回收，TUI 打印 resume
提示后直接退出（issue #60）。升级 pnpm 到 10+ 后重装即可：

```sh
npm install -g pnpm@latest
dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui@latest
```

### 模型启动失败或提示没有凭证

确认启动 `dsh` 的同一个 Shell 中存在 `DEEPSEEK_API_KEY`。自定义端点同时检查
`DEEPSEEK_BASE_URL`。

### 工作状态行重复

检查 profile 是否曾单独添加 `dsh-working-activity`。保留本包 patch 自动插入的
`working-activity` 行，移除重复 bundle 配置。

### TUI 显示错位或终端退出后状态异常

先运行 `/doctor`，记录终端类型和模式，再参考[交互文档](interaction.md)与
[架构文档](architecture.md)。渲染问题可使用 `DSH_TUI_RENDER_LOG` 采集原始帧，
但日志可能包含会话可见内容，应妥善处理。
