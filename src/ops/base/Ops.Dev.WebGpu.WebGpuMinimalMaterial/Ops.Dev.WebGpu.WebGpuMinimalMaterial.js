const
    inTrigger = op.inTrigger("Render"),
    next = op.outTrigger("Next");

let shader=null;

inTrigger.onTriggered=()=>
{
    const cgp=op.patch.cg;
    if (!shader)
    {
        shader = new CGP.Shader(cgp, "testshad0r");
        shader.setSource(attachments.mat_wgsl);
    }

    cgp.pushShader(shader);

    next.trigger();

    cgp.popShader(shader);

};