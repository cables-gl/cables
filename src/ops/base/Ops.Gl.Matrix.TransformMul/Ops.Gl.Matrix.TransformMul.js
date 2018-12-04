var cgl=op.patch.cgl;

const render=op.inTrigger("render");
var mul=this.addInPort(new CABLES.Port(this,"mul"));

const trigger=op.outTrigger("trigger");

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