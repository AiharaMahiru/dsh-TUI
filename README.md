<p align="center">
  <img src="docs/assets/logo.svg" alt="dsh-TUI - DeepSeek Harness terminal interface" width="560">
</p>

<p align="center">
  <strong>English</strong> | <a href="README_ZH.md">简体中文</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@deepseek-harness-tui/dsh-tui"><img alt="npm" src="https://img.shields.io/npm/v/@deepseek-harness-tui/dsh-tui?style=flat-square&color=4b6fff"></a>
  <a href="https://github.com/ccch1mneyyy/dsh-TUI/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ccch1mneyyy/dsh-TUI/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-263146?style=flat-square"></a>
  <img alt="Public beta" src="https://img.shields.io/badge/status-public%20beta-7da1de?style=flat-square">
  <a href="https://github.com/ccch1mneyyy/dsh-TUI/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/ccch1mneyyy/dsh-TUI?style=flat-square&color=4b6fff"></a>
  <a href="https://www.npmjs.com/package/@deepseek-harness-tui/dsh-tui"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@deepseek-harness-tui/dsh-tui?style=flat-square&color=4b6fff"></a>
</p>

# dsh-TUI

> An interactive terminal UI plugin for DeepSeek Harness: pixel-whale header,
> live work status, streaming thinking display, double-Esc time rewind, a
> context progress bar, and a TPS gauge.
> Zero core changes, pure plugin mounting — install to enable; uninstall
> leaves no core patches.

## Highlights

- **Pixel whale pet**: one of three randomized startup intros; during the
  welcome phase **click for a heart and wake it from a doze**, with idle fin
  flutters, tail thumps, and sleep Z's (`/settings → whaleIdle` to disable);
  the first task freezes it to a static frame — zero ongoing cost. The 22
  hand-drawn frames are ported from
  [dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale).
- **Terminal-native interaction**: streaming Markdown, structured tool cards
  (multi-line commands fold to the first line plus a count, `Ctrl+O` or a
  click expands), `/` command and `@` file completion, `@path#L12-14`
  line-range references, history search, message selection, and `/lang` zh/en
  UI switching.
- **Terminal images**: inline thumbnails via Kitty graphics or Sixel; click
  for a centered large preview (zoom / pan / previous-next / open original);
  pasted images are fitted to the profile's limits before entering the
  attachment store; a same-size text fallback when graphics are unavailable.
  Disable in `/settings → Terminal image previews`.
- **Mermaid diagrams**: ```` ```mermaid ```` fences render as Unicode
  box-drawing diagrams (flowchart / sequence / state / class / ER / pie /
  mindmap / timeline / gitGraph), laid out in-process and taking shape while
  streaming; `/settings → Mermaid diagrams` to disable.
- **Timeline navigation**: a Grok-style turn rail covering **every turn,
  folded ones included** — one click away; the right gutter offers timeline /
  scrollbar / hidden modes, and the scrollbar track itself is a drag target.
- **Visible agent state**: activity animation (`moon8` by default), a context
  progress bar (hover the whole bar for the full legend; the readout changes
  color under pressure), TPS gauge, cache hit rate, reasoning effort,
  input/output tokens, and Git/session metadata; hovering a truncated tool
  header or session title shows the full text (never while a selection is
  active).
- **One session-management screen**: `/resume`, `/home`, `/agentview`, `/bg`
  and the `⌸` at the head of the prompt row all open the SAME screen — a
  workspace rail on the left, that workspace's sessions on the right (live
  state, filter, in-row ★ pin). A session another terminal holds refuses to
  be entered; a parked one is one keypress away, and switching never
  interrupts a running turn.
- **Complete session workflow**: `/new` `/compact` `/export` `/btw`, model
  hot-switching (fork continuation, history preserved), session fork,
  double-`Esc` time rewind, `/vim` editing, mouse selection editing, and a
  fullscreen draft editor (`Ctrl+Shift+E`). `/resume` only classifies a
  fully-read log with confirmed no user messages as empty — image-only input,
  incomplete reads, and parse failures are never cleaned up as empty
  sessions.
- **IDE selection channel**: with the VS Code extension, selecting code in
  the editor shows a `⧉ N lines selected` badge under the prompt, and
  submitting attaches the selected lines; manually launched sessions
  (tmux/SSH) discover a local IDE through lock files; without an IDE
  everything degrades silently. See [vscode.en.md](docs/vscode.en.md).
- **Official DSH integrations**: agent presets, skills, MCP, goals, todos,
  subagents, and questionnaires all run through existing DSH services and
  registries; `/skills` lists discovered skills — dsh-TUI preinstalls no
  general-purpose skills.
- **Rich extensions**: native browser interaction, computer use, and many
  more companion extensions.
- **Designed for long sessions**: event-driven projection, differential
  rendering, message virtualization, zero-allocation hot paths, and bounded
  caches; long-session resume skips the splash and lands straight on the
  newest message.

## Preview

<div align="center">
  <table>
    <tr>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/splash.png" alt="dsh-TUI conversation with the pixel-whale header" width="480">
        <br>
        <strong>Conversation with the pixel-whale header</strong>
      </td>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/ide-selection-badge.png" alt="IDE selection badge: live line count under the prompt" width="480">
        <br>
        <strong>Live IDE selection badge</strong>
      </td>
    </tr>
  </table>
</div>

## Featured & Listed

Featured by the **DeepSeek Harness official WeChat account**, listed in the
[dshfind](https://dshfind.com/en/plugins/ccch1mneyyy/dsh-TUI) plugin
directory, and ranked **#7 on [GitHub Trending](https://trendshift.io/repositories/146168)
daily** (TypeScript).

<div align="center">
  <table>
    <tr>
      <td align="center" valign="middle" width="50%">
        <img src="screenshots/wechat-official.png" alt="dsh-TUI featured by the DeepSeek Harness official WeChat account" width="480">
        <br>
        <strong>Featured by the official WeChat account</strong>
      </td>
      <td align="center" valign="middle" width="50%">
        <a href="https://dshfind.com/en/plugins/ccch1mneyyy/dsh-TUI"><img src="https://dshfind.com/api/card/ccch1mneyyy/dsh-TUI?lang=en" alt="dsh-TUI on dshfind" width="420"></a>
        <br>
        <strong>Listed in the dshfind directory</strong>
        <br><br>
        <a href="https://trendshift.io/repositories/146168" title="GitHub Trending Daily #7 · TypeScript"><img alt="Trendshift" src="https://trendshift.io/api/badge/trendshift/repositories/146168/daily?language=TypeScript"></a>
        <br>
        <strong>GitHub Trending Daily #7</strong>
      </td>
    </tr>
  </table>
</div>

## Quick Start

Prerequisites: [Node.js](https://nodejs.org/en) and
[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), with
`DEEPSEEK_API_KEY` configured.

```sh
# Install the CLI and this plugin globally (ships the dsh-tui command)
npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui

# Start (first run auto-initializes the profile; needs pnpm)
dsh-tui
# Both `dsh-tui` and the short `dst` alias start the same TUI.
dst
```

Manual alternative: `dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui`
(the repository's `sh install.sh` wraps this step and checks the required
commands); afterwards `dsh-tui` and `dsh --profile dsh-tui` are equivalent.

> **New-user note**: pnpm ≥11 blocks dependencies with install scripts by
> default (`ERR_PNPM_IGNORED_BUILDS`), and updates skip foreign-platform
> `@img/sharp-*` native packages (saving about 200MB of downloads) —
> `/update` and `dsh-tui update` write both configurations automatically, no
> manual step needed. Details:
> [Getting started](docs/getting-started.en.md#pnpm-install-script-blocks-and-foreign-platform-natives).

The TUI checks for newer versions in the background after startup (never
blocking the first frame); type `/update` for a one-shot upgrade that
restarts automatically and resumes the current session. See
[Getting started](docs/getting-started.en.md) for the profile lifecycle,
source builds, and troubleshooting — including migration from the former
`dsh-cc-tui` package.

### CLI

| Command | Purpose |
| --- | --- |
| `dsh-tui` / `dst` | Start the TUI (the short alias runs the same program) |
| `dsh-tui --resume [id]` · `dsh-tui update` · `dsh-tui doctor` | Resume a session · update the profile and align the launcher · pre-flight environment checks |
| `dsh-tui safe` | Read-only diagnostics, plugin inventory and repair guidance; `safe --rescue` builds a clean rescue profile |
| `dsh-tui version` · `dsh-tui help` | Launcher/profile versions and usage — both work even without a `dsh` install |

Every other argument is forwarded verbatim to `dsh --profile dsh-tui`. Safe mode's exact boundary and gate list: [Getting started → Safe mode](docs/getting-started.en.md#safe-mode-dsh-tui-safe).

**VS Code**: the integrated terminal, or the `dsh-tui-vscode` companion extension (multiple sessions, session history, specific-session resume, IDE selection channel) — [VS Code guide](docs/vscode.en.md). **Herdr**: run `dsh-tui` in a [Herdr](https://herdr.dev) pane with no setup; it reports `idle` / `working` / `blocked` (questionnaires and tool approvals count as `blocked`) through Herdr's local integration API, and stays inactive outside Herdr.

## Keybindings & Mouse

`Enter` send · `Tab` complete `/` and `@` · `Ctrl+Enter` interrupt and send · `Alt+Up` recall the last message · `Esc` dismiss (double-`Esc` on an empty prompt = time rewind) · `Ctrl+O` expand details · `Ctrl+R` history search · `Ctrl+V` paste (images become `[Image #N]` attachments) · `Ctrl+Shift+E` fullscreen draft editor · `?` all shortcuts · `←` on an empty prompt backgrounds the session and opens the session manager.

While the model is working: `Enter` steers, `Tab` queues a follow-up, `Ctrl+Enter` interrupts and sends.

Mouse (fullscreen, the factory default): drag to select and **copy on release**, double/triple click for a word/line, click a tool card to fold it, click a timeline-rail tick to jump to that turn, click an `[Image #N]` for the centered preview.

Every key, the mouse and questionnaire tables, the image modal, macOS `⌘` support and remapping in `/settings → Shortcuts`: [Interaction and commands](docs/interaction.en.md).

## Built-in Commands

`/resume` (also `/home`, `/agentview`, `/bg`, or `⌸` at the head of the prompt) opens the one session-management screen: workspace rail, that workspace's sessions, live state, filter, ★ pins. `/model` switches by forking. Everyday companions: `/new` `/compact` `/export` `/btw` `/tree` `/fork` `/rewind` `/settings` `/status` `/cost` `/jobs` `/skills` `/mcp` `/login` `/update`.

**Background sessions**: `/bg` (or `←` on an empty prompt) moves the current session to the background — it keeps running — and opens that screen; `Esc` goes back to it. They live inside this process (turns, tools and approvals work as usual) and stop when the TUI exits; the logs survive.

Full command reference, arguments and registry commands: [Interaction and commands → Slash commands](docs/interaction.en.md#slash-commands).

## Configuration & Extensions

Agent presets (`standard` / `ptc` / `minimal` / `cordis`, plus the bundled `liangshen`), themes (built-in, `~/.dsh-tui/themes/*.json`, npm plugin themes), MCP servers and the whole environment-variable surface: [Configuration](docs/configuration.en.md) · [Themes](docs/themes.en.md).

## How It Works

```text
dsh profile → dsh-base → dsh-TUI Cordis patch → agent preset + DSH services
  → session/event → Channel projection → React components → Ink/Yoga renderer → terminal
```

The TUI owns interaction and presentation only: the session log stays the source of truth, while model calls, tool execution, fork/resume, compaction and persistence stay in DSH services. Rendering is event-driven and virtualized at the layout level, so a long session costs O(visible window) per frame; the palette follows the terminal background (OSC 11).

Runtime path, module boundaries, performance notes and persistence locations: [Architecture and limitations](docs/architecture.en.md).

## Known Limitations

- Injected plugin context has no standalone display; it counts into the context segments.
- `/model` switches by forking the session (DSH has no in-place model switch): history is preserved and the old session stays in `/resume`.
- `Ctrl+V` reads the clipboard through platform tools; unsupported bitmap formats are rejected with a warning.
- A background session lives inside this process and stops when the TUI exits.
- `/thinking` is not persisted; `/compact` is unavailable under the `minimal` preset; `/update` needs a `dsh --profile` launch and is refused while a turn is running.

Full list: [Architecture and limitations → Known limitations](docs/architecture.en.md#known-limitations).

## Development

CI uses Node 24 and pnpm 11. The package supports Node `^22.19 || >=24`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm smoke
```

`lib/types/` is ignored generated output. `pnpm build` recompiles it from a
clean output directory and runs the build gates. **Git URL installs are not supported** (the source manifest keeps
`@dsh-std/*` as workspace deps, `vendor/dsh-std` is a submodule, and pnpm ≥11 refuses
git-hosted `prepare` scripts by default); install the registry package:
`dsh plugin --profile dsh-tui add @deepseek-harness-tui/dsh-tui`. Rendering, questionnaire, or tool-card
changes also require the relevant regression scripts.

## Plugin Ecosystem

Building a plugin? Start with the [admission & development guide](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md) (seams, contracts, verification checklist), the [plugin-template](https://github.com/dsh-tui-ecosystem/plugin-template) and the [dsh-tui-ecosystem](https://github.com/dsh-tui-ecosystem) organization; `dsh-working-activity` is the reference implementation.

Seam stability grading, the types-only `@deepseek-harness-tui/dsh-tui/api` entry and migration notes: [Plugin development](docs/plugins.en.md). The organization maintains the listing and admission rules only — it does not endorse or warrant community plugins.

## Documentation

| Topic | Contents |
| --- | --- |
| [Getting started](docs/getting-started.en.md) | Prerequisites, installation, startup, safe mode, profile lifecycle, source development |
| [Configuration](docs/configuration.en.md) | Cordis overrides, fields, agent presets, MCP, environment variables |
| [Themes](docs/themes.en.md) | Built-in themes, background detection, static JSON and npm plugin themes, validation |
| [Interaction and commands](docs/interaction.en.md) | Keyboard, mouse, questionnaires, slash commands, session workflows |
| [Architecture and limitations](docs/architecture.en.md) | Runtime path, rendering, persistence, security boundary, known limitations |
| [Community Management](docs/community-management.en.md) | Community entry points, roles, proposal flow, roadmap rules, and maintenance cadence |
| [Project Roadmap](docs/roadmap.en.md) | Public goals, phases, task status, exit criteria, and Future Work |
| [VS Code guide](docs/vscode.en.md) | Running dsh-tui in the VS Code integrated terminal; the `dsh-tui-vscode` companion extension offers multiple sessions, session history, and specific-session resume (on the Marketplace) |
| [Contributing](docs/contributing.en.md) | Contribution workflow, repository map, build artifacts, verification matrix, change rules |
| [Plugin admission & development](https://github.com/T-Auto/dsh-ecosystem-spec/blob/main/docs/plugin-admission-and-development.md) | Interface & compatibility agreement / plugin admission spec / seams / contracts / verification checklist (merged into dsh-ecosystem-spec) |

The complete bilingual index is [`docs/README.md`](docs/README.md).

## Community

- **Ecosystem organization**: [dsh-tui-ecosystem](https://github.com/dsh-tui-ecosystem) —
  the home of community plugins, templates, and the curated list. Come ship a
  plugin, pitch an idea, or just hang out 🐋
- **Chat groups** (Chinese-language): usage questions, plugin ideas, and
  feature wishes are all welcome.
- **Code of conduct**: please read the
  [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.en.md) before taking
  part.

| WeChat group (dsh-TUI community 4) | QQ group (ID 572549239) |
| :---: | :---: |
| <img src="screenshots/wechat-group.jpg" alt="dsh-TUI community WeChat group 4 QR code" width="200"> | <img src="screenshots/qq-group.png" alt="dsh-TUI community QQ group QR code" width="200"> |

> The WeChat QR code expires roughly every 7 days; if it stops working, use
> the QQ group (572549239) or open an issue to nudge us for a refresh.

## Permissions and Security Boundary

> **Windows security warning:** the Windows profile defaults to `danger-full-access` with approval set to `never`, so tools have unrestricted access. Inspect and tighten the profile before starting next to sensitive credentials or in an untrusted repository.

`dsh-TUI` implements no sandbox of its own — it uses the filesystem, shell, sandbox and approval policies of the active DSH profile. Permission presets come from the mounted DSH `permissionPresets` registry (a missing service falls back to the legacy three-row roster; a mounted but unusable one is marked unavailable and fails closed). Third-party presets join completion, the picker and the `Shift+Tab` cycle.

Details: [Permissions and security boundary](docs/architecture.en.md#permissions-and-security-boundary).

## Acknowledgments

- The pixel whale's 22 hand-drawn frames (drawn cell by cell in Excel) and
  its idle behaviors (fin flutters, tail thumps, sleep Z's, click hearts)
  are ported from **[dsh-ui-whale](https://github.com/lhh010/dsh-ui-whale)**
  (the DeepSeek Harness web whale-pet plugin, by [@lhh010](https://github.com/lhh010),
  BSD-3-Clause) — thank you for the art and the inspiration 🐋💜

## Friends' Links

Community, related projects, and companion tools built by friends:
[see the links page](docs/links.md)

## Stars

[![Star History](https://raw.githubusercontent.com/ccch1mneyyy/dsh-TUI/bot-star-history/assets/star-history/star-history.png)](https://star-history.com/#ccch1mneyyy/dsh-TUI&Date)

## License

[MIT](LICENSE)
