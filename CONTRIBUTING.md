# Contributing to Wire DSL VS Code Extension

Thank you for your interest in contributing to the Wire DSL VS Code Extension!

## Project Structure

**Important**: This is a **standalone npm project** to avoid conflicts with the monorepo's pnpm setup.

```
vscode-extension/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── hoverProvider.ts          # Hover documentation tooltips
│   ├── definitionProvider.ts     # Go-to-definition (Ctrl+Click)
│   ├── referenceProvider.ts      # Find references (Ctrl+Shift+H)
│   ├── documentParser.ts         # Parse .wire files
│   └── data/                     # Component metadata
├── syntaxes/
│   └── wire.tmLanguage.json      # TextMate grammar (syntax highlighting)
├── package.json                  # npm configuration & manifest
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # User documentation
```

## Development Setup

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm (included with Node.js)
- VS Code 1.75+

### Quick Start

```bash
# 1. Navigate to extension directory
cd packages/vscode-extension

# 2. Install dependencies (one-time)
npm install

# 3. Start development
npm run esbuild-watch

# 4. Launch VS Code debugger
# In VS Code: Press F5
```

## Available Commands

```bash
# Development
npm run esbuild-watch        # Watch mode with sourcemaps
npm run esbuild              # One-time build with sourcemaps

# Build & Package
npm run package              # Build + create VSIX + install
npm run package-only         # Build + create VSIX only
npm run vscode:prepublish    # Production build (minified)

# Testing
npm run test                 # Run vitest
```

## Important: Use npm (NOT pnpm)

This project uses **npm exclusively** to avoid conflicts with the monorepo:

```bash
npm install      # ✅ Correct
pnpm install     # ❌ Wrong - will cause issues
```

The `.npmrc` file configures npm behavior for this project.

## How to Add a Feature

### 1. Syntax Highlighting (.wire files)

Edit `syntaxes/wire.tmLanguage.json`:

```json
{
  "name": "your-keyword",
  "match": "\\byour-keyword\\b",
  "name": "keyword.control.wire"
}
```

Test by opening a `.wire` file with the syntax.

### 2. Component Documentation

Add to `src/data/documentation.ts`:

```typescript
export const COMPONENTS: Record<string, ComponentDoc> = {
  MyComponent: {
    name: "MyComponent",
    description: "Brief description",
    category: "input|output|container|layout|display|other",
    properties: {
      prop1: "Description of prop1",
      prop2: "Description of prop2"
    }
  }
};
```

This automatically enables:
- Hover tooltips showing component docs
- Go-to-definition navigation
- Find references

### 3. New Language Provider

Create `src/newProvider.ts`:

```typescript
import * as vscode from 'vscode';

export class NewProvider implements vscode.SomeProvider {
  // Implementation
}
```

Register in `src/extension.ts`:

```typescript
context.subscriptions.push(
  vscode.languages.register(
    NewProvider(),
    { language: 'wire' }
  )
);
```

## Testing

Run tests with:
```bash
npm run test
```

Tests are located in `src/**/*.test.ts` (vitest configuration).

## Debugging

1. **In VS Code**: Press `F5` to launch extension with debugger
2. **VS Code window**: Opens with extension running
3. **Main window**: Set breakpoints, inspect variables
4. **Reload**: Ctrl+Shift+P → "Developer: Reload Window"

## Before Submitting PR

- [ ] Run `npm run esbuild` - no TypeScript errors
- [ ] Run `npm run test` - all tests pass
- [ ] Code follows existing style (camelCase, no var, etc.)
- [ ] Added tests for new functionality
- [ ] Updated documentation if behavior changed
- [ ] Tested with sample `.wire` file
- [ ] Ran `npm run package` successfully

## Code Style

- **TypeScript strict mode** (see tsconfig.json)
- **camelCase** for variables and functions
- **PascalCase** for classes and types
- **UPPER_SNAKE_CASE** for constants
- **JSDoc comments** for public APIs

Example:
```typescript
/**
 * Extracts component definitions from Wire DSL source code.
 * @param source Wire DSL source text
 * @returns Map of component names to their documentation
 */
export function extractComponentDefinitions(source: string): Map<string, ComponentDoc> {
  // Implementation
}
```

## Filing Issues

When reporting bugs, include:
- VS Code version
- Extension version
- Minimal `.wire` file to reproduce
- Expected vs actual behavior
- Extension console output (View → Output → Wire DSL)

## Questions?

- Check [README.md](./README.md) for user documentation
- See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details
- Review existing code for patterns and conventions

## License

MIT - See [LICENSE](../../LICENSE) in root directory

---

**Thank you for contributing!** 🎉
