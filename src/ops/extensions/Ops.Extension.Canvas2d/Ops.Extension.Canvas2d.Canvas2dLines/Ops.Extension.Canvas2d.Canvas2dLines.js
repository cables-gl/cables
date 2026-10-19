const
    inExec = op.inTrigger("Exec"),
    inPoints = op.inArray("Points"),
    inClosed = op.inBool("Closed", false),
    inSmooth = op.inBool("Smooth", false),
    inFill = op.inBool("Fill", false),
    inStroke = op.inBool("Stroke", true),
    next = op.outTrigger("Next");

op.setUiAttrib({ "extendTitle": null });

function isPoint(value)
{
    return Array.isArray(value) && value.length == 2 && typeof value[0] == "number";
}

// a line is a flat array [x0, y0, x1, y1, ...] or an array of points [[x0, y0], [x1, y1], ...]
function isLine(value)
{
    if (!Array.isArray(value) || value.length == 0) return false;
    return typeof value[0] == "number" || isPoint(value[0]);
}

// the input is one line, or an array of lines
function getLines(value)
{
    if (!Array.isArray(value) || value.length == 0) return [];
    if (typeof value[0] == "number") return [value];

    let allPoints = true;
    for (let i = 0; i < value.length; i++) if (!isPoint(value[i])) allPoints = false;
    if (allPoints) return [value];

    const lines = [];
    for (let i = 0; i < value.length; i++) if (isLine(value[i])) lines.push(value[i]);
    return lines;
}

// the points of a line as [[x0, y0], [x1, y1], ...]
function getPoints(line)
{
    if (typeof line[0] != "number") return line;

    const points = [];
    for (let i = 0; i + 1 < line.length; i += 2) points.push([line[i], line[i + 1]]);
    return points;
}

function addStraightLine(ctx, points)
{
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
}

// catmull-rom curve through all points, drawn as bezier segments; a closed line wraps around
function addSmoothLine(ctx, points, closed)
{
    const num = points.length;
    const getPoint = (i) =>
    {
        if (closed) return points[(i + num) % num];
        return points[Math.min(Math.max(i, 0), num - 1)];
    };
    const numSegments = closed ? num : num - 1;

    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 0; i < numSegments; i++)
    {
        const p0 = getPoint(i - 1);
        const p1 = getPoint(i);
        const p2 = getPoint(i + 1);
        const p3 = getPoint(i + 2);

        ctx.bezierCurveTo(
            p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
            p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
            p2[0], p2[1]);
    }
}

function addLine(ctx, line)
{
    const points = getPoints(line);
    if (points.length < 2) return;

    if (inSmooth.get()) addSmoothLine(ctx, points, inClosed.get());
    else addStraightLine(ctx, points);

    if (inClosed.get()) ctx.closePath();
}

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;
        const lines = getLines(inPoints.get());

        if (lines.length)
        {
            ctx.beginPath();
            for (let i = 0; i < lines.length; i++) addLine(ctx, lines[i]);
            if (inFill.get()) ctx.fill();
            if (inStroke.get()) ctx.stroke();
        }
    }

    next.trigger();
};
