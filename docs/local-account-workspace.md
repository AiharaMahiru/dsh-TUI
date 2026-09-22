# 本地工作区与云端账号模型

TUI 的工作区、会话、工具和持久化由本机 DSH Harness 拥有。启动 `dsh-tui <本机目录>`，或执行 `/workspace open <本机目录>` 创建本地会话；Windows 目录含空格时在启动命令中加引号。

使用 `/connect` 登录云端账号后，在主界面的 `/model` 选择「MewClaw 云端账号」模型，即可用普通聊天处理本机文件。`/connect` 中的云端会话和工作区菜单仍只管理服务器资源；本地会话不需要 `/desktop-workspace` 桥接，也不上传本机路径到云端 workspace/create。

## 插件契约

Definition 使用官方 LlmAdapter；Provider 为本包 RemoteAccountModel，经 ctx.effect 注册 mewclaw-cloud 路由；Consumer 是本机官方 Agent/Channel，不另建会话或工具循环。模型选择采用服务端 cloud-default、account/<profileId>/<model>、shared/<provider>/<model> 选择器。适配器复用官方 PiAiAdapter 发送推理及解析工具调用。所有模型输入和工具结果仍由 DSH session event 保存。

账号凭证复用 /connect 的 CredentialStore，每次列目录或推理重新检查文件，不复制 API Key。只向凭证所属且符合 HTTPS/loopback 规则的 endpoint 发送 Cookie/CSRF。退出登录后下一次推理必须拒绝；模型目录失败不妨碍使用其他本机 provider。已有本地会话即使暂未登录也能打开，发送消息时明确要求重新登录。

remoteEndpoint 限定云端地址，缺省沿用登录文件地址。remoteModelTimeoutMs 默认 120000（1000–600000）；remoteModelContextWindow 默认 262144（1024–2097152）；remoteModelMaxTokens 默认 32768（1–262144）。这些预算属于本机推理桥接，服务端模型仍执行自己的限制。没有新的密钥配置或自动工具授权。

## 验证

无密钥回归使用 loopback HTTP 账号与 SSE 响应，验证 Cookie/CSRF、选择器、真实 PiAiAdapter 工具调用、登出拒绝、配置地址不匹配拒绝及 Cordis 卸载。组合回放使用本机临时目录与官方工具，确认文件副作用和会话日志均位于本机。Windows ConPTY 与真实账号推理另外记录，不以 Linux 回放代替。
