const
    dataIn = op.inStringEditor("Base64 / Data URI", ""),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    textureOut = op.outTexture("Texture"),
    loadingOut = op.outBool("Loading");

const image = new Image();

let doUpdateTex = false;
let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
let selectedFilter = CGL.Texture.FILTER_LINEAR;

function createTex()
{
    const tex = CGL.Texture.createFromImage(op.patch.cgl, image,
        {
            "filter": selectedFilter,
            "wrap": selectedWrap,
            "unpackAlpha": unpackAlpha.get(),
            "anisotropic": parseFloat(aniso.get())

        });
    textureOut.set(tex);
    loadingOut.set(false);
}

image.onload = function (e)
{
    op.patch.cgl.addNextFrameOnceCallback(createTex.bind(this));
};

aniso.onChange =
unpackAlpha.onChange =
dataIn.onChange = () =>
{
    updateTex();
};

twrap.onChange =
    tfilter.onChange = () =>
    {
        if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
        else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
        else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

        if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
        else if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
        else if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

        updateTex();
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
