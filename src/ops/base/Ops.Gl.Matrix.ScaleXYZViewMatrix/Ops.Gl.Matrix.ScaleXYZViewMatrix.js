

var render=op.inTrigger('render');
var scaleX=op.addInPort(new CABLES.Port(op,"x"));
var scaleY=op.addInPort(new CABLES.Port(op,"y"));
var scaleZ=op.addInPort(new CABLES.Port(op,"z"));

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

render.onTriggered=function()
{
    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);
    trigger.trigger();
    cgl.popViewMatrix();
};

var scaleChanged=function()
{
    vec3.set(vScale, scaleX.get(),scaleY.get(),scaleZ.get());
    mat4.identity(transMatrix);
    mat4.scale(transMatrix,transMatrix, vScale);
};

scaleX.set(1.0);
scaleY.set(1.0);
scaleZ.set(1.0);

scaleX.onValueChange(scaleChanged);
scaleY.onValueChange(scaleChanged);
scaleZ.onValueChange(scaleChanged);

scaleChanged();