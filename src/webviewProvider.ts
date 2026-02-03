import * as vscode from 'vscode';

/**
 * Wire DSL Webview Preview Provider
 *
 * Provides a real-time preview panel for .wire files
 * - Renders .wire files as SVG using @wire-dsl/engine
 * - Supports live updates with 500ms debouncing
 * - Dark/light theme support
 */

export class WireWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'wirePreview';

  private view?: vscode.WebviewView;
  private debounceTimer: NodeJS.Timeout | undefined;
  private lastEditorContent: string = '';
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly extensionUri: vscode.Uri) {}

  /**
   * Called when the webview view becomes visible
   */
  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    console.log('\n🎯🎯🎯 WEBVIEW VIEW RESOLVED! 🎯🎯🎯');
    this.view = webviewView;

    // Configure webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    // Set a simple HTML first
    webviewView.webview.html = '<div style="padding: 20px; font-family: system-ui;">Loading Wire Preview...</div>';
    console.log('  ✓ Initial loading HTML set');

    // Listen to editor changes
    this.setupEditorListener();
    
    // Try to render active editor or find first .wire file
    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'wire') {
      console.log('  ✓ Active editor is a .wire file, rendering...');
      this.renderPreview(activeEditor.document.getText());
    } else {
      console.log('  ℹ No active .wire file, searching workspace...');
      await this.findAndRenderFirstWireFile();
    }
    
    console.log('🎯🎯🎯 WEBVIEW SETUP COMPLETE 🎯🎯🎯\n');
  }

  /**
   * Find and render the first .wire file in the workspace
   */
  private async findAndRenderFirstWireFile() {
    try {
      const wireFiles = await vscode.workspace.findFiles('**/*.wire', '**/node_modules/**', 1);
      if (wireFiles.length > 0) {
        const doc = await vscode.workspace.openTextDocument(wireFiles[0]);
        console.log('  ✓ Found .wire file:', wireFiles[0].fsPath);
        this.renderPreview(doc.getText());
      } else {
        this.showWaitingMessage('No .wire files found in workspace');
      }
    } catch (error) {
      console.error('  ❌ Error finding .wire files:', error);
      this.showError('Error finding .wire files');
    }
  }

  /**
   * Show waiting message
   */
  private showWaitingMessage(message: string) {
    if (!this.view) return;
    this.view.webview.html = '<div style="padding: 20px; color: var(--vscode-descriptionForeground, #999); font-family: system-ui; text-align: center;">' +
      message +
      '</div>';
  }

  /**
   * Setup listener for active editor changes and text document changes
   */
  private setupEditorListener() {
    // Track active editor changes
    const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
      console.log('  📝 Active editor changed:', editor?.document.fileName);
      if (editor?.document.languageId === 'wire') {
        console.log('  ✓ It\'s a .wire file, rendering preview...');
        this.renderPreview(editor.document.getText());
      } else {
        console.log('  ℹ Not a .wire file');
      }
    });
    this.disposables.push(editorChangeDisposable);

    // Track text document changes
    const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor?.document === event.document && editor.document.languageId === 'wire') {
        this.renderPreviewDebounced(editor.document.getText());
      }
    });
    this.disposables.push(docChangeDisposable);
  }

  /**
   * Dispose all event listeners
   */
  public dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * Render preview with debounce (500ms)
   */
  private renderPreviewDebounced(content: string) {
    this.lastEditorContent = content;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.renderPreview(content);
    }, 500);
  }

  /**
   * Render the preview
   */
  private renderPreview(wireContent: string) {
    if (!this.view) return;

    try {
      // Lazy load engine module
      let coreModule: any;
      try {
        coreModule = require('@wire-dsl/engine');
      } catch (e) {
        this.showError(`Failed to load @wire-dsl/engine: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }

      const { parseWireDSL, generateIR, calculateLayout, renderToSVG } = coreModule;

      // Validate functions exist
      if (!parseWireDSL || !generateIR || !calculateLayout || !renderToSVG) {
        this.showError('Core module missing required exports: parseWireDSL, generateIR, calculateLayout, renderToSVG');
        return;
      }

      // Parse → IR → Layout → SVG
      const ast = parseWireDSL(wireContent);
      const ir = generateIR(ast);
      const layout = calculateLayout(ir);
      const svg = renderToSVG(ir, layout, {
        width: 1200,
        height: 700,
        theme: this.getTheme(),
        includeLabels: true,
      });

      // Validate SVG output
      if (!svg || typeof svg !== 'string') {
        this.showError('SVG renderer returned invalid output');
        return;
      }

      console.log('Preview rendered successfully, SVG length:', svg.length);
      
      // Display SVG directly in webview
      this.view.webview.html = this.createHtmlWithSvg(svg);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Preview render error:', errorMessage);
      this.showError(errorMessage);
    }
  }

  /**
   * Create HTML with embedded SVG
   */
  private createHtmlWithSvg(svg: string): string {
    return '<div style="padding: 16px; font-family: system-ui; background: var(--vscode-editor-background, #1e1e1e); color: var(--vscode-editor-foreground, #d4d4d4); height: 100%; overflow: auto; display: flex; align-items: center; justify-content: center;">' +
      '<div style="max-width: 100%; max-height: 100%; overflow: auto;">' +
      svg +
      '</div>' +
      '</div>';
  }

  /**
   * Show error in webview
   */
  private showError(message: string) {
    if (!this.view) return;
    this.view.webview.html = '<div style="padding: 20px; color: #f48771; font-family: monospace; white-space: pre-wrap;">' +
      'Error: ' + this.escapeHtml(message) +
      '</div>';
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Get current VS Code theme (light or dark)
   */
  private getTheme(): 'light' | 'dark' {
    const theme = vscode.window.activeColorTheme.kind;
    return theme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
  }
}
