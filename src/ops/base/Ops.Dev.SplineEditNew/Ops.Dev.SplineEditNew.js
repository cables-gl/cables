const
    exec = op.inTrigger("Execute"),
    inEdit = op.inBool("Edit"),
    inStrs = op.inMultiPort2("Numbers", CABLES.OP_PORT_TYPE_NUMBER),
    outArr = op.outArray("Result", null, 3),
    outNum = op.outNumber("Num Values");

let numGizmos = -1;

inStrs.onChange = () =>
{
    const stringPorts = inStrs.get();
    let arr = [];

    const num = Math.floor(stringPorts.length / 3);
    for (let i = 0; i < num; i++)
    {
        arr[i * 3 + 0] = stringPorts[i * 3 + 0].get();
        arr[i * 3 + 1] = stringPorts[i * 3 + 1].get();
        arr[i * 3 + 2] = stringPorts[i * 3 + 2].get();
    }

    outArr.setRef(arr);
    outNum.set(num);
};

exec.onTriggered = () =>
{
    const stringPorts = inStrs.get();
    const num = Math.floor(stringPorts.length / 3);

    if (inEdit.get() && CABLES.UI && op.isCurrentUiOp())
    {
        numGizmos = num;
        // console.log("num", num);
        for (let i = 0; i < num; i++)
        {
            gui.setTransformGizmo(
                {
                    "posX": stringPorts[i * 3 + 0],
                    "posY": stringPorts[i * 3 + 1],
                    "posZ": stringPorts[i * 3 + 2],
                }, i);

            // arr[i] = stringPorts[i].get() || 0;
        }
    }
};
