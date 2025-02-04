const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    outPipe = op.outObject("Pipeline"),
    outShaderSrc = op.outString("Shader Suurce", "", "glsl");

exec.onTriggered = () =>
{
    outPipe.setRef(op.patch.cg.currentPipeDebug);

    const shader = op.patch.cg.getShader();

    if (shader) outShaderSrc.set(shader.getProcessedSource());

    next.trigger();
};
