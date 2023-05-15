const
    inShader = op.inObject("Shader", null, "shader"),
    inName = op.inString("Material Name", "none"),
    outMat = op.outObject("Material");

inName.onChange =
inShader.onChange = function ()
{
    op.setTitle("Material " + inName.get());
    // outMat.set(null);

    outMat.setRef(inShader.get() || op.patch.cgl.getDefaultShader());
};
