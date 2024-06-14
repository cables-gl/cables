const
    render = op.inTrigger("render"),
    doRender = op.inValueBool("dorender", true),
    width = op.inValue("width", 1),
    height = op.inValue("height", 1),
    pivotX = op.inSwitch("pivot x", ["left", "center", "right"], "center"),
    pivotY = op.inSwitch("pivot y", ["top", "center", "bottom"], "center"),
    axis = op.inSwitch("axis", ["xy", "xz"], "xy"),
    flipTcX = op.inBool("Flip TexCoord X", false),
    flipTcY = op.inBool("Flip TexCoord Y", true),
    nColumns = op.inValueInt("num columns", 1),
    nRows = op.inValueInt("num rows", 1),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry", null, "geometry");

geomOut.ignoreValueSerialize = true;

const geom = new CGL.Geometry("rectangle");

doRender.setUiAttribs({ "title": "Render" });
render.setUiAttribs({ "title": "Trigger" });
trigger.setUiAttribs({ "title": "Next" });
op.setPortGroup("Pivot", [pivotX, pivotY, axis]);
op.setPortGroup("Size", [width, height]);
op.setPortGroup("Structure", [nColumns, nRows]);
op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

let mesh = null;
let needsRebuild = true;

axis.onChange =
    pivotX.onChange =
    pivotY.onChange =
    flipTcX.onChange =
    flipTcY.onChange =
    width.onChange =
    height.onChange =
    nRows.onChange =
    nColumns.onChange = rebuildLater;

function rebuildLater()
{
    needsRebuild = true;
}

render.onLinkChanged = () =>
{
    if (!trigger.isLinked())
    {
        if (mesh) mesh.dispose();
        mesh = null;
        geomOut.set(null);
        rebuildLater();
    }
};

op.preRender =
render.onTriggered = function ()
{
    if (needsRebuild) rebuild();
    if (mesh && doRender.get()) mesh.render(op.patch.cg.getShader());
    trigger.trigger();
};

op.onDelete = function ()
{
    if (mesh)mesh.dispose();
    rebuildLater();
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

    const verts = [];
    const tc = [];
    const norms = [];
    const tangents = [];
    const biTangents = [];
    const indices = [];

    const numRows = Math.round(nRows.get());
    const numColumns = Math.round(nColumns.get());

    const stepColumn = w / numColumns;
    const stepRow = h / numRows;

    op.log("rect build");

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
            tc.push(r / numRows);

            if (a == "xy") // default
            {
                norms.push(0, 0, 1);
                tangents.push(1, 0, 0);
                biTangents.push(0, 1, 0);
            }
            else if (a == "xz")
            {
                norms.push(0, 1, 0);
                tangents.push(1, 0, 0);
                biTangents.push(0, 0, 1);
            }
        }
    }

    for (c = 0; c < numColumns; c++)
    {
        for (r = 0; r < numRows; r++)
        {
            const ind = c + (numColumns + 1) * r;
            const v1 = ind;
            const v2 = ind + 1;
            const v3 = ind + numColumns + 1;
            const v4 = ind + 1 + numColumns + 1;

            if (a == "xy") // default
            {
                indices.push(v1);
                indices.push(v2);
                indices.push(v3);

                indices.push(v3);
                indices.push(v2);
                indices.push(v4);
            }
            else
            if (a == "xz")
            {
                indices.push(v1);
                indices.push(v3);
                indices.push(v2);

                indices.push(v2);
                indices.push(v3);
                indices.push(v4);
            }
        }
    }

    if (flipTcY.get()) for (let i = 0; i < tc.length; i += 2)tc[i + 1] = 1.0 - tc[i + 1];
    if (flipTcX.get()) for (let i = 0; i < tc.length; i += 2)tc[i] = 1.0 - tc[i];

    geom.clear();
    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.vertexNormals = norms;
    geom.tangents = tangents;
    geom.biTangents = biTangents;

    // if (numColumns * numRows > 64000)geom.unIndex();

    const cgl = op.patch.cgl;

    if (op.patch.cg)
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
    needsRebuild = false;
}
