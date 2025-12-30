const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "glsl"),
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT", "COMPUTE"], "COMPUTE"),
    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outCode = op.outString("Final Code");

/* minimalcore:start */
outCode.ignoreValueSerialize = true;

/* minimalcore:end */

const binds = new CABLES.Stack();
let oldBindings = [];
let s = null;
let bindHead = "";
let reInit = true;
let o = null;
let lastChange = 0;

inStage.onChange =
inCode.onChange = () =>
{

    /* minimalcore:start */
    op.setUiAttrib({ "extendTitle": inStage.get() });

    /* minimalcore:end */

    reInit = true;
};
inReset.onTriggered = () =>
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

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    mgpu.shader.push(s);
    mgpu.constants = {};
    mgpu.stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;

    mgpu.bindings = binds.clear();
    next.trigger();
    mgpu.shader.pop();

    if (o && o.bindings != mgpu.bindings)reInit = true;

    if (reInit)
    {
        s = { "layout": "auto", };

        s[inStage.get().toLowerCase()] = {
            "module": mgpu.device.createShaderModule({
                "code": genBindHeadSrc(),
            }),
            "targets": [// only frag??
                {
                    "format": mgpu.format,
                },
            ],

            "constants": mgpu.constants,
        };

        reInit = false;
        o = { "shader": s, "bindings": mgpu.bindings, "constants": [] };
        result.setRef(o);
    }
};
