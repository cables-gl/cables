const
    uni1 = op.inFloat("Number X", 0),
    uni2 = op.inFloat("Number Y", 0),
    uni3 = op.inFloat("Number Z", 0),
    uni4 = op.inFloat("Number W", 0),
    inType = op.inSwitch("Type", ["Uniform", "Static"], "Uniform"),
    result = op.outObject("vec4", null, "sg_vec4");

const sgOp = new CGL.ShaderGraphOp(this);
const varname = "myVec4" + CGL.ShaderGraph.getNewId();

op.shaderVar = varname;

inType.onChange = updateUniforms;

updateUniforms();

function updateUniforms()
{
    op.shaderUniforms =
        [{
            "type": "4f",
            "name": varname,
            "ports": [uni1, uni2, uni3, uni4],
            "static": inType.get() == "Static"
        }];

    sgOp.sendOutPing();
}
