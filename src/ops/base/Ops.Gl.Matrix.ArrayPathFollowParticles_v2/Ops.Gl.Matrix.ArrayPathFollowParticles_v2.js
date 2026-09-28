const
    exec = op.inTrigger("Exec"),
    inPoints = op.inArray("Points"),
    inParticles = op.inValue("Num Particles", 500),
    inLength = op.inValue("Length", 20),
    inSpread = op.inValue("Spread", 0.2),
    inOffset = op.inValue("Offset"),
    inMaxDistance = op.inValue("Max Distance", 0),
    inRandomSpeed = op.inBool("RandomSpeed"),
    next = op.outTrigger("Next"),
    outPoints = op.outArray("Result");

const RESERVED_UNIFORM_VECTORS = 64;

const cgl = op.patch.cgl;
let shaderModule = null;
let shader = null;
let mesh = null;
let needsRebuild = true;
let geom = null;
let updateUniformPoints = false;
let pathPoints = [0, 0, 0];

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule(
    {
        "title": op.objName,
        "name": "MODULE_VERTEX_POSITION",
        "srcHeadVert": attachments.pathfollow_head_vert,
        "srcBodyVert": attachments.pathfollow_vert
    });

mod.addUniform("f", "MOD_maxDistance", inMaxDistance);
mod.addUniform("f", "MOD_offset", inOffset);
mod.addUniform("3f[]", "MOD_pathPoints", pathPoints);

inParticles.onChange =
    inLength.onChange =
    inSpread.onChange = resetLater;

inMaxDistance.onChange = updateDefines;
inPoints.onChange = updatePathPoints;

function resetLater()
{
    needsRebuild = true;
}

function getMaxPathPoints()
{
    return Math.max(1, cgl.maxUniformsVert - RESERVED_UNIFORM_VECTORS);
}

function updatePathPoints()
{
    const points = inPoints.get() || [];
    const num = Math.floor(points.length / 3);
    const maxNum = getMaxPathPoints();

    if (num <= maxNum)
    {
        op.setUiError("toomanypoints", null);
        pathPoints = points;
        return;
    }

    op.setUiError("toomanypoints", "Too many path points: " + num + ". This GPU supports at most " + maxNum + ", the path is reduced to " + maxNum + " evenly spaced points.", 1);

    pathPoints = new Float32Array(maxNum * 3);
    for (let i = 0; i < maxNum; i++)
    {
        const src = Math.round(i * (num - 1) / (maxNum - 1));
        pathPoints[i * 3 + 0] = points[src * 3 + 0];
        pathPoints[i * 3 + 1] = points[src * 3 + 1];
        pathPoints[i * 3 + 2] = points[src * 3 + 2];
    }
}

function getRandomVec(size)
{
    return [
        (Math.random() - 0.5) * 2 * size,
        (Math.random() - 0.5) * 2 * size,
        (Math.random() - 0.5) * 2 * size
    ];
}

function rebuild()
{
    op.log("rebuild");

    mesh = null;
    needsRebuild = false;
    let i = 0;
    let verts = null;
    const num = Math.abs(Math.floor(inParticles.get()) * 3);
    if (!verts || verts.length != num) verts = new Float32Array(num);

    const tc = [];
    for (i = 0; i < verts.length; i += 3)
    {
        verts[i + 0] = (Math.random() - 0.5);
        verts[i + 1] = (Math.random() - 0.5);
        verts[i + 2] = (Math.random() - 0.5);
        tc[i / 3 * 2 + 1] = Math.random();
        tc[i / 3 * 2 + 2] = Math.random();
    }

    if (!geom)
    {
        geom = new CGL.Geometry(op.name);
    }
    geom.setPointVertices(verts);

    geom.setTexCoords(tc);

    if (!mesh)
    {
        mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

        mesh.addVertexNumbers = true;
        mesh._verticesNumbers = null;

        // op.log("NEW MESH");
    }
    else
    {
        mesh.unBind();
    }
    mesh.setGeom(geom);

    const rndArray = new Float32Array(num);

    let spread = inSpread.get();
    if (spread < 0) spread = 0;

    for (i = 0; i < num / 3; i++)
    {
        let v = getRandomVec(spread);
        while (vec3.len(v) > spread / 2) v = getRandomVec(spread);

        rndArray[i * 3 + 0] = v[0];
        rndArray[i * 3 + 1] = v[1];
        rndArray[i * 3 + 2] = v[2];
    }
    rndArray[i] = (Math.random() - 0.5) * spread;

    mesh.setAttribute("rndPos", rndArray, 3);

    // offset random

    var rndOffset = new Float32Array(num / 3);
    for (i = 0; i < num / 3; i++)
        rndOffset[i] = (Math.random()) * inLength.get();

    mesh.setAttribute("rndOffset", rndOffset, 1);

    // speed random

    var rndOffset = new Float32Array(num / 3);
    for (i = 0; i < num / 3; i++)
        rndOffset[i] = (Math.random()) * inLength.get();

    mesh.setAttribute("rndOffset", rndOffset, 1);
    updateDefines();
}

mod.define("PATHFOLLOW_POINTS", 1);

function updateDefines()
{
    mod.toggleDefine("CHECK_DISTANCE", inMaxDistance.get() != 0);
    mod.toggleDefine("RANDOMSPEED", inRandomSpeed);
}

updatePathPoints();

exec.onTriggered = function ()
{
    if (op.patch.isEditorMode())
    {
        if (cgl.getShader().glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (!pathPoints || pathPoints.length === 0) return;
    if (needsRebuild) rebuild();

    mod.bind();

    mod.define("PATHFOLLOW_POINTS", Math.floor(pathPoints.length / 3));
    mod.setUniformValue("MOD_pathPoints", pathPoints);

    if (mesh) mesh.render(cgl.getShader());

    next.trigger();
    mod.unbind();
};
