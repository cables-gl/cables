const
    v = op.inValueFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

function exec()
{
    if (CABLES.UI) op.setUiAttribs({ "extendTitle": v.get() });

    result.set(Number(v.get()));
}
