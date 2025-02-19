const
    inObjs = op.inMultiPort("Objects", CABLES.OP_PORT_TYPE_OBJECT),
    outArray = op.outArray("Array"),
    outNum = op.outNumber("Num Values");

inObjs.onChange = () =>
{
    rebuild();
};

function rebuild()
{
    const ports = inObjs.get();

    const elements = [];

    for (let i = 0; i < ports.length; i++)
    {
        const ele = ports[i].get();
        if (ele) elements.push(ele);
    }

    outArray.set(elements);
    outNum.set(elements.length);
}
