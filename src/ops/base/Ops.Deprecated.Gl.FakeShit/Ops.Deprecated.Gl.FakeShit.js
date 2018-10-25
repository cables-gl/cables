op.name="OverwriteTranslation";

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var scale=op.outValue("Scale");

var cgl=op.patch.cgl;

var v=vec3.create();

exe.onTriggered=function()
{
    cgl.pushModelMatrix();

var x=cgl.mvMatrix[12];
var y=cgl.mvMatrix[13];
var z=cgl.mvMatrix[14];


mat4.identity(cgl.mvMatrix);

cgl.mvMatrix[12]=x;
cgl.mvMatrix[14]=z;



y*=0.55;
y=Math.max(0.85,y);
mat4.scale(cgl.mvMatrix,cgl.mvMatrix,[y,y,y]);

scale.set(y);
    
    trigger.trigger();

    cgl.popModelMatrix();
};