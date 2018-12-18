//Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='if picking pass';
const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");

render.onTriggered=function()
{
    if(cgl.frameStore.pickingpass)
    {
        trigger.trigger();
    }
};