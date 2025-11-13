const
    inExec = op.inTrigger("Render"),
    inCanv = op.inObject("Canvas", null, "element"),
    inSmooth = op.inBool("Smooth", true),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    if (inCanv.isLinked())
        try
        {
            const destCanv = inCanv.get();
            const ctx = destCanv.getContext("2d");
            let x = 0;
            let y = 0;

            const glCanvas = op.patch.cgl.canvas;

            if (glCanvas)
            {
                ctx.imageSmoothingEnabled = !!inSmooth.get();
                ctx.imageSmoothingQuality = "high";
                // console.log("texti", destCanv.width, destCanv.height);
                ctx.drawImage(glCanvas,
                    0, 0,
                    glCanvas.width, glCanvas.height,
                    0, 0,
                    destCanv.width, destCanv.height
                );

                ctx.imageSmoothingEnabled = true;
            }
        }
        catch (e) { console.log(e); }

    outNext.trigger();
};
