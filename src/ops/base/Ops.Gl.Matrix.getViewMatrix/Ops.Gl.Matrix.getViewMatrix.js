
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=op.addOutPort(new Port(op,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    mat4.copy(m, cgl.vMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
