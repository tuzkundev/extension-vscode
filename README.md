https://marketplace.visualstudio.com/items?itemName=nguyenqq.clean-unused-imports

# Clean Unused Code – VS Code Extension

Tidy up your JavaScript / TypeScript projects with a single command.  
The extension sweeps the entire workspace, deletes dead code, and keeps the rest of your files squeaky-clean—without touching any `console.log` or `debugger` statements.

---

## ✨ What it can do

1. **Remove unused imports** (built-in _Organize Imports_ refactor).
2. **Remove variables that are declared but never read**.
3. **Remove functions that are never called** (top-level or exported).
4. **Remove React component props that are passed-in but never used**.
5. Cancellable progress bar, auto-save only when edits were made.
6. All rules are optional and can be toggled independently from the settings UI.

---

## 🛠️ Installation

### From the Marketplace

1. Open VS Code ➜ Extensions view.
2. Search for **"Clean Unused Code"** and click **Install**.

### Manual (.vsix)

```bash
# if you cloned the repo
npm install
npm run package          # produces clean-unused-code-<version>.vsix
code --install-extension clean-unused-code-<version>.vsix
```

---

## 🚀 Quick Start

1. Open the folder you want to clean.
2. Press **Ctrl / Cmd + Shift + P** and run  
   **"Clean Unused Imports (Whole Project)"**.
3. Watch the progress notification; cancel any time.
4. When the toast "Project clean-up complete ✅" appears, you're done!

---

## ⚙️ Configuration

File → Preferences → Settings → "Clean Unused Code" (searchable), or edit _settings.json_:

```jsonc
{
  // package.json › configuration
  "cleanUnusedImports.removeUnusedVariables": true, // delete unused let/const/var
  "cleanUnusedImports.removeUnusedFunctions": true, // delete never-called functions
  "cleanUnusedImports.removeUnusedProps": false, // delete unused React props
}
```

Toggle any of them, re-run the command, and only the enabled rules are applied.

---

## 📚 Usage Tips

• **On-demand only** by design—bind the command to a custom key if you prefer.  
• Combine with VS Code's "Format Document" on save for an all-in-one hygiene workflow.  
• Running in CI? Use `code --install-extension` followed by `code --command extension.cleanUnusedImports` inside a headless VS Code instance (via `xvfb-run` on Linux).

---

## 🙋 FAQ

**Q: Will it delete my debug prints?**  
A: No. The extension explicitly ignores `console.*` calls and `debugger` statements.

**Q: Which languages are supported?**  
A: `.js`, `.jsx`, `.ts`, and `.tsx`. Support for more languages can be added via pull request.

**Q: How does it detect unused React props?**  
A: It parses each component with the TypeScript AST and checks prop identifiers against the component body, skipping any component that uses the spread operator (`...props`).

---

Happy coding & keep your project spotless!
