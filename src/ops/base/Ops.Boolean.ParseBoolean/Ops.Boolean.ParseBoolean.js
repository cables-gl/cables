var inVal=op.inFloat("Value");
var result=op.outBool("Result");

inVal.onChange=function()
{
    var v=inVal.get();
    if(v==false || v===0 || v==null || v==undefined)result.set(false);
    else result.set(true);
};