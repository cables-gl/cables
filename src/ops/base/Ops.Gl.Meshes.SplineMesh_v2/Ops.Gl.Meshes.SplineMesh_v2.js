const
    render = op.inTrigger("Render"),
    inPoints = op.inArray("Points"),
    inHardEdges = op.inBool("Tesselate Edges", false),
    inRenderMesh = op.inBool("Render Mesh", true),
    next = op.outTrigger("Next");

const geom = new CGL.Geometry("splinemesh_2");
geom.vertices = [];
geom.clear();

let thePoints = [];
const cgl = op.patch.cgl;
let points = new Float32Array();
let points2 = new Float32Array();
let points3 = new Float32Array();
let doDraw = new Float32Array();
let splineIndex = null;

let pointsProgress = new Float32Array();
const pointsDoDraw = new Float32Array();
const arrEdges = [];

const verts = [0, 0, 0];

let mesh = new CGL.Mesh(cgl, geom);
mesh.addVertexNumbers = true;

let rebuildLater = true;

inHardEdges.onChange =
    inPoints.onChange = () => { rebuildLater = true; };

render.onTriggered = renderMesh;

let shader = null;

function renderMesh()
{
    if (rebuildLater)rebuild();
    if (mesh && inRenderMesh.get())
    {
        if (shader != cgl.getShader())
        {
            shader = cgl.getShader();
            if (!shader) return;
            if (shader.getName() != "splinemesh_material") op.setUiError("nosplinemat", "Splinemesh needs a SplineMeshMaterial!");
            else op.setUiError("nosplinemat");

            shader = cgl.getShader();
        }

        if (verts.length > 0) mesh.render(shader);
    }

    next.trigger();
}

function buildMesh()
{
    verts.length = 0;

    const max = 1;
    const min = -max;

    for (let i = 0; i < thePoints.length / 3; i++)
    {
        verts.push(
            max, min, 0, 0, min, 0, max, max, 0, 0, min, 0, 0, max, 0, max, max, 0
        );
    }
    geom.vertices = verts;

    // if(mesh)mesh.dispose();
    if (!mesh) mesh = new CGL.Mesh(cgl, geom);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
    mesh.addVertexNumbers = true;
}

function rebuild()
{
    const inpoints = inPoints.get();

    if (!inpoints || inpoints.length === 0)
    {
        mesh = null;
        return;
    }

    if (inpoints[0] && inpoints[0].length)
    {
        const arr = [];
        splineIndex = [];
        let count = 0;

        for (let i = 0; i < inpoints.length; i++)
        {
            for (let j = 0; j < inpoints[i].length / 3; j++)
            {
                splineIndex[(count - 3) / 3] = i;// (i) / inpoints.length;

                arr[count++] = inpoints[i][j * 3 + 0];
                arr[count++] = inpoints[i][j * 3 + 1];
                arr[count++] = inpoints[i][j * 3 + 2];
            }
        }
        thePoints = arr;
    }
    else
    {
        splineIndex = null;
        thePoints = inpoints;
    }

    if (inHardEdges.get()) thePoints = tessEdges(thePoints);

    buildMesh();

    const newLength = thePoints.length * 6;
    let count = 0;
    let lastIndex = 0;
    let drawable = 0;

    if (points.length != newLength)
    {
        points = new Float32Array(newLength);
        points2 = new Float32Array(newLength);
        points3 = new Float32Array(newLength);

        doDraw = new Float32Array(newLength / 3);
        pointsProgress = new Float32Array(newLength / 3);

        for (let i = 0; i < newLength / 3; i++) pointsProgress[i] = i / (newLength / 3);
    }

    for (let i = 0; i < thePoints.length / 3; i++)
    {
        if (splineIndex)
        {
            if (i > 1 && lastIndex != splineIndex[i]) drawable = 0.0;
            else drawable = 1.0;
            lastIndex = splineIndex[i];
        }
        else drawable = 1.0;

        for (let j = 0; j < 6; j++)
        {
            doDraw[count / 3] = drawable;

            for (let k = 0; k < 3; k++)
            {
                points[count] = thePoints[(Math.max(0, i - 1)) * 3 + k];
                points2[count] = thePoints[(i + 0) * 3 + k];
                points3[count] = thePoints[(i + 1) * 3 + k];
                count++;
            }
        }
    }

    mesh.setAttribute("spline", points, 3);
    mesh.setAttribute("spline2", points2, 3);
    mesh.setAttribute("spline3", points3, 3);
    mesh.setAttribute("splineDoDraw", doDraw, 1);
    mesh.setAttribute("splineProgress", pointsProgress, 1);

    rebuildLater = false;
}

function ip(a, b, p)
{
    return a + p * (b - a);
}

function tessEdges(oldArr)
{
    let count = 0;
    const step = 0.001;
    const oneMinusStep = 1 - step;
    const l = oldArr.length * 3 - 3;
    arrEdges.length = l;

    const tessSplineIndex = [];

    if (splineIndex) tessSplineIndex[0] = splineIndex[1];

    for (let i = 0; i < oldArr.length - 3; i += 3)
    {
        arrEdges[count++] = oldArr[i + 0];
        arrEdges[count++] = oldArr[i + 1];
        arrEdges[count++] = oldArr[i + 2];
        if (splineIndex) tessSplineIndex[count / 3] = splineIndex[i / 3];

        arrEdges[count++] = ip(oldArr[i + 0], oldArr[i + 3], step);
        arrEdges[count++] = ip(oldArr[i + 1], oldArr[i + 4], step);
        arrEdges[count++] = ip(oldArr[i + 2], oldArr[i + 5], step);
        if (splineIndex) tessSplineIndex[count / 3] = splineIndex[i / 3];

        arrEdges[count++] = ip(oldArr[i + 0], oldArr[i + 3], oneMinusStep);
        arrEdges[count++] = ip(oldArr[i + 1], oldArr[i + 4], oneMinusStep);
        arrEdges[count++] = ip(oldArr[i + 2], oldArr[i + 5], oneMinusStep);
        if (splineIndex) tessSplineIndex[count / 3] = splineIndex[i / 3];
    }

    if (splineIndex) splineIndex = tessSplineIndex;

    return arrEdges;
}
