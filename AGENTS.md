# Repository Guide

## Project map

- `extension/` is the VS Code host: commands, status bar, and VS Code API integration.
- `packages/core/` contains reader workflows. Check host dependencies before changing code intended for cross-platform reuse.
- `packages/config/` and `packages/utils/` contain configuration and shared utilities.
- `packages/crawl/` contains the Rust/WASM crawler and its TypeScript bridge.
- There is no Tauri/Vite desktop app in this repository yet; do not assume its host adapters or build scripts exist.

## Changes

- Check `git status` first and preserve unrelated user changes.
- Before editing a package, read the root `README.md` and the nearest package `README.md` and `package.json`; follow any more specific `AGENTS.md` in the target path.
- For refactors, work on one module at a time. Change another module only when direct integration requires it, and keep that change minimal.
- Follow existing package boundaries. Keep host APIs, filesystem access, and UI interaction in host adapters when adding cross-platform behavior.
- Avoid unrelated renames, formatting, and cleanup.

## Checks

Choose checks based on the changed code and report what ran.

- `pnpm typecheck` checks the root TypeScript project.
- `pnpm lint` runs Oxlint for the repository.
- `pnpm build` bundles the VS Code extension; do not run it by default for unrelated or logic-only changes.
- `pnpm run ext:build:dev` builds the Rust/WASM crawler dependency and then the extension development bundle. Use it when validating that integration.
- Check package scripts before assuming tests exist. `packages/core` currently has no test suite; its `test` script is a placeholder that exits with an error.
- Run packaging or publishing workflows only when requested or directly required.

## Commits

- Before preparing a commit, inspect the relevant diff and recent history. Exclude the current `HEAD` commit when inferring message style.
- Match the nearest relevant history. A common title format is `type(scope): :emoji: 简短说明`, for example `fix(all): :bug: 修复阅读流程并清理激活声明`. Keep the title concise and use an emoji only when it fits the established style.
- Present the proposed title and wait for the user's explicit confirmation or edits before committing. A request to commit authorizes drafting the title, not committing it.
- After confirmation, use the confirmed title exactly. Do not amend commits, rewrite history, or include unrelated changes.
