const
    exe = op.inTrigger("exe"),
    geom = op.inObject("geom"),
    inScale = op.inValue("Scale", 1),
    doLimit = op.inValueBool("Limit Instances", false),
    inLimit = op.inValueInt("Limit", 100),

    inTranslates = op.inArray("positions"),
    inScales = op.inArray("Scale Array"),
    inRot = op.inArray("Rotations"),
    inBlendMode = op.inSwitch("Material blend mode", ["Multiply", "Add", "Normal"], "Multiply"),
    inColor = op.inArray("Colors"),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outValue("Num");

op.setPortGroup("Limit Number of Instances", [inLimit, doLimit]);
op.setPortGroup("Parameters", [inScales, inRot, inTranslates]);
op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);
op.onDelete = function () { if (mesh)mesh.dispose(); };
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

const mod = new CGL.ShaderModifier(cgl, "colorArea");
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "title": op.objName,
    "priority": -2,
    "srcHeadVert": attachments.instancer_head_vert,
    "srcBodyVert": attachments.instancer_body_vert
});

mod.addModule({
    "name": "MODULE_COLOR",
    "priority": -2,
    "title": op.objName,
    "srcHeadFrag": attachments.instancer_head_frag,
    "srcBodyFrag": attachments.instancer_body_frag,
});

mod.addUniformVert("f", "MOD_scale", inScale);

inBlendMode.onChange = updateDefines;
doLimit.onChange = updateLimit;
exe.onTriggered = doRender;
exe.onLinkChanged = function ()
{
    if (!exe.isLinked()) removeModule();
};

updateLimit();

inRot.onChange =
inScales.onChange =
inTranslates.onChange =
    function ()
    {
        arrayChangedTrans = true;
        recalc = true;
    };

inColor.onChange = function ()
{
    arrayChangedColor = true;
    recalc = true;
    updateDefines();
};

function reset()
{
    arrayChangedColor = true,
    arrayChangedTrans = true;
    recalc = true;
}

function updateDefines()
{
    mod.toggleDefine("COLORIZE_INSTANCES", inColor.get());
    mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");
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

    let transforms = inTranslates.get();
    if (!transforms) transforms = [0, 0, 0];

    num = Math.floor(transforms.length / 3);

    const colArr = inColor.get();
    const scales = inScales.get();

    // shader.toggleDefine("COLORIZE_INSTANCES", colArr);

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);
    if (instColorArray.length != num * 4) instColorArray = new Float32Array(num * 4);

    const rotArr = inRot.get();

    for (let i = 0; i < num; i++)
    {
        mat4.identity(m);

        mat4.translate(m, m, [
            transforms[i * 3],
            transforms[i * 3 + 1],
            transforms[i * 3 + 2]
        ]);

        if (rotArr)
        {
            mat4.rotateX(m, m, rotArr[i * 3 + 0] * CGL.DEG2RAD);
            mat4.rotateY(m, m, rotArr[i * 3 + 1] * CGL.DEG2RAD);
            mat4.rotateZ(m, m, rotArr[i * 3 + 2] * CGL.DEG2RAD);
        }

        if (arrayChangedColor && colArr)
        {
            instColorArray[i * 4 + 0] = colArr[i * 4 + 0];
            instColorArray[i * 4 + 1] = colArr[i * 4 + 1];
            instColorArray[i * 4 + 2] = colArr[i * 4 + 2];
            instColorArray[i * 4 + 3] = colArr[i * 4 + 3];
        }

        if (arrayChangedColor && !colArr)
        {
            instColorArray[i * 4 + 0] = 1;
            instColorArray[i * 4 + 1] = 1;
            instColorArray[i * 4 + 2] = 1;
            instColorArray[i * 4 + 3] = 1;
        }

        if (scales && scales.length > i) mat4.scale(m, m, [scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2]]);
        else mat4.scale(m, m, [1, 1, 1]);

        for (let a = 0; a < 16; a++) matrixArray[i * 16 + a] = m[a];
    }

    mesh.numInstances = num;

    if (arrayChangedTrans) mesh.addAttribute("instMat", matrixArray, 16);
    if (arrayChangedColor) mesh.addAttribute("instColor", instColorArray, 4, { "instanced": true });

    arrayChangedColor = false;
    recalc = false;
}

function updateLimit()
{
    inLimit.setUiAttribs({ "hidePort": !doLimit.get(), "greyout": !doLimit.get() });
}

function doRender()
{
    if (!mesh) return;
    if (recalc) setupArray();

    mod.bind();

    if (doLimit.get()) mesh.numInstances = Math.min(num, inLimit.get());
    else mesh.numInstances = num;

    outNum.set(mesh.numInstances);

    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    mod.toggleDefine("COLORIZE_INSTANCES", inColor.get());

    outTrigger.trigger();

    mod.unbind();

    // if (cgl.getShader() && cgl.getShader() != shader)
    // {
    //     removeModule();
    //     shader = cgl.getShader();

    //     if (!shader.hasDefine("INSTANCING"))
    //     {
    //         mod = shader.addModule(
    //             {
    //                 "name": "MODULE_VERTEX_POSITION",
    //                 "title": op.objName,
    //                 "priority": -2,
    //                 "srcHeadVert": attachments.instancer_head_vert,
    //                 "srcBodyVert": attachments.instancer_body_vert
    //             });

    //         fragMod = shader.addModule({
    //             "name": "MODULE_COLOR",
    //             "priority": -2,
    //             "title": op.objName,
    //             "srcHeadFrag": attachments.instancer_head_frag,
    //             "srcBodyFrag": attachments.instancer_body_frag,
    //         });

    //         shader.define("INSTANCING");

    //         updateDefines();
    //         inScale.uniform = new CGL.Uniform(shader, "f", mod.prefix + "scale", inScale);
    //     }

    //     shader.toggleDefine("COLORIZE_INSTANCES", inColor.get());
    // }

    // if (doLimit.get()) mesh.numInstances = Math.min(num, inLimit.get());
    // else mesh.numInstances = num;

    // outNum.set(mesh.numInstances);

    // if (mesh.numInstances > 0) mesh.render(shader);
    // outTrigger.trigger();
}
