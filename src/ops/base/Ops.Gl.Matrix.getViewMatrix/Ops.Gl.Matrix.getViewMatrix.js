var cgl=this.patch.cgl;
this.name='get View Matrix';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var m=mat4.create();
var matrix=this.addOutPort(new Port(this,"matrix",OP_PORT_TYPE_ARRAY));

render.onTriggered=function()
{
    mat4.copy(m, cgl.vMatrix);
    matrix.set(m);
    trigger.trigger();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
