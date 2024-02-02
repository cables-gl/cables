const
    exec = op.inTrigger("Exec"),
    inPoints = op.inArray("Points"),
    inParticles = op.inValue("Num Particles", 500),
    inLength = op.inValue("Length", 20),
    inSpread = op.inValue("Spread", 0.2),
    inOffset = op.inValue("Offset"),
    inMaxDistance = op.inValue("Max Distance", 0),
    inRandomSpeed = op.inValueBool("RandomSpeed"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let shaderModule = null;
let shader = null;
let mesh = null;
let needsRebuild = true;
let geom = null;
let updateUniformPoints = false;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.pathfollow_head_vert,
    "srcBodyVert": attachments.pathfollow_vert
});

mod.addUniform("f", "MOD_maxDistance", inMaxDistance);
mod.addUniform("f", "MOD_offset", inOffset);
mod.addUniform("3f[]", "MOD_pathPoints", inPoints);

inParticles.onChange =
    inLength.onChange =
    inSpread.onChange = resetLater;

inMaxDistance.onChange = updateDefines;

function resetLater()
{
    needsRebuild = true;
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

    for (i = 0; i < verts.length; i += 3)
    {
        verts[i + 0] = (Math.random() - 0.5);
        verts[i + 1] = (Math.random() - 0.5);
        verts[i + 2] = (Math.random() - 0.5);
    }

    if (!geom)geom = new CGL.Geometry(op.name);
    geom.setPointVertices(verts);

    if (!mesh)
    {
        mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

        mesh.addVertexNumbers = true;
        mesh._verticesNumbers = null;

        op.log("NEW MESH");
    }
    else
    {
        mesh.unBind();
    }
    mesh.setGeom(geom);

    const rndArray = new Float32Array(num);

    let spread = inSpread.get();
    if (spread < 0)spread = 0;

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

exec.onTriggered = function ()
{
    if (op.patch.isEditorMode())
    {
        if (cgl.getShader().glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (!inPoints.get() || inPoints.get().length === 0) return;
    if (needsRebuild)rebuild();

    mod.bind();

    if (inPoints.get())
        mod.define("PATHFOLLOW_POINTS", Math.floor(inPoints.get().length / 3));
    else mod.define("PATHFOLLOW_POINTS", 0);

    if (mesh) mesh.render(cgl.getShader());

    next.trigger();
    mod.unbind();
};
