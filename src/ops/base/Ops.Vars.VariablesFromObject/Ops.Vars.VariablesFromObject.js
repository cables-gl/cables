const
    exec = op.inTriggerButton("Execute"),
    inVars = op.inObject("Variables");

exec.onTriggered = update;

function update()
{
    let r = {};
    const vars = inVars.get() || {};
    for (let varName in vars)
    {
        if (op.patch.hasVar(varName))
        {
            const varValue = vars[varName];
            op.patch.setVariable(varName, varValue);
        }
    }
}
