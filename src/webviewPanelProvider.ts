import * as vscode from 'vscode';
import { ExportManager } from './services/exportManager';

/**
 * Wire DSL Preview Panel
 * Opens a WebviewPanel (like Markdown preview) to render .wire files
 */
export class WirePreviewPanel {
  public static currentPanel: WirePreviewPanel | undefined;
  private static coreModule: any = null; // Cache del módulo
  
  public readonly viewType = 'wire-preview';
  private panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private debounceTimer: NodeJS.Timeout | undefined;
  private currentTheme: 'light' | 'dark' = 'dark';
  private lastContent: string = '';
  private availableScreens: string[] = [];
  private selectedScreen: string = '';
  private lastIR: any = null; // Store IR for export
  private lastLayout: any = null; // Store layout for export
  private currentFilePath: string = ''; // Store current file path
    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    const config = vscode.workspace.getConfiguration('wire.preview');
    const themeSetting = config.get('defaultTheme') as string || 'default';
    this.currentTheme = themeSetting === 'default' ? this.getTheme() : (themeSetting as 'light' | 'dark');

    // Configure webview
    this.panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [extensionUri],
    };

    // Listen for messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'setTheme') {
          this.currentTheme = message.theme;
          // Rerendorizar con el contenido guardado sin necesidad de cambiar de archivo
          if (this.lastContent) {
            this.updatePreview(this.lastContent);
          }
        } else if (message.command === 'selectScreen') {
          this.selectedScreen = message.screen;
          // Rerendorizar con la pantalla seleccionada
          if (this.lastContent) {
            this.updatePreview(this.lastContent);
          }
        } else if (message.command === 'export') {
          // Handle export request
          this.handleExportMessage(message);
        }
      },
      null,
      this.disposables
    );

    // Listen for when the panel is disposed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Update when active editor changes
    const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.languageId === 'wire') {
        this.updatePreview(editor.document.getText());
      }
    });
    this.disposables.push(editorChangeDisposable);

    // Update when document changes
    const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor?.document === event.document && editor.document.languageId === 'wire') {
        this.updatePreviewDebounced(editor.document.getText());
      }
    });
    this.disposables.push(docChangeDisposable);
  }

  public static async openPreview(extensionUri: vscode.Uri) {
    if (WirePreviewPanel.currentPanel) {
      WirePreviewPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'wire-preview',
      'Wire Preview',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true,
      }
    );

    WirePreviewPanel.currentPanel = new WirePreviewPanel(panel, extensionUri);

    // Show loading state immediately
    WirePreviewPanel.currentPanel.showLoading();

    // Render initial content if there's an active .wire file
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'wire') {
      WirePreviewPanel.currentPanel.updatePreview(activeEditor.document.getText());
    } else {
      WirePreviewPanel.currentPanel.showWaitingMessage('Open a .wire file to preview');
    }
  }

  private showLoading() {
    this.panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-descriptionForeground);
      font-family: system-ui;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid var(--vscode-descriptionForeground);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 10px;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
<div><span class="spinner"></span>Rendering preview...</div>
</body>
</html>`;
  }

  private updatePreview(content: string) {
    console.log('Updating preview...');
    this.lastContent = content; // Guardar el contenido para cambios de tema
    
    // Save current file path
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'wire') {
      this.currentFilePath = activeEditor.document.fileName;
    }
    
    try {
      // Load core module once and cache it
      if (!WirePreviewPanel.coreModule) {
        try {
          WirePreviewPanel.coreModule = require('@wire-dsl/core');
          console.log('Core module loaded and cached');
        } catch (e) {
          this.showError(`Failed to load @wire-dsl/core: ${e instanceof Error ? e.message : String(e)}`);
          return;
        }
      }

      const { parseWireDSL, generateIR, calculateLayout, renderToSVG } = WirePreviewPanel.coreModule;

      if (!parseWireDSL || !generateIR || !calculateLayout || !renderToSVG) {
        this.showError('Core module missing required exports');
        return;
      }

      // Parse → IR → Layout → SVG
      const ast = parseWireDSL(content);
      const ir = generateIR(ast);
      
      // Store IR and layout for export
      this.lastIR = ir;
      
      // Extraer nombres de las screens del IR
      let screens: string[] = [];
      
      // La estructura es ir.project.screens
      if (ir && ir.project && ir.project.screens && Array.isArray(ir.project.screens)) {
        screens = ir.project.screens.map((s: any) => s.name || 'Unknown');
        console.log('Found screens:', screens);
      } else {
        console.log('Could not find screens in ir.project.screens');
      }
      
      this.availableScreens = screens;
      
      // Inicializar selectedScreen si no existe
      if (!this.selectedScreen && screens.length > 0) {
        this.selectedScreen = screens[0];
      }
      
      const layout = calculateLayout(ir);
      // Store layout for export
      this.lastLayout = layout;
      
      let svg = renderToSVG(ir, layout, {
        width: 1300,
        height: 700,
        theme: this.currentTheme,
        includeLabels: true,
        screenName: this.selectedScreen, // Pasar el nombre de la pantalla seleccionada
      });

      if (!svg || typeof svg !== 'string') {
        this.showError('SVG renderer returned invalid output');
        return;
      }

      // Asegurar que el SVG tenga width y height explícitos
      if (!svg.includes('width=') || !svg.includes('height=')) {
        svg = svg.replace(
          /<svg([^>]*?)>/,
          '<svg$1 width="1300" height="700">'
        );
      }

      console.log('Preview rendered successfully, SVG size:', svg.length);
      this.panel.webview.html = this.createHtmlWithSvg(svg, screens, this.selectedScreen);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Preview render error:', msg);
      this.showError(msg);
    }
  }

  private updatePreviewDebounced(content: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.updatePreview(content);
    }, 300); // Reduced from 500ms
  }

  private createHtmlWithSvg(svg: string, screens: string[] = [], selectedScreen: string = ''): string {
    const screensHtml = screens.length > 1 ? `
    <select id="screenSelector">
      ${screens.map(screen => `<option value="${screen}" ${screen === selectedScreen ? 'selected' : ''}>${screen}</option>`).join('\n      ')}
    </select>
    <div class="separator"></div>` : '';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: system-ui;
      overflow: hidden;
    }
    body {
      display: flex;
      flex-direction: column;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-editorGroup-border);
      align-items: center;
      flex-shrink: 0;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background 0.2s;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button:active {
      opacity: 0.8;
    }
    select {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      font-family: system-ui;
    }
    select:hover {
      border-color: var(--vscode-focusBorder);
    }
    .zoom-display {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      min-width: 45px;
      text-align: center;
    }
    .separator {
      width: 1px;
      height: 20px;
      background: var(--vscode-editorGroup-border);
    }
    #preview {
      flex: 1;
      overflow: auto;
      padding: 20px;
      display: grid;
      place-items: center;
    }
    #preview svg {
      display: block;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    ${screensHtml}
    <button id="zoomIn">Zoom In</button>
    <button id="zoomOut">Zoom Out</button>
    <button id="reset">Reset</button>
    <div class="separator"></div>
    <div class="zoom-display"><span id="zoomLevel">100</span>%</div>
    <div class="separator"></div>
    <button id="exportBtn" title="Export Screen">Export Screen</button>
    <div class="separator"></div>
    <button id="toggleTheme" title="Toggle Dark/Light Mode">Theme</button>
  </div>
  <div id="preview">
    ${svg}
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const INITIAL_THEME = '${this.currentTheme}'; // Passed from extension
    
    const svg = document.querySelector('#preview svg');
    const preview = document.getElementById('preview');
    const zoomDisplay = document.getElementById('zoomLevel');
    const toggleThemeBtn = document.getElementById('toggleTheme');
    const screenSelector = document.getElementById('screenSelector');
    
    // Config
    const ORIGINAL_WIDTH = parseFloat(svg.getAttribute('width')) || 1300;
    const ORIGINAL_HEIGHT = parseFloat(svg.getAttribute('height')) || 700;
    const ZOOM_STEP = 0.1;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 3;
    
    // Restaurar estado previo
    const previousState = vscode.getState() || {};
    let currentZoom = previousState.zoomLevel || 1;
    // Use INITIAL_THEME from extension, fallback to previousState, then default to dark
    let isDarkMode = INITIAL_THEME === 'dark' ? true : (INITIAL_THEME === 'light' ? false : (previousState.isDarkMode !== undefined ? previousState.isDarkMode : true));
    
    // Calcular zoom para que quepa en pantalla
    function calculateFitZoom() {
      const padding = 40;
      const availWidth = preview.clientWidth - padding;
      const availHeight = preview.clientHeight - padding;
      const fit = Math.min(availWidth / ORIGINAL_WIDTH, availHeight / ORIGINAL_HEIGHT);
      return Math.min(fit, 1);
    }
    
    const fitZoom = calculateFitZoom();
    
    // Si no había estado previo, usar fit zoom
    if (!previousState.zoomLevel) {
      currentZoom = fitZoom;
    }

    function updateZoom() {
      const scale = currentZoom;
      const newWidth = ORIGINAL_WIDTH * scale;
      const newHeight = ORIGINAL_HEIGHT * scale;
      
      svg.style.width = newWidth + 'px';
      svg.style.height = newHeight + 'px';
      
      zoomDisplay.textContent = Math.round(scale * 100);
      
      // Guardar estado
      vscode.setState({
        zoomLevel: currentZoom,
        isDarkMode: isDarkMode
      });
      
      // Centrar el scroll al 50% cuando hay overflow
      setTimeout(() => {
        const scrollX = (preview.scrollWidth - preview.clientWidth) / 2;
        const scrollY = (preview.scrollHeight - preview.clientHeight) / 2;
        preview.scrollLeft = Math.max(0, scrollX);
        preview.scrollTop = Math.max(0, scrollY);
      }, 0);
    }

    function toggleTheme() {
      isDarkMode = !isDarkMode;
      const newTheme = isDarkMode ? 'dark' : 'light';
      
      if (isDarkMode) {
        toggleThemeBtn.textContent = 'Dark';
        toggleThemeBtn.title = 'Switch to Light Mode';
      } else {
        toggleThemeBtn.textContent = 'Light';
        toggleThemeBtn.title = 'Switch to Dark Mode';
      }
      
      // Guardar estado
      vscode.setState({
        zoomLevel: currentZoom,
        isDarkMode: isDarkMode
      });
      
      vscode.postMessage({
        command: 'setTheme',
        theme: newTheme
      });
    }

    document.getElementById('zoomIn').addEventListener('click', () => {
      currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
      updateZoom();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
      currentZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP);
      updateZoom();
    });

    document.getElementById('reset').addEventListener('click', () => {
      currentZoom = fitZoom;
      updateZoom();
    });

    toggleThemeBtn.addEventListener('click', toggleTheme);

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const svgElement = document.querySelector('#preview svg');
        if (svgElement) {
          vscode.postMessage({
            command: 'export',
            svg: svgElement.outerHTML
          });
        } else {
          console.error('No SVG found to export');
        }
      });
    }

    // Screen selector
    if (screenSelector) {
      screenSelector.addEventListener('change', (e) => {
        vscode.postMessage({
          command: 'selectScreen',
          screen: e.target.value
        });
      });
    }

    // Ctrl/Cmd + scroll para zoom
    preview.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1;
        currentZoom = Math.max(MIN_ZOOM, Math.min(currentZoom + (ZOOM_STEP * direction), MAX_ZOOM));
        updateZoom();
      }
    });

    // Aplicar tema guardado (actualizar botón si es light mode)
    if (!isDarkMode) {
      toggleThemeBtn.textContent = 'Light';
      toggleThemeBtn.title = 'Switch to Dark Mode';
    }

    updateZoom();
  </script>
</body>
</html>`;
  }

  private showError(message: string) {
    this.panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-errorForeground);
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
Error: ${this.escapeHtml(message)}
</body>
</html>`;
  }

  private showWaitingMessage(message: string) {
    this.panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-descriptionForeground);
      font-family: system-ui;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
  </style>
</head>
<body>
${message}
</body>
</html>`;
  }

  private getTheme(): 'light' | 'dark' {
    const theme = vscode.window.activeColorTheme.kind;
    return theme === vscode.ColorThemeKind.Light ? 'light' : 'dark';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Handle export message from webview
   */
  private async handleExportMessage(message: any): Promise<void> {
    // Delegate to the exportAs method which handles everything correctly
    await this.exportAs();
  }

  /**
   * Export the current preview
   * Exports only the currently selected screen as a single file
   */
  public async exportAs(): Promise<void> {
    try {
      if (!this.lastIR || !this.lastLayout) {
        vscode.window.showErrorMessage('No preview content available to export');
        return;
      }

      // Get filename from current file or use default
      let fileName = 'export.wire';
      if (this.currentFilePath) {
        fileName = this.currentFilePath.split(/[\\/]/).pop() || 'export.wire';
      }

      // Create a filtered IR with only the selected screen
      const screenToExport = this.lastIR.project.screens.find(
        (s: any) => s.name === this.selectedScreen
      );

      if (!screenToExport) {
        vscode.window.showErrorMessage('Selected screen not found');
        return;
      }

      // Create filtered IR with only the selected screen
      const filteredIR = {
        ...this.lastIR,
        project: {
          ...this.lastIR.project,
          screens: [screenToExport],
        },
      };

      await ExportManager.showExportDialog(
        fileName,
        filteredIR,
        this.lastLayout,
        this.currentTheme
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Export failed: ${errorMessage}`);
      console.error('Export error:', errorMessage);
    }
  }

  public dispose() {
    WirePreviewPanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

