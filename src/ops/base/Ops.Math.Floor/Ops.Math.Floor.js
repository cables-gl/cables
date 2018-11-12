const number1=op.inValue("Number");
const result=op.outValue("Result");
number1.onChange=exec;

function exec()
{
    result.set(Math.floor(number1.get()));
}

