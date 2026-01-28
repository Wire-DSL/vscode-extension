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
 * Current Phase: SVG only
 * Future Phase: PDF and PNG (when Core implements exporters)
 */
export class ExportManager {
  /**
   * Get available export formats
   * Currently only SVG is available
   * PDF and PNG will be added when @wire-dsl/core implements PDFExporter and PNGExporter
   */
  static getAvailableFormats(): ExportFormat[] {
    return [
      { id: 'svg', label: 'SVG (Vector)', ext: '.svg' },
      // { id: 'pdf', label: 'PDF (Document)', ext: '.pdf' },  // Phase 2: When Core implements
      // { id: 'png', label: 'PNG (Image)', ext: '.png' },    // Phase 2: When Core implements
    ];
  }

  /**
   * Show export dialog and save file
   * @param currentFileName The name of the .wire file being exported
   * @param svg The SVG string to export
   */
  static async showExportDialog(
    currentFileName: string,
    svg: string
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
    const defaultFilePath = baseName + availableFormats[0].ext;

    const defaultUri = lastDir
      ? vscode.Uri.file(path.join(lastDir, defaultFilePath))
      : vscode.Uri.file(defaultFilePath);

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

    // Save file based on format
    try {
      await this.exportToFormat(selectedFormat, svg, fileUri);

      // Remember directory
      const directory = path.dirname(fileUri.fsPath);
      await config.update(
        'lastDirectory',
        directory,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `✓ Exported to ${path.basename(fileUri.fsPath)}`
      );
      console.log(`✓ File exported: ${fileUri.fsPath}`);
    } catch (error) {
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
    svg: string,
    fileUri: vscode.Uri
  ): Promise<void> {
    switch (format.id) {
      case 'svg':
        await this.exportSVG(svg, fileUri);
        break;
      // case 'pdf':
      //   await this.exportPDF(svg, fileUri);
      //   break;
      // case 'png':
      //   await this.exportPNG(svg, fileUri);
      //   break;
      default:
        throw new Error(`Unsupported format: ${format.id}`);
    }
  }

  /**
   * Export SVG to file
   */
  private static async exportSVG(
    svg: string,
    fileUri: vscode.Uri
  ): Promise<void> {
    await fs.promises.writeFile(fileUri.fsPath, svg, 'utf8');
  }

  /**
   * Export PDF to file
   * @todo Implement when @wire-dsl/core has PDFExporter
   */
  // private static async exportPDF(
  //   ir: any,
  //   layout: any,
  //   fileUri: vscode.Uri
  // ): Promise<void> {
  //   try {
  //     const { PDFExporter } = require('@wire-dsl/core/exporters');
  //     const buffer = PDFExporter.render(ir, layout, {
  //       filename: path.basename(fileUri.fsPath)
  //     });
  //     await fs.promises.writeFile(fileUri.fsPath, buffer);
  //   } catch (e) {
  //     throw new Error(`PDF export not yet available in @wire-dsl/core`);
  //   }
  // }

  /**
   * Export PNG to file
   * @todo Implement when @wire-dsl/core has PNGExporter
   */
  // private static async exportPNG(
  //   ir: any,
  //   layout: any,
  //   fileUri: vscode.Uri
  // ): Promise<void> {
  //   try {
  //     const { PNGExporter } = require('@wire-dsl/core/exporters');
  //     const buffer = PNGExporter.render(ir, layout, {
  //       filename: path.basename(fileUri.fsPath)
  //     });
  //     await fs.promises.writeFile(fileUri.fsPath, buffer);
  //   } catch (e) {
  //     throw new Error(`PNG export not yet available in @wire-dsl/core`);
  //   }
  // }
}
