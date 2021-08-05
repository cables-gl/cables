// inputs
const dataIn = op.inStringEditor("Base64 / Data URI", "");

// outputs
const textureOut = op.outTexture("Texture");
const loadingOut = op.outBool("Loading");

const image = new Image();
image.onload = function (e)
{
    op.patch.cgl.addNextFrameOnceCallback(() =>
    {
        const tex = CGL.Texture.createFromImage(op.patch.cgl, image, {});
        textureOut.set(tex);
        loadingOut.set(false);
    });
};

dataIn.onChange = () =>
{
    op.patch.cgl.addNextFrameOnceCallback(updateTex.bind(this));
};

function updateTex()
{
    loadingOut.set(true);
    let data = dataIn.get();
    if (data && !data.startsWith("data:"))
    {
        data = "data:;base64," + data;
    }
    image.src = data;
}
