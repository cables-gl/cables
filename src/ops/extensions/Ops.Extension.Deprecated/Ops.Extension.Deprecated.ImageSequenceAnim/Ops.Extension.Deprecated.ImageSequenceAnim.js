let exe = op.addInPort(new CABLES.Port(op, "Exe", CABLES.OP_PORT_TYPE_FUNCTION));
let next = op.addOutPort(new CABLES.Port(op, "Next", CABLES.OP_PORT_TYPE_FUNCTION));
let fps = op.addInPort(new CABLES.Port(op, "FPS", CABLES.OP_PORT_TYPE_VALUE));
let inOffsetY = op.addInPort(new CABLES.Port(op, "Row Offset Y", CABLES.OP_PORT_TYPE_VALUE));
let numFrames = op.addInPort(new CABLES.Port(op, "Num Frames", CABLES.OP_PORT_TYPE_VALUE));
let numX = op.addInPort(new CABLES.Port(op, "Num X", CABLES.OP_PORT_TYPE_VALUE));
let numY = op.addInPort(new CABLES.Port(op, "Num Y", CABLES.OP_PORT_TYPE_VALUE));

let play = op.inValueBool("Play", true);

let texRepeatX = op.addOutPort(new CABLES.Port(op, "Repeat X", CABLES.OP_PORT_TYPE_VALUE));
let texRepeatY = op.addOutPort(new CABLES.Port(op, "Repeat Y", CABLES.OP_PORT_TYPE_VALUE));
let texU = op.addOutPort(new CABLES.Port(op, "Offset X", CABLES.OP_PORT_TYPE_VALUE));
let texV = op.addOutPort(new CABLES.Port(op, "Offset Y", CABLES.OP_PORT_TYPE_VALUE));

numX.onChange = setRepeat;
numY.onChange = setRepeat;
texU.set(0);
texV.set(0);
fps.set(10);
numX.set(4);
numY.set(4);

let posX = 0;
let posY = 0;
let lastSwitch = 0;
let frame = 0;

function setRepeat()
{
    texRepeatY.set(1.0 / numY.get());
    texRepeatX.set(1.0 / numX.get());
}

inOffsetY.onChange = function ()
{
    posY = inOffsetY.get();
};

exe.onTriggered = function ()
{
    if (play.get())
        if (op.patch.freeTimer.getMillis() - lastSwitch > 1000 / fps.get())
        {
            lastSwitch = op.patch.freeTimer.getMillis();
            frame++;
            posX++;

            if (posX >= numX.get())
            {
                posX = 0;
                posY++;
            }
            if (posY >= numY.get())posY = 0;

            if (numFrames.get() !== 0 && frame > numFrames.get())
            {
                frame = 0;
                posX = 0;
                posY = inOffsetY.get();
            }

            texU.set(texRepeatX.get() * posX);
            texV.set(texRepeatY.get() * posY);
        }

    next.trigger();
};
