const render=op.inTrigger("render");
const inIdentity=op.inValueBool("Identity",false);

const trigger=op.outTrigger("trigger");

var m=mat4.create();
var matrix=this.addInPort(new CABLES.Port(this,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

var cgl=this.patch.cgl;
matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );


render.onTriggered=function()
{
    if(!matrix.get())return;
    cgl.pushViewMatrix();

    if(inIdentity.get()) mat4.identity(cgl.vMatrix);

    mat4.multiply(cgl.vMatrix,cgl.vMatrix,matrix.get());

    trigger.trigger();
    cgl.popViewMatrix();
};

