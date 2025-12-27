const
    exec = op.inTrigger("Trigger"),
    inFrag = op.inStringEditor("Fragment Shader", "", "wgsl"),
    inVert = op.inStringEditor("Vertex Shader", "", "wgsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result");

let s = null;
const shaderStack = new CABLES.Stack();

exec.onTriggered = () =>
{
    s = {
        "vertex": {
            "module": op.patch.frameStore.minigpu.device.createShaderModule({
                "code": inVert.get(),
            }),
        },
        "fragment": {
            "module": op.patch.frameStore.minigpu.device.createShaderModule({
                "code": inFrag.get(),
            }),
            "targets": [
                {
                    "format": op.patch.frameStore.minigpu.presentationFormat,
                },
            ],
            "constants": {
                "red": 0.5,
                "green": 0,
                "blue": 0,
            },
        },

    };

    op.patch.frameStore.shader = shaderStack;
    op.patch.frameStore.shader.push(s);
    next.trigger();
    op.patch.frameStore.shader.pop();

    result.setRef(s);
};
