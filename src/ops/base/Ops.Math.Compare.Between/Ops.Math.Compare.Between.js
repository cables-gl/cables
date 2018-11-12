const number=op.inValue("value",2);
const number1=op.inValue("number1",1);
const number2=op.inValue("number2",3);
const result=op.outValue("result");

function exec()
{
    result.set
        (
            number.get() > Math.min(number1.get() , number2.get() )  &&
            number.get() < Math.max(number1.get() , number2.get() ) 
        );
}

number1.onChange=exec;
number2.onChange=exec;
number.onChange=exec;
exec();