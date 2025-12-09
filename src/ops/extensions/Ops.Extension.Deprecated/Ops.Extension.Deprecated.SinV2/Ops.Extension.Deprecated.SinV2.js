op.name = "Sinus";
let value = op.addInPort(new CABLES.Port(op, "value", CABLES.OP_PORT_TYPE_VALUE));
let result = op.addOutPort(new CABLES.Port(op, "result"));

let phase = op.addInPort(new CABLES.Port(op, "phase", CABLES.OP_PORT_TYPE_VALUE));
let mul = op.addInPort(new CABLES.Port(op, "frequency", CABLES.OP_PORT_TYPE_VALUE));
let amplitude = op.addInPort(new CABLES.Port(op, "amplitude", CABLES.OP_PORT_TYPE_VALUE));

mul.set(1.0);
amplitude.set(1.0);
phase.set(1);

value.onChange = function ()
{
    result.set(
        amplitude.get() *
        Math.sin(
            (value.get())
            + phase.get()));
};
