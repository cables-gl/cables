const
    inRender = op.inTrigger("Render"),
    inSelect = op.inValueSelect("Uniform"),
    inValue = op.inTexture("Texture"),
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
        old = shader.setUniformTexture(uniform, inValue.get());
    }
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;

    next.trigger();

    if (uniform && old) shader.setUniformTexture(uniform, old);
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;
};

inSelect.onChange = function ()
{
    doSetupUniform = true;
    op.setUiAttrib({ "extendTitle": inSelect.get() });
};

function setupUniform()
{
    if (shader)
    {
        uniform = shader.getUniform((inSelect.get() || "").split(" ")[0]);
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
    const names = [];

    for (let i = 0; i < unis.length; i++)
        if (unis[i].getType() == "t")
            names.push(unis[i].getName() + " (" + unis[i].getType() + ")");

    if (names.length === 0) names = ["none"];

    inSelect.setUiAttribs({ "values": names });
    op.refreshParams();
}
