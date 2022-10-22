const
    render = op.inTrigger("Render"),
    width = op.inValueFloat("Width", 1),
    height = op.inValueFloat("Height", 1),
    thickness = op.inValueFloat("Thickness", -0.1),
    pivotX = op.inSwitch("pivot x", ["center", "left", "right"], "center"),
    pivotY = op.inSwitch("pivot y", ["center", "top", "bottom"], "center"),

    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("Geometry"),

    drawTop = op.inValueBool("Draw Top", true),
    drawBottom = op.inValueBool("Draw Bottom", true),
    drawLeft = op.inValueBool("Draw Left", true),
    drawRight = op.inValueBool("Draw Right", true),
    active = op.inValueBool("Active", true);

op.setPortGroup("Geometry", [width, height, thickness]);
op.setPortGroup("Transform", [pivotX, pivotY]);
op.setPortGroup("Sections", [drawTop, drawBottom, drawLeft, drawRight]);

const cgl = op.patch.cgl;
let mesh = null;
const geom = new CGL.Geometry(op.name);
geom.tangents = [];
geom.biTangents = [];

geomOut.ignoreValueSerialize = true;

width.onChange =
    pivotX.onChange =
    pivotY.onChange =
    height.onChange =
    thickness.onChange =
    drawTop.onChange =
    drawBottom.onChange =
    drawLeft.onChange =
    drawRight.onChange = create;

create();

render.onTriggered = function ()
{
    if (active.get()) mesh.render(cgl.getShader());

    trigger.trigger();
};

function create()
{
    const w = width.get();
    const h = height.get();
    let x = -w / 2;
    let y = -h / 2;
    const th = thickness.get();//* Math.min(height.get(),width.get())*-0.5;

    if (pivotX.get() == "right") x = -w;
    else if (pivotX.get() == "left") x = 0;

    if (pivotY.get() == "top") y = -h;
    else if (pivotY.get() == "bottom") y = 0;

    geom.vertices.length = 0;
    geom.vertices.push(
        x, y, 0,
        x + w, y, 0,
        x + w, y + h, 0,
        x, y + h, 0,
        x - th, y - th, 0,
        x + w + th, y - th, 0,
        x + w + th, y + h + th, 0,
        x - th, y + h + th, 0
    );

    if (geom.vertexNormals.length === 0) geom.vertexNormals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    if (geom.tangents.length === 0) geom.tangents = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
    if (geom.biTangents.length === 0) geom.biTangents = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

    if (geom.verticesIndices)geom.verticesIndices.length = 0;
    else geom.verticesIndices = [];

    const vertInd = [];
    if (drawBottom.get()) vertInd.push(0, 1, 4, 1, 5, 4);
    if (drawRight.get()) vertInd.push(1, 2, 5, 5, 2, 6);
    if (drawTop.get()) vertInd.push(7, 6, 3, 6, 2, 3);
    if (drawLeft.get()) vertInd.push(0, 4, 3, 4, 7, 3);
    geom.verticesIndices = vertInd;

    if (geom.texCoords.length === 0)
    {
        const tc = [];
        for (let i = 0, j = 0; i < geom.vertices.length; i += 3, j += 2)
        {
            tc[j] = geom.vertices[i + 0] / w - 0.5;
            tc[j + 1] = geom.vertices[i + 1] / h - 0.5;
        }
        geom.texCoords = tc;
    }

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}
