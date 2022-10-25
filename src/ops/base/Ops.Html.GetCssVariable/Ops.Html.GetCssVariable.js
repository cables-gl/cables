const
    exe = op.inTriggerButton("Update"),
    varname = op.inString("Var Name"),
    result = op.outString("Result");

const root = document.documentElement;

exe.onTriggered = function ()
{
    result.set(root.style.getPropertyValue("--" + varname.get()));
};
