const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "glsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outCode = op.outString("Final Code");

let s = null;
const binds = new CABLES.Stack();
let bindHead = "";
let reInit = true;
let o = null;

inCode.onChange = () =>
{
    reInit = true;
};

function genBindHeadSrc()
{
    let bhead = "";
    for (let i = 0; i < binds.array().length; i++)
    {
        const b = binds.array()[i];
        bhead += "@group(0) @binding(" + i + ") " + b.header + "\n";
    }

    if (bhead != bindHead) reInit = true;
    bindHead = bhead;

    let code = inCode.get();
    code = code.replaceAll("{{BINDINGS}}", bhead);
    outCode.set(code);
    return code;
}

let oldBindings = [];

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    mgpu.shader.push(s);
    mgpu.bindings = binds.clear();
    next.trigger();
    mgpu.shader.pop();

    if (o && o.bindings != mgpu.bindings)reInit = true;

    if (reInit)
    {
        console.log("reinit bind");

        s = {
            "layout": "auto",
            "compute": {
                "module": mgpu.device.createShaderModule({
                    "code": genBindHeadSrc(),
                }),
                "constants": {},
            }
        };

        reInit = false;
        o = { "shader": s, "bindings": mgpu.bindings };
        result.setRef(o);
    }
};
