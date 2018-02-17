
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var scaleX=op.addInPort(new Port(op,"x"));
var scaleY=op.addInPort(new Port(op,"y"));
var scaleZ=op.addInPort(new Port(op,"z"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

var hasChanged=true;

render.onTriggered=function()
{
    if(hasChanged)
    {
        vec3.set(vScale, scaleX.get(),scaleY.get(),scaleZ.get());
        mat4.identity(transMatrix);
        mat4.scale(transMatrix,transMatrix, vScale);
    }

    cgl.pushModelMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);
    trigger.trigger();
    cgl.popModelMatrix();
};

var scaleChanged=function()
{
    hasChanged=true;
};

scaleX.set(1.0);
scaleY.set(1.0);
scaleZ.set(1.0);

scaleX.onValueChange(scaleChanged);
scaleY.onValueChange(scaleChanged);
scaleZ.onValueChange(scaleChanged);

