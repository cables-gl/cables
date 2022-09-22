const
    inName = op.inString("Name", "myColor"),
    uni1 = op.inFloat("R", 0),
    uni2 = op.inFloat("G", 0),
    uni3 = op.inFloat("B", 0),
    uni4 = op.inFloat("A", 1),
    inType = op.inSwitch("Type", ["Uniform", "Static"], "Uniform"),
    result = op.outObject("vec4", null, "sg_vec4");

uni1.setUiAttribs({ "colorPick": true });


const sgOp = new CGL.ShaderGraphOp(this);

inName.onChange =
inType.onChange = updateUniDefs;

updateUniDefs();

uni1.onChange =
    uni2.onChange =
    uni3.onChange =
    uni4.onChange = () =>
    {
        if (inType.get() == "Static")sgOp.updateGraph();
    };

function updateUniDefs()
{
    const varname = (inName.get() || "myColor") + "_" + CGL.ShaderGraph.getNewId();
    op.shaderVar = varname;
    op.shaderUniforms =
        [{
            "type": "4f",
            "name": varname,
            "ports": [uni1, uni2, uni3, uni4],
            "static": inType.get() == "Static"
        }];

    op.setUiAttrib({ "extendTitle": inName.get() });

    sgOp.updateGraph();
}
