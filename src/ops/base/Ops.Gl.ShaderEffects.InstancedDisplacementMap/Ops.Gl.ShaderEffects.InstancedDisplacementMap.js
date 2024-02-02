const
    inTrigger = op.inTrigger("Trigger"),
    inTex = op.inTexture("Texture"),
    inSrc = op.inSwitch("Source", ["Model Pos", "Inst Pos"], "Model Pos"),
    inMode = op.inSwitch("Mode", ["Translate", "Scale", "Rotate"], "Translate"),
    inStrength = op.inFloat("Strength", 1),
    inMin = op.inFloat("Min", 0),
    inScale = op.inFloat("Scale", 1),
    inClamp = op.inBool("Clamp", false),
    inColorize = op.inBool("Colorize", false),
    inDebug = op.inBool("Debug Bounds", false),
    inNormalize = op.inBool("Normalize", false),
    inOffsetX = op.inFloat("Offset X", 0),
    inOffsetY = op.inFloat("Offset Y", 0),
    inAbs = op.inBool("Abs", false),
    inChannel = op.inSwitch("Channel", ["R", "G", "B", "RGB"], "R"),

    inAxisX = op.inBool("X", false),
    inAxisY = op.inBool("Y", false),
    inAxisZ = op.inBool("Z", true),

    next = op.outTrigger("Next");

inAxisX.onChange =
inTex.onChange =
    inAxisY.onChange =
    inAxisZ.onChange =
    inClamp.onChange =
    inMode.onChange =
    inNormalize.onChange =
    inDebug.onChange =
    inChannel.onChange =
    inAbs.onChange =
    inColorize.onChange = updateDefines;
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
    "srcHeadFrag": "#ifdef MOD_COLORIZE\nIN vec3 MOD_dispColor;\n#endif",
    "srcBodyFrag": "#ifdef MOD_COLORIZE\ncol.rgb*=MOD_dispColor;\n#endif"
});

mod.addUniformVert("t", "MOD_texture", 0);
mod.addUniformVert("2f", "MOD_offset", inOffsetX, inOffsetY);
mod.addUniformVert("f", "MOD_scale", inScale);
mod.addUniformVert("f", "MOD_strength", inStrength);
mod.addUniformVert("f", "MOD_min", inMin);
updateDefines();

function updateDefines()
{
    op.setUiAttrib({ "extendTitle": inMode.get() });

    mod.toggleDefine("MOD_MODE_TRANS", inMode.get() === "Translate");
    mod.toggleDefine("MOD_MODE_SCALE", inMode.get() === "Scale");
    mod.toggleDefine("MOD_MODE_ROT", inMode.get() === "Rotate");

    mod.toggleDefine("MOD_CHAN_R", inChannel.get() != "G" && inChannel.get() != "B" && inChannel.get() != "RGB");
    mod.toggleDefine("MOD_CHAN_G", inChannel.get() == "G");
    mod.toggleDefine("MOD_CHAN_B", inChannel.get() == "B");
    mod.toggleDefine("MOD_CHAN_RGB", inChannel.get() == "RGB");

    mod.toggleDefine("MOD_SRC_INSTMAT", inSrc.get() == "Inst Pos");
    mod.toggleDefine("MOD_SRC_MMAT", inSrc.get() == "Model Pos");

    mod.toggleDefine("MOD_AXIS_X", inAxisX.get());
    mod.toggleDefine("MOD_AXIS_Y", inAxisY.get());
    mod.toggleDefine("MOD_AXIS_Z", inAxisZ.get());

    mod.toggleDefine("MOD_ABS", inAbs.get());

    mod.toggleDefine("MOD_CLAMP", inClamp.get());
    mod.toggleDefine("MOD_COLORIZE", inColorize.get() || inDebug.get());
    mod.toggleDefine("MOD_NORMALIZE", inNormalize.get());

    mod.toggleDefine("MOD_DEBUG", inDebug.get());
}

function render()
{
    mod.bind();

    if (inTex.get()) mod.pushTexture("MOD_texture", inTex.get().tex);
    else mod.pushTexture("MOD_texture", CGL.Texture.getEmptyTexture(cgl).tex);

    next.trigger();
    mod.unbind();
}
