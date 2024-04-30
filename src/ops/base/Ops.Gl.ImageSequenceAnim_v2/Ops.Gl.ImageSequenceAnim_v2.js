const
    inTime = op.inValue("Time"),
    inType = op.inSwitch("Unit", ["Seconds", "Frames"], "Seconds"),
    fps = op.inValueFloat("FPS", 10),
    numX = op.inValueFloat("Num X", 4),
    numY = op.inValueFloat("Num Y", 4),
    maxFrames = op.inInt("Max Frames", 0),

    texRepeatX = op.outNumber("Repeat X"),
    texRepeatY = op.outNumber("Repeat Y"),
    texU = op.outNumber("Offset X"),
    texV = op.outNumber("Offset Y"),
    flipY = op.inBool("Flip Y", false),

    outFrame = op.outNumber("Frame"),
    outProgress = op.outNumber("Progress");

numX.onChange = numY.onChange = setRepeat;

texU.set(0);
texV.set(0);

const posX = 0;
const posY = 0;
const lastSwitch = 0;
const frame = 0;
setRepeat();
inTime.onChange = update;

function setRepeat()
{
    texRepeatY.set(1 / numY.get());
    texRepeatX.set(1 / numX.get());
    update();
}

function update()
{
    let frame = Math.ceil(Math.abs(inTime.get()) * (fps.get()));
    if (inType.get() == "Frames") frame = inTime.get();
    let numFrames = numX.get() * numY.get();
    if (maxFrames.get() !== 0) numFrames = maxFrames.get();

    frame %= numFrames;

    const row = Math.floor(frame / (numX.get()));
    const col = frame - (row * (numX.get()));

    outFrame.set(frame);
    outProgress.set((frame) / (numFrames - 1));

    let y = texRepeatY.get() * row;
    if (flipY.get())y = 1.0 - y;

    texU.set(texRepeatX.get() * col);
    texV.set(y);
}
