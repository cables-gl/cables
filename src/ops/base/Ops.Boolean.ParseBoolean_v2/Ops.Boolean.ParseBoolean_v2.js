const
    inVal=op.inString("String"),
    result=op.outValueBool("Result");

inVal.onChange=function()
{
    var v=inVal.get();
    if( v==="false" || v==false || v===0 || v==null || v==undefined)result.set(false);
    else result.set(true);
};