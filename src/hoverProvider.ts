/**
 * Wire DSL Hover Provider
 * Displays hover documentation for components, layouts, properties, and keywords
 */

import * as vscode from 'vscode';
import { COMPONENTS, LAYOUTS, KEYWORDS } from '@wire-dsl/language-support/components';
import {
  getComponentDocumentation,
  getLayoutDocumentation,
  getKeywordDocumentation,
} from '@wire-dsl/language-support/documentation';
import {
  extractComponentDefinitions,
  getTokenAtPosition as getToken,
} from '@wire-dsl/language-support/document-parser';

/**
 * Extract token at cursor position and classify its type
 */
function getTokenAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): { token: string; range: vscode.Range; type: string } | null {
  const result = getToken(document.getText(), position.line, position.character);
  if (!result) {
    return null;
  }

  const { token, startChar, endChar } = result;
  const range = new vscode.Range(
    new vscode.Position(position.line, startChar),
    new vscode.Position(position.line, endChar)
  );

  // Determine token type
  let type = 'unknown';
  const allKeywords = Object.values(KEYWORDS).flat();
  if (allKeywords.includes(token)) {
    type = 'keyword';
  } else if (COMPONENTS[token as keyof typeof COMPONENTS]) {
    type = 'component';
  } else if (LAYOUTS[token as keyof typeof LAYOUTS]) {
    type = 'layout';
  }

  return { token, range, type };
}

export class WireHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const tokenInfo = getTokenAtPosition(document, position);
    if (!tokenInfo) {
      return null;
    }

    const { token: tokenText, range, type } = tokenInfo;

    let documentation: string | null = null;

    if (type === 'component') {
      // First check if it's a built-in component
      documentation = getComponentDocumentation(tokenText);

      // If not built-in, check if it's a user-defined component
      if (!documentation) {
        const definitions = extractComponentDefinitions(document.getText());
        const userDefinition = definitions.find((def) => def.name === tokenText);

        if (userDefinition && userDefinition.documentation) {
          // Create markdown for user-defined component with its documentation
          documentation = `## ${tokenText}\n\n_User-defined component_\n\n${userDefinition.documentation}`;
        }
      }
    } else if (type === 'layout') {
      documentation = getLayoutDocumentation(tokenText);
    } else if (type === 'keyword') {
      documentation = getKeywordDocumentation(tokenText);
    } else if (type === 'unknown') {
      // For unknown tokens, check if it's a user-defined component
      const definitions = extractComponentDefinitions(document.getText());
      const userDefinition = definitions.find((def) => def.name === tokenText);

      if (userDefinition && userDefinition.documentation) {
        // Create markdown for user-defined component with its documentation
        documentation = `## ${tokenText}\n\n_User-defined component_\n\n${userDefinition.documentation}`;
      }
    }

    if (!documentation) {
      return null;
    }

    const markdown = new vscode.MarkdownString(documentation);
    markdown.isTrusted = true;
    const hover = new vscode.Hover(markdown, range);

    return hover;
  }
}
