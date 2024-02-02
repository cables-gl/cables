const
    render = op.inTrigger("render"),
    inStrength = op.inValue("Strength", 1),
    next = op.outTrigger("trigger"),
    cgl = op.patch.cgl;

const srcBodyVert = ""
    .endl() + "pos=MOD_scaler(pos,mat3(modelMatrix)*attrVertNormal);"
    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addUniform("f", "MOD_strength", inStrength);
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.scalebynormal_vert,
    "srcBodyVert": srcBodyVert
});

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};
