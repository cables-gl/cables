const
    inTime = op.inValue("Time"),
    fps = op.inValueFloat("FPS", 10),
    numX = op.inValueFloat("Num X", 4),
    numY = op.inValueFloat("Num Y", 4),
    maxFrames = op.inInt("Max Frames", 0),

    texRepeatX = op.outValue("Repeat X"),
    texRepeatY = op.outValue("Repeat Y"),
    texU = op.outValue("Offset X"),
    texV = op.outValue("Offset Y"),

    outFrame = op.outValue("Frame"),
    outProgress = op.outValue("Progress");

numX.onChange = numY.onChange = setRepeat;

texU.set(0);
texV.set(0);

const posX = 0;
const posY = 0;
const lastSwitch = 0;
const frame = 0;
setRepeat();

function setRepeat()
{
    texRepeatY.set(1.0 / numY.get());
    texRepeatX.set(1.0 / numX.get());
}

inTime.onChange = function ()
{
    let frame = Math.floor(Math.abs(inTime.get()) * fps.get());
    let numFrames = numX.get() * numY.get();
    if (maxFrames.get() !== 0) numFrames = maxFrames.get();

    frame %= numFrames;


    const row = Math.floor(frame / (numX.get()));
    const col = frame - (row * (numX.get()));

    outFrame.set(frame);
    outProgress.set((frame) / (numFrames - 1));

    texU.set(texRepeatX.get() * col);
    texV.set(texRepeatY.get() * row);
};
