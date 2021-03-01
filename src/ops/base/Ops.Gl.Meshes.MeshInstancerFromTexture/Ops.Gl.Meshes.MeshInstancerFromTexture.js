const
    exe = op.inTrigger("exe"),
    geom = op.inObject("geom"),
    inNum = op.inInt("Num Instances", 1000),
    inTex = op.inTexture("Position Texture"),
    inScale = op.inValue("Scale", 1),
    // doLimit = op.inValueBool("Limit Instances", false),
    // inLimit = op.inValueInt("Limit", 100),

    // inTranslates = op.inArray("positions"),
    // inScales = op.inArray("Scale Array"),
    // inRot = op.inArray("Rotations"),
    // inRotMeth = op.inSwitch("Rotation Type", ["Euler", "Quaternions"], "Euler"),
    // inBlendMode = op.inSwitch("Material blend mode", ["Multiply", "Add", "Normal"], "Multiply"),
    // inColor = op.inArray("Colors"),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outValue("Num");

// op.setPortGroup("Limit Number of Instances", [inLimit, doLimit]);
// op.setPortGroup("Parameters", [inScales, inRot, inTranslates, inRotMeth]);
op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);

geom.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const m = mat4.create();
let
    matrixArray = new Float32Array(1),
    instColorArray = new Float32Array(1),
    mesh = null,
    recalc = true,
    num = 0,
    arrayChangedColor = true,
    arrayChangedTrans = true;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "title": op.name,
    "priority": -2,
    "srcHeadVert": attachments.instancer_head_vert,
    "srcBodyVert": attachments.instancer_body_vert
});

mod.addModule({
    "name": "MODULE_COLOR",
    "priority": -2,
    "title": op.name,
    "srcHeadFrag": attachments.instancer_head_frag,
    "srcBodyFrag": attachments.instancer_body_frag,
});

mod.addUniformVert("f", "MOD_scale", inScale);
mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("f", "MOD_texSize", 0);

// inBlendMode.onChange = updateDefines;
// doLimit.onChange = updateLimit;
exe.onTriggered = doRender;
exe.onLinkChanged = function ()
{
    if (!exe.isLinked()) removeModule();
};

// updateLimit();

// inRot.onChange =
// inScales.onChange =
// inTranslates.onChange =
inNum.onChange =
    function ()
    {
        arrayChangedTrans = true;
        recalc = true;
    };

// inColor.onChange = function ()
// {
//     arrayChangedColor = true;
//     recalc = true;
//     updateDefines();
// };

function reset()
{
    arrayChangedColor = true,
    arrayChangedTrans = true;
    recalc = true;
}

function updateDefines()
{
    // mod.toggleDefine("COLORIZE_INSTANCES", inColor.get());
    // mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    // mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    // mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");
}

geom.onChange = function ()
{
    if (mesh)mesh.dispose();
    if (!geom.get())
    {
        mesh = null;
        return;
    }
    mesh = new CGL.Mesh(cgl, geom.get());
    reset();
};

function removeModule()
{

}

function setupArray()
{
    if (!mesh) return;

    // let transforms = inTranslates.get();
    // if (!transforms) transforms = [0, 0, 0];

    num = Math.max(0, Math.floor(inNum.get()));

    // const colArr = inColor.get();
    // const scales = inScales.get();

    // shader.toggleDefine("COLORIZE_INSTANCES", colArr);

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);
    // if (instColorArray.length != num * 4)
    // {
    //     arrayChangedColor = true;
    // instColorArray = new Float32Array(num * 4);
    // }

    // const rotArr = inRot.get();

    // const useQuats = inRotMeth.get() == "Quaternions";

    for (let i = 0; i < num; i++)
    {
        mat4.identity(m);

        // mat4.translate(m, m,
        //     [
        //         transforms[i * 3],
        //         transforms[i * 3 + 1],
        //         transforms[i * 3 + 2]
        //     ]);

        // if (rotArr)
        // {
        //     if (useQuats)
        //     {
        //         const mq = mat4.create();
        //         mat4.fromQuat(mq, [rotArr[i * 4 + 0], rotArr[i * 4 + 1], rotArr[i * 4 + 2], rotArr[i * 4 + 3]]);
        //         mat4.mul(m, m, mq);
        //     }
        //     else
        //     {
        //         mat4.rotateX(m, m, rotArr[i * 3 + 0] * CGL.DEG2RAD);
        //         mat4.rotateY(m, m, rotArr[i * 3 + 1] * CGL.DEG2RAD);
        //         mat4.rotateZ(m, m, rotArr[i * 3 + 2] * CGL.DEG2RAD);
        //     }
        // }

        // if (arrayChangedColor && colArr)
        // {
        //     instColorArray[i * 4 + 0] = colArr[i * 4 + 0];
        //     instColorArray[i * 4 + 1] = colArr[i * 4 + 1];
        //     instColorArray[i * 4 + 2] = colArr[i * 4 + 2];
        //     instColorArray[i * 4 + 3] = colArr[i * 4 + 3];
        // }

        // if (arrayChangedColor && !colArr)
        // {
        //     instColorArray[i * 4 + 0] = 1;
        //     instColorArray[i * 4 + 1] = 1;
        //     instColorArray[i * 4 + 2] = 1;
        //     instColorArray[i * 4 + 3] = 1;
        // }

        // if (scales && scales.length > i) mat4.scale(m, m, [scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2]]);
        // else mat4.scale(m, m, [1, 1, 1]);

        for (let a = 0; a < 16; a++) matrixArray[i * 16 + a] = m[a];
    }

    mesh.numInstances = num;

    // if (arrayChangedTrans)
    mesh.addAttribute("instMat", matrixArray, 16);
    // if (arrayChangedColor) mesh.addAttribute("instColor", instColorArray, 4, { "instanced": true });

    arrayChangedColor = false;
    recalc = false;
}

function doRender()
{
    if (!mesh) return;
    if (recalc) setupArray();

    if (!inTex.get()) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

    mod.bind();
    mod.setUniformValue("MOD_texSize", inTex.get().width);

    mesh.numInstances = num;

    outNum.set(mesh.numInstances);

    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
}
