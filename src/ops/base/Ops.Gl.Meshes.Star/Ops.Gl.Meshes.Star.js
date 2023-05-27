const
    render = op.inTrigger("render"),
    segments = op.inValue("segments", 40),
    radius = op.inValue("radius", 1),
    shape = op.inValueSelect("Shape", ["Star", "Saw", "Gear"], "Star"),
    outerRadius = op.inValue("Length", 1.5),
    zDiff = op.inFloat("Peak Z Pos", 0),
    percent = op.inValueSlider("percent", 1),
    fill = op.inValueBool("Fill"),
    renderMesh = op.inValueBool("Render Mesh", true),
    trigger = op.outTrigger("trigger"),
    geomOut = op.addOutPort(new CABLES.Port(op, "geometry", CABLES.OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize = true;
let cgl = op.patch.cgl;

let oldPrim = 0;
let shader = null;

let geom = new CGL.Geometry("circle");
let mesh = null;
let lastSegs = -1;

zDiff.onChange =
    segments.onChange =
    radius.onChange =
    percent.onChange =
    shape.onChange =
    fill.onChange =
    outerRadius.onChange = calc;
calc();

render.onTriggered = function ()
{
    // if (op.instanced(render)) return;

    shader = cgl.getShader();
    oldPrim = shader.glPrimitive;

    if (renderMesh.get() && mesh) mesh.render(shader);
    trigger.trigger();

    shader.glPrimitive = oldPrim;
};

function calc()
{
    let segs = Math.max(3, Math.floor(segments.get()));

    geom.clear();

    let
        faces = [],
        normals = [],
        tangents = [],
        biTangents = [];
    let i = 0, degInRad = 0;
    let oldPosX = 0, oldPosY = 0;
    let oldPosXTexCoord = 0, oldPosYTexCoord = 0;

    let oldPosXIn = 0, oldPosYIn = 0;
    let oldPosXTexCoordIn = 0, oldPosYTexCoordIn = 0;

    let posxTexCoordIn = 0, posyTexCoordIn = 0;
    let posxTexCoord = 0, posyTexCoord = 0;
    let posx = 0, posy = 0;

    let verts = [];
    let outX = 0, outY = 0;

    let imode = 0;
    if (shape.get() == "Saw")imode = 1;
    if (shape.get() == "Gear")imode = 2;

    let cycleGear = true;

    for (i = 0; i <= segs * percent.get(); i++)
    {
        degInRad = (360 / segs) * i * CGL.DEG2RAD;
        posx = Math.cos(degInRad) * radius.get();
        posy = Math.sin(degInRad) * radius.get();

        // saw mode
        cycleGear = !cycleGear;

        switch (imode)
        {
        case 0:
            outX = ((posx + oldPosX) * 0.5) * outerRadius.get();
            outY = ((posy + oldPosY) * 0.5) * outerRadius.get();
            break;

        case 1:
            outX = (posx) * outerRadius.get();
            outY = (posy) * outerRadius.get();
            break;

        case 2:
            if (cycleGear)
            {
                outX = (posx) * outerRadius.get();
                outY = (posy) * outerRadius.get();

                degInRad = (360 / segs) * (i - 1) * CGL.DEG2RAD;
                let ooutX = Math.cos(degInRad) * radius.get();
                let ooutY = Math.sin(degInRad) * radius.get();

                ooutX *= outerRadius.get();
                ooutY *= outerRadius.get();

                faces.push(
                    [ooutX, ooutY, 0],
                    [outX, outY, 0],
                    [oldPosX, oldPosY, 0]
                );
                normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
                tangents.push(1, 0, 0, 1, 0, 0, 1, 0, 0);
                biTangents.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
            }

            break;
        }

        if (fill.get())
        {
            faces.push(
                [0, 0, 0],
                [oldPosX, oldPosY, 0],
                [posx, posy, 0]
            );
            normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
            tangents.push(1, 0, 0, 1, 0, 0, 1, 0, 0);
            biTangents.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
        }

        if (imode != 2 || cycleGear)
        {
            faces.push(
                [posx, posy, 0],
                [oldPosX, oldPosY, 0],
                [outX, outY, zDiff.get()]
            );
            normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
            tangents.push(1, 0, 0, 1, 0, 0, 1, 0, 0);
            biTangents.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
        }

        oldPosX = posx;
        oldPosY = posy;
    }

    geom = CGL.Geometry.buildFromFaces(faces);
    geom.vertexNormals = normals;
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    geom.mapTexCoords2d();

    geomOut.set(null);
    geomOut.set(geom);

    if (geom.vertices.length == 0) return;
    if (!mesh)mesh = new CGL.Mesh(cgl, geom);
    mesh.setGeom(geom);
}
