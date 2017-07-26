op.name="ImageSequenceAnim";

var exe=op.addInPort(new Port(op,"Exe",OP_PORT_TYPE_FUNCTION));
var next=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var numX=op.addOutPort(new Port(op,"Num X",OP_PORT_TYPE_VALUE));

var texU=op.addOutPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var texV=op.addOutPort(new Port(op,"x",OP_PORT_TYPE_VALUE));

texU.set(0);
texV.set(0);

var posX=0;

exe.onTriggered=function()
{
    
    posX++;
    texU.set(1/numX*posX);

    next.trigger();
};