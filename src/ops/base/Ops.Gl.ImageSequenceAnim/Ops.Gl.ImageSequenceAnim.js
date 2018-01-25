
var exe=op.addInPort(new Port(op,"Exe",OP_PORT_TYPE_FUNCTION));
var next=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));
var fps=op.addInPort(new Port(op,"FPS",OP_PORT_TYPE_VALUE));
var inOffsetY=op.addInPort(new Port(op,"Row Offset Y",OP_PORT_TYPE_VALUE));
var numFrames=op.addInPort(new Port(op,"Num Frames",OP_PORT_TYPE_VALUE));
var numX=op.addInPort(new Port(op,"Num X",OP_PORT_TYPE_VALUE));
var numY=op.addInPort(new Port(op,"Num Y",OP_PORT_TYPE_VALUE));

var play=op.inValueBool("Play",true);

var texRepeatX=op.addOutPort(new Port(op,"Repeat X",OP_PORT_TYPE_VALUE));
var texRepeatY=op.addOutPort(new Port(op,"Repeat Y",OP_PORT_TYPE_VALUE));
var texU=op.addOutPort(new Port(op,"Offset X",OP_PORT_TYPE_VALUE));
var texV=op.addOutPort(new Port(op,"Offset Y",OP_PORT_TYPE_VALUE));

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

inOffsetY.onChange=function()
{
    posY=inOffsetY.get();
};

exe.onTriggered=function()
{
    if(play.get())
    if(op.patch.freeTimer.getMillis()-lastSwitch>1000/fps.get())
    {
        lastSwitch=op.patch.freeTimer.getMillis();
        frame++;
        posX++;

        if(posX>=numX.get())
        {
            posX=0;
            posY++;
        }
        if(posY>=numY.get())posY=0;

        if(numFrames.get() !==0 && frame>numFrames.get())
        {
            frame=0;
            posX=0;
            posY=inOffsetY.get();
        }

        texU.set(texRepeatX.get()*posX);
        texV.set(texRepeatY.get()*posY);
    }

    next.trigger();
};


