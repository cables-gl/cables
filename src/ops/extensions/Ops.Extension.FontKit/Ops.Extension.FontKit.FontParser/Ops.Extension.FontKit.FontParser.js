// ============================================
// FontkitFontParser — variable fonts + tracking + letter by letter
// ============================================
// Dependency: fontkit.min.js uploaded as "Common JS" via Manage Op > Add Dependencies
// fontkit exposes window.fontkit after loading

// --- INPUTS ---
const inFile = op.inUrl("Font File");
const inText = op.inString("Text", "Hello");
const inTracking = op.inFloat("Tracking", 0); // letter spacing in normalized units
const inLineHeight = op.inFloat("Line Height", 1.2); // line height multiplier
const inCenterLines = op.inBool("Center Lines", false);

// --- OUTPUTS ---
const outPath = op.outString("SVG Path"); // full combined path
const outPathData = op.outObject("Path Data"); // raw {cmds, crds}
const outGlyphPaths = op.outArray("Glyph Paths"); // one SVG path per glyph (at origin)
const outGlyphPositions = op.outArray("Glyph Positions"); // array3x [x,y,z,...]
const outObject = op.outObject("Font Object");
const outText = op.outString("Text Out"); // text relay for chaining
const outWidth = op.outNumber("Text Width");
const outHeight = op.outNumber("Text Height");
const outAscender = op.outNumber("Ascender");
const outDescender = op.outNumber("Descender");
const outUPM = op.outNumber("UnitsPerEm");
const outAxes = op.outArray("Axes"); // list of available axes
const outTrackingVal = op.outNumber("Tracking Out"); // tracking relay for chaining

// --- STATE ---
let baseFont = null;
let axisPorts = [];
let axisKeys = [];

// SVG coordinate precision (6 decimal places)
const PRECISION = 6;

// =============================================
// SVG PATH BUILDER — high precision
// =============================================
// fontkit.path.toSVG() rounds to 2 decimal places, which destroys
// curves after normalization (1/unitsPerEm).
// We rebuild the SVG from path.commands with toFixed(6).

function pathToSvg(path, scale, offsetX, offsetY)
{
    const cmds = path.commands;
    if (!cmds || cmds.length === 0) return "";

    let d = "";

    for (let i = 0; i < cmds.length; i++)
    {
        const c = cmds[i];
        const a = c.args;

        if (c.command === "moveTo")
        {
            d += "M" + ((a[0] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[1] + offsetY) * scale).toFixed(PRECISION);
        }
        else if (c.command === "lineTo")
        {
            d += "L" + ((a[0] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[1] + offsetY) * scale).toFixed(PRECISION);
        }
        else if (c.command === "quadraticCurveTo")
        {
            d += "Q" + ((a[0] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[1] + offsetY) * scale).toFixed(PRECISION)
               + " " + ((a[2] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[3] + offsetY) * scale).toFixed(PRECISION);
        }
        else if (c.command === "bezierCurveTo")
        {
            d += "C" + ((a[0] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[1] + offsetY) * scale).toFixed(PRECISION)
               + " " + ((a[2] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[3] + offsetY) * scale).toFixed(PRECISION)
               + " " + ((a[4] + offsetX) * scale).toFixed(PRECISION)
               + " " + (-(a[5] + offsetY) * scale).toFixed(PRECISION);
        }
        else if (c.command === "closePath")
        {
            d += "Z";
        }
    }

    return d;
}

// =============================================
// FONT LOADING
// =============================================
inFile.onChange = function ()
{
    const url = inFile.get();
    if (!url) return;

    const loadingId = op.patch.loading.start("FontkitFont", url);

    fetch(op.patch.getFilePath(url))
        .then((response) => { return response.arrayBuffer(); })
        .then((buffer) =>
        {
            const uint8 = new Uint8Array(buffer);
            baseFont = fontkit.create(uint8);

            outObject.set(baseFont);
            outUPM.set(baseFont.unitsPerEm);
            outAscender.set(baseFont.hhea ? baseFont.hhea.ascent : baseFont.ascender || 800);
            outDescender.set(baseFont.hhea ? baseFont.hhea.descent : baseFont.descender || -200);

            setupAxes();

            op.patch.loading.finished(loadingId);
            updateText();
        })
        .catch((err) =>
        {
            op.logError("Fontkit font load error", err);
            op.patch.loading.finished(loadingId);
        });
};

inText.onChange = updateText;
inTracking.onChange = updateText;
inLineHeight.onChange = updateText;
inCenterLines.onChange = updateText;

// =============================================
// VARIABLE AXES — dynamic ports
// =============================================
function setupAxes()
{
    for (let i = 0; i < axisPorts.length; i++)
    {
        op.removePort(axisPorts[i]);
    }
    axisPorts = [];
    axisKeys = [];

    const axes = baseFont.variationAxes;
    if (!axes || Object.keys(axes).length === 0)
    {
        outAxes.set([]);
        return;
    }

    const axisInfo = [];
    const tags = Object.keys(axes);

    for (let i = 0; i < tags.length; i++)
    {
        const tag = tags[i];
        const axis = axes[tag];

        const port = op.inFloat("Axis: " + tag + " (" + axis.name + ")", axis.default);
        port.setUiAttribs({ "hidePort": false });
        port.onChange = updateText;

        axisPorts.push(port);
        axisKeys.push(tag);

        axisInfo.push({
            "tag": tag,
            "name": axis.name,
            "min": axis.min,
            "max": axis.max,
            "default": axis.default
        });
    }

    outAxes.set(axisInfo);
}

// =============================================
// GET VARIED FONT
// =============================================
function getVariedFont()
{
    if (!baseFont) return null;
    if (axisPorts.length === 0) return baseFont;

    const variation = {};
    let hasChange = false;
    const axes = baseFont.variationAxes;

    for (let i = 0; i < axisPorts.length; i++)
    {
        const tag = axisKeys[i];
        const val = axisPorts[i].get();
        variation[tag] = val;
        if (val !== axes[tag].default) hasChange = true;
    }

    if (!hasChange) return baseFont;

    try
    {
        return baseFont.getVariation(variation);
    }
    catch (e)
    {
        op.logError("getVariation error", e);
        return baseFont;
    }
}

// =============================================
// UPDATE TEXT — layout + paths (multi-line)
// =============================================
function updateText()
{
    if (!baseFont) return;

    const str = inText.get();
    if (!str)
    {
        outPath.set("");
        outWidth.set(0);
        outHeight.set(0);
        outGlyphPaths.setRef([]);
        outGlyphPositions.set([]);
        outPathData.set(null);
        outText.set("");
        outTrackingVal.set(0);
        return;
    }

    const font = getVariedFont();
    if (!font) return;

    const scale = 1.0 / font.unitsPerEm;
    const tracking = inTracking.get();
    const lineHeightMult = inLineHeight.get();

    // Line metrics from baseFont (stable, not affected by variation)
    const ascender = baseFont.hhea ? baseFont.hhea.ascent : baseFont.ascender || 800;
    const descender = baseFont.hhea ? baseFont.hhea.descent : baseFont.descender || -200;
    const lineHeightFU = (descender - ascender) * lineHeightMult;

    // Split into lines
    const lines = str.split("\n");
    const doCenter = inCenterLines.get() && lines.length > 1;

    // --- Pass 1: line widths in font units (only if centering is active) ---
    let lineWidthsFU = null;
    let maxLineWidthFU = 0;

    if (doCenter)
    {
        lineWidthsFU = [];
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++)
        {
            const lineStr = lines[lineIdx];
            if (lineStr.length === 0)
            {
                lineWidthsFU.push(0);
                continue;
            }

            const run = font.layout(lineStr);
            let curX = 0;
            for (let i = 0; i < run.positions.length; i++)
            {
                curX += run.positions[i].xAdvance + (tracking / scale);
            }
            lineWidthsFU.push(curX);
            if (curX > maxLineWidthFU) maxLineWidthFU = curX;
        }
    }

    // --- Pass 2: full layout with centering ---
    let combinedD = "";
    const glyphPaths = [];
    const glyphPositions = [];
    const allCmds = [];
    const allCrds = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++)
    {
        const lineStr = lines[lineIdx];
        const lineOffsetY = lineIdx * lineHeightFU;

        if (lineStr.length === 0) continue;

        // Centering offset in font units (0 if disabled)
        const centerOffsetFU = doCenter ? (maxLineWidthFU - lineWidthsFU[lineIdx]) * 0.5 : 0;

        const run = font.layout(lineStr);
        let curX = centerOffsetFU;

        for (let i = 0; i < run.glyphs.length; i++)
        {
            const glyph = run.glyphs[i];
            const pos = run.positions[i];

            const gx = (curX + pos.xOffset) * scale;
            const gy = (pos.yOffset + lineOffsetY) * scale;

            // SVG path of the glyph at origin (for isolated manipulation)
            glyphPaths.push(pathToSvg(glyph.path, scale, 0, 0));

            // SVG path with offset for the combined path
            combinedD += pathToSvg(glyph.path, scale, curX + pos.xOffset, pos.yOffset + lineOffsetY);

            // Position
            glyphPositions.push(gx, gy, 0);

            // Raw path data
            const rawCmds = glyph.path.commands;
            if (rawCmds)
            {
                const ox = curX + pos.xOffset;
                const oy = pos.yOffset + lineOffsetY;

                for (let j = 0; j < rawCmds.length; j++)
                {
                    const cmd = rawCmds[j];
                    const a = cmd.args;

                    if (cmd.command === "moveTo")
                    {
                        allCmds.push("M");
                        allCrds.push((a[0] + ox) * scale, -(a[1] + oy) * scale);
                    }
                    else if (cmd.command === "lineTo")
                    {
                        allCmds.push("L");
                        allCrds.push((a[0] + ox) * scale, -(a[1] + oy) * scale);
                    }
                    else if (cmd.command === "quadraticCurveTo")
                    {
                        allCmds.push("Q");
                        allCrds.push(
                            (a[0] + ox) * scale, -(a[1] + oy) * scale,
                            (a[2] + ox) * scale, -(a[3] + oy) * scale
                        );
                    }
                    else if (cmd.command === "bezierCurveTo")
                    {
                        allCmds.push("C");
                        allCrds.push(
                            (a[0] + ox) * scale, -(a[1] + oy) * scale,
                            (a[2] + ox) * scale, -(a[3] + oy) * scale,
                            (a[4] + ox) * scale, -(a[5] + oy) * scale
                        );
                    }
                    else if (cmd.command === "closePath")
                    {
                        allCmds.push("Z");
                    }
                }
            }

            curX += pos.xAdvance + (tracking / scale);
        }

        if (!doCenter)
        {
            const lw = curX - centerOffsetFU;
            if (lw > maxLineWidthFU) maxLineWidthFU = lw;
        }
    }

    const maxLineWidth = maxLineWidthFU * scale;

    // Total height = (n-1) line gaps + 1 base line height
    const baseLineH = (ascender - descender) * scale;
    const totalHeight = (lines.length > 1)
        ? (lines.length - 1) * lineHeightFU * scale + baseLineH
        : baseLineH;

    outPath.set(combinedD);
    outPathData.set({
        "cmds": allCmds,
        "crds": allCrds
    });
    outGlyphPaths.setRef(glyphPaths);
    outGlyphPositions.set(glyphPositions);
    outWidth.set(maxLineWidth);
    outHeight.set(totalHeight);
    outText.set(str);
    outTrackingVal.set(tracking);
}
