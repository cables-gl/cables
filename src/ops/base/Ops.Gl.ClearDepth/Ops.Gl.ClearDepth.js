
const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    cgl=op.patch.cgl;

render.onTriggered=function()
{
    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};


