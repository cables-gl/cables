const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inTex = op.inTexture("Texture"),

    inBlend = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    inAmount = op.inValueSlider("Amount", 0.3),

    inTarget = op.inSwitch("Target", ["Color", "Pointsize", "Alpha"], "Color"),
    inScale = op.inValue("Scale", 10),

    inUseTexAlpha = op.inBool("Use Texture Alpha", false),

    inPosX = op.inFloat("Pos X", 0),
    inPosY = op.inFloat("Pos Y", 0),

    inRotX = op.inFloat("Rot X", 0),
    inRotY = op.inFloat("Rot Y", 0),
    inRotZ = op.inFloat("Rot Z", 0),

    inMethod = op.inValueSelect("Mapping", ["Triplanar", "XY", "XZ", "YZ", "Screen", "TexCoords 1", "TexCoords 2", "TexCoords 3"], "XY"),
    inDiscard = op.inValueBool("Discard"),
    inWorldSpace = op.inValueBool("WorldSpace");

const cgl = op.patch.cgl;

render.onLinkChanged =
inUseTexAlpha.onChange =
    inTarget.onChange =
    inBlend.onChange =
    inDiscard.onChange =
    inWorldSpace.onChange =
    inTex.onLinkChanged =
    inMethod.onChange = updateDefines;

op.toWorkPortsNeedToBeLinked(inTex, next);

op.setPortGroup("Rotation", [inRotX, inRotY, inRotZ]);
op.setPortGroup("Position", [inPosX, inPosY]);

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.maptexture_body_vert,
    "srcBodyVert": attachments.maptexture_vert,
    "attributes": [
        { "type": "vec2", "name": "attrTexCoord1", "nameFrag": "texCoord1" },
        { "type": "vec2", "name": "attrTexCoord2", "nameFrag": "texCoord2" }]
});

let head_frag = attachments.maptexture_frag;
// head_frag = head_frag.replace("{{BLENDCODE}}", CGL.TextureEffect.getBlendCode(3));

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": head_frag,
    "srcBodyFrag": attachments.maptexture_body_frag
});

mod.addUniformBoth("f", "MOD_rotX", inRotX);
mod.addUniformBoth("f", "MOD_rotY", inRotY);
mod.addUniformBoth("f", "MOD_rotZ", inRotZ);

mod.addUniformBoth("t", "MOD_tex");
mod.addUniformBoth("f", "MOD_scale", inScale);
mod.addUniformBoth("f", "MOD_amount", inAmount);
mod.addUniformBoth("2f", "MOD_offset", inPosX, inPosY);

const uniWidth = mod.addUniformFrag("f", "MOD_viewPortW");
const uniHeight = mod.addUniformFrag("f", "MOD_viewPortH");

CGL.TextureEffect.setupBlending(op, mod, inBlend, inAmount);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_USE_IMGALPHA", inUseTexAlpha.get());
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_MAP_XY", inMethod.get() == "XY");
    mod.toggleDefine("MOD_MAP_XZ", inMethod.get() == "XZ");
    mod.toggleDefine("MOD_MAP_YZ", inMethod.get() == "YZ");
    mod.toggleDefine("MOD_MAP_TEXCOORD", inMethod.get() == "TexCoords 1");
    mod.toggleDefine("MOD_MAP_TEXCOORD1", inMethod.get() == "TexCoords 2");
    mod.toggleDefine("MOD_MAP_TEXCOORD2", inMethod.get() == "TexCoords 3");
    mod.toggleDefine("MOD_MAP_SCREEN", inMethod.get() == "Screen");
    mod.toggleDefine("MOD_MAP_TRIPLANAR", inMethod.get() == "Triplanar");
    mod.toggleDefine("MOD_DISCARD", inDiscard.get());

    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");

    mod.toggleDefine("MOD_TARGET_ALPHA", inTarget.get() == "Alpha");
    mod.toggleDefine("MOD_TARGET_COLOR", inTarget.get() == "Color");
    mod.toggleDefine("MOD_TARGET_POINTSIZE", inTarget.get() == "Pointsize");

    if (inTarget.get() == "Pointsize" && inMethod.get() == "Screen")op.setUiError("pointscreen", "This combination of Mapping and Target is not possible", 1);
    else op.setUiError("pointscreen", null);

    CGL.TextureEffect.setupBlending(op, mod, inBlend, inAmount);
}

render.onTriggered = function ()
{
    const vp = cgl.getViewPort();

    mod.bind();
    mod.setUniformValue("MOD_viewPortW", vp[2]);
    mod.setUniformValue("MOD_viewPortH", vp[3]);
    let tex = inTex.get();
    if (!tex) tex = CGL.Texture.getEmptyTexture(cgl).tex;
    else tex = tex.tex;

    mod.pushTexture("MOD_tex", tex);

    next.trigger();
    mod.unbind();
};
