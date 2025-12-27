const
    exec = op.inTrigger("Trigger"),
    inFrag = op.inStringEditor("Fragment Shader", "", "wgsl"),
    inVert = op.inStringEditor("Vertex Shader", "", "wgsl"),
    inf = op.inFloat("r", 0),

    next = op.outTrigger("Next"),
    result = op.outObject("Result");

let s = null;
const shaderStack = new CABLES.Stack();

inf.onChange = () =>
{
    if (s)
    {
        s.constants.red = inf.get();
    }
};

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
                "red": inf.get(),
                "green": 0.5,
                "blue": 1,
            },
        },

    };

    op.patch.frameStore.shader = shaderStack;
    op.patch.frameStore.shader.push(s);
    next.trigger();
    op.patch.frameStore.shader.pop();

    result.setRef(s);
};
