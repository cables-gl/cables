const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "wgsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outCode = op.outString("Final Code");

let s = null;
const binds = new CABLES.Stack();
let bindHead = "";
let reInit = true;

inCode.onChange = () =>
{
    reInit = true;
};

function bind()
{
    let bhead = "";
    for (let i = 0; i < binds.array().length; i++)
    {
        const b = binds.array()[i];
        bhead += "@group(0) @binding(" + i + ") " + b.header;
    }

    if (bhead != bindHead) reInit = true;
    bindHead = bhead;

}

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    if (reInit)
    {
        s = {
            "layout": "auto",
            "compute": {
                "module": op.patch.frameStore.mgpu.device.createShaderModule({
                    "code": inCode.get(),
                }),
                "constants": {},
            },
        };
        reInit = false;

    }

    mgpu.shader.push(s);
    mgpu.bindings = binds.clear();
    next.trigger();
    bind();
    mgpu.shader.pop();

    result.setRef(s);
};
