op.name = "GetVarString";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));

let varname = op.addInPort(new CABLES.Port(op, "name", CABLES.OP_PORT_TYPE_VALUE, { "type": "string" }));

let defaultValue = op.inValueString("Default Value", "");
let val = op.outValue("Result");

val.ignoreValueSerialize = true;

function updateVar()
{
    if (op.patch.vars && op.patch.vars[varname.get()])
    {
        if (op.patch.vars[varname.get()] != val.get())
            val.set(op.patch.vars[varname.get()]);
    }
    else
    {
        val.set(defaultValue.get());
    }
}

exe.onTriggered = updateVar;
varname.onValueChange(updateVar);
val.onValueChange(updateVar);

defaultValue.onChange = function ()
{
    val.set(defaultValue.get());
};
