const
    render=op.inTrigger("render"),
    trigger=op.outTrigger("trigger"),
    enable=op.inValueBool("enable",true),
    cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(enable.get()) cgl.gl.enable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);
        else cgl.gl.disable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);

    trigger.trigger();
    cgl.gl.disable(cgl.gl.SAMPLE_ALPHA_TO_COVERAGE);
};
