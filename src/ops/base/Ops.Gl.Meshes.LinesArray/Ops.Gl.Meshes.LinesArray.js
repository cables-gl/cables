const
    render = op.inTrigger("render"),
    width = op.inValueFloat("width", 10),
    height = op.inValueFloat("height", 1),
    doLog = op.inValueBool("Logarithmic", false),
    pivotX = op.inValueSelect("pivot x", ["center", "left", "right"], "center"),
    pivotY = op.inValueSelect("pivot y", ["center", "top", "bottom"], "center"),
    nColumns = op.inValueInt("num columns", 10),
    nRows = op.inValueInt("num rows", 10),
    axis = op.inValueSelect("axis", ["xy", "xz"], "xy"),
    trigger = op.outTrigger("trigger"),
    outPointArrays = op.outArray("Point Arrays");

const cgl = op.patch.cgl;
let meshes = [];

op.setPortGroup("Size", [width, height]);
op.setPortGroup("Alignment", [pivotX, pivotY]);

axis.onChange =
    pivotX.onChange =
    pivotY.onChange =
    width.onChange =
    height.onChange =
    nRows.onChange =
    nColumns.onChange =
    doLog.onChange = rebuildDelayed;

rebuild();

render.onTriggered = function ()
{
    for (let i = 0; i < meshes.length; i++) meshes[i].render(cgl.getShader());
    trigger.trigger();
};

let delayRebuild = 0;
function rebuildDelayed()
{
    clearTimeout(delayRebuild);
    delayRebuild = setTimeout(rebuild, 60);
}

function rebuild()
{
    let x = 0;
    let y = 0;

    if (pivotX.get() == "center") x = 0;
    if (pivotX.get() == "right") x = -width.get() / 2;
    if (pivotX.get() == "left") x = +width.get() / 2;

    if (pivotY.get() == "center") y = 0;
    if (pivotY.get() == "top") y = -height.get() / 2;
    if (pivotY.get() == "bottom") y = +height.get() / 2;

    let numRows = parseInt(nRows.get(), 10);
    let numColumns = parseInt(nColumns.get(), 10);

    let stepColumn = width.get() / numColumns;
    let stepRow = height.get() / numRows;

    let c, r;
    meshes.length = 0;

    let vx, vy, vz;
    let verts = [];
    let tc = [];
    let indices = [];
    let count = 0;

    function addMesh()
    {
        let geom = new CGL.Geometry(op.name);
        geom.vertices = verts;
        geom.texCoords = tc;
        geom.verticesIndices = indices;

        let mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.LINES });
        mesh.setGeom(geom);
        meshes.push(mesh);

        verts.length = 0;
        tc.length = 0;
        indices.length = 0;
        count = 0;
        lvx = null;
    }

    let min = Math.log(1 / numRows);
    let max = Math.log(1);
    // op.log(min,max);

    let lines = [];

    for (r = numRows; r >= 0; r--)
    {
        // op.log(r/numRows);
        var lvx = null, lvy = null, lvz = null;
        let ltx = null, lty = null;
        let log = 0;
        let doLoga = doLog.get();

        let linePoints = [];
        lines.push(linePoints);


        for (c = numColumns; c >= 0; c--)
        {
            vx = c * stepColumn - width.get() / 2 + x;
            if (doLoga)
                vy = (Math.log((r / numRows)) / min) * height.get() - height.get() / 2 + y;
            else
                vy = r * stepRow - height.get() / 2 + y;

            let tx = c / numColumns;
            let ty = 1.0 - r / numRows;
            if (doLoga) ty = (Math.log((r / numRows)) / min);

            vz = 0.0;

            if (axis.get() == "xz")
            {
                vz = vy;
                vy = 0.0;
            }
            if (axis.get() == "xy") vz = 0.0;

            if (lvx !== null)
            {
                verts.push(lvx);
                verts.push(lvy);
                verts.push(lvz);

                linePoints.push(lvx, lvy, lvz);

                verts.push(vx);
                verts.push(vy);
                verts.push(vz);

                tc.push(ltx);
                tc.push(lty);

                tc.push(tx);
                tc.push(ty);

                indices.push(count);
                count++;
                indices.push(count);
                count++;
            }

            if (count > 64000)
            {
                addMesh();
            }

            ltx = tx;
            lty = ty;

            lvx = vx;
            lvy = vy;
            lvz = vz;
        }
    }

    outPointArrays.set(lines);

    addMesh();

    // op.log(meshes.length,' meshes');
}
