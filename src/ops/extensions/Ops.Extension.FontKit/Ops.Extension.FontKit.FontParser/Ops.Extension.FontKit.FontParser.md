### Key features:
- Loads .ttf , .otf , .woff variable and static fonts
- Lays out text using fontkit's built-in shaping engine (kerning, ligatures)
- Outputs one SVG path string per glyph (at origin) + a positions array (x, y, z per glyph)
- Outputs a combined SVG path (all glyphs positioned) ready for direct use
- Supports multiline text via \n with configurable Line Height
- Supports tracking (letterspacing) in normalized units
- Supports Center Lines toggle for multiline horizontal centering
- Exposes variable font axes as dynamic input ports (auto-detected from font)
- All coordinates normalized by 1.0 / unitsPerEm (1 em = 1.0 unit)
- Outputs font metrics: Width, Height, Ascender, Descender, UnitsPerEm


### Outputs used downstream:

Glyph Paths Glyph Positions Font Object → array of SVG path strings (one per glyph, at origin)
→ flat array [x, y, z, x, y, z, …]
→ the fontkit font instance (needed by axis animation ops)