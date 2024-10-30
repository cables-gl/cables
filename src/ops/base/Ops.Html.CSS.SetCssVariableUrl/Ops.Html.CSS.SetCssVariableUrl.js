const
    varname = op.inString("Var Name"),
    val = op.inString("Value");

const root = document.documentElement;

val.onChange = varname.onChange = update;

function update()
{
    op.setUiAttrib({ "extendTitle": varname.get() });
    root.style.setProperty("--" + varname.get(), "url(" + val.get() + ")");
}
