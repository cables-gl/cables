op.name="TimeLineRewind";

// var exe=op.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var exe=op.inFunctionButton("exe");


exe.onTriggered=function()
{
    op.patch.timer.setTime(0);
};
