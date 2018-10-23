var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=this.addInPort(new Port(this,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

var cgl=this.patch.cgl;
matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );


render.onTriggered=function()
{
    if(!matrix.get())return;
    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,matrix.get());

    trigger.trigger();
    cgl.popViewMatrix();
};

