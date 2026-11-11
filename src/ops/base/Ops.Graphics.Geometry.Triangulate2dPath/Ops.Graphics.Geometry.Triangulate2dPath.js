const
    inExec = op.inTriggerButton("Update"),
    inWinding = op.inDropDown("Combine", ["Positive", "Odd", "Intersect", "Negative", "Subtract"], "Positive"),
    inPath = op.inArray("2d Point Path"),
    inPath2 = op.inArray("Path 2"),
    inPath3 = op.inArray("Path 3"),
    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry");

inExec.onTriggered = tess;
let geom = null;

function signedArea(p)
{
    let a = 0;
    for (let i = 0; i < p.length; i += 2)
    {
        const j = (i + 2) % p.length;
        a += p[i] * p[j + 1] - p[j] * p[i + 1];
    }
    return a;
}

function reversePath(p)
{
    const r = [];
    for (let i = p.length - 2; i >= 0; i -= 2) r.push(p[i], p[i + 1]);
    return r;
}

function tess()
{
    // var Tess2 = require('tess2');

    // Define input
    // var ca = [0,0, 10,0, 5,10];
    // var cb = [0,2, 10,2, 10,6, 0,6];
    // var contours = [ca,cb];

    let points = inPath.get();

    if (!points || points.length === 0)
    {
        outGeom.set(null);
        return;
    }

    let contours = [points];

    let points2 = inPath2.get();
    if (points2 && points2.length > 0) contours.push(points2);

    let points3 = inPath3.get();
    if (points3 && points3.length > 0) contours.push(points3);

    let winding = Tess2.WINDING_ODD;
    if (inWinding.get() == "Positive")
    {
        winding = Tess2.WINDING_POSITIVE;
    }
    if (inWinding.get() == "Negative")
    {
        winding = Tess2.WINDING_NEGATIVE;
    }
    if (inWinding.get() == "Intersect")
    {
        winding = Tess2.WINDING_ABS_GEQ_TWO;
    }
    if (inWinding.get() == "Subtract")
    {
        // first path counter clockwise, others clockwise
        winding = Tess2.WINDING_POSITIVE;
        for (let i = 0; i < contours.length; i++)
            if ((signedArea(contours[i]) > 0) != (i == 0)) contours[i] = reversePath(contours[i]);
    }

    let res = null;
    try
    {
        // Tesselate
        res = Tess2.tesselate(
            {
                "contours": contours,
                "windingRule": winding,
                "elementType": Tess2.POLYGONS,
                "polySize": 3,
                "vertexSize": 2
            });
    }
    catch (e) {}

    if (res)
    {
        let changed = true;

        if (geom) changed = geom.vertices.length / 3 != res.vertices.length / 2;
        // console.log("text",res);

        if (changed)
        {
            geom = new CGL.Geometry("tess2geom");
        }

        let verts3 = [];
        for (let i = 0; i < res.vertices.length; i += 2)
        {
            verts3.push(res.vertices[i + 0], res.vertices[i + 1], 0);
        }

        geom.vertices = verts3;
        geom.verticesIndices = res.elements;
        geom.calculateNormals();
        geom.mapTexCoords2d();
        geom.flipVertDir();

        outGeom.setRef(geom);
    }
    else outGeom.set(null);

    next.trigger();
}
