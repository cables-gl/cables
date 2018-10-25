const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
const g=op.inValueSlider("g",0.1);
const b=op.inValueSlider("b",0.1);
const a=op.inValueSlider("a",1);

r.set(0.1);
const cgl=op.patch.cgl;

render.onTriggered=function()
{
    cgl.gl.clearColor(r.get(),g.get(),b.get(),a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};
