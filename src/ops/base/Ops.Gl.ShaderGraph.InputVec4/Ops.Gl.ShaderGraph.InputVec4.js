const
    inName = op.inString("Name", "myVec4"),
    uni1 = op.inFloat("Number X", 0),
    uni2 = op.inFloat("Number Y", 0),
    uni3 = op.inFloat("Number Z", 0),
    uni4 = op.inFloat("Number W", 1),
    inType = op.inSwitch("Type", ["Uniform", "Static"], "Uniform"),
    result = op.outObject("vec4", null, "sg_vec4");

const sgOp = new CGL.ShaderGraphOp(this);

inName.onChange =
inType.onChange = updateUniDefs;

updateUniDefs();

uni1.onChange =
    uni2.onChange =
    uni3.onChange =
    uni4.onChange = () =>
    {
        if (inType.get() == "Static")sgOp.sendOutPing();
    };

function updateUniDefs()
{
    const varname = (inName.get() || "myVec4") + "_" + CGL.ShaderGraph.getNewId();
    op.shaderVar = varname;
    op.shaderUniforms =
        [{
            "type": "4f",
            "name": varname,
            "ports": [uni1, uni2, uni3, uni4],
            "static": inType.get() == "Static"
        }];

    op.setUiAttrib({ "extendTitle": inName.get() });

    sgOp.sendOutPing();
}
