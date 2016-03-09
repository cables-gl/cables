var cgl=this.patch.cgl;

this.name='matrix';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var matrix=this.addInPort(new Port(this,"matrix"),OP_PORT_TYPE_ARRAY);

render.onTriggered=function()
{
    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,matrix.get());
    trigger.trigger();
    cgl.popMvMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
