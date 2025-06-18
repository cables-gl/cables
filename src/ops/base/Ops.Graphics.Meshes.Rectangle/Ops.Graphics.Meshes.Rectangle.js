let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let width = op.inValue("width", 1);
let height = op.inValue("height", 1);

let pivotX = op.inSwitch("pivot x", ["left", "center", "right"]);
let pivotY = op.inSwitch("pivot y", ["top", "center", "bottom"]);

let nColumns = op.inValueInt("num columns", 1);
let nRows = op.inValueInt("num rows", 1);
let axis = op.inSwitch("axis", ["xy", "xz"], "xy");

let active = op.inValueBool("Active", true);

let geomOut = op.outObject("geometry");
geomOut.ignoreValueSerialize = true;

let cgl = op.patch.cgl;
axis.set("xy");
pivotX.set("center");
pivotY.set("center");

op.setPortGroup("Pivot", [pivotX, pivotY]);
op.setPortGroup("Size", [width, height]);
op.setPortGroup("Structure", [nColumns, nRows]);

let geom = new CGL.Geometry("rectangle");
let mesh = null;
let needsRebuild = false;

axis.onChange =
    pivotX.onChange =
    pivotY.onChange =
    width.onChange =
    height.onChange =
    nRows.onChange =
    nColumns.onChange = rebuildLater;
rebuild();

function rebuildLater()
{
    rebuild();
    // needsRebuild=true;
}

op.preRender =
render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    if (needsRebuild)rebuild();

    if (active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

function rebuild()
{
    let w = width.get();
    let h = parseFloat(height.get());
    let x = 0;
    let y = 0;

    if (typeof w == "string")w = parseFloat(w);
    if (typeof h == "string")h = parseFloat(h);

    if (pivotX.get() == "center") x = 0;
    else if (pivotX.get() == "right") x = -w / 2;
    else if (pivotX.get() == "left") x = +w / 2;

    if (pivotY.get() == "center") y = 0;
    else if (pivotY.get() == "top") y = -h / 2;
    else if (pivotY.get() == "bottom") y = +h / 2;

    let verts = [];
    let tc = [];
    let norms = [];
    let tangents = [];
    let biTangents = [];
    let indices = [];

    let numRows = Math.round(nRows.get());
    let numColumns = Math.round(nColumns.get());

    let stepColumn = w / numColumns;
    let stepRow = h / numRows;

    let c, r, a;
    a = axis.get();
    for (r = 0; r <= numRows; r++)
    {
        for (c = 0; c <= numColumns; c++)
        {
            verts.push(c * stepColumn - width.get() / 2 + x);
            if (a == "xz") verts.push(0.0);
            verts.push(r * stepRow - height.get() / 2 + y);
            if (a == "xy") verts.push(0.0);

            tc.push(c / numColumns);
            tc.push(1.0 - r / numRows);

            if (a == "xz")
            {
                norms.push(0, 1, 0);
                tangents.push(1, 0, 0);
                biTangents.push(0, 0, 1);
            }
            else if (a == "xy")
            {
                norms.push(0, 0, 1);
                tangents.push(-1, 0, 0);
                biTangents.push(0, -1, 0);
            }
        }
    }

    for (c = 0; c < numColumns; c++)
    {
        for (r = 0; r < numRows; r++)
        {
            let ind = c + (numColumns + 1) * r;
            let v1 = ind;
            let v2 = ind + 1;
            let v3 = ind + numColumns + 1;
            let v4 = ind + 1 + numColumns + 1;

            indices.push(v1);
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.clear();
    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.vertexNormals = norms;
    geom.tangents = tangents;
    geom.biTangents = biTangents;

    if (numColumns * numRows > 64000)geom.unIndex();

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
    needsRebuild = false;
}

op.onDelete = function ()
{
    if (mesh)mesh.dispose();
};
