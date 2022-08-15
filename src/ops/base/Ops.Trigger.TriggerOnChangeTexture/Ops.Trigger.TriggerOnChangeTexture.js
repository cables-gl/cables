const
    inval = op.inTexture("Texture"),
    inFilter = op.inBool("Ignore empty/default Texture", false),
    next = op.outTrigger("Changed"),
    outTex = op.outTexture("Result", CGL.Texture.getEmptyTexture(op.patch.cgl));

inval.onLinkChanged =
inval.onChange = function ()
{
    const v = inval.get();
    if (inFilter.get() && (v == CGL.Texture.getEmptyTexture(op.patch.cgl) || v == null)) return;

    outTex.set(v || CGL.Texture.getEmptyTexture(op.patch.cgl));
    next.trigger();
};
