const
    render = op.inTrigger("render"),
    inCubemap = op.inObject("Cubemap"),
    inAmount = op.inValueSlider("Amount", 0.3),
    next = op.outTrigger("next");

const moduleFrag = null;
const moduleVert = null;

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, "colorArea");
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.cm_reflection_head_vert,
    "srcBodyVert": attachments.cm_reflection_body_vert
});

mod.addModule({
    "title": op.objName,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.cm_reflection_head_frag,
    "srcBodyFrag": attachments.cm_reflection_body_frag
});

mod.addUniformFrag("tc", "MOD_cubemap", inCubemap);
mod.addUniformFrag("f", "MOD_amount", inAmount);

render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if (inCubemap.get() && inCubemap.get().cubemap)
    {
        mod.pushTexture("MOD_cubemap", inCubemap.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    }
    else return;
    // else cgl.setTexture(4, CGL.Texture.getTempTexture(cgl).tex);
    mod.bind();

    next.trigger();

    mod.unbind();
};
