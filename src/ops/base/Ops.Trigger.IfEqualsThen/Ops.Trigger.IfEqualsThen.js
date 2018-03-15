var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var value1=op.inValue("Value 1",0);
var value2=op.inValue("Value 2",0);

var triggerThen=op.addOutPort(new Port(op,"then",OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new Port(op,"else",OP_PORT_TYPE_FUNCTION));

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
