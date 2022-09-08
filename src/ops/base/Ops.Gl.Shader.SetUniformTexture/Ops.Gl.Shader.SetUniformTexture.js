const
    inRender = op.inTrigger("Render"),
    inSelect = op.inValueSelect("Uniform"),
    // inValue = op.inValue("Value"),
    inValue = op.inTexture("Texture"),
    next = op.outTrigger("Next"),
    outType = op.outString("Type");

let shader = null;
const cgl = op.patch.cgl;
let doSetupUniform = true;
let uniform = null;
let shaderLastCompile = -1;
let unis = [];
let old = null;

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
        // outType.set(uniform.getType());
        // const oldValue = uniform.getValue();

        // shader.pushTexture(uniform, inValue.get());

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
};

function setupUniform()
{
    if (shader)
    {
        uniform = shader.getUniform((inSelect.get() || "").split(" ")[0]);

        if (!uniform) op.setUiError("nouni", "uniform unknown", 1);// op.uiAttr({ "error": "uniform unknown. maybe shader changed" });
        else op.setUiError("nouni", null);

        doSetupUniform = false;
    }
}

function setupShader()
{
    unis = shader.getUniforms();

    shaderLastCompile = shader.lastCompile;
    const names = ["..."];

    for (let i = 0; i < unis.length; i++)
        if (unis[i].getType() == "t")
            names.push(unis[i].getName() + " (" + unis[i].getType() + ")");

    inSelect.setUiAttribs({ "values": names });
}
