const
    inRender = op.inTrigger("Render"),
    inSelect = op.inValueSelect("Uniform"),
    inValue = op.inValue("Value"),
    next = op.outTrigger("Next"),
    outType = op.outString("Type");

let shader = null;
const cgl = op.patch.cgl;
let doSetupUniform = true;
let uniform = null;
let shaderLastCompile = -1;
let unis = [];

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
        outType.set(uniform.getType());
        const oldValue = uniform.getValue();
        uniform.setValue(inValue.get());
        // console.log(uniform);
        next.trigger();
        uniform.setValue(oldValue);
    }
    else
    {
        next.trigger();
    }
};

inSelect.onChange = function ()
{
    doSetupUniform = true;
};

function setupUniform()
{
    if (shader)
    {
        uniform = shader.getUniform(inSelect.get());

        if (!uniform) op.uiAttr({ "error": "uniform unknown. maybe shader changed" });
        else op.uiAttr({ "error": null });

        doSetupUniform = false;
    }
}

function setupShader()
{
    unis = shader.getUniforms();

    shaderLastCompile = shader.lastCompile;
    const names = ["none"];

    for (let i = 0; i < unis.length; i++)
    {
        names.push(unis[i].getName());
        // console.log(unis[i]);
    }

    inSelect.setUiAttribs({ "values": names });
}
