const
    inTrigger = op.inTrigger("Render"),
    inSize = op.inDropDown("Size", [32, 64, 128, 256, 512, 1024, 2048], 512),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    msaa = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none"),
    outTrigger = op.outTrigger("Next"),
    outTex = op.outTexture("cubemap");

const cgl = op.patch.cgl;

let sizeChanged = true;
let fb = null;

inSize.onChange = () => { sizeChanged = true; };

inPixelFormat.onChange = createFbLater;

let emptyCubemap = null;
let recreateFb = true;

function createFbLater()
{
    recreateFb = true;
}

function createFb()
{
    if (fb)fb.delete();

    let ms = true;
    let msSamples = 4;

    if (msaa.get() == "none")
    {
        msSamples = 0;
        ms = false;
    }
    if (msaa.get() == "2x") msSamples = 2;
    if (msaa.get() == "4x") msSamples = 4;
    if (msaa.get() == "8x") msSamples = 8;

    fb = new CGL.CubemapFramebuffer(
        cgl,
        Number(inSize.get()),
        Number(inSize.get()),
        {
            "pixelFormat": inPixelFormat.get(),
            "multisampling": ms,
            "multisamplingSamples": msSamples

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
