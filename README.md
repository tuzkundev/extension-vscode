# Clean Unused Imports

A comprehensive VS Code extension that cleans up your codebase by removing unused imports, variables, functions, and React props across your entire workspace for JavaScript, TypeScript, JSX, and TSX files.

## Features

- **Workspace-wide cleaning**: Processes all JS/TS files in your workspace folders
- **Multiple cleanup rules**: Remove unused imports, variables, functions, and React props
- **Configurable**: Each cleanup rule can be individually enabled/disabled
- **Smart traversal**: Automatically skips common build/dependency directories (`node_modules`, `.git`, `dist`, `.next`, `out`)
- **Progress tracking**: Shows cancellable progress notification with current file and percentage
- **Selective saving**: Only saves files that were actually modified
- **Built-in integration**: Uses VS Code's native code actions and TypeScript diagnostics

## Supported File Types

- JavaScript (`.js`)
- TypeScript (`.ts`)
- JSX (`.jsx`)
- TSX (`.tsx`)

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to open a new Extension Development Host window
5. Test the extension in the new window

### From VSIX Package

1. Build the package: `npm run package`
2. Install the generated `.vsix` file: `code --install-extension clean-unused-imports-1.0.0.vsix`

## Cleanup Rules

### 1. Organize Imports (Always Active)

- Removes unused imports
- Sorts remaining imports
- Uses VS Code's built-in `source.organizeImports` action

### 2. Remove Unused Variables (Configurable)

- Detects variables declared but never read (TS6133)
- Applies TypeScript's "Remove declaration" quick-fix
- Preserves console.log and debugger statements

### 3. Remove Unused Functions (Configurable)

- Detects top-level or exported functions never referenced (TS6192, TS6196)
- Applies TypeScript's quick-fix actions
- Preserves console.log and debugger statements

### 4. Remove Unused React Props (Configurable)

- Analyzes React function components for unused props
- Removes unused props from destructured parameters
- Skips components using spread operator (...props)
- Basic implementation for common patterns

## Configuration

Configure which cleanup rules are active in VS Code settings:

```json
{
  "cleanUnusedImports.removeUnusedVariables": true,
  "cleanUnusedImports.removeUnusedFunctions": true,
  "cleanUnusedImports.removeUnusedProps": true
}
```

Or use the VS Code Settings UI:

1. Open Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Clean Unused Imports"
3. Toggle individual cleanup rules on/off

## Usage

1. Open a workspace containing JavaScript/TypeScript files
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Search for "Clean Unused Imports (Whole Project)"
4. Execute the command
5. Monitor progress in the notification
6. Cancel anytime if needed

The extension will:

- Read your configuration settings
- Recursively find all supported files in your workspace
- Apply enabled cleanup rules to each file
- Show progress with current file path and percentage
- Display a summary of modified files when complete

## Development

### Prerequisites

- Node.js 18.x or later
- VS Code 1.86.0 or later

### Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing

1. Press `F5` to launch Extension Development Host
2. Open a test workspace with JS/TS files
3. Run the "Clean Unused Imports (Whole Project)" command
4. Verify the extension works as expected

### Building

```bash
# Compile for production
npm run compile

# Create VSIX package
npm run package
```

## Publishing

1. Install vsce: `npm install -g @vscode/vsce`
2. Update publisher name in `package.json`
3. Create package: `npm run package`
4. Publish: `vsce publish`

## Advanced Configuration

The extension works out of the box with default settings enabled. It uses VS Code's built-in TypeScript/JavaScript language services and diagnostics for code analysis.

### Excluded Directories

The following directories are automatically skipped during traversal:

- `node_modules`
- `.git`
- `dist`
- `.next`
- `out`
- `.vscode`
- `coverage`
- `build`
- `.nyc_output`

## Requirements

- VS Code 1.86.0 or later
- TypeScript/JavaScript language support enabled

## Known Issues

- The extension relies on VS Code's built-in TypeScript diagnostics and code actions, so results may vary based on your TypeScript/JavaScript configuration
- React props removal is a basic implementation that handles common patterns but may not cover all edge cases
- Very large workspaces may take some time to process
- Console.log and debugger statements are preserved and will not be removed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### 1.0.0

- Initial release with comprehensive cleanup features
- Support for JS, TS, JSX, TSX files
- Workspace-wide cleaning with multiple rules:
  - Organize imports (always active)
  - Remove unused variables (TS6133)
  - Remove unused functions (TS6192, TS6196)
  - Remove unused React props (basic implementation)
- Configurable cleanup rules via VS Code settings
- Progress tracking with cancellation support
- Smart directory exclusion
- Preserves console.log and debugger statements
