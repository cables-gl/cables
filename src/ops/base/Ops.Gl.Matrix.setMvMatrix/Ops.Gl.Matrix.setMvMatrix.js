var cgl=op.patch.cgl;
op.name='set MV Matrix';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var inIdentity=op.inValueBool("Identity",false);
var next=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=op.addInPort(new Port(op,"matrix",OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    cgl.pushMvMatrix();

    if(inIdentity.get())    
        mat4.identity(cgl.mvMatrix);

    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,matrix.get());

    next.trigger();
    cgl.popMvMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
