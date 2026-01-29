import * as vscode from 'vscode';
import { WireCompletionProvider } from './completionProvider';
import { WireHoverProvider } from './hoverProvider';
import { WireDefinitionProvider } from './definitionProvider';
import { WireReferenceProvider } from './referenceProvider';
import { WirePreviewPanel } from './webviewPanelProvider';
import { ExportManager } from './services/exportManager';
import { ParseService } from './services/parseService';

export function activate(context: vscode.ExtensionContext) {
  console.log('🔥 Wire DSL extension activated');
  console.log('Extension URI:', context.extensionUri.fsPath);

  // Define document selector with scheme
  const selector: vscode.DocumentSelector = { language: 'wire', scheme: 'file' };

  // Register Completion Provider
  const completionProvider = new WireCompletionProvider();
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    selector,
    completionProvider,
    ' ', // Trigger on space
    '(', // Trigger on opening paren
    ':', // Trigger on colon
    '{' // Trigger on opening brace
  );
  context.subscriptions.push(completionDisposable);

  // Register Hover Provider
  const hoverProvider = new WireHoverProvider();
  const hoverDisposable = vscode.languages.registerHoverProvider(selector, hoverProvider);
  context.subscriptions.push(hoverDisposable);

  // Register Definition Provider (Go-to-Definition)
  const definitionProvider = new WireDefinitionProvider();
  const definitionDisposable = vscode.languages.registerDefinitionProvider(
    selector,
    definitionProvider
  );
  context.subscriptions.push(definitionDisposable);

  // Register Reference Provider (Go-to-References)
  const referenceProvider = new WireReferenceProvider();
  const referenceDisposable = vscode.languages.registerReferenceProvider(
    selector,
    referenceProvider
  );
  context.subscriptions.push(referenceDisposable);

  // Register Preview Panel Command
  console.log('\n=== PREVIEW PANEL REGISTRATION START ===');
  const previewCommand = vscode.commands.registerCommand(
    'wire.openPreview',
    () => {
      console.log('✓ Wire preview command triggered');
      WirePreviewPanel.openPreview(context.extensionUri);
    }
  );
  context.subscriptions.push(previewCommand);
  console.log('✓ Preview command registered: wire.openPreview');
  console.log('=== PREVIEW PANEL REGISTRATION END ===\n');

  // Register Export Command
  console.log('\n=== EXPORT COMMAND REGISTRATION START ===');
  const exportCommand = vscode.commands.registerCommand(
    'wire.exportAs',
    async () => {
      console.log('✓ Wire export command triggered');
      const activeEditor = vscode.window.activeTextEditor;
      
      if (!activeEditor || activeEditor.document.languageId !== 'wire') {
        vscode.window.showErrorMessage('No active Wire DSL file');
        return;
      }

      try {
        // Parse the active document
        const parseResult = await ParseService.parseDocument(activeEditor.document);
        
        // Get filename for export
        const fileName = activeEditor.document.fileName.split(/[\\/]/).pop() || 'export.wire';

        // Get current theme from VS Code settings
        const config = vscode.workspace.getConfiguration('wire.preview');
        let theme: 'light' | 'dark' = 'dark';
        
        const defaultThemeSetting = config.get<string>('defaultTheme');
        if (defaultThemeSetting === 'light') {
          theme = 'light';
        } else if (defaultThemeSetting === 'dark') {
          theme = 'dark';
        } else if (defaultThemeSetting === 'default') {
          // Detect from VS Code theme
          const colorTheme = vscode.window.activeColorTheme.kind;
          theme = colorTheme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
        }

        // Show export dialog with parsed data
        await ExportManager.showExportDialog(
          fileName,
          parseResult.ir,
          parseResult.layout,
          theme
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Export failed: ${errorMessage}`);
        console.error('Export error:', errorMessage);
      }
    }
  );
  context.subscriptions.push(exportCommand);
  console.log('✓ Export command registered: wire.exportAs');
  console.log('=== EXPORT COMMAND REGISTRATION END ===\n');
}

export function deactivate() {
  console.log('Wire DSL extension deactivated');
}
