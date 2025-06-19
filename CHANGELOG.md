# Change Log

All notable changes to the "clean-unused-imports" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-19

### Added
- Initial release of Clean Unused Imports extension
- Support for JavaScript (.js), TypeScript (.ts), JSX (.jsx), and TSX (.tsx) files
- Workspace-wide import cleaning functionality
- Command "Clean Unused Imports (Whole Project)" available in Command Palette
- Progress notification with cancellation support
- Smart directory exclusion (node_modules, .git, dist, .next, out, etc.)
- Automatic file saving only when modifications are made
- Integration with VS Code's built-in `source.organizeImports` code action
- Comprehensive documentation and development setup

### Features
- Recursive traversal of workspace folders
- Real-time progress tracking with file path and percentage
- Cancellable operation
- Summary notification showing number of files processed and modified
- Respects VS Code's TypeScript/JavaScript language configuration

### Technical Details
- Built with TypeScript
- Compatible with VS Code 1.86.0 and later
- Uses VS Code Extension API
- Includes ESLint and Prettier configuration
- Comprehensive build and development scripts
