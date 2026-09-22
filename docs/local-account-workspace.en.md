# Local workspaces with cloud account models

Start `dsh-tui <directory>` or run `/workspace open <directory>`. Quote Windows command-line paths containing spaces. Use `/connect` to sign in, then select **MewClaw 云端账号** in the main `/model` picker. Normal chat runs the official local Agent and file tools; the cloud provides inference. Cloud sessions remain separate.

The adapter registers through a Cordis effect and delegates streaming and tool-call parsing to the host PiAiAdapter. It reuses the `/connect` CredentialStore and sends Cookie/CSRF only to its associated HTTPS or loopback endpoint. No provider API key is copied to the computer. Sign-out rejects further inference. Saved local sessions can still open while offline.

The model IDs are the server selectors `cloud-default`, `account/<profile>/<model>`, and `shared/<provider>/<model>`. No local path is sent to cloud workspace creation, and `/desktop-workspace` is not needed. Normal DSH session events retain all model input and tool results. Local tool approval and sandbox policy remain owned by DSH.

Configuration: `remoteEndpoint` optionally pins the cloud address; `remoteModelTimeoutMs` defaults to 120000, `remoteModelContextWindow` to 262144, and `remoteModelMaxTokens` to 32768. See the configuration reference for ranges.

Keyless HTTP/SSE tests cover authentication headers, model selectors, tool-call parsing, sign-out and endpoint mismatch. The assembled session replay uses real Cordis, Agent, JSONL persistence and local file tools. Windows terminal and real-account evidence must be reported separately.
