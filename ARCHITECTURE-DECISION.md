# VS Code Extension - Architecture Decision Record

## Context

The Wire DSL VS Code Extension is a **standalone npm project**, independent from the main Wire DSL monorepo.

The original Wire DSL project is a TypeScript monorepo using **pnpm workspaces**:
- `packages/core/` - Parser, IR, Layout Engine (pnpm)
- `packages/cli/` - CLI tool (pnpm)
- `packages/web/` - Web editor (pnpm)

This extension was initially part of that monorepo but has been decoupled into its own repository for easier maintenance and contribution.

## Problem

VS Code extensions have strict dependency requirements:
- `vscode` module must be external (not bundled)
- `vsce` tool uses `npm list --production` internally
- pnpm and npm conflict in same workspace
- Contributors struggled with `npm install` errors

### Symptoms
```
npm error missing: rollup-plugin-node-resolve@^2.0.0, required by uri-js@4.4.1
npm error invalid: @typescript-eslint/eslint-plugin@8.53.1
... [3000+ more errors]
```

## Decision

**The VS Code extension is a standalone npm project in its own repository.**

This allows:
- Independent development cycle from the main Wire DSL monorepo
- Simplified npm workflow (no pnpm interference)
- Easier contribution from VS Code extension developers
- Direct publishing to VS Code Marketplace

### Key Features
1. **Pure npm project**
   - `npm install` works cleanly
   - `package-lock.json` tracks exact versions
   - `.npmrc` ensures npm usage (no pnpm)

2. **Independent repository**
   - Own Git repository: https://github.com/Wire-DSL/vscode-extension
   - Separate version control from main Wire DSL
   - Direct publishing to VS Code Marketplace

3. **Simplified workflow**
   - Single `npm run package` for build + packaging + install
   - Standard npm scripts (esbuild, test, vsce)
   - No monorepo complexity

4. **VS Code compliant**
   - Compatible with `vsce` packaging tool
   - Proper `.vscodeignore` for minimal package size
   - Published to marketplace: https://marketplace.visualstudio.com/items?itemName=wire-dsl.wire-dsl

## Consequences

### ✅ Advantages
- **Simplicity**: Contributors do `npm install` and it works
- **Independence**: Can be developed separately from core
- **Compatibility**: Works with vsce and standard VS Code tooling
- **Clarity**: No confusion between npm/pnpm commands
- **Reliability**: npm's stricter dependency resolution

### ⚠️ Trade-offs
- **Not integrated** in main Wire DSL build system
  - Extension has independent version numbering
  - Releases are separate from core Wire DSL
  - Must coordinate version compatibility manually

- **Separate maintenance**
  - Own issue tracker and pull requests
  - Independent contribution guidelines
  - Separate documentation and README

### ⚠️ Future Considerations
If integration with main Wire DSL becomes necessary:
- Create separate npm workspace in monorepo
- Coordinate CI/CD pipelines for testing
- Align versioning strategy (follow main project or independent)
- Document compatibility matrix between extension and core versions

## Alternative Approaches (Rejected)

### 1. Clean pnpm/npm hybrid
- ❌ pnpm can't coexist with npm in same monorepo
- ❌ Still causes vsce validation failures

### 2. Fix monorepo conflicts
- ❌ Would require cleaning 3000+ broken dependencies
- ❌ Time-consuming, fragile solution
- ❌ Doesn't solve vsce incompatibility

### 3. Use Docker for packaging
- ❌ Adds complexity
- ❌ Contributors need Docker
- ❌ Slower development cycle

## Implementation

### Configuration Files
- `.npmrc` - npm configuration (force npm usage)
- `package.json` - npm scripts, metadata, and dependencies
- `.vscodeignore` - Files to exclude from VSIX package
- `CONTRIBUTING.md` - Contributor guide
- `LICENSE` - MIT license file

### Build Workflow (Multiplataform)
```
npm install
  ↓
npm run esbuild-watch    # During development (watch mode)
  ↓
npm run package          # Release build
  ├─ npm run vscode:prepublish (compile + minify)
  ├─ npx vsce package (create VSIX, 14.78 KB)
  └─ code --install-extension (install locally)
  ↓
npx vsce publish         # Publish to Marketplace (one-time setup)
```

## Status

Track implementation success:
1. ✅ **npm install succeeds** - No dependency conflicts
2. ✅ **vsce packaging works** - VSIX created successfully
3. ✅ **Published to Marketplace** - Available for download
4. ✅ **Multiplataforma** - Works on Windows, macOS, Linux
5. ✅ **Contributors onboard easily** - Standard `npm install` + development workflow
6. ✅ **No pnpm conflicts** - Independent from main monorepo

## References
- [VS Code Extension API](https://code.visualstudio.com/api)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Wire DSL Marketplace](https://marketplace.visualstudio.com/items?itemName=wire-dsl.wire-dsl)
- [Main Wire DSL Repository](https://github.com/develop-wire-dsl/wire-dsl)

---

**Decision Date**: January 26, 2026  
**Status**: ✅ Implemented, Tested & Published  
**Current Version**: 0.2.0
