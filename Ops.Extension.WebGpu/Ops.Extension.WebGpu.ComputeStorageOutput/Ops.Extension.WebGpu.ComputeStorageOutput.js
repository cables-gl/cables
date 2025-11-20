const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name"),
    next = op.outTrigger("Next"),
    inLen = op.inInt("Length", 300),
    outBuff = op.outObject("Buffer"),
    outLen = op.outNumber("Buffer Length");

new CABLES.WebGpuOp(op);

let gpuBuff;
let binding;
let shader;
let cgp;

function init(_shader)
{
    shader = _shader;
    gpuBuff = new CABLES.CGP.GPUBuffer(cgp, op.objName, [], {
        "length": inLen.get(),
    });
    op.setUiAttrib({ "extendTitle": inName.get() });

    binding = new CGP.BindingStorage(cgp, inName.get(), {
        "stage": GPUShaderStage.COMPUTE,
        "shader": shader,
        "bindingType": "storage",
        "cgpBuffer": gpuBuff });

    shader.defaultBindGroup.addBinding(binding);
}

exec.onLinkChanged =
op.onDelete =
inLen.onChange =
inName.onChange = () =>
{
    if (shader && binding) shader.defaultBindGroup.removeBinding(binding);
    gpuBuff = shader = binding = null;
    outBuff.setRef(gpuBuff);
};

exec.onTriggered = () =>
{
    cgp = op.patch.cgp;

    if (inName.get())
        if (!binding || shader != cgp.getShader())
        {
            if (shader && binding) shader.defaultBindGroup.removeBinding(binding);
            init(cgp.getShader());
            console.log("shader", shader);
        }
    outBuff.setRef(gpuBuff);
    next.trigger();
};
