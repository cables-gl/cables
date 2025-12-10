const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    inForce = op.inTriggerButton("force rebuild"),
    outPipe = op.outObject("Pipeline"),
    outShader = op.outObject("Shader Info"),
    outShaderSrc = op.outString("Shader Source", "", "glsl"),
    outShaderCompileCount = op.outNumber("compile count"),
    outId = op.outString("Shader id"),
    outDefines = op.outArray("defines");

let compileCount = -1;
let oldShader = null;

inForce.onTriggered = () =>
{
    if (oldShader)
    {
        console.log("text");
        oldShader.needsPipelineUpdate = "force rebuild";
        oldShader.compile();
    }
};

exec.onTriggered = () =>
{
    outPipe.setRef(op.patch.cg.currentPipeDebug);

    const shader = op.patch.cg.getShader();
    if (oldShader != shader)
    {
        oldShader = shader;
        compileCount = -1;
    }

    outShaderCompileCount.set(shader.compileCount);
    outId.set(shader.id);

    if (shader)
    {
        if (shader.compileCount != compileCount)
        {
            compileCount = shader.compileCount;
            outShaderSrc.set(shader.getProcessedSource());
            console.log(shader);
        }
        outDefines.set(shader.getDefines());
        outShader.setRef(shader.getInfo());
    }

    next.trigger();
};
