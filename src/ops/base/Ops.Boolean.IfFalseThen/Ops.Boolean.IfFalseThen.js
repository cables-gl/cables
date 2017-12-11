
var exe=op.inFunction("Exe");

var boolean=op.inValueBool("Boolean",false);

var triggerThen=op.outFunction("then");
var triggerElse=op.outFunction("else");

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

