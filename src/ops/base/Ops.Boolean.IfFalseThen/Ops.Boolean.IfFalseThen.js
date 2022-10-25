const
    exe = op.inTrigger("Exe"),
    boolean = op.inValueBool("Boolean", false),
    triggerThen = op.outTrigger("then"),
    triggerElse = op.outTrigger("else");

boolean.onChange = execBool;
exe.onTriggered = exec;

function execBool()
{
    if (exe.isLinked()) return;
    exec();
}

function exec()
{
    if (!boolean.get()) triggerThen.trigger();
    else triggerElse.trigger();
}
