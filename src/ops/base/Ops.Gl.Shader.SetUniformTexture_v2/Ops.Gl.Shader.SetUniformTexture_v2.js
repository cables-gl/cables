const
    inRender = op.inTrigger("Render"),
    inUniName = op.inValueSelect("Uniform"),
    inTex = op.inTexture("Texture"),
    next = op.outTrigger("Next"),
    outFound = op.outBoolNum("Found");

let shader = null;
const cgl = op.patch.cgl;
let doSetupUniform = true;
let uniform = null;
let shaderLastCompile = -1;
let unis = [];
let old = null;

op.toWorkPortsNeedToBeLinked(inRender);

inRender.onTriggered = function ()
{
    if (cgl.getShader() && (shader != cgl.getShader() || shader.lastCompile != shaderLastCompile))
    {
        shader = cgl.getShader();
        setupShader();
        doSetupUniform = true;
    }

    if (doSetupUniform) setupUniform();

    if (uniform)
    {
        // old = shader.setUniformTexture(uniform, inTex.get());
    }
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;

    // console.log("uniformtexture");

    let oldIdx = -1;
    for (let i = 0; i < cgl.getShader()._textureStackUni.length; i++)
    {
        // console.log(i)
        const uni = cgl.getShader()._textureStackUni[i];

        // console.log(uni.name, uniform.name);
        if (uni.name == uniform.name)
        {
            oldIdx = i;
            old = cgl.getShader()._textureStackTexCgl[i];
            cgl.getShader()._textureStackTexCgl[i] = inTex.get();
        }

        // console.log(cgl.getShader()._textureStackTexCgl[i],cgl.getShader()._textureStackUni[i]);
    }

    next.trigger();

    if (uniform && old && oldIdx != -1) cgl.getShader()._textureStackTexCgl[oldIdx] = old;// shader.setUniformTexture(uniform, old);
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;
};

inUniName.onChange = function ()
{
    doSetupUniform = true;
    op.setUiAttrib({ "extendTitle": inUniName.get() });
};

function setupUniform()
{
    if (shader)
    {
        uniform = shader.getUniform((inUniName.get() || "").split(" ")[0]);
        doSetupUniform = false;

        if (!uniform)
        {
            op.setUiError("nouni", "uniform unknown", 1);// op.uiAttr({ "error": "uniform unknown. maybe shader changed" });
            outFound.set(false);
        }
        else
        {
            op.setUiError("nouni", null);
            outFound.set(true);
        }
    }
}

function setupShader()
{
    unis = shader.getUniforms();

    shaderLastCompile = shader.lastCompile;
    let names = [];

    for (let i = 0; i < unis.length; i++)
        if (unis[i].getType() == "t")
            names.push(unis[i].getName() + " (" + unis[i].getType() + ")");

    if (names.length === 0) names = ["none"];

    inUniName.setUiAttribs({ "values": names });
    op.refreshParams();
}
