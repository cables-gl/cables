Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='if picking pass';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

render.onTriggered=function()
{
    if(cgl.frameStore.pickingpass)
    {
        trigger.trigger();
    }
};