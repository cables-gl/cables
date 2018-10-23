
var exe=op.inFunctionButton("exe");
var v=op.addInPort(new Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));

var next=op.outFunction("Next");
var result=op.addOutPort(new Port(op,"result"));

exe.onTriggered=exec;

result.changeAlways=true;

function exec()
{
    result.set(v.get());
    next.trigger();
}

