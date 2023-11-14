const
    inShader = op.inObject("Shader", null, "shader"),
    inName = op.inString("Material Name", "none"),
    outMat = op.outObject("Material");

inName.onChange =
inShader.onChange = function ()
{
    op.setUiAttrib({ "extendTitle": name });
    outMat.setRef(inShader.get() || op.patch.cgl.getDefaultShader());
};
