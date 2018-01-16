
var num=op.inValue("Number");
var divisor=op.inValue("Divisor");

var result=op.outValue("Result");

num.onChange=function()
{
    result.set(num.get()%divisor.get()==0);
};