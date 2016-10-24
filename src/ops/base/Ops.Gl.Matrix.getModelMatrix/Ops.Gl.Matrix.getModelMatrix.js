op.name='ModelMatrix';
var cgl=op.patch.cgl;
var render=op.inFunction('render');
var trigger=op.outFunction('trigger');

var m=mat4.create();
var matrix=op.addOutPort(new Port(this,"matrix",OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    mat4.copy(m, cgl.mvMatrix);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
