const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name"),
    inPosBuff = op.inObject("Buffer"),
    next = op.outTrigger("Next");

new CABLES.WebGpuOp(op);

let storage;
let shader;
let cgp;

inPosBuff.onChange=()=>
{
    if(!storage)console.log("no storage");
    else if(storage && !storage.cgpbuffer)console.log("no storage buff");
    else
    {
        console.log("yes.....");
        if(inPosBuff.get())
        {

        storage.cgpbuffer.setData(inPosBuff.get());
        storage.cgpbuffer.updateGpuBuffer(op.patch.cgp);

        }
    }
};

function init(_shader)
{
    shader = _shader;

    storage = new CGP.BindingStorage(op.patch.cgp, inName.get(), {
        "cgpBuffer": inPosBuff.get(),
        "stage": GPUShaderStage.COMPUTE,
        // "type": "vec4f"
    });
    shader.defaultBindGroup.addBinding(storage);
}

op.onDelete =
inName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inName.get() });

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

    storage?.cgpBuffer?.updateGpuBuffer(cgp);
    next.trigger();
};
