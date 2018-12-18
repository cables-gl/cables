
var cgl=op.patch.cgl;
var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var m=mat4.create();
var matrix=op.addOutPort(new CABLES.Port(this,"matrix",CABLES.OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    mat4.copy(m, cgl.pMatrix);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
