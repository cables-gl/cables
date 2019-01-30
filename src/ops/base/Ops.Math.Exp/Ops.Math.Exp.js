const number=op.inValueFloat("number");
const result=op.outValue("result");

number.onChange=function()
{
    var r=Math.exp( number.get() );
    if(isNaN(r))r=0;
    result.set(r);
};