const
    v = op.inString("value", ""),
    result = op.outString("String");

v.onChange = function ()
{
    if (!v.isLinked())
        op.setUiAttrib({ "extendTitle": v.get() });

    result.set(v.get());
};
