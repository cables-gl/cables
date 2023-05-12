const
    inRender = op.inTrigger("Render"),
    inSelect = op.inValueSelect("Uniform"),
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
        old = shader.setUniformTexture(uniform, inValue.get());

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

        if (!uniform) op.setUiError("nouni", "uniform unknown", 1);
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
