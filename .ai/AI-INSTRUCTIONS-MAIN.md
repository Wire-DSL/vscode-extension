# Wire-DSL VS Code Extension - AI Development Instructions

**Last Updated:** January 27, 2026  
**Purpose:** Central reference guide for AI agents and developers

---

## Quick Navigation

### 🎯 For New Feature Development
Start here when building new functionality:
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design and layers
- [README.md](../../README.md) - Project overview
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Developer guidelines

**Current Planning:**
- [Extension Improvements Plan](plans/20260123-vscode-extension-improvements.md) - Feature roadmap and completion status

---

### 🐛 For Maintenance & Bug Fixes
When troubleshooting or fixing issues:
- [TESTING.md](../../TESTING.md) - Test strategies and debugging
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System design
- [README.md](../../README.md) - Feature overview

---

### 📋 Project Structure

```
Wire-DSL/vscode-extension/
├── .ai/                          # AI Instructions Hub
│   ├── AI-INSTRUCTIONS-MAIN.md   # This file
│   ├── AI-INSTRUCTIONS-INDEX.md  # Navigation hub
│   ├── README.md                 # Folder overview
│   └── plans/                    # Development & feature plans
├── src/                          # TypeScript source code
│   ├── extension.ts              # Main extension entry point
│   ├── webviewPanelProvider.ts   # Live preview implementation
│   ├── hoverProvider.ts          # Hover documentation provider
│   ├── definitionProvider.ts     # Go-to-definition provider
│   ├── referenceProvider.ts      # Find references provider
│   ├── completionProvider.ts     # Code completion provider
│   ├── data/                     # Static data
│   │   ├── components.ts         # Component definitions
│   │   └── documentation.ts      # Component documentation
│   └── utils/                    # Utility functions
│       └── documentParser.ts     # Wire DSL parser integration
├── syntaxes/                     # TextMate grammar
│   └── wire.tmLanguage.json      # Syntax highlighting
├── icons/                        # Extension icons
├── ARCHITECTURE.md               # System architecture
├── CONTRIBUTING.md               # Developer guidelines
├── README.md                     # Project README
└── TESTING.md                    # Test strategies
```

---

## Core Concepts

### 1. VS Code Extension Architecture

The Wire-DSL VS Code extension provides:

**Language Features:**
- ✅ Syntax highlighting (TextMate grammar)
- ✅ Hover documentation for components
- ✅ Go-to-definition navigation
- ✅ Find references
- ✅ Code completion
- ✅ Diagnostic reporting

**Preview Features:**
- ✅ Live preview panel (WebviewPanel)
- ✅ Zoom controls with keyboard shortcuts
- ✅ Dark/light theme support
- ✅ Configuration settings (user preferences)
- ✅ Real-time rendering as you type

**Architecture Pattern:**
```
.wire File (in editor)
    ↓
[1] TEXT DOCUMENT
    → Update events, content access
    ↓
[2] LANGUAGE PROVIDERS
    → Hover, completion, definition, references
    ↓
[3] PARSER INTEGRATION (@wire-dsl/core)
    → Parse DSL into AST/IR
    ↓
[4] WEBVIEW PANEL
    → Render SVG preview
    → Handle user interactions
    ↓
User sees: Live preview + language support
```

---

### 2. Key Components

#### Extension Entry Point (`extension.ts`)
- Activates extension on `.wire` file open
- Registers all language providers
- Manages webview panel lifecycle
- Stores singleton references

#### WebviewPanel Provider (`webviewPanelProvider.ts`)
- **Purpose:** Live preview of .wire files
- **Features:**
  - Real-time SVG rendering
  - Zoom controls (in/out/reset)
  - Theme toggle (dark/light)
  - Keyboard shortcuts (Ctrl+Scroll for zoom)
  - Configuration-based settings
- **Architecture:**
  - Caches @wire-dsl/core module (static field)
  - Debounces document changes (300ms)
  - Manages HTML/CSS/JavaScript UI
  - Handles messages from webview

#### Language Providers
- **HoverProvider** - Shows component documentation on hover
- **DefinitionProvider** - Navigate to component references
- **ReferenceProvider** - Find all usages of a component
- **CompletionProvider** - Suggest components and properties

#### Data Files
- **components.ts** - 23 component definitions with specs
- **documentation.ts** - Documentation text for components

---

### 3. Integration with @wire-dsl/core

The extension uses the published `@wire-dsl/core` package:

```typescript
// Lazy-loaded and cached
private static coreModule: any = null;

// Access when needed
const core = await WirePreviewPanel.getCoreModule();
const ir = core.parseAndValidate(dslContent);
const layout = core.calculateLayout(ir, 1300, 700);
const svg = core.renderToSVG(ir, layout, { theme: 'dark' });
```

**Key Functions Used:**
- `parseAndValidate(dslContent)` - Parse DSL and get IR
- `calculateLayout(ir, width, height)` - Calculate grid positions
- `renderToSVG(ir, layout, options)` - Generate SVG string

---

### 4. Theme System

**Configuration Setting:**
```json
"wire.preview.defaultTheme": {
  "enum": ["default", "dark", "light"],
  "default": "default",
  "description": "Default theme for Wire DSL preview render"
}
```

**How It Works:**
- Read from VS Code settings on initialization
- "default" uses VS Code's current theme (light/dark)
- "dark" or "light" forces a specific theme
- Toggle button in preview allows runtime switching
- Content cached for instant rerenders

---

## Development Workflows

### Adding a New Language Provider

1. **Create Provider Class** → `src/yourProvider.ts`
   ```typescript
   export class YourProvider implements vscode.YourProviderInterface {
     provideYour(document, position, context, token) {
       // Implementation
     }
   }
   ```

2. **Register in Extension** → `src/extension.ts`
   ```typescript
   vscode.languages.register(YourProvider(), {
     language: 'wire'
   });
   ```

3. **Add Data if Needed** → Update `src/data/documentation.ts`

4. **Test** → Create test file `test-syntax.wire`

5. **Document** → Update `ARCHITECTURE.md` or `README.md`

### Improving the Preview Panel

1. **Identify Feature** → What should the preview do?
2. **Check Current Code** → `src/webviewPanelProvider.ts` and HTML/CSS/JS
3. **Update TypeScript** → Extension-side changes
4. **Update HTML/CSS/JS** → Webview-side changes
5. **Test** → Open a .wire file and verify behavior
6. **Document** → Update `ARCHITECTURE.md` if significant

### Fixing a Parser Issue

1. **Identify Problem** → Parse error or incorrect output
2. **Create Test Case** → Add `.wire` file that reproduces issue
3. **Check Parser** → `@wire-dsl/core` package (not in this repo)
4. **Report/Fix** → Create issue or update core package
5. **Update Examples** → Add test case to this repo if helpful

### Adding a New Configuration Setting

1. **Add to package.json** → `contributes.configuration`
2. **Read in Extension** → `vscode.workspace.getConfiguration('wire.xxx')`
3. **Use in Providers** → Pass config to whatever needs it
4. **Document** → Update `README.md` or `ARCHITECTURE.md`
5. **Test** → Verify setting works in VS Code settings UI

---

## Quality Standards

### Code Style
- **Language:** TypeScript with strict mode enabled
- **Linting:** ESLint configured in `package.json`
- **Format:** Matches existing code style
- **Comments:** JSDoc comments for public APIs

### Naming Conventions
- **Classes:** PascalCase (e.g., `WirePreviewPanel`, `HoverProvider`)
- **Functions/Methods:** camelCase (e.g., `getConfiguration`, `updatePreview`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `ORIGINAL_WIDTH`)
- **Files:** camelCase (e.g., `hoverProvider.ts`)

### Testing & Validation
- [ ] Code compiles without errors
- [ ] No TypeScript strict mode violations
- [ ] Manual testing with test-syntax.wire file
- [ ] Updated documentation if behavior changed
- [ ] All language features still work (hover, completion, etc.)

### Pre-Commit Checklist
Before committing code:
- [ ] No console errors or warnings
- [ ] All features work as intended
- [ ] Documentation updated
- [ ] No breaking changes to existing features
- [ ] Code follows style guide above

---

## Important Files to Know

| File | Purpose | Key Concepts |
|------|---------|--------------|
| `src/extension.ts` | Extension activation and provider registration | Main entry point, lifecycle |
| `src/webviewPanelProvider.ts` | Live preview implementation | Zoom, theme, rendering |
| `src/hoverProvider.ts` | Hover documentation | Component info on hover |
| `src/definitionProvider.ts` | Go-to-definition | Navigation |
| `src/completionProvider.ts` | Code completion | Suggestions |
| `src/data/components.ts` | Component catalog | 23 UI components |
| `src/data/documentation.ts` | Component docs | Descriptions and examples |
| `src/utils/documentParser.ts` | @wire-dsl/core integration | Parse and validate DSL |
| `package.json` | Extension manifest | Config, commands, activation |
| `ARCHITECTURE.md` | System design | How it all works together |

---

## Coding Standards

### TypeScript Configuration
- Strict mode enabled in `tsconfig.json`
- No implicit any types
- Target: ES2020+

### Import Organization
```typescript
// 1. External imports
import * as vscode from 'vscode';

// 2. Internal imports
import { WirePreviewPanel } from './webviewPanelProvider';
import { COMPONENTS } from './data/components';

// 3. Blank line between import groups
```

### Comments & Documentation
```typescript
/**
 * Brief description
 * @param name - Parameter description
 * @returns What it returns
 */
export function myFunction(name: string): string {
  // Implementation
}
```

---

## Getting Help

**Need to understand:**
- **System architecture** → [ARCHITECTURE.md](../../ARCHITECTURE.md)
- **How to contribute** → [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Testing approach** → [TESTING.md](../../TESTING.md)
- **Quick navigation** → [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)

**Looking for:**
- **Syntax highlighting** → `syntaxes/wire.tmLanguage.json`
- **Component definitions** → `src/data/components.ts`
- **Component docs** → `src/data/documentation.ts`
- **Provider examples** → `src/*Provider.ts` files

---

## Quick Reference: Common Tasks

### Build & Test
```bash
# Install dependencies
npm install

# Build (esbuild)
npm run esbuild

# Build with watch
npm run esbuild-watch

# Compile TypeScript
npm run compile

# Run linter
npm run lint
```

### Debug Extension
1. Open this folder in VS Code
2. Press F5 to launch Extension Development Host
3. Open a `.wire` file
4. Preview panel should appear on right
5. Use VS Code debugging tools

### Test Parser Integration
1. Create/edit a `.wire` file in the Extension Development Host
2. Watch preview update in real-time
3. Check hover tooltips work
4. Test code completion

---

## Architecture Overview

```
VS Code Window
    ↓
┌─────────────────────────────────────────┐
│ Extension Context (Main Process)        │
├─────────────────────────────────────────┤
│ • Extension activation                  │
│ • Language provider registration        │
│ • Document event handling               │
│ • Webview panel management              │
│ • Configuration management              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Language Providers                      │
├─────────────────────────────────────────┤
│ • HoverProvider                         │
│ • DefinitionProvider                    │
│ • ReferenceProvider                     │
│ • CompletionProvider                    │
│ • (Process document on-demand)          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Webview Panel (Preview)                 │
├─────────────────────────────────────────┤
│ • HTML/CSS/JavaScript UI                │
│ • Zoom & theme controls                 │
│ • SVG rendering area                    │
│ • Communication with extension          │
│ • @wire-dsl/core integration            │
└─────────────────────────────────────────┘
    ↓
@wire-dsl/core (External Package)
    ↓
├─ Parser → AST
├─ IR Generator
├─ Layout Engine
└─ SVG Renderer
```

---

**Last Updated:** January 27, 2026  
**For Quick Navigation:** → [README.md](README.md)  
**For Agent-Specific Instructions:** → [CLAUDE.md](../../CLAUDE.md) or [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
