const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    outPipe = op.outObject("Pipeline"),
    outShaderSrc = op.outString("Shader Source", "", "glsl"),
    outDefines = op.outArray("defines");

exec.onTriggered = () =>
{
    outPipe.setRef(op.patch.cg.currentPipeDebug);

    const shader = op.patch.cg.getShader();

    if (shader)
    {
        outShaderSrc.set(shader.getProcessedSource());
        outDefines.set(shader.getDefines());
    }

    next.trigger();
};
