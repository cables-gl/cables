const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name"),
    inF1 = op.inFloat("X", 1),
    inF2 = op.inFloat("Y", 1),
    inF3 = op.inFloat("Z", 1),
    inF4 = op.inFloat("W", 1),
    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

let uni;
let shader;
let cgp;

function init(_shader)
{
    shader = _shader;
    uni = shader.addUniform(new CGP.Uniform(shader, "4f", inName.get(), inF1, inF2, inF3, inF4), GPUShaderStage.COMPUTE);
}

op.onDelete =
inName.onChange = () =>
{
    if (shader && uni) shader.getDefaultUniBinding(GPUShaderStage.COMPUTE).removeUniformByName(uni.name);
    shader = uni = null;
};

exec.onTriggered = () =>
{
    cgp = op.patch.cgp;

    if (inName.get())
        if (!uni || shader != cgp.getShader())
        {
            if (shader && uni) shader.defaultBindGroup.removeBinding(uni);
            init(cgp.getShader());
            console.log("shader", shader);
        }
    next.trigger();
};
