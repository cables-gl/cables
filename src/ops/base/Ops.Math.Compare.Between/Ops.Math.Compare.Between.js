const result=op.addOutPort(new Port(op,"result"));
const number=op.addInPort(new Port(op,"value",2));
const number1=op.addInPort(new Port(op,"number1"),1);
const number2=op.addInPort(new Port(op,"number2"),3);

var exec= function()
{
    result.set
        (
            number.get() > Math.min(number1.get() , number2.get() )  &&
            number.get() < Math.max(number1.get() , number2.get() ) 
        );
};

number1.onValueChanged=exec;
number2.onValueChanged=exec;
number.onValueChanged=exec;
exec();