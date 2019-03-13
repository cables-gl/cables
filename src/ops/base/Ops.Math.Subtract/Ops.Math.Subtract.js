const
    number1=op.inValue("number1",1),
    number2=op.inValue("number2",1),
    result=op.outValue("result");

number1.onChange=exec;
number2.onChange=exec;
exec();

function exec()
{
    var v=number1.get()-number2.get();
    if(!isNaN(v)) result.set( v );
}

