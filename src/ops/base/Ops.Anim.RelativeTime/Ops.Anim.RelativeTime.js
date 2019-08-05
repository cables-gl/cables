const
    exe=op.inTrigger("exe"),
    mul=op.inValue("Multiply",1),
    outTrigger = op.outTrigger("Trigger out"),
    result=op.outValue("result");

exe.onTriggered=update;
update();

function update()
{
    result.set( op.patch.freeTimer.get()*mul.get() );
    outTrigger.trigger();
}

