op.name = "ValueSet";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.Port.TYPE_FUNCTION));
let v = op.addInPort(new CABLES.Port(op, "value", CABLES.Port.TYPE_VALUE));

let result = op.addOutPort(new CABLES.Port(op, "result"));

let exec = function ()
{
    result.set(v.get());
};

exe.onTriggered = exec;
