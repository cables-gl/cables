const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("Depth Texture"),

    inRadius = op.inFloat("Radius", 10),
    inMaxDist = op.inFloat("Max Dist", 0.05),
    inBegin = op.inFloat("Begin", 0.00001),
    inEnd = op.inFloat("End", 0.0003),

    inStrength = op.inFloatSlider("Strength", 1),
    inBase = op.inFloatSlider("Base", 0.4),

    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    next = op.outTrigger("Next"),
    outTex = op.outTexture("SSAO");

op.setPortGroup("Strength", [inBase, inStrength]);
op.setPortGroup("SSAO", [inRadius, inMaxDist]);

let tc = null;

tfilter.onChange = init;
init();

function init()
{
    let wrap = CGL.Texture.WRAP_REPEAT;
    let filter = CGL.Texture.FILTER_NEAREST;

    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;
    if (tfilter.get() == "nearest") filter = CGL.Texture.FILTER_NEAREST;

    if (tc)tc.dispose();
    tc = new CGL.CopyTexture(op.patch.cgl, "ssao3",
        {
            "shader": attachments.ssao_frag,
            "isFloatingPointTexture": false,
            "filter": filter,
            "wrap": wrap
        });

    new CGL.Uniform(tc.bgShader, "f", "radius", inRadius);
    new CGL.Uniform(tc.bgShader, "f", "strength", inStrength);
    new CGL.Uniform(tc.bgShader, "f", "base", inBase);
    new CGL.Uniform(tc.bgShader, "f", "maxDist", inMaxDist);
    new CGL.Uniform(tc.bgShader, "f", "area", inEnd);
    new CGL.Uniform(tc.bgShader, "f", "foff", inBegin);
}

outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

exec.onTriggered = () =>
{
    if (!inTex.get()) return outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

    // outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outTex.setRef(tc.copy(inTex.get()));

    next.trigger();
};
