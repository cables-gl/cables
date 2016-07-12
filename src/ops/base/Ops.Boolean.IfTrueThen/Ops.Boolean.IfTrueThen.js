op.name='if true then';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var boolean=op.addInPort(new Port(op,"boolean",OP_PORT_TYPE_VALUE,{display:'bool'}));

var triggerThen=op.addOutPort(new Port(op,"then",OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new Port(op,"else",OP_PORT_TYPE_FUNCTION));

boolean.set(false);

function execBool()
{
    if(exe.isLinked())return;
    exec();
}

function exec()
{
    if(boolean.get() || boolean.get()>=1 )
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

boolean.onValueChanged=execBool;
exe.onTriggered=exec;
