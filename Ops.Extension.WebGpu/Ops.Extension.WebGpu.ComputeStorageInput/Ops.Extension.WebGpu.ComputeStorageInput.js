const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name"),
    inPosBuff = op.inObject("Buffer"),

    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

let storage;
let shader;
let cgp;

function init(_shader)
{
    shader = _shader;

    storage = new CGP.BindingStorage(op.patch.cgp, inName.get(),
        {
            "cgpBuffer": inPosBuff.get(),
            "stage": GPUShaderStage.COMPUTE,
        });
    shader.defaultBindGroup.addBinding(storage);
}

op.onDelete =
inName.onChange = () =>
{
    if (shader && storage) shader.defaultBindGroup.removeBinding(storage);
    shader = storage = null;
};

exec.onTriggered = () =>
{
    cgp = op.patch.cgp;

    if (inName.get())
        if (!storage || shader != cgp.getShader())
        {
            if (shader && storage) shader.defaultBindGroup.removeBinding(storage);
            init(cgp.getShader());
            console.log("shader", shader);
        }
    next.trigger();
};
