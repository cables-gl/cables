const
    inTrigger = op.inTrigger("Render"),
    inFp = op.inBool("32bit float tex", false),
    outTrigger = op.outTrigger("Next"),
    outTex = op.outTexture("cubemap");

const cgl = op.patch.cgl;

const inSize = op.inDropDown("Size", [32, 64, 128, 256, 512, 1024, 2048], 512);
let sizeChanged = true;
inSize.onChange = () => { sizeChanged = true; };

let fb = null;

inFp.onChange = createFbLater;

let emptyCubemap = null;
let recreateFb = true;

function createFbLater()
{
    recreateFb = true;
}

function createFb()
{
    if (fb)fb.delete();
    fb = new CGL.CubemapFramebuffer(
        cgl,
        Number(inSize.get()),
        Number(inSize.get()),
        {
            "isFloatingPointTexture": inFp.get()
        });
}

inTrigger.onTriggered = function ()
{
    if (recreateFb)createFb();
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
        if (!emptyCubemap)emptyCubemap = CGL.Texture.getEmptyCubemapTexture(cgl);
        outTex.set(emptyCubemap);
        outTex.set(fb.getTextureColor());
    }
    else outTrigger.trigger();
};
