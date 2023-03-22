const
    exec = op.inTriggerButton("Execute"),
    prefix = op.inString("Filter Prefix", ""),
    result = op.outObject("Result");

exec.onTriggered = update;

function update()
{
    let r = {};
    const vars = op.patch.getVars();
    const pre = prefix.get();
    for (let i in vars)
    {
        if (i.indexOf(pre) === 0 && typeof (vars[i].getValue()) != "object")
        {
            const newName = i.substr(pre.length);
            r[newName] = vars[i].getValue();
        }
    }

    result.setRef(r);
}
