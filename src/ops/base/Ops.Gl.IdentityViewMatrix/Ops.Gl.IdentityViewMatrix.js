var cgl=this.patch.cgl;

this.name='view Identity ';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

exe.onTriggered=function()
{
    cgl.pushViewMatrix();

    mat4.identity(cgl.vMatrix);
    trigger.trigger();

    cgl.popViewMatrix();
};