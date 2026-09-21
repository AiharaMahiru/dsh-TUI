# dsh-TUI 使用说明

[文档索引](README.md) · 英文版待补

> 面向日常用户的操作手册：启动、键位、命令、会话工作流、界面指标与常用技巧。
> 本文基于当前仓库代码与文档整理；配置行为最终以 `package.json`、`cordis.patch.yml`
> 和实际 DSH 组合为准。
>
> 英文版待补充（见 [docs/README.md](README.md) 约定）。

## 目录

- [1. 快速上手](#1-快速上手)
- [2. 快捷键速查](#2-快捷键速查)
- [3. 命令全集](#3-命令全集)
- [4. 会话工作流](#4-会话工作流)
- [5. 界面与状态栏](#5-界面与状态栏)
- [6. 模型 / 预设 / 主题 / 语言](#6-模型--预设--主题--语言)
- [7. 常用技巧](#7-常用技巧)

---

## 1. 快速上手

### 1.1 安装与启动

```sh
# 全局安装 CLI + 本插件（插件自带 dsh-tui 直达命令）
npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui

# 启动（首次运行自动初始化 dsh-tui profile，需 pnpm）
dsh-tui
```

- `dsh-tui --resume`：恢复上次会话；Windows 可用仓库里的 `dsh-tui.cmd`（等价）。
- `dsh-tui safe`：安全模式——只读查看环境、列出 profile 插件并给出修复建议，还能创建干净的救援 profile（见 §5.5）。
- `dsh --profile dsh-tui`：与 `dsh-tui` 等价的手工启动方式（`/update` 仅此方式可用）。
- 运行模型需要 `DEEPSEEK_API_KEY`；环境自检用 `/doctor`。
- 已验证的 dsh 引擎版本：`0.1.5-rc.1`，以及 `0.1.5-alpha.2`、`0.1.5-alpha.1`、`0.1.3-alpha.2`、
  `0.1.2-rc.1`、`0.1.2-alpha.3/4/5`、`0.1.0-rc.6/7/8`、`0.1.1-rc.1/2` 兼容线。
  更老或更新的版本仍可启动，但 logo 页会提示版本漂移并给出对齐命令。

### 1.2 首次启动你会看到

1. **像素鲸鱼顶栏**（约 3.4 秒开场动画：眨眼 → 喷水 → 摇尾，之后定格）：旁边是
   `✦ dsh-TUI` 版本号、`DEEPSEEK / HARNESS` 大字、当前模型与 effort、工作目录，
   以及一行**启动提示**（`/model` 切换模型 · `/help` 查看命令 · `Tab` 自动补全）。
   终端宽度 < 64 列时鲸鱼隐藏、仅保留文字列。
   若 dsh 引擎版本不在验证范围内，提示行下方会出现一行 **⚠ 版本漂移警告**
   （更新/更旧/混装/异常四形态），附对齐命令（`npm i -g @deepseek-ai/dsh@<版本>`）。
2. **底部状态栏**：工作状态行、上下文进度条、TPS 仪表与各类实时指标（见
   [5. 界面与状态栏](#5-界面与状态栏)）。
3. **启动提示行**：Logo 下方固定一行 `提示：<随机小技巧> · /tips 更多技巧`，每次启动随机换一条。
   `/tips` 打开完整技巧面板（快捷键 / 命令 / 工作流 / 界面与个性化 / 避坑五组），
   `↑/↓` 滚动、`Esc` 关闭。
4. **第一次普通启动**（没带 `--resume`、没指定工作区、也没带首条提示词）会进入**会话管理界面**，先挑工作区。
   离开后 `~/.dsh-tui/home.json` 记下"已看过"，以后启动直接进对话。
   界面随时可用 `/resume`、`/home`、`/agentview`、`/bg` 或输入框行首 `⌸` 打开。
5. 输入 `/` 看命令菜单，按 `?` 看快捷键帮助。

### 1.3 核心心智模型

- TUI 只负责交互与呈现；**会话日志才是对话的原始记录**，模型调用、工具执行、fork/resume、
  压缩与持久化由 DSH 服务负责（`/status` 可看会话信息）。
- 几乎所有命令都可以**用 Tab 补全**；命令带参数时先输入 `/命令 `（带空格）再 Tab。
- 输入任意非命令内容就是普通对话；**未知命令会作为普通消息发给模型**（比如
  `/permission` 在没挂载该命令的组合里）。

---

## 2. 快捷键速查

> 表内 `Ctrl` 在 macOS 上大多可换 `⌘`（`⌘V` `⌘O` `⌘R` `⌘T` `⌘L` `⌘Enter` 等）；
> `Ctrl+C` / `Ctrl+D` 保持 Ctrl 不变。`⌘` 需要扩展键盘协议（iTerm2 / kitty /
> WezTerm / ghostty / tmux），macOS Terminal.app 请用 Ctrl。

### 2.1 发送与投递（模型工作时的三种语义）

| 键 | 功能 |
|---|---|
| `Enter` | 空闲=发送；**模型工作时=steer**（注入下一步边界，不中断）；菜单打开=确认选中项 |
| `Tab` | 补全 `/` 命令或 `@` 文件；**模型工作时=follow-up**（排入当前回合之后） |
| `Ctrl+Enter`（⌘Enter） | 打断当前回合并立即发送输入 |
| `Shift+Enter` / `Ctrl+J` | 换行（`Option+Enter` 是 mac Terminal.app 的兜底） |
| `Alt+Up` | 把最后一条未处理消息取回输入框编辑（不中断回合） |
| `Esc`（工作 + 有 pending） | 中断回合并立即重投 pending 消息 |
| 工作中的 `/btw …` | Enter 直接执行（侧问永不打断主回合） |

### 2.2 中断 / 退出 / 系统

| 键 | 功能 |
|---|---|
| `Ctrl+C` | 工作中=中断；中断未收敛时再按=强制退出；空闲有输入=清空输入；空闲空输入=双击退出（3s 窗口） |
| `Ctrl+D` | 工作中=中断（中断未收敛时再按=强制退出）；空闲时双击退出 |
| `Ctrl+L`（⌘L） | 清屏并强制重绘 |
| `Ctrl+O`（⌘O） | 展开/收起详情（思考全文、工具参数与输出） |
| `Ctrl+E` | 输入框=光标到行尾；转录中=展开/折叠隐藏的旧消息 |
| `Ctrl+P` | 切换启动时 loaded-context 面板（面板在屏时有效） |
| `?` | 输入框为空时打开快捷键/命令帮助菜单 |

### 2.3 搜索

| 键 | 功能 |
|---|---|
| `Ctrl+R`（⌘R） | 历史消息搜索；重复按或 `↓` 到下一匹配；`Enter` 回填输入框 |
| `/`（转录态） | 会话全文搜索；`n` / `N` 跳转（仅 Ctrl+O 展开态） |

### 2.4 输入编辑

| 键 | 功能 |
|---|---|
| `←` / `→` | 按字符移动光标（有选区时坍缩到选区对应边缘） |
| `Ctrl+←` / `Ctrl+→`（⌘←/→） | 按词跳转 |
| `Home` / `End`，`Ctrl+E` | 逻辑行首 / 行尾（`Ctrl+A` 已改用于子代理面板，见 §2.7） |
| `Ctrl+U` / `Ctrl+K` | 删除光标前（至行首）/ 光标后（至行尾） |
| `Ctrl+W` | 删除前一个单词 |
| `Backspace` / `Delete` | 删前一 / 后一字符；**有选区时删除整个选区** |
| `↑` / `↓` | 多行时行间移动；单行时浏览输入历史（50 条） |
| `Ctrl+V`（⌘V）/ `Alt+V` | 粘贴：文本 / 文件路径（图片自动 `@` 引用）/ 剪贴板位图（`[Image #N]` 附件）；终端拦截 `Ctrl+V` 时用 `Alt+V` |
| `Ctrl+G` | 用 `$VISUAL`/`$EDITOR` 外部编辑器编辑输入（`:cq` 保留原稿；未设置变量时提示配置） |
| `Ctrl+Shift+E`（⌘⇧E） | 展开**全屏草稿编辑器**（也可点输入行尾 `⛶`）：带行号、高亮当前行，`Enter` 换行、`Ctrl+Enter` 发送、`Esc` 收起（草稿还在），滚轮、点击、拖选跟输入框一致；`/settings → 全屏草稿编辑` 可关 |
| 超长草稿自动折叠 | 粘贴 **≥6 行或 ≥600 字**的块会折成 `▸ N 行・M 字` 小条（悬停看全文）：点小条、或展开后首行的 `▾`，来回切换折叠；`Esc` 或敲任意键先展开。折叠只管显示——`Enter` 提交的始终是全文 |
| `/vim` | **vim 编辑模式开关**（会话级、不持久化）：开启后输入框显示 `INSERT` 徽标，`Esc` 切 `NORMAL`，`i/I/a/A/o/O` 回 INSERT。NORMAL 键位见下 |
| 打字 | **有选区时替换整个选区**（和标准编辑器一致），光标落在插入文本之后 |
| 右键 / `Ctrl+Shift+V` | 终端原生粘贴（含换行原样插入） |
| `Esc`（输入框） | 一层层关：帮助 → **图片预览** → 命令菜单 → 文件菜单（只关当前 `@` token）→ **有选区就先清选区（文字不动）** → 中断重投 → 有输入清空 → 双击=时间回溯 |
| 双击 `Esc`（空输入） | **时间回溯 rewind**（3s 窗口内按两次） |

**vim NORMAL 键位**：
- 移动：`h/l` 左右、`j/k` 上下行、`0/^/$` 行首/首个非空/行尾、`w/b` 词间移动。
- 删除：`x/X` 删字符；`d` 待第二键——`dd` 删整行含换行 / `d$` 删至行尾 / `d0`、`d^` 删至行首 / `dw` 删至词尾。
- 其他：`u` 撤销、`/` 打开命令菜单、`?` 空输入开帮助、`Enter` 发送照常。
- 未识别键忽略（不插入）；normal 下 `Esc` 无操作，清空用 `Ctrl+C` 或 `dd`。

### 2.5 导航 / 模式

| 键 | 功能 |
|---|---|
| `Shift+Tab` | 循环会话模式（默认 → plan 计划 → full 完全访问）；挂载了第三方权限预设时，它们按 registry 顺序排在循环末尾 |
| `Shift+↑` | 消息选择模式（`↑/↓` 移动，`Enter` 展开单条，`Esc` 退出） |
| `Ctrl+T`（⌘T） | 打开轨迹场景（同 `/trace`） |

### 2.6 鼠标（fullscreen 全屏模式；拖拽/双击/三击即选即复制）

| 操作 | 功能 |
|---|---|
| 左键拖拽 | 选文本，**松开即复制**（OSC 52 + wl-copy/xclip/xsel 兜底），自动取消选区 |
| 双击 / 三击 | 选词 / 选行，即选即复制 |
| **输入框内拖拽** | 建立输入框选区并高亮渲染（caret 跟随拖拽末端）；`Backspace`/`Delete` 删选区、打字替换选区、`←/→` 坍缩到对应边缘、`Esc` 仅清选区；拖拽只映射可见行（不做边缘自动滚动）；折叠块存在时选区钳制在 head 或 tail 一侧、不跨 chip 行 |
| **输入框 Shift+click** | 从选区头（无选区时为光标）扩展到点击处 |
| **输入框双击** | 选词（组件内自检测，500ms / 1 格；路径与标点连串整选） |
| **输入框 `Ctrl+C`（有选区）** | 复制选区到剪贴板（OSC 52 + 原生工具兜底）并保留选区继续编辑 |
| 滚轮 | 滚动消息列表（±3 行/格）；**有文本选区时随内容平移选区**（双向，两端越出视口自动取消选区） |
| `Esc` | 取消选区（不复制） |
| 单击消息行 | 展开/收起该行 |
| 单击「加载更早消息」/「ctrl+e 显示前 N 条」 | 加载更早消息 / 展开全部 |
| 单击 StickyHeader / 「↓ N new messages」 | 跳回固定消息处 / 滚动到底部 |
| 单击超链接 | 打开浏览器 |
| 悬停截断内容 | 在工具卡标题或会话标题上停留约 600ms，浮层显示完整内容；移开或终端 resize 后立即关闭。拖选文本期间浮层一律不出现（浮层会覆盖其下的单元格，混入拖选会复制到浮层片段） |
| 键盘扩展选区 | 有选区时 `Shift+←/→/↑/↓/Home/End` 扩展/收缩（跨行环绕） |

### 2.7 各场景键位

**问卷（模型 ask_user_question）**

- `↑/↓` 选选项，`Space` 多选，`Tab` 切到自定义回答。
- `Ctrl+V` 粘贴文本，`Enter` 提交。
- `Ctrl+K` 或点标题行折叠面板。
- `Esc`：从第 2 题起返回上一题；第 1 题则取消整批。
- `Ctrl+C`：任意题取消整批。

**计划评审（plan review）**

- `↑/↓` 移动，`1`/`2` 数字快选（反馈为空时）。
- 直接打字 = 填反馈；`Ctrl+V` 可粘贴反馈，`Enter` 提交。
- `Esc` 打断评审。
- 批准必须不带反馈；带着反馈选批准会报错。

**工具审批（approval）**

- `↑/↓` 移动，`1` 允许（仅本次），`2` 拒绝，`Enter` 提交。
- `Esc` 或 `Ctrl+C` 拒绝。

**会话管理界面**（`/resume`、`/home`、`/agentview`、`/bg`、输入框行首 `⌸`，同一个界面）

- 布局：左栏工作区、右栏当前工作区的会话。≥84 列两栏并排；更窄收起工作区栏，只留会话栏。
- 换栏：`←/→`（屏上只有一个 `❯`）。
- 移动：`↑/↓`/`PgUp`/`PgDn`。
- 筛选：**直接打字 = 实时筛选**当前工作区会话（按标题 / 目录 / 分支 / 模型）。
- 进入：`Enter` 进入光标行（第 0 行 = 在该工作区新建会话）；在工作区栏则打开操作菜单。
- 新建：`Ctrl+Enter`/`Ctrl+N` 在光标所在工作区新建会话。
- 停止：`Ctrl+X` 停止**后台**会话（当前会话停不了）。
- 其他：`Ctrl+L` 重读列表 · `Shift+Tab` 从工作区栏打开操作菜单。
- 鼠标：点击会话行 = 进入；点行内 `★`/`☆` 只切固定（不进会话）；右键工作区行弹出操作菜单。
- `Esc` 依次：关提示 → 清空筛选 → 离开。

输入框空着按 `←`（或 `/bg`）= 转后台并打开本界面，会话继续跑；再按一次 `Esc` 回到刚转后台的会话。

切换会话只是**停放**——正在跑的回合继续跑，切回来照旧。
被**别的** TUI 终端占用的会话整行标红、行尾写 `占用 pid <pid>` 且点不动；对方退出后自动恢复，就能进入。

固定项存到 `~/.dsh-tui/session-pins.json`。
工作区菜单四项：编辑 / 在此新建 / 重命名 / 从列表移除（**只删登记**，目录与会话日志都保留）。

目录没登记过的会话归到「未登记的工作区」分组，照常进入（该分组只在本界面内存活，不写回登记）。

**大图预览**（点输入框里的 `[Image #N]` 或转录里的缩略图打开）

- `←/→` 上一张 / 下一张（首尾不循环，底部也有 `‹`/`›`）。
- 缩放走**底部按钮**：`适应` 回整图、`100%` 按终端实际像素、`200%`/`400%`/`800%` 逐级放大。
  打开时只响应 `←/→` 和关闭键。
- 拖动图片、滚轮或方向按钮平移。
- `Esc`/`Ctrl+C`/`Enter` 或点卡片外关闭。
- 底部「打开原图」用系统看图程序打开原始附件。

**IDE 选区**（VS Code companion 扩展 `dsh-tui-vscode`，需扩展 ≥ 0.7.0、选区协议 v2）

- 编辑器选中代码 → 输入框下方**实时**出现 `⧉ N lines selected` 徽标（清空选区即消失）。
- 提交时选中行**自动附加**进上下文。
- 转录里用户消息上方出现「⧉ Selected N lines from <相对路径>」指示行（resume 后仍能重建）。
- 附加的是编辑器里那份文本（没保存的改动也带上）。
- 超大选区按 @-引用同款上限截断并标记。
- 没装 / 没连 IDE 时自动跳过、其余功能不受影响（详见 [vscode.md](vscode.md)）。

**历史搜索（Ctrl+R）**
`↑/↓` 选择 · 重复 `Ctrl+R` 或 `↓` 下一项 · `Enter` 回填 · `Esc`/`Ctrl+C`/`Ctrl+D` 取消

**轨迹场景（Ctrl+T / /trace）**
- `↑/↓` 与 `PgUp/PgDn` 移动 · `←/→`（或 `h`）切换 timeline/hotspot
- `[`/`]` 跳上/下一个失败点 · `{`/`}` 跳上一轮/下一轮
- `/` 查询行（`tool:` `kind:` `turn:` `err:` `run:` `>10s` `tok>1k` 前缀）
- `m` 循环投影模式 · `g`/`G` 顶/底 · `Enter` 展开详情 · `j`/`k` 详情翻页
- hotspot 视图 `t` 排序
- `q`/`Esc` 退出（Esc 三层：收起详情 → 清空查询 → 关闭）

**/settings 设置面板**
`↑/↓` 移动 · `Enter` 展开/切换/编辑 · `←/→` 在**有选项的字段**上循环切换（布尔项仍只响应 `Enter`）·
改动自动保存，`Esc` 退出

**/btw 侧问面板**
`↑/↓` 滚动 · `Space`/`Enter`/`Esc` 关闭 · `c` 复制答案 · 等待中 `Esc` 取消

**/effort 滑杆**
`←/→` 实时调整（Esc 不还原）· `Enter`/`Esc` 完成

**@ 文件补全**
`@` 在消息任意位置触发 · `↑/↓` 移动 · `Tab`/`Enter` 接受 · 目录可继续深入 ·
`Esc` 只关当前 token 菜单
- **两种查询模式**：路径形输入（`@src/` `@./` `@~/` `@D:\`，含任意路径分隔符）只列该目录；
  普通片段走**模糊子序列匹配**（前缀/边界加权，`@ink` 也能命中 `src/ink/Box.js`）。
- 文件与目录**双预算各 100**；接受按条目类型判定（文件=插入引用、目录=继续深入）。
- 粘贴/输入图片路径自动变 `[Image #N]` 附件。

**子代理面板（Ctrl+A）**
`↑/↓` 浏览 · `Enter` 查看详情 · `Esc` 关闭；详情页 `←/→` 翻页（概览 / 输出流 / 工具与 token），
运行中可按 `X` 中断 · `Esc` 返回。聊天流里子代理以卡片行实时展示（运行中三行瀑布，
落定后折叠为标题行；对应的 Task 工具卡被抑制）。

**双击 Esc 时间回溯（rewind）**
列表 `↑/↓` + `Enter` 进入确认 · 确认页 `Enter` 回退 / `Esc` 返回 · 插件决策等待中只响应 `Esc`

---

## 3. 命令全集

命令菜单 = 内置命令（50 条） + DSH 注册表命令（`/plan` `/goal` 等） + 技能目录
（仅补全，`/help` 菜单隐藏）。`/lang` 可切换中英文界面与命令描述。

### 3.1 会话

| 命令 | 参数 | 作用 |
|---|---|---|
| `/new` | 无 | 新开会话（无二次确认；旧会话可 `/resume` 恢复） |
| `/resume` | 无 | 打开**会话管理界面**（工作区栏 + 会话栏、实时筛选、固定常用、跨工作区）：切换会话只是**停放**，正在跑的回合不中断 |
| `/home` | 无 | 同一个会话管理界面（工作区视角：管理登记过的工作区及其会话） |
| `/agentview` | 无 | 同一个会话管理界面（看本终端里托管的所有会话及其实时状态） |
| `/bg` | 无 | 把当前会话转到后台并打开同一个界面（别名 `/background`） |
| `/tree` | 无 | 会话分叉树：悬停预览、点击回退 / 分叉 / 切换分支 |
| `/fork` | 无 | 把当前会话复制成可恢复的副本（原会话不受影响） |
| `/restart` | 无 | 重启进程并恢复本会话（回合运行中会被拒绝，先 `Ctrl+C`） |
| `/rename` | `<新名称>` | 重命名当前会话（无参时显示当前标题与用法） |
| `/recap` | 无 | 最近活动摘要（一行）+ 建议标题；面板内 `a` 键或点击一键应用标题。设置 `dsh-tui.recapOnOpen`（默认开）开启时，打开/恢复会话自动在底部显示一条分隔线 + `回顾：` 摘要行，悬停可查看操作、点击展开，发送新消息后自动消失 |
| `/workspace` | `resume` / `rename <名称>` / `open <路径或URI>` | 管理工作区；`open` 支持绝对路径、file URI、插件 scheme |
| `/clear` | 无 | 清空当前会话视图（重置展开/选择状态） |
| `/compact` | 无 | 压缩会话历史（无可压缩内容时会提示） |
| `/export` | 无 | 导出会话为 Markdown 到工作目录 |
| `/btw` | `<问题>` | 侧问：单轮、无工具、不打断主回合、不写历史 |
| `/trace` | 无 | 打开轨迹场景（同 `Ctrl+T`） |
| `/rewind` | 无 | 回退选择器（同空输入双击 Esc 的时间回溯） |
| `/exit`（别名 `/quit` `/q`） | 无 | 退出 dsh-tui |

### 3.2 状态与诊断

| 命令 | 参数 | 作用 |
|---|---|---|
| `/context` | 无 | 已加载上下文明细（指令/运行时上下文/技能/工具等） |
| `/status` | 无 | 模型+effort、工作/空闲、会话 id、目录+git 分支、token、缓存命中率、上下文百分比、会话标题 |
| `/cost` | 无 | token 用量 + 缓存命中率（DSH 不提供费用计量） |
| `/balance` | 无 | DeepSeek 官方账户余额（免费只读接口）：摘要行 + hover 明细（各币种赠送/充值拆分、当前计费时段与单价、本会话 token 与花费估算），点击刷新、`×` 关闭。密钥经 DSH 凭据解析（`DEEPSEEK_API_KEY`，环境变量兜底），仅在请求头中使用 |
| `/config` | 无 | 配置来源：`cordis.patch.yml` 路径、启动方式、模型路由 |
| `/doctor` | 无 | 环境自检 |
| `/init` | 无 | 在工作目录创建 `AGENTS.md`（created / exists / failed 三态提示） |
| `/agents` | 无 | 本会话子代理列表 |
| `/jobs` | 无 | 本会话后台任务面板（`run_in_background` 启动的命令）：状态/运行时长/退出码实时跟踪，`↑/↓` 选择、`k` 停止选中任务；面板打开时 `Esc` **只关面板**，不会打断正在跑的回合（想中断回合要先关面板再按 `Ctrl+C`）；转录流里内嵌任务卡（有输出显示最多三行瀑布、没输出只留头行，点击进面板），状态栏有运行数角标，任务落定弹 toast。输出来自 agent `job_output` 读取的镜像，不是实时 tail |
| `/settings` | 无 | 打开插件设置编辑器（命名空间读取/编辑） |
| `/help` | 无 | 快捷键 + 命令帮助菜单（`?` 入口） |

### 3.3 模型 / 显示

| 命令 | 参数 | 作用 |
|---|---|---|
| `/model` | 无 | 模型选择器；**切换 = fork 会话续聊**（历史保留、仅换路由），选择持久化到 `~/.dsh-tui/model.json` |
| `/effort` | `status` / `<id>` | 推理强度：无参滑杆（←/→ 实时调整）；`status` 当前档位；`<id>` 直接设定。持久化 `~/.dsh-tui/effort.json`（作为后续会话的次级默认；新会话起始档优先看 /settings 的默认推理强度 `effortDefault`，见 §5.3） |
| `/thinking` | 无 | 扩展思考显示开关（流式时思考逐条展开） |
| `/tokens` | 无 | token 用量 + 上下文百分比 |
| `/activity` | `frames <名>` / `status` | 工作状态行动画：无参选择器；`frames` 列当前预设；`frames <名>` 直接设置。当前可选 `random/star2/sand/triangle/box/box2/corners/point/layer/flip/aesthetic/hamburger/moon/moon8/whale-spout/whale-spin/whale-bubbles/clock/traffic_lights/comet/breathe/dots/arrow/spark/bar/braille/arc/circle/grow/noise/bounce/rainbow/bar2/dqpb/toggle`，默认 `moon8`。旧本地配置值 `claude` 读取时映射为 `moon8`，选择器不显示该旧预设。持久化 `~/.dsh-tui/working-activity.json` |
| `/preset` | `<id>` / `status` | Agent 预设切换：官方 `standard` / `ptc`（0.1.2；旧 0.1.1 名为 `code`）/ `minimal` / `cordis` + TUI 打包**梁神模式 `liangshen`** + 用户自定义；`ptc` / `code` 可跨版本兼容解析；**已开始的会话不可切换**（blank-only 锁定）。持久化 `~/.dsh-tui/agent-preset.json` |
| `/theme` | `<名字>` / `status` | 主题：无参选择器；`<名字>` 直接切换；`status` 当前主题（auto 时附 OSC 11 解析结果）。持久化 `~/.dsh-tui/theme.json` |
| `/color` | 无参 / `<名>` / `status` / `reset` | 会话强调色：**无参打开调色板选择器**（8 色 + 色点预览，`↑/↓` 选择、`Enter` 应用）；`<名>` 直接设置；`status` 当前；`reset` 恢复主题默认。输入框边框 + 会话名标签变色（标签显示在输入框顶边框**右上角**，**默认关闭**，`/settings` 的「会话名标签」可开启；`red/orange/yellow/green/blue/purple/pink/cyan`）。按会话经 `session/color` 事件保存，resume/rewind 后仍在 |
| `/lang` | `en` / `zh` / `status` | 界面语言热切换。优先级：`DSH_TUI_LANG` > settings.yaml > cordis.yml > 持久化 |
| `/vim` | 无 | **vim 编辑模式开关**（见 §2.4）：输入框切到 vim 键位编辑，会话级、不持久化 |

### 3.4 账号 / 策略 / 扩展

| 命令 | 参数 | 作用 |
|---|---|---|
| `/provider` | 无 | 交互式管理模型提供方向导（添加 / 编辑 / 删除；捆绑 dsh-auth 挂载时添加分支多出**订阅 OAuth 登录**——ChatGPT / Claude / Grok 免 API key 登录 / 登出；编辑单项只原地修补该字段、其余配置原样保留；持久化 profile，API key 非环境变量来源时才写入密钥库） |
| `/login` | 无 | 凭证状态（来源、存储可写性、base URL） |
| `/logout` | 无 | 登出说明（env 来源需删环境变量并重启） |
| `/permission` | 无 / `<preset>` / `status` | 查看当前权限预设与策略说明；无参时打开由 DSH `permissionPresets` registry 提供的选择器，参数通过官方命令切换。服务缺失时使用 legacy 三项名册，挂载但损坏时 unavailable；外部命令未注册时沿用默认命令/model dispatch |
| `/add-dir` | 无 | 文件策略范围说明（以工作目录为根） |
| `/hooks` | 无 | 占位：DSH hooks 未在组合中挂载时给出说明 |
| `/mcp` | 无 | MCP 连接状态（工具按 `mcp__服务器__工具` 分组）；未配置时给出 `cordis.patch.yml` 插入示例 |
| `/skills` | 无 | 技能目录选择器（名称+来源+简述），Enter 将可直调技能以 `/name ` 填回输入行 |
| `/plugins` | `check <dsh-plugin.json 路径>` | 插件诊断：信任横幅 + host 描述符 + 授权矩阵 + 台账；`check` 校验清单文件并给兼容状态 |
| `/update` | 无 | 更新 TUI 并自动重启恢复会话（仅 `dsh --profile` 启动可用；回合运行中会拒绝） |
| `/terminal-setup` | 无 | 终端配置建议（Windows Terminal ≥110 列、粘贴键位） |

### 3.5 技能

dsh-TUI 不预装通用技能。`/skills` 浏览 DSH 从当前 profile、用户与项目发现的
技能；可直调技能以 `/name` 加入命令菜单，参数原样随行（详见 §4.8）。

### 3.6 占位命令

| 命令 | 说明 |
|---|---|
| `/connect` | 占位：DSH 暂无远程连接机制 |

### 3.7 注册表命令（来自 DSH 生态，随组合动态并入 `/` 菜单）

| 命令 | 作用 |
|---|---|
| `/plan` | `[off\|message]` 计划模式；`/plan off` 退出 |
| `/goal` | 设置/查看会话目标 |
| `/feedback` | 提交使用反馈 |
| `/permission` | 查看/切换 DSH `permissionPresets` registry 的预设；第三方预设按 registry 顺序显示，`custom` 只作为当前态，不是选择目标；服务缺失时使用 legacy 三项名册，服务已挂载但损坏时标记 unavailable；外部命令未注册时沿用默认命令/model dispatch |

> 这些命令的行为由 DSH 命令注册表实现，本仓库只做菜单并入、补全与分发；
> 未知命令会作为普通消息发给模型。

---

## 4. 会话工作流

### 4.1 会话生命周期

| 操作 | 命令/键 | 要点 |
|---|---|---|
| 新建 | `/new` | 无二次确认——旧会话已持久化，随时可 `/resume` 找回；顺带清空 resume 标记 |
| 恢复 | `/resume`（同 `/home` `/agentview` `/bg` 与输入框行首 `⌸`） | 三合一**会话管理界面**：左工作区栏 + 右会话栏，`←/→` 切栏、打字实时筛选、`Enter` 进入、`Ctrl+N` 新建、`Ctrl+X` 停止后台会话、行内 ★/☆ 固定（`~/.dsh-tui/session-pins.json`）。切换会话只是**停放**——把会话放一边，回合继续跑、切回来照旧；被其他 TUI 终端占用的会话标红并写明 pid，进不去（详见 §2.7）。列表只把"完整读取且确认没有用户消息"的日志算空会话，仅发图片 / 读取不完整 / 解析失败的会话不会被误判 |
| 重命名 | `/rename <标题>` | 立即改名并持久化（写入 session/title 事件，会话管理界面里能读回） |
| 压缩 | `/compact` | 手动触发 DSH compaction；**回合运行中拒绝**；minimal preset 下不可用；压缩点以 Divider 摘要行呈现。压缩进行中切换会话（`/model`、`/resume`、`/rewind`、`/fork`、`/new`）会**先取消压缩再快照**——后台不再有静默提交的压缩；摘要默认用当前路由模型（换模型后即用新模型压缩）。"压缩已生效但落盘失败"会明确提示，不再误报为压缩失败 |
| 导出 | `/export` | 从完整 session log 导出 Markdown（含 thinking 与工具调用分节），文件 `dsh-tui-export-<时间戳>.md` 落在当前会话 cwd |
| 清屏 | `/clear` | 只清视图，不动会话日志 |
| 停止 | 会话管理界面 `Ctrl+X` | 停止光标所在的**后台**会话；当前终端正在用的会话停不了（想退出整个 TUI 用 `/exit` 或双击 `Ctrl+C`） |
| 退出 | `/exit`（或 `/quit` `/q`） | 空闲 `Ctrl+C` 双击或 `Ctrl+D` 双击也可退出；工作中中断迟迟不收敛时再按 `Ctrl+C`/`Ctrl+D` 强制退出 |

命令行恢复：`dsh-tui --resume`（最近会话）/ `dsh-tui --resume <id>`（指定会话）。
`-c` / `--continue` 等价。

### 4.2 时间回溯 rewind（双击 Esc）

**空输入时连按两次 `Esc`**（或 `/rewind`），进入回退选择器：

1. 选择器列出**你自己的消息**（最新在前，侧问行除外），`↑/↓` + `Enter` 选中。
2. 若模型正在工作：先取消回合并等落定（最长 30s）。
3. 边界取该消息所属回合**开始之前**；**不能回退到第一条消息**。
4. 系统 fork 新会话并回放历史到回退点（token/进度归零），**原消息放回输入框**供修改重发。
5. 回退后的分支**不算子 agent**（无 origin 标记），留在 `/resume` 列表里；继续用当前模型路由 + 会话自己的 preset。

> 有内容时双击 Esc 是清空输入；`Esc` 按这个顺序一层层关：
> 关帮助 → 关图片预览 → 关命令菜单 → 关文件菜单（只关当前 `@` token）→ 有选区就先清选区（文字不动）→
> 中断回合并重投 pending → 有输入清空 → 空输入双击 = 时间回溯。

### 4.3 消息投递语义（模型工作中）

- `Enter` = **steer**：注入当前回合的下一步边界，不中断。
- `Tab` = **follow-up**：排进当前回合之后处理。
- `Ctrl+Enter` = **interrupt**：打断并立即发送。
- `Alt+Up` = 取回最后一条未处理消息到输入框（不中断）。
- `Esc`（有 pending）= 中断并立即重投 pending。
- `/btw …` 工作中 Enter 直接执行——侧问永不打断主回合。

### 4.4 侧问 /btw

`/btw <问题>`：复用当前会话完整上下文做**无工具、单轮**回答。
**不写会话历史、不计 token**，关闭面板即消失；主回合照常进行。
面板：`↑/↓` 滚动 · `Space`/`Enter`/`Esc` 关闭 · `c` 复制答案 · 等待中 `Esc` 取消。
再次触发会中止上一个侧问。

### 4.5 轨迹场景（Ctrl+T / /trace）

整屏场景（不污染 scrollback），查看会话全程的时间线：

- `←/→`（或 `h`）切换 时间线 / 热点。
- `↑/↓` 与 `PgUp/PgDn` 移动；`g`/`G` 跳首尾。
- `Enter` 展开详情；`j`/`k` 在详情里滚动。
- `[`/`]` 跳上/下一个失败点；`{`/`}` 跳上一轮/下一轮。
- `m` 循环投影模式（等分 / 墙钟 / 压缩空闲）。
- `/` 打开**字段查询**，可用前缀：`tool:web_search`、`kind:retry`、`turn:9`、`err:`、`run:`、
  `>10s`、`tok>1k`。多条查询按 AND 组合，命中列原位高亮。
- 热点视图：`↑/↓` 选行，`t` 循环排序（耗时 / 次数 / token），`Enter` 跳回时间线定位。
- `q`/`Esc` 退出；`Esc` 三层：收起详情 → 清空查询 → 关闭。
- 首次使用前，状态栏迷你轨迹条旁有 `ctrl+t` 提示，打开过一次就不再显示。
- 未读失败只标注在**最新一条**失败工具行上。

### 4.6 模型切换与预设

- `/model`：选择器。**切换 = fork 会话续聊**：历史保留，只换 provider/model 路由，preset 不变。
  - 旧会话留在 `/resume`。
  - 选择持久化到 `~/.dsh-tui/model.json`。
  - 回合运行中切换会被拒绝。
- `/preset` 可选：`standard`（默认全功能）、`ptc`（PTC）、`minimal`（仅 bash+编辑器，无 compaction）、
  `cordis`（创造模式）、`liangshen`（梁神模式，首轮最小双工具，首次工具调用后开放全目录）。
  - 0.1.2 名册把旧版 `code` 当作 `ptc` 的兼容别名；旧 0.1.1 名册仍用 `code` 真名。
  - **已产生对话的会话不能切换**（blank-only）：选择只保存为下次 `/new` 的默认。
- 会话模式用 `Shift+Tab` 循环三档：default（workspace-write + 审批）→ plan（read-only）→
  full（danger-full-access）。
  - 挂载的第三方权限预设按 registry 顺序排在循环末尾。
  - `custom`/`status`、与内置档重复的 identity、不安全 token 不加入。
  - **批准计划或 `/plan off` 之后，沙箱与审批策略回到进入计划模式之前的状态**；如果是自己用 `Shift+Tab` 切走的，保留所选模式。
  - 恢复历史会话时按事件历史还原进入前的权限；历史不足以确定时保持不变，不会因为"匹配不上配置"就悄悄降级成 full access。

### 4.7 问卷与审批

**问卷（模型 ask_user_question）**

- 面板独占键盘；`↑/↓` 选选项，`Space` 多选，`Enter` 提交。
- `Ctrl+V` 把剪贴板文本粘进自定义回答；剪贴板是图片/文件或超长时会明确提示。
- **最后一行是自由输入行**：在选项行直接打字，会连同该选项标签和自定义文本一起提交；`Tab` 直达输入行。
- `Esc`：从第 2 题起返回上一题并保留草稿；第 1 题则取消整批。
- `Ctrl+C`：任意题取消整批（模型收到 ASK_CANCELLED）。
- 面板 `Ctrl+K` 折叠/展开，**点标题行**同样折叠；挂起时 `Esc`/`Ctrl+C` 先展开，不直接取消。
- 计划评审卡片：`1`/`2` 数字快选，反馈文本支持 `Ctrl+V` 粘贴；**批准必须无反馈文本**（带反馈视为"继续规划"）。
- 插件弹窗（托管对话框）里的输入同样支持 `Ctrl+V` 粘贴。

**工具审批**

- 命令申请权限提升时弹出审批条：工具名 + 完整命令 + 原因。
- `↑/↓` 选择，`1` 允许（仅本次），`2` 拒绝，`Enter` 提交，`Esc`/`Ctrl+C` 拒绝。
- 审批与问卷同时挂起时**审批优先**；协议只有"允许一次/拒绝"，没有"总是允许"。
- 后台会话发起的审批会多一行标注 **`来自后台会话 <会话 id 前 8 位>`**，标明是哪个会话发起的请求。

### 4.8 技能 / 注册表 / Goals-Todos

- `/skills` 浏览 DSH 发现的技能目录；可直调技能以 `/name` 加入命令菜单并由 host
  加载正文，参数原样随行。dsh-TUI 不自带通用技能。
- `/plan` `/goal` `/feedback` `/permission`：来自 DSH 命令注册表，随组合并入 `/` 菜单。
- **Goals/Todos 面板自动出现**：模型写入 goal/todo 时在输入框上方实时渲染（🎯 目标 + phase 徽章 +
  树形 todo 最多 8 行），无需任何操作；agent 空闲时自动隐藏已完成项。

### 4.9 MCP / Workspace / 其他

- `/mcp`：按服务器分组列出 `mcp__服务器__工具`；未配置时给出 `cordis.patch.yml` 插入示例。
- `/workspace`：`resume` / `rename <名>` / `open <路径|file:// URI>`（打开并新建会话）；
  `dsh-tui <路径>` 启动器同样接受工作区目标。相对路径由当前工作区插件解析。
- `/doctor` 自检：Node/平台、API key、模型路由、cwd、上下文窗口、会话存储、插件宿主。
- `/provider` 交互向导管理模型提供方：添加 / 编辑 / 删除。
  - 捆绑 dsh-auth 挂载时，添加分支提供**订阅账号登录（OAuth）**：
    - 选择 ChatGPT / Claude / Grok 等订阅账号，走浏览器 / 设备码流程登录，免 API key。
    - 已登录可重新登录或登出；与 `/auth status|login|logout` 同源；未挂载时无此选项。
  - 编辑菜单可选 API Key、模型列表或删除该 provider。
  - 自定义端点额外提供 Base URL 与 wire protocol——这两项仅自定义端点可编辑。
  - 任一编辑项只原地修补所选字段，profile 其余配置原样保留。
  - 仅用户配置层写入的 provider 可编辑/删除。
  - 非环境变量来源的密钥写入 `~/.dsh/.credentials.yaml` 0600，界面只显示 `••••••`。
  - 环境变量提供的密钥既不写入也不删除，与其他 provider 共用的密钥在删除时也保留。
  - 内置 provider 从 `llm.listConfigurableProviders()` 列出的 catalog 路由
    （openai / anthropic / deepseek 等）选择，只需 API key；baseURL 可选覆盖
    （代理网关），协议与模型目录自动继承。
  - 自定义端点需输入路由名、API key、baseURL 与协议（`openai-completions` /
    `openai-responses` / `anthropic-messages`）；向导用草稿凭据探测端点公布的
    模型供勾选（探测失败手输模型 id）。
  - 内置路由即使 profile 显式写了 `api` 覆盖，仍按内置对待。
  - 其余编辑项改完立即退出、无需再确认；「编辑模型列表」自动勾选当前已启用的
    模型、勾选项条目原样保留；删除该 provider 需先确认。
  - 凭据存储与路由注册由 dsh-auth 拥有；OAuth 账号带遮蔽登录态标注（已登录
    显示令牌到期时间、过期会注明）；挂载了插件但没有可 OAuth 登录的 provider
    时给出提示。
  - 配置与 dsh web 端 Models 设置页互通（同一 settings section）；裸
    `dsh --config cordis.yml` 启动没有这些服务、`/provider` 提示不可用。
  - profile 已删而密钥清理失败时，明确提示手动处理（provider 本身已删除生效）；
    添加/编辑完成后运行 `/model` 切换到新路由的模型。
- `/init` 创建 AGENTS.md；`/agents` 子代理列表；`/login` `/logout` 凭证管理；
  `/permission` `/add-dir` 权限说明；`/hooks` `/vim` `/connect` 为占位（DSH 无对应机制，均给出明确说明）。

---

## 5. 界面与状态栏

空会话顶部是鲸鱼 Logo 区（随对话滚动消失）：

- **开场动画**（约 3.4 秒，每次启动三选一，`/deepseek` 彩蛋重掷）：经典（眨眼 → 喷水花 ×6 → 摇尾）/ 爱心 / 睡觉。
- **欢迎期闲置动画**（`whaleIdle`，默认开）：
  - 定格后鲸鱼摆鱼鳍、偶尔拍尾巴、眨眼；连续空闲 10 秒入睡冒 Z。
  - **点击鲸鱼冒爱心并唤醒它**（事件驱动，零空闲开销）。
  - 所有动作**独立图层并行合成**（tail/fin/heart/sleep/blink 各自驱动）——爱心叠加在摆尾或睡觉动作上同时显示，不打断它们。
- **任务冻结**：开始第一个 agent 任务后，鲸鱼**永久定格为静态标准帧**——不再动画、点击无效，零持续开销；滚出视口后连重绘都不参与。
  `/new` 新会话重新进入欢迎期。
- 鲸鱼右侧文字列：`✦ dsh-TUI v版本号` → 5 行块体大字 `DEEPSEEK / HARNESS`（品牌蓝渐变）
  → 当前模型 + effort → 工作目录 → **启动提示行**（`/model` 切换模型 · `/help` 查看命令 · `Tab` 自动补全）。
  若 dsh 引擎版本不在验证范围内，提示行下方会多出一行 **⚠ 版本漂移警告**
  （更新/更旧/混装/异常四形态，附 `npm i -g @deepseek-ai/dsh@<版本>` 对齐命令）。
- 鲸鱼下方居中的欢迎语：`探索未至之境！`（Explore the uncharted!）。
- 终端宽度 **< 64 列时隐藏鲸鱼**，仅保留文字列。
- 像素鲸鱼的 22 帧手绘原图与闲置行为移植自 [dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale)
  （作者 [@lhh010](https://github.com/lhh010)），特此致谢。

**超长单行折叠**（默认开）

- 任何**单行超过 1000 字符**的转录文本，进入布局前裁到 1000 字符，行尾留下 `… 已折叠 N 字符（点击或 ctrl+o 展开）` 标记。
- 适用范围：粘贴的巨型单行、工具调用里的一行大命令、压缩后的 JS、单行日志；具体是 user 消息、assistant 正文、工具卡标题与正文。
- 为什么要裁：一行 20 万字符会铺成上千视觉行、每帧重排，转录卡顿就是这么来的。
- 展开：**鼠标点这一行**（工具卡点卡面），再点一次收起；键盘用 `Ctrl+O`。
- 只有真被折叠的行可点，普通消息不可点（转录是阅读区，拖选复制不受影响）。
- 流式中的行也能点开，看到的是已经到达的全文。
- 思考（thinking）行不折叠——它本来就只有三行的预览瀑布。

### 5.2 底部状态栏（输入框下方三行）

**Row 1 — 上下文分段进度条**（`/settings → statusBar.contextBar`，默认开）

- 按内容类型分段着色：system 深蓝 / prompt 藏青 / assistant 靛蓝 / thinking 品牌蓝 / tools 浅蓝。
- **条上没有类型名**，唯一的文字是最右缘读数 `13k/64k 19.5%`（窄屏只显示 `19.5%`）。
- 读数按占用率变色：<80% 常规灰蓝，**≥80% 转琥珀、≥95% 转红**——与 `ctx` 字段悬停量表、活动行的 `⚠ 上下文 N%` 同一套阈值。
- 悬停整条，弹出图例：色块 + 名称 + token 数（`■system 1.2k · ■prompt 300 · … · ■free 988k`）。
  窄屏自动改用短名。
- 色块就是条上那一段的颜色，所以颜色↔名字一一对应。
- 整条是一个悬停目标，鼠标沿条滑动不会反复触发重绘。

**Row 2 — 状态字段行**（每个字段独立开关，见 `/settings`）
- 左组，从左到右：模型 → TPS → thinking 推理等级 → mode 会话模式 → ctx 上下文占用 → cache 缓存命中率 →
  tokens（`1.2k→340` 输入→输出）→ cost 本会话花费估算
- cost 估算（`≈¥0.05 谷`）：`≈¥` + 当前计费时段短标记（峰/谷）。
  - 仅 DeepSeek 官方 provider 且模型有已知单价时显示。
  - hover 查看高峰/空闲拆分与输入/输出/缓存明细。
  - 按每次请求的发生时刻分高峰/空闲桶，各按官方对应单价计（高峰期 / 低谷期）。
  - 跨时段会话不会被整段按当前时段计价；估算只是参考，实际以 DeepSeek 平台账单为准。
- 右组，从左到右：git 分支 → 工作目录（紧凑模式仅 basename）→ 会话标题 →
  短会话 ID（`#` + 前 8 位，与日志文件名对应，方便 `--resume` 定位）
- `statusBar.compact` 时左右合并为单行。
- 默认开：compact、model、thinking、cwd、contextUsage、cache、cost、goal、contextBar。
- 默认关：tokens、tps、gitBranch、sessionTitle、sessionId、mode、activity、trajectory。

**Row 3 — 提示 / 工作活动 + 迷你轨迹条**
- 空闲显示 `? for shortcuts`，回合运行中显示 `esc to interrupt`，
  消息选择中显示 `esc to return to input`。
- 空闲时（`statusBar.activity` 开）显示 **working-activity 工作摘要**：动画帧字符 + 冰蓝扫光；
  上下文压力 ≥80% 显示琥珀 `⚠ 上下文 N%`、≥95% 转红；回合运行中替换经典 spinner（带 token 方向后缀）。
- 右侧**迷你轨迹条 MiniWake**（`statusBar.trajectory`，默认关）：整个会话投影为十几个密度字形，
  `▁▂▃▄▅▆▇█`，颜色区分输入/工具/模型通道，失败列染红抬升；≥120 列 16 格 / ≥100 列 12 格 / ≥84 列 8 格 / 更窄不显示。
  首次使用前条旁有 `ctrl+t` 提示，打开过轨迹后就不再显示。

**TPS 仪表**（`statusBar.tps`，默认关）
流式中显示 1/8 格实时 gauge + `N tps`；回合结束后显示最近 12 样本 min-max sparkline。
速度配色：**≥50 绿 / ≥20 黄 / <20 红**。

### 5.3 /settings 设置编辑器

`/settings` 打开插件设置编辑器；**改动自动保存**，`Esc` 直接退出。
dsh-tui 自身区块写入 settings.yaml 用户层，多数设置实时生效；全屏和图片预览开关需 `/restart`。
下表为常用项，完整列表见 /settings 屏：

| 字段 | 说明 |
|---|---|
| lang | 界面语言 zh/en（DSH_TUI_LANG 钉死时不可改） |
| fullscreen | 全屏模式（默认开）；保存后用 `/restart` 生效 |
| terminalImages | 终端图片预览（默认开，需终端支持）；保存后用 `/restart` 生效。关闭后只显示文字信息并跳过预览解码，不影响向模型发送图片 |
| whale | 开屏头部像素鲸鱼娘（默认开）；每次启动随机三选一开屏动画：经典组合开场（眨眼+喷水+摆尾）/ 爱心 / 睡觉，`/deepseek` 彩蛋每次重掷 |
| whaleIdle | 鲸鱼娘欢迎期闲置动画（默认开）：定格后摆鱼鳍/拍尾巴/眨眼，空闲 10 秒入睡冒 Z；点击冒爱心不依赖此设置。开始第一个任务后永久定格为静态标准帧 |
| diffLayout | Edit/Write diff 布局：auto（≥110 列双栏）/ split / unified |
| thinkingFold | 思考块：preview（流式 2-3 行预览 + 落定折叠）/ full（展开到轮末） |
| effortDefault | 默认推理强度：auto / off / low / high / max。新会话的起始档位（细节见下） |
| smoothStreaming | 流式平滑输出（默认开）：实时回复/展开思考/工具卡正文按 ~30fps 匀速揭示，突发送达不再跳变，一次性到达的非流式回复也平滑打出；回放/历史始终完整直出 |
| toolBackground | 工具卡背景强调：none / subtle / strong |
| mermaidDiagrams | Mermaid 图表（默认开）：回复中的 ```` ```mermaid ```` 代码块画成字符图，流式期间逐步成形；比终端宽或类型不支持的图保留源码并注明所需列数。立即生效 |
| scrollGutter | 转录边栏：timeline（轮次时间线，默认）/ scrollbar（比例滚动条）/ hidden。立即生效 |
| pageMargin | 页边距：整屏相对终端四边向里缩。预设 none / slim / normal（默认）/ roomy，或自定义 `NxM`（细节见下）。立即生效 |
| foldTerminalCommand | 折叠终端命令（默认关）：终端卡（Bash/PowerShell）多行命令折成首行 + 计数；`Ctrl+O` 或点击卡片展开 |
| expandEditor | 全屏草稿编辑（默认开）：输入行尾 `⛶` 或快捷键（默认 `Ctrl+Shift+E`）把草稿展开成整屏编辑器——带行号、高亮当前行，`Enter` 换行、`Ctrl+Enter` 发送、`Esc` 收起（草稿还在）；关掉后这两个入口都不显示 |
| statusBar.* | 上表全部状态栏开关（compact/model/thinking/cwd/contextUsage/cache/tokens/cost/tps/gitBranch/sessionTitle/sessionId/mode/contextBar/activity/trajectory；statusBar.sessionId 是底栏显示开关，与 cordis 的启动 sessionId 无关） |

**effortDefault 细节**：
- 模型提供该档时，当前会话下一请求同样生效。
- **模型没有这一档，自动就近降一级，并弹提示说明**。
- 连更低档都没有才用模型默认，同样会提示——不会静默。
- 优先级：settings 用户层 > cordis `effort` > 上次 `/effort`（effort.json）> 模型默认。

**scrollGutter 细节**：scrollbar 的**轨道可以直接拖**，按住左键拖动连续滚动。
`Shift`/`Alt`/`Ctrl`+拖动仍是文字选择。

**pageMargin 细节**：自定义 `NxM` = 左右各 `N` 列、上下各 `M` 行，上限 8x4；只填 `N` 则上下保持 1 行。

未声明 TUI 区块的命名空间以只读形式列出，需手工编辑 `~/.dsh/settings.yaml`。

以下设置**不在 /settings 内**，要改 `$DSH_HOME/profiles/dsh-tui/cordis.patch.yml`：
provider / model / cwd / preset / workspace / sessionId / modes。

启动级 `effort` 键也在此改；/settings 里对应的是会话默认档 `effortDefault`（见上表）。

### 5.4 终端要求

- 必须交互 TTY；推荐 Windows Terminal（≥110 列、等宽、TrueColor）。
- macOS 的 ⌘ 修饰键需要扩展键盘协议（iTerm2 / kitty / WezTerm / ghostty / tmux）。
- Terminal.app 请用 Ctrl。
- VS Code 两种方式：
  - companion 扩展 `dsh-tui-vscode`（Marketplace 已上架，跑在真实的集成终端里）。
  - 直接在集成终端里运行 `dsh-tui`。
  - 装扩展还能拿到 **IDE 选区通道**（选中代码自动进上下文，见 §2.7，需扩展 ≥ 0.7.0）。
- **图片**：缩略图与大图预览需要 Kitty graphics 或 Sixel（自动探测，Kitty 优先）。
  - `DSH_TUI_IMAGE_PROTOCOL=auto|kitty|sixel|none` 可覆盖协议选择。
  - `DSH_TUI_DISABLE_TERMINAL_IMAGES=1` 强制关闭预览。
  - tmux/screen、非 TTY 输出与无障碍模式下只显示文字信息，不影响把图片发给模型。
  - 终端不支持时预览卡只显示元数据（格式 / 尺寸 / 体积 / 文件名），粘贴与发送照常。
- 环境自检：`/doctor`。

### 5.5 安全模式与救援 profile（`dsh-tui safe`）

dsh 意外退出时，安全模式给出**只读**的环境诊断、profile 插件清单和修复指引，帮你在"装坏了起不来"时自救。

- **两个入口**：
  - 手动跑 `dsh-tui safe`。
  - dsh 非零退出码退出后按屏幕提示进入。
  - 询问只在交互终端出现；脚本 / 管道等非交互环境只多打一行提示，退出码保持原样。
- **只读范围**：诊断 / 清单 / 指引都不改状态，有两个例外：
  - 重试正常启动。
  - 创建 / 复用空白救援 profile，只写 `$DSH_HOME/profiles/dsh-tui-safe/`。
- **救援 profile 先要证明干净，证不出就拒绝**。任一情况成立都直接拒绝启动，并打印怎么处理：
  - 候选目录认不出。
  - 既有 profile 声明了第三方插件。
  - home 层或 profile 层的 `cordis.patch.yml` 有条目。
  - 默认拒绝；dsh 默认生成的「注释 + `[]`」不算条目，不影响复用。
- **非交互**：`dsh-tui safe --rescue` 在脚本 / 管道下跑同一套检查，只报告结论（就绪退出 0，被拒绝退出 1）。
- **修复命令要自己执行**（安全模式只列出）：
  - `dsh plugin --profile dsh-tui remove <第三方插件>` 逐个移除可疑插件。
  - `dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui@<版本>` 重装对齐。
  - `dsh-tui doctor` 环境诊断。

---

## 6. 模型 / 预设 / 主题 / 语言

| 项 | 命令 | 说明 |
|---|---|---|
| 模型 | `/model` | 选择器；**切换 = fork 会话续聊**（历史保留、仅换路由）；持久化 `~/.dsh-tui/model.json`，重启与 `/new` 沿用。从没选过的话，用内置默认模型（当前为 `deepseek-flash`） |
| 推理强度 | `/effort` | 滑杆（←/→ 实时）或 `/effort <id>`；`/effort status` 看当前；新会话默认档在 /settings → 默认推理强度 |
| Agent 预设 | `/preset` | `standard` / `ptc`（0.1.2；旧 0.1.1 名为 `code`）/ `minimal` / `cordis` + **梁神模式 `liangshen`**；**已开始会话不可切换**（blank-only） |
| 主题 | `/theme` | `auto`（OSC 11 跟随终端背景）/ `light` / `dark` / `dark-ansi`；`/theme <名>` 直接切；`/theme status` 看解析结果 |
| 自定义主题 | 手动 | `~/.dsh-tui/themes/<名>.json`，`{base, colors}` 格式，选中即热切换；命名为 `auto` 会被内置遮蔽 |
| 语言 | `/lang` | `en` / `zh` 热切换；优先级 `DSH_TUI_LANG` > settings.yaml > cordis.yml > 持久化 |
| 状态行动画 | `/activity` | 选择器或 `/activity frames <名>`；当前预设默认 `moon8`，`random` 随机；旧本地配置值 `claude` 读取时映射为 `moon8` |

**主题优先级**：`DSH_TUI_THEME` > `~/.dsh-tui/theme.json` > OSC 11 终端背景检测 > dark 回退。

**~/.dsh-tui/ 偏好文件**（均 best-effort，坏文件回退默认）：

- `theme.json`、`model.json`
- `agent-preset.json`、`effort.json`、`working-activity.json`、`lang.json`
- `trajectory.json`（提示已看过的标记）
- `resume.txt` / `last-used.json`（会话恢复）
- `themes/<名>.json`（自定义主题）

**常用环境变量**：

- `DSH_TUI_LANG`、`DSH_TUI_THEME`、`DSH_TUI_PRESET`、`DSH_TUI_PERSONA`
- `DSH_TUI_DISABLE_MOUSE`、`DSH_TUI_DISABLE_TERMINAL_IMAGES`、`DSH_TUI_IMAGE_PROTOCOL`
- `DSH_TUI_ACCESSIBILITY`（无障碍模式：关动画/图形预览）
- `DSH_TUI_RESUME_SESSION`、`DSH_TUI_WORKSPACE_TARGET`、`DSH_TUI_SESSION_ROOT`
- `DSH_TUI_DEBUG`、`DSH_TUI_RENDER_LOG`（帧取证，可能含敏感内容）
- `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`
- `VISUAL`/`EDITOR`（`Ctrl+G` 外部编辑器）
- `DSH_PERMISSION_MODE`

---

## 7. 常用技巧

> 以下是从代码与文档里整理的精简技巧，也是启动提示与 `/tips` 的素材池。

**上手**
1. 按 `?`（输入框为空时）随时看快捷键菜单；输入 `/` 看全部命令——两个都有 Tab 补全。
2. 不确定环境对不对？先跑 `/doctor`；想看会话全貌用 `/status`。
3. 中英界面切换 `/lang en|zh`，即时生效并持久化。

**效率**
4. **模型工作中**：`Enter` 注入下一步（steer）、`Tab` 排队后续指令（follow-up）、
   `Ctrl+Enter` 打断并立即发送——不用等回合结束。
5. `Alt+Up` 把最后一条未处理消息取回输入框修改，不用重打。
6. 想快速问个事又不想打断主回合、不想留历史：`/btw <问题>`。
7. 打错了想重来：**空输入双击 Esc 时间回溯**，选你的消息改完重发；也可使用 `/rewind`。
8. 长输入用 `Ctrl+G` 拉起 `$VISUAL` 编辑器写，保存即回填。
9. `@` 在消息任意位置补全文件：普通片段**模糊匹配**（`@ink` 也能命中 `src/ink/Box.js`），
   路径形输入（`@src/` `@./` `@~/`）**直达该目录**；目录可继续深入；图片自动变 `[Image #N]` 附件。
10. 只想引用文件的某几行：`@src/a.ts#L12` 或 `@src/a.ts#L12-14` 精确带上行区间。
11. 想盯着子代理干活：**`Ctrl+A` 打开子代理面板**，`Enter` 看详情、`X` 中断运行中的子代理；
   对应命令 `/agents`。
12. **全屏模式下点击转录里的文件路径**（工具卡、代码、`file://` 链接）会弹出操作菜单：
   打开 / 在文件管理器中定位 / 复制绝对路径。

**查看与诊断**
13. `Ctrl+O` 展开/收起工具卡详情（思考全文、参数与输出）；`Ctrl+E` 展开隐藏的旧消息。
14. `Ctrl+R` 搜输入历史（重复按跳下一匹配）；转录态 `/` 全文搜索 + `n`/`N` 跳转。
15. `Ctrl+T` 看轨迹：`[`/`]` 跳失败点、`/` 字段查询（`tool:` `kind:` `err:` `>10s` `tok>1k`）。
16. 状态栏上下文条、TPS、轨迹条、git 分支等都是 `/settings → statusBar.*` 开关——默认关的
    `tps`/`trajectory` 值得打开试试（上下文条默认开，不需要可在同一处关掉）。
17. 上下文压力 ≥80% 时工作摘要行会变琥珀色预警，≥95% 转红——该 `/compact` 了。
    （minimal preset 下 /compact 不可用。）
18. `/balance` 查 DeepSeek 官方余额（免费只读接口，点击行刷新）；状态栏
    `statusBar.cost` 还会按单价估算花费 `≈¥ 峰/谷`（仅官方 DeepSeek 模型显示，悬停看明细）。
    估算只是参考，账单以 DeepSeek 平台为准。
19. 打开/恢复会话自动出**回顾摘要**（`/settings → Session → recapOnOpen`，默认开）：
    `Enter` 或点击展开详情；手动总结用 `/recap`，面板里 `a` 键应用建议标题。

**个性化**
20. `/theme` 换主题，`auto` 跟随终端背景；需要专属配色就写
    `~/.dsh-tui/themes/<名>.json`（`{base, colors}`），选中即热切换。
21. `/preset liangshen` 梁神模式：首轮最小工具集、首次工具调用后开放全目录（**新会话才生效**）。
22. `/effort` 滑杆 `←/→` 实时调推理强度；`/activity frames comet` 换状态行动画
    （可选名 35 个：34 种动画 + `random` 随机）。
23. `/model` 切换会 fork 续聊（历史保留），持久化后重启与 `/new` 沿用——放心换模型。
24. 会话太多？**会话管理界面**（`/resume`、`/home`、`/agentview`、`/bg` 或输入框行首 `⌸`）里打字即筛选、
    行内 `★` 固定、`Ctrl+X` 停止后台会话；切换会话只是**停放**，正在跑的回合不中断（详见 §2.7）。
25. 有文本选区时滚轮是**平移选区**不是滚动列表——想滚屏先 `Esc` 取消选区。
26. `/color` 给当前会话设强调色：无参打开调色板、`/color <名>` 直设、`/color reset` 清除；
    按会话保存，`resume` 后仍在。
27. `/settings` 改动**自动保存**（Esc 直接退出）；`shortcuts` 分组可逐动作自定义快捷键，
    保存即生效，下次按键就用新组合。
28. 输入框支持 vim 编辑：`/vim` 开启后 `Esc` 切 NORMAL（`h/l/j/k`、`0/^/$`、`w/b` 移动，
    `x/X/dd/d$/d0/dw` 删除、`u` 撤销），`i/a/o` 回 INSERT；不需要时再按 `/vim` 关掉。

**避坑**
29. `/compact`、`/model` 在回合运行中会被拒绝——先 `Ctrl+C` 或等回合结束。
30. 审批条 `Esc` = 拒绝（fail closed）。
    问卷第 2 题起 `Esc` = 返回上一题，第 1 题 `Esc` 或任意题 `Ctrl+C` = 取消整批（模型会收到取消信号）。
31. `/update` 只更新 profile runtime 不动全局安装；提示版本错位时按提示执行
    `npm install -g @deepseek-harness-tui/dsh-tui@<版本>` 对齐启动器。
32. `/reload` 重读偏好文件（主题/语言/预设/模型/动画），但**不重读** `cordis.yml` 根配置与
    全屏布局、图片预览开关，也不加载新构建的代码——改这些用 `/restart`（回合运行中 `/restart` 会被拒绝，先 `Ctrl+C`）。
33. macOS 的 ⌘ 键需要 iTerm2/kitty/WezTerm/ghostty/tmux；Terminal.app 用 Ctrl 即可。
34. 鼠标拖选即复制（fullscreen 模式）；`DSH_TUI_DISABLE_MOUSE=1` 可临时关闭鼠标。
35. logo 页出现 **⚠ 版本漂移警告**时按提示对齐 dsh 引擎：
    `npm i -g @deepseek-ai/dsh@<版本>`（支持范围见 §1.1）。
36. vim 模式开启时 `Esc` 交给 vim 处理（insert 回 normal、normal 无操作）——时间回溯请退出
    vim 模式后双击 `Esc`，或用 `/rewind`；回合运行中在 vim insert 模式按 `Esc` 也只是回
    normal，打断回合用 `Ctrl+C` / `Ctrl+Enter`。

**近期新增**
37. **换屏不丢草稿**：去 `/settings`、会话管理界面或轨迹场景再回来，草稿文字、光标位置、暂存图片，
    还有折叠块、全屏编辑器展开态和 vim 模式都原样还在（草稿跟着**会话**走）。
38. **IDE 选区通道**：VS Code 里选中代码，输入框下实时显示 `⧉ N lines selected` 徽标，发送时选中行自动附加进上下文
    （转录里有指示行，resume 后仍能重建）；需要 `dsh-tui-vscode` ≥ 0.7.0，没连 IDE 时自动跳过、不影响其他功能。
39. **粘贴大图**：超过 profile 图片限额的图先等比缩到限额内（必要时转格式、优先保留透明）再存下，
    粘贴提示写明最终尺寸和格式；需要重编码的动图会被**明确拒绝**，而不是悄悄丢帧。
40. **Mermaid 直接看**：回复里的 ```` ```mermaid ```` 代码块画成字符图，支持：
    flowchart / sequence / state / class / ER / pie / mindmap / timeline / gitGraph
    流式期间逐步成形；`/settings → Mermaid 图表` 可关，立即生效。
41. **长行不再拖慢画面**：超过 1000 字符的单行折成 `… 已折叠 N 字符（点击或 ctrl+o 展开）`；
    终端卡多行命令可用 `/settings → 折叠终端命令` 折成首行 + 计数。
42. **转录边栏**：`/settings → 转录边栏` 在「轮次时间线 / 滚动条 / 隐藏」间切换——滚动条模式下**轨道可以直接拖**；
    全屏转录还支持 `PgUp`/`PgDn` 按页翻动消息列表。
43. **草稿写长了**：`Ctrl+Shift+E` 或输入行尾 `⛶` 把草稿展开成整屏编辑器。
    带行号、高亮当前行，`Ctrl+Enter` 发送、`Esc` 收起且草稿还在。

---

> 本文档信息收集自代码与既有文档。**2026-09-21 按当前实现校正过一轮**：会话管理界面
> （`/resume` `/home` `/agentview` `/bg` 与输入框行首 `⌸` 三合一）
> 的键位与"切换 = 停放"行为（§2.7 / §4.1）、安全模式与救援 profile（§5.5）、IDE 选区通道（§2.7）、
> 图片粘贴适配与终端图片能力（§5.4）、转录边栏 / 全屏草稿编辑 / 折叠终端命令（§5.3）。
> 旧 `/resume` 的会话删除（`Ctrl+D`）与空壳会话清理属于三合一界面的**有意移除**项，界面上已经没有入口；
> 已知缺口：英文版待补。
