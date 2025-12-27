const
    exec = op.inTrigger("Trigger"),
    inCode = op.inStringEditor("Code", "", "wgsl"),

    next = op.outTrigger("Next"),
    result = op.outObject("Result");

let s = null;
const shaderStack = new CABLES.Stack();

exec.onTriggered = () =>
{
    s = {

        "compute": {
            "module": op.patch.frameStore.minigpu.device.createShaderModule({
                "code": inCode.get(),
            }),
            "constants": {},
        },

    };

    op.patch.frameStore.shader = shaderStack;
    op.patch.frameStore.shader.push(s);
    next.trigger();
    op.patch.frameStore.shader.pop();

    result.setRef(s);
};
