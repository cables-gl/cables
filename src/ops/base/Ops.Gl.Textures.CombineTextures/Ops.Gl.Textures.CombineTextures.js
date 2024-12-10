const
    exec = op.inTrigger("Execute"),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    inSize = op.inSwitch("Size", ["Biggest", "Smallest", "R", "G", "B", "A"], "Biggest"),

    inTexR = op.inTexture("R"),
    inSrcR = op.inSwitch("R Source", ["R", "G", "B", "A"], "R"),
    inSrcRVal = op.inSwitch("R Value", ["Source", "Invert"], "Source"),
    inSrcRDefault = op.inFloatSlider("R Default", 1),
    inTexG = op.inTexture("G"),
    inSrcG = op.inSwitch("G Source", ["R", "G", "B", "A"], "G"),
    inSrcGVal = op.inSwitch("G Value", ["Source", "Invert"], "Source"),
    inSrcGDefault = op.inFloatSlider("G Default", 1),
    inTexB = op.inTexture("B"),
    inSrcB = op.inSwitch("B Source", ["R", "G", "B", "A"], "B"),
    inSrcBVal = op.inSwitch("B Value", ["Source", "Invert"], "Source"),
    inSrcBDefault = op.inFloatSlider("B Default", 1),
    inTexA = op.inTexture("A"),
    inSrcA = op.inSwitch("A Source", ["R", "G", "B", "A"], "R"),
    inSrcAVal = op.inSwitch("A Value", ["Source", "Invert"], "Source"),
    inSrcADefault = op.inFloatSlider("A Default", 1),

    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture");

op.setPortGroup("Red", [inSrcRDefault, inTexR, inSrcR, inSrcRVal]);
op.setPortGroup("Green", [inSrcGDefault, inTexG, inSrcG, inSrcGVal]);
op.setPortGroup("Blue", [inSrcBDefault, inTexB, inSrcB, inSrcBVal]);
op.setPortGroup("Alpha", [inSrcADefault, inTexA, inSrcA, inSrcAVal]);

const cgl = op.patch.cgl;
let currentSize = [2, 2];
let needsUpdate = true;
let tc = null;
let unitexR, unitexG, unitexB, unitexA, uniFloatR, uniFloatG, uniFloatB, uniFloatA;

inSrcRDefault.onChange =
    inSrcGDefault.onChange =
    inSrcBDefault.onChange =
    inSrcADefault.onChange =
    inTexR.onChange =
    inTexG.onChange =
    inTexB.onChange =
    inPixel.onChange =
    inTexA.onChange = () =>
    {
        currentSize = getSize();

        needsUpdate = true;
    };

inTexR.onLinkChanged =
    inTexG.onLinkChanged =
    inTexB.onLinkChanged =
    inTexA.onLinkChanged =
    inSrcR.onChange =
    inSrcG.onChange =
    inSrcB.onChange =
    inSrcA.onChange =
    inSrcRVal.onChange =
    inSrcGVal.onChange =
    inSrcBVal.onChange =
    inSrcAVal.onChange = updateDefines;

inSize.onChange =
    tfilter.onChange =
    twrap.onChange = () => { tc = null; };

function getSize()
{
    let w = 4;
    let h = 4;
    let sizes = [];
    if (inSize.get() == "Biggest" || inSize.get() == "Smallest")
    {
        if (inTexR.get()) sizes.push([inTexR.get().width, inTexR.get().height, inTexR.get().width * inTexR.get().height]);
        if (inTexG.get()) sizes.push([inTexG.get().width, inTexG.get().height, inTexG.get().width * inTexG.get().height]);
        if (inTexB.get()) sizes.push([inTexB.get().width, inTexB.get().height, inTexB.get().width * inTexB.get().height]);
        if (inTexA.get()) sizes.push([inTexA.get().width, inTexA.get().height, inTexA.get().width * inTexA.get().height]);
    }

    if (inSize.get() == "Biggest")
    {
        let biggest = 0;

        for (let i = 0; i < sizes.length; i++)
        {
            if (sizes[i][2] > biggest)
            {
                w = sizes[i][0];
                h = sizes[i][1];
                biggest = sizes[i][2];
            }
        }
    }
    else if (inSize.get() == "Smallest")
    {
        let smallest = op.patch.cgl.gl.MAX_TEXTURE_SIZE + 1;

        for (let i = 0; i < sizes.length; i++)
        {
            if (sizes[i][2] < smallest)
            {
                w = sizes[i][0];
                h = sizes[i][1];
                smallest = sizes[i][2];
            }
        }
    }
    else if (inSize.get() == "R" && inTexR.get())
    {
        w = inTexR.get().width;
        h = inTexR.get().height;
    }
    else if (inSize.get() == "G" && inTexG.get())
    {
        w = inTexG.get().width;
        h = inTexG.get().height;
    }
    else if (inSize.get() == "B" && inTexB.get())
    {
        w = inTexB.get().width;
        h = inTexB.get().height;
    }
    else if (inSize.get() == "A" && inTexA.get())
    {
        w = inTexA.get().width;
        h = inTexA.get().height;
    }

    return [w, h];
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

    currentSize = getSize();

    tc = new CGL.CopyTexture(cgl, "combinetextures", {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": inPixel.get() == CGL.Texture.PFORMATSTR_RGBA32F,
        "filter": filter,
        "wrap": wrap,
        "width": currentSize[0],
        "height": currentSize[1]

    });

    unitexR = new CGL.Uniform(tc.bgShader, "t", "texR", 0);
    unitexG = new CGL.Uniform(tc.bgShader, "t", "texG", 1);
    unitexB = new CGL.Uniform(tc.bgShader, "t", "texB", 2);
    unitexA = new CGL.Uniform(tc.bgShader, "t", "texA", 3);

    uniFloatR = new CGL.Uniform(tc.bgShader, "f", "defaultR", inSrcRDefault);
    uniFloatG = new CGL.Uniform(tc.bgShader, "f", "defaultG", inSrcGDefault);
    uniFloatB = new CGL.Uniform(tc.bgShader, "f", "defaultB", inSrcBDefault);
    uniFloatA = new CGL.Uniform(tc.bgShader, "f", "defaultA", inSrcADefault);

    updateDefines();
    needsUpdate = true;
}

function updateDefines()
{
    if (!tc) return;

    inSrcR.setUiAttribs({ "greyout": !inTexR.isLinked() });
    inSrcG.setUiAttribs({ "greyout": !inTexG.isLinked() });
    inSrcB.setUiAttribs({ "greyout": !inTexB.isLinked() });
    inSrcA.setUiAttribs({ "greyout": !inTexA.isLinked() });

    inSrcRVal.setUiAttribs({ "greyout": !inTexR.isLinked() });
    inSrcGVal.setUiAttribs({ "greyout": !inTexG.isLinked() });
    inSrcBVal.setUiAttribs({ "greyout": !inTexB.isLinked() });
    inSrcAVal.setUiAttribs({ "greyout": !inTexA.isLinked() });

    inSrcRDefault.setUiAttribs({ "greyout": inTexR.isLinked() });
    inSrcGDefault.setUiAttribs({ "greyout": inTexG.isLinked() });
    inSrcBDefault.setUiAttribs({ "greyout": inTexB.isLinked() });
    inSrcADefault.setUiAttribs({ "greyout": inTexA.isLinked() });

    tc.bgShader.toggleDefine("R_SRC_R", inSrcR.get() == "R");
    tc.bgShader.toggleDefine("R_SRC_G", inSrcR.get() == "G");
    tc.bgShader.toggleDefine("R_SRC_B", inSrcR.get() == "B");
    tc.bgShader.toggleDefine("R_SRC_A", inSrcR.get() == "A");

    tc.bgShader.toggleDefine("G_SRC_R", inSrcG.get() == "R");
    tc.bgShader.toggleDefine("G_SRC_G", inSrcG.get() == "G");
    tc.bgShader.toggleDefine("G_SRC_B", inSrcG.get() == "B");
    tc.bgShader.toggleDefine("G_SRC_A", inSrcG.get() == "A");

    tc.bgShader.toggleDefine("B_SRC_R", inSrcB.get() == "R");
    tc.bgShader.toggleDefine("B_SRC_G", inSrcB.get() == "G");
    tc.bgShader.toggleDefine("B_SRC_B", inSrcB.get() == "B");
    tc.bgShader.toggleDefine("B_SRC_A", inSrcB.get() == "A");

    tc.bgShader.toggleDefine("A_SRC_R", inSrcA.get() == "R");
    tc.bgShader.toggleDefine("A_SRC_G", inSrcA.get() == "G");
    tc.bgShader.toggleDefine("A_SRC_B", inSrcA.get() == "B");
    tc.bgShader.toggleDefine("A_SRC_A", inSrcA.get() == "A");

    tc.bgShader.toggleDefine("INV_R", inSrcRVal.get() == "Invert");
    tc.bgShader.toggleDefine("INV_G", inSrcGVal.get() == "Invert");
    tc.bgShader.toggleDefine("INV_B", inSrcBVal.get() == "Invert");
    tc.bgShader.toggleDefine("INV_A", inSrcAVal.get() == "Invert");

    tc.bgShader.toggleDefine("HAS_R", inTexR.isLinked());
    tc.bgShader.toggleDefine("HAS_G", inTexG.isLinked());
    tc.bgShader.toggleDefine("HAS_B", inTexB.isLinked());
    tc.bgShader.toggleDefine("HAS_A", inTexA.isLinked());

    // if (currentSize[0] != size[0] || currentSize[1] != size[1])tc = null;

    needsUpdate = true;
}

exec.onTriggered = () =>
{
    if (!tc || needsUpdate && !op.patch.cgl.tempData.shadowPass)
    {
        if (!tc)initShader();
        tc.bgShader.popTextures();

        if (inTexR.get()) tc.bgShader.pushTexture(unitexR, inTexR.get().tex);
        else tc.bgShader.pushTexture(unitexR, CGL.Texture.getEmptyTexture(cgl).tex);
        if (inTexG.get()) tc.bgShader.pushTexture(unitexG, inTexG.get().tex);
        else tc.bgShader.pushTexture(unitexG, CGL.Texture.getEmptyTexture(cgl).tex);
        if (inTexB.get()) tc.bgShader.pushTexture(unitexB, inTexB.get().tex);
        else tc.bgShader.pushTexture(unitexB, CGL.Texture.getEmptyTexture(cgl).tex);
        if (inTexA.get()) tc.bgShader.pushTexture(unitexA, inTexA.get().tex);
        else tc.bgShader.pushTexture(unitexA, CGL.Texture.getEmptyTexture(cgl).tex);

        uniFloatR.setValue(inSrcRDefault.get());
        uniFloatG.setValue(inSrcGDefault.get());
        uniFloatB.setValue(inSrcBDefault.get());
        uniFloatA.setValue(inSrcADefault.get());

        tc.setSize(currentSize[0], currentSize[1]);

        // outTex.set(CGL.Texture.getEmptyTexture(cgl));
        outTex.setRef(tc.copy(inTexR.get() || inTexG.get() || inTexB.get() || inTexA.get() || CGL.Texture.getEmptyTexture(cgl)));

        needsUpdate = false;
    }

    next.trigger();
};
