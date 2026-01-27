# Claude Code Instructions for Wire-DSL VS Code Extension

**Quick Reference → [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md)**

---

## 🎯 For Claude Code Users

This file points you to the centralized AI development guidance. All detailed instructions are in the `.ai/` folder.

### What is Wire-DSL VS Code Extension?
A **TypeScript-based VS Code extension** that provides:
- **Language Support:** Syntax highlighting, hover docs, go-to-definition, code completion
- **Live Preview:** Real-time SVG rendering of Wire DSL diagrams
- **Integration:** Works with @wire-dsl/core for parsing and rendering

**Core Stack:**
- **Language:** TypeScript 5.0+
- **Framework:** VS Code Extension API
- **Parser:** @wire-dsl/core module
- **UI:** Webview panels + Language providers
- **Build:** esbuild bundling

---

## 📚 Complete Development Guide

**→ [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md)**

Contains all detailed information about:
- Extension architecture and system design
- Language provider implementation patterns
- Webview panel features and integration
- Development workflows for features and bug fixes
- Quality standards and testing approach
- Important files and code locations
- Getting help & support

**Time:** 15-20 minutes to read

---

## 🔍 Find Specific Information

**→ [.ai/AI-INSTRUCTIONS-INDEX.md](.ai/AI-INSTRUCTIONS-INDEX.md)**

Quick lookup hub with:
- Navigation tables by topic
- Cross-references to all resources
- Learning paths by role
- Support section with topic links

---

## ⚡ Quick Links

| Need | Link |
|------|------|
| **Complete Guide** | [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md) |
| **Find Info** | [.ai/AI-INSTRUCTIONS-INDEX.md](.ai/AI-INSTRUCTIONS-INDEX.md) |
| **System Design** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Developer Guide** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Testing Guide** | [TESTING.md](TESTING.md) |
| **Project README** | [README.md](README.md) |

---

## 💡 Common Tasks

Detailed instructions for these in [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md):

- **Adding a new language provider** - Full development workflow
- **Improving the preview panel** - Feature development guide
- **Fixing bugs** - Debugging and testing strategy
- **Integrating with @wire-dsl/core** - Parser integration patterns
- **Code quality** - Standards and pre-commit checklist

---

## 🚀 Getting Started

1. **Read:** [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md) (comprehensive, 15-20 min)
2. **Bookmark:** [.ai/AI-INSTRUCTIONS-INDEX.md](.ai/AI-INSTRUCTIONS-INDEX.md) (quick lookup)
3. **Reference:** [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. **Code:** Using the guidance above

---

## 📂 Project Structure

```
Wire-DSL/vscode-extension/
├── packages/core/            @wire-dsl/core (external dependency)
├── .ai/                      AI DEVELOPMENT GUIDANCE (← Central Hub)
├── src/                      TypeScript source code
├── ARCHITECTURE.md           System design
├── CONTRIBUTING.md           Developer guidelines
├── TESTING.md               Test strategies
└── README.md                Project README
```

---

## ✅ Before You Code

**Checklist:**
- [ ] Read [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md)
- [ ] Understand VS Code extension architecture
- [ ] Know how @wire-dsl/core is integrated
- [ ] Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- [ ] Setup Extension Development Host (F5 in VS Code)

---

**Last Updated:** January 27, 2026  
**For Complete Guidance:** → [.ai/AI-INSTRUCTIONS-MAIN.md](.ai/AI-INSTRUCTIONS-MAIN.md)
