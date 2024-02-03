
const exec = op.inTrigger("Exec");
const inPoints = op.inArray("Points");
const inParticles = op.inValue("Num Particles", 500);
const inLength = op.inValue("Length", 20);
const inSpread = op.inValue("Spread", 0.2);
const inOffset = op.inValue("Offset");
const inMaxDistance = op.inValue("Max Distance", 0);
const inRandomSpeed = op.inValueBool("RandomSpeed");
const next = op.outTrigger("Next");


const cgl = op.patch.cgl;
let shaderModule = null;
let shader = null;
let mesh = null;
let needsRebuild = true;
let geom = null;
let updateUniformPoints = false;

exec.onLinkChanged = removeModule;

let pointArray = null;

function resetLater()
{
    needsRebuild = true;
}

inParticles.onChange = resetLater;
inLength.onChange = resetLater;
inSpread.onChange = resetLater;

pointArray = new Float32Array(99);


inPoints.onChange = function ()
{
    if (inPoints.get())
    {
        pointArray = inPoints.get();// new Float32Array(inPoints.get());
        updateUniformPoints = true;
    }
};

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
}

function removeModule()
{
    if (shader && shaderModule)
    {
        shader.removeModule(shaderModule);
        shader = null;
    }
}

inMaxDistance.onChange = updateCheckDistance;

function updateCheckDistance()
{
    if (shader)
    {
        shaderModule.maxDistance.setValue(inMaxDistance.get());

        if (inMaxDistance.get() == 0)
        {
            shader.removeDefine("CHECK_DISTANCE");
        }
        else
        {
            shader.define("CHECK_DISTANCE");
        }
    }
}


exec.onTriggered = function ()
{
    // if(op.instanced(exec))return;
    if (!inPoints.get() || inPoints.get().length === 0) return;
    if (needsRebuild)rebuild();

    if (cgl.getShader() != shader)
    {
        if (shader)removeModule();

        shader = cgl.getShader();

        // shader.glslVersion=300;
        shaderModule = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.pathfollow_head_vert,
                "srcBodyVert": attachments.pathfollow_vert,
                "priority": -2
            });

        shaderModule.offset = new CGL.Uniform(shader, "f", shaderModule.prefix + "offset", 0);
        shaderModule.point = new CGL.Uniform(shader, "i", shaderModule.prefix + "point", 0);
        shaderModule.uniPoints = new CGL.Uniform(shader, "3f[]", shaderModule.prefix + "points", new Float32Array([0, 0, 0, 0, 0, 0]));
        shaderModule.randomSpeed = new CGL.Uniform(shader, "b", shaderModule.prefix + "randomSpeed", false);
        shaderModule.maxIndex = new CGL.Uniform(shader, "i", shaderModule.prefix + "maxIndex", 0);
        shaderModule.maxDistance = new CGL.Uniform(shader, "f", shaderModule.prefix + "maxDistance", inMaxDistance.get());
        updateCheckDistance();
    }

    if (updateUniformPoints && pointArray)
    {
        // if(!shader.hasDefine("PATHFOLLOW_POINTS"))shader.define('PATHFOLLOW_POINTS',pointArray.length/3);
        if (shader.getDefine("PATHFOLLOW_POINTS") < Math.floor(pointArray.length / 3))
        {
            op.log(shader.getDefine("PATHFOLLOW_POINTS"));
            shader.define("PATHFOLLOW_POINTS", Math.floor(pointArray.length / 3));
        }
        // shader.define('PATHFOLLOW_POINTS',pointArray.length/3);

        // shaderModule.uniNumPoints.setValue(pointArray.length/3);
        shaderModule.uniPoints.setValue(pointArray);
        updateUniformPoints = false;
    }

    shaderModule.maxIndex.setValue(pointArray.length);
    // var off=inOffset.get()%((pointArray.length-1)/3);
    const off = inOffset.get();

    shaderModule.randomSpeed.setValue(inRandomSpeed.get());
    shaderModule.offset.setValue(off);
    // shaderModule.point.setValue(Math.floor(pointArray.length/3*Math.random() ));

    if (!shader) return;

    if (mesh) mesh.render(shader);

    next.trigger();
};
