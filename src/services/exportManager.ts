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
 * Supported formats:
 * - SVG: Vector graphics (via @wire-dsl/core exportSVG)
 * - PDF: Document format (via @wire-dsl/core exportMultipagePDF)
 * - PNG: Raster image (via @wire-dsl/core exportPNG)
 */
export class ExportManager {
  /**
   * Get available export formats
   * All formats are now available via @wire-dsl/core v0.1.1+
   */
  static getAvailableFormats(): ExportFormat[] {
    return [
      { id: 'svg', label: 'SVG (Vector)', ext: '.svg' },
      { id: 'pdf', label: 'PDF (Document)', ext: '.pdf' },
      { id: 'png', label: 'PNG (Image)', ext: '.png' },
    ];
  }

  /**
   * Show export dialog and save file
   * @param currentFileName The name of the .wire file being exported
   * @param ir The Intermediate Representation from @wire-dsl/core
   * @param layout The calculated layout from @wire-dsl/core
   * @param theme The current theme ('light' or 'dark')
   */
  static async showExportDialog(
    currentFileName: string,
    ir: any,
    layout: any,
    theme: 'light' | 'dark' = 'dark'
  ): Promise<void> {
    const availableFormats = this.getAvailableFormats();

    if (availableFormats.length === 0) {
      vscode.window.showErrorMessage('No export formats available');
      return;
    }

    // Get last save directory from settings
    const config = vscode.workspace.getConfiguration('wire.export');
    const lastDir = config.get<string>('lastDirectory');

    // Determine default filename
    const baseName = currentFileName.replace(/\.wire$/, '');

    // If only one format available, skip QuickPick
    let selectedFormat: ExportFormat;

    if (availableFormats.length === 1) {
      selectedFormat = availableFormats[0];
    } else {
      // Show format selection quick pick
      const formatOptions = availableFormats.map(f => ({
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

    // Show save dialog
    const fileUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: {
        [selectedFormat.label]: [selectedFormat.ext.slice(1)],
      },
      saveLabel: 'Export',
    });

    if (!fileUri) {
      return; // User cancelled
    }

    // Show progress in status bar while exporting
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBar.text = `$(loading~spin) Exporting as ${selectedFormat.id.toUpperCase()}...`;
    statusBar.show();

    // Save file based on format
    try {
      await this.exportToFormat(selectedFormat, ir, layout, theme, fileUri.fsPath);

      // Remember directory
      const directory = path.dirname(fileUri.fsPath);
      await config.update(
        'lastDirectory',
        directory,
        vscode.ConfigurationTarget.Global
      );

      statusBar.dispose();
      vscode.window.showInformationMessage(
        `✓ Exported to ${path.basename(fileUri.fsPath)}`
      );
      console.log(`✓ File exported: ${fileUri.fsPath}`);
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
   */
  private static async exportSVG(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { exportSVG } = require('@wire-dsl/core');
      const svg = await exportSVG(ir, layout, { theme });
      await fs.promises.writeFile(filePath, svg, 'utf8');
    } catch (e) {
      throw new Error(`SVG export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Export PDF to file using @wire-dsl/core
   */
  private static async exportPDF(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { exportMultipagePDF } = require('@wire-dsl/core');
      const buffer = await exportMultipagePDF(ir, layout, filePath, { theme });
      await fs.promises.writeFile(filePath, buffer);
    } catch (e) {
      throw new Error(`PDF export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Export PNG to file using @wire-dsl/core
   */
  private static async exportPNG(
    ir: any,
    layout: any,
    theme: 'light' | 'dark',
    filePath: string
  ): Promise<void> {
    try {
      const { exportPNG } = require('@wire-dsl/core');
      const buffer = await exportPNG(ir, layout, filePath, { theme });
      await fs.promises.writeFile(filePath, buffer);
    } catch (e) {
      throw new Error(`PNG export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
