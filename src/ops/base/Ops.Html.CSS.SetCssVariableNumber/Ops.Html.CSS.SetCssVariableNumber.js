const
    varname = op.inString("Var Name"),
    val = op.inFloat("Value"),
    suff = op.inString("Suffix", "px");

let decm = 1;

op.toWorkPortsNeedsString(varname);

const root = document.documentElement;
val.onChange = varname.onChange = update;

function update()
{
    op.setUiAttrib({ "extendTitle": varname.get() });

    let value = val.get() + suff.get();

    root.style.setProperty("--" + varname.get(), value);
}
