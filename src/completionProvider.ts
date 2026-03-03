import * as vscode from 'vscode';
import {
  detectComponentContext,
  getAlreadyDeclaredProperties,
} from '@wire-dsl/language-support/context-detection';
import {
  getScopeBasedCompletions,
  getComponentPropertiesForCompletion,
  getPropertyValueSuggestions,
  detectPropertyValueContext,
  type CompletionItem as LSCompletionItem,
} from '@wire-dsl/language-support/completions';
import { COMPONENTS, LAYOUTS, PROPERTY_VALUES } from '@wire-dsl/language-support/components';

/**
 * Map language-support completion kinds to VS Code CompletionItemKind
 */
function toVSCodeKind(kind: string): vscode.CompletionItemKind {
  switch (kind) {
    case 'Keyword': return vscode.CompletionItemKind.Keyword;
    case 'Component': return vscode.CompletionItemKind.Class;
    case 'Property': return vscode.CompletionItemKind.Property;
    case 'Value': return vscode.CompletionItemKind.Value;
    case 'Variable': return vscode.CompletionItemKind.Variable;
    default: return vscode.CompletionItemKind.Text;
  }
}

/**
 * Convert language-support CompletionItems to VS Code CompletionItems
 */
function convertCompletionItems(items: LSCompletionItem[]): vscode.CompletionItem[] {
  return items.map((item, index) => {
    const vsItem = new vscode.CompletionItem(item.label, toVSCodeKind(item.kind));
    if (item.detail) vsItem.detail = item.detail;
    if (item.documentation) vsItem.documentation = new vscode.MarkdownString(item.documentation);
    if (item.insertText) vsItem.insertText = new vscode.SnippetString(item.insertText);
    vsItem.sortText = String(index).padStart(3, '0');
    return vsItem;
  });
}

type DocumentScope = 'empty-file' | 'inside-project' | 'inside-screen' | 'inside-layout';

/**
 * Determine document scope by walking backwards through braces
 * to find which keyword context (project/screen/layout) the cursor is inside.
 *
 * This replaces the package's determineScope which has a brace-counting bug
 * when blocks like style{} or colors{} are present.
 */
function determineScope(textBeforeCursor: string): DocumentScope {
  const cleanText = textBeforeCursor
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  if (cleanText.trim().length === 0) {
    return 'empty-file';
  }

  // Walk backwards through characters counting brace depth
  // Each time we find an unmatched '{', check what keyword is on that line
  let depth = 0;
  const lines = cleanText.split('\n');

  for (let lineIdx = lines.length - 1; lineIdx >= 0; lineIdx--) {
    const line = lines[lineIdx];
    for (let i = line.length - 1; i >= 0; i--) {
      if (line[i] === '}') depth++;
      if (line[i] === '{') {
        depth--;
        if (depth < 0) {
          // Found an unmatched opening brace — this is a parent context
          if (/\blayout\s+/.test(line)) return 'inside-layout';
          if (/\bscreen\s+/.test(line)) return 'inside-screen';
          if (/\bproject\s+/.test(line)) return 'inside-project';
          // Other blocks (style, colors, mocks, cell, define) — keep walking
          depth = 0;
        }
      }
    }
  }

  // If we found a project keyword but no unclosed brace, check if project exists
  if (/\bproject\s+/.test(cleanText)) {
    return 'inside-project';
  }

  return 'empty-file';
}

/**
 * Build a snippet string for a property based on its type and options
 */
function buildPropertySnippet(prop: any, tabIndex: number): string {
  if (prop.type === 'enum' && prop.options && prop.options.length > 0) {
    // Limit options for icon-like enums to keep snippets readable
    const options = prop.options.length > 10
      ? prop.options.slice(0, 10)
      : prop.options;
    return `${prop.name}: \${${tabIndex}|${options.join(',')}|}`;
  }
  if (prop.type === 'boolean') {
    return `${prop.name}: \${${tabIndex}|true,false|}`;
  }
  if (prop.type === 'number') {
    return `${prop.name}: \${${tabIndex}:${prop.default || '0'}}`;
  }
  // string and others
  return `${prop.name}: "\${${tabIndex}:${prop.default || prop.name}}"`;
}

/**
 * Generate a layout snippet using only required properties
 */
function buildLayoutSnippet(layoutName: string): string {
  const layout = LAYOUTS[layoutName as keyof typeof LAYOUTS];
  if (!layout) return `${layoutName}() {\n\t$0\n}`;

  const props = Object.values(layout.properties || {}) as any[];
  const requiredProps = props.filter((p: any) => p.required);

  let paramsSnippet = '';
  if (requiredProps.length > 0) {
    const params = requiredProps.map((prop: any, i: number) =>
      buildPropertySnippet(prop, i + 1)
    );
    paramsSnippet = params.join(', ');
  }

  const tabNext = requiredProps.length + 1;

  // Grid gets a cell child by default
  if (layoutName === 'grid') {
    return `${layoutName}(${paramsSnippet}) {\n\tcell span: \${${tabNext}:3} {\n\t\t$0\n\t}\n}`;
  }

  return `${layoutName}(${paramsSnippet}) {\n\t$0\n}`;
}

/**
 * Generate a component snippet using required properties
 */
function buildComponentSnippet(componentName: string): string {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return `${componentName} $0`;

  const props = Object.values(component.properties || {}) as any[];
  const requiredProps = props.filter((p: any) => p.required);

  if (requiredProps.length === 0) return `${componentName} $0`;

  const params = requiredProps.map((prop: any, i: number) =>
    buildPropertySnippet(prop, i + 1)
  );

  return `${componentName} ${params.join(' ')}`;
}

/**
 * Wire DSL Completion Provider - Intelligent Context-Aware Completions
 */
export class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] {
    const lineText = document.lineAt(position).text.substring(0, position.character);
    const documentText = document.getText();
    const cursorOffset = document.offsetAt(position);
    const textBeforeCursor = documentText.substring(0, cursorOffset);

    // HIGHEST PRIORITY: Check if we're in a component property context
    const componentContext = detectComponentContext(lineText);
    if (componentContext) {
      const declared = getAlreadyDeclaredProperties(lineText);
      const suggestions = getComponentPropertiesForCompletion(componentContext, [...declared]);
      return this.convertPropertyCompletions(suggestions, componentContext);
    }

    // Layout type after "layout " keyword — use rich VS Code snippets
    if (/layout\s+\w*$/.test(lineText)) {
      return this.getLayoutTypeCompletions();
    }

    // Component name after "component "
    if (/component\s+[A-Z]?\w*$/.test(lineText)) {
      return this.getComponentNameCompletions();
    }

    // Property value after ":"
    const pvContext = detectPropertyValueContext(lineText);
    if (pvContext) {
      return convertCompletionItems(
        getPropertyValueSuggestions(pvContext.componentName, pvContext.propertyName)
      );
    }

    // Fallback: generic property value (no component context, e.g. layout properties)
    if (/:\s+\w*$/.test(lineText)) {
      return this.getGenericPropertyValueCompletions(lineText);
    }

    // Scope-based completions
    const scope = determineScope(textBeforeCursor);
    const scopeItems = getScopeBasedCompletions(scope);

    // Inside layout: only show keywords (component, layout)
    // "cell" only appears as direct child of a grid layout
    // Component names appear after "component ", layout types after "layout "
    if (scope === 'inside-layout') {
      const isInsideGrid = this.isDirectChildOfGrid(textBeforeCursor);
      const allowedLabels = isInsideGrid
        ? ['component', 'layout', 'cell']
        : ['component', 'layout'];
      const filtered = scopeItems.filter((item: LSCompletionItem) => allowedLabels.includes(item.label));

      // Ensure "layout" keyword is always present for nested layouts
      if (!filtered.some((item: LSCompletionItem) => item.label === 'layout')) {
        filtered.push({
          label: 'layout',
          kind: 'Keyword',
          detail: 'Add a nested layout',
          insertText: 'layout ',
        });
      }

      return convertCompletionItems(filtered);
    }

    // Inside screen: only show "layout" keyword
    // Layout types appear after "layout "
    if (scope === 'inside-screen') {
      const filtered = scopeItems.filter((item: LSCompletionItem) => item.label === 'layout');
      return convertCompletionItems(filtered);
    }

    return convertCompletionItems(scopeItems);
  }

  /**
   * Check if cursor is a direct child of a grid layout
   * Walks backwards through text counting braces to find the nearest parent layout
   */
  private isDirectChildOfGrid(textBeforeCursor: string): boolean {
    const cleanText = textBeforeCursor
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Walk backwards to find the nearest unclosed layout
    let depth = 0;
    const lines = cleanText.split('\n').reverse();

    for (const line of lines) {
      // Count braces in reverse
      for (let i = line.length - 1; i >= 0; i--) {
        if (line[i] === '}') depth++;
        if (line[i] === '{') {
          depth--;
          if (depth < 0) {
            // Found the opening brace of our parent — check if it's a grid
            return /\bgrid\s*\(/.test(line);
          }
        }
      }
    }

    return false;
  }

  /**
   * Layout type completions with VS Code-specific rich snippets
   */
  /**
   * Component name completions with required properties as snippet
   */
  private getComponentNameCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const [name, meta] of Object.entries(COMPONENTS)) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Class);
      item.detail = (meta as any).description;
      item.documentation = new vscode.MarkdownString(
        `**${name}**\n\n${(meta as any).description}`
      );
      item.insertText = new vscode.SnippetString(buildComponentSnippet(name));
      items.push(item);
    }

    return items;
  }

  private getLayoutTypeCompletions(): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const [key, layout] of Object.entries(LAYOUTS)) {
      const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword);
      item.detail = (layout as any).description;
      item.insertText = new vscode.SnippetString(buildLayoutSnippet(key));
      items.push(item);
    }

    return items;
  }

  /**
   * Convert property completions with VS Code snippet support for enum values
   */
  private convertPropertyCompletions(
    suggestions: LSCompletionItem[],
    componentName: string
  ): vscode.CompletionItem[] {
    return suggestions.map((item, index) => {
      const vsItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Property);
      vsItem.detail = item.detail || `Property of ${componentName}`;
      if (item.documentation) vsItem.documentation = new vscode.MarkdownString(item.documentation);
      vsItem.sortText = String(index).padStart(3, '0');

      // Check if the property has enum values to create a rich snippet
      const values = getPropertyValueSuggestions(componentName, item.label);
      if (values.length > 0) {
        const valuesStr = values.map(v => v.label).join(',');
        vsItem.insertText = new vscode.SnippetString(`${item.label}: \${1|${valuesStr}|}`);
      } else if (item.insertText) {
        vsItem.insertText = new vscode.SnippetString(item.insertText);
      } else {
        vsItem.insertText = new vscode.SnippetString(`${item.label}: "\${1:value}"`);
      }

      return vsItem;
    });
  }

  /**
   * Generic property value completions (for properties outside component context)
   */
  private getGenericPropertyValueCompletions(lineText: string): vscode.CompletionItem[] {
    const propertyMatch = lineText.match(/(\w+):\s*\w*$/);
    if (!propertyMatch) {
      return [];
    }

    const propertyName = propertyMatch[1];
    const values = PROPERTY_VALUES[propertyName];
    if (!values) {
      return [];
    }

    return values.map((value: string) => {
      const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
      item.insertText = value;
      return item;
    });
  }
}
