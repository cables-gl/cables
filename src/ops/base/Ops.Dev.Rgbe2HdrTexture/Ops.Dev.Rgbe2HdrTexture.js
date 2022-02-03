const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Textiure");

const tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true
    });

exec.onTriggered = () =>
{
    if (!inTex.get()) return;

    outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outFpTex.set(tc.copy(inTex.get()));
};
