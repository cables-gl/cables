const
    render = op.inTrigger("Update"),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Texture");

const cgl = op.patch.cgl;
let tc = new CGL.CopyTexture(cgl, "textureThief", {});
let fp = false;
let wrap = -1;
let filter = -1;

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const effect = cgl.currentTextureEffect;
    effect.endEffect();

    const shouldFp = cgl.currentTextureEffect.getCurrentSourceTexture().isFloatingPoint();
    const shouldWrap = cgl.currentTextureEffect.getCurrentSourceTexture().wrap;
    const shouldFilter = cgl.currentTextureEffect.getCurrentSourceTexture().filter;

    if (fp != shouldFp || wrap != shouldWrap || filter != shouldFilter)
    {
        tc = new CGL.CopyTexture(cgl, "textureThief",
            {
                "isFloatingPointTexture": shouldFp,
                "wrap": shouldWrap,
                "filter": shouldFilter
            });
        fp = shouldFp;
        wrap = shouldWrap;
        filter = shouldFilter;
    }

    const vp = cgl.getViewPort();
    outTex.set(CGL.Texture.getEmptyTexture(cgl));

    const tx = cgl.currentTextureEffect.getCurrentSourceTexture();
    outTex.set(tc.copy(tx));

    effect.continueEffect();

    trigger.trigger();
};
