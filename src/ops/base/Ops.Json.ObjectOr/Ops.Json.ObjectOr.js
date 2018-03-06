
var object0=op.inObject("Object 1");
var object1=op.inObject("Object 2");
var object2=op.inObject("Object 3");
var object3=op.inObject("Object 4");
var object4=op.inObject("Object 5");
var object5=op.inObject("Object 6");
var object6=op.inObject("Object 7");
var object7=op.inObject("Object 8");

var result=op.outObject("Result");

function exec()
{
    result.set( object0.get() || object1.get()  || object2.get() || object3.get() || object4.get() || object5.get() || object6.get() || object7.get() );
}

object0.onValueChange(exec);
object1.onValueChange(exec);
object2.onValueChange(exec);
object3.onValueChange(exec);
object4.onValueChange(exec);
object5.onValueChange(exec);
object6.onValueChange(exec);
object7.onValueChange(exec);

