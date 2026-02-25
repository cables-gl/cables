// ============================================
// FontkitGlyphCombine — recombines Glyph Paths + Positions into a single SVG path
// ============================================
// Takes the Glyph Paths output (array of SVG path strings at origin)
// and Glyph Positions (array3x) and rebuilds a single combined SVG path
// with each glyph correctly positioned.
//
// This is the last link in the chain before SvgPathToGeometry.

// --- INPUTS ---
const inGlyphPaths = op.inArray("Glyph Paths");
const inGlyphPositions = op.inArray("Glyph Positions");

// --- OUTPUTS ---
const outPath = op.outString("SVG Path");
const outPathData = op.outObject("Path Data");
const outWidth = op.outNumber("Text Width");
const outHeight = op.outNumber("Text Height");
const outGlyphCount = op.outNumber("Glyph Count");

// SVG precision
const PRECISION = 6;

// =============================================
// CHANGE HANDLERS
// =============================================
inGlyphPaths.onChange = update;
inGlyphPositions.onChange = update;

// =============================================
// Fast SVG parser — avoids regex, split and map(Number)
// =============================================
function parsePathNums(str)
{
    const nums = [];
    const len = str.length;
    let i = 0;

    while (i < len)
    {
        const c = str.charCodeAt(i);

        // Skip spaces and commas
        if (c === 32 || c === 44 || c === 9 || c === 10 || c === 13) { i++; continue; }

        // Start of a number
        const start = i;

        // Negative sign
        if (c === 45) i++;

        // Integer part
        while (i < len && str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) i++;

        // Decimal point + fractional part
        if (i < len && str.charCodeAt(i) === 46)
        {
            i++;
            while (i < len && str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) i++;
        }

        // Scientific notation
        if (i < len && (str.charCodeAt(i) === 101 || str.charCodeAt(i) === 69))
        {
            i++;
            if (i < len && (str.charCodeAt(i) === 43 || str.charCodeAt(i) === 45)) i++;
            while (i < len && str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) i++;
        }

        if (i > start) nums.push(+str.substring(start, i));
        else i++;
    }

    return nums;
}

// =============================================
// UPDATE — combine paths with their positions
// =============================================
function update()
{
    const paths = inGlyphPaths.get();
    const positions = inGlyphPositions.get();

    if (!paths || !positions || paths.length === 0)
    {
        outPath.set("");
        outPathData.set(null);
        outWidth.set(0);
        outHeight.set(0);
        outGlyphCount.set(0);
        return;
    }

    const parts = [];
    const allCmds = [];
    const allCrds = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    const numPaths = paths.length;

    for (let i = 0; i < numPaths; i++)
    {
        const pathStr = paths[i];
        if (!pathStr || pathStr.length === 0) continue;

        const i3 = i * 3;
        const px = i3 < positions.length ? positions[i3] : 0;
        const py = i3 + 1 < positions.length ? positions[i3 + 1] : 0;

        // Manually parse the SVG path
        const len = pathStr.length;
        let j = 0;

        while (j < len)
        {
            const code = pathStr.charCodeAt(j);

            // Skip spaces and commas
            if (code === 32 || code === 44 || code === 9) { j++; continue; }

            // SVG command (letter)
            if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122))
            {
                const cmd = pathStr[j].toUpperCase();
                j++;

                if (cmd === "Z")
                {
                    parts.push("Z");
                    allCmds.push("Z");
                    continue;
                }

                // Find the end of the numeric data
                const dataStart = j;
                while (j < len)
                {
                    const nc = pathStr.charCodeAt(j);
                    if ((nc >= 65 && nc <= 90) || (nc >= 97 && nc <= 122)) break;
                    j++;
                }

                const nums = parsePathNums(pathStr.substring(dataStart, j));

                parts.push(cmd);
                allCmds.push(cmd);

                for (let k = 0; k < nums.length; k += 2)
                {
                    const x = nums[k] + px;
                    const y = nums[k + 1] - py;

                    if (k > 0) parts.push(" ");
                    parts.push(x.toFixed(PRECISION));
                    parts.push(" ");
                    parts.push(y.toFixed(PRECISION));

                    allCrds.push(x, y);

                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
            else
            {
                j++;
            }
        }
    }

    outPath.set(parts.join(""));
    outPathData.set({
        "cmds": allCmds,
        "crds": allCrds
    });
    outWidth.set(maxX > -Infinity ? maxX - minX : 0);
    outHeight.set(maxY > -Infinity ? maxY - minY : 0);
    outGlyphCount.set(numPaths);
}
