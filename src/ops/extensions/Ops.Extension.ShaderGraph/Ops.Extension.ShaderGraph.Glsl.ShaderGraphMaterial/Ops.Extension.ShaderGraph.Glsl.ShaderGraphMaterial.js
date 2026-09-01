const
    inExec = op.inTrigger("Render"),
    inModuleVertex = op.inObject("Vertex"),
    inModuleFragment = op.inObject("Fragment"),
    outNext = op.outTrigger("Next"),
    outCodeVertex = op.outString("Code Vertex", "", "glsl"),
    outCodeFrag = op.outString("Code Fragment", "", "glsl"),
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

        shader.compile();
        outCodeFrag.setUiAttribs({ "editorDiagnostics": null });
        outCodeVertex.setUiAttribs({ "editorDiagnostics": null });

        outCodeFrag.set(shader.finalShaderFrag);
        outCodeVertex.set(shader.finalShaderVert);

        reInit = false;
    }

    if (shader.hasErrors())
    {

        outCodeFrag.setUiAttribs({ "editorDiagnostics": shader.diagnosticsFrag });
        outCodeVertex.setUiAttribs({ "editorDiagnostics": shader.diagnosticsVert });
        // console.log("shader.diagnosticsFrag", shader.diagnosticsFrag);
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
            shader.popTextures();
            cgl.popShader();

        }
    }

};
