op.name='get View Matrix';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=op.addOutPort(new Port(op,"matrix",OP_PORT_TYPE_ARRAY));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    mat4.copy(m, cgl.vMatrix);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
