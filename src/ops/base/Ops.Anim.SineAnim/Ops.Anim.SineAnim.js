const
    exe=op.inTrigger("exe"),
    result=op.outValue("result"),
    phase=op.inValueFloat("phase",0),
    mul=op.inValueFloat("frequency",1),
    amplitude=op.inValueFloat("amplitude",1);

op.toWorkPortsNeedToBeLinked(exe);

exe.onTriggered=exec;
exec();

function exec()
{
    result.set( amplitude.get() * Math.sin( (op.patch.freeTimer.get()*mul.get()) + phase.get() ));
}

