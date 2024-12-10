const
    render = op.inTrigger("Render"),
    trigger = op.outTrigger("Next"),
    inSize = op.inSwitch("Size", ["Canvas", "Manual"], "Canvas"),
    width = op.inValueInt("texture width"),
    height = op.inValueInt("texture height"),
    aspect = op.inBool("Auto Aspect", true),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA32F),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    msaa = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none"),
    clear = op.inValueBool("Clear", true),
    slots = op.inSwitch("Slots", ["1", "2", "3", "4", "5", "6", "7", "8"], "1");

let slotPorts = [];
let outTexPorts = [];
const NUM_BUFFERS = 8;
const cgl = op.patch.cgl;
const rt = new CGL.RenderTargets(cgl);
const mod = rt.mod;
const defaultShader = new CGL.Shader(cgl, "MinimalMaterial");

op.toWorkPortsNeedToBeLinked(render);

for (let i = 0; i < NUM_BUFFERS; i++)
{
    let slot = "Default";
    if (i != 0)slot = "Default";
    const p = op.inDropDown("Texture " + i, rt.getTypes(), slot);
    p.onChange = updateDefines;
    slotPorts.push(p);

    const outTexPort = op.outTexture("Result Texture " + i);
    outTexPorts.push(outTexPort);
}

const texDepth = op.outTexture("textureDepth");

/// ////////////////////////////////////////

let reInitFb = true;
let floatingPoint = false;
let fb = null;
let numSlots = 1;

render.onTriggered = doRender;
inSize.onChange = updateUi;

inWrap.onChange =
    inFilter.onChange =
    inPixelFormat.onChange =
    slots.onChange =
    clear.onChange =
    msaa.onChange = reInitLater;

updateUi();

function updateDefines()
{
    let types = [];
    for (let i = 0; i < numSlots; i++)
    {
        types.push(slotPorts[i].get());
    }

    rt.update(types);

    op.setUiAttrib({ "extendTitle": rt.asString });

    reInitFb = true;
}

function updateUi()
{
    width.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
    height.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
    aspect.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
}

function reInitLater()
{
    reInitFb = true;
}

function getFilter()
{
    if (inFilter.get() == "nearest") return CGL.Texture.FILTER_NEAREST;
    else if (inFilter.get() == "linear") return CGL.Texture.FILTER_LINEAR;
    else if (inFilter.get() == "mipmap") return CGL.Texture.FILTER_MIPMAP;
}

function getWrap()
{
    if (inWrap.get() == "repeat") return CGL.Texture.WRAP_REPEAT;
    else if (inWrap.get() == "mirrored repeat") return CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (inWrap.get() == "clamp to edge") return CGL.Texture.WRAP_CLAMP_TO_EDGE;
}

function isFloatingPoint()
{
    return CGL.Texture.isPixelFormatFloat(inPixelFormat.get());
}

function doRender()
{
    if (!fb || reInitFb)
    {
        numSlots = parseInt(slots.get());
        updateDefines();

        for (let i = 0; i < NUM_BUFFERS; i++) slotPorts[i].setUiAttribs({ "greyout": i > numSlots - 1 });

        if (fb) fb.delete();

        floatingPoint = isFloatingPoint();

        if (cgl.glVersion >= 2)
        {
            let ms = true;
            let msSamples = 4;

            if (msaa.get() == "none")
            {
                msSamples = 0;
                ms = false;
            }
            if (msaa.get() == "2x")msSamples = 2;
            if (msaa.get() == "4x")msSamples = 4;
            if (msaa.get() == "8x")msSamples = 8;

            fb = new CGL.Framebuffer2(cgl, 8, 8, {
                "numRenderBuffers": numSlots,
                "isFloatingPointTexture": floatingPoint,
                "multisampling": ms,
                "depth": true,
                "multisamplingSamples": msSamples,
                "wrap": getWrap(),
                "filter": getFilter(),
                "clear": clear.get()
            });
        }
        else
        {
            fb = new CGL.Framebuffer(cgl, 8, 8, { "isFloatingPointTexture": floatingPoint });
        }

        for (let i = 0; i < NUM_BUFFERS; i++)
        {
            if (i <= numSlots) outTexPorts[i].setRef(fb.getTextureColorNum(i));
            else outTexPorts[i].setRef(CGL.Texture.getEmptyTexture(cgl));
        }

        texDepth.setRef(fb.getTextureDepth());
        reInitFb = false;
    }

    let setAspect = aspect.get();

    if (inSize.get() == "Canvas")
    {
        setAspect = true;
        width.set(cgl.canvasWidth);
        height.set(cgl.canvasHeight);
    }

    // fb.clear(2, [1, 1, 1, 1]);

    if (fb.getWidth() != Math.ceil(width.get()) || fb.getHeight() != Math.ceil(height.get())) fb.setSize(width.get(), height.get());

    fb.renderStart(cgl);

    // fb.clearColors[2] = [0, 0, 1, 1];
    // fb.clear();

    cgl.tempData.forceShaderMods = cgl.tempData.forceShaderMods || [];
    cgl.tempData.forceShaderMods.push(mod);

    cgl.tempData.objectIdCounter = 0;

    cgl.pushShader(defaultShader);
    cgl.pushViewPort(0, 0, width.get(), height.get());

    trigger.trigger();

    cgl.popViewPort();

    cgl.popShader();

    cgl.tempData.forceShaderMods.pop();
    // mod.unbind();

    fb.renderEnd(cgl);

    for (let i = 0; i < NUM_BUFFERS; i++)
        if (i <= numSlots)
            outTexPorts[i].setRef(fb.getTextureColorNum(i));

    texDepth.setRef(fb.getTextureDepth());

    cgl.resetViewPort();
}
