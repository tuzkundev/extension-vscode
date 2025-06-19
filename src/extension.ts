import * as vscode from 'vscode';
import * as path from 'path';
import {
  getCleanupConfig,
  applyCodeActionsForDiagnostics,
  removeUnusedReactProps,
} from './astUtils';

/**
 * Supported file extensions for cleaning unused imports
 */
const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Directories to skip during traversal
 */
const SKIP_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  '.next',
  'out',
  '.vscode',
  'coverage',
  'build',
  '.nyc_output',
];

/**
 * Interface for tracking progress during the cleaning operation
 */
interface CleanProgress {
  totalFiles: number;
  processedFiles: number;
  modifiedFiles: number;
  currentFile: string;
}

/**
 * Recursively finds all supported files in the workspace folders
 */
async function findSupportedFiles(): Promise<vscode.Uri[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return [];
  }

  const allFiles: vscode.Uri[] = [];

  for (const folder of workspaceFolders) {
    const files = await findFilesInFolder(folder.uri);
    allFiles.push(...files);
  }

  return allFiles;
}

/**
 * Recursively finds supported files in a specific folder
 */
async function findFilesInFolder(folderUri: vscode.Uri): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];

  try {
    const entries = await vscode.workspace.fs.readDirectory(folderUri);

    for (const [name, type] of entries) {
      // Skip hidden files and excluded directories
      if (name.startsWith('.') && !name.endsWith('.js') && !name.endsWith('.ts')) {
        continue;
      }

      if (SKIP_DIRECTORIES.includes(name)) {
        continue;
      }

      const entryUri = vscode.Uri.joinPath(folderUri, name);

      if (type === vscode.FileType.Directory) {
        // Recursively search subdirectories
        const subFiles = await findFilesInFolder(entryUri);
        files.push(...subFiles);
      } else if (type === vscode.FileType.File) {
        // Check if file has supported extension
        const ext = path.extname(name);
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(entryUri);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${folderUri.fsPath}:`, error);
  }

  return files;
}

/**
 * Applies all cleanup rules to a file based on user configuration
 */
async function cleanupFile(fileUri: vscode.Uri): Promise<boolean> {
  try {
    // Get user configuration
    const config = getCleanupConfig();

    // Open the document
    const document = await vscode.workspace.openTextDocument(fileUri);
    let wasModified = false;

    // 1. Always apply organize imports (legacy behavior)
    const organizeImportsModified = await organizeImportsForFile(fileUri);
    if (organizeImportsModified) {
      wasModified = true;
    }

    // 2. Remove unused variables (TS6133)
    if (config.removeUnusedVariables) {
      const unusedVarsModified = await applyCodeActionsForDiagnostics(fileUri, [6133]);
      if (unusedVarsModified) {
        wasModified = true;
      }
    }

    // 3. Remove unused functions (TS6192, TS6196)
    if (config.removeUnusedFunctions) {
      const unusedFuncsModified = await applyCodeActionsForDiagnostics(fileUri, [6192, 6196]);
      if (unusedFuncsModified) {
        wasModified = true;
      }
    }

    // 4. Remove unused React props
    if (config.removeUnusedProps) {
      const unusedPropsModified = await removeUnusedReactProps(fileUri);
      if (unusedPropsModified) {
        wasModified = true;
      }
    }

    // Save the document if it was modified
    if (wasModified && document.isDirty) {
      await document.save();
    }

    return wasModified;
  } catch (error) {
    console.error(`Error cleaning up file ${fileUri.fsPath}:`, error);
    return false;
  }
}

/**
 * Applies organize imports code action to a file (legacy function)
 */
async function organizeImportsForFile(fileUri: vscode.Uri): Promise<boolean> {
  try {
    // Open the document
    const document = await vscode.workspace.openTextDocument(fileUri);
    const originalContent = document.getText();

    // Get organize imports code actions
    const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      'vscode.executeCodeActionProvider',
      fileUri,
      new vscode.Range(0, 0, document.lineCount, 0),
      vscode.CodeActionKind.SourceOrganizeImports
    );

    if (!codeActions || codeActions.length === 0) {
      return false;
    }

    // Find the organize imports action
    const organizeImportsAction = codeActions.find(
      (action) =>
        action.kind?.value === 'source.organizeImports' ||
        action.title.toLowerCase().includes('organize imports')
    );

    if (!organizeImportsAction) {
      return false;
    }

    // Apply the code action
    if (organizeImportsAction.edit) {
      await vscode.workspace.applyEdit(organizeImportsAction.edit);
    } else if (organizeImportsAction.command) {
      await vscode.commands.executeCommand(
        organizeImportsAction.command.command,
        ...(organizeImportsAction.command.arguments || [])
      );
    }

    // Check if the document was modified
    const newContent = document.getText();
    const wasModified = originalContent !== newContent;

    return wasModified;
  } catch (error) {
    console.error(`Error organizing imports for ${fileUri.fsPath}:`, error);
    return false;
  }
}

/**
 * Main command to clean unused imports and other code across the entire workspace
 */
async function cleanUnusedImports(): Promise<void> {
  // Check if workspace is open
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder is open.');
    return;
  }

  // Find all supported files
  const files = await findSupportedFiles();

  if (files.length === 0) {
    vscode.window.showInformationMessage('No JavaScript/TypeScript files found in the workspace.');
    return;
  }

  // Initialize progress tracking
  const progress: CleanProgress = {
    totalFiles: files.length,
    processedFiles: 0,
    modifiedFiles: 0,
    currentFile: '',
  };

  // Show progress notification
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Cleaning project code',
      cancellable: true,
    },
    async (progressReporter, token) => {
      for (const file of files) {
        // Check for cancellation
        if (token.isCancellationRequested) {
          vscode.window.showInformationMessage('Project cleanup was cancelled.');
          return;
        }

        // Update progress
        progress.currentFile = path.relative(
          vscode.workspace.workspaceFolders![0].uri.fsPath,
          file.fsPath
        );
        progress.processedFiles++;

        const percentage = Math.round((progress.processedFiles / progress.totalFiles) * 100);
        progressReporter.report({
          increment: 100 / progress.totalFiles,
          message: `${percentage}% - ${progress.currentFile}`,
        });

        // Apply all cleanup rules to the current file
        const wasModified = await cleanupFile(file);
        if (wasModified) {
          progress.modifiedFiles++;
        }

        // Small delay to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Show completion message
      const message = `Project clean-up complete ✅ (${progress.modifiedFiles} files modified out of ${progress.totalFiles} processed)`;
      vscode.window.showInformationMessage(message);
    }
  );
}

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Clean Unused Imports extension is now active!');

  // Register the clean unused imports command
  const disposable = vscode.commands.registerCommand(
    'extension.cleanUnusedImports',
    cleanUnusedImports
  );

  context.subscriptions.push(disposable);
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  console.log('Clean Unused Imports extension is now deactivated.');
}
