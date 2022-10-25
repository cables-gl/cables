const
    exe = op.inTrigger("exe"),
    geom = op.inObject("Geometry", null, "geometry"),
    inNum = op.inInt("Num Instances", 1000),
    inTex = op.inTexture("Position Texture", null, "texture"),
    inTex2 = op.inTexture("Rotation Texture", null, "texture"),
    inTex3 = op.inTexture("Scale Texture", null, "texture"),
    inTex4 = op.inTexture("Color Texture", null, "texture"),
    inTex5 = op.inTexture("TexCoord Texture", null, "texture"),
    inBlendMode = op.inSwitch("Color Texture Blendmode", ["Multiply", "Add", "Normal"], "Multiply"),
    inScale = op.inValue("Scale", 1),
    inMulR = op.inValue("Multiply Pos X", 1),
    inMulG = op.inValue("Multiply Pos Y", 1),
    inMulB = op.inValue("Multiply Pos Z", 1),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outNumber("Num");

op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);

geom.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const m = mat4.create();
let
    // matrixArray = new Float32Array(1),
    // instColorArray = new Float32Array(1),
    mesh = null,
    recalc = true,
    num = 0,
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
mod.addUniformVert("t", "MOD_texTrans");
mod.addUniformVert("t", "MOD_texRot");
mod.addUniformVert("t", "MOD_texScale");
mod.addUniformVert("t", "MOD_texCoords");
mod.addUniformVert("t", "MOD_texColor");
mod.addUniformVert("f", "MOD_texSizeX", 0);
mod.addUniformVert("f", "MOD_texSizeY", 0);
mod.addUniformVert("3f", "MOD_mulRGB", inMulR, inMulG, inMulB);

inBlendMode.onChange =
inTex.onChange =
inTex3.onChange =
inTex4.onChange =
inTex5.onChange =
inTex2.onChange = updateDefines;

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
    arrayChangedTrans = true;
    recalc = true;
}

function updateDefines()
{
    mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");

    mod.toggleDefine("USE_TEX_ROT", inTex2.get());
    mod.toggleDefine("USE_TEX_SCALE", inTex3.get());
    mod.toggleDefine("USE_TEX_COLOR", inTex4.get());
    mod.toggleDefine("USE_TEX_TC", inTex5.get());
}

geom.onChange = function ()
{
    if (mesh)mesh.dispose();

    if (!geom.get() || !geom.get().vertices)
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

    // if (matrixArray.length != num * 16) matrixArray = new Float32Array(num * 16);

    // for (let i = 0; i < num; i++)
    // {
    //     mat4.identity(m);
    //     for (let a = 0; a < 16; a++) matrixArray[i * 16 + a] = m[a];
    // }

    mesh.numInstances = num;
    // mesh.addAttribute("instMat", matrixArray, 16);

    recalc = false;
}

function doRender()
{
    if (!mesh) return;
    if (recalc) setupArray();

    if (!inTex.get()) return;
    if (inTex.get())mod.pushTexture("MOD_texTrans", inTex.get().tex);
    if (inTex2.get())mod.pushTexture("MOD_texRot", inTex2.get().tex);
    if (inTex3.get())mod.pushTexture("MOD_texScale", inTex3.get().tex);
    if (inTex4.get())mod.pushTexture("MOD_texColor", inTex4.get().tex);
    if (inTex5.get())mod.pushTexture("MOD_texCoords", inTex5.get().tex);

    mod.bind();
    mod.setUniformValue("MOD_texSizeX", inTex.get().width);
    mod.setUniformValue("MOD_texSizeY", inTex.get().height);

    // mesh.numInstances = num;

    outNum.set(mesh.numInstances);

    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
}
