
const
    inTex=op.inTexture("Texture"),
    inName = op.inString("Name", "myTexture"),
    result=op.outObject("vec4",null,"sg_sampler2D");

const sgOp = new CGL.ShaderGraphOp(this);
inName.onChange=
inTex.onChange=updateUniDefs;

updateUniDefs();

function updateUniDefs()
{
    const varname = (inName.get() || "myVec4") + "_" + CGL.ShaderGraph.getNewId();
    op.shaderVar=varname;
    op.shaderUniforms =
        [{
            "type": "t",
            "name": varname,
            "ports": [inTex]
        }];

    op.setUiAttrib({ "extendTitle": inName.get() });

    sgOp.sendOutPing();
}
