const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Textiure");

const tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST
    });

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
