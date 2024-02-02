const
    inTrigger = op.inTrigger("Trigger"),
    inTex = op.inTexture("Texture"),
    inStrength = op.inFloatSlider("Strength", 1),
    inScale = op.inFloat("Scale", 1),
    inClamp = op.inBool("Clamp", false),
    inDebug = op.inBool("Debug Bounds", false),
    inOffsetX = op.inFloat("Offset X", 0),
    inOffsetY = op.inFloat("Offset Y", 0),
    inMode = op.inSwitch("Method", ["Add", "Mul"], "Add"),
    next = op.outTrigger("Next");

inTex.onChange =
    inClamp.onChange =
    inMode.onChange =
    inDebug.onChange = updateDefines;
inTrigger.onTriggered = render;

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.displace_head_vert || "",
    "srcBodyVert": attachments.displace_vert || ""
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.colorize_head_frag,
    "srcBodyFrag": attachments.colorize_frag
});

mod.addUniformVert("t", "MOD_texture", 0);
mod.addUniformVert("2f", "MOD_offset", inOffsetX, inOffsetY);
mod.addUniformVert("f", "MOD_scale", inScale);
mod.addUniformVert("f", "MOD_strength", inStrength);

function updateDefines()
{
    mod.toggleDefine("MOD_CLAMP", inClamp.get());
    mod.toggleDefine("MOD_DEBUG", inDebug.get());
    mod.toggleDefine("METH_ADD", inMode.get() == "Add");
    mod.toggleDefine("METH_MUL", inMode.get() == "Mul");
}

function render()
{
    mod.bind();

    if (inTex.get()) mod.pushTexture("MOD_texture", inTex.get().tex);
    else mod.pushTexture("MOD_texture", CGL.Texture.getEmptyTexture(cgl).tex);

    next.trigger();
    mod.unbind();
}
