const
    exe = op.inTriggerButton("Update"),
    varname = op.inString("Var Name"),
    result = op.outString("Result");

const root = document.documentElement;

exe.onTriggered = function ()
{
    let style = root.style.getPropertyValue("--" + varname.get());
    if (!style) style = getComputedStyle(root).getPropertyValue("--" + varname.get());
    result.set(style);
};
