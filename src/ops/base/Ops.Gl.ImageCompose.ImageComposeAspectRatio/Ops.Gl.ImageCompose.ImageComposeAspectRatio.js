const
    inUpdate = op.inTrigger("Update"),
    inAspect = op.inFloat("Aspect", 1),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let prev = 1;

inUpdate.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (cgl.currentTextureEffect)
    {
        prev = cgl.currentTextureEffect.aspectRatio;
        cgl.currentTextureEffect.aspectRatio = inAspect.get();

        next.trigger();

        cgl.currentTextureEffect.aspectRatio = prev;
    }
};
