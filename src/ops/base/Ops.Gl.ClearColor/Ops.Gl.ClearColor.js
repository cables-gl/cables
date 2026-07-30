const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    inClearDepth = op.inBool("Clear Depth", true),
    r = op.inFloatSlider("r", 0.1),
    g = op.inFloatSlider("g", 0.1),
    b = op.inFloatSlider("b", 0.1),
    a = op.inFloatSlider("a", 1);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;

render.onTriggered = function ()
{
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());

    if (inClearDepth.get()) cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    else cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);

    trigger.trigger();
};
