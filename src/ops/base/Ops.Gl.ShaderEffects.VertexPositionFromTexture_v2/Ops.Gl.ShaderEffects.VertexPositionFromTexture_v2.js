const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture"),
    inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
inMode.onChange = updateDefines;
render.onTriggered = doRender;
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_ADD", inMode.get() == "Add");
    mod.toggleDefine("MOD_ABS", inMode.get() == "Absolute");
}

function doRender()
{
    mod.bind();
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

    trigger.trigger();
    mod.unbind();
}
