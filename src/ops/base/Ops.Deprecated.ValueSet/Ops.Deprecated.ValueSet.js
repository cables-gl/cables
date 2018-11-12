op.name="ValueSet";

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var v=op.addInPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new CABLES.Port(op,"result"));

var exec=function()
{
    result.set(v.get());
};

exe.onTriggered=exec;
