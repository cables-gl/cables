
var number=op.inValue("Number");
var doAdd=op.inFunctionButton("Add");
var doReset=op.inFunctionButton("Reset");

var result=op.outValue("Result");

var value=0;

doAdd.onTriggered=function()
{
    value+=number.get();
    result.set(value);
};

doReset.onTriggered=function()
{
    value=0;
    result.set(value);
};