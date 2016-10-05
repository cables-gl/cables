op.name='RelativeTime';

var exe=op.inFunction("exe");
var result=op.outValue("result");

exe.onTriggered=update;
update();

function update()
{
    result.set( op.patch.freeTimer.get() );
}

