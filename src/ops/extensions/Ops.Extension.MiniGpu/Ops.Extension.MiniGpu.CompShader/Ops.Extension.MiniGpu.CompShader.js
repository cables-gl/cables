const
    exec = op.inTrigger("Trigger"),
    inFrag = op.inStringEditor("Fragment Shader", "", "glsl"),
    inVert = op.inStringEditor("Vertex Shader", "", "glsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result");

let s = null;
const shaderStack = new CABLES.Stack();

exec.onTriggered = () =>
{
    if (!s)
    {
        s = {
            "vertex": {
                "module": op.patch.frameStore.mgpu.device.createShaderModule({
                    "code": inVert.get(),
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
                "module": op.patch.frameStore.mgpu.device.createShaderModule({
                    "code": inFrag.get(),
                }),
                "targets": [
                    {
                        "format": op.patch.frameStore.mgpu.format,
                    },
                ],
                "constants": {
                    "red": 0.5,
                    "green": 0,
                    "blue": 0,
                },
            },

        };
    }

    op.patch.frameStore.mgpu.shader = shaderStack;
    op.patch.frameStore.mgpu.shader.push(s);
    next.trigger();
    op.patch.frameStore.mgpu.shader.pop();

    result.setRef(s);
};
