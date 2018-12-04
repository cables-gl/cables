const
    exe=op.inTrigger("exe"),
    result=op.outValue("result"),
    phase=op.inValue("phase",0),
    mul=op.inValue("frequency",1),
    amplitude=op.inValue("amplitude",1);

exe.onTriggered=exec;
exec();

function exec()
{
    result.set( amplitude.get() * Math.sin( (op.patch.freeTimer.get()*mul.get()) + phase.get() ));
}

