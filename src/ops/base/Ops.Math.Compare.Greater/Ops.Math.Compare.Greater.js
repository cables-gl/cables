const result=op.outValue("result");
var number1=op.addInPort(new CABLES.Port(op,"number1"));
var number2=op.addInPort(new CABLES.Port(op,"number2"));

number1.onChange=exec;
number2.onChange=exec;

function exec()
{
    result.set(number1.get()>number2.get());
}

