var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var value1=op.inValue("Value 1",0);
var value2=op.inValue("Value 2",0);

var triggerThen=op.addOutPort(new CABLES.Port(op,"then",CABLES.OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new CABLES.Port(op,"else",CABLES.OP_PORT_TYPE_FUNCTION));

function exec()
{
    if(value1.get()==value2.get() )
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

exe.onTriggered=exec;
