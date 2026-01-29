import * as vscode from 'vscode';

/**
 * Parse Service
 * Handles parsing of Wire DSL files and generation of IR/layout
 */
export class ParseService {
  private static coreModule: any = null;

  /**
   * Load Core module (lazy-loaded and cached)
   */
  private static async getCoreModule(): Promise<any> {
    if (this.coreModule) {
      return this.coreModule;
    }
    this.coreModule = require('@wire-dsl/core');
    return this.coreModule;
  }

  /**
   * Parse a Wire DSL document and generate IR + layout
   * @param document The text document to parse
   * @param selectedScreen Optional specific screen to render
   * @returns Object with { ir, layout, availableScreens }
   */
  static async parseDocument(
    document: vscode.TextDocument,
    selectedScreen?: string
  ): Promise<{ ir: any; layout: any; availableScreens: string[] }> {
    const core = await this.getCoreModule();
    const content = document.getText();

    try {
      // Use the correct Core API functions
      const { parseWireDSL, generateIR, calculateLayout } = core;

      if (!parseWireDSL || !generateIR || !calculateLayout) {
        throw new Error('Core module is missing required functions');
      }

      // Parse → IR
      const ast = parseWireDSL(content);
      const ir = generateIR(ast);

      // Get available screens
      const availableScreens = ir.screens ? Object.keys(ir.screens) : [];

      // Determine which screen to render
      const screenToRender = selectedScreen || availableScreens[0] || 'MainScreen';

      // Calculate layout with default dimensions
      const layout = calculateLayout(ir, 1300, 700, { screen: screenToRender });

      return {
        ir,
        layout,
        availableScreens,
      };
    } catch (error) {
      throw new Error(
        `Parse error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
