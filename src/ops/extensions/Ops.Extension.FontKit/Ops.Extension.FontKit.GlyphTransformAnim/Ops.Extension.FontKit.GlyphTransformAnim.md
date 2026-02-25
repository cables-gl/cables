### Supported properties:
- Rotation — per-glyph rotation in degrees, around glyph center
- Scale — uniform scale per glyph
- Scale X / Scale Y — independent axis scaling
- Offset X / Offset Y — per-glyph position offset
- Tracking — additional letterspacing (applied to positions)

### Key features:
- Takes an array of float values (one per glyph) + a property selector
- Parses and transforms SVG path coordinates directly (no fontkit dependency)
- Chainable: output format matches input format, so multiple instances can be stacked:
- FontkitGlyphAxisAnim → TransformAnim (Rotation) → TransformAnim (Scale Y) → GlyphCombine