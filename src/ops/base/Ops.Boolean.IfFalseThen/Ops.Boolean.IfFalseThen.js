
var exe=op.inTrigger("Exe");

var boolean=op.inValueBool("Boolean",false);

var triggerThen=op.outTrigger("then");
var triggerElse=op.outTrigger("else");

boolean.onChange=execBool;
exe.onTriggered=exec;

function execBool()
{
    if(exe.isLinked())return;
    exec();
}

function exec()
{
    if(!boolean.get()) triggerThen.trigger();
    else triggerElse.trigger();
}

