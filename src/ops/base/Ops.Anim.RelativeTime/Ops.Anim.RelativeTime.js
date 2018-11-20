const
    exe=op.inTrigger("exe"),
    mul=op.inValue("Multiply",1),
    result=op.outValue("result");

exe.onTriggered=update;
update();

function update()
{
    result.set( op.patch.freeTimer.get()*mul.get() );
}

