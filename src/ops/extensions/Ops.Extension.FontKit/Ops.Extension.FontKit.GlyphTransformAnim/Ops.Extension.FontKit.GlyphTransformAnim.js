// ============================================
// FontkitGlyphTransformAnim — per-glyph geometric transformation
// ============================================
// Takes Glyph Paths + Glyph Positions (from FontkitFontParser or FontkitGlyphAxisAnim)
// and applies a geometric transformation per letter via an array of values.
//
// No font needed — purely geometric.
// Chainable: multiple instances can be stacked (rotation → scale → Y offset...)
//
// Supported properties: Rotation, Scale, Scale X, Scale Y, Offset X, Offset Y, Tracking

// --- INPUTS ---
const inGlyphPaths = op.inArray("Glyph Paths"); // array of SVG path strings
const inGlyphPositions = op.inArray("Glyph Positions"); // array3x [x,y,z, ...]
const inProperty = op.inDropDown("Property", [
    "Rotation", "Scale", "Scale X", "Scale Y",
    "Offset X", "Offset Y", "Tracking"
], "Rotation");
const inValues = op.inArray("Values"); // array of floats, one per letter
const inDefaultValue = op.inFloat("Default Value", 0); // value if array is too short

// --- OUTPUTS ---
const outGlyphPaths = op.outArray("Glyph Paths Out"); // transformed paths
const outGlyphPositions = op.outArray("Glyph Positions Out"); // transformed positions
const outGlyphCount = op.outNumber("Glyph Count");

// SVG precision
const PRECISION = 6;

// =============================================
// SVG PATH PARSER — tokenizes an SVG "d" path into segments
// =============================================
function parseSvgPath(d)
{
    if (!d || d.length === 0) return [];

    const segments = [];
    const re = /([MLQCZ])([^MLQCZ]*)/gi;
    let match;

    while ((match = re.exec(d)) !== null)
    {
        const cmd = match[1].toUpperCase();
        const data = match[2].trim();

        if (cmd === "Z")
        {
            segments.push({ "cmd": "Z", "coords": [] });
        }
        else
        {
            const nums = data.split(/[\s,]+/).map(Number);
            const coords = [];
            for (let i = 0; i < nums.length; i += 2)
            {
                coords.push(nums[i], nums[i + 1]);
            }
            segments.push({ "cmd": cmd, "coords": coords });
        }
    }

    return segments;
}

// =============================================
// SVG PATH REBUILDER — segments → SVG path string
// =============================================
function rebuildSvgPath(segments)
{
    let d = "";

    for (let i = 0; i < segments.length; i++)
    {
        const seg = segments[i];

        if (seg.cmd === "Z")
        {
            d += "Z";
        }
        else
        {
            d += seg.cmd;
            for (let j = 0; j < seg.coords.length; j += 2)
            {
                if (j > 0) d += " ";
                d += seg.coords[j].toFixed(PRECISION) + " " + seg.coords[j + 1].toFixed(PRECISION);
            }
        }
    }

    return d;
}

// =============================================
// TRANSFORMATIONS
// =============================================

// Rotation around the glyph center (in degrees)
function applyRotation(segments, angleDeg)
{
    if (angleDeg === 0) return segments;

    const rad = angleDeg * Math.PI / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    // Compute bounding box center
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < segments.length; i++)
    {
        const coords = segments[i].coords;
        for (let j = 0; j < coords.length; j += 2)
        {
            const x = coords[j];
            const y = coords[j + 1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Apply rotation around center
    const result = [];

    for (let i = 0; i < segments.length; i++)
    {
        const seg = segments[i];
        const newCoords = [];

        for (let j = 0; j < seg.coords.length; j += 2)
        {
            const x = seg.coords[j] - cx;
            const y = seg.coords[j + 1] - cy;
            newCoords.push(x * cosR - y * sinR + cx);
            newCoords.push(x * sinR + y * cosR + cy);
        }

        result.push({ "cmd": seg.cmd, "coords": newCoords });
    }

    return result;
}

// Uniform or separate X/Y scale around the glyph center
function applyScale(segments, sx, sy)
{
    if (sx === 1 && sy === 1) return segments;

    // Compute bounding box center
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < segments.length; i++)
    {
        const coords = segments[i].coords;
        for (let j = 0; j < coords.length; j += 2)
        {
            const x = coords[j];
            const y = coords[j + 1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const result = [];

    for (let i = 0; i < segments.length; i++)
    {
        const seg = segments[i];
        const newCoords = [];

        for (let j = 0; j < seg.coords.length; j += 2)
        {
            newCoords.push((seg.coords[j] - cx) * sx + cx);
            newCoords.push((seg.coords[j + 1] - cy) * sy + cy);
        }

        result.push({ "cmd": seg.cmd, "coords": newCoords });
    }

    return result;
}

// =============================================
// CHANGE HANDLERS
// =============================================
inGlyphPaths.onChange = update;
inGlyphPositions.onChange = update;
inProperty.onChange = update;
inValues.onChange = update;
inDefaultValue.onChange = update;

// =============================================
// UPDATE
// =============================================
function update()
{
    const paths = inGlyphPaths.get();
    const positions = inGlyphPositions.get();

    if (!paths || !positions || paths.length === 0)
    {
        outGlyphPaths.setRef([]);
        outGlyphPositions.set([]);
        outGlyphCount.set(0);
        return;
    }

    const property = inProperty.get();
    const values = inValues.get();
    const defaultVal = inDefaultValue.get();
    const glyphCount = paths.length;

    const newPaths = [];
    const newPositions = [];

    // Copy existing positions
    for (let i = 0; i < positions.length; i++)
    {
        newPositions.push(positions[i]);
    }

    for (let i = 0; i < glyphCount; i++)
    {
        // Determine the value for this letter
        let val = defaultVal;
        if (values && values.length > 0)
        {
            if (i < values.length)
            {
                val = values[i];
            }
            else
            {
                val = values[values.length - 1];
            }
        }

        const pathStr = paths[i];

        // If the path is empty (space), keep it as-is
        if (!pathStr || pathStr.length === 0)
        {
            newPaths.push("");

            // Apply position offsets even on spaces
            if (property === "Offset X")
            {
                newPositions[i * 3] = positions[i * 3] + val;
            }
            else if (property === "Offset Y")
            {
                newPositions[i * 3 + 1] = positions[i * 3 + 1] + val;
            }
            else if (property === "Tracking")
            {
                // Shift all subsequent positions
                for (let j = (i + 1) * 3; j < newPositions.length; j += 3)
                {
                    newPositions[j] += val;
                }
            }

            continue;
        }

        // Parse the SVG path
        const segments = parseSvgPath(pathStr);

        let transformed;

        if (property === "Rotation")
        {
            transformed = applyRotation(segments, val);
            newPaths.push(rebuildSvgPath(transformed));
        }
        else if (property === "Scale")
        {
            transformed = applyScale(segments, val, val);
            newPaths.push(rebuildSvgPath(transformed));
        }
        else if (property === "Scale X")
        {
            transformed = applyScale(segments, val, 1);
            newPaths.push(rebuildSvgPath(transformed));
        }
        else if (property === "Scale Y")
        {
            transformed = applyScale(segments, 1, val);
            newPaths.push(rebuildSvgPath(transformed));
        }
        else if (property === "Offset X")
        {
            // Modify position, not the path
            newPaths.push(pathStr);
            newPositions[i * 3] = positions[i * 3] + val;
        }
        else if (property === "Offset Y")
        {
            // Modify position, not the path
            newPaths.push(pathStr);
            newPositions[i * 3 + 1] = positions[i * 3 + 1] + val;
        }
        else if (property === "Tracking")
        {
            // Add a cumulative X offset starting from this letter
            newPaths.push(pathStr);

            // Compute cumulative offset for all subsequent letters
            for (let j = (i + 1) * 3; j < newPositions.length; j += 3)
            {
                newPositions[j] += val;
            }
        }
        else
        {
            // Unknown property, pass through as-is
            newPaths.push(pathStr);
        }
    }

    outGlyphPaths.setRef(newPaths);
    outGlyphPositions.set(newPositions);
    outGlyphCount.set(glyphCount);
}
