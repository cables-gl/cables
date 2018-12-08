const
    exe=op.inTriggerButton("Update"),
    varname=op.inString("Var Name"),
    result=op.outString("Result");

var root = document.documentElement;


exe.onTriggered=function()
{
    result.set(root.style.getPropertyValue('--'+varname.get()));
};
