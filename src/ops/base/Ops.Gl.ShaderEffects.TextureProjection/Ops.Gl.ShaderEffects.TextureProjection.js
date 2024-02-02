const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inScale = op.inValue("Scale", 10),

    inBlend = op.inSwitch("Blendmode", ["Normal", "Mul", "Add"], "Normal"),

    inTarget = op.inSwitch("Target", ["Color", "Pointsize"], "Color"),

    inAmount = op.inValueSlider("Amount", 0.3),

    inUseTexAlpha = op.inBool("Use Texture Alpha", false),

    inPosX = op.inFloat("Pos X", 0),
    inPosY = op.inFloat("Pos Y", 0),

    inRotX = op.inFloat("Rot X", 0),
    inRotY = op.inFloat("Rot Y", 0),
    inRotZ = op.inFloat("Rot Z", 0),

    inTex = op.inTexture("Texture"),
    inMethod = op.inValueSelect("Mapping", ["Triplanar", "XY", "XZ", "YZ", "Screen"], "XY"),
    inDiscard = op.inValueBool("Discard"),
    inWorldSpace = op.inValueBool("WorldSpace");

const cgl = op.patch.cgl;

inUseTexAlpha.onChange =
inTarget.onChange =
inBlend.onChange = inDiscard.onChange = inWorldSpace.onChange = inMethod.onChange = updateDefines;

op.setPortGroup("Rotation", [inRotX, inRotY, inRotZ]);
op.setPortGroup("Position", [inPosX, inPosY]);

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.maptexture_body_vert,
    "srcBodyVert": attachments.maptexture_vert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.maptexture_frag,
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

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_USE_IMGALPHA", inUseTexAlpha.get());
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_MAP_XY", inMethod.get() == "XY");
    mod.toggleDefine("MOD_MAP_XZ", inMethod.get() == "XZ");
    mod.toggleDefine("MOD_MAP_YZ", inMethod.get() == "YZ");
    mod.toggleDefine("MOD_MAP_SCREEN", inMethod.get() == "Screen");
    mod.toggleDefine("MOD_MAP_TRIPLANAR", inMethod.get() == "Triplanar");
    mod.toggleDefine("MOD_DISCARD", inDiscard.get());

    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");

    mod.toggleDefine("MOD_TARGET_COLOR", inTarget.get() == "Color");
    mod.toggleDefine("MOD_TARGET_POINTSIZE", inTarget.get() == "Pointsize");
}

render.onTriggered = function ()
{
    // if(!cgl.getShader())
    // {
    //      next.trigger();
    //      return;
    // }

    // if(cgl.getShader()!=shader)
    // {
    //     // if(shader) removeModule();
    //     // shader=cgl.getShader();

    //     // moduleVert=shader.addModule(
    //     //     {
    //     //         "title":op.objName,
    //     //         "name":'MODULE_VERTEX_POSITION',
    //     //         "srcHeadVert":attachments.maptexture_body_vert,
    //     //         "srcBodyVert":attachments.maptexture_vert
    //     //     });
    //     // moduleFrag=shader.addModule(
    //     //     {
    //     //         "title":op.objName,
    //     //         "name":'MODULE_COLOR',
    //     //         "srcHeadFrag":attachments.maptexture_frag,
    //     //         "srcBodyFrag":attachments.maptexture_body_frag
    //     //     },moduleVert);

    //     // inScale.scale=new CGL.Uniform(shader,'f',moduleFrag.prefix+'scale',inScale);
    //     // inAmount.amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);
    //     // new CGL.Uniform(shader,'2f','MOD_offset',inPosX,inPosY);

    //     // new CGL.Uniform(shader,'t',moduleFrag.prefix+'tex',5);
    //     updateDefines();
    // }

    // if(!shader)return;
    // if(inTex.get()) cgl.setTexture(5, inTex.get().tex);

    const vp = cgl.getViewPort();

    mod.setUniformValue("MOD_viewPortW", vp[2]);
    mod.setUniformValue("MOD_viewPortH", vp[3]);

    mod.bind();
    let tex = inTex.get();
    if (!tex) tex = CGL.Texture.getEmptyTexture(cgl).tex;
    else tex = tex.tex;

    mod.pushTexture("MOD_tex", tex);

    next.trigger();
    mod.unbind();
};
