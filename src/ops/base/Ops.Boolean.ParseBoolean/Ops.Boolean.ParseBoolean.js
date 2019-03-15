var inVal=op.inValue("Value");
var result=op.outValueBool("Result");

inVal.onChange=function()
{
    var v=inVal.get();
    if(v==false || v===0 || v==null || v==undefined)result.set(false);
    else result.set(true);
};