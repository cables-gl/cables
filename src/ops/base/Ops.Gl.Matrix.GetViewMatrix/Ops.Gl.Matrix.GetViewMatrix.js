
var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var m=mat4.create();
var matrix=op.addOutPort(new CABLES.Port(op,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    mat4.copy(m, cgl.vMatrix);
    matrix.set(null);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
