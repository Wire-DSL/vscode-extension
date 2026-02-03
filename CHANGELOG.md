# Changelog

## 0.5.0

### Minor Changes

- 8e81c68: Migrate to new version of Wire DSL (separate engine and exporters)

## 0.4.3

### Patch Changes

- e3d0caf: add marketplace logo

## 0.4.2

### Patch Changes

- 22c489c: remove macOS 13 target and update publish command in GitHub Actions workflow

## 0.4.1

### Patch Changes

- 8ef996b: add GitHub Actions workflows for CI, publishing, and release management

All notable changes to the Wire DSL extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-01-29

### Added

- Complete export feature supporting SVG, PDF, and PNG formats
- ExportManager service with extensible export handling
- Multi-screen export support:
  - PDF: Single multipage document with all screens
  - SVG/PNG: Separate files for each screen with sanitized names
- Theme support for exports (respects wire.preview.defaultTheme setting)
- ParseService for independent document parsing
- Export from preview panel (single selected screen)
- Export from editor (all screens with format-specific behavior)
- Screen name sanitization for safe filenames
- Progress indication during export operations
- Directory persistence for last export location

## [0.1.0] - 2026-01-22

### Added

- Initial release
- Syntax highlighting for Wire DSL `.wire` files
- Support for keywords: `project`, `screen`, `stack`, `grid`, `panel`, `split`, `form`, `table`
- Support for 40+ component types
- Property and attribute highlighting
- Hex color highlighting with semantic coloring
- Number and spacing token highlighting
- Comment support (`//` and `/* */`)
- Bracket matching and auto-pairing
- Language configuration with indentation rules

### Planned

- Code autocompletion with context awareness
- Hover tooltips with component documentation
- Live SVG preview for `.wire` files
- Error diagnostics and linting
- Code snippets for common patterns
- Integration with Wire DSL CLI for validation
