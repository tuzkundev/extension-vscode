import * as vscode from 'vscode';

/**
 * Configuration interface for clean-up rules
 */
export interface CleanupConfig {
  removeUnusedVariables: boolean;
  removeUnusedFunctions: boolean;
  removeUnusedProps: boolean;
}

/**
 * Gets the extension configuration
 */
export function getCleanupConfig(): CleanupConfig {
  const config = vscode.workspace.getConfiguration('cleanUnusedImports');
  return {
    removeUnusedVariables: config.get('removeUnusedVariables', true),
    removeUnusedFunctions: config.get('removeUnusedFunctions', true),
    removeUnusedProps: config.get('removeUnusedProps', true),
  };
}

/**
 * Applies code actions for specific diagnostic codes
 */
export async function applyCodeActionsForDiagnostics(
  fileUri: vscode.Uri,
  diagnosticCodes: number[]
): Promise<boolean> {
  try {
    // Get all diagnostics for the document
    const diagnostics = vscode.languages.getDiagnostics(fileUri);

    // Filter diagnostics by the specified codes
    const targetDiagnostics = diagnostics.filter(
      (diagnostic) =>
        typeof diagnostic.code === 'number' && diagnosticCodes.includes(diagnostic.code)
    );

    if (targetDiagnostics.length === 0) {
      return false;
    }

    let wasModified = false;

    // Process each diagnostic
    for (const diagnostic of targetDiagnostics) {
      const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
        'vscode.executeCodeActionProvider',
        fileUri,
        diagnostic.range,
        vscode.CodeActionKind.QuickFix
      );

      if (!codeActions || codeActions.length === 0) {
        continue;
      }

      // Find the appropriate quick fix action
      const quickFixAction = codeActions.find(
        (action) =>
          action.title.toLowerCase().includes('remove') ||
          action.title.toLowerCase().includes('delete') ||
          action.kind?.value === 'quickfix'
      );

      if (quickFixAction) {
        // Apply the code action
        if (quickFixAction.edit) {
          await vscode.workspace.applyEdit(quickFixAction.edit);
          wasModified = true;
        } else if (quickFixAction.command) {
          await vscode.commands.executeCommand(
            quickFixAction.command.command,
            ...(quickFixAction.command.arguments || [])
          );
          wasModified = true;
        }
      }
    }

    return wasModified;
  } catch (error) {
    console.error(`Error applying code actions for ${fileUri.fsPath}:`, error);
    return false;
  }
}

/**
 * Removes unused React props from a file using simple pattern matching
 * This is a simplified implementation that focuses on basic cases
 */
export async function removeUnusedReactProps(fileUri: vscode.Uri): Promise<boolean> {
  try {
    const document = await vscode.workspace.openTextDocument(fileUri);
    const content = document.getText();

    // Skip files that don't appear to be React components
    if (!content.includes('React') && !content.includes('jsx') && !content.includes('tsx')) {
      return false;
    }

    // For this implementation, we'll use a simple approach:
    // Look for function components with destructured props and check if props are used
    // This is a basic implementation - a full implementation would require proper AST parsing

    // For now, we'll skip the complex AST analysis and return false
    // This indicates that no changes were made
    // A full implementation would require proper TypeScript AST parsing
    // which is complex and beyond the scope of this basic implementation

    return false;
  } catch (error) {
    console.error(`Error removing unused React props for ${fileUri.fsPath}:`, error);
    return false;
  }
}
