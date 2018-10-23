op.name='ToggleBool';

var trigger=op.inFunctionButton("trigger");
var reset=op.inFunctionButton("reset");
var outBool=op.addOutPort(new Port(op,"result",CABLES.OP_PORT_TYPE_VALUE));
var theBool=false;
outBool.set(theBool);
outBool.ignoreValueSerialize=true;

trigger.onTriggered=function()
{
    theBool=!theBool;
    outBool.set(theBool);
};

reset.onTriggered=function()
{
    theBool=false;
    outBool.set(theBool);
};

