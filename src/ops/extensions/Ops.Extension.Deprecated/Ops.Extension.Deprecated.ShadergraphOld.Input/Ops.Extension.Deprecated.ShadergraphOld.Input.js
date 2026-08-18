const
    inName = op.inString("Name", ""),
    inGenType = op.inSwitch("GenType", ["float", "vec2", "vec3", "vec4"], "vec4"),
    uni1 = op.inFloat("Number X", 0),
    uni2 = op.inFloat("Number Y", 0),
    uni3 = op.inFloat("Number Z", 0),
    uni4 = op.inFloat("Number W", 1),
    inType = op.inSwitch("Type", ["Auto", "Uniform", "Static"], "Auto"),
    result = op.outObject("Result", null, "sg_vec4"),
    outUni = op.outBoolNum("Using Uniform");

inType.setUiAttribs({ "hidePort": true });

const sgOp = new CGL.ShaderGraphOpCgl(this);
let hasDynamicPorts = false;

inName.onChange =
    inType.onChange = updateUniDefs;

inGenType.onChange = () =>
{
    updateUi();
    updateUniDefs();
};

inType.onLinkChanged =
    uni1.onLinkChanged =
    uni2.onLinkChanged =
    uni3.onLinkChanged =
    uni4.onLinkChanged = () =>
    {
        hasDynamicPorts = uni1.isLinked() || uni2.isLinked() || uni3.isLinked() || uni4.isLinked();
        updateUniDefs();
    };

uni1.onChange =
    uni2.onChange =
    uni3.onChange =
    uni4.onChange = () =>
    {
        if (!shouldUseUniforms()) sgOp.updateGraph();
    };

updateUniDefs();
updateUi();

function updateUi()
{
    uni2.setUiAttribs({ "greyout": inGenType.get() != "vec2" && inGenType.get() != "vec3" && inGenType.get() != "vec4" });
    uni3.setUiAttribs({ "greyout": inGenType.get() != "vec3" && inGenType.get() != "vec4" });
    uni4.setUiAttribs({ "greyout": inGenType.get() != "vec4" });

    result.setUiAttribs({ "objType": "sg_" + inGenType.get() });

}

function shouldUseUniforms()
{
    const u = inType.get() == "Uniform" || (inType.get() == "Auto" && hasDynamicPorts);
    outUni.set(u);
    return u;
}

function updateUniDefs()
{
    let ports = [uni1, uni2, uni3, uni4];
    let varType = "f";
    if (inGenType.get() == "float")
    {
        ports.length = 1;
        varType = "f";
    }
    else if (inGenType.get() == "vec2")
    {
        ports.length = 2;
        varType = "2f";
    }
    else if (inGenType.get() == "vec3")
    {
        ports.length = 3;
        varType = "3f";
    }
    else if (inGenType.get() == "vec4")
    {
        ports.length = 4;
        varType = "4f";
    }

    const varname = (inName.get() || "input" + inGenType.get().charAt(0).toUpperCase() + inGenType.get().slice(1)) + "_" + CGL.ShaderGraph.getNewId();
    op.shaderVar = varname;
    op.shaderUniforms = [
        {
            "type": varType,
            "name": varname,
            "ports": ports,
            "static": !shouldUseUniforms()
        }];

    op.setUiAttrib({ "extendTitle": inGenType.get() + " " + inName.get() });

    sgOp.updateGraph();
}
