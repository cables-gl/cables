const exe=op.inTrigger("exe");
const mul=op.inValue("Multiply",1);
const result=op.outValue("result");

exe.onTriggered=update;
update();

function update()
{
    result.set( op.patch.freeTimer.get()*mul.get() );
}

