// Op.apply(this, arguments);
let self = this;
let cgl = self.patch.cgl;

this.name = "if picking pass";
const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");

render.onTriggered = function ()
{
    if (cgl.frameStore.pickingpass)
    {
        trigger.trigger();
    }
};
