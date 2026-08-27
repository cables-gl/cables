const
    inExec = op.inTrigger("Render"),
    inModuleFragment = op.inObject("Fragment"),
    inModuleVertex = op.inObject("Vertex"),
    outNext = op.outTrigger("Next"),
    outCodeFrag = op.outString("Code Fragment", "", "glsl"),
    outCodeVertex = op.outString("Code Vertex", "", "glsl"),
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

function updateModules()
{
    if (inModuleFragment.isLinked()) inModuleFragment.links[0].getOtherPort(inModuleFragment).op.updateShaderModule(shader);
    if (inModuleVertex.isLinked()) inModuleVertex.links[0].getOtherPort(inModuleVertex).op.updateShaderModule(shader);
}

inExec.onTriggered = () =>
{

    updateModules();
    let moduleFrag = inModuleFragment.get();
    let moduleVertex = inModuleVertex.get();

    if (reInit)
    {
        let srcFrag = (inModuleFragment.get()?.src) || CGL.Shader.getDefaultFragmentShader();
        let srcVert = (inModuleVertex.get()?.src) || CGL.Shader.getDefaultVertexShader();

        shader.setSource(srcVert, srcFrag, false);
        updateModules();

        outCodeFrag.set(srcFrag);
        outCodeVertex.set(srcVert);
        outCodeFrag.setUiAttribs({ "editorDiagnostics": shader.diagnosticsFrag });
        outCodeVertex.setUiAttribs({ "editorDiagnostics": shader.diagnosticsVert });

        reInit = false;
    }

    if (shader.hasErrors())
    {
        op.setUiError("compile", "Shader has errors", 2, {});
    }
    else
    {
        op.setUiError("compile", null);

        if (shader.isValid())
        {
            cgl.pushShader(shader);
            // pushTextures();
            outNext.trigger();
            // shader.popTextures();
            cgl.popShader();

        }
    }

};
