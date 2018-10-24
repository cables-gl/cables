var cgl=op.patch.cgl;

var render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var mul=this.addInPort(new CABLES.Port(this,"mul"));

var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);

    cgl.pushModelMatrix();
    vec3.mul(pos,pos,[mul.get(),mul.get(),mul.get()] );

    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, pos );
    trigger.trigger();

    cgl.popModelMatrix();
};