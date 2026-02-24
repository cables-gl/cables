// ============================================
// FontkitGlyphMorph — morph targets per-glyph (pre-computation min/max + lerp)
// ============================================
// On load / text change:
//   - Extracts coordinates for each glyph at axis min and axis max
//   - Stores two coordinate arrays per unique glyph
//
// Each frame:
//   - Lerps between min and max per letter via an array of normalized values (0→1)
//   - Reconstructs SVG paths from interpolated coordinates
//
// Advantage: ZERO fontkit calls per frame. Pure arithmetic computation.
//
// Dependency: fontkit.min.js

// --- INPUTS ---
const inFontObject = op.inObject("Font Object");
const inText = op.inString("Text", "Hello");
const inTracking = op.inFloat("Tracking", 0);
const inLineHeight = op.inFloat("Line Height", 1.2);
const inAxisTag = op.inString("Axis Tag", "wght");
const inAxisMin = op.inFloat("Axis Min", 100); // axis min value
const inAxisMax = op.inFloat("Axis Max", 900); // axis max value
const inMorphValues = op.inArray("Morph Values"); // array of floats 0→1, one per letter
const inDefaultMorph = op.inFloat("Default Morph", 0.5); // fallback if array is too short
const inSkipCombined = op.inBool("Skip Combined Path", false);
const inCenterLines = op.inBool("Center Lines", false);

// --- OUTPUTS ---
const outGlyphPaths = op.outArray("Glyph Paths");
const outGlyphPositions = op.outArray("Glyph Positions");
const outCombinedPath = op.outString("Combined SVG Path");
const outWidth = op.outNumber("Text Width");
const outHeight = op.outNumber("Text Height");
const outGlyphCount = op.outNumber("Glyph Count");
const outText = op.outString("Text Out");
const outTrackingVal = op.outNumber("Tracking Out");
const outReady = op.outBoolNum("Ready"); // true when morph targets are ready

// --- STATE ---
const PRECISION = 6;

// Cache of morph targets per unique character
// key = charCode, value = { cmds: [...], minCrds: [...], maxCrds: [...], minAdv, maxAdv }
let morphTargets = {};
let lastBaseFont = null;
let lastAxisTag = null;
let lastAxisMin = null;
let lastAxisMax = null;
let lastText = null;
let lastMorphValues = null;
let lastTracking = null;
let needsRebuild = true; // flag to recompute morph targets

// =============================================
// MORPH TARGETS PRE-COMPUTATION
// =============================================
// Called only when font, text, axis or bounds change
function buildMorphTargets()
{
    const baseFont = inFontObject.get();
    if (!baseFont) return;

    const str = inText.get();
    if (!str) return;

    const axisTag = inAxisTag.get() || "wght";
    const axisMin = inAxisMin.get();
    const axisMax = inAxisMax.get();

    const axes = baseFont.variationAxes;
    if (!axes || !axes[axisTag])
    {
        op.logWarn("FontkitGlyphMorph: axis '" + axisTag + "' not found in font");
        outReady.set(false);
        return;
    }

    // Clamp to the actual axis bounds
    const axis = axes[axisTag];
    const clampedMin = Math.max(axis.min, Math.min(axis.max, axisMin));
    const clampedMax = Math.max(axis.min, Math.min(axis.max, axisMax));

    // Create the two varied fonts
    let fontMin, fontMax;
    try
    {
        const varMin = {};
        varMin[axisTag] = clampedMin;
        fontMin = baseFont.getVariation(varMin);

        const varMax = {};
        varMax[axisTag] = clampedMax;
        fontMax = baseFont.getVariation(varMax);
    }
    catch (e)
    {
        op.logError("FontkitGlyphMorph: getVariation error", e);
        outReady.set(false);
        return;
    }

    // Extract morph targets for each unique character
    morphTargets = {};

    // Find unique characters
    const chars = {};
    for (let i = 0; i < str.length; i++)
    {
        const ch = str[i];
        if (ch === "\n") continue;
        chars[ch] = true;
    }

    const scaleMin = 1.0 / fontMin.unitsPerEm;
    const scaleMax = 1.0 / fontMax.unitsPerEm;

    const uniqueChars = Object.keys(chars);

    for (let u = 0; u < uniqueChars.length; u++)
    {
        const ch = uniqueChars[u];

        // Layout at min and max
        const runMin = fontMin.layout(ch);
        const runMax = fontMax.layout(ch);

        if (runMin.glyphs.length === 0 || runMax.glyphs.length === 0)
        {
            // Space or character with no glyph
            morphTargets[ch] = {
                "cmds": [],
                "minCrds": [],
                "maxCrds": [],
                "minAdv": runMin.positions.length > 0 ? runMin.positions[0].xAdvance * scaleMin : 0.25,
                "maxAdv": runMax.positions.length > 0 ? runMax.positions[0].xAdvance * scaleMax : 0.25,
                "isEmpty": true
            };
            continue;
        }

        const glyphMin = runMin.glyphs[0];
        const glyphMax = runMax.glyphs[0];

        const cmdsMin = glyphMin.path.commands;
        const cmdsMax = glyphMax.path.commands;

        // Check that both paths have the same structure
        if (!cmdsMin || !cmdsMax || cmdsMin.length !== cmdsMax.length)
        {
            op.logWarn("FontkitGlyphMorph: path structure mismatch for '" + ch + "' (min: " +
                (cmdsMin ? cmdsMin.length : 0) + " cmds, max: " + (cmdsMax ? cmdsMax.length : 0) + " cmds). Using min path only.");

            // Fallback: use the min path for both (no interpolation)
            const fallbackCmds = [];
            const fallbackCrds = [];

            if (cmdsMin)
            {
                for (let j = 0; j < cmdsMin.length; j++)
                {
                    const c = cmdsMin[j];
                    fallbackCmds.push(c.command);
                    if (c.args)
                    {
                        for (let k = 0; k < c.args.length; k++)
                        {
                            fallbackCrds.push(c.args[k] * scaleMin);
                        }
                    }
                }
            }

            morphTargets[ch] = {
                "cmds": fallbackCmds,
                "minCrds": fallbackCrds,
                "maxCrds": fallbackCrds.slice(), // identical copy
                "minAdv": runMin.positions[0].xAdvance * scaleMin,
                "maxAdv": runMax.positions[0].xAdvance * scaleMax,
                "isEmpty": false
            };
            continue;
        }

        // Extract commands and coordinates
        const cmds = [];
        const minCrds = [];
        const maxCrds = [];

        for (let j = 0; j < cmdsMin.length; j++)
        {
            cmds.push(cmdsMin[j].command);

            const aMin = cmdsMin[j].args;
            const aMax = cmdsMax[j].args;

            if (aMin)
            {
                for (let k = 0; k < aMin.length; k++)
                {
                    // Apply scale and Y inversion here
                    // args are in x,y pairs — odd indices (1,3,5) are Y → inverted
                    if (k % 2 === 0)
                    {
                        // X
                        minCrds.push(aMin[k] * scaleMin);
                        maxCrds.push(aMax[k] * scaleMax);
                    }
                    else
                    {
                        // Y — invert
                        minCrds.push(-aMin[k] * scaleMin);
                        maxCrds.push(-aMax[k] * scaleMax);
                    }
                }
            }
        }

        morphTargets[ch] = {
            "cmds": cmds,
            "minCrds": minCrds,
            "maxCrds": maxCrds,
            "minAdv": runMin.positions[0].xAdvance * scaleMin,
            "maxAdv": runMax.positions[0].xAdvance * scaleMax,
            "isEmpty": false
        };
    }

    lastAxisTag = axisTag;
    lastAxisMin = axisMin;
    lastAxisMax = axisMax;
    lastText = str;
    lastBaseFont = baseFont;
    needsRebuild = false;
    outReady.set(true);

    // Recompute paths with current values
    lastMorphValues = null; // force recompute
    render();
}

// =============================================
// RENDER — lerp of morph targets (called every frame)
// =============================================
function render()
{
    if (needsRebuild)
    {
        buildMorphTargets();
        return;
    }

    const baseFont = inFontObject.get();
    if (!baseFont) return;

    const str = inText.get();
    if (!str)
    {
        outGlyphPaths.setRef([]);
        outGlyphPositions.set([]);
        outCombinedPath.set("");
        outWidth.set(0);
        outHeight.set(0);
        outGlyphCount.set(0);
        outText.set("");
        outTrackingVal.set(0);
        return;
    }

    const morphValues = inMorphValues.get();
    const tracking = inTracking.get();
    const defaultMorph = inDefaultMorph.get();
    const lineHeightMult = inLineHeight.get();
    const skipCombined = inSkipCombined.get();

    // Line metrics
    const ascender = baseFont.hhea ? baseFont.hhea.ascent : baseFont.ascender || 800;
    const descender = baseFont.hhea ? baseFont.hhea.descent : baseFont.descender || -200;
    const scale = 1.0 / baseFont.unitsPerEm;
    const lineHeightNorm = (descender - ascender) * scale * lineHeightMult;

    const lines = str.split("\n");
    const doCenter = inCenterLines.get() && lines.length > 1;

    // --- Pass 1: widths per line (very lightweight, just additions) ---
    let lineWidths = null;
    let maxLW = 0;

    if (doCenter)
    {
        lineWidths = [];
        let gi = 0;
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++)
        {
            const lineStr = lines[lineIdx];
            if (lineStr.length === 0) { lineWidths.push(0); continue; }

            let lw = 0;
            for (let i = 0; i < lineStr.length; i++)
            {
                const ch = lineStr[i];
                const mt = morphTargets[ch];
                let t = defaultMorph;
                if (morphValues && gi < morphValues.length) t = morphValues[gi];
                else if (morphValues && morphValues.length > 0) t = morphValues[morphValues.length - 1];
                t = Math.max(0, Math.min(1, t));

                if (mt) lw += mt.minAdv + t * (mt.maxAdv - mt.minAdv) + tracking;
                else lw += 0.25 + tracking;
                gi++;
            }
            lineWidths.push(lw);
            if (lw > maxLW) maxLW = lw;
        }
    }

    // --- Pass 2: full layout ---
    const glyphPaths = [];
    const glyphPositions = [];
    let combinedD = "";
    let maxLineWidth = 0;
    let glyphIndex = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++)
    {
        const lineStr = lines[lineIdx];
        const lineOffsetY = lineIdx * lineHeightNorm;
        const centerOffset = doCenter ? (maxLW - lineWidths[lineIdx]) * 0.5 : 0;
        let curX = centerOffset;

        if (lineStr.length === 0) continue;

        for (let i = 0; i < lineStr.length; i++)
        {
            const ch = lineStr[i];
            const mt = morphTargets[ch];

            // Morph value for this letter (0→1)
            let t = defaultMorph;
            if (morphValues && morphValues.length > 0)
            {
                if (glyphIndex < morphValues.length)
                {
                    t = morphValues[glyphIndex];
                }
                else
                {
                    t = morphValues[morphValues.length - 1];
                }
            }
            // Clamp 0→1
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            if (!mt || mt.isEmpty)
            {
                // Space or unknown character
                glyphPaths.push("");
                glyphPositions.push(curX, -lineOffsetY, 0);

                if (mt)
                {
                    curX += mt.minAdv + t * (mt.maxAdv - mt.minAdv) + tracking;
                }
                else
                {
                    curX += 0.25 + tracking;
                }

                glyphIndex++;
                continue;
            }

            // --- LERP coordinates ---
            const cmds = mt.cmds;
            const minC = mt.minCrds;
            const maxC = mt.maxCrds;
            const numCrds = minC.length;

            // Build SVG path at origin (for Glyph Paths)
            let pathD = "";
            let crdIdx = 0;

            for (let j = 0; j < cmds.length; j++)
            {
                const cmd = cmds[j];

                if (cmd === "moveTo")
                {
                    const x = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]);
                    const y = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]);
                    pathD += "M" + x.toFixed(PRECISION) + " " + y.toFixed(PRECISION);
                    crdIdx += 2;
                }
                else if (cmd === "lineTo")
                {
                    const x = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]);
                    const y = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]);
                    pathD += "L" + x.toFixed(PRECISION) + " " + y.toFixed(PRECISION);
                    crdIdx += 2;
                }
                else if (cmd === "quadraticCurveTo")
                {
                    const x1 = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]);
                    const y1 = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]);
                    const x2 = minC[crdIdx + 2] + t * (maxC[crdIdx + 2] - minC[crdIdx + 2]);
                    const y2 = minC[crdIdx + 3] + t * (maxC[crdIdx + 3] - minC[crdIdx + 3]);
                    pathD += "Q" + x1.toFixed(PRECISION) + " " + y1.toFixed(PRECISION)
                           + " " + x2.toFixed(PRECISION) + " " + y2.toFixed(PRECISION);
                    crdIdx += 4;
                }
                else if (cmd === "bezierCurveTo")
                {
                    const x1 = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]);
                    const y1 = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]);
                    const x2 = minC[crdIdx + 2] + t * (maxC[crdIdx + 2] - minC[crdIdx + 2]);
                    const y2 = minC[crdIdx + 3] + t * (maxC[crdIdx + 3] - minC[crdIdx + 3]);
                    const x3 = minC[crdIdx + 4] + t * (maxC[crdIdx + 4] - minC[crdIdx + 4]);
                    const y3 = minC[crdIdx + 5] + t * (maxC[crdIdx + 5] - minC[crdIdx + 5]);
                    pathD += "C" + x1.toFixed(PRECISION) + " " + y1.toFixed(PRECISION)
                           + " " + x2.toFixed(PRECISION) + " " + y2.toFixed(PRECISION)
                           + " " + x3.toFixed(PRECISION) + " " + y3.toFixed(PRECISION);
                    crdIdx += 6;
                }
                else if (cmd === "closePath")
                {
                    pathD += "Z";
                }
            }

            glyphPaths.push(pathD);
            glyphPositions.push(curX, -lineOffsetY, 0);

            // Combined path with offset
            if (!skipCombined)
            {
                let offsetD = "";
                crdIdx = 0;

                for (let j = 0; j < cmds.length; j++)
                {
                    const cmd = cmds[j];

                    if (cmd === "moveTo")
                    {
                        const x = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]) + curX;
                        const y = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]) - lineOffsetY;
                        offsetD += "M" + x.toFixed(PRECISION) + " " + y.toFixed(PRECISION);
                        crdIdx += 2;
                    }
                    else if (cmd === "lineTo")
                    {
                        const x = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]) + curX;
                        const y = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]) - lineOffsetY;
                        offsetD += "L" + x.toFixed(PRECISION) + " " + y.toFixed(PRECISION);
                        crdIdx += 2;
                    }
                    else if (cmd === "quadraticCurveTo")
                    {
                        const x1 = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]) + curX;
                        const y1 = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]) - lineOffsetY;
                        const x2 = minC[crdIdx + 2] + t * (maxC[crdIdx + 2] - minC[crdIdx + 2]) + curX;
                        const y2 = minC[crdIdx + 3] + t * (maxC[crdIdx + 3] - minC[crdIdx + 3]) - lineOffsetY;
                        offsetD += "Q" + x1.toFixed(PRECISION) + " " + y1.toFixed(PRECISION)
                                 + " " + x2.toFixed(PRECISION) + " " + y2.toFixed(PRECISION);
                        crdIdx += 4;
                    }
                    else if (cmd === "bezierCurveTo")
                    {
                        const x1 = minC[crdIdx] + t * (maxC[crdIdx] - minC[crdIdx]) + curX;
                        const y1 = minC[crdIdx + 1] + t * (maxC[crdIdx + 1] - minC[crdIdx + 1]) - lineOffsetY;
                        const x2 = minC[crdIdx + 2] + t * (maxC[crdIdx + 2] - minC[crdIdx + 2]) + curX;
                        const y2 = minC[crdIdx + 3] + t * (maxC[crdIdx + 3] - minC[crdIdx + 3]) - lineOffsetY;
                        const x3 = minC[crdIdx + 4] + t * (maxC[crdIdx + 4] - minC[crdIdx + 4]) + curX;
                        const y3 = minC[crdIdx + 5] + t * (maxC[crdIdx + 5] - minC[crdIdx + 5]) - lineOffsetY;
                        offsetD += "C" + x1.toFixed(PRECISION) + " " + y1.toFixed(PRECISION)
                                 + " " + x2.toFixed(PRECISION) + " " + y2.toFixed(PRECISION)
                                 + " " + x3.toFixed(PRECISION) + " " + y3.toFixed(PRECISION);
                        crdIdx += 6;
                    }
                    else if (cmd === "closePath")
                    {
                        offsetD += "Z";
                    }
                }

                combinedD += offsetD;
            }

            // Advance cursor — advance is also interpolated
            curX += mt.minAdv + t * (mt.maxAdv - mt.minAdv) + tracking;

            glyphIndex++;
        }

        if (!doCenter && curX > maxLineWidth) maxLineWidth = curX;
    }

    if (doCenter) maxLineWidth = maxLW;

    const baseLineH = (ascender - descender) * scale;
    const totalHeight = (lines.length > 1)
        ? (lines.length - 1) * Math.abs(lineHeightNorm) + baseLineH
        : baseLineH;

    outGlyphPaths.setRef(glyphPaths);
    outGlyphPositions.set(glyphPositions);
    outCombinedPath.set(combinedD);
    outWidth.set(maxLineWidth);
    outHeight.set(totalHeight);
    outGlyphCount.set(glyphIndex);
    outText.set(str);
    outTrackingVal.set(tracking);
}

// =============================================
// CHANGE HANDLERS
// =============================================
inFontObject.onChange = function ()
{
    needsRebuild = true;
    render();
};
inText.onChange = function ()
{
    needsRebuild = true;
    render();
};
inAxisTag.onChange = function ()
{
    needsRebuild = true;
    render();
};
inAxisMin.onChange = function ()
{
    needsRebuild = true;
    render();
};
inAxisMax.onChange = function ()
{
    needsRebuild = true;
    render();
};

// These inputs do NOT require a rebuild — just a re-render
inMorphValues.onChange = render;
inTracking.onChange = render;
inLineHeight.onChange = render;
inDefaultMorph.onChange = render;
inSkipCombined.onChange = render;
