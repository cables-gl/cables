const
    exe = op.inTrigger("exe"),
    geom = op.inObject("geom"),
    inNum = op.inInt("Num Instances", 1000),
    inTex = op.inTexture("Position Texture"),
    inScale = op.inValue("Scale", 1),

    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outValue("Num");

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

inNum.onChange =
    function ()
    {
        arrayChangedTrans = true;
        recalc = true;
    };

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

    num = Math.max(0, Math.floor(inNum.get()));

    if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);

    for (let i = 0; i < num; i++)
    {
        mat4.identity(m);
        for (let a = 0; a < 16; a++) matrixArray[i * 16 + a] = m[a];
    }

    mesh.numInstances = num;
    mesh.addAttribute("instMat", matrixArray, 16);

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
