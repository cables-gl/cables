
var inTriggerTrue=op.inTriggerButton("True");
var inTriggerFalse=op.inTriggerButton("false");

var outResult=op.outValueBool("Result");



inTriggerTrue.onTriggered=function()
{
    outResult.set(true);
};

inTriggerFalse.onTriggered=function()
{
    outResult.set(false);
};