const FIT_STRETCH = "Stretch";
const FIT_CONTAIN = "Contain";
const FIT_COVER = "Cover";

const
    inExec = op.inTrigger("Render"),
    inCanv = op.inObject("Canvas", null, "element"),
    inFullSrc = op.inBool("Full Source", false),
    inSx = op.inFloat("Source X", 0),
    inSy = op.inFloat("Source Y", 0),
    inSw = op.inFloat("Source W", 100),
    inSh = op.inFloat("Source H", 100),
    inFullDest = op.inBool("Full Destination", false),
    inFit = op.inSwitch("Fit", [FIT_STRETCH, FIT_CONTAIN, FIT_COVER], FIT_STRETCH),
    inDx = op.inFloat("Dest X", 0),
    inDy = op.inFloat("Dest Y", 0),
    inDw = op.inFloat("Dest W", 100),
    inDh = op.inFloat("Dest H", 100),
    inSmooth = op.inBool("Smooth", true),
    inShowDest = op.inBool("Show Destination", false),
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

// videos report their pixel size in videoWidth/videoHeight, their width/height attributes can be 0
function drawableWidth(drawable)
{
    return drawable.videoWidth || drawable.naturalWidth || drawable.width || 0;
}

function drawableHeight(drawable)
{
    return drawable.videoHeight || drawable.naturalHeight || drawable.height || 0;
}

// strokes the rectangle with the current stroke style so the line lies completely outside of it
function strokeOutside(ctx, x, y, w, h)
{
    const halfLine = ctx.lineWidth / 2;
    ctx.strokeRect(x - halfLine, y - halfLine, w + ctx.lineWidth, h + ctx.lineWidth);
}

function draw(compose, drawable)
{
    let sx = inSx.get();
    let sy = inSy.get();
    let sw = inSw.get();
    let sh = inSh.get();
    if (inFullSrc.get())
    {
        sx = 0;
        sy = 0;
        sw = drawableWidth(drawable);
        sh = drawableHeight(drawable);
    }

    let dx = inDx.get();
    let dy = inDy.get();
    let dw = inDw.get();
    let dh = inDh.get();
    if (inFullDest.get())
    {
        dx = 0;
        dy = 0;
        dw = compose.width || compose.canvas.width;
        dh = compose.height || compose.canvas.height;
    }

    if (dw <= 0 || dh <= 0) return;
    if (inShowDest.get()) strokeOutside(compose.ctx, dx, dy, dw, dh);
    if (sw <= 0 || sh <= 0) return;

    // contain: shrink the destination to the source aspect ratio, centered
    if (inFit.get() == FIT_CONTAIN)
    {
        const scale = Math.min(dw / sw, dh / sh);
        dx += (dw - sw * scale) / 2;
        dy += (dh - sh * scale) / 2;
        dw = sw * scale;
        dh = sh * scale;
    }

    // cover: crop the source to the destination aspect ratio, centered, so nothing is drawn outside the destination
    if (inFit.get() == FIT_COVER)
    {
        const scale = Math.max(dw / sw, dh / sh);
        const cropWidth = dw / scale;
        const cropHeight = dh / scale;
        sx += (sw - cropWidth) / 2;
        sy += (sh - cropHeight) / 2;
        sw = cropWidth;
        sh = cropHeight;
    }

    const ctx = compose.ctx;
    ctx.imageSmoothingEnabled = inSmooth.get();
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(drawable, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.imageSmoothingEnabled = false;
}

inExec.onTriggered = () =>
{
    const compose = op.patch.tempData.canvasCompose;
    if (!compose) return;

    const drawable = inCanv.get();
    if (drawable)
    {
        try { draw(compose, drawable); }
        catch (e) { op.logError(e); }
    }

    outNext.trigger();
};
