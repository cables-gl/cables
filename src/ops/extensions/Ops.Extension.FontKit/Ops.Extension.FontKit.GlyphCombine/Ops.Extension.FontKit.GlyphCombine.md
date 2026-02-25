### Key features:

- Repositions each glyph path from origin to its layout position
- Optimized SVG parser (manual charCode parsing, no regex)
- String assembly via array

### Outputs: 
- combined SVG Path, Path Data object {cmds, crds}, Text Width, Text Height, Glyph Count

### When to use: After any chain of FontParser / GlyphAxisMorph / GlyphTransformAnim ops. If using
FontParser alone (no per-glyph animation), its built-in Combined SVG Path output can be used
directly — GlyphCombine is not needed.