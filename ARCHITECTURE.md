# Wire DSL VS Code Extension - Architecture

## Overview

The Wire DSL VS Code Extension is a **complete, production-ready** extension providing comprehensive language support for `.wire` files. It includes syntax highlighting, intelligent autocompletion, hover documentation, code navigation, and live SVG preview capabilities.

## Project Structure

For directory layout, see [README.md](README.md#project-structure).

**Key files by responsibility:**

| File | Purpose |
|------|---------|
| `src/extension.ts` | Entry point - activation and all provider registration |
| `src/completionProvider.ts` | Context-aware code completion for keywords, components, and properties |
| `src/hoverProvider.ts` | Hover documentation for components, properties, and keywords |
| `src/definitionProvider.ts` | Go-to-definition navigation (Ctrl+Click) |
| `src/referenceProvider.ts` | Find references (Ctrl+Shift+H) - finds all usages |
| `src/webviewPanelProvider.ts` | Live SVG preview panel with zoom and theme support |
| `src/data/components.ts` | Component definitions (names, properties, types) |
| `src/data/documentation.ts` | Full documentation for all components and properties |
| `src/utils/documentParser.ts` | DSL parsing and analysis utilities |
| `syntaxes/wire.tmLanguage.json` | TextMate grammar - syntax highlighting rules |
| `language-configuration.json` | Language configuration (bracket pairs, comments, indentation) |
| `package.json` | Extension manifest & VS Code contributions |

## Component Breakdown

### 1. **extension.ts** (Entry Point)

The activation function is called when VS Code detects a `.wire` file.

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Register all language providers
  const completionProvider = new WireCompletionProvider();
  const hoverProvider = new WireHoverProvider();
  const definitionProvider = new WireDefinitionProvider();
  const referenceProvider = new WireReferenceProvider();
  
  // Each provider handles specific language features
  vscode.languages.registerCompletionItemProvider(...);
  vscode.languages.registerHoverProvider(...);
  vscode.languages.registerDefinitionProvider(...);
  vscode.languages.registerReferenceProvider(...);
  
  // Register preview panel command
  vscode.commands.registerCommand('wire.openPreview', ...);
}
```

**Key responsibilities:**
- Activate when `.wire` file is opened
- Register all language providers
- Register preview panel command
- Manage lifecycle and cleanup

### 2. **wire.tmLanguage.json** (Syntax Highlighting)

TextMate grammar that tokenizes Wire DSL syntax using regex patterns.

**Structure:**
```json
{
  "scopeName": "source.wire",
  "patterns": [
    { "include": "#comments" },
    { "include": "#keywords" },
    { "include": "#components" },
    { "include": "#properties" },
    { "include": "#strings" },
    { "include": "#colors" },
    { "include": "#numbers" }
  ],
  "repository": {
    "keywords": { ... },
    "components": { ... },
    "properties": { ... }
  }
}
```

**Scope Hierarchy:**
- `source.wire` - Root scope for all Wire files
- `keyword.declaration.wire` - Keywords like `project`, `screen`
- `keyword.control.wire` - Layout keywords like `grid`, `stack`
- `entity.name.class.wire` - Component names like `Button`, `Card`
- `variable.other.property.wire` - Properties like `id`, `label`
- `string.quoted.double.wire` - String literals
- `constant.color.hex.wire` - Hex colors (#RRGGBB)
- `constant.numeric.wire` - Numbers
- `comment.line.double-slash.wire` - Comments

### 3. **language-configuration.json**

Defines language behaviors beyond syntax highlighting:
- Comment styles (`//` and `/* */`)
- Bracket pairs and auto-closing
- Indentation rules (increase after `{`, decrease before `}`)
- Code folding regions

### 4. **package.json** (VS Code Manifest)

Defines:

**Metadata:**
```json
{
  "name": "wire-dsl",
  "displayName": "Wire DSL",
  "version": "0.2.3",
  "engines": { "vscode": ">=1.108.0" }
}
```

**Activation:**
```json
{
  "activationEvents": ["onLanguage:wire", "onCommand:wire.openPreview"]
}
```
- Extension activates when `.wire` file is opened (lazy loading for performance)
- Also activates when preview command is triggered

**Contributions:**
- Language configuration for `.wire` files
- TextMate grammar for syntax highlighting
- Custom command for opening preview panel
- Menu integration in editor title bar
- Keyboard shortcut (Ctrl+Shift+V)

### 5. **completionProvider.ts** (Autocompletion)

Implements `vscode.CompletionItemProvider` for context-aware code completion:

```typescript
class WireCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document, position, token, context
  ): CompletionItem[] {
    // Detect context (inside screen? inside form? etc.)
    // Return appropriate completions
    // - Keywords: project, screen, grid, stack, etc.
    // - Components: Button, Input, Card, etc.
    // - Properties: id, label, color, gap, padding, etc.
    // - Values: spacing tokens (xs, sm, md, lg, xl), colors
  }
}
```

**Features:**
- Context-aware suggestions based on cursor position
- Component property completion with type hints
- Layout type completion
- Property value completion (spacing tokens, colors)
- Smart trigger characters: space, `(`, `:`, `{`

**Data structure:**

```typescript
// data/components.ts
export const COMPONENTS = {
  Button: {
    description: 'Interactive button element',
    properties: ['id', 'label', 'disabled', 'variant', 'size'],
    example: 'Button { label: "Click me" }'
  },
  // ... 40+ components
};
```

### 6. **hoverProvider.ts** (Hover Tooltips & Documentation)

Implements `vscode.HoverProvider` to show documentation on hover:

```typescript
class WireHoverProvider implements vscode.HoverProvider {
  provideHover(document, position, token): Hover {
    // Get word at position
    // Look up in component/keyword documentation
    // Return Hover with MarkdownString
  }
}
```

**Features:**
- Hover documentation for components
- Property descriptions with usage examples
- Keyword definitions
- Automatic tooltip display on mouse over

**Documentation data:**
```typescript
// data/documentation.ts
export function getComponentDocumentation(componentName: string): string | null {
  // Returns full documentation for component
}

export function getPropertyDocumentation(componentName: string, propertyName: string): string | null {
  // Returns property-specific documentation
}
```

### 7. **definitionProvider.ts** (Go-to-Definition)

Implements `vscode.DefinitionProvider` for code navigation:

```typescript
class WireDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document, position, token): Location[] {
    // Find definition location of component or reference
    // Returns Location pointing to definition
  }
}
```

**Features:**
- Ctrl+Click navigation to component definitions
- Works for component references and usages
- Accurate position tracking

### 8. **referenceProvider.ts** (Find References)

Implements `vscode.ReferenceProvider` to find all usages:

```typescript
class WireReferenceProvider implements vscode.ReferenceProvider {
  provideReferences(document, position, token): Location[] {
    // Find all usages of component or reference
    // Returns array of all reference locations
  }
}
```

**Features:**
- Ctrl+Shift+H to find all references
- Shows all usages throughout the file
- Integration with VS Code Reference panel

### 9. **webviewPanelProvider.ts** (SVG Preview Panel)

Implements live SVG preview as a WebviewPanel (like Markdown preview):

```typescript
class WirePreviewPanel {
  static openPreview(extensionUri: vscode.Uri): void {
    // Create WebviewPanel
    // Parse .wire file
    // Render SVG
    // Handle zoom and theme changes
  }
}
```

**Features:**
- Real-time SVG rendering as you type
- Zoom controls (Ctrl+Scroll or buttons)
- Theme toggle (Dark/Light/Auto)
- Auto-refresh on file save
- Keyboard shortcuts (Ctrl+Shift+V to open)
- Configuration settings for default theme

## Data Flow

### Syntax Highlighting

```
.wire file opened
        ↓
VS Code detects file extension (.wire)
        ↓
Activates extension (onLanguage:wire)
        ↓
Loads wire.tmLanguage.json
        ↓
TextMate tokenizer processes file
        ↓
Scopes matched to VS Code theme colors
        ↓
Syntax highlighting displayed ✓
```

### Code Completion

```
User types in .wire file
        ↓
CompletionProvider.provideCompletionItems() called
        ↓
Analyze context (position in file)
        ↓
Query component/keyword metadata
        ↓
Generate CompletionItem objects
        ↓
VS Code displays IntelliSense popup
        ↓
User selects completion, insertText inserted ✓
```

### Hover Documentation & Navigation

```
User hovers mouse over element / presses Ctrl+Click
        ↓
HoverProvider.provideHover() called / DefinitionProvider.provideDefinition() called
        ↓
Get word at cursor position
        ↓
Look up in documentation/definition map
        ↓
Return Hover with MarkdownString or Location
        ↓
VS Code displays tooltip or navigates ✓
```

**Navigation Features:**
- Ctrl+Click → Go to definition (DefinitionProvider)
- Ctrl+Shift+H → Find references (ReferenceProvider)

### SVG Preview Panel

```
User opens preview panel (Ctrl+Shift+V)
        ↓
WebviewPanel.openPreview() called
        ↓
Read current .wire file content
        ↓
Parse with @wire-dsl/core parser
        ↓
Generate IR (Intermediate Representation)
        ↓
Calculate layout with layout engine
        ↓
Render SVG with SVGRenderer
        ↓
Send SVG to webview
        ↓
Webview displays interactive preview ✓
```

## Integration Points

### With VS Code API

- **vscode.languages**: Register providers for language features
- **vscode.window**: Show UI elements (notifications, input boxes)
- **vscode.workspace**: Monitor file changes and settings
- **vscode.ExtensionContext**: Manage subscriptions and cleanup
- **vscode.commands**: Register custom commands
- **vscode.WebviewPanel**: Host preview panel
- **TextMate Grammar**: Built-in tokenization without code

### With Wire DSL Core

**Current:** Integration implemented via `@wire-dsl/core` package

```typescript
import { parse } from '@wire-dsl/core';
import { SVGRenderer } from '@wire-dsl/core';

const ast = parse(fileContent);
const svg = new SVGRenderer().render(ast);
```

## Performance Considerations

1. **Lazy Loading**: Extension only activates when `.wire` file is opened
2. **TextMate Grammar**: Efficient tokenization (built into VS Code)
3. **Incremental Parsing**: Language providers cache parse results
4. **Webview**: Debounces rendering (re-render on save, not on keystroke)

## Testing Strategy

1. **Syntax Highlighting**: Visual inspection of colors in test file
2. **Autocompletion**: Test context detection with various code positions
3. **Hover**: Test documentation lookup for edge cases
4. **Navigation**: Test go-to-definition and find references
5. **Preview**: Compare SVG output with expected layout

## Future Enhancements

- Error diagnostics via Language Server Protocol (LSP)
- Code formatter (`npm run format`)
- Snippets for common patterns
- Custom theme support
- Export to other formats (React, HTML, etc.)
- Performance optimizations for large files

## Deployment

### For Local Testing
```bash
npm run esbuild
# Press F5 in VS Code to debug
```

### For Distribution
```bash
npm run vscode:prepublish  # Minified build
vsce package              # Create .vsix file
vsce publish              # Publish to marketplace
```

## Key Technologies

- **VS Code Extension API** 1.108.0+
- **TypeScript** 5.0+
- **TextMate Grammar** (JSON format)
- **esbuild** (Bundler)
- **Wire DSL Core** @wire-dsl/core (for SVG rendering)
- **TextMate Grammar** (JSON format)
- **esbuild** (Bundler)
- **Wire DSL Core** @wire-dsl/core (Phase 4+)
