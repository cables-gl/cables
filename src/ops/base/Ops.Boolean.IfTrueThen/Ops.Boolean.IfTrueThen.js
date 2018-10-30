
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var boolean=op.addInPort(new CABLES.Port(op,"boolean",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

var triggerThen=op.addOutPort(new CABLES.Port(op,"then",CABLES.OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new CABLES.Port(op,"else",CABLES.OP_PORT_TYPE_FUNCTION));

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

boolean.onChange=execBool;
exe.onTriggered=exec;
