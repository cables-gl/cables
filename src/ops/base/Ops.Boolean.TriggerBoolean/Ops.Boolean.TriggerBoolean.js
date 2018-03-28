
var inTriggerTrue=op.inFunctionButton("True");
var inTriggerFalse=op.inFunctionButton("false");

var outResult=op.outValue("Result");



inTriggerTrue.onTriggered=function()
{
    outResult.set(true);
};

inTriggerFalse.onTriggered=function()
{
    outResult.set(false);
};