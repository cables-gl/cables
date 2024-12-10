const
    inTrigger = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outShader = op.outObject("Shader");

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": 2,
    "title": "getshader",
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": ""
});

inTrigger.onTriggered = () =>
{
    if (op.patch.cgl.tempData.shadowPass) return;

    mod.bind();
    const sh = op.patch.cgl.getShader();
    // sh.bind();
    outShader.set(sh);
    mod.unbind();
    next.trigger();
};
