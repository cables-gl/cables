var cgl=this.patch.cgl;

this.name='matrix';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var matrix=this.addInPort(new Port(this,"matrix"),OP_PORT_TYPE_ARRAY);


var m=mat4.create();

matrix.onChange=function()
{
    m.set(matrix.get());
    console.log(matrix.get());
    
};

render.onTriggered=function()
{
    cgl.pushMvMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,m);
    trigger.trigger();
    cgl.popMvMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
