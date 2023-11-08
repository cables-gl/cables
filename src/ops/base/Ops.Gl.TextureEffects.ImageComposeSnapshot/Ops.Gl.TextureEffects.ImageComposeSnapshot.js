const
    render = op.inTrigger("Update"),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Texture");

const cgl = op.patch.cgl;
let tc = new CGL.CopyTexture(cgl, "textureThief", {});
let pf = false;
let wrap = -1;
let filter = -1;

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const effect = cgl.currentTextureEffect;
    effect.endEffect();

    const shouldPf = cgl.currentTextureEffect.getCurrentSourceTexture().pixelFormat;
    const shouldWrap = cgl.currentTextureEffect.getCurrentSourceTexture().wrap;
    const shouldFilter = cgl.currentTextureEffect.getCurrentSourceTexture().filter;

    if (pf != shouldPf || wrap != shouldWrap || filter != shouldFilter)
    {
        tc = new CGL.CopyTexture(cgl, "textureThief",
            {
                "pixelFormat": cgl.currentTextureEffect.getCurrentSourceTexture().pixelFormat,
                "wrap": shouldWrap,
                "filter": shouldFilter
            });
        pf = shouldPf;
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
