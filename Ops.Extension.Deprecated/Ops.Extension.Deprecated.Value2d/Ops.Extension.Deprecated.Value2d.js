const
    exe = op.inTrigger("exe"),
    x = op.inValueFloat("value x"),
    y = op.inValueFloat("value y"),
    resultX = op.outNumber("result x"),
    resultY = op.outNumber("result y");

exe.onTriggered = exec;

x.onChange = exec;
y.onChange = exec;

function frame(time)
{
    updateAnims();
    exec();
}

function exec()
{
    if (resultX.get() != x.get()) resultX.set(x.get());
    if (resultY.get() != y.get()) resultY.set(y.get());
}
