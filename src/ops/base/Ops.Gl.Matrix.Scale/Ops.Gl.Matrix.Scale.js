op.name='scale';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var scale=op.addInPort(new Port(op,"scale"));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

render.onTriggered=function()
{
    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);
    trigger.trigger();
    cgl.popMvMatrix();
};

var scaleChanged=function()
{
    doScale=false;
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
    mat4.identity(transMatrix);
    mat4.scale(transMatrix,transMatrix, vScale);
};

scale.onValueChange(scaleChanged);
scale.set(1.0);
scaleChanged();