# oh-my-claudecode v4.12.1: Bug Fixes

## Release Notes

Release with **8 bug fixes** across **24 merged PRs**.

### Highlights

- **fix(hooks): align tier-alias routing proof with CC-native model resolution** (#2683)
- **fix(models): align built-in Opus HIGH default with Claude Opus 4.7** (#2685)
- **fix(agents): replace scanner-bait commit placeholders** (#2682)

### Bug Fixes

- **fix(hooks): align tier-alias routing proof with CC-native model resolution** (#2683)
- **fix(models): align built-in Opus HIGH default with Claude Opus 4.7** (#2685)
- **fix(agents): replace scanner-bait commit placeholders** (#2682)
- **fix(installer): preserve remote MCP transport type during registry sync** (#2680)
- **fix(team): preserve Gemini team lanes when preflight path probing false-negatives** (#2676)
- **fix(team): close #2659 with the clean prompt tag sanitizer diff** (#2673)
- **fix(notifications): close #2660 with the clean tmux-tail diff** (#2674)
- **fix(hooks): ignore workflow keywords inside delegated ask prompts** (#2672)

### Refactoring

- **refactor(skill-state): harden stateful-skills keyword detection and state init**

### Documentation

- **docs: add Discord link to navigation in all README translations**

### Stats

- **24 PRs merged** | **0 new features** | **8 bug fixes** | **0 security/hardening improvements** | **0 other changes**

### Install / Update

```bash
npm install -g oh-my-claude-sisyphus@4.12.1
```

Or reinstall the plugin:
```bash
claude /install-plugin oh-my-claudecode
```

**Full Changelog**: https://github.com/Yeachan-Heo/oh-my-claudecode/compare/v4.12.0...v4.12.1
