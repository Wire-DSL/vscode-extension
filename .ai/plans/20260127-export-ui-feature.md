# Feature Plan: Export UI Implementation (SVG/PDF Support)

**Created:** January 27, 2026  
**Updated:** January 28, 2026  
**Status:** Phase 1 Complete (SVG Export)  
**Branch:** `feature/export-ui`  
**Epic:** Add file export capabilities to VS Code Extension

---

## 📋 Overview

Implement a new **"Export As"** feature in the Wire DSL VS Code Extension that allows users to save their rendered preview as SVG files. The UI will be designed as an extensible framework that can easily accommodate PDF and PNG exports once the `@wire-dsl/core` package implements the necessary exporter functionality.

### Vision

```
Current State:
  .wire file → [Preview Panel] ← Only visual, cannot save

Target State:
  .wire file → [Preview Panel with Export UI] → Save as SVG/PDF/PNG
                                              ↓
                                         Export Dialog
                                              ↓
                                         File saved
```

---

## 🎯 Phase 1: SVG Export with Extensible UI

### Acceptance Criteria

- ✅ User can click "Export" button in preview panel
- ✅ Dialog shows export format options (currently only SVG)
- ✅ User can choose save location
- ✅ SVG file is saved with suggested filename (based on `.wire` filename)
- ✅ Success/error notifications shown to user
- ✅ Last save directory is remembered in VS Code settings
- ✅ Code structure allows easy addition of PDF/PNG when Core implements them

### Non-Goals for Phase 1

- ❌ PDF export (waiting for Core implementation)
- ❌ PNG export (waiting for Core implementation)
- ❌ Batch export
- ❌ Custom export settings (width, height, etc.)

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

### Phase 2: PDF Support (When Core Implements PDFExporter)

```typescript
// In @wire-dsl/core/exporters/pdf.ts
export const PDFExporter = {
  render: (ir: IR, layout: Layout, options: PDFOptions): Buffer => {
    // Implementation
  }
};
```

Then in extension, simply add:

```typescript
// src/services/exportManager.ts
static async exportPDF(ir: IR, layout: Layout, fileUri: vscode.Uri): Promise<void> {
  const { PDFExporter } = require('@wire-dsl/core/exporters');
  const buffer = PDFExporter.render(ir, layout, {
    filename: path.basename(fileUri.fsPath)
  });
  await fs.promises.writeFile(fileUri.fsPath, buffer);
}
```

And add to formats:

```typescript
{ id: 'pdf', label: 'PDF (Document)', ext: '.pdf' }
```

### Phase 3: PNG Support (When Core Implements PNGExporter)

Same pattern as PDF.

### Phase 4: Advanced Export Options

- Custom dimensions
- Custom DPI/resolution
- Margin settings
- Include metadata

---

## 📊 Task Tracking

### Implementation Tasks

- [x] Create `feature/export-ui` branch
- [x] Add `wire.exportAs` command to package.json
- [x] Implement command handler in extension.ts
- [x] Create ExportManager service
- [x] Add export UI to webviewPanel HTML
- [x] Implement export dialog and file saving
- [x] Add configuration contribution
- [x] Create export icons
- [x] Update ARCHITECTURE.md
- [x] Manual testing and validation
- [x] Code commit to feature branch
- [ ] Merge to main (pending review)

### File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `package.json` | Add command + config | ✅ Complete |
| `src/extension.ts` | Register command | ✅ Complete |
| `src/webviewPanelProvider.ts` | Add export UI | ✅ Complete |
| `src/services/exportManager.ts` | New file | ✅ Complete |
| `icons/export-light.svg` | New icon | ✅ Complete |
| `icons/export-dark.svg` | New icon | ✅ Complete |
| `ARCHITECTURE.md` | Document export feature | ✅ Complete |

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

**Last Updated:** January 28, 2026  
**Next Steps:** 

1. **Code Review:** Review PR in GitHub
2. **Phase 2 Planning:** Create plan for PDF/PNG when Core has exporters
3. **Core Coordination:** Coordinate with @wire-dsl/core team to implement:
   - `PDFExporter` in `packages/core/src/exporters/pdf.ts`
   - `PNGExporter` in `packages/core/src/exporters/png.ts`

**Phase 2 Implementation:** Once Core has exporters, extension changes are minimal:
```typescript
// Only need to uncomment in ExportManager and add to formats:
{ id: 'pdf', label: 'PDF (Document)', ext: '.pdf' }
{ id: 'png', label: 'PNG (Image)', ext: '.png' }
```
