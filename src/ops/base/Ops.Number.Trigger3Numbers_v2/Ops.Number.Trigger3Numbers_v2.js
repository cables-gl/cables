const
    exe = op.inTriggerButton("exe"),
    x = op.inValueFloat("value x"),
    y = op.inValueFloat("value y"),
    z = op.inValueFloat("value z"),
    resultX = op.outNumber("result x"),
    resultY = op.outNumber("result y"),
    resultZ = op.outNumber("result z");

exe.onTriggered = exec;

function exec()
{
    resultX.set(x.get());
    resultY.set(y.get());
    resultZ.set(z.get());
}
