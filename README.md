# Wire DSL - VS Code Extension

Syntax highlighting, autocompletion, and preview for **Wire DSL** `.wire` files.

## Features

### ✅ Phase 1: Syntax Highlighting (Current)
- **Keywords** highlighting (`project`, `screen`, `stack`, `grid`, `panel`, `split`, `form`, `table`)
- **Component types** highlighting (40+ UI components: `Button`, `Input`, `Card`, `Table`, etc.)
- **Properties** highlighting (`id`, `label`, `color`, `background`, `width`, `height`, etc.)
- **Colors** highlighting (hex colors `#RRGGBB` and named colors)
- **Numbers** and spacing tokens (`xs`, `sm`, `md`, `lg`, `xl`)
- **Comments** support (`//` and `/* */`)
- **Bracket matching** and auto-pairing

### 📋 Phase 2: Autocompletion (Upcoming)
- Context-aware completions for keywords, components, and properties
- Snippet suggestions for common patterns
- Type-safe property suggestions

### 💡 Phase 3: Hover Tooltips (Upcoming)
- Component documentation on hover
- Property descriptions and examples
- Keyboard shortcut reference

### 👁️ Phase 4: SVG Preview (Upcoming)
- Live preview of `.wire` files rendered as interactive SVG
- Light/dark theme support
- Auto-refresh on file save

## Installation

### From Marketplace (Coming Soon)
Search for "Wire DSL" in VS Code Extensions

### Local Installation (Development)

#### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **VS Code** 1.75+

#### Quick Start

```bash
cd packages/vscode-extension
npm install
npm run package
```

This command:
1. Compiles TypeScript to JavaScript (esbuild, minified)
2. Packages the extension as `.vsix` (VS Code Extension format)
3. Installs the extension in VS Code automatically

**Restart VS Code** to activate the extension.

#### Why Standalone npm?

This project is a **standalone npm project** (independent from the monorepo pnpm):
- ✅ No npm/pnpm conflicts - contributors use standard `npm install`
- ✅ Compatible with VS Code tooling (`vsce` and `code --install-extension`)
- ✅ Clear dependency resolution without monorepo interference

**Important:** Always use `npm` (not `pnpm`) in this directory:
```bash
npm install      # ✅ Correct
pnpm install     # ❌ Will cause conflicts
```

The `.npmrc` file enforces npm usage for this project.

#### Development Workflow

```bash
# One-time setup
npm install

# During development (watch mode)
npm run esbuild-watch

# Run in debug mode
# In VS Code: Press F5 to launch extension with debugger

# Run tests
npm run test

# Package without installing
npm run package-only
```

## Project Structure

This is a **standalone npm project** (independent from the monorepo pnpm).

```
vscode-extension/
├── src/
│   ├── extension.ts          # Entry point
│   ├── completionProvider.ts # Phase 2: Autocompletion (planned)
│   ├── hoverProvider.ts      # Phase 3: Hover tooltips (planned)
│   ├── referenceProvider.ts  # Find references
│   ├── definitionProvider.ts # Go-to-definition
│   └── data/                 # Component metadata
├── syntaxes/
│   └── wire.tmLanguage.json  # TextMate grammar (syntax highlighting)
├── package.json              # npm dependencies & manifest
├── package-lock.json         # Locked versions (use npm)
├── tsconfig.json             # TypeScript configuration
├── language-configuration.json # Bracket pairing, indentation
├── .npmrc                    # npm config (force npm usage)
└── icons/                    # VS Code extension icons

```

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Usage

1. Open or create a `.wire` file
2. Syntax highlighting is automatically applied
3. Use Ctrl+Space (Cmd+Space on Mac) for autocomplete (Phase 2)
4. Hover over elements for documentation (Phase 3)
5. Open preview panel for SVG rendering (Phase 4)

## Example

Create a file named `dashboard.wire`:

```wire
project "My Dashboard" {
  screen Dashboard {
    grid {
      columns: 2
      gap: md
      
      Card {
        id: "card1"
        label: "Users"
      }
      
      Card {
        id: "card2"
        label: "Revenue"
      }
    }
  }
}
```

The Wire DSL extension will highlight:
- `project` as a declaration keyword
- `screen` and `Dashboard` appropriately
- `grid` as a layout control
- `Card` as a component type
- Properties like `id`, `label`, `columns`, `gap` in property color
- String values in string color
- Numbers and spacing tokens in numeric color

## Documentation

- [Wire DSL Syntax Guide](../../docs/dsl-syntax.md)
- [Component Reference](../../docs/COMPONENTS_REFERENCE.md)
- [Layout Engine](../../specs/layout-engine.md)

## Contributing

### For Wire DSL Contributors

The VS Code extension is a **standalone npm project** for easier contribution:

```bash
# Clone the repository
git clone https://github.com/develop-wire-dsl/wire-dsl.git
cd wire-dsl/packages/vscode-extension

# Setup (one-time)
npm install

# Development with watch mode
npm run esbuild-watch

# Debug in VS Code
# Press F5 to launch with debugger
```

### Why Standalone npm?

- ✅ Independent from pnpm monorepo (no conflicts)
- ✅ Easy for new contributors (`npm install` works)
- ✅ Clear dependency resolution
- ✅ Standard VS Code extension setup
- ✅ Prevents npm/pnpm conflicts

The extension is still part of the Wire DSL git repo for coordinated releases and documentation.

## License

MIT - See LICENSE file in root directory
