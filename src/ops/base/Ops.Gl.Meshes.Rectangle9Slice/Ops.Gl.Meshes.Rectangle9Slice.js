const
    render = op.inTrigger("Render"),
    width = op.inValueFloat("Width", 1),
    height = op.inValueFloat("Height", 1),

    inUVScalar = op.inValueFloat("Border Width", 0.2),

    inScaleX = op.inValueFloat("Scale X", 1),
    inScaleY = op.inValueFloat("Scale Y", 1),

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
    inScaleY.onChange =
    inScaleX.onChange =
    inUVScalar.onChange =
        () => { mesh = null; };

render.onTriggered = function ()
{
    if (!mesh)create();
    if (dodraw.get()) mesh.render(cgl.getShader());
    trigger.trigger();
};

function create()
{
    let w = width.get();
    let h = height.get();

    const minW = inUVScalar.get() * 2 * inScaleX.get();
    w = Math.max(minW, w);

    const minH = inUVScalar.get() * 2 * inScaleY.get();
    h = Math.max(minH, h);

    let x = -w / 2;
    let y = -h / 2;

    let pivot = pivotX.get();
    if (pivot == "right") x = -w;
    else if (pivot == "left") x = 0;

    pivot = pivotY.get();
    if (pivot == "top") y = -h;
    else if (pivot == "bottom") y = 0;

    let uvLeft = inUVScalar.get();
    let uvRight = inUVScalar.get();
    let uvTop = inUVScalar.get();
    let uvBottom = inUVScalar.get();
    let uvToWorldScaleX = inScaleX.get();
    let uvToWorldScaleY = inScaleY.get();

    let l = uvLeft * uvToWorldScaleX;
    let r = w - uvRight * uvToWorldScaleX;
    let t = h - uvTop * uvToWorldScaleY;
    let b = uvBottom * uvToWorldScaleY;

    geom = new CGL.Geometry(op.name);

    geom.vertices = [
        x + 0, y + 0, 0,
        x + 0, y + b, 0,
        x + 0, y + t, 0,
        x + 0, y + h, 0,
        x + l, y + h, 0,
        x + r, y + h, 0,
        x + w, y + h, 0,
        x + w, y + t, 0,
        x + w, y + b, 0,
        x + w, y + 0, 0,
        x + r, y + 0, 0,
        x + l, y + 0, 0,
        x + l, y + b, 0,
        x + l, y + t, 0,
        x + r, y + t, 0,
        x + r, y + b, 0];

    geom.verticesIndices = [
        0, 12, 1, 12, 0, 11,
        1, 13, 2, 13, 1, 12,
        2, 4, 3, 4, 2, 13,
        13, 5, 4, 5, 13, 14,
        14, 6, 5, 6, 14, 7,
        15, 7, 14, 7, 15, 8,
        10, 8, 15, 8, 10, 9,
        11, 15, 12, 15, 11, 10,
        12, 14, 13, 14, 12, 15];

    l = uvLeft;
    r = 1 - uvRight;
    t = 1 - uvTop;
    const uvh = 1;
    const uvw = 1;

    geom.texCoords = [
        0, 1 - 0,
        0, 1 - b,
        0, 1 - t,
        0, 1 - uvh,
        l, 1 - uvh,
        r, 1 - uvh,
        uvw, 1 - uvh,
        uvw, 1 - t,
        uvw, 1 - b,
        uvw, 1 - 0,
        r, 1 - 0,
        l, 1 - 0,
        l, 1 - b,
        l, 1 - t,
        r, 1 - t,
        r, 1 - b];

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);

    geomOut.setRef(geom);
}
