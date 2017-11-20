op.name="TimeLineTimeNew";

var exe=op.inFunction("Exec");
var theTime=op.addOutPort(new Port(this,"time"));


exe.onTriggered=function()
{
    theTime.set(gui.scene().timer.getTime());
};

