const
    exe = op.inTrigger("exe"),
    boolean = op.inBool("boolean", false),
    triggerThen = op.outTrigger("then"),
    triggerElse = op.outTrigger("else");

exe.onTriggered = exec;

function exec()
{
    if (boolean.get()) triggerThen.trigger();
    else triggerElse.trigger();
}
