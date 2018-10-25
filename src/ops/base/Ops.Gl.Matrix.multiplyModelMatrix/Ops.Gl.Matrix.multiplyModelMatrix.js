var cgl=op.patch.cgl;
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var inIdentity=op.inValueBool("Identity",false);
var next=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=op.addInPort(new CABLES.Port(op,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    cgl.pushModelMatrix();

    if(inIdentity.get())    
        mat4.identity(cgl.mvMatrix);

    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,matrix.get());

    next.trigger();
    cgl.popModelMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
