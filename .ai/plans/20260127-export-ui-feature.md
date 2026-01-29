# Feature Plan: Export UI Implementation (SVG/PDF Support)

**Created:** January 27, 2026  
**Updated:** January 28, 2026  
**Status:** Phase 1 Complete (SVG Export)  
**Branch:** `feature/export-ui`  
**Epic:** Add file export capabilities to VS Code Extension

---

## 📋 Overview

Implement a complete **"Export As"** feature in the Wire DSL VS Code Extension that allows users to save their rendered preview as **SVG, PDF, or PNG files**. The feature integrates seamlessly with `@wire-dsl/core` v0.1.1+ which provides native exporters for all three formats.

### Vision

```
Current State:
  .wire file → [Preview Panel] ← Only visual, cannot save

Target State:
  .wire file → [Preview Panel with Export UI] → Save as SVG/PDF/PNG
                                              ↓
                                         Export Dialog (format + location)
                                              ↓
                                         File saved via @wire-dsl/core
```

---

## ✅ Phase 1 & 2 Complete: SVG, PDF, PNG Export

### Status: COMPLETE
- ✅ SVG export (Phase 1)
- ✅ PDF export (Phase 2 - via @wire-dsl/core v0.1.1)
- ✅ PNG export (Phase 2 - via @wire-dsl/core v0.1.1)

---

## 📝 Implementation Plan

### Step 1: Create Feature Branch

```bash
cd packages/vscode-extension
git checkout -b feature/export-ui
```

### Step 2: Register `wire.exportAs` Command

**File:** `package.json`

Add new command to `contributes.commands`:

```json
{
  "command": "wire.exportAs",
  "title": "Export As",
  "category": "Wire",
  "icon": {
    "light": "./icons/export-light.svg",
    "dark": "./icons/export-dark.svg"
  }
}
```

Add keyboard shortcut (optional):

```json
{
  "command": "wire.exportAs",
  "key": "ctrl+shift+s",
  "mac": "cmd+shift+s",
  "when": "resourceLangId == wire && wire.previewVisible"
}
```

Add to editor/title menu:

```json
{
  "command": "wire.exportAs",
  "when": "resourceLangId == wire",
  "group": "navigation"
}
```

### Step 3: Implement Command Handler in extension.ts

**File:** `src/extension.ts`

```typescript
const exportCommand = vscode.commands.registerCommand(
  'wire.exportAs',
  async () => {
    if (!WirePreviewPanel.currentPanel) {
      vscode.window.showErrorMessage('No preview panel open');
      return;
    }
    
    await WirePreviewPanel.currentPanel.exportAs();
  }
);

context.subscriptions.push(exportCommand);
```

### Step 4: Create ExportManager Service

**File:** `src/services/exportManager.ts`

Create a new service to handle all export logic:

```typescript
export class ExportManager {
  /**
   * Get available export formats
   */
  static getAvailableFormats(): ExportFormat[] {
    return [
      { id: 'svg', label: 'SVG (Vector)', ext: '.svg' },
      // { id: 'pdf', label: 'PDF (Document)', ext: '.pdf' },  // Phase 2
      // { id: 'png', label: 'PNG (Image)', ext: '.png' },    // Phase 2
    ];
  }

  /**
   * Export SVG to file
   */
  static async exportSVG(
    svg: string,
    fileUri: vscode.Uri
  ): Promise<void> {
    // Implementation
  }

  /**
   * Show export dialog and handle saving
   */
  static async showExportDialog(
    currentFileName: string,
    svg: string
  ): Promise<void> {
    // Implementation
  }
}

export interface ExportFormat {
  id: 'svg' | 'pdf' | 'png';
  label: string;
  ext: '.svg' | '.pdf' | '.png';
}
```

### Step 5: Add Export UI to WebviewPanel

**File:** `src/webviewPanelProvider.ts`

Add export button to toolbar HTML:

```html
<button id="exportBtn" title="Export Preview">💾</button>
<div class="separator"></div>
```

Add message handler in webview:

```javascript
// Listen for export button click
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    vscode.postMessage({
      command: 'export',
      svg: document.querySelector('#preview svg').outerHTML
    });
  });
}
```

Add message handler in extension:

```typescript
if (message.command === 'export') {
  await ExportManager.showExportDialog(
    this.currentFileName,
    message.svg
  );
}
```

### Step 6: Implement ExportManager Logic

**File:** `src/services/exportManager.ts`

```typescript
static async showExportDialog(
  currentFileName: string,
  svg: string
): Promise<void> {
  // Get last save directory from settings
  const config = vscode.workspace.getConfiguration('wire.export');
  const lastDir = config.get<string>('lastDirectory');

  // Determine default filename
  const baseName = currentFileName.replace('.wire', '');
  const defaultUri = lastDir
    ? vscode.Uri.joinPath(vscode.Uri.file(lastDir), `${baseName}.svg`)
    : vscode.Uri.file(`${baseName}.svg`);

  // Show format selection quick pick
  const selectedFormat = await vscode.window.showQuickPick(
    this.getAvailableFormats().map(f => ({
      label: f.label,
      value: f.id,
      ext: f.ext
    })),
    { placeHolder: 'Select export format' }
  );

  if (!selectedFormat) return;

  // Show save dialog
  const fileUri = await vscode.window.showSaveDialog({
    defaultUri,
    filters: {
      [selectedFormat.label]: [selectedFormat.ext.slice(1)]
    }
  });

  if (!fileUri) return;

  // Save file
  try {
    if (selectedFormat.value === 'svg') {
      await this.exportSVG(svg, fileUri);
    }
    // else if (selectedFormat.value === 'pdf') {
    //   await this.exportPDF(ir, layout, fileUri);
    // }
    
    // Remember directory
    await config.update(
      'lastDirectory',
      fileUri.fsPath.split(/[\\/]/).slice(0, -1).join('\\'),
      vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage(`Exported to ${fileUri.fsPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Export failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

static async exportSVG(svg: string, fileUri: vscode.Uri): Promise<void> {
  const fs = require('fs').promises;
  await fs.writeFile(fileUri.fsPath, svg, 'utf8');
}
```

### Step 7: Add Configuration Contribution

**File:** `package.json`

Add to `contributes.configuration`:

```json
{
  "title": "Wire DSL Export",
  "properties": {
    "wire.export.lastDirectory": {
      "type": "string",
      "description": "Last directory used for exporting files",
      "scope": "machine"
    }
  }
}
```

### Step 8: Create Icons for Export Button

**Files:** `icons/export-light.svg` and `icons/export-dark.svg`

Simple SVG icons for the export button (disk/save icon).

### Step 9: Update ARCHITECTURE.md

Document the new export feature and how it's structured for future expansion.

### Step 10: Manual Testing

1. Create test `.wire` file with multiple screens
2. Open preview (Ctrl+Shift+V)
3. Click "Export" button
4. Select SVG format
5. Choose save location
6. Verify SVG file is created and valid
7. Open in browser to verify rendering
8. Test error cases (no permission, invalid path, etc.)

---

## 🔄 Future Phases

### Phase 3: Advanced Export Options

- Custom dimensions
- Custom DPI/resolution
- Margin settings
- Include metadata

---

## 📊 Integration with @wire-dsl/core

**Core Version:** `0.1.1` (or later)

**Available Exporters:**
```typescript
// From @wire-dsl/core
export function exportSVG(ir: IR, layout: Layout, options?: ExportOptions): string
export function exportMultipagePDF(ir: IR, layout: Layout, options?: ExportOptions): Buffer
export function exportPNG(ir: IR, layout: Layout, options?: ExportOptions): Buffer
```

**How it works in the Extension:**
1. User clicks "Export" button
2. Extension shows dialog with format options (SVG, PDF, PNG)
3. User selects format and save location
4. ExportManager calls appropriate Core function
5. Core generates the file buffer/string
6. Extension saves to disk

**Theme Support:**
All exporters support the `theme` option to respect Dark/Light mode preference.

---

## 📊 Task Tracking

### Implementation Tasks

- [x] Create `feature/export-ui` branch
- [x] Add `wire.exportAs` command to package.json
- [x] Implement command handler in extension.ts
- [x] Create ExportManager service
- [x] Add export UI to webviewPanel HTML
- [x] Implement export dialog and file saving (SVG only initially)
- [x] Add configuration contribution
- [x] Create export icons
- [x] Update ARCHITECTURE.md
- [x] Manual testing and validation
- [x] Code commit to feature branch
- [x] Update @wire-dsl/core to v0.1.1
- [x] Implement PDF export via @wire-dsl/core exportMultipagePDF
- [x] Implement PNG export via @wire-dsl/core exportPNG
- [x] Update ExportManager to use Core exporters
- [ ] Final merge to main (pending final review)

### File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `package.json` | Update core to v0.1.1 + add export config | ✅ Complete |
| `src/extension.ts` | Register export command | ✅ Complete |
| `src/webviewPanelProvider.ts` | Add export UI + store IR/layout | ✅ Complete |
| `src/services/exportManager.ts` | Export handlers using Core functions | ✅ Complete |
| `icons/export-*.svg` | Export button icons | ✅ Complete |
| `ARCHITECTURE.md` | Document export feature and Core integration | ✅ Complete |

---

## 🔗 References

- **VS Code File Dialog API:** https://code.visualstudio.com/api/references/vscode-api#window.showSaveDialog
- **VS Code Configuration API:** https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration
- **Current Implementation:** 
  - Command registration: [extension.ts](../src/extension.ts)
  - Preview panel: [webviewPanelProvider.ts](../src/webviewPanelProvider.ts)
  - Message passing: [webviewPanelProvider.ts#L45](../src/webviewPanelProvider.ts#L45)

---

## 💡 Design Decisions

1. **ExportManager as separate service:** Keeps extension.ts clean and makes testing easier
2. **Format selection via QuickPick:** Standard VS Code pattern, user-friendly
3. **Remember last directory:** Improves UX, reduces navigation
4. **SVG-only Phase 1:** Waiting for Core allows us to build the UI now without duplicating export logic
5. **Extensible format system:** Adding PDF/PNG later requires minimal changes

---

## ⚠️ Considerations

1. **File size:** SVG files can be large. Should we offer minification option? (Future phase)
2. **Unsaved changes:** Current implementation exports current preview. Should we warn if .wire file has unsaved changes? (Consider for Phase 2)
3. **Performance:** For very large designs, SVG export should be fast. Test with complex files.
4. **Accessibility:** Export button needs proper ARIA labels for screen readers

---

**Last Updated:** January 28, 2026 (Phase 2 Complete)  
**Next Steps:** 

1. **Final Code Review:** Review all changes in PR
2. **Manual Testing:** Test SVG, PDF, and PNG export
3. **Merge to Main:** Complete the feature branch
4. **Phase 3 Planning:** Plan advanced export options if needed

**Key Changes in Phase 2:**
- Updated `@wire-dsl/core` from v0.0.1 to v0.1.1
- Modified ExportManager to use Core exporters instead of custom implementation
- Store IR and Layout in WirePreviewPanel for export
- Support all three formats: SVG, PDF, PNG
- Theme option passed to all exporters
