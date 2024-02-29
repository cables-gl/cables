const
    exe = op.inTrigger("Exe"),
    speed = op.inValue("Speed", 1),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outDir = op.outNumber("Dir"),
    goNorth = op.inBool("North"),
    goEast = op.inBool("East"),
    goSouth = op.inBool("South"),
    goWest = op.inBool("West"),
    inCanvas = op.inObject("Canvas", null, "element"),
    inCanvasTestSize = op.inFloat("Size"),
    inStartX = op.inFloat("Start X", 0),
    inStartY = op.inFloat("Start Y", 0),

    inDirBarrierX = op.inFloat("Bassier Dir X", 0),
    inDirBarrierY = op.inFloat("Bassier Dir Y", 0),

    inReset = op.inTriggerButton("Reset");

let lastTime = performance.now();
let dir = 0;
let canvas = null;

function getCanvasPixel(ctx, x, y)
{
    if (x != x || y != y || x == Infinity || y == Infinity || x > canvas.width * 2 || y > canvas.heigth * 2)
        return 0;

    // if(x>0 && y>0)/**/

    let w = inCanvasTestSize.get();
    let r = 0;
    r += ctx.getImageData(x, y, 1, 1).data[0];
    r += ctx.getImageData(x + w, y, 1, 1).data[0];
    r += ctx.getImageData(x + w, y + w, 1, 1).data[0];
    r += ctx.getImageData(x, y + w, 1, 1).data[0];
    return r;
}

exe.onTriggered = function ()
{
    let ago = (performance.now() - lastTime) / 1000;
    let x = 0;
    let y = 0;
    if (goEast.get())x += ago * speed.get();
    if (goWest.get())x -= ago * speed.get();
    if (goNorth.get())y += ago * speed.get();
    if (goSouth.get())y -= ago * speed.get();

    if (goEast.get())dir = 90;
    if (goWest.get())dir = 270;
    if (goNorth.get())dir = 0;
    if (goSouth.get())dir = 180;

    let newPosX = outX.get() + x;
    let newPosY = outY.get() + y;

    if (inCanvas.get())
    {
        canvas = inCanvas.get();
        let ctx = canvas.getContext("2d");

        if (getCanvasPixel(ctx, newPosX, newPosY))
        {
            newPosX = outX.get() + x;
            newPosY = outY.get();
            if (getCanvasPixel(ctx, newPosX, newPosY))
            {
                newPosX = outX.get();
                newPosY = outY.get() + y;
                if (getCanvasPixel(ctx, newPosX, newPosY))
                {
                    newPosX = outX.get();
                    newPosY = outY.get() + y;
                    if (getCanvasPixel(ctx, newPosX, newPosY))
                    {
                        // all failed...

                        if (inDirBarrierX.get() != 0 || inDirBarrierY.get() != 0)
                        {
                            for (let i = 0; i < 200; i++)
                            {
                                newPosX = outX.get() + inDirBarrierX.get();
                                newPosY = outY.get() + inDirBarrierY.get();
                                outX.set(newPosX);
                                outY.set(newPosY);
                                if (!getCanvasPixel(ctx, newPosX, newPosY)) break;
                            }
                        }
                        else
                        {
                            newPosX = outX.get();
                            newPosY = outY.get();
                        }
                    }
                }
            }
        }
    }

    outDir.set(dir);
    outX.set(newPosX);
    outY.set(newPosY);
    lastTime = performance.now();
};

inReset.onTriggered = () =>
{
    outX.set(inStartX.get());
    outY.set(inStartY.get());
    dir = 0;
    outDir.set(dir);
};
