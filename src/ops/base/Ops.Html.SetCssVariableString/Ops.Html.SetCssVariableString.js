const
    varname = op.inString("Var Name"),
    val = op.inString("Value"),
    quoted = op.inBool("Output quoted string", false);

const root = document.documentElement;

val.onChange = varname.onChange = quoted.onChange = update;

function update()
{
    op.setUiAttrib({ "extendTitle": varname.get() });
    let value = val.get();
    if (quoted.get())
    {
        value = "\"" + value + "\"";
    }

    root.style.setProperty("--" + varname.get(), value);
}
