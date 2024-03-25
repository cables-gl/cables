const
    exe = op.inTrigger("Exe"),
    speed = op.inValue("Speed", 1),
    goNorth = op.inBool("North"),
    goEast = op.inBool("East"),
    goSouth = op.inBool("South"),
    goWest = op.inBool("West"),
    inCanvas = op.inObject("Canvas", null, "element"),
    inCanvasTestSize = op.inFloat("Size"),
    inStartX = op.inFloat("Start X", 0),
    inStartY = op.inFloat("Start Y", 0),

    inDirBarrierX = op.inFloat("Barrier Dir X", 0),
    inDirBarrierY = op.inFloat("Barrier Dir Y", 0),

    inReset = op.inTriggerButton("Reset"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outDir = op.outNumber("Dir"),
    outColliding = op.outBoolNum("Colliding"),
    outInBarrier = op.outBoolNum("In Barrier"),
    outValuesChanged = op.outTrigger("Changed");

let lastTime = performance.now();
let dir = 0;
let canvas = null;

function getCanvasPixel(ctx, x, y)
{
    if (x < 0 || y < 15 || x != x || y != y || x == Infinity || y == Infinity || x > canvas.width * 2 || y > (canvas.height) - 15) return 1;

    let wc = Math.ceil(inCanvasTestSize.get() / 2) + 0.5;
    let wf = Math.floor(inCanvasTestSize.get() / 2);
    let w = Math.round(inCanvasTestSize.get() / 2);
    if (x < w || x > canvas.width - w) return 1;
    // y < w ||
    // || y > canvas.height - w

    let r = 0;

    if (
        x - wf < canvas.width &&
        y - wf < canvas.height &&
        x + wc < canvas.width &&
        y - wf < canvas.height &&
        x + wc < canvas.width &&
        y + wc < canvas.height &&
        x - wf < canvas.width &&
        y + wc < canvas.height
    )
    {
        r += ctx.getImageData(x - wf, y - wf, 1, 1).data[0];
        r += ctx.getImageData(x + wc, y - wf, 1, 1).data[0];
        r += ctx.getImageData(x + wc, y + wc, 1, 1).data[0];
        r += ctx.getImageData(x - wf, y + wc, 1, 1).data[0];
    }

    return r;
}

exe.onTriggered = function ()
{
    let ago = (performance.now() - lastTime) / 1000;
    let dx = 0;
    let dy = 0;
    if (goEast.get()) dx += ago * speed.get();
    if (goWest.get()) dx -= ago * speed.get();
    if (goNorth.get()) dy += ago * speed.get();
    if (goSouth.get()) dy -= ago * speed.get();

    if (goEast.get()) dir = 90;
    if (goWest.get()) dir = 270;
    if (goNorth.get()) dir = 0;
    if (goSouth.get()) dir = 180;

    // const oldPixelX = outX.get();
    // const oldPixelY = outY.get();

    let max = Math.max(Math.abs(dx), Math.abs(dy));

    // console.log(dx,dy,max);

    // if (max == 0)max = 1;
    max = Math.round(max);
    // console.log(max);
    const stepX = dx / max;
    const stepY = dy / max;

    if (max > 1000)max = 1000;

    let x = 0;
    let y = 0;

    // x=dx;
    // y=dy;

    for (let i = 0; i <= max; i++)
    {
        x += stepX;
        y += stepY;

        let newPosX = outX.get() + x;
        let newPosY = outY.get() + y;

        let isColliding = false;
        let isInBarrier = false;

        if (inCanvas.get())
        {
            canvas = inCanvas.get();
            let ctx = canvas.getContext("2d");

            if (getCanvasPixel(ctx, newPosX, newPosY))
            {
                if (true)
                {
                    newPosX = outX.get() + x;
                    newPosY = outY.get();
                }
                else
                {
                    newPosX = outX.get();
                    newPosY = outY.get() + y;
                }

                if (getCanvasPixel(ctx, newPosX, newPosY))
                {
                    if (true)
                    {
                        newPosX = outX.get();
                        newPosY = outY.get() + y;
                    }
                    else
                    {
                        newPosX = outX.get() + x;
                        newPosY = outY.get();
                    }

                    if (getCanvasPixel(ctx, newPosX, newPosY))
                    {
                        isColliding = true;
                        // all failed...
                        if (
                            getCanvasPixel(ctx, outX.get(), outY.get()) &&
                                getCanvasPixel(ctx, outX.get(), outY.get() + 1) &&
                                getCanvasPixel(ctx, outX.get(), outY.get() - 1) &&
                                getCanvasPixel(ctx, outX.get() + 1, outY.get()) &&
                                getCanvasPixel(ctx, outX.get() - 1, outY.get())
                        )
                        {
                            isInBarrier = true;
                            let ox = outX.get();
                            let oy = outY.get();

                            let dir = 1;
                            if (inDirBarrierY.get() < 0)dir = -1;

                            let found = false;
                            for (let i = 0; i < 400; i += 1)
                            {
                                newPosX = ox;
                                newPosY = oy + (i * dir);

                                // if (newPosY > 0 && newPosY < canvas.height-25)
                                {
                                    if (!getCanvasPixel(ctx, newPosX, newPosY))
                                    {
                                        found = true;
                                        // outX.set(newPosX);
                                        // outY.set(newPosY);
                                        console.log("newpos", newPosY);
                                        break;
                                    }
                                }
                            }

                            if (!found)
                            {
                                newPosX = ox;
                                newPosY = oy;
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

        outColliding.set(isColliding);
        outInBarrier.set(isInBarrier);

        outDir.set(dir);
        outX.set(newPosX);
        outY.set(newPosY);
        outValuesChanged.trigger();
    }

    lastTime = performance.now();
};

inReset.onTriggered = () =>
{
    outX.set(inStartX.get());
    outY.set(inStartY.get());
    dir = 0;
    outDir.set(dir);
};
