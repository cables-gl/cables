var cgl=this.patch.cgl;

this.name='scale';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var scaleX=this.addInPort(new Port(this,"x"));
var scaleY=this.addInPort(new Port(this,"y"));
var scaleZ=this.addInPort(new Port(this,"z"));

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