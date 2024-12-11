const
    exec = op.inTrigger("Execute"),
    inWidth = op.inInt("Width", 1024),
    inHeight = op.inInt("Height", 256),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture");

const NUMTEXS = 16;
let uniNumTex = null;

const texPorts = [];
for (let i = 0; i < NUMTEXS; i++)
{
    const t = op.inTexture("Texture " + i);
    t.onLinkChanged = updateDefines;
    t.onChange = () =>
    {
        needsUpdate = true;
    };

    texPorts.push(t);
}

const cgl = op.patch.cgl;
let needsUpdate = true;
let tc = null;
let uniTextures = [];

inWidth.onChange =
    inHeight.onChange =
    tfilter.onChange =
    twrap.onChange = initShader;

function initShader()
{
    let wrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (twrap.get() == "clamp to edge") wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    if (tc)tc.dispose();
    tc = new CGL.CopyTexture(cgl, "combinetextures", {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": CGL.Texture.isPixelFormatFloat(inPixel.get()),
        "pixelFormat": inPixel.get(),
        "filter": filter,
        "wrap": wrap
    });

    tc.setSize(inWidth.get(), inHeight.get());

    for (let i = 0; i < NUMTEXS; i++)
        uniTextures.push(new CGL.Uniform(tc.bgShader, "t", "tex" + i, i));

    uniNumTex = new CGL.Uniform(tc.bgShader, "f", "numTex", 0);

    updateDefines();
    needsUpdate = true;
}

function updateDefines()
{
    if (!tc) return;

    needsUpdate = true;
}

let num = 0;

exec.onTriggered = () =>
{
    if (needsUpdate && !op.patch.cgl.tempData.shadowPass)
    {
        if (!tc)initShader();
        tc.bgShader.popTextures();

        for (let i = 0; i < texPorts.length; i++)
        {
            if (texPorts[i].get())
            {
                tc.bgShader.pushTexture(uniTextures[i], texPorts[i].get().tex);
                num = i;
            }
            else tc.bgShader.pushTexture(uniTextures[i], CGL.Texture.getEmptyTexture(cgl).tex);
        }

        uniNumTex.set(num + 1);

        outTex.set(CGL.Texture.getEmptyTexture(cgl));
        outTex.set(tc.copy(CGL.Texture.getEmptyTexture(cgl)));

        needsUpdate = false;
    }

    next.trigger();
};
