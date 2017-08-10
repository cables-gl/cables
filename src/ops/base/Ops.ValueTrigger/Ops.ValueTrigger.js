op.name="ValueTrigger";

var exe=op.inFunctionButton("exe");
var v=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new Port(op,"result"));

exe.onTriggered=exec;

result.changeAlways=true;

function exec()
{
    result.set(v.get());
}

