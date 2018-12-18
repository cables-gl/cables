const number=op.inValue("number");
const result=op.outValue("result");

number.onChange=function()
{
    result.set( Math.abs(number.get()) );
};