const
    inExec = op.inTrigger("Render"),
    inCanv = op.inObject("Canvas", null, "element"),
    inFullSrc = op.inBool("Full Source", false),
    inSx = op.inFloat("Source X", 0),
    inSy = op.inFloat("Source Y", 0),
    inSw = op.inFloat("Source W", 100),
    inSh = op.inFloat("Source H", 100),
    inFullDest = op.inBool("Full Destination", false),
    inDx = op.inFloat("Dest X", 0),
    inDy = op.inFloat("Dest Y", 0),
    inDw = op.inFloat("Dest W", 100),
    inDh = op.inFloat("Dest H", 100),
    inSmooth = op.inBool("Smooth", true),
    outNext = op.outTrigger("Next");

inFullSrc.onChange =
    inFullDest.onChange = updateUi;

function updateUi()
{
    inSw.setUiAttribs({ "greyout": inFullSrc.get() });
    inSh.setUiAttribs({ "greyout": inFullSrc.get() });
    inSx.setUiAttribs({ "greyout": inFullSrc.get() });
    inSy.setUiAttribs({ "greyout": inFullSrc.get() });
    inDw.setUiAttribs({ "greyout": inFullDest.get() });
    inDh.setUiAttribs({ "greyout": inFullDest.get() });
    inDx.setUiAttribs({ "greyout": inFullDest.get() });
    inDy.setUiAttribs({ "greyout": inFullDest.get() });
}

inExec.onTriggered = () =>
{
    if (op.patch.tempData.canvasCompose)
    {
        const ctx = op.patch.tempData.canvasCompose.ctx;

        if (inCanv.isLinked())
            try
            {
                let
                    sx = inSx.get(),
                    sy = inSy.get(),
                    dx = inDx.get(),
                    dy = inDy.get(),
                    sw = inSw.get(),
                    sh = inSh.get(),
                    dw = inDw.get(),
                    dh = inDh.get();

                if (inFullDest.get()) dw = (op.patch.tempData.canvasCompose.width || op.patch.tempData.canvasCompose.canvas.width);
                const drawable = inCanv.get();

                if (drawable)
                {
                    if (inFullDest.get())
                    {
                        dx = 0;
                        dy = 0;
                        dw = (op.patch.tempData.canvasCompose.width || op.patch.tempData.canvasCompose.canvas.width);
                        dh = (op.patch.tempData.canvasCompose.height || op.patch.tempData.canvasCompose.canvas.height);
                    }
                    if (inFullSrc.get())
                    {
                        sx = 0;
                        sy = 0;
                        sw = drawable.width;
                        sh = drawable.height;
                    }

                    ctx.imageSmoothingEnabled = !!inSmooth.get();
                    ctx.imageSmoothingQuality = "low";
                    ctx.drawImage(drawable, sx, sy, sw, sh, dx, dy, dw, dh);
                    ctx.imageSmoothingEnabled = false;
                }
            }
            catch (e) { console.log(e); }

        outNext.trigger();
    }
};
