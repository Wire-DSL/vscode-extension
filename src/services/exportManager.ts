import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Export format definition
 */
export interface ExportFormat {
  id: 'svg' | 'pdf' | 'png';
  label: string;
  ext: '.svg' | '.pdf' | '.png';
}

/**
 * ExportManager
 * Handles file export for Wire DSL previews
 * 
 * Supports all formats via @wire-dsl/core:
 * - SVG: Vector graphics (via renderToSVG)
 * - PDF: Document format (via exportMultipagePDF)
 * - PNG: Raster image (via exportPNG)
 */
export class ExportManager {
  /**
   * Get available export formats
   */
  static getAvailableFormats(): ExportFormat[] {
    return [
      { id: 'svg', label: 'SVG (Vector)', ext: '.svg' },
      { id: 'pdf', label: 'PDF (Document)', ext: '.pdf' },
      { id: 'png', label: 'PNG (Image)', ext: '.png' },
    ];
  }

  /**
   * Sanitize screen name for use in filename
   */
  private static sanitizeScreenName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Show export dialog and save file
   */
  static async showExportDialog(
    currentFileName: string,
    ir: any,
    layout: any,
    theme: 'light' | 'dark' = 'dark'
  ): Promise<void> {
    const availableFormats = this.getAvailableFormats();

    // Get last save directory from settings
    const config = vscode.workspace.getConfiguration('wire.export');
    const lastDir = config.get<string>('lastDirectory');

    // Determine default filename
    const baseName = currentFileName.replace(/\.wire$/, '');

    // If only one format available, skip QuickPick
    let selectedFormat: ExportFormat;

    if (this.getAvailableFormats().length === 1) {
      selectedFormat = this.getAvailableFormats()[0];
    } else {
      // Show format selection quick pick
      const formatOptions = this.getAvailableFormats().map(f => ({
        label: f.label,
        detail: `Export as ${f.id.toUpperCase()}`,
        value: f,
      }));

      const selection = await vscode.window.showQuickPick(formatOptions, {
        placeHolder: 'Select export format',
        matchOnDetail: true,
      });

      if (!selection) {
        return; // User cancelled
      }

      selectedFormat = selection.value;
    }

    // Create default filename based on selected format
    const defaultFilePath = baseName + selectedFormat.ext;
    const defaultUri = lastDir
      ? vscode.Uri.file(path.join(lastDir, defaultFilePath))
      : vscode.Uri.file(defaultFilePath);

    // Build filters: only the selected format
    const filters: Record<string, string[]> = {};
    
    if (selectedFormat.id === 'svg') {
      filters['SVG (Vector)'] = ['svg'];
    } else if (selectedFormat.id === 'pdf') {
      filters['PDF (Document)'] = ['pdf'];
    } else if (selectedFormat.id === 'png') {
      filters['PNG (Image)'] = ['png'];
    }

    // Show save dialog
    const fileUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters,
      saveLabel: 'Export',
    });

    if (!fileUri) {
      return; // User cancelled
    }

    // Show progress in status bar while exporting
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = `$(loading~spin) Exporting as ${selectedFormat.id.toUpperCase()}...`;
    statusBar.show();

    // Save file
    try {
      const filePath = String(fileUri.fsPath);
      await this.exportToFormat(selectedFormat, ir, layout, theme, filePath);

      // Remember directory
      const directory = path.dirname(filePath);
      await config.update(
        'lastDirectory',
        directory,
        vscode.ConfigurationTarget.Global
      );

      statusBar.dispose();
      vscode.window.showInformationMessage(
        `✓ Exported to ${path.basename(filePath)}`
      );
      console.log(`✓ File exported: ${filePath}`);
    } catch (error) {
      statusBar.dispose();
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Export failed: ${errorMessage}`);
      console.error('Export error:', errorMessage);
    }
  }

  /**
   * Export to specific format
   */
  private static async exportToFormat(
    format: ExportFormat,
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    switch (format.id) {
      case 'svg':
        await this.exportSVG(ir, layout, theme, filePath);
        break;
      case 'pdf':
        await this.exportPDF(ir, layout, theme, filePath);
        break;
      case 'png':
        await this.exportPNG(ir, layout, theme, filePath);
        break;
      default:
        throw new Error(`Unsupported format: ${format.id}`);
    }
  }

  /**
   * Export SVG to file using @wire-dsl/core
   * For multiple screens: exports one file per screen with sanitized names
   * For single screen: exports to the specified file
   */
  private static async exportSVG(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { SVGRenderer, exportSVG } = require('@wire-dsl/core');
      
      const screens = ir.project.screens || [];
      if (screens.length === 0) {
        throw new Error('No screens found in project');
      }

      // Get base viewport from first screen
      const baseViewport = screens[0]?.viewport ?? { width: 1280, height: 720 };

      // Single screen: export directly to filePath
      if (screens.length === 1) {
        const screen = screens[0];
        const viewport = screen.viewport ?? baseViewport;
        const width = viewport.width;
        const height = viewport.height;

        const renderer = new SVGRenderer(ir, layout, {
          width,
          height,
          theme,
          includeLabels: true,
          screenName: screen.name,
        });

        const svg = renderer.render();
        await exportSVG(svg, filePath);
        return;
      }

      // Multiple screens: export to directory with sanitized names
      const dirPath = path.dirname(filePath);
      const baseName = path.basename(filePath, '.svg');

      for (const screen of screens) {
        const viewport = screen.viewport ?? baseViewport;
        const width = viewport.width;
        const height = viewport.height;

        const renderer = new SVGRenderer(ir, layout, {
          width,
          height,
          theme,
          includeLabels: true,
          screenName: screen.name,
        });

        const svg = renderer.render();
        const sanitizedName = this.sanitizeScreenName(screen.name);
        const screenFilePath = path.join(dirPath, `${baseName}-${sanitizedName}.svg`);
        
        await exportSVG(svg, screenFilePath);
      }
    } catch (e) {
      throw new Error(`SVG export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Export PDF to file using @wire-dsl/core
   * Core API: exportMultipagePDF(svgs: Array<{svg, width, height, name}>, outputPath): Promise<void>
   * Generates one page per screen in the project
   * 
   * Uses SVGRenderer like CLI does - one renderer per screen with screenName parameter
   */
  private static async exportPDF(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { SVGRenderer, exportMultipagePDF } = require('@wire-dsl/core');
      
      // Get all screens from IR
      const screens = ir.project.screens || [];
      if (screens.length === 0) {
        throw new Error('No screens found in project');
      }

      // Get base viewport from first screen
      const baseViewport = screens[0]?.viewport ?? { width: 1280, height: 720 };

      // Render SVG for each screen using SVGRenderer (like CLI does)
      const svgs = screens.map((screen: any) => {
        const viewport = screen.viewport ?? baseViewport;
        const width = viewport.width;
        const height = viewport.height;

        // Create a renderer for this specific screen
        const renderer = new SVGRenderer(ir, layout, {
          width,
          height,
          theme,
          includeLabels: true,
          screenName: screen.name,
        });

        return {
          svg: renderer.render(),
          width,
          height,
          name: screen.name,
        };
      });

      // Resolve pdfkit fonts path so Core can find them
      const pdfkitDataPath = require.resolve('pdfkit/js/data/Helvetica.afm').replace(/Helvetica\.afm$/, '');
      process.env.PDFKIT_DATA_PATH = pdfkitDataPath;
      
      await exportMultipagePDF(svgs, filePath);
    } catch (e) {
      throw new Error(`PDF export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Export PNG to file using @wire-dsl/core
   * For multiple screens: exports one file per screen with sanitized names
   * For single screen: exports to the specified file
   */
  private static async exportPNG(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { SVGRenderer, exportPNG } = require('@wire-dsl/core');
      
      const screens = ir.project.screens || [];
      if (screens.length === 0) {
        throw new Error('No screens found in project');
      }

      // Get base viewport from first screen
      const baseViewport = screens[0]?.viewport ?? { width: 1280, height: 720 };

      // Single screen: export directly to filePath
      if (screens.length === 1) {
        const screen = screens[0];
        const viewport = screen.viewport ?? baseViewport;
        const width = viewport.width;
        const height = viewport.height;

        const renderer = new SVGRenderer(ir, layout, {
          width,
          height,
          theme,
          includeLabels: true,
          screenName: screen.name,
        });

        const svg = renderer.render();
        await exportPNG(svg, filePath, width, height);
        return;
      }

      // Multiple screens: export to directory with sanitized names
      const dirPath = path.dirname(filePath);
      const baseName = path.basename(filePath, '.png');

      for (const screen of screens) {
        const viewport = screen.viewport ?? baseViewport;
        const width = viewport.width;
        const height = viewport.height;

        const renderer = new SVGRenderer(ir, layout, {
          width,
          height,
          theme,
          includeLabels: true,
          screenName: screen.name,
        });

        const svg = renderer.render();
        const sanitizedName = this.sanitizeScreenName(screen.name);
        const screenFilePath = path.join(dirPath, `${baseName}-${sanitizedName}.png`);
        
        await exportPNG(svg, screenFilePath, width, height);
      }
    } catch (e) {
      throw new Error(`PNG export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
