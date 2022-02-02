const
    exec = op.inTrigger("Execute"),

    inTexR = op.inTexture("R"),
    inSrcR=op.inSwitch("R Source",['R','G','B','A'],'R'),
    inTexG = op.inTexture("G"),
    inSrcG=op.inSwitch("G Source",['R','G','B','A'],'R'),
    inTexB = op.inTexture("B"),
    inSrcB=op.inSwitch("B Source",['R','G','B','A'],'R'),
    inTexA = op.inTexture("A"),
    inSrcA=op.inSwitch("A Source",['R','G','B','A'],'R'),

    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("Texture");

const tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true
    });

const unitexR = new CGL.Uniform(tc.bgShader, "t", "texR", 0);
const unitexG = new CGL.Uniform(tc.bgShader, "t", "texG", 1);
const unitexB = new CGL.Uniform(tc.bgShader, "t", "texB", 2);
const unitexA = new CGL.Uniform(tc.bgShader, "t", "texA", 3);


inTexR.onLinkChanged=
inTexG.onLinkChanged=
inTexB.onLinkChanged=
inTexA.onLinkChanged=
inSrcR.onChange=
inSrcG.onChange=
inSrcB.onChange=
inSrcA.onChange=updateDefines;

updateDefines();

function updateDefines()
{
    inSrcR.setUiAttribs({greyout:!inTexR.isLinked()});
    inSrcG.setUiAttribs({greyout:!inTexG.isLinked()});
    inSrcB.setUiAttribs({greyout:!inTexB.isLinked()});
    inSrcA.setUiAttribs({greyout:!inTexA.isLinked()});

    tc.bgShader.toggleDefine("R_SRC_R",inSrcR.get()=="R");
    tc.bgShader.toggleDefine("R_SRC_G",inSrcR.get()=="G");
    tc.bgShader.toggleDefine("R_SRC_B",inSrcR.get()=="B");
    tc.bgShader.toggleDefine("R_SRC_A",inSrcR.get()=="A");

    tc.bgShader.toggleDefine("G_SRC_R",inSrcG.get()=="R");
    tc.bgShader.toggleDefine("G_SRC_G",inSrcG.get()=="G");
    tc.bgShader.toggleDefine("G_SRC_B",inSrcG.get()=="B");
    tc.bgShader.toggleDefine("G_SRC_A",inSrcG.get()=="A");

    tc.bgShader.toggleDefine("B_SRC_R",inSrcB.get()=="R");
    tc.bgShader.toggleDefine("B_SRC_G",inSrcB.get()=="G");
    tc.bgShader.toggleDefine("B_SRC_B",inSrcB.get()=="B");
    tc.bgShader.toggleDefine("B_SRC_A",inSrcB.get()=="A");

    tc.bgShader.toggleDefine("A_SRC_R",inSrcA.get()=="R");
    tc.bgShader.toggleDefine("A_SRC_G",inSrcA.get()=="G");
    tc.bgShader.toggleDefine("A_SRC_B",inSrcA.get()=="B");
    tc.bgShader.toggleDefine("A_SRC_A",inSrcA.get()=="A");

    tc.bgShader.toggleDefine("HAS_R",inTexR.isLinked());
    tc.bgShader.toggleDefine("HAS_G",inTexG.isLinked());
    tc.bgShader.toggleDefine("HAS_B",inTexB.isLinked());
    tc.bgShader.toggleDefine("HAS_A",inTexA.isLinked());
}

exec.onTriggered = () =>
{
    if (!inTexR.get()) return;

    tc.bgShader.popTextures();

    if (inTexR.get()) tc.bgShader.pushTexture(unitexR, inTexR.get().tex);
    if (inTexG.get()) tc.bgShader.pushTexture(unitexG, inTexG.get().tex);
    if (inTexB.get()) tc.bgShader.pushTexture(unitexB, inTexB.get().tex);
    if (inTexA.get()) tc.bgShader.pushTexture(unitexA, inTexA.get().tex);


    outFpTex.set(null);
    outFpTex.set(tc.copy(inTexR.get()));

    next.trigger();
};
