const
    exec = op.inTrigger("Execute"),
    inSizeStrat = op.inSwitch("Size", ["First", "Single", "Manual"], "First"),
    inArrange = op.inSwitch("Arrangement", ["Columns", "Rows", "Grid", "Overlap X", "Overlap Y"], "Columns"),
    inFlipOrder = op.inBool("Flip Order", false),
    inWidth = op.inInt("Width", 256),
    inHeight = op.inInt("Height", 256),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture"),
    outColumns = op.outNumber("Columns"),
    outRows = op.outNumber("Rows");

const NUMTEXS = 16;
let uniNumRows = null;
let uniNumCols = null;

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
let currentWidth = 0;
let currentHeight = 0;

inSizeStrat.onChange = updateUi;

inFlipOrder.onChange =
inArrange.onChange =
inWidth.onChange =
    inHeight.onChange =
    tfilter.onChange =
    twrap.onChange = initShader;

updateUi();

function updateUi()
{
    inWidth.setUiAttribs({ "greyout": inSizeStrat.get() == "First" });
    inHeight.setUiAttribs({ "greyout": inSizeStrat.get() == "First" });
}

function getNumTextures()
{
    let count = 0;
    for (let i = 0; i < texPorts.length; i++)
    {
        if (texPorts[i].isLinked())count++;
    }
    return count;
}

function getNumTextureRows()
{
    if (inArrange.get() == "Grid") return Math.ceil(Math.sqrt(getNumTextures()));

    if (inArrange.get() == "Rows" ||
        inArrange.get() == "Overlap Y") return getNumTextures();
    return 1;
}

function getNumTextureColumns()
{
    if (inArrange.get() == "Grid") return Math.ceil(Math.sqrt(getNumTextures()));
    if (inArrange.get() == "Columns" ||
        inArrange.get() == "Overlap X") return getNumTextures();
    return 1;
}

function getHeight()
{
    let num = getNumTextureRows();

    outRows.set(num);

    if (inArrange.get() == "Overlap X")num = 1;
    if (inArrange.get() == "Overlap Y")num = 1;

    if (inSizeStrat.get() == "Manual") return inHeight.get();
    if (inSizeStrat.get() == "Single") return inHeight.get() * num;
    if (inSizeStrat.get() == "First")
    {
        if (texPorts[0].get())
            return texPorts[0].get().height * num;
    }

    return 64;
}

function getWidth()
{
    let num = getNumTextureColumns();

    outColumns.set(num);
    if (inArrange.get() == "Overlap X")num = 1;
    if (inArrange.get() == "Overlap Y")num = 1;

    if (inSizeStrat.get() == "Manual") return inWidth.get();
    if (inSizeStrat.get() == "Single") return inWidth.get() * num;
    if (inSizeStrat.get() == "First")
    {
        if (texPorts[0].get())
            return texPorts[0].get().width * num;
    }

    return 64;
}

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

    currentWidth = getWidth();
    currentHeight = getHeight();
    tc.setSize(currentWidth, currentHeight);

    for (let i = 0; i < NUMTEXS; i++)
        uniTextures.push(new CGL.Uniform(tc.bgShader, "t", "tex" + i, i));

    uniNumRows = new CGL.Uniform(tc.bgShader, "f", "numRows", 0);
    uniNumCols = new CGL.Uniform(tc.bgShader, "f", "numCols", 0);

    tc.bgShader.toggleDefine("FLIPORDER", inFlipOrder.get());
    tc.bgShader.toggleDefine("ARRANGE_COLS", inArrange.get() == "Columns");
    tc.bgShader.toggleDefine("ARRANGE_ROWS", inArrange.get() == "Rows");
    tc.bgShader.toggleDefine("ARRANGE_GRID", inArrange.get() == "Grid");
    tc.bgShader.toggleDefine("ARRANGE_OVERLAPX", inArrange.get() == "Overlap X");
    tc.bgShader.toggleDefine("ARRANGE_OVERLAPY", inArrange.get() == "Overlap Y");

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
    if (currentWidth != getWidth() || currentHeight != getHeight())
    {
        initShader();
    }

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

        uniNumRows.set(getNumTextureRows());
        uniNumCols.set(getNumTextureColumns());

        outTex.set(CGL.Texture.getEmptyTexture(cgl));
        outTex.set(tc.copy(CGL.Texture.getEmptyTexture(cgl)));

        needsUpdate = false;
    }

    next.trigger();
};
