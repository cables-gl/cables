const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "wgsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outCode = op.outString("Final Code");

let s = null;
const binds = new CABLES.Stack();
let bindHead = "";
let reInit = false;
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

    }

    op.patch.frameStore.mgpu.shader.push(s);
    op.patch.frameStore.mgpu.bindings = binds.clear();
    next.trigger();
    bind();
    op.patch.frameStore.mgpu.shader.pop();

    result.setRef(s);
};
