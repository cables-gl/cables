var inTime=op.inValue("Time");
var fps=op.addInPort(new Port(op,"FPS",CABLES.OP_PORT_TYPE_VALUE));
var numX=op.addInPort(new Port(op,"Num X",CABLES.OP_PORT_TYPE_VALUE));
var numY=op.addInPort(new Port(op,"Num Y",CABLES.OP_PORT_TYPE_VALUE));

var texRepeatX=op.addOutPort(new Port(op,"Repeat X",CABLES.OP_PORT_TYPE_VALUE));
var texRepeatY=op.addOutPort(new Port(op,"Repeat Y",CABLES.OP_PORT_TYPE_VALUE));
var texU=op.addOutPort(new Port(op,"Offset X",CABLES.OP_PORT_TYPE_VALUE));
var texV=op.addOutPort(new Port(op,"Offset Y",CABLES.OP_PORT_TYPE_VALUE));

var outFrame=op.outValue("Frame");
var outProgress=op.outValue("Progress");

numX.onValueChanged=setRepeat;
numY.onValueChanged=setRepeat;
texU.set(0);
texV.set(0);
fps.set(10);
numX.set(4);
numY.set(4);

var posX=0;
var posY=0;
var lastSwitch=0;
var frame=0;

function setRepeat()
{
    texRepeatY.set(1.0/numY.get());
    texRepeatX.set(1.0/numX.get());
}

inTime.onChange=function()
{
    var frame=Math.floor(Math.abs(inTime.get())*fps.get());
    var numFrames=numX.get()*numY.get();

    frame=frame%numFrames;

    var row=Math.floor(frame/(numX.get()));
    var col=frame-(row*(numX.get()));

    outFrame.set(frame);
    outProgress.set((frame)/(numFrames-1));

    texU.set(texRepeatX.get()*col);
    texV.set(texRepeatY.get()*row);
};


