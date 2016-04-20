op.name='ToggleBool';

var trigger=op.addInPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var reset=op.addInPort(new Port(op,"reset",OP_PORT_TYPE_FUNCTION));
var outBool=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_VALUE));
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

