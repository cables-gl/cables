const
    exec = op.inTriggerButton("Update"),
    outArr = op.outArray("Textures");

let arr = [];

exec.onTriggered = () =>
{
    arr.length = 0;

    const ops = op.patch.ops;
    for (let i = 0; i < ops.length; i++)
    {
        const op = ops[i];
        for (let j = 0; j < op.portsOut.length; j++)
        {
            const p = op.portsOut[j];

            if (op._objName.indexOf("PbrEnvironmentLight") > -1 && p.type == CABLES.OP_PORT_TYPE_OBJECT)
            {
                console.log("JA", p.name, p.get(), (p.get().tex || p.get().cubemap));
            }

            if (
                p &&
                p.type == CABLES.OP_PORT_TYPE_OBJECT &&
                p.get() &&
                (p.get().tex || p.get().cubemap) &&

                // (
                    p.get().name.indexOf("/assets/") > -1
                    // op._objName.indexOf("PbrEnvironmentLight")>-1
            // )
            )
            {
                if (arr.indexOf(p.get()) == -1)
                    arr.push(p.get());
            }
        }
    }

    outArr.setRef(arr);
};
