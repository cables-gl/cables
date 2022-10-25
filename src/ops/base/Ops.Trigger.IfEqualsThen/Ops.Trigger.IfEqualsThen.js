const exe = op.inTrigger("exe");
let value1 = op.inValue("Value 1", 0);
let value2 = op.inValue("Value 2", 0);

let triggerThen = op.addOutPort(new CABLES.Port(op, "then", CABLES.OP_PORT_TYPE_FUNCTION));
let triggerElse = op.addOutPort(new CABLES.Port(op, "else", CABLES.OP_PORT_TYPE_FUNCTION));

function exec()
{
    if (value1.get() == value2.get())
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

exe.onTriggered = exec;
