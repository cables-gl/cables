op.name='RelativeTime';

var exe=op.inTrigger("exe");
var mul=op.inValue("Multiply",1);
var result=op.outValue("result");

exe.onTriggered=update;
update();

function update()
{
    result.set( op.patch.freeTimer.get()*mul.get() );
}

