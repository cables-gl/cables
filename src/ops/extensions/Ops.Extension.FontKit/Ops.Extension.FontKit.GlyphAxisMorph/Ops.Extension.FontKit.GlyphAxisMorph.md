### Key features:
- At build time: extracts path coordinates for each unique character at Axis Min and Axis Max
values
- At render time: linear interpolation ( lerp ) between min/max coordinates using a 0→1 morph array
- Per-glyph morph values allow smooth, independent animation of each letter
- Advance widths are also interpolated for correct spacing
- Supports multiline, tracking, Center Lines
- Skip Combined Path toggle for performance when only Glyph Paths + Positions are needed