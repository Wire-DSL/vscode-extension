# 📋 Plan: VS Code Extension - Component Support & Live Preview

**Date**: January 23, 2026  
**Last Updated**: January 27, 2026 - Phase 4 Complete  
**Status**: ✅ COMPLETE - All 4 Phases Finished
**Complexity**: 🟡 Medium (4 phases, now standalone npm project)

---

## 📌 Executive Summary

Enhance the Wire-DSL VS Code extension to provide a professional IDE experience by:
1. Updating component catalog with newly created components
2. Supporting user-defined components (`define Component`) with IntelliSense
3. Adding live preview panel rendering `.wire` files as SVG in real-time

**Primary objectives**:
1. ✅ Sync component catalog with core registry (manual approach)
2. ✅ Implement Hover Provider for component/property documentation
3. ✅ Implement Definition Provider for user-created components
4. ⏳ Create Webview Preview Panel with 500ms debouncing
5. ⏳ Integrate core parser & renderer into extension

**Checkpoint - January 26, 2026**:
- ✅ **Project restructured**: Migrated from pnpm monorepo to standalone npm project
- ✅ **Phases 1-3 complete**: All implemented and tested
- ✅ **Extension installed**: Available in VS Code
- ⏳ **Phase 4 pending**: Webview preview panel
- 📍 **Repository**: Now independent project (separate from monorepo)

---

## 🔍 Research Findings

### Current Extension State

| Feature | Status | Location |
|---------|--------|----------|
| **Syntax Highlighting** | ✅ Complete | `syntaxes/wire.tmLanguage.json` |
| **Autocompletion** | ✅ Complete | `src/completionProvider.ts`, `src/data/components.ts` |
| **Hover Tooltips** | ❌ Missing | To implement |
| **Go-to-Definition** | ❌ Missing | To implement |
| **Live Preview** | ❌ Missing | To implement |
| **Custom Components** | ⚠️ Parsed only | Supported in core, not in IDE |

### Component Registry Status
- **Current**: 30 built-in components (validated against core renderer)
- **Location**: [src/data/components.ts](packages/vscode-extension/src/data/components.ts)
- **Source of Truth**: [core/src/renderer/index.ts](packages/core/src/renderer/index.ts) (component rendering logic)
- **Approach**: Manual synchronization with documentation comment reference

### Components to Update
**Remove (false positives):**
- `Card` - Now a layout container, not a component
- `Panel` - Now a layout container, not a component

**Add (pending feature branch):**
- `Icon` - Visual icon component (`type` and `size` properties)
- `IconButton` - Button with icon only (`icon`, `variant`, `size` properties)

**Support (already in DSL):**
- `define Component "Name" {...}` - User-defined reusable components (full DSL support)

### Core Integration Available
- **Parser**: `@wire-dsl/core` exports parse function (Chevrotain-based)
- **IR Generator**: Full schema validation with Zod
- **Layout Engine**: Calculates positions and dimensions
- **Renderer**: SVG generation with MockDataGenerator and ColorResolver
- **No breaking changes** - core APIs stable for extension consumption

---

### **BONUS FEATURE: User-Defined Component Documentation**
**Status**: ✅ IMPLEMENTED & ENHANCED | **Date**: January 25, 2026

#### Core Changes (Parser)
- **File**: [packages/core/src/parser/index.ts](packages/core/src/parser/index.ts)
  - Added `BlockComment` token to support `/* ... */` syntax
  - Now supports both line comments (`//`) and block comments (`/* */`)
  - Proper regex pattern `/\/\*[\s\S]*?\*\//` for multi-line comments

#### Extension Changes
- **File**: [src/utils/documentParser.ts](packages/vscode-extension/src/utils/documentParser.ts)
  - Updated `extractComponentDefinitions()` to parse `/* */` block comments
  - Handles multi-line block comments with proper formatting
  - Removes comment markers and extra asterisks from content
  - Updated `ComponentDefinition` interface to include `documentation?: string`

- **File**: [src/hoverProvider.ts](packages/vscode-extension/src/hoverProvider.ts)
  - Enhanced to display user-defined component documentation on hover
  - Shows "User-defined component" label + documentation text
  - Works for both component references and definitions

#### Documentation Updates
- **File**: [docs/dsl-syntax.md](docs/dsl-syntax.md)
  - Added general "Comments" section documenting line and block comments
  - Updated component documentation examples to use `/* */` syntax
  - Comprehensive guide on documentation-style block comments
  - All pattern examples include proper documentation

#### Syntax
```wire
/**
 * Component description
 * Additional details here
 */
define Component "CustomButton" {
  layout stack(direction: horizontal) {
    component Button text: "Custom"
  }
}
```

#### Features
- Multi-line documentation support with proper formatting
- Appears on hover over component name in IDE
- Supported by the core compiler (not skipped)
- Works for both component references and definitions
- No runtime overhead (extracted at IDE-time only)
- Compatible with syntax highlighter's block comment support

### **PHASE 1: Update Component Catalog (Remove Falses, Add Pending, Document User Components)**
**Impact**: Low | **Duration**: ~30 min | **Risk**: Low | **Blockers**: None

#### 1.1 Remove False Components
- **File**: [src/data/components.ts](packages/vscode-extension/src/data/components.ts)
- **Action**: Remove these entries (they are layouts, not components):
  - `Card` object definition
  - `Panel` object definition
  - Remove from `COMPONENTS` export
- **Reason**: Both moved to `LAYOUTS` in the DSL; having them as components creates confusion and incorrect autocomplete suggestions

#### 1.2 Add Pending Components
- **File**: [src/data/components.ts](packages/vscode-extension/src/data/components.ts)
- **Action**: Add two new component entries:
  ```typescript
  Icon: {
    name: 'Icon',
    description: 'Icon element (visual symbol)',
    properties: ['type', 'size'],
    propertyValues: {
      size: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    example: 'component Icon type: "home" size: "md"',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Icon-only button element',
    properties: ['icon', 'variant', 'size'],
    propertyValues: {
      variant: ['primary', 'secondary', 'ghost'],
      size: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    example: 'component IconButton icon: "plus" variant: "primary" size: "md"',
  },
  ```
- **Reason**: These components are in feature branch and will be merged to main in upcoming days
- **Note**: Update completionProvider imports to include these

#### 1.3 Document User-Defined Components Support
- **File**: [src/data/components.ts](packages/vscode-extension/src/data/components.ts) (top comment)
- **Action**: Add reference comment showing:
  - Where to sync built-in components from
  - How user-defined components work in the DSL
  - Example of `define Component` syntax
  ```typescript
  // SYNC SOURCES:
  // 1. Built-in components: packages/core/src/renderer/index.ts renderComponent() method
  // 2. User-defined components: Syntax is `define Component "Name" { ... }`
  //    These are parsed and resolved before IR generation. Support implemented in Phase 3.
  // Last synced: YYYY-MM-DD with version X.X.X
  // Current components: 32 built-in + unlimited user-defined
  ```

#### 1.4 Update Completion Provider
- **File**: [src/completionProvider.ts](packages/vscode-extension/src/completionProvider.ts)
- **Action**: Ensure completion items reflect the updated catalog
- **Changes needed**:
  - Import `Icon` and `IconButton` from updated components
  - Remove `Card` and `Panel` from component completion suggestions
  - Component count should now be 32 (30 original + Icon + IconButton)
  - Completion should remain context-aware (inside layouts/components)

---

### **PHASE 2: Implement Hover Provider**
**Impact**: Medium | **Duration**: ~2h | **Risk**: Low | **Blockers**: Phase 1 ✅

#### 2.1 Create Hover Provider
- **File**: [src/hoverProvider.ts](packages/vscode-extension/src/hoverProvider.ts) (new)
- **Implementation**:
  - Implement `HoverProvider` interface from `vscode`
  - Detect if cursor is on:
    - Component name → show component metadata + properties
    - Property name → show property type and allowed values
    - Property value → show enum options or description
  - Use regex or simple tokenizer to identify token at cursor position
  - Return `Hover` with `MarkdownString` documentation

#### 2.2 Component Documentation Data
- **File**: [src/data/documentation.ts](packages/vscode-extension/src/data/documentation.ts) (new)
- **Implementation**:
  - Export `COMPONENT_DOCS`: Map<string, markdown documentation>
  - Export `PROPERTY_DOCS`: Map<string, property description>
  - Include examples, default values, and constraints
  - Format as VS Code MarkdownString for rich display

#### 2.3 Register Provider
- **File**: [src/extension.ts](packages/vscode-extension/src/extension.ts)
- **Action**: Register hover provider on activation:
  ```typescript
  vscode.languages.registerHoverProvider('wire', new HoverProvider());
  ```
- **Scope**: Apply to entire `wire` language documents

---

### **PHASE 3: Implement Definition Provider (Go-to-Definition)**
**Impact**: Medium | **Duration**: ~2.5h | **Risk**: Medium | **Blockers**: None

#### 3.1 Create Definition Provider
- **File**: [src/definitionProvider.ts](packages/vscode-extension/src/definitionProvider.ts) (new)
- **Implementation**:
  - Implement `DefinitionProvider` interface from `vscode`
  - On cursor position:
    - Parse current document to extract all `define Component "Name"` statements
    - Build map: `componentName` → `line number` + `file URI`
    - If cursor is on component reference, return `Location` pointing to definition
  - Handle edge cases:
    - Built-in components → return `undefined` (no definition to jump to)
    - User-defined components → return exact location of `define Component "Name"`
    - Comments/strings → return `undefined`
  - **User-defined component support**: Detect when cursor is on a custom component name and resolve to its definition statement

#### 3.2 Document Parser
- **File**: [src/utils/documentParser.ts](packages/vscode-extension/src/utils/documentParser.ts) (new)
- **Implementation**:
  - Export function `extractComponentDefinitions(text: string)`
  - Use regex: `/define\s+Component\s+"([^"]+)"/g`
  - Return array: `{ name: string, line: number, character: number }`
  - Handle multi-line definitions gracefully

#### 3.3 Reference Resolution
- **File**: [src/utils/tokenizer.ts](packages/vscode-extension/src/utils/tokenizer.ts) (new or use existing)
- **Implementation**:
  - Export function `getTokenAtPosition(document, position)`
  - Return token text and token type (component_name, property, value, etc.)
  - Context-aware: know if token is inside layout/component/etc

#### 3.4 Register Provider
- **File**: [src/extension.ts](packages/vscode-extension/src/extension.ts)
- **Action**: Register definition provider:
  ```typescript
  vscode.languages.registerDefinitionProvider('wire', new DefinitionProvider());
  ```

---

### **PHASE 4: Create Webview Preview Panel**
**Impact**: High | **Duration**: ~3h | **Risk**: Medium | **Blockers**: None

#### 4.1 Create Webview View Provider
- **File**: [src/webviewProvider.ts](packages/vscode-extension/src/webviewProvider.ts) (new)
- **Implementation**:
  - Implement `WebviewViewProvider` interface
  - On activation: create webview with local resource roots restricted to workspace
  - Render HTML container for SVG output
  - Implement message protocol for file content updates

#### 4.2 Integration with Core Renderer
- **File**: [src/webviewProvider.ts](packages/vscode-extension/src/webviewProvider.ts)
- **Implementation**:
  - Import from `@wire-dsl/core`:
    ```typescript
    import { parse, IRGenerator, LayoutEngine, SVGRenderer } from '@wire-dsl/core';
    ```
  - Create `renderPreview(wireContent: string): string` function:
    1. Parse: `const ast = parse(wireContent)`
    2. Generate IR: `const ir = new IRGenerator().generate(ast)`
    3. Calculate layout: `const layout = new LayoutEngine(ir).calculate()`
    4. Render SVG: `const svg = new SVGRenderer(ir, layout).render()`
    5. Return SVG string or error message
  - Error handling:
    - Parsing errors → display error message with line number
    - Validation errors → display helpful error in webview
    - Rendering errors → display fallback message

#### 4.3 Live Update with Debouncing
- **File**: [src/webviewProvider.ts](packages/vscode-extension/src/webviewProvider.ts)
- **Implementation**:
  - Subscribe to `vscode.workspace.onDidChangeTextDocument` event
  - **Debounce**: Implement 500ms debounce timer (clear on new change, restart timer)
  - On debounce fire: extract active editor content → render preview → post message to webview
  - File watcher: Re-render on file save explicitly (in addition to debounced live updates)
  - Performance optimization: Only render if document language is `wire`

#### 4.4 HTML & CSS for Webview
- **File**: [src/webviewProvider.ts](packages/vscode-extension/src/webviewProvider.ts) (embedded or separate)
- **Implementation**:
  - Create HTML template with:
    - Container `<div id="preview">` for SVG output
    - CSS for responsive sizing
    - Error message placeholder `<div id="error" class="hidden">`
    - Loading state indicator (optional)
  - Styling:
    - Dark/light theme support (use VS Code theme variables)
    - Overflow handling for large designs
    - Proper SVG scaling and centering

#### 4.5 Message Protocol
- **File**: [src/webviewProvider.ts](packages/vscode-extension/src/webviewProvider.ts)
- **Implementation**:
  - Extension → Webview messages:
    ```json
    {
      "command": "update",
      "svg": "<svg>...</svg>"
    }
    {
      "command": "error",
      "message": "Parse error at line 5: ..."
    }
    ```
  - Webview → Extension: Not needed initially (extension drives updates)

#### 4.6 Register Webview View Provider
- **File**: [src/extension.ts](packages/vscode-extension/src/extension.ts)
- **Action**:
  ```typescript
  vscode.window.registerWebviewViewProvider('wirePreview', new WebviewProvider());
  ```

#### 4.7 Update Package Manifest
- **File**: [package.json](packages/vscode-extension/package.json)
- **Changes**:
  ```json
  {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "wire-preview",
          "title": "Wire Preview",
          "icon": "icons/preview.svg"  // if icon available
        }
      ]
    },
    "views": {
      "wire-preview": [
        {
          "id": "wirePreview",
          "name": "Preview",
          "when": "editorLangId == wire"
        }
      ]
    }
  }
  ```
- **Also add**: `@wire-dsl/core` to `dependencies` if not already present

---

## 🎯 Success Criteria

| Phase | Criterion | Verification |
|-------|-----------|--------------|
| **Phase 1** | All new components in catalog | Compare completion list with core renderer |
| **Phase 2** | Hover shows correct docs | Hover over component name → see description |
| **Phase 3** | Go-to-Definition works | Click on custom component → jump to `define` |
| **Phase 4** | Preview renders designs | Open `.wire` file → SVG appears in panel |
| **Phase 4** | Debouncing works | Change file → wait 500ms → preview updates (not instant) |
| **Phase 4** | Error display | Break syntax → clear error message in preview |

---

## ⚠️ Potential Issues & Mitigations

| Issue | Severity | Mitigation |
|-------|----------|-----------|
| Core API changes break extension | High | Vendor core APIs or use stable exports; add version pinning in package.json |
| Rendering large files hangs UI | High | Use webworker for heavy compute; currently acceptable with debouncing |
| SVG too large (performance) | Medium | Implement canvas caching; defer optimization if not critical |
| Custom component infinite recursion | Medium | Validate in IR generator (core already does this) |
| Webview CSP restrictions | Medium | Use `localResourceRoots` and inline SVG; avoid external resources |

---

## 📋 Files Summary

### To Create
- `src/hoverProvider.ts`
- `src/definitionProvider.ts`
- `src/data/documentation.ts`
- `src/webviewProvider.ts`
- `src/utils/documentParser.ts`
- `src/utils/tokenizer.ts` (if needed)

### To Modify
- `src/extension.ts` (register all providers)
- `src/data/components.ts` (add new components)
- `src/completionProvider.ts` (extend with new components)
- `package.json` (add viewsContainers, update dependencies)

### No Changes Needed
- `syntaxes/wire.tmLanguage.json` (grammar already supports all syntax)
- `language-configuration.json` (configuration is complete)

---

## 🔄 Execution Order

1. **Phase 1**: Update catalog (foundation for other phases)
2. **Phase 2**: Implement Hover Provider (quick win, low risk)
3. **Phase 3**: Implement Definition Provider (medium complexity)
4. **Phase 4**: Create Preview Panel (high impact, highest complexity)

Each phase is mostly independent; Phase 1 is prerequisite for Phase 2 only (for documentation completeness).

---

## 📝 Notes

- **Debouncing**: Use `setTimeout` with variable in class scope; clear previous timer before setting new one
- **Testing**: Manual testing sufficient for UI features; unit tests for document parser utilities
- **Rollout**: Can ship phases incrementally; preview panel is the most visible feature to ship last
- **Future**: Icon component implementation will need renderer support in core first

---

## 🏁 CHECKPOINT - January 26, 2026

### Project Migration
**Status**: ✅ COMPLETED  
**What Changed**: Extension moved from pnpm monorepo to standalone npm project  
**Why**: Resolve npm/pnpm conflicts, simplify contributor workflow, improve packaging

### Phases Completion

| Phase | Status | Completion Date | Details |
|-------|--------|-----------------|---------|
| **Phase 1** | ✅ Complete | Jan 25, 2026 | Component catalog updated; Icon & IconButton added |
| **Phase 2** | ✅ Complete | Jan 25, 2026 | Hover provider fully implemented; docs on hover working |
| **Phase 3** | ✅ Complete | Jan 26, 2026 | Definition & Reference providers implemented; Go-to-def working |
| **Phase 4** | ✅ Complete | Jan 27, 2026 | Webview preview panel with zoom, theme toggle, and config settings |

### Implementation Status

#### Phase 1: Component Catalog ✅
- **Card & Panel**: Removed (correctly identified as layouts)
- **Icon & IconButton**: Added with full documentation
- **User-defined components**: Fully supported with block comment documentation (`/* */`)
- **Total components**: 32 built-in + unlimited user-defined

#### Phase 2: Hover Provider ✅
- **File**: `src/hoverProvider.ts`
- **Features**:
  - Component hover → shows description + properties
  - Property hover → shows type and allowed values
  - User-defined component hover → displays extracted documentation
  - Markdown formatting with proper heading levels
- **Status**: Tested and working

#### Phase 3: Definition Provider ✅
- **Files**: 
  - `src/definitionProvider.ts` - Go-to-definition navigation
  - `src/referenceProvider.ts` - Find references (Ctrl+Shift+H)
  - `src/utils/documentParser.ts` - Component definition extraction
- **Features**:
  - Click on component → jump to definition
  - Find all references to component
  - Works for both built-in and user-defined components
  - Context-aware token detection
- **Status**: Tested and working

#### Phase 4: Webview Preview Panel ✅
- **Status**: Completed Jan 27, 2026
- **Features**:
  - Webview panel for real-time `.wire` file preview
  - Zoom controls (in/out/reset) with Ctrl+Scroll support
  - Theme toggle (dark/light) for rendered SVG
  - Configurable default theme setting (default/dark/light)
  - Centered scroll positioning at 50% when zoomed
  - Eye icon with light/dark variants
  - SVG rendered at 1300px width
  - Simplified HTML/CSS for stability
  - Published to VS Code Marketplace (v0.2.2)
- **Next steps**: Maintenance and feature requests

### New Project Structure
```
wire-dsl/                          # Original monorepo (git repo)
├── packages/
│   ├── core/                      # pnpm (unchanged)
│   ├── cli/                       # pnpm (unchanged)
│   ├── web/                       # pnpm (unchanged)
│   └── vscode-extension/
│       ├── src/                   # Extension source
│       ├── package.json           # npm config (standalone)
│       ├── package-lock.json      # npm lock
│       ├── .npmrc                 # Force npm (not pnpm)
│       ├── setup.ps1              # Developer setup
│       ├── build-and-install.ps1  # Build workflow
│       └── [documentation]        # Contributing guides
```

### Documentation Created
- **CONTRIBUTING.md**: Developer contribution guide
- **ARCHITECTURE-DECISION.md**: Why standalone npm approach
- **STANDALONE-SETUP.md**: Setup overview for new developers
- **IMPLEMENTATION-SUMMARY.md**: Complete summary of changes
- **README.md**: Updated with clear setup instructions

### How to Continue

#### For New Developers
```bash
cd wire-dsl/packages/vscode-extension
pwsh setup.ps1              # One-time setup
npm run esbuild-watch       # Development
# In VS Code: Press F5      # Debug mode
```

#### For Phase 4 (Webview Preview)
1. Review `Phase 4: Create Webview Preview Panel` section above
2. Start with `4.1 Create Webview View Provider`
3. Integrate core renderer using:
   ```typescript
   import { parse, IRGenerator, LayoutEngine, SVGRenderer } from '@wire-dsl/core';
   ```
4. Test with sample `.wire` files
5. Implement 500ms debounce for live updates

### Known Limitations & Next Steps

**Current Status**: ✅ All planned features implemented

**Completed Deliverables**:
- ✅ Component catalog with proper categorization
- ✅ Hover documentation with markdown support
- ✅ Go-to-definition for user components
- ✅ Find references functionality
- ✅ Live preview with debouncing
- ✅ Zoom controls and theme switching
- ✅ Published to VS Code Marketplace

**Future Enhancement Opportunities**:
1. Support Icon component rendering (requires core-side updates)
2. Add more customization options to preview (grid, zoom presets)
3. Export preview as PNG/SVG
4. Collaborative preview features

### Validation Checklist
- ✅ Extension installs successfully: `npm run package`
- ✅ Hover provider shows documentation
- ✅ Go-to-definition works (Ctrl+Click)
- ✅ Find references works (Ctrl+Shift+H)
- ✅ User-defined component docs appear on hover
- ✅ Error messages clear and helpful
- ✅ No npm/pnpm conflicts

### Repository Location
**Previous**: Integrated in monorepo (`packages/vscode-extension/`)  
**Current**: Can be developed independently (same location, standalone npm)  
**Future**: Option to separate into dedicated repo if needed

---

**Checkpoint Created**: January 27, 2026 @20:15 UTC  
**Project Status**: ✅ COMPLETE - All phases delivered and published to marketplace  
**Next Update**: Future enhancements or maintenance as needed
