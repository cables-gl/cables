const
    inExec = op.inTrigger("Render"),
    inModuleFragment = op.inObject("Fragment"),
    inModuleVertex = op.inObject("Vertex"),
    outNext = op.outTrigger("Next"),
    outShader = op.outObject("Shader");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "customshader", op);
outShader.setRef(shader);

let reInit = true;

inModuleFragment.onChange =
    inModuleVertex.onChange = () =>
    {
        reInit = true;
    };

inExec.onTriggered = () =>
{
    let moduleFrag = inModuleFragment.get();
    let moduleVertex = inModuleVertex.get();

    if (reInit)
    {
        let srcFrag = (inModuleFragment.get()?.src) || CGL.Shader.getDefaultFragmentShader();
        let srcVert = (inModuleVertex.get()?.src) || CGL.Shader.getDefaultVertexShader();

        shader.setSource(srcVert, srcFrag, false);
        reInit = false;
    }

    if (inModuleFragment.isLinked()) inModuleFragment.links[0].getOtherPort(inModuleFragment).op.updateShaderModule(shader);
    if (inModuleVertex.isLinked()) inModuleVertex.links[0].getOtherPort(inModuleVertex).op.updateShaderModule(shader);

    cgl.pushShader(shader);
    // pushTextures();
    outNext.trigger();
    // shader.popTextures();
    cgl.popShader();

};
