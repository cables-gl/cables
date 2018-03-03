var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var scale=op.addInPort(new Port(op,"scale"));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var vScale=vec3.create();
scale.onChange=scaleChanged;
scale.set(1.0);
scaleChanged();


render.onTriggered=function()
{
    cgl.pushModelMatrix();
    mat4.scale(cgl.mvMatrix,cgl.mvMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
};

function scaleChanged()
{
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
};

