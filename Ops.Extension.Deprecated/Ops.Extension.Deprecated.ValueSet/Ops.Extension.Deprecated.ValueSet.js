op.name = "ValueSet";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let v = op.addInPort(new CABLES.Port(op, "value", CABLES.OP_PORT_TYPE_VALUE));

let result = op.addOutPort(new CABLES.Port(op, "result"));

let exec = function ()
{
    result.set(v.get());
};

exe.onTriggered = exec;
