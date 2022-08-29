const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("Render");
const outTrigger = op.outTrigger("Next");
const outTex = op.outTexture("cubemap");

const inSize = op.inDropDown("Size", [32, 64, 128, 256, 512, 1024, 2048], 512);
let sizeChanged = true;
inSize.onChange = () => sizeChanged = true;

const fb = new CGL.CubemapFramebuffer(cgl, Number(inSize.get()), Number(inSize.get()),
    {
        "isFloatingPointTexture": true
    });
console.log(fb);

inTrigger.onTriggered = function ()
{
    if (sizeChanged)
    {
        if (fb) fb.setSize(Number(inSize.get()), Number(inSize.get()));
        sizeChanged = false;
    }

    if (fb)
    {
        fb.renderStart();
        for (let i = 0; i < 6; i += 1)
        {
            fb.renderStartCubemapFace(i);
            outTrigger.trigger();
            fb.renderEndCubemapFace();
        }
        fb.renderEnd();
        outTex.set(fb.getTextureColor());
    }
    else outTrigger.trigger();
};
