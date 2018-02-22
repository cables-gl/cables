op.name='SetVar';

var v=op.inObject("Value");
var varname=op.inValueString("Name");

function update()
{
    op.patch.vars[varname.get()]=v.get();
}

varname.onChange=update;
v.onChange=update;
