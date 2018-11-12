//Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='if picking pass';
var render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    if(cgl.frameStore.pickingpass)
    {
        trigger.trigger();
    }
};