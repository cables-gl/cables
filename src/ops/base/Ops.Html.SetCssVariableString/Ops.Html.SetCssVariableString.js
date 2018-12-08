const
    varname=op.inString("Var Name"),
    val=op.inString("Value");

var root = document.documentElement;

val.onChange=
    varname.onChange=update;

function update()
{
    root.style.setProperty('--'+varname.get(), val.get());
}



