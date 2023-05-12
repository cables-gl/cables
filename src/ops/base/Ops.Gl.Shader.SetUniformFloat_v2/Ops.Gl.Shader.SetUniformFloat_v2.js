// should be called setuniformfloat ?

const
    inRender = op.inTrigger("Render"),
    inSelect = op.inValueSelect("Uniform"),
    inX = op.inValue("X", 1),
    inY = op.inValue("Y", 1),
    inZ = op.inValue("Z", 1),
    inW = op.inValue("W", 1),
    next = op.outTrigger("Next"),
    outType = op.outString("Type"),
    outFound = op.outBoolNum("Found");

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

        uniform.setValue([inX.get(), inY.get(), inZ.get(), inW.get()]);

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
    op.setUiAttrib({ "extendTitle": inSelect.get() });
};

function setupUniform()
{
    if (shader)
    {
        uniform = shader.getUniform((inSelect.get() || "").split(" ")[0]);

        if (uniform)
        {
            inY.setUiAttribs({ "greyout": uniform.getType() == "f" });
            inZ.setUiAttribs({ "greyout": uniform.getType() == "f" || uniform.getType() == "2f" });
            inW.setUiAttribs({ "greyout": uniform.getType() == "f" || uniform.getType() == "2f" || uniform.getType() == "3f" });
        }

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
    const names = ["..."];

    for (let i = 0; i < unis.length; i++)
    {
        if (unis[i].getType() == "f" || unis[i].getType() == "2f" || unis[i].getType() == "3f" || unis[i].getType() == "4f")
            names.push(unis[i].getName() + " (" + unis[i].getType() + ")");
    }

    inSelect.setUiAttribs({ "values": names });
}
