op.name = "TimeLineTimeNew";

let exe = op.inTrigger("Exec");
let theTime = op.addOutPort(new CABLES.Port(this, "time"));

exe.onTriggered = function ()
{
    theTime.set(gui.scene().timer.getTime());
};
