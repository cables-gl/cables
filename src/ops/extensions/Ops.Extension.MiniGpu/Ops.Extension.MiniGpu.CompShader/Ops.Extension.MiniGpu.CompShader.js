const
    exec = op.inTrigger("Trigger"),
    inFrag = op.inStringEditor("Fragment Shader", "", "glsl"),
    inVert = op.inStringEditor("Vertex Shader", "", "glsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result"),
    outFrag = op.outString("Final Code Frag"),
    outVert = op.outString("Final Code Vert");

let s = null;
const shaderStack = new CABLES.Stack();
const binds = new CABLES.Stack();
// let bindHead = "";

inVert.onChange =
inFrag.onChange = () =>
{
    s = null;
};

function genBindHeadSrc(stage, code)
{
    let bhead = "";
    let count = 0;
    for (let i = 0; i < binds.array().length; i++)
    {
        const b = binds.array()[i];
        if (b.visibility == stage)
        {
            bhead += "@group(0) @binding(" + count + ") " + b.header + "\n";
            count++;
        }
    }
    console.log("bindings", count);

    // if (bhead != bindHead) reInit = true;
    // bindHead = bhead;

    code = code.replaceAll("{{BINDINGS}}", bhead);
    return code;
}

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    mgpu.bindings = binds.clear();

    mgpu.shader = shaderStack;
    mgpu.shader.push(s);
    next.trigger();

    if (!s)
    {
        let codeFrag = inFrag.get();
        let codeVert = inVert.get();

        codeFrag = genBindHeadSrc(GPUShaderStage.FRAGMENT, codeFrag);
        codeVert = genBindHeadSrc(GPUShaderStage.VERTEX, codeVert);
        outFrag.set(codeFrag);
        outVert.set(codeVert);

        s = {
            "vertex": {
                "module": mgpu.device.createShaderModule({
                    "code": codeVert,
                }),
                // "buffers": [
                //     {
                //         "arrayStride": 3 * 4,
                //         "stepMode": "vertex",
                //         "attributes": [
                //             {
                //                 "shaderLocation": 0,
                //                 "offset": 0,
                //                 "format": "float32x3",
                //             },
                //         ],
                //     },
                // ],
            },
            "fragment": {
                "module": mgpu.device.createShaderModule({
                    "code": codeFrag,
                }),
                "targets": [
                    {
                        "format": mgpu.format,
                    },
                ],
                "constants": {
                },
            },

        };
    }

    mgpu.shader.pop();

    result.setRef(s);
};
