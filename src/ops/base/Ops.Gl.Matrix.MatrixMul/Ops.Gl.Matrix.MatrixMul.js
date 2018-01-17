var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var matrix=op.addInPort(new Port(op,"matrix"),OP_PORT_TYPE_ARRAY);

var m=mat4.create();

matrix.onChange=function()
{
    m.set(matrix.get());
};

render.onTriggered=function()
{
    cgl.pushModelMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,m);
    trigger.trigger();
    cgl.popModelMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
