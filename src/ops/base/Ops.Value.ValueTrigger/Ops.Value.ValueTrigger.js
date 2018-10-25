
var exe=op.inFunctionButton("exe");
var v=op.addInPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));

var next=op.outFunction("Next");
var result=op.addOutPort(new CABLES.Port(op,"result"));

exe.onTriggered=exec;

result.changeAlways=true;

function exec()
{
    result.set(v.get());
    next.trigger();
}

