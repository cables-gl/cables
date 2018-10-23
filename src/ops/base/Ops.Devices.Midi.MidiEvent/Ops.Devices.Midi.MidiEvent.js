var eventIn=op.addInPort(new Port(this,"Event Input",CABLES.OP_PORT_TYPE_OBJECT));

var eventOut=op.addOutPort(new Port(this,"Event Output",CABLES.OP_PORT_TYPE_OBJECT));

var outDevice=op.addOutPort(new Port(this,"Device",CABLES.OP_PORT_TYPE_VALUE));
var outNote=op.addOutPort(new Port(this,"Note",CABLES.OP_PORT_TYPE_VALUE));
var outVelocity=op.addOutPort(new Port(this,"Velocity",CABLES.OP_PORT_TYPE_VALUE));
var outChannel=op.addOutPort(new Port(this,"Channel",CABLES.OP_PORT_TYPE_VALUE));
var outCmd=op.addOutPort(new Port(this,"Cmd",CABLES.OP_PORT_TYPE_VALUE));
var outType=op.addOutPort(new Port(this,"Type",CABLES.OP_PORT_TYPE_VALUE));
var outTrigger = op.outFunction("Event Received");


eventIn.onValueChanged=function()
{
    var event=eventIn.get();
    if(!event)return;

    outDevice.set(event.deviceName);
    outNote.set(event.note);
    outChannel.set(event.channel);
    outVelocity.set(event.velocity);
    outCmd.set(event.cmd);
    outType.set(event.type);

    eventOut.set(event);
    outTrigger.trigger();
};

