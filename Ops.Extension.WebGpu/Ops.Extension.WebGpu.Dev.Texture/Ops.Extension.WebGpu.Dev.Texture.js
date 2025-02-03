const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    inFilter = op.inSwitch("Filter", ["nearest", "linear"], "nearest"),
    inWrap = op.inValueSelect("Wrap", ["repeat", "mirror-repeat", "clamp-to-edge"], "repeat"),
    result = op.outTexture("Texture"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outpixel = op.outNumber("Pixelformat");

let needsReload = false;
let loadingId = null;
let tex = null;

new CABLES.WebGpuOp(op);

filename.onChange = () =>
{
    needsReload = true;

    op.patch.cgp.addNextFrameOnceCallback(() =>
    {
        if (loadingId)loadingId = op.patch.loading.finished(loadingId);

        loadingId = op.patch.loading.start(op.objName, filename.get(), op);

        needsReload = false;

        CGP.Texture.load(op.patch.cgp, filename.get(), (t) =>
        {
            if (tex) tex.dispose();

            tex = t;
            tex.setFilter(inFilter.get());
            tex.setWrap(inWrap.get());
            result.setRef(t);
            outWidth.set(tex.width);
            outHeight.set(tex.height);
            if (loadingId)loadingId = op.patch.loading.finished(loadingId);
        });
    });
};

inFilter.onChange =
    inWrap.onChange = () =>
    {
        if (tex)
        {
            tex.setFilter(inFilter.get());
            tex.setWrap(inWrap.get());
            result.setRef(tex);
        }
    };
