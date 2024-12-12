// Op.apply(this, arguments);
let self = this;
let cgl = self.patch.cgl;

this.name = "laser reset";
this.render = this.addInPort(new CABLES.Port(this, "render", CABLES.OP_PORT_TYPE_FUNCTION));

this.trigger = this.addOutPort(new CABLES.Port(this, "trigger", CABLES.OP_PORT_TYPE_FUNCTION));

this.render.onTriggered = function ()
{
    cgl.tempData.laserPoints.length = 0;
    self.trigger.trigger();
};
