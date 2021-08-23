
let exe = op.inTrigger("Exe");

let boolean = op.inBool("Boolean", false);

let triggerThen = op.outTrigger("then");
let triggerElse = op.outTrigger("else");

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
