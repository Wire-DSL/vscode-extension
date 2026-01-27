# Wire-DSL VS Code Extension - AI Instructions Hub

**Last Updated:** January 27, 2026  
**Documentation Language:** English

Central hub for all AI development guidance for the Wire-DSL VS Code Extension.

---

## 🎯 Quick Start by Role

### For GitHub Copilot Users
→ Start with [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)

**Quick reference guide optimized for code completion and suggestion workflow.**

### For Claude Code Users
→ Start with [CLAUDE.md](../../CLAUDE.md)

**Comprehensive instruction guide for deep analysis, refactoring, and complex feature development.**

### For Developers (Manual Development)
→ Start with [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

**Complete development guide with architecture overview, workflows, and coding standards.**

---

## 📚 Documentation Resources

### AI-Specific Instructions

| Document | Purpose |
|----------|---------|
| [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) | **Comprehensive development reference** - Architecture, core concepts, workflows, quality standards, important files |
| [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md) | **GitHub Copilot** - Quick facts, tasks, checklists, code generation |
| [CLAUDE.md](../../CLAUDE.md) | **Claude Code** - System architecture, capabilities, workflows, testing strategies |

### Project Documentation

| Document | Purpose |
|----------|---------|
| [README.md](../../README.md) | Project overview, installation, features |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | System design, layers, data flow, component breakdown |
| [CONTRIBUTING.md](../../CONTRIBUTING.md) | Developer guidelines, setup, code style, contribution workflow |
| [TESTING.md](../../TESTING.md) | Test strategies, debugging approaches, verification checklist |

### Strategic Planning

| Plan | Focus Area | Status |
|------|-----------|--------|
| [plans/20260123-vscode-extension-improvements.md](plans/20260123-vscode-extension-improvements.md) | Feature development and phase tracking | ✅ Complete |

---

## 💡 Quick Start Guides by Role

### 👨‍💻 Developers (Writing New Features)
1. Start with: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
2. Reference: [ARCHITECTURE.md](../../ARCHITECTURE.md)
3. Check: [CONTRIBUTING.md](../../CONTRIBUTING.md)
4. Review: [TESTING.md](../../TESTING.md)

### 🤖 AI Agents (Code Generation)
1. Use: [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md) (GitHub Copilot)
2. Use: [CLAUDE.md](../../CLAUDE.md) (Claude Code)
3. Reference: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) for deeper context

### 🔧 Code Reviewers & Maintainers
1. Check: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#quality-standards) for standards
2. Review: [ARCHITECTURE.md](../../ARCHITECTURE.md)
3. Validate: [TESTING.md](../../TESTING.md) coverage

### 📚 Documentation Writers
1. Reference: [README.md](../../README.md)
2. Update consistency with existing docs
3. Keep aligned with [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 🔍 Finding What You Need

### "I need to understand how [X] works"
1. Check [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) for comprehensive overview
2. For architecture details, read [ARCHITECTURE.md](../../ARCHITECTURE.md)
3. For code examples, check `src/` folder

### "I'm developing a new feature"
1. Read: [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#development-workflows)
2. Follow the development workflow checklist
3. Reference [CONTRIBUTING.md](../../CONTRIBUTING.md)

### "I need to fix a bug"
1. Check [TESTING.md](../../TESTING.md) for debugging approach
2. Review relevant code in `src/`
3. Follow quality standards from [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#quality-standards)

### "I'm using an AI agent"
1. If GitHub Copilot: → [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
2. If Claude Code: → [CLAUDE.md](../../CLAUDE.md)
3. For deeper context: → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

---

## 🎓 Learning Paths

### Beginner (Just Starting)
1. [README.md](../../README.md) - What is this project?
2. [ARCHITECTURE.md](../../ARCHITECTURE.md) - How does it work?
3. [CONTRIBUTING.md](../../CONTRIBUTING.md) - How do I help?
4. Open `.wire` file in Extension Development Host - See it in action

### Intermediate (Building Features)
1. [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) - Development workflows
2. [ARCHITECTURE.md](../../ARCHITECTURE.md) - Deep system understanding
3. Review `src/` code - Implementation details
4. [TESTING.md](../../TESTING.md) - How to test changes

### Advanced (Deep Modifications)
1. [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) - Complete reference
2. [src/webviewPanelProvider.ts](../../src/webviewPanelProvider.ts) - Core implementation
3. `src/*Provider.ts` files - Language provider patterns
4. @wire-dsl/core source - Parser and renderer logic

---

## ✅ Checklist for New Developers

When starting work on Wire-DSL Extension:
- [ ] Read [README.md](../../README.md)
- [ ] Review [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [ ] Check [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [ ] Understand [TESTING.md](../../TESTING.md)
- [ ] Review [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
- [ ] Explore `src/` folder for code organization
- [ ] Setup Extension Development Host (F5)
- [ ] Test with a `.wire` file

---

## 📍 File Organization

```
Wire-DSL/vscode-extension/
├── CLAUDE.md                              # Claude Code instructions (Root)
├── .github/
│   └── COPILOT-INSTRUCTIONS.md            # GitHub Copilot instructions
├── .ai/                                   # AI Instructions Hub ← YOU ARE HERE
│   ├── README.md                          # This file (navigation hub)
│   ├── AI-INSTRUCTIONS-MAIN.md            # Main development guide
│   └── plans/                             # Strategic planning documents
├── src/                                   # TypeScript source code
│   ├── extension.ts
│   ├── webviewPanelProvider.ts
│   ├── hoverProvider.ts
│   ├── definitionProvider.ts
│   ├── referenceProvider.ts
│   ├── completionProvider.ts
│   ├── data/
│   └── utils/
├── package.json
├── tsconfig.json
├── README.md                              # Project README
├── ARCHITECTURE.md                        # System design
├── CONTRIBUTING.md                        # Developer guidelines
└── TESTING.md                             # Test strategies
```

---

## 🚀 Getting Started Right Now

### Step 1: Choose Your Path (2 min)
- **Using GitHub Copilot?** → [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
- **Using Claude Code?** → [CLAUDE.md](../../CLAUDE.md)
- **Manual Development?** → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

### Step 2: Read the Overview (5-15 min)
Pick the document from Step 1 and read it.

### Step 3: Dive Into Details (As Needed)
Use this README to find specific documentation:
- Building features? → [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Understanding system? → [ARCHITECTURE.md](../../ARCHITECTURE.md)
- Testing changes? → [TESTING.md](../../TESTING.md)

### Step 4: Start Coding!
Open the Extension Development Host and start building.

---

## 📞 Support & Questions

For questions about:
- **System Architecture** → [ARCHITECTURE.md](../../ARCHITECTURE.md)
- **How to Contribute** → [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Testing & Debugging** → [TESTING.md](../../TESTING.md)
- **Development Workflows** → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#development-workflows)
- **Code Standards** → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#quality-standards)
- **Quick Navigation** → This file (README.md)

---

## 🎓 Development Workflows

### For Feature Development
1. Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#development-workflows)
2. Follow the development workflow checklist
3. Reference project documentation
4. Write tests and update documentation

### For Bug Fixes
1. Identify the component (parser integration, webview, language provider)
2. Check relevant documentation
3. Review test cases
4. Implement the fix
5. Add test case for the bug

### For Code Review
1. Check against quality standards in [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md#quality-standards)
2. Review test coverage
3. Verify documentation updates
4. Check for TypeScript strict mode compliance

---

## 💡 How to Navigate This System

```
AI Agent or Developer
        ↓
    [Start Here]
        ↓
Choose your role/agent:
├─ GitHub Copilot? → [.github/COPILOT-INSTRUCTIONS.md](../../.github/COPILOT-INSTRUCTIONS.md)
├─ Claude Code?     → [CLAUDE.md](../../CLAUDE.md)
└─ Manual Dev?      → [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
        ↓
    [Need more details?]
        ↓
    [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)
        ↓
    [Need specific info?]
        ↓
    [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md)
        ↓
    [Reference topic details?]
        ↓
    [README.md](../../README.md) or [ARCHITECTURE.md](../../ARCHITECTURE.md)
```

---

## ✨ Key Features of This Setup

✅ **Centralized** - All AI guidance in `.ai/` folder  
✅ **Well-Organized** - Clear hierarchy and structure  
✅ **Multi-Level** - From quick references to comprehensive guides  
✅ **AI-Optimized** - Tailored formats for different AI agents  
✅ **Comprehensive** - Covers all aspects of extension development  
✅ **English-Only** - Consistent documentation language  
✅ **Well-Linked** - Clear cross-references between documents  
✅ **Easy to Maintain** - Single source of truth for each topic  

---

## 📍 Project Structure

```
Wire-DSL/vscode-extension/
├── CLAUDE.md                              # Claude Code instructions (Root)
├── .github/
│   └── COPILOT-INSTRUCTIONS.md            # GitHub Copilot instructions
├── .ai/                                   # AI Instructions Hub ← YOU ARE HERE
│   ├── README.md                          # This folder's overview
│   ├── AI-INSTRUCTIONS-MAIN.md            # Main development guide
│   ├── AI-INSTRUCTIONS-INDEX.md           # Navigation & resource index
│   └── plans/                             # Strategic planning documents
├── src/                                   # TypeScript source code
│   ├── extension.ts
│   ├── webviewPanelProvider.ts
│   ├── hoverProvider.ts
│   ├── definitionProvider.ts
│   ├── referenceProvider.ts
│   ├── completionProvider.ts
│   ├── data/
│   └── utils/
├── package.json
├── tsconfig.json
├── README.md                              # Project README
├── ARCHITECTURE.md                        # System design
├── CONTRIBUTING.md                        # Developer guidelines
└── TESTING.md                             # Test strategies
```

---

## 📞 Support & Navigation

**Finding information?**
→ Use [AI-INSTRUCTIONS-INDEX.md](AI-INSTRUCTIONS-INDEX.md) as your navigation hub

**Learning the codebase?**
→ Start with [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md)

**Using an AI agent?**
→ Check the agent-specific file at root or .github/

**Need project documentation?**
→ Check [README.md](../../README.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md)

**Looking for test examples?**
→ Check [TESTING.md](../../TESTING.md) or `src/` folder

---

**Last Updated:** January 27, 2026  
**Documentation Language:** English  
**For:** Wire-DSL VS Code Extension v0.2.2+

**Next Step:** Read [AI-INSTRUCTIONS-MAIN.md](AI-INSTRUCTIONS-MAIN.md) or go to your agent entry point (CLAUDE.md or .github/COPILOT-INSTRUCTIONS.md)
