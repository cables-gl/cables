const
    render = op.inTrigger("Render"),
    trigger = op.outTrigger("Next"),
    useVPSize = op.inValueBool("use viewport size", true),
    width = op.inValueInt("texture width"),
    height = op.inValueInt("texture height"),
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

/// //////////////////////////////////////

let reInitFb = true;
let floatingPoint = false;
let fb = null;
let numSlots = 1;

render.onTriggered = doRender;
useVPSize.onChange = updateVpSize;

inWrap.onChange =
    inFilter.onChange =
    inPixelFormat.onChange =
    slots.onChange =
    clear.onChange =
    msaa.onChange = reInitLater;

updateVpSize();

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

function updateVpSize()
{
    if (useVPSize.get())
    {
        width.setUiAttribs({ "greyout": true });
        height.setUiAttribs({ "greyout": true });
    }
    else
    {
        width.setUiAttribs({ "greyout": false });
        height.setUiAttribs({ "greyout": false });
    }
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
    return (inPixelFormat.get() && inPixelFormat.get().isFloatingPoint && inPixelFormat.get().isFloatingPoint());
    // return CGL.Texture.isFloatingPoint(inPixelFormat.get());
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
                "pixelFormat": inPixelFormat.get(),
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
            else outTexPorts[i].set(null);
        }

        texDepth.setRef(fb.getTextureDepth());
        reInitFb = false;
    }

    if (useVPSize.get())
    {
        width.set(cgl.getViewPort()[2]);
        height.set(cgl.getViewPort()[3]);
    }

    if (fb.getWidth() != Math.ceil(width.get()) || fb.getHeight() != Math.ceil(height.get()))
    {
        fb.setSize(Math.max(1, width.get()), Math.max(1, height.get()));
    }

    fb.renderStart(cgl);
    cgl.tempData.forceShaderMods = cgl.tempData.forceShaderMods || [];
    cgl.tempData.forceShaderMods.push(mod);

    cgl.tempData.objectIdCounter = 0;

    trigger.trigger();

    cgl.tempData.forceShaderMods.pop();
    // mod.unbind();

    fb.renderEnd(cgl);

    cgl.resetViewPort();
}
