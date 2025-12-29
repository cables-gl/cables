const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "glsl"),
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT", "COMPUTE"], "COMPUTE"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outCode = op.outString("Final Code");

const binds = new CABLES.Stack();

let s = null;
let bindHead = "";
let reInit = true;
let o = null;

inStage.onChange =
inCode.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inStage.get() });

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
        };

        s[inStage.get().toLowerCase()] = {
            "module": mgpu.device.createShaderModule({
                "code": genBindHeadSrc(),
            }),
            "targets": [// only frag??
                {
                    "format": mgpu.format,
                },
            ],

            "constants": {},
        };

        reInit = false;
        o = { "shader": s, "bindings": mgpu.bindings, "constants": [] };
        result.setRef(o);
    }
};
