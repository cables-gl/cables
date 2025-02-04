const
    render = op.inTrigger("Render"),
    width = op.inValueFloat("Width", 1),
    height = op.inValueFloat("Height", 1),
    thickness = op.inValueFloat("Thickness", -0.1),
    dodraw = op.inValueBool("Draw", true),
    pivotX = op.inValueSelect("pivot x", ["center", "left", "right"]),
    pivotY = op.inValueSelect("pivot y", ["center", "top", "bottom"]),

    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("Geometry");

op.setPortGroup("Size", [width, height]);
op.setPortGroup("Align", [pivotX, pivotY]);

let cgl = op.patch.cgl;
let mesh = null;
let geom = new CGL.Geometry(op.name);
geom.tangents = [];
geom.biTangents = [];

pivotX.set("center");
pivotY.set("center");

geomOut.ignoreValueSerialize = true;

width.onChange =
    pivotX.onChange =
    pivotY.onChange =
    height.onChange =
    thickness.onChange = () => { mesh = null; };

op.onDelete = function () { if (mesh)mesh.dispose(); };

render.onTriggered = function ()
{
    if (!mesh)create();
    if (dodraw.get()) mesh.render();
    trigger.trigger();
};

function create()
{
    let w = width.get();
    let h = height.get();
    let x = -w / 2;
    let y = -h / 2;
    let th = thickness.get();

    let pivot = pivotX.get();
    if (pivot == "right") x = -w;
    else if (pivot == "left") x = 0;

    pivot = pivotY.get();
    if (pivot == "top") y = -w;
    else if (pivot == "bottom") y = 0;

    geom.vertices.length = 0;
    geom.vertices.push(
        x, y, 0, x + w, y, 0, x + w, y + h, 0, x, y + h, 0, x - th, y, 0, x + w + th, y - th, 0, x + w, y + h + th, 0, x - th, y + h + th, 0
    );

    if (geom.vertexNormals.length === 0) geom.vertexNormals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    if (geom.tangents.length === 0) geom.tangents = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
    if (geom.biTangents.length === 0) geom.biTangents = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

    geom.verticesIndices = [7, 6, 3, 6, 2, 3, 0, 4, 3, 4, 7, 3];

    if (geom.texCoords.length === 0)
    {
        const tc = [];
        for (let i = 0; i < geom.vertices.length; i += 3)
        {
            tc[i / 3 * 2] = geom.vertices[i + 0] / w - 0.5;
            tc[i / 3 * 2 + 1] = geom.vertices[i + 1] / h - 0.5;
        }
        geom.texCoords = tc;
    }

    if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
    else mesh.setGeom(geom);

    geomOut.setRef(geom);
}
