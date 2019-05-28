const
    inTime=op.inValue("Time"),
    fps=op.inValueFloat("FPS",10),
    numX=op.inValueFloat("Num X",4),
    numY=op.inValueFloat("Num Y",4),

    texRepeatX=op.outValue("Repeat X"),
    texRepeatY=op.outValue("Repeat Y"),
    texU=op.outValue("Offset X"),
    texV=op.outValue("Offset Y"),

    outFrame=op.outValue("Frame"),
    outProgress=op.outValue("Progress");

numX.onChange=numY.onChange=setRepeat;

texU.set(0);
texV.set(0);

var posX=0;
var posY=0;
var lastSwitch=0;
var frame=0;
setRepeat();

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


