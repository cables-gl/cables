const
    exe=op.inTrigger("exe"),
    x=op.inValueFloat("value x"),
    y=op.inValueFloat("value y"),
    z=op.inValueFloat("value z"),
    resultX=op.outValue("result x"),
    resultY=op.outValue("result y"),
    resultZ=op.outValue("result z");

exe.onTriggered=
    x.onChange=
    y.onChange=
    z.onChange=exec;


function frame(time)
{
    exec();
}

function exec()
{
    if(resultX.get()!=x.get()) resultX.set(x.get());
    if(resultY.get()!=y.get()) resultY.set(y.get());
    if(resultZ.get()!=z.get()) resultZ.set(z.get());
}

