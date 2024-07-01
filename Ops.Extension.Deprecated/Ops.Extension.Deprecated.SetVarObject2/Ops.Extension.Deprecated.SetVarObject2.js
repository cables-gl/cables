op.name = "SetVar";

let v = op.inObject("Value");
let varname = op.inValueString("Name");

function update()
{
    op.patch.vars[varname.get()] = v.get();
}

varname.onChange = update;
v.onChange = update;
