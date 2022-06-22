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

let pointArray = null;

pointArray = new Float32Array(99);

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.pathfollow_head_vert,
    "srcBodyVert": attachments.pathfollow_vert
});

mod.addUniform("f", "MOD_maxDistance", inMaxDistance);
mod.addUniform("f", "MOD_offset", inOffset);
mod.addUniform("3f[]", "MOD_pathPoints", new Float32Array([0, 0, 0, 0, 0, 0]));
// mod.addUniform("f", "MOD_randomSpeed", 1.0);
// mod.addUniform("i", "MOD_maxIndex", 0);

inParticles.onChange =
    inLength.onChange =
    inSpread.onChange = resetLater;

inMaxDistance.onChange = updateDefines;

function resetLater()
{
    needsRebuild = true;
}

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
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

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

// function removeModule()
// {
//     if (shader && shaderModule)
//     {
//         shader.removeModule(shaderModule);
//         shader = null;
//     }
// }

// function updateCheckDistance()
// {
//     if (shader)
//     {
//         shaderModule.maxDistance.setValue(inMaxDistance.get());

//         if (inMaxDistance.get() == 0)
//         {
//             shader.removeDefine("CHECK_DISTANCE");
//         }
//         else
//         {
//             shader.define("CHECK_DISTANCE");
//         }
//     }
// }

// mod.define("SPLINE_POINTS", 1);
mod.define("PATHFOLLOW_POINTS", 1);

function updateDefines()
{
    mod.define("PATHFOLLOW_POINTS", Math.floor(pointArray.length / 3));
    // if (shader.getDefine("PATHFOLLOW_POINTS") < Math.floor(pointArray.length / 3))
    // {
    //     op.log(shader.getDefine("PATHFOLLOW_POINTS"));
    //     shader.define("PATHFOLLOW_POINTS", Math.floor(pointArray.length / 3));
    // }

    mod.toggleDefine("CHECK_DISTANCE", inMaxDistance.get() != 0);
    mod.toggleDefine("RANDOMSPEED", inRandomSpeed);
}

exec.onTriggered = function ()
{
    // if(op.instanced(exec))return;
    if (!inPoints.get() || inPoints.get().length === 0) return;
    if (needsRebuild)rebuild();

    // if (cgl.getShader() != shader)
    // {
    //     if (shader)removeModule();

    //     shader = cgl.getShader();

    //     // shader.glslVersion=300;
    //     shaderModule = shader.addModule(
    //         {
    //             "title": op.objName,
    //             "name": "MODULE_VERTEX_POSITION",
    //         "srcHeadVert": attachments.pathfollow_head_vert,
    //             "srcBodyVert": attachments.pathfollow_vert,
    //             "priority": -2
    //         });

    // shaderModule.offset = new CGL.Uniform(shader, "f", shaderModule.prefix + "offset", 0);
    // shaderModule.point = new CGL.Uniform(shader, "i", shaderModule.prefix + "point", 0);
    // shaderModule.uniPoints = new CGL.Uniform(shader, "3f[]", shaderModule.prefix + "points", new Float32Array([0, 0, 0, 0, 0, 0]));
    // shaderModule.randomSpeed = new CGL.Uniform(shader, "b", shaderModule.prefix + "randomSpeed", false);
    // shaderModule.maxIndex = new CGL.Uniform(shader, "i", shaderModule.prefix + "maxIndex", 0);
    // shaderModule.maxDistance = new CGL.Uniform(shader, "f", shaderModule.prefix + "maxDistance", inMaxDistance.get());
    // updateCheckDistance();
    // }

    mod.bind();

    if (updateUniformPoints && pointArray)
    {
        // if(!shader.hasDefine("PATHFOLLOW_POINTS"))shader.define('PATHFOLLOW_POINTS',pointArray.length/3);
        // if (shader.getDefine("PATHFOLLOW_POINTS") < Math.floor(pointArray.length / 3))
        // {
        //     op.log(shader.getDefine("PATHFOLLOW_POINTS"));
        //     shader.define("PATHFOLLOW_POINTS", Math.floor(pointArray.length / 3));
        // }
        // shader.define('PATHFOLLOW_POINTS',pointArray.length/3);

        // shaderModule.uniNumPoints.setValue(pointArray.length/3);
        mod.setUniformValue("MOD_pathPoints", pointArray);
        // console.log("set mod points!~!!!");
        updateDefines();
        // uniPoints.setValue(pointArray);
        updateUniformPoints = false;
    }

    console.log(mod._getUniform("MOD_pathPoints").v1);

    // mod.setUniformValue("MOD_maxIndex",pointArray.length);

    // uniMaxIndex.setValue(pointArray.length);
    // var off=inOffset.get()%((pointArray.length-1)/3);
    // const off = inOffset.get();

    // randomSpeed.setValue(inRandomSpeed.get());
    // shaderModule.offset.setValue(off);

    if (mesh) mesh.render(cgl.getShader());

    next.trigger();
    mod.unbind();
};
