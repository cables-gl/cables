
var inVal=op.inValue("Value");
var inReset=op.inFunctionButton("Reset");
var outResult=op.outValue("Result");

var count=0;

inReset.onTriggered=function()
{
    count=0;
}

inVal.onChange=function()
{
    count++;
    outResult.set(count);
}