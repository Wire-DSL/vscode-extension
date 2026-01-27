# GitHub Copilot Instructions for Wire-DSL VS Code Extension

**Quick Reference → [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)**

---

## 🎯 For GitHub Copilot Users

This file points you to the centralized AI development guidance. All detailed instructions are in the `.ai/` folder.

### What is Wire-DSL VS Code Extension?
A **TypeScript-based VS Code extension** that provides:

**Features:**
- Syntax highlighting for `.wire` files
- Hover documentation for components
- Go-to-definition navigation
- Code completion for components and properties
- Live preview panel with zoom and theme support
- Real-time SVG rendering

**Tech Stack:**
- **Language:** TypeScript 5.0+
- **Framework:** VS Code Extension API
- **Parser:** @wire-dsl/core module
- **Build:** esbuild

---

## 📚 Complete Development Guide

**→ [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)**

Contains all detailed information about:
- Extension architecture and processing pipeline
- Language providers (Hover, Definition, References, Completion)
- Webview preview panel features
- Development workflows for features and bug fixes
- Quality standards and coding patterns
- Important files reference
- Integration with @wire-dsl/core

**Time:** 15-20 minutes to read

---

## 🔍 Find Specific Information

**→ [../.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md)**

Quick lookup hub with:
- Navigation tables by topic
- Cross-references to all resources
- Learning paths by role
- Support section with topic links

---

## ⚡ Quick Links

| Need | Link |
|------|------|
| **Complete Guide** | [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md) |
| **Find Info** | [../.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md) |
| **System Design** | [../ARCHITECTURE.md](../ARCHITECTURE.md) |
| **Coding Style** | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| **Testing** | [../TESTING.md](../TESTING.md) |
| **Core Concepts** | [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md#core-concepts) |

---

## 💡 Key Facts

### Architecture
- **Extension Entry:** `src/extension.ts` - Activation and provider registration
- **Preview Panel:** `src/webviewPanelProvider.ts` - Live rendering and zoom
- **Language Providers:** `src/*Provider.ts` - Hover, definition, completion, references
- **Data Files:** `src/data/` - Component definitions and documentation
- **Parser Integration:** `src/utils/documentParser.ts` - @wire-dsl/core wrapper

### Component Catalog
- **23 UI components** organized in 6 categories
- **5 layout containers** (Stack, Grid, Split, Panel, Card)
- Definitions in `src/data/components.ts`
- Documentation in `src/data/documentation.ts`

### File Types
- `.wire` files - Wire DSL source code
- `.tmLanguage.json` - Syntax highlighting rules
- `.ts` files - TypeScript implementation

### Build System
- esbuild for bundling and minification
- TypeScript strict mode enabled
- ESLint for code quality

---

## 🔑 Development Pattern

**Common File Organization:**
```
src/
  ├── extension.ts           # Activation + registration
  ├── webviewPanelProvider.ts  # Preview implementation
  ├── hoverProvider.ts       # Hover documentation
  ├── definitionProvider.ts  # Go-to-definition
  ├── referenceProvider.ts   # Find references
  ├── completionProvider.ts  # Code completion
  ├── data/
  │   ├── components.ts      # Component specs (23 types)
  │   └── documentation.ts   # Component documentation
  └── utils/
      └── documentParser.ts  # Parser integration
```

---

## 🎯 Common Tasks

### Adding a New Language Provider
1. Create `src/yourProvider.ts` implementing `vscode.YourProviderInterface`
2. Register in `src/extension.ts` using `vscode.languages.register()`
3. Add data to `src/data/documentation.ts` if needed
4. Test with a `.wire` file
5. Document in `ARCHITECTURE.md`

### Improving the Preview
1. Check `src/webviewPanelProvider.ts` for TypeScript side
2. Update HTML/CSS/JavaScript in the same file
3. Reference `src/utils/documentParser.ts` for @wire-dsl/core integration
4. Test by opening a `.wire` file

### Fixing a Bug
1. Create test case with `.wire` file
2. Identify issue location in `src/` 
3. Implement fix following TypeScript strict mode
4. Verify with manual testing
5. Document if needed

---

## ✨ Key Features

- ✅ Real-time syntax highlighting
- ✅ Hover documentation with component info
- ✅ Go-to-definition navigation
- ✅ Code completion for components
- ✅ Live preview with zoom controls
- ✅ Dark/light theme support
- ✅ Configuration settings
- ✅ Keyboard shortcuts

---

## 📋 Quality Checklist

Before suggesting code:
- [ ] Follows TypeScript strict mode
- [ ] Proper PascalCase for classes, camelCase for functions
- [ ] TSDoc comments for public APIs
- [ ] No breaking changes
- [ ] Fits existing code patterns
- [ ] Handles edge cases

---

## 📞 Support & Help

**Need help with:**
- **Extension design** → [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Developer guidelines** → [../CONTRIBUTING.md](../CONTRIBUTING.md)
- **Testing approach** → [../TESTING.md](../TESTING.md)
- **Complete reference** → [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)
- **Finding info** → [../.ai/AI-INSTRUCTIONS-INDEX.md](../.ai/AI-INSTRUCTIONS-INDEX.md)

---

## 🚀 Quick Start

1. **Understand the architecture** → [../ARCHITECTURE.md](../ARCHITECTURE.md)
2. **Review coding style** → [../CONTRIBUTING.md](../CONTRIBUTING.md)
3. **Check examples** → Look at existing providers in `src/`
4. **Test your code** → Open `.wire` file in Extension Development Host
5. **Reference when needed** → [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)

---

**Last Updated:** January 27, 2026  
**For Complete Guidance:** → [../.ai/AI-INSTRUCTIONS-MAIN.md](../.ai/AI-INSTRUCTIONS-MAIN.md)
