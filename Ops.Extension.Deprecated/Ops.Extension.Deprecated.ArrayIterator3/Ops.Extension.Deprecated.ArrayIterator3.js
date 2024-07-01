op.name = "ArrayIterator 3x";
let exe = op.addInPort(new CABLES.Port(op, "Execute", CABLES.OP_PORT_TYPE_FUNCTION));
let arr = op.addInPort(new CABLES.Port(op, "Array", CABLES.OP_PORT_TYPE_ARRAY));
let mod = op.inValue("Modulo", 1);
arr.ignoreValueSerialize = true;

let trigger = op.outTrigger("trigger");
let idx = op.addOutPort(new CABLES.Port(op, "Index"));
let valX = op.addOutPort(new CABLES.Port(op, "Value 1"));
let valY = op.addOutPort(new CABLES.Port(op, "Value 2"));
let valZ = op.addOutPort(new CABLES.Port(op, "Value 3"));

exe.onTriggered = function ()
{
    if (!arr.get()) return;

    let ar = arr.get();
    for (let i = 0; i < ar.length; i += 3)
    {
        if (i % mod.get() == 0)
        {
            idx.set(i / 3);
            valX.set(arr.val[i + 0]);
            valY.set(arr.val[i + 1]);
            valZ.set(arr.val[i + 2]);
            trigger.trigger();
        }
    }
};
