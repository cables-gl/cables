const
    object0=op.inObject("Object 1"),
    object1=op.inObject("Object 2"),
    object2=op.inObject("Object 3"),
    object3=op.inObject("Object 4"),
    object4=op.inObject("Object 5"),
    object5=op.inObject("Object 6"),
    object6=op.inObject("Object 7"),
    object7=op.inObject("Object 8"),
    result=op.outObject("Result");

object0.onChange=exec;
object1.onChange=exec;
object2.onChange=exec;
object3.onChange=exec;
object4.onChange=exec;
object5.onChange=exec;
object6.onChange=exec;
object7.onChange=exec;


function exec()
{
    result.set( object0.get() || object1.get()  || object2.get() || object3.get() || object4.get() || object5.get() || object6.get() || object7.get() );
}

