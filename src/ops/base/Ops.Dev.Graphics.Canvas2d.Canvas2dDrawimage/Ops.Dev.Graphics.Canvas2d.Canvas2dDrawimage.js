const
    inExec = op.inTrigger("Render"),
    inCanv = op.inObject("Canvas", null, "element"),
    inCenter = op.inBool("Center", false),
    inSmooth = op.inBool("Smooth", true),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        if (inCanv.isLinked())
            try
            {
                let x = 0;
                let y = 0;

                const drawable = inCanv.get();

                if (drawable)
                {
                    if (inCenter.get())
                    {
                        x = -drawable.width / 2;
                        y = -drawable.height / 2;
                    }

                    ctx.imageSmoothingEnabled = !!inSmooth.get();
                    ctx.imageSmoothingQuality = "low";

                    ctx.drawImage(drawable, x, y);

                    ctx.imageSmoothingEnabled = false;
                }
            }
            catch (e) { console.log(e); }

        outNext.trigger();
    }
};
