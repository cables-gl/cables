op.name='TriggerCounter';
// var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
// var reset=op.addInPort(new CABLES.Port(op,"reset",CABLES.OP_PORT_TYPE_FUNCTION));
var exe=op.inFunctionButton("exe");
var reset=op.inFunctionButton("reset");//op.addInPort(new CABLES.Port(op,"reset",CABLES.OP_PORT_TYPE_FUNCTION));



var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var num=op.addOutPort(new CABLES.Port(op,"timesTriggered",CABLES.OP_PORT_TYPE_VALUE));

var n=0;

exe.onTriggered= function()
{
    n++;
    num.set(n);
    trigger.trigger();
};

reset.onTriggered= function()
{
    n=0;
    num.set(n);
};
