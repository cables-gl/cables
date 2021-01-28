const
    inval=op.inTexture("Texture"),
    next=op.outTrigger("Changed"),
    outTex=op.outTexture("Result",CGL.Texture.getEmptyTexture(op.patch.cgl));

inval.onLinkChanged=
inval.onChange=function()
{
    outTex.set(inval.get()||CGL.Texture.getEmptyTexture(op.patch.cgl));
    next.trigger();
};