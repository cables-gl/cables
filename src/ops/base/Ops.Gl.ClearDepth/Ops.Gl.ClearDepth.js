var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};


