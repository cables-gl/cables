const
    render=op.inTrigger("render"),
    trigger=op.outTrigger("trigger"),
    enable=op.inValueBool("enable",true),
    sharpen=op.inValueBool("sharpen",false),
    cutoff=op.inFloat("cutoff", 0.5),
    cgl=op.patch.cgl;

const srcHeadFrag = "";
const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": srcHeadFrag,
    "srcBodyFrag": attachments.ATCSharpen_frag
});
mod.addUniform("f", "MOD_cutoff", cutoff);

render.onTriggered=function()
{
    if(enable.get()) cgl.gl.enable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);
        else cgl.gl.disable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);

    if(sharpen.get()) mod.bind();
    trigger.trigger();
    if(sharpen.get()) mod.unbind();
    cgl.gl.disable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);
};
