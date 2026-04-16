# oh-my-claudecode v4.12.0: add upgrade test, per-role provider and, display extra usage

## Release Notes

Release with **6 new features**, **67 bug fixes**, **3 other changes** across **121 merged PRs**.

### Highlights

- **feat(ci): add upgrade test to catch warnings and errors**
- **feat(team): per-role provider and model routing with resolved-routing snapshot** (#2614)
- **feat(hud): display extra usage spend data in HUD (closes #2570)**
- **feat(hud): add MiniMax coding plan usage provider**
- **feat(hud): split usage cache by provider to eliminate cross-session thrashing**

### New Features

- **feat(ci): add upgrade test to catch warnings and errors**
- **feat(team): per-role provider and model routing with resolved-routing snapshot** (#2614)
- **feat(hud): display extra usage spend data in HUD (closes #2570)**
- **feat(hud): add MiniMax coding plan usage provider**
- **feat(hud): split usage cache by provider to eliminate cross-session thrashing**
- **feat(release): rewrite release skill as generic repo-aware assistant** (#2501)

### Bug Fixes

- **fix: align persistent stop hook and tighten agent output contracts** (#2653)
- **fix(hud): support z.ai weekly token limit on pro+ tiers**
- **fix(ci): remove unsafe HOME override and widen stderr check in upgrade-test**
- **fix(ci): improve fork detection, version checks, and comment accuracy**
- **fix(ci): filter npm deprecation warnings from omc update stderr check**
- **fix(ci): skip claude step on fork PRs to avoid false failures**
- **fix(test): relax performance threshold in CI environment**
- **fix(keyword-detector): ignore pasted transcript blocks**
- **fix(session-start): ensure stale-root parent dir exists before temp symlink**
- **fix(hooks): align startup contract for autopilot and ralplan**
- **fix(session-start): unlink dangling stale path before fallback symlink**
- **fix(session-start): use absolute symlink target on POSIX**
- **fix(session-start): strip trailing separators before creating stale-root symlink**
- **fix(session-start): symlink stale CLAUDE_PLUGIN_ROOT to latest version**
- **fix(pre-tool-enforcer): honor OMC_STATE_DIR via centralized state-root resolver** (#2621)
- **fix(hooks): require invocation intent before auto-starting ralplan** (#2620)
- **fix(team): shorten trigger messages to fit sendToWorker 200-char limit** (#2617)
- **fix(hooks): prevent duplicate hook firing when plugin and standalone coexist**
- **fix(context-bloat): eliminate three sources of repeated rule/skill injection** (#2577)
- **fix(permission-handler): allow read-only gh issue/pr commands; add installer lib assertions**
- **fix(installer): preserve user skills with OMC-style frontmatter during updates** (#2573)
- **fix(tmux-detector): suppress stale pane history and commit/UI text false-positives**
- **fix(hud): keep MiniMax routing independent of credential presence**
- **fix(hud): support minimaxi.com and minimax.com domains for MiniMax provider**
- **fix(openclaw): hoist dead-pane guard to index.ts; drop session-level suppressor**
- **fix(openclaw): suppress dead-session pane replay alerts** (#2562)
- **fix(ask): close stdin for provider spawns to prevent hang in piped environments**
- **fix(post-tool-verifier): suppress non-actionable error token noise** (#2558)
- **fix(openclaw): suppress late lifecycle alerts for completed/cleaned-up sessions**
- **fix(keyword-detector): suppress review-seed echo from tripping code-review alerts** (#2541)
- **fix(purge): symlink stale plugin version dirs instead of deleting them**
- **fix(deep-interview): replace five remaining hardcoded 20%/0.2 threshold signals (issue #2545)**
- **fix(stop-hook): cap echoed task prompt to 150 chars to fix #2542**
- **fix(mcp): wire wiki, shared_memory, skills, and deepinit tools into standalone server**
- **fix(openclaw): suppress stale tmux pane history in stop/session-end alerts**
- **fix(state-root): centralize OMC_STATE_DIR resolution across hook entrypoints** (#2532)
- **fix(setup): only clean up OMC-managed skills**
- **fix(hooks): reduce bash failure false positives**
- **fix(ask): pipe multiline prompts to provider advisor stdin**
- **fix(config): warn on deprecated delegation routing**
- **fix(notifications): suppress usage-text tmux alert noise**
- **fix(psm): launch trusted sessions with initial prompt**
- **fix(psm): inject PR/issue context into Claude after session launch**
- **fix: surface HUD import errors from plugin root wrapper**
- **fix: keep Windows tmux.cmd execution consistent with availability checks** (#2444)
- **fix(cli): restore tmux-utils API compatibility for #2441** (#2442)
- **fix(tests): clean up tmux sessions spawned by scaling tests**
- **fix(tests): align test helpers with production path encoding and platform behavior**
- **fix(hud): remove stale inline wrapper from HUD skill, copy from canonical template**
- **fix(hooks): avoid .json false positive in source extension matching**
- **fix(installer): always update claude config CLAUDE.md**
- **fix(auto-update): avoid hook re-injection for plugin installs**
- **fix(tmux): centralize all tmux execution through wrapper functions**
- **fix(keyword-detector): preserve activation in mixed command/help prompts**
- **fix(keyword-detector): keep help-style use queries informational**
- **fix(doctor): remove extra brace in version drift command**
- **fix(doctor): use deterministic CLAUDE source for version drift check**
- **fix(doctor): support companion version markers and mingw-safe checks**
- **fix(setup): validate and strictly select cache version candidates**
- **fix(release): sync marketplace.json, docs/CLAUDE.md, and package-lock to 4.11.4**
- **fix(doctor): detect CLAUDE.md version drift against plugin cache**
- **fix(setup): prefer latest cache version over stale installed path**
- **fix(team): preserve forceInherit by skipping worker model resolution** (#2418)
- **fix(hud): try older built cache versions when latest import fails** (#2416)
- **fix(installer): use portable hook command paths on Windows** (#2415)
- **fix(preemptive-compaction): fallback to hook context window usage** (#2412)
- **fix(keyword-detector): narrow false-positive suppression for #2390** (#2411)

### Refactoring

- **refactor(hud): classify z.ai TOKENS_LIMIT by unit instead of reset time**
- **refactor(mcp): deslop standalone-server and listtools test**

### Documentation

- **docs(hud): note 2026-02-12 (UTC+8) cutoff for z.ai weekly TOKENS_LIMIT**
- **docs: split install commands into separate code blocks for clarity**
- **docs: add omc symlink bootstrap and .mcp.json conflict resolution to CONTRIBUTING**
- **docs(readme): refresh core maintainers and top collaborators**

### Other Changes

- **chore(test): fix stale comment in standalone-server.test.ts**
- **chore: sync metadata artifacts for version consistency**
- **chore: sync metadata artifacts for version consistency**

### Stats

- **121 PRs merged** | **6 new features** | **67 bug fixes** | **0 security/hardening improvements** | **3 other changes**

### Install / Update

```bash
npm install -g oh-my-claude-sisyphus@4.12.0
```

Or reinstall the plugin:
```bash
claude /install-plugin oh-my-claudecode
```

**Full Changelog**: https://github.com/Yeachan-Heo/oh-my-claudecode/compare/v4.11.3...v4.12.0
