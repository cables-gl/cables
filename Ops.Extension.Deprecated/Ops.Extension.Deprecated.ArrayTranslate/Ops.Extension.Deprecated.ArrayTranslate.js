const
    exe = op.inTrigger("exe"),
    arrayIn = op.inArray("array"),
    trigger = op.outTrigger("trigger"),
    idx = op.addOutPort(new CABLES.Port(op, "index"));

const cgl = op.patch.cgl;
let vec = vec3.create();
exe.onTriggered = render;

function render()
{
    if (!arrayIn.get()) return;
    let arr = arrayIn.get();

    for (let i = 0; i < arr.length; i += 3)
    {
        idx.set(i / 3);
        vec3.set(vec, arr[i], arr[i + 1], arr[i + 2]);
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
        trigger.trigger();
        cgl.popModelMatrix();
    }
}
