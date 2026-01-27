# Wire DSL - VS Code Extension

Syntax highlighting, autocompletion, and preview for **Wire DSL** `.wire` files.

## Features

### 🎨 Syntax Highlighting
Complete syntax highlighting for Wire DSL with intelligent tokenization:
- **Keywords** (`project`, `screen`, `stack`, `grid`, `panel`, `split`, `form`, `table`)
- **Components** (40+ UI components: `Button`, `Input`, `Card`, `Table`, etc.)
- **Properties** (`id`, `label`, `color`, `background`, `width`, `height`, etc.)
- **Values** (colors, spacing tokens, numbers)
- **Comments** (`//` and `/* */` with proper styling)
- **Bracket matching** and auto-pairing

### 💡 Code Intelligence
Context-aware development experience:
- **Autocompletion** (Ctrl+Space) - Intelligent suggestions for keywords, components, and properties
- **Hover Documentation** - Full component and property documentation on hover
- **Go-to-Definition** (Ctrl+Click) - Jump to component definitions
- **Find References** (Ctrl+Shift+H) - Find all usages of components

### 👁️ Live Preview
Real-time visual feedback as you code:
- **Interactive SVG Rendering** - See your Wire DSL rendered as interactive SVG
- **Multi-Screen Support** - Switch between screens with a dropdown selector (when file has multiple screens)
- **Persistent Zoom** - Zoom level is maintained when switching screens or editing code
- **Dark/Light Theme Support** - Toggle between themes with automatic VS Code detection
- **Zoom Controls** - Zoom in/out with Ctrl+Scroll wheel or on-screen buttons
- **Auto-Refresh** - Updates automatically on file save
- **Keyboard Shortcuts** (Ctrl+Shift+V to open)

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
│   ├── extension.ts                  # Entry point & provider registration
│   ├── completionProvider.ts         # Intelligent context-aware completions
│   ├── hoverProvider.ts              # Hover documentation tooltips
│   ├── definitionProvider.ts         # Go-to-definition navigation
│   ├── referenceProvider.ts          # Find references (all usages)
│   ├── webviewPanelProvider.ts       # Live SVG preview panel
│   ├── webviewProvider.ts            # Alternative webview provider
│   ├── data/                         # Component metadata & documentation
│   │   ├── components.ts             # Component definitions
│   │   └── documentation.ts          # Component & property docs
│   └── utils/
│       └── documentParser.ts         # DSL parsing utilities
├── syntaxes/
│   └── wire.tmLanguage.json          # TextMate grammar (syntax highlighting)
├── package.json                      # npm dependencies & manifest
├── package-lock.json                 # Locked versions (use npm)
├── tsconfig.json                     # TypeScript configuration
├── language-configuration.json       # Bracket pairing, indentation
├── .npmrc                            # npm config (force npm usage)
└── icons/                            # VS Code extension icons

```

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Usage

1. **Open a `.wire` file** - The extension automatically activates and applies syntax highlighting
2. **Get code completion** - Press Ctrl+Space (Cmd+Space on macOS) or start typing to see intelligent suggestions
3. **Explore documentation** - Hover over components and properties to see detailed documentation
4. **Navigate your code** - Use Ctrl+Click to jump to definitions or Ctrl+Shift+H to find all references
5. **Preview in real-time** - Press Ctrl+Shift+V (or click "Open Preview" in the editor title bar) to see live SVG rendering

### Keyboard Shortcuts

| Action | Shortcut | Mac |
|--------|----------|-----|
| Open Preview | Ctrl+Shift+V | Cmd+Shift+V |
| Find References | Ctrl+Shift+H | Cmd+Shift+H |
| Go to Definition | Ctrl+Click | Cmd+Click |
| Zoom In (Preview) | Ctrl+Scroll | Cmd+Scroll |
| Zoom Out (Preview) | Ctrl+Scroll | Cmd+Scroll |

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
