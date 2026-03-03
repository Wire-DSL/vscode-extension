# Wire DSL - VS Code Extension

Wireframe and UI prototyping with **Wire DSL** — syntax highlighting, smart autocompletion, live preview, and export to SVG/PDF/PNG.

## Features

### Syntax Highlighting
Complete syntax highlighting for Wire DSL with intelligent tokenization:
- **Keywords** — `project`, `screen`, `layout`, `component`, `cell`, `define`, `style`, `colors`, `mocks`
- **Layouts** — `stack`, `grid`, `panel`, `split`, `card`
- **Components** — 31 built-in UI components: `Button`, `Input`, `Table`, `Chart`, `Modal`, etc.
- **Properties** — `text`, `variant`, `icon`, `padding`, `gap`, `direction`, `columns`, etc.
- **Values** — colors, spacing tokens (`xs`, `sm`, `md`, `lg`, `xl`), numbers
- **Comments** — `//` line and `/* */` block comments
- **Bracket matching** and auto-pairing

### Code Intelligence
Context-aware development experience:
- **Autocompletion** — Smart suggestions based on document scope (project, screen, layout)
- **Required properties** — Component and layout snippets auto-include required properties
- **Hover Documentation** — Component, layout, and keyword documentation on hover
- **Go-to-Definition** (Ctrl+Click) — Jump to user-defined component definitions
- **Find References** (Shift+F12) — Find all usages of user-defined components
- **Property values** — Enum values for properties like `variant`, `direction`, `size`

### Live Preview
Real-time visual feedback as you code:
- **SVG Rendering** — See your Wire DSL rendered as SVG
- **Multi-Screen Support** — Switch between screens with a dropdown selector
- **Dark/Light Theme** — Toggle between themes or auto-detect from VS Code
- **Zoom Controls** — Zoom in/out with Ctrl+Scroll or on-screen buttons
- **Auto-Refresh** — Updates automatically as you edit

### Export
Export your wireframes to multiple formats:
- **SVG** — Vector format, scalable
- **PDF** — Document format
- **PNG** — Raster image format

## Installation

### From Marketplace
Search for **"Wire DSL"** in the VS Code Extensions panel, or visit the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=wire-dsl.wire-dsl).

### Local Installation

#### Prerequisites
- **Node.js** 18+
- **VS Code** 1.108+

#### Quick Start

```bash
git clone https://github.com/Wire-DSL/vscode-extension.git
cd vscode-extension
npm install
npm run package
```

This compiles, packages as `.vsix`, and installs the extension in VS Code. Restart VS Code to activate.

#### Development

```bash
npm install           # Install dependencies
npm run esbuild-watch # Watch mode (recompiles on save)
# Press F5 in VS Code to launch Extension Development Host

npm run test          # Run tests
npm run package-only  # Build .vsix without installing
```

## Usage

1. **Open a `.wire` file** — syntax highlighting activates automatically
2. **Autocompletion** — start typing or press Ctrl+Space for context-aware suggestions
3. **Hover** — hover over components, layouts, or keywords for documentation
4. **Navigate** — Ctrl+Click on user-defined components to jump to their definition
5. **Preview** — Ctrl+Shift+V to open live SVG preview
6. **Export** — Ctrl+Shift+S to export as SVG, PDF, or PNG

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Preview | Ctrl+Shift+V | Cmd+Shift+V |
| Export As | Ctrl+Shift+S | Cmd+Shift+S |
| Go to Definition | Ctrl+Click | Cmd+Click |
| Find References | Shift+F12 | Shift+F12 |

## Example

Create a file named `dashboard.wire`:

```
project "Dashboard" {
  style {
    density: "comfortable"
    spacing: "md"
    radius: "md"
  }

  screen Main {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Topbar title: "Dashboard" subtitle: "Overview"

      layout grid(columns: 12, gap: md) {
        cell span: 4 {
          component Stat title: "Users" value: "1,234"
        }
        cell span: 4 {
          component Stat title: "Revenue" value: "$12.5k" variant: success
        }
        cell span: 4 {
          component Stat title: "Orders" value: "89" variant: info
        }
      }

      layout card(padding: lg, gap: md) {
        component Heading text: "Recent Activity"
        component Table columns: "Name, Date, Status, Amount" rows: 5
      }
    }
  }
}
```

## Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # Entry point & provider registration
│   ├── completionProvider.ts     # Context-aware autocompletion
│   ├── hoverProvider.ts          # Hover documentation
│   ├── definitionProvider.ts     # Go-to-definition
│   ├── referenceProvider.ts      # Find references
│   ├── webviewPanelProvider.ts   # Live SVG preview panel
│   └── services/
│       ├── parseService.ts       # @wire-dsl/engine integration
│       └── exportManager.ts      # SVG/PDF/PNG export
├── syntaxes/
│   └── wire.tmLanguage.json      # TextMate grammar
├── icons/                        # Extension icons
├── language-configuration.json   # Bracket pairing, indentation
└── package.json
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `@wire-dsl/engine` | Wire DSL parser, IR generator, and layout engine |
| `@wire-dsl/exporters` | SVG/PDF/PNG export |
| `@wire-dsl/language-support` | Component metadata, completions, documentation, and document parsing |

## Built-in Components

**Text** — Heading, Text, Label, Paragraph, Code
**Actions** — Button, Link, IconButton
**Inputs** — Input, Textarea, Select, Checkbox, Radio, Toggle
**Navigation** — Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs
**Data** — Table, List, Stat, Card, Chart
**Media** — Image, Icon
**Layout** — Divider, Separate
**Feedback** — Badge, Alert, Modal

## Layout Containers

| Layout | Description |
|--------|-------------|
| `stack` | Vertical or horizontal stacking (required: `direction`) |
| `grid` | Column-based grid with `cell` children |
| `split` | Side-by-side panes |
| `panel` | Bordered container |
| `card` | Card with shadow and rounded corners |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT
