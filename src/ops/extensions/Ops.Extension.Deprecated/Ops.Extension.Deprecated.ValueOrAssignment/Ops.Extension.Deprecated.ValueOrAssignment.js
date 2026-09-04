let val = op.addInPort(new CABLES.Port(op, "Value", CABLES.Port.TYPE_VALUE));
let orval = op.addInPort(new CABLES.Port(op, "Default Value", CABLES.Port.TYPE_VALUE));
let result = op.addOutPort(new CABLES.Port(op, "Result", CABLES.Port.TYPE_VALUE));

val.ignoreValueSerialize = true;

function updateVar()
{
    if (!val.get())
    {
        result.set(orval.get());
    }
    else
    {
        result.set(val.get());
    }
}

val.onChange = updateVar;
orval.onChange = updateVar;
