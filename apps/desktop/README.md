# Vscrebook Desktop

The desktop host uses Tauri 2, Vue 3, TypeScript, and Vite. Shared book pagination and presentation contracts come from `@vscrebook/core`; Tauri window behavior stays under `src/adapters/tauri` and `src-tauri`.

## Development

Run from the repository root:

```sh
pnpm install
pnpm desktop:dev
```

The desktop reader keeps imported TXT books in its own IndexedDB library, with automatic reading-progress recovery, viewport-sized pages, and direct page jumps. Page layout recalculates when the window is resized and preserves the relative reading position. This library is separate from the VS Code extension's storage. The top navigation links to the bookshelf, current reader, and options. Open **选项** to customize all desktop shortcuts; shortcuts take effect globally, persist across restarts, and show duplicate or registration conflicts. In normal mode the stealth view uses a fully transparent background, hides every control except the novel text, removes window decorations and shadow, and stays on top. Hold `Alt` while dragging the text to move the frameless window. The minimum window size is 480 × 360. If the stealth-mode shortcut cannot be registered, the mode button is disabled so the window cannot become difficult to restore.

Check the Vue project types with:

```sh
pnpm --filter vscrebook-desktop exec vue-tsc --noEmit
```
