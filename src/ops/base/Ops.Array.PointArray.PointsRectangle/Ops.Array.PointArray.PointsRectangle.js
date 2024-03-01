const
    inStrip = op.inBool("Line Strip", false),
    inSegments = op.inValueInt("Segments", 24),
    sizeW = op.inValueFloat("width", 1),
    sizeH = op.inValueFloat("height", 1),
    borderRadius = op.inValueSlider("border radius", 0.5),
    outArrPoints = op.outArray("Points", 3);

op.setPortGroup("Size", [sizeW, sizeH, borderRadius, inSegments]);

const inTopLeftCorner = op.inValueBool("Top Left", true);
const inTopRightCorner = op.inValueBool("Top Right", true);
const inBottomLeftCorner = op.inValueBool("Bottom Left", true);
const inBottomRightCorner = op.inValueBool("Bottom Right", true);
const CORNER_PORTS = [inTopLeftCorner, inTopRightCorner, inBottomLeftCorner, inBottomRightCorner];
CORNER_PORTS.forEach((port) =>
{
    port.onChange = create;
});

op.setPortGroup("Round Corner", CORNER_PORTS);

inStrip.onChange =
sizeW.onChange =
    sizeH.onChange =
    borderRadius.onChange =
    inSegments.onChange = create;

create();

function create()
{
    let points = [];
    const w = Math.abs(sizeW.get());
    const h = Math.abs(sizeH.get());

    const r = w < h ? (borderRadius.get() * w) / 2 : (borderRadius.get() * h) / 2;

    const wi = w - 2 * r;
    const hi = h - 2 * r;
    const wiHalf = wi / 2;
    const hiHalf = hi / 2;

    const segments = Math.abs(inSegments.get() || 1);

    const topLeftCircleMiddle = [-1 * wiHalf, hiHalf, 0];
    const bottomLeftCircleMiddle = [-1 * wiHalf, -1 * hiHalf, 0];
    const topRightCircleMiddle = [wiHalf, hiHalf, 0];
    const bottomRightCircleMiddle = [wiHalf, -1 * hiHalf, 0];

    const circleVerts = [];
    let lastX = 0;
    let lastY = 0;

    // top left circle
    if (inTopLeftCorner.get())
    {
        for (let i = 0; i <= segments; i += 1)
        {
            const x = topLeftCircleMiddle[0] + (0 - r * Math.cos((i * Math.PI) / 2 / segments));
            const y = topLeftCircleMiddle[1] + r * Math.sin((i * Math.PI) / 2 / segments);

            circleVerts.push(x, y, 0);
        }
    }
    else circleVerts.push(-wiHalf - r, hiHalf + r, 0);

    if (inTopRightCorner.get())
    {
        // top right circle
        for (let i = 0; i <= segments; i += 1)
        {
            const x = topRightCircleMiddle[0] + r * Math.cos(((segments - i) * Math.PI) / 2 / segments);
            const y = topRightCircleMiddle[1] + r * Math.sin(((segments - i) * Math.PI) / 2 / segments);

            circleVerts.push(x, y, 0);
        }
    }
    else circleVerts.push(wiHalf + r, hiHalf + r, 0);

    if (inBottomRightCorner.get())
    {
        // bottom right circle
        for (let i = 0; i <= segments; i += 1)
        {
            const x = bottomRightCircleMiddle[0] + r * Math.cos((i * Math.PI) / 2 / segments);
            const y = bottomRightCircleMiddle[1] + r * -1 * Math.sin((i * Math.PI) / 2 / segments);

            circleVerts.push(x, y, 0);
        }
    }
    else circleVerts.push(wiHalf + r, -hiHalf - r, 0);

    if (inBottomLeftCorner.get())
    {
        // bottom left circle
        for (let i = 0; i <= segments; i += 1)
        {
            const x = bottomLeftCircleMiddle[0] + r * -1 * Math.cos(((segments - i) * Math.PI) / 2 / segments);
            const y = bottomLeftCircleMiddle[1] + r * -1 * Math.sin(((segments - i) * Math.PI) / 2 / segments);

            circleVerts.push(x, y, 0);
        }
    }
    else circleVerts.push(-wiHalf - r, -hiHalf - r, 0);

    points = [
        ...circleVerts,
        circleVerts[0], circleVerts[1], circleVerts[2]
    ];

    if (inStrip.get())
    {
        const newPoints = [];
        for (let i = 1; i < points.length / 3; i++)
        {
            newPoints.push(points[(i - 1) * 3 + 0], points[(i - 1) * 3 + 1], points[(i - 1) * 3 + 2]);
            newPoints.push(points[i * 3 + 0], points[i * 3 + 1], points[i * 3 + 2]);
        }
        points = newPoints;
    }

    outArrPoints.setRef(points);
}
