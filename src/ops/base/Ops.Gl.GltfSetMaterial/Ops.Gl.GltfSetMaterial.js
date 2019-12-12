const
    inShader=op.inObject("Shader"),
    inName=op.inString("Material Name","none"),
    outMat=op.outObject("Material");

inName.onChange=
inShader.onChange=function()
{
    outMat.set(null);
    outMat.set(inShader.get());
};