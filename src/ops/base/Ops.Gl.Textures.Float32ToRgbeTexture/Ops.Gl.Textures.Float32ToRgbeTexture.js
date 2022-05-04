const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("Texture 32bit"),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("Texture RGBE"),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat");

let tc = null;

twrap.onChange =
    tfilter.onChange = init;
init();

function init()
{
    let wrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (twrap.get() == "clamp to edge") wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    if (tc)tc.dispose();
    tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
        {
            "shader": attachments.rgbe2fp_frag,
            "isFloatingPointTexture": false,
            "filter": filter,
            "wrap": wrap
        });
}

outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

exec.onTriggered = () =>
{
    if (!inTex.get()) return;

    outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

    op.patch.cgl.pushBlend(false);

    outFpTex.set(tc.copy(inTex.get()));

    op.patch.cgl.popBlend();

    next.trigger();
};
