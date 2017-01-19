var cgl=op.patch.cgl;

op.name='TransformMul';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var mul=this.addInPort(new Port(this,"mul"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

    cgl.pushMvMatrix();
    vec3.mul(pos,pos,[mul.get(),mul.get(),mul.get()] );

    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, pos );
    trigger.trigger();

    cgl.popMvMatrix();
};