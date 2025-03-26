const
    exe = op.inTrigger("exe"),
    geom = op.inObject("Geometry", null, "geometry"),
    inScale = op.inValue("Scale", 1),
    inLimit = op.inBool("Limit Instances", false),
    inNum = op.inInt("Num Instances", 1000),
    inBillboarding = op.inSwitch("Billboarding", ["Off", "Spherical", "Cylindrical"], "Off"),

    inTex1 = op.inTexture("Position Texture", null, "texture"),
    inTex2 = op.inTexture("Rotation Texture", null, "texture"),
    inRotMode = op.inSwitch("Rotation", ["Euler", "Normal", "Quaternion"], "Euler"),
    inTex3 = op.inTexture("Scale Texture", null, "texture"),
    inTex4 = op.inTexture("Color Texture", null, "texture"),
    inTex5 = op.inTexture("TexCoord Texture", null, "texture"),
    inBlendMode = op.inSwitch("Color Texture Blendmode", ["Multiply", "Add", "Normal"], "Multiply"),
    inAlphaThresh = op.inFloatSlider("Ignore Alpha Less Than", 0.5),
    inMulR = op.inValue("Multiply Pos X", 1),
    inMulG = op.inValue("Multiply Pos Y", 1),
    inMulB = op.inValue("Multiply Pos Z", 1),
    outTrigger = op.outTrigger("Trigger Out"),
    outNum = op.outNumber("Num");

op.toWorkPortsNeedToBeLinked(geom);
op.toWorkPortsNeedToBeLinked(exe);
op.toWorkPortsNeedToBeLinked(inTex1);

geom.ignoreValueSerialize = true;

const cgl = op.patch.cgl;
const m = mat4.create();
let
    mesh = null,
    recalc = true,
    num = 0,
    arrayChangedTrans = true;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "title": op.name,
    "priority": -2,
    "srcHeadVert": attachments.instancer_head_vert,
    "srcBodyVert": attachments.instancer_body_vert
});

mod.addModule({
    "name": "MODULE_VERTEX_MODELVIEW",
    "title": op.name + "_billboard",
    "srcBodyVert": attachments.billboard_vert
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
const modCol = mod.addUniformVert("t", "MOD_texColor");
mod.addUniformVert("f", "MOD_texSizeX", 0);
mod.addUniformVert("f", "MOD_texSizeY", 0);
mod.addUniformVert("f", "MOD_alphaThresh", inAlphaThresh);
mod.addUniformVert("3f", "MOD_mulRGB", inMulR, inMulG, inMulB);

inBillboarding.onChange =
    inBlendMode.onChange =
    inRotMode.onChange =
    inTex1.onChange =
    inTex3.onChange =
    inTex4.onChange =
    inTex5.onChange =
    inTex2.onChange = updateDefines;

updateUi();
exe.onTriggered = doRender;

inLimit.onChange =
inNum.onChange =
    function ()
    {
        updateDefines();
        updateUi();
        reset();
    };

function reset()
{
    arrayChangedTrans = true;
    recalc = true;
}

function updateUi()
{
    inNum.setUiAttribs({ "greyout": !inLimit.get() });
}

function updateDefines()
{
    mod.toggleDefine("BILLBOARDING", inBillboarding.get() != "Off");
    mod.toggleDefine("BILLBOARDING_CYLINDRIC", inBillboarding.get() == "Cylindrical");

    mod.toggleDefine("ROT_EULER", inRotMode.get() === "Euler");
    mod.toggleDefine("ROT_NORMAL", inRotMode.get() === "Normal");
    mod.toggleDefine("ROT_QUAT", inRotMode.get() === "Quaternion");

    mod.toggleDefine("BLEND_MODE_MULTIPLY", inBlendMode.get() === "Multiply");
    mod.toggleDefine("BLEND_MODE_ADD", inBlendMode.get() === "Add");
    mod.toggleDefine("BLEND_MODE_NONE", inBlendMode.get() === "Normal");

    mod.toggleDefine("USE_TEX_ROT", inTex2.isLinked());
    mod.toggleDefine("USE_TEX_SCALE", inTex3.isLinked());
    mod.toggleDefine("USE_TEX_COLOR", inTex4.isLinked());
    mod.toggleDefine("USE_TEX_TC", inTex5.isLinked());
}

geom.onChange = function ()
{
    if (mesh)mesh.dispose();
    mesh = null;

    reset();
};

function setupArray()
{
    if (!mesh) return;
    if (!inTex1.get()) return;

    if (inLimit.get()) num = Math.max(0, Math.floor(inNum.get()));
    else num = inTex1.get().width * inTex1.get().height;

    mesh.numInstances = num;

    recalc = false;
}

function doRender()
{
    if (!inTex1.get()) return;
    if (!mesh && geom.get())
        mesh = new CGL.Mesh(cgl, geom.get());
    op.checkGraphicsApi();

    if (!mesh) return;

    if (mesh.numInstances != inTex1.get().width * inTex1.get().height) reset();
    if (recalc)
    {
        setupArray();
        mod.bind();
        mod.unbind();
        updateDefines();
    }

    if (inTex1.isLinked() && inTex1.get()) mod.pushTexture("MOD_texTrans", inTex1.get().tex);
    if (inTex2.isLinked() && inTex2.get()) mod.pushTexture("MOD_texRot", inTex2.get().tex);
    if (inTex3.isLinked() && inTex3.get()) mod.pushTexture("MOD_texScale", inTex3.get().tex);
    if (inTex4.isLinked() && inTex4.get()) mod.pushTexture("MOD_texColor", inTex4.get().tex);
    if (inTex5.isLinked() && inTex5.get()) mod.pushTexture("MOD_texCoords", inTex5.get().tex);

    if (inTex1.get())
    {
        mod.setUniformValue("MOD_texSizeX", inTex1.get().width);
        mod.setUniformValue("MOD_texSizeY", inTex1.get().height);
    }

    outNum.set(mesh.numInstances);

    mod.bind();
    if (mesh.numInstances > 0) mesh.render(cgl.getShader());

    outTrigger.trigger();

    mod.unbind();
}
