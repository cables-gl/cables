op.name = "get var";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.Port.TYPE_FUNCTION));

let varname = op.addInPort(new CABLES.Port(op, "name", CABLES.Port.TYPE_VALUE, { "type": "string" }));
let val = op.addOutPort(new CABLES.Port(op, "val", CABLES.Port.TYPE_VALUE));
let defaultValue = op.inFloat("Default Value", 0);

val.ignoreValueSerialize = true;

function updateVar()
{
    if (op.patch.vars && op.patch.vars.hasOwnProperty(varname.get()))
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
